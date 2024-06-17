import { VercelRequest, VercelResponse } from "@vercel/node";
import { WebClient } from "@slack/web-api";
import schedule from "node-schedule";

const token = process.env.SLACK_BOT_TOKEN as string;
const channelId = process.env.SLACK_CHANNEL_ID as string;
const client = new WebClient(token);

module.exports = async (req: VercelRequest, res: VercelResponse) => {
  try {
    // 매일 오전 12시 30분에 스레드를 생성
    schedule.scheduleJob("31 0 * * *", async () => {
      const response = await client.chat.postMessage({
        channel: channelId,
        text: "@here 이번 주 처리할 업무를 공유해주세요.\n\n ex)\n 000 작업 : 몇시간\n000 : 몇시간\n총 주에 몇시간을 이 업무에 투자할 예정",
      });
      const threadTs = response.ts;

      // 같은 날 오전 12시 40분에 댓글을 다는 작업
      schedule.scheduleJob("32 0 * * *", async () => {
        await client.chat.postMessage({
          channel: channelId,
          text: "@here 각자 업무를 확인하고 필요 시 싱크 잡아주세요! 화이팅!",
          thread_ts: threadTs,
        });
      });
    });

    res.status(200).send("Thread posted and reply scheduled.");
  } catch (error) {
    console.error("Error posting thread:", error);
    res.status(500).send("Failed to post thread.");
  }
};
