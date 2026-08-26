import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { formatDateTime } from "@/shared/lib/format";
import { OPERATION_LABELS, RESOURCE_LABELS } from "./labels";
import type { AuditLog } from "./model";

export function AuditDetailDialog({
  audit,
  onClose,
}: {
  audit: AuditLog | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={audit !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">Detalhes do Evento de Auditoria</DialogTitle>
          <DialogDescription>
            Registro imutável capturado durante a execução da requisição.
          </DialogDescription>
        </DialogHeader>

        {audit && (
          <div className="space-y-4 py-2 text-xs">
            <div className="bg-muted/30 border-border grid grid-cols-2 gap-3 rounded-lg border p-3">
              <div>
                <span className="text-muted-foreground block">Operação</span>
                <span className="text-foreground font-semibold">
                  {OPERATION_LABELS[audit.operation]}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Resultado / Status HTTP</span>
                <span className="text-foreground font-semibold">
                  {audit.outcome === "SUCCESS" ? "Sucesso" : "Falha"} ({audit.statusCode})
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">Recurso</span>
                <span className="text-foreground font-semibold">
                  {RESOURCE_LABELS[audit.resource]}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block">ID do Recurso</span>
                <span className="text-foreground font-mono break-all">
                  {audit.idResource || "N/A"}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground block">Ator Responsável</span>
                <span className="text-foreground font-semibold">
                  {audit.actorName || "Anônimo / Sistema"}
                  {audit.actorEmail ? ` (${audit.actorEmail})` : ""}
                </span>
              </div>
            </div>

            {audit.outcome === "FAILURE" && (
              <div className="bg-destructive/10 border-destructive/20 text-destructive space-y-1 rounded-lg border p-3">
                <span className="block font-semibold">Erro Registrado</span>
                <p className="font-mono text-[11px]">Código: {audit.errorCode || "N/A"}</p>
                <p>{audit.errorMessage || "Sem mensagem pública de erro."}</p>
              </div>
            )}

            <div className="bg-card border-border space-y-2 rounded-lg border p-3">
              <span className="text-muted-foreground block font-medium">Contexto de Rede</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-muted-foreground block">Endereço IP</span>
                  <span className="font-mono">{audit.ipAddress || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Data e Hora</span>
                  <span className="font-mono">{formatDateTime(audit.occurredAt)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground block">Request ID</span>
                  <span className="font-mono break-all">{audit.requestId || "N/A"}</span>
                </div>
                {audit.userAgent && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground block">User Agent</span>
                    <span className="text-muted-foreground break-all">{audit.userAgent}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground block font-medium">Metadados Seguros</span>
              <pre className="bg-muted/60 text-foreground border-border max-h-40 overflow-x-auto rounded-md border p-3 font-mono text-[11px]">
                {JSON.stringify(audit.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
