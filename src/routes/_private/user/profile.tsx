import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProfileHeader, TabNavigation, ProfileInfoForm, PersonalInfoForm, SecurityForm, PrivacyForm, 
    createProfileInfoFormData, createPersonalInfoFormData, createSecurityFormData
} from '@/components/pages/user/profile'
import { useUserProfileQuery, useUpdateUserProfileMutation, useChangeUserPasswordMutation } from '@/service/user-api'
import { showNotifSuccess } from '@/lib/show-notif'
import { string_to_date } from '@/lib/my-utils'

export const Route = createFileRoute('/_private/user/profile')({
    component: RouteComponent,
})

function RouteComponent() {
    const { t } = useTranslation();
    
    // Fetch user profile data
    const { data: userProfile, isLoading, isError } = useUserProfileQuery();
    
    // Define schemas for each tab inside the component to access the translation function
    const profileFormData = createProfileInfoFormData(t);
    const personalInfoFormData = createPersonalInfoFormData(t);
    const securityFormData = createSecurityFormData(t);
    
    const privacySchema = z.object({
        profileVisibility: z.boolean(),
        emailNotifications: z.boolean(),
        twoFactorAuth: z.boolean(),
    })
    
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

    // Populate forms with user data when it loads
    React.useEffect(() => {
        if (userProfile) {
            profileForm.reset({
                name: userProfile.name || '',
                email: userProfile.email || '',
                bio: userProfile.bio || '',
            });
            
            personalInfoForm.reset({
                phone: userProfile.phone || '',
                address: userProfile.address || '',
                school: userProfile.school || '',
                grade: userProfile.grade || '',
                dateOfBirth: userProfile.dateOfBirth ? string_to_date(userProfile.dateOfBirth) : undefined,
            });
        }
    }, [userProfile, profileForm, personalInfoForm]);

    const privacyForm = useForm<z.infer<typeof privacySchema>>({
        resolver: zodResolver(privacySchema),
        defaultValues: {
            profileVisibility: true,
            emailNotifications: true,
            twoFactorAuth: false,
        },
    })

    // Form submission handlers
    const updateUserProfileMutation = useUpdateUserProfileMutation();
    const changeUserPasswordMutation = useChangeUserPasswordMutation();
    const [profileUpdateError, setProfileUpdateError] = React.useState<string | null>(null);
    const [personalInfoUpdateError, setPersonalInfoUpdateError] = React.useState<string | null>(null);
    const [securityUpdateError, setSecurityUpdateError] = React.useState<string | null>(null);
        
    // Unified submit handler for profile and personal info forms
    const onFormSubmit = (values: Record<string, any>, formType: 'profile' | 'personal') => {
        setProfileUpdateError(null);
        setPersonalInfoUpdateError(null);
        updateUserProfileMutation.mutate(
            { body: values },
            {
                onSuccess: (success: Record<string, any>) => {
                    const successMessage = success?.message || t('user.profile.information.updateSuccess');
                    showNotifSuccess({ message: successMessage });
                },
                onError: (error: Record<string, any>) => {
                    if(formType === 'profile') {
                        const msg_ = error?.response?.data?.message || t('user.profile.information.updateError');
                        setProfileUpdateError(msg_);
                    } else if (formType === 'personal') {
                        const msg_ = error?.response?.data?.message || t('user.profile.personalInfo.updateError');
                        setPersonalInfoUpdateError(msg_);
                    }
                }
            }
        );
    };

    // Security form submit handler
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

    function onPrivacySubmit(values: z.infer<typeof privacySchema>) {
        console.log('Privacy values:', values)
        // Handle privacy update
    }

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 w-full">
                <ProfileHeader />
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Loading profile...</div>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col gap-6 w-full">
                <ProfileHeader />
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-red-500">Error loading profile. Please try again later.</div>
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
                                form={profileForm} 
                                onSubmit={(body) => onFormSubmit(body, 'profile')} 
                                error={profileUpdateError}
                            />
                        </TabsContent>

                        {/* Personal Info Tab */}
                        <TabsContent value="personal" className="mt-0 w-full">
                            <PersonalInfoForm form={personalInfoForm} 
                            onSubmit={(body) => onFormSubmit(body, 'personal')} 
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