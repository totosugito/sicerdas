import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProfileHeader, TabNavigation, ProfileInfoForm, PersonalInfoForm, SecurityForm, PrivacyForm, 
    createProfileInfoFormData
} from '@/components/pages/user/profile'
import { useUserProfileQuery, useUpdateUserProfileMutation } from '@/service/user-api'

export const Route = createFileRoute('/_private/user/profile')({
    component: RouteComponent,
})

function RouteComponent() {
    const { t } = useTranslation();
    
    // Fetch user profile data
    const { data: userProfile, isLoading, isError } = useUserProfileQuery();
    
    // Define schemas for each tab inside the component to access the translation function
    const profileFormData = createProfileInfoFormData(t);
    
    const personalInfoSchema = z.object({
        firstName: z.string().min(1, t('user.profile.personalInfo.firstNameError')),
        lastName: z.string().min(1, t('user.profile.personalInfo.lastNameError')),
        phone: z.string().optional(),
        address: z.string().optional(),
    })

    const securitySchema = z.object({
        currentPassword: z.string().min(6, t('user.profile.security.passwordMinLengthError')),
        newPassword: z.string().min(6, t('user.profile.security.passwordMinLengthError')),
        confirmPassword: z.string().min(6, t('user.profile.security.passwordMinLengthError')),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: t('user.profile.security.passwordMismatchError'),
        path: ["confirmPassword"],
    })

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

    const personalInfoForm = useForm<z.infer<typeof personalInfoSchema>>({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            phone: '',
            address: '',
        },
    })

    // Populate forms with user data when it loads
    React.useEffect(() => {
        if (userProfile) {
            // Split full name into first and last name
            const nameParts = userProfile.name?.split(' ') || [];
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            profileForm.reset({
                name: userProfile.name || '',
                email: userProfile.email || '',
                bio: userProfile.bio || '',
            });
            
            personalInfoForm.reset({
                firstName,
                lastName,
                phone: userProfile.phone || '',
                address: userProfile.address || '',
            });
        }
    }, [userProfile, profileForm, personalInfoForm]);

    const securityForm = useForm<z.infer<typeof securitySchema>>({
        resolver: zodResolver(securitySchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    })

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
    
    function onProfileSubmit(values: z.infer<typeof profileFormData.schema>) {       
        updateUserProfileMutation.mutate({ body: values });
    }

    // Get error message from mutation
    const profileUpdateError = updateUserProfileMutation.error ? 
        (updateUserProfileMutation.error as any)?.response?.data?.message || 
        (updateUserProfileMutation.error as any)?.message || 
        t('user.profile.information.updateError') : 
        null;

    function onPersonalInfoSubmit(values: z.infer<typeof personalInfoSchema>) {
        console.log('Personal info values:', values)
        // Handle personal info update
    }

    function onSecuritySubmit(values: z.infer<typeof securitySchema>) {
        console.log('Security values:', values)
        // Handle security update
    }

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
                                onSubmit={onProfileSubmit} 
                                error={profileUpdateError}
                            />
                        </TabsContent>

                        {/* Personal Info Tab */}
                        <TabsContent value="personal" className="mt-0 w-full">
                            <PersonalInfoForm form={personalInfoForm} onSubmit={onPersonalInfoSubmit} />
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security" className="mt-0 w-full">
                            <SecurityForm form={securityForm} onSubmit={onSecuritySubmit} />
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