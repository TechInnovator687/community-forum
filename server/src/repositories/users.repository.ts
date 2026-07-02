import { eq } from "drizzle-orm";
import { db } from "@server/db/client";
import { users, type User } from "@server/db/schema";

type Database = typeof db;

export function createUsersRepository(database: Database = db) {
  return {
    async findById(id: string): Promise<User | null> {
      const [user] = await database.select().from(users).where(eq(users.id, id)).limit(1);

      return user ?? null;
    },

    async findByEmail(email: string): Promise<User | null> {
      const [user] = await database.select().from(users).where(eq(users.email, email)).limit(1);

      return user ?? null;
    }
  };
}

export const usersRepository = createUsersRepository();

