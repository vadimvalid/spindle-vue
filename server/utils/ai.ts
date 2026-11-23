import { createGoogleGenerativeAI } from "@ai-sdk/google";

type GoogleProvider = ReturnType<typeof createGoogleGenerativeAI>;
export type GoogleModelId = Parameters<GoogleProvider>[0];

export const DEFAULT_MODEL: GoogleModelId = "gemini-3.5-flash-lite";

let provider: GoogleProvider | undefined;

/**
 * Single entry point for getting a model in all routes.
 * The provider is created once on first call; the API key comes from runtimeConfig.
 */
export function useModel(modelId: GoogleModelId = DEFAULT_MODEL) {
  if (!provider) {
    const apiKey = useRuntimeConfig().googleApiKey;
    if (!apiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: "Missing NUXT_GOOGLE_API_KEY",
      });
    }
    provider = createGoogleGenerativeAI({ apiKey });
  }
  return provider(modelId);
}
