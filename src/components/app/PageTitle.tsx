import React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useRouter } from "@tanstack/react-router";

type PageTitleProps = {
  title?: React.ReactElement | string;
  description?: React.ReactElement;
  showSeparator?: boolean;
  className?: string;
  classNameTitle?: string;
  classNameDescription?: string;
  showBack?: boolean;
  backTo?: string;
  onBack?: () => void;
};

const PageTitle = ({
  title,
  description,
  showSeparator = false,
  className = "",
  classNameTitle = "",
  classNameDescription = "",
  showBack,
  backTo,
  onBack
}: PageTitleProps) => {
  const navigate = useNavigate();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (backTo) {
      navigate({ to: backTo });
    } else {
      router.history.back();
    }
  };

  return (
    <div>
      <div className={cn("flex flex-row gap-2 items-start justify-between", className)}>
        <div className="flex flex-row gap-4 items-start">
          {showBack && (
            <Button
              variant="outline"
              size="icon"
              className="mt-2"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          {(title || description) &&
            <div className={"flex flex-col"}>
              <div className={"flex flex-row flex-wrap gap-y-0 gap-x-4 items-center"}>
                {title && <div className={cn("flex items-start", "text-xl font-bold tracking-tight md:text-2xl", classNameTitle)}>{title}</div>}
              </div>
              {description && <div className={cn("text-muted-foreground", classNameDescription)}>{description}</div>}
            </div>}
        </div>
      </div>
      {showSeparator && <Separator className={"mt-2"} />}
    </div>
  )
}
export default PageTitle