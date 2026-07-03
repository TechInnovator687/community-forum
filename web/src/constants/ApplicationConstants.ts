import type { ApiAuth } from "@/lib/api";

export const APP_NAME = "Community Forum";
export const DEFAULT_QUERY_STALE_TIME_MS = 60_000;
export const DEFAULT_COURSE_ID = "20000000-0000-4000-8000-000000000001";

export type DemoUser = ApiAuth & { name: string };

// Stubbed identities for demonstrating the authorization flow only. There is
// no login: switching identities just swaps the x-user-id/x-role headers
// sent with each API request. These ids/names must match the seeded users in
// server/src/db/seeds/data.ts.
export const DEMO_USERS = {
  alice: {
    userId: "10000000-0000-4000-8000-000000000002",
    role: "student",
    name: "Alice Johnson"
  },
  bob: {
    userId: "10000000-0000-4000-8000-000000000003",
    role: "student",
    name: "Bob Chen"
  },
  moderator: {
    userId: "10000000-0000-4000-8000-000000000001",
    role: "moderator",
    name: "Morgan Lee"
  }
} as const satisfies Record<string, DemoUser>;

export const DEMO_USER_LIST: DemoUser[] = Object.values(DEMO_USERS);
export const DEFAULT_DEMO_USER = DEMO_USERS.alice;
