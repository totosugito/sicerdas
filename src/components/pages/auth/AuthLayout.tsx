import { useTranslation } from "react-i18next";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.1),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.1),transparent_50%)]" />

            <div className="w-full max-w-md relative">
                {/* Card with glass morphism effect */}
                <div className="bg-card/80 backdrop-blur-xl rounded-xl shadow-xl border border-border/50 p-8 space-y-6 relative overflow-hidden">
                    {/* Subtle gradient overlay */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
                    {children}
                </div>
                <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} {t('app.copyright')}</p>
                </div>
            </div>
        </div>
    );
}