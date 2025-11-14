import { createFileRoute } from '@tanstack/react-router'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProfileHeader, TabNavigation, ProfileInfoForm, PersonalInfoForm, SecurityForm, PrivacyForm, 
    createProfileInfoFormData
} from '@/components/pages/user/profile'

export const Route = createFileRoute('/_private/user/profile')({
    component: RouteComponent,
})

function RouteComponent() {
    const { t } = useTranslation();
    
    // Define schemas for each tab inside the component to access the translation function
    const profileFormData = createProfileInfoFormData(t);
    const profileSchema = profileFormData.schema;
    
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
    const profileForm = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: profileFormData.defaultValue,
    })

    const personalInfoForm = useForm<z.infer<typeof personalInfoSchema>>({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: {
            firstName: 'Aria',
            lastName: 'Montgomery',
            phone: '+1 (555) 123-4567',
            address: '123 Design Street, Creative City, CA 90210',
        },
    })

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
    function onProfileSubmit(values: z.infer<typeof profileSchema>) {
        console.log('Profile values:', values)
        // Handle profile update
    }

    function onProfileSubmitClicked(values: z.infer<typeof profileSchema>) {
        console.log('Profile submit clicked:', values)
        // Handle any pre-submit logic here
    }

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
                                onSubmitClicked={onProfileSubmitClicked} 
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