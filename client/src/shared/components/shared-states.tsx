import React from "react";
import { AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-3 py-4">
      <Skeleton className="h-8 w-1/3" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Erro ao carregar dados.", onRetry }: ErrorStateProps) {
  return (
    <div className="bg-card border-destructive/20 my-4 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
      <div className="bg-destructive/10 mb-3 rounded-full p-3">
        <AlertCircle className="text-destructive h-6 w-6" />
      </div>
      <h3 className="text-foreground mb-1 text-base font-semibold">Falha na requisição</h3>
      <p className="text-muted-foreground mb-4 max-w-sm text-sm">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "Nenhum registro encontrado",
  description = "Não há dados para exibir com os filtros atuais.",
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="bg-card border-border my-4 flex flex-col items-center justify-center rounded-lg border p-8 text-center">
      <div className="bg-muted text-muted-foreground mb-3 rounded-full p-3">
        {icon || <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="text-foreground mb-1 text-base font-medium">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm text-sm">{description}</p>
      {action}
    </div>
  );
}
