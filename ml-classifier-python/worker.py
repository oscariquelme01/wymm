from dotenv import load_dotenv
load_dotenv()

import asyncio
import signal
import os
import uuid
from bullmq import Worker, Job
from classifier import categorize_transactions


REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = int(os.environ.get("REDIS_PORT", 6379))
QUEUE_NAME = "categories_classification_queue"

BATCH_SIZE = int(os.environ.get("BATCH_SIZE", 20))
BATCH_TIMEOUT_S = float(os.environ.get("BATCH_TIMEOUT_S", 5))


async def collect_batch(worker, token):
    """
    Collect up to BATCH_SIZE jobs, waiting at most BATCH_TIMEOUT_S seconds
    for the batch to fill. Returns as soon as the batch is full or the
    timeout expires (whichever comes first), with at least 1 job.
    """
    batch = []

    # Block until at least one job arrives (no timeout on first fetch)
    first_job = await worker.getNextJob(token)
    if first_job is None:
        return batch
    batch.append(first_job)

    # Try to fill the rest of the batch within the timeout
    deadline = asyncio.get_event_loop().time() + BATCH_TIMEOUT_S
    while len(batch) < BATCH_SIZE:
        remaining = deadline - asyncio.get_event_loop().time()
        if remaining <= 0:
            break
        try:
            job = await asyncio.wait_for(
                worker.getNextJob(token),
                timeout=remaining
            )
            if job is None:
                break
            batch.append(job)
        except asyncio.TimeoutError:
            break

    return batch


async def process_batch(batch, token):
    """
    Takes a list of jobs, each with data: { id, description, amount, type }.
    Sends them all to the LLM as structured JSON in a single call, then marks
    each job as completed with its individual classification result.
    """
    # Build a map of transaction_id -> job for result matching
    jobs_by_tx_id = {}
    transactions = []
    for job in batch:
        data = job.data
        tx_id = data.get("id")
        jobs_by_tx_id[tx_id] = job
        transactions.append({
            "id": tx_id,
            "description": data.get("description"),
            "amount": data.get("amount"),
            "type": data.get("type"),
        })

    print(f"Classifying batch of {len(transactions)} transactions...")
    results = categorize_transactions(transactions)

    # Build a lookup of results by transaction id
    results_by_id = {r["id"]: r for r in results if "id" in r}

    # Match results back to jobs and complete them
    for tx_id, job in jobs_by_tx_id.items():
        try:
            result = results_by_id.get(tx_id, {"error": "No classification returned"})
            await job.moveToCompleted(result, token, False)
        except Exception as e:
            print(f"Failed to complete job {job.id}: {e}")
            try:
                await job.moveToFailed(e, token)
            except Exception:
                pass

    print(f"Batch of {len(transactions)} transactions classified successfully")


async def main():
    shutdown_event = asyncio.Event()

    def signal_handler(_sig, _frame):
        print("Shutdown signal received, stopping worker...")
        shutdown_event.set()

    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)

    redis_url = f"redis://{REDIS_HOST}:{REDIS_PORT}"
    token = str(uuid.uuid4())
    worker = Worker(QUEUE_NAME, None, {"connection": redis_url})

    print(f"Worker listening on queue '{QUEUE_NAME}' (redis: {redis_url})")
    print(f"Batching: up to {BATCH_SIZE} jobs, {BATCH_TIMEOUT_S}s timeout")

    while not shutdown_event.is_set():
        try:
            batch = await collect_batch(worker, token)
            if batch:
                await process_batch(batch, token)
        except Exception as e:
            print(f"Error processing batch: {e}")
            await asyncio.sleep(1)

    print("Closing worker...")
    await worker.close()
    print("Worker stopped.")


if __name__ == "__main__":
    asyncio.run(main())
