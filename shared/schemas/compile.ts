export type CompileResult =
  | { ok: true; js: string; css: string }
  | { ok: false; errors: string[] };
