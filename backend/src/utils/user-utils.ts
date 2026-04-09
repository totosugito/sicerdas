import env from "../config/env.config.ts";

export const getUserAvatarUrl = (
  userId: string,
  avatar: string | null | undefined,
): string | null => {
  if (!avatar) {
    return null;
  }

  return `${env.server.baseUrl}/${env.server.uploadsUserDir}/${userId}/${avatar}`;
};
