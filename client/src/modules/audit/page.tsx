import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CheckCircle2, Eye, RotateCcw, Search, ShieldAlert, XCircle } from "lucide-react";
import { PageHeader } from "@/shared/components/page-header";
import { Pagination } from "@/shared/components/pagination";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/shared/components/shared-states";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { formatDateTime } from "@/shared/lib/format";
import { listAudits } from "./api";
import { AuditDetailDialog } from "./detail-dialog";
import { OPERATION_LABELS, RESOURCE_LABELS } from "./labels";
import type { AuditLog, AuditOperation, AuditOutcome, AuditResource } from "./model";

export function AuditPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const operation = searchParams.get("operation") as AuditOperation | null;
  const resource = searchParams.get("resource") as AuditResource | null;
  const outcome = searchParams.get("outcome") as AuditOutcome | null;
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const search = searchParams.get("search") ?? "";

  const [selectedAudit, setSelectedAudit] = useState<AuditLog | null>(null);
  const [searchInput, setSearchInput] = useState(search);

  const audits = useQuery({
    queryKey: ["audits", { page, operation, resource, outcome, from, to, search }],
    queryFn: () =>
      listAudits({
        page,
        operation: operation ?? undefined,
        resource: resource ?? undefined,
        outcome: outcome ?? undefined,
        from: from || undefined,
        to: to || undefined,
        search: search || undefined,
        limit: 20,
      }),
  });

  const updateParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "ALL") next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.set("page", "1");
    setSearchParams(next);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    updateParam("search", searchInput.trim() || undefined);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const data = audits.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trilha de Auditoria"
        description="Histórico imutável de autenticações e operações que alteram dados no sistema"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="h-9 gap-1.5 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Limpar Filtros
          </Button>
        }
      />

      <div className="bg-card border-border space-y-3 rounded-lg border p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Operação</Label>
            <Select
              value={operation ?? "ALL"}
              onValueChange={(value) => updateParam("operation", value)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Todas as operações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas as operações</SelectItem>
                {Object.entries(OPERATION_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Recurso</Label>
            <Select
              value={resource ?? "ALL"}
              onValueChange={(value) => updateParam("resource", value)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Todos os recursos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os recursos</SelectItem>
                {Object.entries(RESOURCE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Resultado</Label>
            <Select
              value={outcome ?? "ALL"}
              onValueChange={(value) => updateParam("outcome", value)}
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Todos os resultados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os resultados</SelectItem>
                <SelectItem value="SUCCESS">Sucesso</SelectItem>
                <SelectItem value="FAILURE">Falha</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">De</Label>
              <Input
                type="date"
                value={from}
                onChange={(event) => updateParam("from", event.target.value)}
                className="h-9 px-2 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs">Até</Label>
              <Input
                type="date"
                value={to}
                onChange={(event) => updateParam("to", event.target.value)}
                className="h-9 px-2 text-xs"
              />
            </div>
          </div>
        </div>

        <form
          onSubmit={submitSearch}
          className="border-border/40 flex items-center gap-2 border-t pt-3"
        >
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              type="search"
              placeholder="Buscar por ator, e-mail, recurso ou ID..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="h-9 px-3 text-xs">
            Filtrar
          </Button>
        </form>
      </div>

      {audits.isLoading ? (
        <LoadingSkeleton rows={8} />
      ) : audits.isError ? (
        <ErrorState message="Erro ao consultar logs de auditoria." onRetry={audits.refetch} />
      ) : !data?.data.length ? (
        <EmptyState
          icon={<ShieldAlert className="text-muted-foreground h-6 w-6" />}
          title="Nenhum registro de auditoria encontrado"
          description="Nenhuma ação registrada corresponde aos filtros informados."
        />
      ) : (
        <div className="space-y-4">
          <div className="border-border bg-card hidden rounded-md border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Operação</TableHead>
                  <TableHead>Ator / Usuário</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Data e Hora</TableHead>
                  <TableHead className="text-right">Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((audit) => (
                  <TableRow key={audit.idAudit}>
                    <TableCell>
                      <OutcomeBadge outcome={audit.outcome} />
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {OPERATION_LABELS[audit.operation]}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="block font-medium">
                        {audit.actorName || "Sistema / Anônimo"}
                      </span>
                      {audit.actorEmail && (
                        <span className="text-muted-foreground text-xs">{audit.actorEmail}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{RESOURCE_LABELS[audit.resource]}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                      {formatDateTime(audit.occurredAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedAudit(audit)}
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver detalhes</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {data.data.map((audit) => (
              <Card key={audit.idAudit} className="shadow-none">
                <CardContent className="space-y-2.5 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold">{OPERATION_LABELS[audit.operation]}</h4>
                      <p className="text-muted-foreground text-xs">
                        {audit.actorName || "Anônimo"}
                      </p>
                    </div>
                    <OutcomeBadge outcome={audit.outcome} />
                  </div>
                  <div className="flex items-center justify-between border-t pt-2 text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDateTime(audit.occurredAt)}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setSelectedAudit(audit)}>
                      <Eye className="h-3 w-3" /> Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Pagination
            meta={data.meta}
            onChange={(nextPage) => updateParam("page", String(nextPage))}
          />
        </div>
      )}

      <AuditDetailDialog audit={selectedAudit} onClose={() => setSelectedAudit(null)} />
    </div>
  );
}

function OutcomeBadge({ outcome }: { outcome: AuditOutcome }) {
  return outcome === "SUCCESS" ? (
    <Badge variant="secondary" className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700">
      <CheckCircle2 className="h-3 w-3" /> Sucesso
    </Badge>
  ) : (
    <Badge variant="destructive" className="gap-1">
      <XCircle className="h-3 w-3" /> Falha
    </Badge>
  );
}

export default AuditPage;
