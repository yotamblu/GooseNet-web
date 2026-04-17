/**
 * Tiny className combiner — filters falsy values and joins with spaces.
 * Lightweight alternative to `clsx` to avoid adding a dependency.
 */
export type ClassValue = unknown;

export function cn(...classes: ClassValue[]): string {
  let out = "";
  for (const c of classes) {
    if (typeof c === "string") {
      if (c) out += (out ? " " : "") + c;
    } else if (typeof c === "number") {
      out += (out ? " " : "") + String(c);
    }
  }
  return out;
}
