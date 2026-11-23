/** Removes a markdown ```vue ... ``` fence around the code if the model added one. */
export function stripCodeFences(code: string): string {
  return code
    .trim()
    .replace(/^```[\w-]*\r?\n?/, "")
    .replace(/\r?\n?```$/, "")
    .trim();
}
