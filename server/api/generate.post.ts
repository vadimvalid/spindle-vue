import { createTextStreamResponse, Output, streamText, toTextStream } from "ai";
import { z } from "zod";
import { ComponentSchema } from "#shared/schemas/component";

const GenerateRequestSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required").max(2000),
});

export default defineEventHandler(async (event) => {
  // Invalid body → 400 with error details, before calling the model
  const { prompt } = await readValidatedBody(event, GenerateRequestSchema.parse);

  const result = streamText({
    model: useModel(),
    // The model gets a shape-only schema; content checks run later, on our side
    output: Output.object({ schema: ComponentSchema }),
    system: GENERATE_COMPONENT_SYSTEM_PROMPT,
    prompt,
    onError: ({ error }) => console.error("[generate]", error),
  });

  return createTextStreamResponse({
    stream: toTextStream({ stream: result.stream }),
  });
});
