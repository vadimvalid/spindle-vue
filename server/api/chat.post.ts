import {
  streamText,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
} from "ai";
import type { UIMessage } from "ai";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";

export default defineLazyEventHandler(async () => {
  const apiKey = useRuntimeConfig().googleApiKey;
  if (!apiKey) throw new Error("Missing Google API key");
  const googleAI = createGoogleGenerativeAI({ apiKey });

  return defineEventHandler(async (event) => {
    const { messages } = await readBody<{ messages: UIMessage[] }>(event);

    const result = streamText({
      model: googleAI("gemini-3.5-flash-lite"),
      messages: await convertToModelMessages(messages),
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        onError: (error) => {
          console.error(error);
          return import.meta.dev && error instanceof Error
            ? error.message
            : "Something went wrong";
        },
      }),
    });
  });
});
