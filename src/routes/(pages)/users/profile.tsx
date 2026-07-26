import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useAppForm } from "@/components/ui/form-tanstack";
import { z } from "zod";
import {
  TabNavigation,
  ProfileInfoForm,
  PersonalInfoForm,
  SecurityForm,
  PrivacyForm,
  SessionList,
  createProfileInfoFormData,
  createPersonalInfoFormData,
  createSecurityFormData,
  createPrivacyFormData,
  ProfileInfoFormRef,
  ProfileLoadingView,
  ProfileErrorView,
} from "@/features/users/profile";
import {
  useUserProfileQuery,
  useUpdateProfileMutation,
  useChangeUserPasswordMutation,
  useUserSessionsQuery,
  useRevokeUserSessionMutation,
  type UserResponse,
  type UserProfileData,
  type UserDetailsData,
  type SessionData,
} from "@/api/users";
import type { BaseResponse } from "backend/src/types/index.ts";
import { showNotifError, showNotifSuccess } from "@/lib/show-notif";
import { string_to_date } from "@/lib/my-utils";
import { useAuth } from "@/hooks/use-auth";

import { authClient } from "@/lib/auth-client";
import { PageTitle } from "@/components/app";

// Add validation for query parameters
const profileSearchSchema = z.object({
  page: z.string().optional().catch("profile"),
});

export const Route = createFileRoute("/(pages)/users/profile")({
  component: RouteComponent,
  validateSearch: profileSearchSchema,
});

