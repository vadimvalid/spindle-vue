import * as z from "zod";

export const PropSchema = z.object({
  name: z.string().describe("Prop name in camelCase"),
  type: z
    .string()
    .describe("TypeScript type of the prop, e.g. 'string', 'number', 'Item[]'"),
  required: z.boolean().describe("Whether the prop is required or optional"),
});

export const ComponentSchema = z.object({
  name: z.string().describe("Component name in PascalCase, e.g. 'ProductCard'"),
  description: z
    .string()
    .describe("One sentence describing what the component does"),
  code: z
    .string()
    .describe(
      'Complete Vue 3 Single File Component source. Must contain <script setup lang="ts">, ' +
        "<template> and <style scoped>. Raw code only, no markdown fences.",
    ),
  props: z
    .array(PropSchema)
    .describe("Props declared via defineProps in the component"),
});

export const ValidComponentSchema = ComponentSchema.extend({
  name: z.string().regex(/^[A-Z][A-Za-z0-9]*$/),
  code: z
    .string()
    .refine((s) => s.includes("<template>"), "Missing <template> block")
    .refine((s) => s.includes("<script setup"), "Missing <script setup> block"),
});

export type GeneratedComponent = z.infer<typeof ValidComponentSchema>;
