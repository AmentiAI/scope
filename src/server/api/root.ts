import { createTRPCRouter } from "@/server/api/trpc";
import { analyticsRouter } from "@/server/api/routers/analytics";
import { billingRouter } from "@/server/api/routers/billing";

export const appRouter = createTRPCRouter({
  analytics: analyticsRouter,
  billing: billingRouter,
});

export type AppRouter = typeof appRouter;
