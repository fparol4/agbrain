import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import type { Farm } from "@/modules/farms/model";
import { harvestSchema, normalizeCrops } from "./model";
import type { Harvest, HarvestFormInput, HarvestInput } from "./model";

function emptyHarvest(idFarm: string): HarvestFormInput {
  return { idFarm, year: new Date().getFullYear(), crops: "" };
}

export function HarvestDialog({
  open,
  harvest,
  farms,
  defaultFarmId,
  error,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  harvest: Harvest | null;
  farms: Farm[];
  defaultFarmId?: string;
  error: string | null;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: HarvestInput) => void;
}) {
  const form = useForm<HarvestFormInput>({
    resolver: zodResolver(harvestSchema),
    defaultValues: emptyHarvest(defaultFarmId ?? ""),
  });
  const idFarm = useWatch({ control: form.control, name: "idFarm" });

  useEffect(() => {
    if (!open) return;
    form.reset(
      harvest
        ? {
            idFarm: harvest.idFarm,
            year: harvest.year,
            crops: harvest.crops.map((crop) => crop.name).join(", "),
          }
        : emptyHarvest(defaultFarmId ?? farms[0]?.idFarm ?? ""),
    );
  }, [defaultFarmId, farms, form, harvest, open]);

  const submit = form.handleSubmit((input) =>
    onSubmit({ idFarm: input.idFarm, year: input.year, crops: normalizeCrops(input.crops) }),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{harvest ? "Editar Safra" : "Nova Safra"}</DialogTitle>
          <DialogDescription>
            {harvest
              ? "Atualize o ano e as culturas agrícolas desta safra."
              : "Cadastre uma nova safra e vincule as culturas plantadas."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1">
            <Label htmlFor="idFarm">Fazenda</Label>
            <Select
              value={idFarm}
              onValueChange={(value) => form.setValue("idFarm", value, { shouldValidate: true })}
            >
              <SelectTrigger id="idFarm">
                <SelectValue placeholder="Selecione a fazenda" />
              </SelectTrigger>
              <SelectContent>
                {farms.map((farm) => (
                  <SelectItem key={farm.idFarm} value={farm.idFarm}>
                    {farm.name} ({farm.city}/{farm.state})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.idFarm && (
              <p className="text-destructive text-xs">{form.formState.errors.idFarm.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="year">Ano da Safra (2000 a 2100)</Label>
            <Input
              id="year"
              type="number"
              min="2000"
              max="2100"
              {...form.register("year", { valueAsNumber: true })}
            />
            {form.formState.errors.year && (
              <p className="text-destructive text-xs">{form.formState.errors.year.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="crops">Culturas Plantadas</Label>
            <Textarea
              id="crops"
              placeholder="Ex: Soja, Milho, Algodão (separadas por vírgula ou linha)"
              rows={3}
              {...form.register("crops")}
            />
            <p className="text-muted-foreground text-[11px]">
              Informe as culturas separadas por vírgula ou nova linha (máx. 30).
            </p>
            {form.formState.errors.crops && (
              <p className="text-destructive text-xs">{form.formState.errors.crops.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : harvest ? "Salvar Alterações" : "Cadastrar Safra"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
