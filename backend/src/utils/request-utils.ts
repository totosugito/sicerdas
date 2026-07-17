/**
 * Helper to prevent logging massive payloads (e.g., file uploads or huge arrays)
 */
export const getSafeBody = (req: any) => {
  if (!req.body) return undefined;
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("multipart/form-data")) return "[MULTIPART REDACTED]";
  try {
    const stringified = JSON.stringify(req.body);
    return stringified.length > 1000 ? "[BODY TOO LARGE]" : req.body;
  } catch {
    return "[UNSERIALIZABLE BODY]";
  }
};
