import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Calendar, Edit2, Plus, Sprout, Trash2 } from "lucide-react";
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
import { farmsApi } from "@/modules/farms/api";
import { errorMessage } from "@/shared/api/errors";
import { HarvestDialog } from "./dialog";
import type { Harvest, HarvestInput } from "./model";
import { harvestsApi } from "./api";

export function HarvestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const idProducer = searchParams.get("idProducer") || undefined;
  const idFarm = searchParams.get("idFarm") || "ALL";
  const yearParam = searchParams.get("year") ?? "";
  const year = yearParam ? Number(yearParam) : undefined;
  const page = Number(searchParams.get("page")) || 1;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState<Harvest | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const farms = useQuery({
    queryKey: ["farms", "options", { idProducer }],
    queryFn: () => farmsApi.list({ idProducer, limit: 100 }),
  });

  useEffect(() => {
    if (idFarm === "ALL" || !farms.data) return;
    if (farms.data.data.some((farm) => farm.idFarm === idFarm)) return;

    const next = new URLSearchParams(searchParams);
    next.delete("idFarm");
    next.set("page", "1");
    setSearchParams(next, { replace: true });
  }, [farms.data, idFarm, searchParams, setSearchParams]);

  const harvests = useQuery({
    queryKey: ["harvests", { idProducer, idFarm, year, page }],
    queryFn: () =>
      harvestsApi.list({
        idProducer,
        idFarm: idFarm === "ALL" ? undefined : idFarm,
        year,
        page,
        limit: 20,
      }),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["harvests"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const createMutation = useMutation({
    mutationFn: harvestsApi.create,
    onSuccess: () => {
      toast.success("Safra registrada com sucesso!");
      invalidate();
      setDialogOpen(false);
    },
    onError: (error) => setFormError(errorMessage(error, "Erro ao registrar safra.")),
  });

  const updateMutation = useMutation({
    mutationFn: (input: HarvestInput) => harvestsApi.update(editingHarvest!.idHarvest, input),
    onSuccess: () => {
      toast.success("Safra atualizada com sucesso!");
      invalidate();
      setDialogOpen(false);
    },
    onError: (error) => setFormError(errorMessage(error, "Erro ao atualizar safra.")),
  });

  const deleteMutation = useMutation({
    mutationFn: harvestsApi.remove,
    onSuccess: () => {
      toast.success("Safra excluída com sucesso!");
      invalidate();
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error(errorMessage(error, "Erro ao excluir safra."));
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

  const openDialog = (harvest: Harvest | null) => {
    setEditingHarvest(harvest);
    setFormError(null);
    setDialogOpen(true);
  };

  const submitHarvest = (input: HarvestInput) => {
    setFormError(null);
    if (editingHarvest) updateMutation.mutate(input);
    else createMutation.mutate(input);
  };

  const farmName = (harvest: Harvest) => {
    if (harvest.farmName) return harvest.farmName;
    const farm = farms.data?.data.find((item) => item.idFarm === harvest.idFarm);
    return farm ? `${farm.name} (${farm.city}/${farm.state})` : "Fazenda";
  };

  const data = harvests.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Safras e Culturas"
        description="Gestão de safras anuais e culturas agrícolas plantadas"
        action={
          <Button onClick={() => openDialog(null)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Safra
          </Button>
        }
      />

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <Select
          value={idFarm}
          onValueChange={(value) => updateParam("idFarm", value === "ALL" ? undefined : value)}
        >
          <SelectTrigger className="h-9 w-full sm:w-[240px]">
            <SelectValue placeholder="Filtrar por fazenda" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas as fazendas</SelectItem>
            {farms.data?.data.map((farm) => (
              <SelectItem key={farm.idFarm} value={farm.idFarm}>
                {farm.name} ({farm.city}/{farm.state})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="Ano safra"
          min="2000"
          max="2100"
          value={yearParam}
          onChange={(event) => updateParam("year", event.target.value.trim() || undefined)}
          className="h-9 w-full sm:w-[140px]"
        />
      </div>

      {harvests.isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : harvests.isError ? (
        <ErrorState message="Erro ao carregar safras." onRetry={harvests.refetch} />
      ) : !data?.data.length ? (
        <EmptyState
          title="Nenhuma safra encontrada"
          description="Nenhum registro corresponde aos filtros selecionados."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDialog(null)}
              className="mt-2 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Registrar primeira safra
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="border-border bg-card hidden rounded-md border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ano da Safra</TableHead>
                  <TableHead>Fazenda</TableHead>
                  <TableHead>Culturas Plantadas</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((harvest) => (
                  <TableRow key={harvest.idHarvest}>
                    <TableCell className="font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="text-muted-foreground h-4 w-4" />
                        Safra {harvest.year}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{farmName(harvest)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5 py-1">
                        {harvest.crops.map((crop) => (
                          <Badge
                            key={crop.idCrop}
                            variant="secondary"
                            className="gap-1 border border-emerald-200 bg-emerald-50 text-xs font-normal text-emerald-800"
                          >
                            <Sprout className="h-3 w-3" />
                            {crop.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDialog(harvest)}
                          className="h-8 w-8"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(harvest.idHarvest)}
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
            {data.data.map((harvest) => (
              <Card key={harvest.idHarvest} className="shadow-none">
                <CardContent className="space-y-3 p-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-bold">
                      <Calendar className="text-muted-foreground h-4 w-4" />
                      Safra {harvest.year}
                    </div>
                    <p className="text-muted-foreground text-xs">{farmName(harvest)}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 border-t pt-2">
                    {harvest.crops.map((crop) => (
                      <Badge
                        key={crop.idCrop}
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-800"
                      >
                        {crop.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 border-t pt-2">
                    <Button variant="outline" size="sm" onClick={() => openDialog(harvest)}>
                      <Edit2 className="h-3.5 w-3.5" /> Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(harvest.idHarvest)}
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

      <HarvestDialog
        open={dialogOpen}
        harvest={editingHarvest}
        farms={farms.data?.data ?? []}
        defaultFarmId={idFarm === "ALL" ? undefined : idFarm}
        error={formError}
        pending={createMutation.isPending || updateMutation.isPending}
        onOpenChange={setDialogOpen}
        onSubmit={submitHarvest}
      />

      <DeleteDialog
        open={deleteId !== null}
        title="Excluir safra?"
        description="Esta ação removerá permanentemente a safra e seus vínculos de culturas. Esta operação não pode ser desfeita."
        pending={deleteMutation.isPending}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  );
}

export default HarvestsPage;
