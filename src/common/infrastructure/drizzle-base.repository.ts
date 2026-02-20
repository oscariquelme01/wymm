import { db } from "./drizzle-db";
import { eq } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";
import { PgTable } from "drizzle-orm/pg-core";

type TableWithId = PgTable & { id: PgColumn };

export abstract class BaseRepository<T> {
  constructor(protected readonly table: TableWithId) {}

  async findById(id: number): Promise<T | undefined> {
    const result = await db.select().from(this.table).where(eq(this.table.id, id)).limit(1);
    return result[0] as T | undefined;
  }

  async findAll(): Promise<T[]> {
    return db.select().from(this.table) as Promise<T[]>;
  }

  async save(data: Omit<T, "id">): Promise<T> {
    const result = await db.insert(this.table).values(data as any).returning();
    return result[0] as T;
  }

  async update(id: number, data: Partial<Omit<T, "id">>): Promise<T | undefined> {
    const result = await db.update(this.table).set(data as any).where(eq(this.table.id, id)).returning();
    return result[0] as T | undefined;
  }

  async delete(id: number): Promise<boolean> {
    const result = await db.delete(this.table).where(eq(this.table.id, id)).returning();
    return result.length > 0;
  }
}
