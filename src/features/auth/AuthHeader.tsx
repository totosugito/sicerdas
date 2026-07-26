
type Props = { icon: React.ReactNode; appName: string; title: string, description: string };
export const AuthHeader = ({ icon, appName, title, description }: Props) => {
    return (
        <div className="text-center space-y-0">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-0 shadow-lg">
                {icon}
            </div>
            <div className="text-lg font-bold tracking-tight text-foreground mb-2">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {appName}
                </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                <span className="">
                    {title}
                </span>
            </h1>
            <p className="text-muted-foreground">
                {description}
            </p>
        </div>
    );
}