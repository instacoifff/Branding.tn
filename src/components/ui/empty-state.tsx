import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action, className, ...props }: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center p-10 text-center bg-card rounded-2xl border border-dashed border-border/60 shadow-sm",
                className
            )}
            {...props}
        >
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-5 text-muted-foreground">
                {icon || <FolderOpen strokeWidth={1.5} size={28} />}
            </div>
            <h3 className="text-lg font-semibold text-foreground tracking-tight mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
            {action && <div>{action}</div>}
        </div>
    );
}
