import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Edit2, Plus, Search, Trash2, UserCheck, UserX } from "lucide-react";
import { DeleteDialog } from "@/shared/components/delete-dialog";
import { PageHeader } from "@/shared/components/page-header";
import { Pagination } from "@/shared/components/pagination";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/shared/components/shared-states";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { errorMessage } from "@/shared/api/errors";
import { ProducerDialog } from "./dialog";
import type { Producer, ProducerInput, ProducerStatus } from "./model";
import { producersApi } from "./api";

export function ProducersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") ?? "";
  const statusParam = searchParams.get("status");
  const status: ProducerStatus | "ALL" =
    statusParam === "ACTIVE" || statusParam === "INACTIVE" ? statusParam : "ALL";

  const [searchInput, setSearchInput] = useState(search);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProducer, setEditingProducer] = useState<Producer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const producers = useQuery({
    queryKey: ["producers", { page, search, status }],
    queryFn: () =>
      producersApi.list({
        page,
        search: search || undefined,
        status: status === "ALL" ? undefined : status,
        limit: 20,
      }),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["producers"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const createMutation = useMutation({
    mutationFn: producersApi.create,
    onSuccess: () => {
      toast.success("Produtor cadastrado com sucesso!");
      invalidate();
      setDialogOpen(false);
    },
    onError: (error) => setFormError(errorMessage(error, "Erro ao salvar produtor.")),
  });

  const updateMutation = useMutation({
    mutationFn: (input: ProducerInput) => producersApi.update(editingProducer!.idProducer, input),
    onSuccess: () => {
      toast.success("Produtor atualizado com sucesso!");
      invalidate();
      setDialogOpen(false);
    },
    onError: (error) => setFormError(errorMessage(error, "Erro ao atualizar produtor.")),
  });

  const deleteMutation = useMutation({
    mutationFn: producersApi.remove,
    onSuccess: () => {
      toast.success("Produtor excluído com sucesso!");
      void queryClient.invalidateQueries({ queryKey: ["producers"] });
      void queryClient.invalidateQueries({ queryKey: ["farms"] });
      void queryClient.invalidateQueries({ queryKey: ["harvests"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Erro ao excluir produtor."));
      setDeleteId(null);
    },
  });

  const updateParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.set("page", "1");
    setSearchParams(next);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    updateParam("search", searchInput.trim() || undefined);
  };

  const openDialog = (producer: Producer | null) => {
    setEditingProducer(producer);
    setFormError(null);
    setDialogOpen(true);
  };

  const submitProducer = (input: ProducerInput) => {
    setFormError(null);
    if (editingProducer) updateMutation.mutate(input);
    else createMutation.mutate(input);
  };

  const data = producers.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtores Rurais"
        description="Gerenciamento de produtores, documentos e contatos"
        action={
          <Button onClick={() => openDialog(null)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Produtor
          </Button>
        }
      />

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <form onSubmit={submitSearch} className="flex w-full max-w-md flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              type="search"
              placeholder="Buscar por nome, documento ou e-mail..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="h-9 pl-9"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="h-9 px-3">
            Buscar
          </Button>
        </form>

        <Select
          value={status}
          onValueChange={(value) => updateParam("status", value === "ALL" ? undefined : value)}
        >
          <SelectTrigger className="h-9 w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os status</SelectItem>
            <SelectItem value="ACTIVE">Ativo</SelectItem>
            <SelectItem value="INACTIVE">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {producers.isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : producers.isError ? (
        <ErrorState message="Erro ao carregar lista de produtores." onRetry={producers.refetch} />
      ) : !data?.data.length ? (
        <EmptyState
          title="Nenhum produtor encontrado"
          description="Nenhum registro corresponde aos filtros selecionados."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDialog(null)}
              className="mt-2 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Cadastrar primeiro produtor
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="border-border bg-card hidden rounded-md border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Cidade/UF</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((producer) => (
                  <TableRow key={producer.idProducer}>
                    <TableCell className="font-medium">{producer.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {producer.documentType}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{producer.document}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {producer.email}
                    </TableCell>
                    <TableCell className="text-sm">
                      {producer.city}/{producer.state}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          producer.status === "ACTIVE"
                            ? "gap-1 border-emerald-200 bg-emerald-50 text-xs text-emerald-700"
                            : "gap-1 border-stone-200 bg-stone-100 text-xs text-stone-600"
                        }
                      >
                        {producer.status === "ACTIVE" ? (
                          <UserCheck className="h-3 w-3" />
                        ) : (
                          <UserX className="h-3 w-3" />
                        )}
                        {producer.status === "ACTIVE" ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(producer)}
                          className="h-8 w-8"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(producer.idProducer)}
                          className="text-destructive hover:text-destructive h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-3 md:hidden">
            {data.data.map((producer) => (
              <Card key={producer.idProducer} className="shadow-none">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold">{producer.name}</h4>
                      <p className="text-muted-foreground text-xs">{producer.email}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {producer.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t pt-2 text-xs">
                    <span className="font-mono">{producer.document}</span>
                    <span>
                      {producer.city}/{producer.state}
                    </span>
                  </div>
                  <div className="flex justify-end gap-2 border-t pt-2">
                    <Button variant="outline" size="sm" onClick={() => openDialog(producer)}>
                      <Edit2 className="h-3.5 w-3.5" /> Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(producer.idProducer)}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Excluir
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

      <ProducerDialog
        open={dialogOpen}
        producer={editingProducer}
        error={formError}
        pending={createMutation.isPending || updateMutation.isPending}
        onOpenChange={setDialogOpen}
        onSubmit={submitProducer}
      />

      <DeleteDialog
        open={deleteId !== null}
        title="Excluir produtor?"
        description="Esta ação removerá o produtor e todas as suas fazendas e safras associadas. Esta operação não pode ser desfeita."
        pending={deleteMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}

export default ProducersPage;
