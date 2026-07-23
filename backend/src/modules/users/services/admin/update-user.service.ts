import { db } from "../../../../db/db-pool.ts";
import { users, profiles, accounts, EnumUserRole } from "../../../../db/schema/users/index.ts";
import { eq, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/response.ts";
import { getUserAvatarUrl, saveUserAvatar, deleteUserAvatar } from "../../../../utils/user/user-utils.ts";
import sharp from "sharp";
import { createUniqueFileName } from "../../../../utils/my-utils.ts";
import type { UserProfileData } from "../../user.schema.ts";

export interface UpdateUserParams {
  id: string;
  name?: string;
  email?: string;
  role?: typeof EnumUserRole[keyof typeof EnumUserRole];
  image?: string | null; // For removing/resetting avatar
  file?: {               // For uploading new avatar
    buffer: Buffer;
    filename: string;
    mimetype: string;
  };
  profile?: {
    school?: string | null;
    grade?: string | null;
    phone?: string | null;
    address?: string | null;
    bio?: string | null;
    educationLevel?: string | null;
    dateOfBirth?: Date | null;
    extra?: Record<string, any> | null;
  };
}

export interface UpdateUserResponse extends ServiceResponse {
  data?: UserProfileData;
}

export async function updateUserService(params: UpdateUserParams): Promise<UpdateUserResponse> {
  const { id, name, email, role, image, file, profile } = params;

  // Check if user exists
  const user = await db.query.users.findFirst({
    where: (fields) => eq(fields.id, id),
  });

  if (!user) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.user.userNotFound,
    };
  }

  // If email is being changed, check if new email is already taken
  if (email && email !== user.email) {
    const existingUser = await db.query.users.findFirst({
      where: (fields) => eq(fields.email, email),
    });

    if (existingUser) {
      return {
        success: false,
        statusCode: 409,
        errorKey: ($) => $.user.management.update.emailExists,
      };
    }
  }

  // Handle avatar upload if provided
  let newImagePath: string | null | undefined = image;
  if (file) {
    const { buffer, filename: originalName, mimetype } = file;

    // Validate file type
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimeTypes.includes(mimetype)) {
      return {
        success: false,
        statusCode: 400,
        errorKey: ($) => $.user.invalidFileType,
      };
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return {
        success: false,
        statusCode: 400,
        errorKey: ($) => $.user.fileSizeTooLarge,
      };
    }

    // Delete old avatar file if it exists
    if (user.image) {
      try {
        await deleteUserAvatar(user.image);
      } catch (_error) {
        // Continue even if deletion fails
      }
    }

    // Process image with Sharp
    const fileName = createUniqueFileName(originalName, "avatar", "jpg");
    const processedImage = await sharp(buffer)
      .resize(400)
      .jpeg({ quality: 90, force: false })
      .toBuffer();

    newImagePath = await saveUserAvatar(
      id,
      processedImage,
      fileName,
      "image/jpeg",
      user.createdAt,
    );
  } else if (image === null && user.image) {
    // Handle explicit remove avatar request
    try {
      await deleteUserAvatar(user.image);
    } catch (_error) {
      // Continue even if deletion fails
    }
  }

  await db.transaction(async (tx) => {
    // 1. Update users table if needed
    const userUpdates: Record<string, any> = {};
    if (name !== undefined) userUpdates.name = name;
    if (email !== undefined) userUpdates.email = email;
    if (role !== undefined) userUpdates.role = role;
    if (newImagePath !== undefined) userUpdates.image = newImagePath;

    if (Object.keys(userUpdates).length > 0) {
      userUpdates.updatedAt = new Date();
      await tx.update(users).set(userUpdates).where(eq(users.id, id));
    }

    // 2. Update user profile table if needed
    if (profile && Object.keys(profile).length > 0) {
      const profileUpdates: Record<string, any> = { ...profile };
      profileUpdates.updatedAt = new Date();

      await tx
        .insert(profiles)
        .values({ id, ...profileUpdates })
        .onConflictDoUpdate({
          target: profiles.id,
          set: profileUpdates.extra
            ? {
              ...profileUpdates,
              extra: sql`${profiles.extra} || ${JSON.stringify(profileUpdates.extra)}::jsonb`,
            }
            : profileUpdates,
        });
    }
  });

  // Fetch updated user with profile and accounts info
  const userWithAllData = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      image: users.image,
      emailVerified: users.emailVerified,
      school: profiles.school,
      educationLevel: profiles.educationLevel,
      grade: profiles.grade,
      phone: profiles.phone,
      address: profiles.address,
      bio: profiles.bio,
      dateOfBirth: profiles.dateOfBirth,
      providerId: accounts.providerId,
      extra: profiles.extra,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .leftJoin(profiles, eq(users.id, profiles.id))
    .leftJoin(accounts, eq(users.id, accounts.userId))
    .where(eq(users.id, id))
    .limit(1);

  const resultData = userWithAllData[0];
  if (!resultData) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($) => $.user.userNotFound,
    };
  }

  return {
    success: true,
    data: {
      id: resultData.id,
      email: resultData.email,
      name: resultData.name,
      image: getUserAvatarUrl(resultData.id, resultData.image),
      emailVerified: resultData.emailVerified,
      school: resultData.school,
      educationLevel: resultData.educationLevel,
      grade: resultData.grade,
      phone: resultData.phone,
      address: resultData.address,
      bio: resultData.bio,
      dateOfBirth: resultData.dateOfBirth ? resultData.dateOfBirth.toISOString().split("T")[0] : null,
      providerId: resultData.providerId || "credential",
      extra: (resultData.extra as Record<string, any>) || {},
      createdAt: resultData.createdAt.toISOString(),
      updatedAt: resultData.updatedAt.toISOString(),
    },
  };
}
