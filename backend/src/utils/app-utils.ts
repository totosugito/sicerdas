import env from '../config/env.config.ts';

export const getUserAvatarUrl = (avatar: string | null | undefined): string | null => {
  if (!avatar) {
    return null;
  }

  return `${env.server.uploadsUrl}/${env.server.uploadsUserDir}${avatar}`;
};