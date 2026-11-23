import {
  streamText,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
} from "ai";
import type { UIMessage } from "ai";

export default defineEventHandler(async (event) => {
  const { messages } = await readBody<{ messages: UIMessage[] }>(event);

  const result = streamText({
    model: useModel(),
    messages: await convertToModelMessages(messages),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: (error) => {
        console.error("[chat]", error);
        return import.meta.dev && error instanceof Error
          ? error.message
          : "Something went wrong";
      },
    }),
  });
});
