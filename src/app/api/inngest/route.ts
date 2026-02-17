import { serve } from "inngest/next";
import {
  inngest,
  syncTweets,
  syncMentions,
  takeDailySnapshot,
  triggerAccountSync,
} from "@/lib/inngest/jobs";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [syncTweets, syncMentions, takeDailySnapshot, triggerAccountSync],
});
