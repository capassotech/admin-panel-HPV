import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  backTo?: string;
  backLabel?: string;
  className?: string;
}

const PageHeader = ({
  title,
  description,
  actions,
  backTo,
  backLabel = "Volver",
  className,
}: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0 space-y-1">
        {backTo && (
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="-ml-1 mb-1 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft size={14} /> {backLabel}
          </button>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2 sm:self-start">{actions}</div>}
    </div>
  );
};

export default PageHeader;
