<script setup lang="ts">
import { useObject } from "@ai-sdk/vue";
import {
  ComponentSchema,
  ValidComponentSchema,
  type GeneratedComponent,
} from "#shared/schemas/component";
import type { CompileResult } from "#shared/types/compile";

const compiled = ref<CompileResult | null>(null);
const isCompiling = ref(false);

type Validation =
  | { ok: true; component: GeneratedComponent }
  | { ok: false; issues: string[] };

const prompt = ref("");
const validation = ref<Validation | null>(null);

async function compile(code: string) {
  isCompiling.value = true;
  try {
    compiled.value = await $fetch("/api/compile", {
      method: "POST",
      body: { code },
    });
  } catch (err) {
    compiled.value = {
      ok: false,
      errors: [err instanceof Error ? err.message : String(err)],
    };
  } finally {
    isCompiling.value = false;
  }
}

const { object, submit, isLoading, error, stop } = useObject({
  api: "/api/generate",
  schema: ComponentSchema,
  // Validate only the final object: mid-stream every field may still be incomplete
  onFinish: ({ object: result, error: streamError }) => {
    // A text stream has no error channel: if the model call fails on the server,
    // the client just gets an empty body, so `result` is undefined
    if (!result) {
      validation.value = {
        ok: false,
        issues: [
          "Model returned no output (provider error?). Check the server logs.",
        ],
      };
      return;
    }
    if (streamError) {
      validation.value = { ok: false, issues: [streamError.message] };
      return;
    }

    // Cheap deterministic fix first, then content checks
    const parsed = ValidComponentSchema.safeParse({
      ...result,
      code: stripCodeFences(result.code),
    });

    validation.value = parsed.success
      ? { ok: true, component: parsed.data }
      : {
          ok: false,
          issues: parsed.error.issues.map(
            (issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
          ),
        };

    if (parsed.success) {
      compile(parsed.data.code);
    }
  },
});

const canSend = computed(() => !isLoading.value && !!prompt.value.trim());

const handleSubmit = () => {
  if (!canSend.value) return;
  validation.value = null;
  compiled.value = null;
  submit({ prompt: prompt.value.trim() });
};
</script>

<template>
  <div>
    <form @submit.prevent="handleSubmit">
      <textarea
        v-model="prompt"
        placeholder="Describe a component, e.g. product card with image, title, price and buy button"
        rows="4"
      />
      <button type="submit" :disabled="!canSend">Generate</button>
      <button v-if="isLoading" type="button" @click="stop">Stop</button>
    </form>

    <div v-if="error" role="alert">
      <p>Something went wrong: {{ error.message }}</p>
    </div>

    <section v-if="object">
      <h2>{{ object.name ?? "…" }}</h2>
      <p v-if="object.description">{{ object.description }}</p>

      <template v-if="object.props?.length">
        <h3>Props</h3>
        <ul>
          <li v-for="(prop, i) in object.props" :key="prop?.name ?? i">
            <code>{{ prop?.name }}: {{ prop?.type ?? "…" }}</code>
            <span v-if="prop?.required"> (required)</span>
          </li>
        </ul>
      </template>

      <h3>Code</h3>
      <pre><code>{{ object.code }}</code></pre>
    </section>

    <section v-if="validation" aria-live="polite">
      <p v-if="validation.ok">✅ Component passed validation</p>
      <template v-else>
        <p>❌ Validation failed:</p>
        <ul>
          <li v-for="issue in validation.issues" :key="issue">{{ issue }}</li>
        </ul>
      </template>
    </section>
    <section v-if="isCompiling || compiled" aria-live="polite">
      <p v-if="isCompiling">Compiling…</p>

      <template v-else-if="compiled?.ok">
        <p>✅ Compiled</p>
        <h3>JS</h3>
        <pre><code>{{ compiled.js }}</code></pre>
        <h3>CSS</h3>
        <pre><code>{{ compiled.css }}</code></pre>
      </template>

      <template v-else-if="compiled">
        <p>❌ Compilation failed:</p>
        <ul>
          <li v-for="e in compiled.errors" :key="e">
            <pre>{{ e }}</pre>
          </li>
        </ul>
      </template>
    </section>
  </div>
</template>
