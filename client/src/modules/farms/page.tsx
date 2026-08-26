import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Edit2, Plus, Search, Trash2 } from "lucide-react";
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
import { producersApi } from "@/modules/producers/api";
import { brazilianStates } from "@/shared/lib/brazilian-states";
import { errorMessage } from "@/shared/api/errors";
import { formatNumber } from "@/shared/lib/format";
import { FarmDialog } from "./dialog";
import type { Farm, FarmInput } from "./model";
import { farmsApi } from "./api";

export function FarmsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const idProducer = searchParams.get("idProducer") || undefined;
  const page = Number(searchParams.get("page")) || 1;
  const search = searchParams.get("search") ?? "";
  const state = searchParams.get("state") ?? "ALL";

  const [searchInput, setSearchInput] = useState(search);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const farms = useQuery({
    queryKey: ["farms", { idProducer, page, search, state }],
    queryFn: () =>
      farmsApi.list({
        idProducer,
        page,
        search: search || undefined,
        state: state === "ALL" ? undefined : state,
        limit: 20,
      }),
  });

  const producers = useQuery({
    queryKey: ["producers", "active-list"],
    queryFn: () => producersApi.list({ status: "ACTIVE", limit: 100 }),
    staleTime: 60_000,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["farms"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const createMutation = useMutation({
    mutationFn: farmsApi.create,
    onSuccess: () => {
      toast.success("Fazenda cadastrada com sucesso!");
      invalidate();
      setDialogOpen(false);
    },
    onError: (error) => setFormError(errorMessage(error, "Erro ao salvar fazenda.")),
  });

  const updateMutation = useMutation({
    mutationFn: (input: FarmInput) => farmsApi.update(editingFarm!.idFarm, input),
    onSuccess: () => {
      toast.success("Fazenda atualizada com sucesso!");
      invalidate();
      setDialogOpen(false);
    },
    onError: (error) => setFormError(errorMessage(error, "Erro ao atualizar fazenda.")),
  });

  const deleteMutation = useMutation({
    mutationFn: farmsApi.remove,
    onSuccess: () => {
      toast.success("Fazenda excluída com sucesso!");
      void queryClient.invalidateQueries({ queryKey: ["farms"] });
      void queryClient.invalidateQueries({ queryKey: ["harvests"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Erro ao excluir fazenda."));
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

  const openDialog = (farm: Farm | null) => {
    setEditingFarm(farm);
    setFormError(null);
    setDialogOpen(true);
  };

  const submitFarm = (input: FarmInput) => {
    setFormError(null);
    if (editingFarm) updateMutation.mutate(input);
    else createMutation.mutate(input);
  };

  const data = farms.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fazendas"
        description="Cadastro de propriedades rurais e gestão de uso do solo"
        action={
          <Button onClick={() => openDialog(null)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Fazenda
          </Button>
        }
      />

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <form onSubmit={submitSearch} className="flex w-full max-w-md flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
            <Input
              type="search"
              placeholder="Buscar fazenda, produtor ou cidade..."
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
          value={state}
          onValueChange={(value) => updateParam("state", value === "ALL" ? undefined : value)}
        >
          <SelectTrigger className="h-9 w-full sm:w-[160px]">
            <SelectValue placeholder="Estado (UF)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os estados</SelectItem>
            {brazilianStates.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {farms.isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : farms.isError ? (
        <ErrorState message="Erro ao carregar fazendas." onRetry={farms.refetch} />
      ) : !data?.data.length ? (
        <EmptyState
          title="Nenhuma fazenda encontrada"
          description="Nenhuma propriedade corresponde aos filtros selecionados."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDialog(null)}
              className="mt-2 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Cadastrar primeira fazenda
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="border-border bg-card hidden rounded-md border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome da Fazenda</TableHead>
                  <TableHead>Produtor</TableHead>
                  <TableHead>Cidade/UF</TableHead>
                  <TableHead className="text-right">Área Total</TableHead>
                  <TableHead className="text-right">Área Agricultável</TableHead>
                  <TableHead className="text-right">Vegetação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((farm) => (
                  <TableRow key={farm.idFarm}>
                    <TableCell className="font-medium">{farm.name}</TableCell>
                    <TableCell className="text-sm font-medium">
                      {farm.producerName ?? "Produtor não informado"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {farm.city}/{farm.state}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNumber(farm.totalArea)} ha
                    </TableCell>
                    <TableCell className="text-right font-medium text-emerald-700">
                      {formatNumber(farm.agriculturalArea)} ha
                    </TableCell>
                    <TableCell className="text-right font-medium text-sky-700">
                      {formatNumber(farm.vegetationArea)} ha
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(farm)}
                          className="h-8 w-8"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(farm.idFarm)}
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
            {data.data.map((farm) => (
              <Card key={farm.idFarm} className="shadow-none">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold">{farm.name}</h4>
                      <p className="text-muted-foreground text-xs">
                        {farm.producerName ?? "Produtor não informado"} · {farm.city}/{farm.state}
                      </p>
                    </div>
                    <Badge variant="secondary">{formatNumber(farm.totalArea)} ha</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t pt-2 text-xs">
                    <span className="text-emerald-700">
                      Agricultável: {formatNumber(farm.agriculturalArea)} ha
                    </span>
                    <span className="text-sky-700">
                      Vegetação: {formatNumber(farm.vegetationArea)} ha
                    </span>
                  </div>
                  <div className="flex justify-end gap-2 border-t pt-2">
                    <Button variant="outline" size="sm" onClick={() => openDialog(farm)}>
                      <Edit2 className="h-3.5 w-3.5" /> Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(farm.idFarm)}
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

      <FarmDialog
        open={dialogOpen}
        farm={editingFarm}
        producers={producers.data?.data ?? []}
        defaultProducerId={idProducer}
        error={formError}
        pending={createMutation.isPending || updateMutation.isPending}
        onOpenChange={setDialogOpen}
        onSubmit={submitFarm}
      />

      <DeleteDialog
        open={deleteId !== null}
        title="Excluir fazenda?"
        description="Esta ação removerá a fazenda e todas as safras vinculadas a ela. Esta operação não pode ser desfeita."
        pending={deleteMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}

export default FarmsPage;
