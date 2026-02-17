import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { syncTweets, syncMentions } from "@/lib/inngest/jobs";
import {
  syncTwitterAccount,
  checkAlerts,
  sendWeeklyReports,
  scheduledSync,
} from "@/lib/inngest/sync-jobs";

// Export all Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    syncTweets,
    syncMentions,
    syncTwitterAccount,
    checkAlerts,
    sendWeeklyReports,
    scheduledSync,
  ],
});
