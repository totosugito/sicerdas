import { randomUUID } from "node:crypto";

export const cleanTextFormat = (original: string) => {
  // Ensure extension is preserved
  return original
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "_") // Replace special chars with underscore
    .replace(/^_+|_+$/g, "") // Remove leading/trailing underscores
    .replace(/\.+/g, ".") // Replace multiple dots with single dot
    .replace(/(\.\w+)?$/, (_: string, ext: string | undefined) => ext || "");
};

export const createUniqueFileName = (original: string, defaultName: string, newExt?: string) => {
  const cleanName = cleanTextFormat(original);

  // Generate a unique filename with cleaned name
  const fileExt = cleanName.split(".").pop();
  const baseName = cleanName.replace(/\.[^/.]+$/, "") || defaultName;
  if (newExt) {
    return `${baseName}_${randomUUID().substring(0, 8)}.${newExt}`;
  }
  return `${baseName}_${randomUUID().substring(0, 8)}.${fileExt}`;
};

/**
 * Converts a string to a machine-readable key (slug).
 * Example: "Ujian Nasional" -> "ujian-nasional"
 */
export const stringToKey = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word characters (except spaces and hyphens)
    .replace(/[\s_-]+/g, "-") // Replace spaces, underscores, and multiple hyphens with a single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
};

/**
 * Fisher-Yates shuffle algorithm to scramble an array.
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
