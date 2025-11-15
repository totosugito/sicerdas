import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProfileHeader, TabNavigation, ProfileInfoForm, PersonalInfoForm, SecurityForm, PrivacyForm, 
    createProfileInfoFormData, createPersonalInfoFormData, createSecurityFormData, createPrivacyFormData
} from '@/components/pages/user/profile'
import { ProfileInfoFormRef } from '@/components/pages/user/profile/components/ProfileInfoForm'
import { useUserProfileQuery, useUpdateUserProfileMutation, useChangeUserPasswordMutation } from '@/service/user-api'
import { showNotifSuccess } from '@/lib/show-notif'
import { string_to_date } from '@/lib/my-utils'

export const Route = createFileRoute('/_private/user/profile')({
    component: RouteComponent,
})

function RouteComponent() {
    const { t } = useTranslation();
    
    // Create ref for ProfileInfoForm
    const profileInfoFormRef = React.useRef<ProfileInfoFormRef>(null);
    
    // Fetch user profile data
    const { data: userProfile, isLoading, isError } = useUserProfileQuery();
    
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
                phone: userData.phone || '',
                address: userData.address || '',
                school: userData.school || '',
                grade: userData.grade || '',
                dateOfBirth: userData.dateOfBirth ? string_to_date(userData.dateOfBirth) : undefined,
            });
        }
    };
    
    // Populate forms with user data when it loads
    React.useEffect(() => {
        if (userProfile) {
            populateForms(userProfile);
        }
    }, [userProfile, profileForm, personalInfoForm]);

    const privacyForm = useForm<z.infer<typeof privacyFormData.schema>>({
        resolver: zodResolver(privacyFormData.schema),
        defaultValues: privacyFormData.defaultValue,
    })

    // Form submission handlers
    const updateUserProfileMutation = useUpdateUserProfileMutation();
    const changeUserPasswordMutation = useChangeUserPasswordMutation();
    const [profileUpdateError, setProfileUpdateError] = React.useState<string | null>(null);
    const [personalInfoUpdateError, setPersonalInfoUpdateError] = React.useState<string | null>(null);
    const [securityUpdateError, setSecurityUpdateError] = React.useState<string | null>(null);
        
    // Unified submit handler for profile and personal info forms (they use the same API)
    const onProfileFormSubmit = (values: Record<string, any>, formType: 'profile' | 'personal', avatarFile?: File | null) => {
        // Reset relevant error states
        setProfileUpdateError(null);
        setPersonalInfoUpdateError(null);
        
        // Prepare data for submission
        const submissionData: Record<string, any> = {
            ...values
        };
        
        // Add avatar file if provided (only for profile form)
        if (formType === 'profile' && avatarFile) {
            submissionData.image = avatarFile;
        }
        
        updateUserProfileMutation.mutate(
            { body: submissionData },
            {
                onSuccess: (success: Record<string, any>) => {
                    // Handle form-specific success logic
                    if (formType === 'profile') {
                        // Reset image state when submission is successful
                        if (profileInfoFormRef.current) {
                            profileInfoFormRef.current.resetImageState();
                        }
                    }
                    
                    // Reset forms with updated data from success response
                    if (success?.data) {
                        populateForms(success.data);
                    }
                    
                    // Show success message
                    const successMessage = success?.message || 
                        (formType === 'profile' 
                            ? t('user.profile.information.updateSuccess')
                            : t('user.profile.personalInfo.updateSuccess'));
                    showNotifSuccess({ message: successMessage });
                },
                onError: (error: Record<string, any>) => {
                    const msg_ = error?.response?.data?.message || 
                        (formType === 'profile'
                            ? t('user.profile.information.updateError')
                            : t('user.profile.personalInfo.updateError'));
                    
                    // Set form-specific error state
                    if (formType === 'profile') {
                        setProfileUpdateError(msg_);
                    } else {
                        setPersonalInfoUpdateError(msg_);
                    }
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
        console.log('Privacy values:', values)
        // Handle privacy update
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 w-full">
                <ProfileHeader />
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">{t("user.profile.loading")}</div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col gap-6 w-full">
                <ProfileHeader />
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-red-500">{t("user.profile.error")}</div>
                </div>
            </div>
        );
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
                                onSubmit={(values: Record<string, any>, avatarFile: File | null) => onProfileFormSubmit(values, 'profile', avatarFile)} 
                                error={profileUpdateError}
                            />
                        </TabsContent>

                        {/* Personal Info Tab */}
                        <TabsContent value="personal" className="mt-0 w-full">
                            <PersonalInfoForm form={personalInfoForm} 
                            onSubmit={(body) => onProfileFormSubmit(body, 'personal')} 
                            error={personalInfoUpdateError} />
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security" className="mt-0 w-full">
                            <SecurityForm 
                                form={securityForm} 
                                onSubmit={onSecuritySubmit} 
                                error={securityUpdateError} 
                            />
                        </TabsContent>

                        {/* Privacy Tab */}
                        <TabsContent value="privacy" className="mt-0 w-full">
                            <PrivacyForm form={privacyForm} onSubmit={onPrivacySubmit} />
                        </TabsContent>
                    </div>
                </div>
            </Tabs>
        </div>
    )
}