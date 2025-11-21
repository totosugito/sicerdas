import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    ProfileHeader, TabNavigation, ProfileInfoForm, PersonalInfoForm, SecurityForm, PrivacyForm, SessionList,
    createProfileInfoFormData, createPersonalInfoFormData, createSecurityFormData, createPrivacyFormData,
    ProfileInfoFormRef, ProfileLoadingView, ProfileErrorView
} from '@/components/pages/user/profile'
import { useUserProfileQuery, useUpdateUserProfileMutation, useChangeUserPasswordMutation, useUserSessionsQuery } from '@/service/user-api'
import { showNotifError, showNotifSuccess } from '@/lib/show-notif'
import { string_to_date } from '@/lib/my-utils'
import { useAuth } from '@/hooks/use-auth'
import type { UserSession } from '@/service/user-api'

import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_private/user/profile')({
    component: RouteComponent,
})

function RouteComponent() {
    const { t } = useTranslation();
    const { user: authUser } = useAuth();

    // Create ref for ProfileInfoForm
    const profileInfoFormRef = React.useRef<ProfileInfoFormRef>(null);

    // Fetch user profile data
    const { data: userProfile, isLoading, isError } = useUserProfileQuery();
    
    // Fetch user sessions data
    const { data: sessions, isLoading: sessionsLoading, isError: sessionsError, refetch: refetchSessions } = useUserSessionsQuery();
        
    // Define schemas for each tab inside the component to access the translation function
    const profileFormData = createProfileInfoFormData(t);
    const personalInfoFormData = createPersonalInfoFormData(t);
    const securityFormData = createSecurityFormData(t);
    const privacyFormData = createPrivacyFormData(t);

    // Initialize forms for each tab
    const profileForm = useForm<z.infer<typeof profileFormData.schema>>({
        resolver: zodResolver(profileFormData.schema),
        defaultValues: profileFormData.defaultValue,
    })

    const personalInfoForm = useForm<z.infer<typeof personalInfoFormData.schema>>({
        resolver: zodResolver(personalInfoFormData.schema),
        defaultValues: personalInfoFormData.defaultValue,
    })

    const securityForm = useForm<z.infer<typeof securityFormData.schema>>({
        resolver: zodResolver(securityFormData.schema),
        defaultValues: securityFormData.defaultValue,
    })

    const privacyForm = useForm<z.infer<typeof privacyFormData.schema>>({
        resolver: zodResolver(privacyFormData.schema),
        defaultValues: privacyFormData.defaultValue,
    })

    // Helper function to populate forms with user data
    const populateForms = (userData: any) => {
        if (userData) {
            profileForm.reset({
                name: userData.name || '',
                email: userData.email || '',
                bio: userData.bio || '',
                image: userData.image || null,
            });

            personalInfoForm.reset({
                phone: userData.phone ?? '',
                address: userData.address ?? '',
                school: userData.school ?? '',
                grade: userData.grade ?? '',
                dateOfBirth: userData.dateOfBirth ? string_to_date(userData.dateOfBirth) : undefined,
                educationLevel: userData.educationLevel ?? '',
            });

            // Populate privacy form with data from extra field
            privacyForm.reset({
                profileVisibility: userData.extra?.privacy?.profileVisibility ?? privacyFormData.defaultValue.profileVisibility,
                emailNotifications: userData.extra?.privacy?.emailNotifications ?? privacyFormData.defaultValue.emailNotifications,
                twoFactorAuth: userData.extra?.privacy?.twoFactorAuth ?? privacyFormData.defaultValue.twoFactorAuth,
            });
        }
    };

    // Populate forms with user data when it loads
    React.useEffect(() => {
        if (userProfile) {
            populateForms(userProfile);
        }
    }, [userProfile, profileForm, personalInfoForm, privacyForm]);

    // Form submission handlers
    const updateUserProfileMutation = useUpdateUserProfileMutation();
    const changeUserPasswordMutation = useChangeUserPasswordMutation();
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
            ...values
        };

        // Add avatar file if provided (only for profile form)
        if (avatarFile) {
            submissionData.image = avatarFile;
        }

        updateUserProfileMutation.mutate(
            { body: submissionData },
            {
                onSuccess: (success: Record<string, any>) => {
                    // Reset image state when submission is successful
                    if (profileInfoFormRef.current) {
                        profileInfoFormRef.current.resetImageState();
                    }

                    // Reset forms with updated data from success response
                    populateForms(success.data);

                    // Show success message
                    const successMessage = success?.message || t('user.profile.information.updateSuccess');
                    showNotifSuccess({ message: successMessage });
                },
                onError: (error: Record<string, any>) => {
                    const msg_ = error?.response?.data?.message || t('user.profile.information.updateError');
                    setProfileUpdateError(msg_);
                }
            }
        );
    };

    const onPersonalInfoSubmit = (values: Record<string, any>) => {
        setPersonalInfoUpdateError(null);
        updateUserProfileMutation.mutate(
            { body: values },
            {
                onSuccess: (success: Record<string, any>) => {
                    const successMessage = success?.message || t('user.profile.personalInfo.updateSuccess');
                    showNotifSuccess({ message: successMessage });
                    populateForms(success?.data);
                },
                onError: (error: Record<string, any>) => {
                    const errorMessage = error?.response?.data?.message || t('user.profile.personalInfo.updateError');
                    setPersonalInfoUpdateError(errorMessage);
                }
            }
        );
    };

    // Security form submit handler (kept separate as it uses a different API)
    const onSecuritySubmit = (values: z.infer<typeof securityFormData.schema>) => {
        setSecurityUpdateError(null);
        changeUserPasswordMutation.mutate(
            { body: { currentPassword: values.currentPassword, newPassword: values.newPassword } },
            {
                onSuccess: (success: Record<string, any>) => {
                    const successMessage = success?.message || t('user.profile.security.updateSuccess');
                    showNotifSuccess({ message: successMessage });
                    // Reset the form after successful submission
                    securityForm.reset(securityFormData.defaultValue);
                },
                onError: (error: Record<string, any>) => {
                    const errorMessage = error?.response?.data?.message || t('user.profile.security.updateError');
                    setSecurityUpdateError(errorMessage);
                }
            }
        );
    };

    function onPrivacySubmit(values: z.infer<typeof privacyFormData.schema>) {
        setPrivacyUpdateError(null);
        const extra = {
            extra: JSON.stringify(values)
        }
        updateUserProfileMutation.mutate(
            { body: extra },
            {
                onSuccess: (success: Record<string, any>) => {
                    const successMessage = success?.message || t('user.profile.privacy.updateSuccess');
                    showNotifSuccess({ message: successMessage });
                    populateForms(success?.data);
                },
                onError: (error: Record<string, any>) => {
                    const errorMessage = error?.response?.data?.message || t('user.profile.privacy.updateError');
                    setPrivacyUpdateError(errorMessage);
                }
            }
        );
    }

    // Add this function to handle session revocation
    const handleRevokeSession = async (sessionToken: string) => {
        await authClient.revokeSession({
            token: sessionToken
        }).then(() => {
            showNotifSuccess({ message: t('user.profile.sessions.sessionRevoked') });
            refetchSessions();
        }).catch((error: Record<string, any>) => {
            const errorMessage = error?.response?.data?.message || t('user.profile.sessions.revokeError');
            showNotifError({ message: error?.message || errorMessage });
        });
    };

    const handleRevokeAllSessions = async () => {
        await authClient.revokeOtherSessions().then(() => {
            showNotifSuccess({ message: t('user.profile.sessions.allSessionsRevoked') });
            refetchSessions();
        }).catch((error: Record<string, any>) => {
            const errorMessage = error?.response?.data?.message || t('user.profile.sessions.revokeError');
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
        <div className="flex flex-col gap-6 w-full">
            <ProfileHeader />

            <Tabs defaultValue="profile">
                <div className="grid md:grid-cols-[220px_minmax(0px,_1fr)] max-w-6xl gap-x-6 w-full ">
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
                                form={profileForm}
                                onSubmit={onProfileFormSubmit}
                                error={profileUpdateError}
                            />
                        </TabsContent>

                        {/* Personal Info Tab */}
                        <TabsContent value="personal" className="mt-0 w-full">
                            <PersonalInfoForm form={personalInfoForm}
                                onSubmit={onPersonalInfoSubmit}
                                error={personalInfoUpdateError} />
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security" className="mt-0 w-full">
                            <div className='flex flex-col gap-6'>
                                {userProfile && (userProfile.providerId === "email" || userProfile.providerId === "credential") ? (
                                    <SecurityForm
                                        form={securityForm}
                                        onSubmit={onSecuritySubmit}
                                        error={securityUpdateError}
                                    />
                                ) : (
                                    <div className="p-4 text-center">
                                        <p className="text-muted-foreground">
                                            {t("user.profile.security.notAvailable")}
                                        </p>
                                    </div>
                                )}
                                
                                {/* show session list */}
                                <SessionList 
                                    sessions={sessions as UserSession[]}
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
                            <PrivacyForm form={privacyForm} onSubmit={onPrivacySubmit} error={privacyUpdateError} />
                        </TabsContent>
                    </div>
                </div>
            </Tabs>
        </div>
    )
}