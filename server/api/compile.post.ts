import { z } from "zod";

const CompileRequestSchema = z.object({
  code: z.string().min(1, "Code is required").max(50_000),
});

export default defineEventHandler(async (event) => {
  const { code } = await readValidatedBody(event, CompileRequestSchema.parse);

  return compileSfc(stripCodeFences(code));
});
