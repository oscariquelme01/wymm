from dotenv import load_dotenv
load_dotenv()

import asyncio
import signal
import os
from bullmq import Worker
from classifier import categorize_transactions


REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
REDIS_PORT = int(os.environ.get("REDIS_PORT", 6379))
QUEUE_NAME = "categories_classification_queue"


async def process(job, job_token):
    """
    Expected job.data shape:
    {
        "transactions": [
            { "description": "...", "amount": 12.50, "type": "EXPENSE" },
            ...
        ]
    }
    """
    print(f"Processing job {job.id} with {len(job.data['transactions'])} transactions")

    transactions = job.data["transactions"]
    # TODO: change it to JSON or XML (LLMs work better with structured data)
    # TODO: include an ID in transactions to be able to retrieve them more easily
    tx_strings = [
        f"{tx['description']} | {'−' if tx.get('type') == 'EXPENSE' else '+'}€{tx['amount']}"
        if tx.get("amount") is not None else tx["description"]
        for tx in transactions
    ]

    result = categorize_transactions(tx_strings)
    print(f"Job {job.id} completed successfully")
    return result


async def main():
    shutdown_event = asyncio.Event()

    def signal_handler(_sig, _frame):
        print("Shutdown signal received, stopping worker...")
        shutdown_event.set()

    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)

    redis_url = f"redis://{REDIS_HOST}:{REDIS_PORT}"
    worker = Worker(QUEUE_NAME, process, {"connection": redis_url})

    print(f"Worker listening on queue '{QUEUE_NAME}' (redis: {redis_url})")

    await shutdown_event.wait()
    print("Closing worker...")
    await worker.close()
    print("Worker stopped.")


if __name__ == "__main__":
    asyncio.run(main())
