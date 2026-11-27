import { parse, compileScript, compileStyle } from "vue/compiler-sfc";
import { transform } from "esbuild";
import { createHash } from "node:crypto";
import type { CompileResult } from "#shared/types/compile";

export async function compileSfc(
  code: string,
  filename = "Component.vue",
): Promise<CompileResult> {
  const { descriptor, errors } = parse(code, { filename });
  if (errors.length > 0) {
    return { ok: false, errors: errors.map((e) => e.message) };
  }
  if (!descriptor.scriptSetup) {
    return { ok: false, errors: ["Missing <script setup>"] };
  }

  const id = createHash("sha256").update(code).digest("hex").slice(0, 8);
  const scopeId = `data-v-${id}`;
  const hasScoped = descriptor.styles.some((s) => s.scoped);

  let js: string;
  try {
    const script = compileScript(descriptor, {
      id,
      inlineTemplate: true,
      genDefaultAs: "__sfc__",
    });

    const result = await transform(script.content, {
      loader: "ts",
      format: "esm",
    });
    js = result.code;
  } catch (error) {
    return {
      ok: false,
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }

  if (hasScoped) {
    js += `\n__sfc__.__scopeId = ${JSON.stringify(scopeId)};`;
  }
  js += `\nexport default __sfc__;\n`;

  const cssParts: string[] = [];
  const styleErrors: string[] = [];

  for (const style of descriptor.styles) {
    const result = compileStyle({
      source: style.content,
      filename,
      id: scopeId,
      scoped: style.scoped,
    });

    if (result.errors.length) {
      styleErrors.push(...result.errors.map((e) => e.message));
    } else {
      cssParts.push(result.code);
    }
  }

  if (styleErrors.length) {
    return {
      ok: false,
      errors: styleErrors,
    };
  }

  return { ok: true, js, css: cssParts.join("\n") };
}
