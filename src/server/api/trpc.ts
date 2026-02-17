import { initTRPC, TRPCError } from "@trpc/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import SuperJSON from "superjson";
import { ZodError } from "zod";

// ─── Create context ───────────────────────────

export async function createTRPCContext(opts: { headers: Headers }) {
  const { userId } = auth();

  return {
    db,
    userId,
    headers: opts.headers,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

// ─── Initialize tRPC ─────────────────────────

const t = initTRPC.context<TRPCContext>().create({
  transformer: SuperJSON,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// ─── Exports ──────────────────────────────────

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// ─── Protected procedure ──────────────────────

const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Fetch user from Clerk
  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Ensure user exists in our DB
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, ctx.userId))
    .limit(1);

  if (!dbUser) {
    // Auto-create user on first access
    await db
      .insert(users)
      .values({
        id: ctx.userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null,
        avatarUrl: clerkUser.imageUrl,
      })
      .onConflictDoNothing();
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      user: clerkUser,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