function RouteComponent() {
  const { t } = useAppTranslation();
  const { user: authUser, login: updateAuthUser } = useAuth();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  // Get the current tab from query parameters or default to 'profile'
  const currentTab = search.page || "profile";

  // Handle tab change by updating the URL
  const handleTabChange = (value: string) => {
    navigate({
      search: (prev: any) => ({ ...prev, page: value }),
      replace: true,
    });
  };

  const profileInfoFormRef = React.useRef<ProfileInfoFormRef>(null);

  // Fetch user profile data
  const { data: userProfile, isLoading, isError } = useUserProfileQuery();

  // Fetch user sessions data
  const {
    data: sessions,
    isLoading: sessionsLoading,
    isError: sessionsError,
    refetch: refetchSessions,
  } = useUserSessionsQuery();

  // Define schemas for each tab inside the component to access the translation function
  const profileFormData = createProfileInfoFormData(t);
  const personalInfoFormData = createPersonalInfoFormData(t);
  const securityFormData = createSecurityFormData(t);
  const privacyFormData = createPrivacyFormData(t);

  // Initialize forms for each tab with API data as default values
  const profileForm = useAppForm({
    defaultValues: {
      name: userProfile?.data?.name || "",
      email: userProfile?.data?.email || "",
      bio: userProfile?.data?.bio || "",
      image: userProfile?.data?.image || null,
    },
    validators: {
      onChange: profileFormData.schema as any,
    },
  });

  const personalInfoForm = useAppForm({
    defaultValues: {
      phone: userProfile?.data?.phone ?? "",
      address: userProfile?.data?.address ?? "",
      school: userProfile?.data?.school ?? "",
      grade: userProfile?.data?.grade ?? "",
      dateOfBirth: userProfile?.data?.dateOfBirth ? string_to_date(userProfile.data.dateOfBirth) : null,
      educationLevel: userProfile?.data?.educationLevel ?? "",
    },
    validators: {
      onChange: personalInfoFormData.schema as any,
    },
  });

  const securityForm = useAppForm({
    defaultValues: securityFormData.defaultValue,
    validators: {
      onChange: securityFormData.schema as any,
    },
  });

  const privacyForm = useAppForm({
    defaultValues: {
      profileVisibility:
        (userProfile?.data?.extra as any)?.privacy?.profileVisibility ??
        privacyFormData.defaultValue.profileVisibility,
      emailNotifications:
        (userProfile?.data?.extra as any)?.privacy?.emailNotifications ??
        privacyFormData.defaultValue.emailNotifications,
      twoFactorAuth:
        (userProfile?.data?.extra as any)?.privacy?.twoFactorAuth ?? privacyFormData.defaultValue.twoFactorAuth,
    },
    validators: {
      onChange: privacyFormData.schema as any,
    },
  });

  // Helper function to populate forms with user data
  const populateForms = (userData: UserProfileData | UserDetailsData) => {
    if (userData) {
      profileForm.setFieldValue("name", userData.name || "");
      profileForm.setFieldValue("email", userData.email || "");
      profileForm.setFieldValue("bio", userData.bio || "");
      profileForm.setFieldValue("image", userData.image || null);

      personalInfoForm.setFieldValue("phone", userData.phone ?? "");
      personalInfoForm.setFieldValue("address", userData.address ?? "");
      personalInfoForm.setFieldValue("school", userData.school ?? "");
      personalInfoForm.setFieldValue("grade", userData.grade ?? "");
      personalInfoForm.setFieldValue("dateOfBirth", userData.dateOfBirth ? string_to_date(userData.dateOfBirth) : null);
      personalInfoForm.setFieldValue("educationLevel", userData.educationLevel ?? "");

      // Populate privacy form with data from extra field
      privacyForm.setFieldValue(
        "profileVisibility",
        (userData.extra as any)?.privacy?.profileVisibility ??
        privacyFormData.defaultValue.profileVisibility,
      );
      privacyForm.setFieldValue(
        "emailNotifications",
        (userData.extra as any)?.privacy?.emailNotifications ??
        privacyFormData.defaultValue.emailNotifications,
      );
      privacyForm.setFieldValue(
        "twoFactorAuth",
        (userData.extra as any)?.privacy?.twoFactorAuth ?? privacyFormData.defaultValue.twoFactorAuth,
      );
    }
  };

  const hasLoadedRef = React.useRef(false);

  // Populate forms with user data when it loads
  React.useEffect(() => {
    if (userProfile?.data && !hasLoadedRef.current) {
      populateForms(userProfile.data);
      hasLoadedRef.current = true;
    }
  }, [userProfile?.data]);

  // Form submission handlers
  const updateUserProfileMutation = useUpdateProfileMutation();
  const changeUserPasswordMutation = useChangeUserPasswordMutation();
  const revokeUserSessionMutation = useRevokeUserSessionMutation();
  const [profileUpdateError, setProfileUpdateError] = React.useState<string | null>(null);
  const [personalInfoUpdateError, setPersonalInfoUpdateError] = React.useState<string | null>(null);
  const [securityUpdateError, setSecurityUpdateError] = React.useState<string | null>(null);
  const [privacyUpdateError, setPrivacyUpdateError] = React.useState<string | null>(null);

  // Unified submit handler for profile and personal info forms (they use the same API)
  const onProfileFormSubmit = (values: Record<string, any>, avatarFile?: File | null) => {
    // Reset relevant error states
    setProfileUpdateError(null);

    // Prepare data for submission
    const submissionData: Record<string, any> = {
      ...values,
    };

    // Add avatar file if provided (only for profile form)
    if (avatarFile) {
      submissionData.image = avatarFile;
    }

    // If no changes at all, return early showing success immediately
    if (Object.keys(submissionData).length === 0) {
      showNotifSuccess({ message: t(($) => $.user.profile.information.updateSuccess) });
      return;
    }

    updateUserProfileMutation.mutate(
      { body: submissionData },
      {
        onSuccess: (success: UserResponse<UserProfileData>) => {
          // Reset image state when submission is successful
          if (profileInfoFormRef.current) {
            profileInfoFormRef.current.resetImageState();
          }

          // Update auth context so navbar updates immediately
          if (authUser && success.data) {
            updateAuthUser({
              ...authUser,
              user: {
                ...authUser.user,
                ...success.data,
                // Ensure date fields are Dates if necessary, though the store might handle strings
                createdAt: new Date(success.data.createdAt),
                updatedAt: new Date(success.data.updatedAt),
              } as any,
            });
          }

          // Reset forms with updated data from success response
          populateForms(success.data);



          // Show success message
          const successMessage =
            success?.message || t(($) => $.user.profile.information.updateSuccess);
          showNotifSuccess({ message: successMessage });
        },
        onError: (error: Record<string, any>) => {
          const msg_ = error?.message || t(($) => $.user.profile.information.updateError);
          setProfileUpdateError(msg_);
        },
      },
    );
  };

  const onPersonalInfoSubmit = (values: Record<string, any>) => {
    setPersonalInfoUpdateError(null);

    // If no changes at all, return early showing success immediately
    if (Object.keys(values).length === 0) {
      showNotifSuccess({ message: t(($) => $.user.profile.personalInfo.updateSuccess) });
      return;
    }

    updateUserProfileMutation.mutate(
      { body: values },
      {
        onSuccess: (success: UserResponse<UserProfileData>) => {
          const successMessage =
            success?.message || t(($) => $.user.profile.personalInfo.updateSuccess);
          showNotifSuccess({ message: successMessage });

          // Update auth context so navbar updates immediately
          if (authUser && success.data) {
            updateAuthUser({
              ...authUser,
              user: {
                ...authUser.user,
                ...success.data,
                createdAt: new Date(success.data.createdAt),
                updatedAt: new Date(success.data.updatedAt),
              } as any,
            });
          }

          populateForms(success?.data);


        },
        onError: (error: Record<string, any>) => {
          const errorMessage = error?.message || t(($) => $.user.profile.personalInfo.updateError);
          setPersonalInfoUpdateError(errorMessage);
        },
      },
    );
  };

  // Security form submit handler (kept separate as it uses a different API)
  const onSecuritySubmit = (values: z.infer<typeof securityFormData.schema>) => {
    setSecurityUpdateError(null);
    changeUserPasswordMutation.mutate(
      { body: { currentPassword: values.currentPassword, newPassword: values.newPassword } },
      {
        onSuccess: (success: BaseResponse) => {
          const successMessage =
            success?.message || t(($) => $.user.profile.security.updateSuccess);
          showNotifSuccess({ message: successMessage });
          // Reset the form after successful submission
          securityForm.reset();
        },
        onError: (error: Record<string, any>) => {
          const errorMessage = error?.message || t(($) => $.user.profile.security.updateError);
          setSecurityUpdateError(errorMessage);
        },
      },
    );
  };

  function onPrivacySubmit(values: z.infer<typeof privacyFormData.schema>) {
    setPrivacyUpdateError(null);

    // If no changes at all, return early showing success immediately
    if (Object.keys(values).length === 0) {
      showNotifSuccess({ message: t(($) => $.user.profile.privacy.updateSuccess) });
      return;
    }

    const extra = {
      extra: JSON.stringify(values),
    };
    updateUserProfileMutation.mutate(
      { body: extra },
      {
        onSuccess: (success: UserResponse<UserProfileData>) => {
          const successMessage = success?.message || t(($) => $.user.profile.privacy.updateSuccess);
          showNotifSuccess({ message: successMessage });

          // Update auth context so navbar updates immediately
          if (authUser && success.data) {
            updateAuthUser({
              ...authUser,
              user: {
                ...authUser.user,
                ...success.data,
                createdAt: new Date(success.data.createdAt),
                updatedAt: new Date(success.data.updatedAt),
              } as any,
            });
          }

          populateForms(success?.data);
        },
        onError: (error: Record<string, any>) => {
          const errorMessage = error?.message || t(($) => $.user.profile.privacy.updateError);
          setPrivacyUpdateError(errorMessage);
        },
      },
    );
  }

  // Add this function to handle session revocation
  const handleRevokeSession = async (sessionToken: string) => {
    revokeUserSessionMutation.mutate(
      { body: { sessionToken: sessionToken } },
      {
        onSuccess: (success: BaseResponse) => {
          showNotifSuccess({
            message: success.message || t(($) => $.user.profile.sessions.sessionRevoked),
          });
          refetchSessions();
        },
        onError: (error: Record<string, any>) => {
          const errorMessage = error?.message || t(($) => $.user.profile.sessions.revokeError);
          showNotifError({ message: error?.message || errorMessage });
        },
      },
    );
  };

  const handleRevokeAllSessions = async () => {
    await authClient
      .revokeOtherSessions()
      .then(() => {
        showNotifSuccess({ message: t(($) => $.user.profile.sessions.allSessionsRevoked) });
        refetchSessions();
      })
      .catch((error: Record<string, any>) => {
        const errorMessage = error?.message || t(($) => $.user.profile.sessions.revokeError);
        showNotifError({ message: error?.message || errorMessage });
      });
  };

  if (isLoading) {
    return <ProfileLoadingView isLoading={true} />;
  }

  if (isError) {
    return <ProfileErrorView isError={true} />;
  }

  return (
    <div className="page-container">
      <div className="flex flex-col gap-6 w-full">
        <PageTitle
          title={t(($) => $.user.profile.title)}
          description={<span>{t(($) => $.user.profile.description)}</span>}
        />
        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <div className="grid md:grid-cols-[220px_minmax(0px,_1fr)] w-full gap-0 md:gap-6">
            {/* Navigation Tabs */}
            <div className="md:col-span-1 w-full">
              <TabNavigation />
            </div>

            {/* Tab Content - Set to same width */}
            <div className="w-full">
              {/* Profile Tab */}
              <TabsContent value="profile" className="mt-0 w-full">
                <ProfileInfoForm
                  ref={profileInfoFormRef}
                  defaultValues={{
                    name: userProfile?.data?.name || "",
                    email: userProfile?.data?.email || "",
                    bio: userProfile?.data?.bio || "",
                    image: userProfile?.data?.image || null,
                  }}
                  form={profileForm}
                  onSubmit={onProfileFormSubmit}
                  error={profileUpdateError}
                />
              </TabsContent>

              {/* Personal Info Tab */}
              <TabsContent value="personal" className="mt-0 w-full">
                <PersonalInfoForm
                  defaultValues={{
                    phone: userProfile?.data?.phone ?? "",
                    address: userProfile?.data?.address ?? "",
                    school: userProfile?.data?.school ?? "",
                    grade: userProfile?.data?.grade ?? "",
                    dateOfBirth: userProfile?.data?.dateOfBirth ?? null,
                    educationLevel: userProfile?.data?.educationLevel ?? "",
                  }}
                  form={personalInfoForm}
                  onSubmit={onPersonalInfoSubmit}
                  error={personalInfoUpdateError}
                />
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="mt-0 w-full">
                <div className="flex flex-col gap-6">
                  {userProfile?.data &&
                    (userProfile.data.providerId === "email" ||
                      userProfile.data.providerId === "credential") ? (
                    <SecurityForm
                      form={securityForm}
                      onSubmit={onSecuritySubmit}
                      error={securityUpdateError}
                    />
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-muted-foreground">
                        {t(($) => $.user.profile.security.notAvailable)}
                      </p>
                    </div>
                  )}

                  {/* show session list */}
                  <SessionList
                    sessions={sessions?.data as SessionData[]}
                    isLoading={sessionsLoading}
                    isError={sessionsError}
                    currentToken={authUser?.token || null}
                    refetch={refetchSessions}
                    onRevokeSession={handleRevokeSession}
                    onRevokeAllSessions={handleRevokeAllSessions}
                  />
                </div>
              </TabsContent>

              {/* Privacy Tab */}
              <TabsContent value="privacy" className="mt-0 w-full">
                <PrivacyForm
                  defaultValues={{
                    profileVisibility:
                      (userProfile?.data?.extra as any)?.privacy?.profileVisibility ??
                      privacyFormData.defaultValue.profileVisibility,
                    emailNotifications:
                      (userProfile?.data?.extra as any)?.privacy?.emailNotifications ??
                      privacyFormData.defaultValue.emailNotifications,
                    twoFactorAuth:
                      (userProfile?.data?.extra as any)?.privacy?.twoFactorAuth ?? privacyFormData.defaultValue.twoFactorAuth,
                  }}
                  form={privacyForm}
                  onSubmit={onPrivacySubmit}
                  error={privacyUpdateError}
                />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
