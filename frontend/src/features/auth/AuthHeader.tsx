
type Props = {
  icon?: React.ReactNode;
  appName?: string;
  title: string;
  description?: string;
  badgeText?: string;
};

export const AuthHeader = ({ icon, appName, title, description, badgeText }: Props) => {
  return (
    <div className="text-center space-y-3 mb-6">
      {icon && (
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 text-white shadow-lg shadow-primary/25 mb-1 transition-transform hover:scale-105 duration-300">
          {icon}
        </div>
      )}

      {badgeText && (
        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            {badgeText}
          </span>
        </div>
      )}

      {appName && !icon && (
        <div className="text-xs font-bold uppercase tracking-wider text-primary">
          {appName}
        </div>
      )}

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};