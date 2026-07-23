import { db } from "../../../../db/db-pool.ts";
import { users, profiles, accounts } from "../../../../db/schema/users/index.ts";
import { eq, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../types/response.ts";
import { getUserAvatarUrl, saveUserAvatar, deleteUserAvatar } from "../../../../utils/user/user-utils.ts";
import sharp from "sharp";
import { createUniqueFileName } from "../../../../utils/my-utils.ts";
import type { UserProfileData } from "../../user.schema.ts";

export interface UpdateProfileParams {
  id: string;
  name?: string;
  file?: {
    buffer: Buffer;
    filename: string;
    mimetype: string;
  };
  school?: string | null;
  grade?: string | null;
  phone?: string | null;
  address?: string | null;
  bio?: string | null;
  educationLevel?: string | null;
  dateOfBirth?: string | Date | null;
  extra?: Record<string, any> | string | null;
}

export interface UpdateProfileResponse extends ServiceResponse {
  data?: UserProfileData;
}

export async function updateProfileService(params: UpdateProfileParams): Promise<UpdateProfileResponse> {
  const { id, name, file } = params;

  // Extract profile fields
  const { school, grade, phone, address, bio, educationLevel } = params;

  // Parse dateOfBirth
  let dateOfBirth: Date | null | undefined = undefined;
  if (params.dateOfBirth instanceof Date || params.dateOfBirth === null) {
    dateOfBirth = params.dateOfBirth;
  } else if (typeof params.dateOfBirth === "string") {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(params.dateOfBirth)) {
      dateOfBirth = new Date(params.dateOfBirth);
    } else {
      dateOfBirth = null;
    }
  }

  // Parse extra
  let extra: Record<string, any> | null | undefined = undefined;
  if (typeof params.extra === "object" || params.extra === null) {
    extra = params.extra;
  } else if (typeof params.extra === "string") {
    try {
      extra = JSON.parse(params.extra);
    } catch (e) {
      console.warn("Failed to parse extra field:", e);
    }
  }

  const hasUserUpdates = name !== undefined || file !== undefined;
  const hasProfileUpdates = school !== undefined || grade !== undefined || phone !== undefined || address !== undefined || bio !== undefined || educationLevel !== undefined || dateOfBirth !== undefined || extra !== undefined;

  if (!hasUserUpdates && !hasProfileUpdates) {
    return {
      success: false,
      statusCode: 400,
      errorKey: ($) => $.user.noValidUpdateData,
    };
  }

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

  // Handle avatar upload if provided
  let newImagePath: string | null | undefined = undefined;
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
  }

  await db.transaction(async (tx) => {
    // 1. Update users table if needed
    const userUpdates: Record<string, any> = {};
    if (name !== undefined) userUpdates.name = name;
    if (newImagePath !== undefined) userUpdates.image = newImagePath;

    if (Object.keys(userUpdates).length > 0) {
      userUpdates.updatedAt = new Date();
      await tx.update(users).set(userUpdates).where(eq(users.id, id));
    }

    // 2. Update user profile table if needed
    if (hasProfileUpdates) {
      const profileUpdates: Record<string, any> = {};
      if (school !== undefined) profileUpdates.school = school;
      if (grade !== undefined) profileUpdates.grade = grade;
      if (phone !== undefined) profileUpdates.phone = phone;
      if (address !== undefined) profileUpdates.address = address;
      if (bio !== undefined) profileUpdates.bio = bio;
      if (educationLevel !== undefined) profileUpdates.educationLevel = educationLevel;
      if (dateOfBirth !== undefined) profileUpdates.dateOfBirth = dateOfBirth;
      if (extra !== undefined) profileUpdates.extra = extra;

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
