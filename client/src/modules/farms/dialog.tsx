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
import type { Producer } from "@/modules/producers/model";
import { brazilianStates } from "@/shared/lib/brazilian-states";
import { FarmAreaValidator } from "./area-validator";
import { farmSchema } from "./model";
import type { Farm, FarmInput } from "./model";

function emptyFarm(idProducer: string): FarmInput {
  return {
    idProducer,
    name: "",
    city: "",
    state: "MT",
    totalArea: 0,
    agriculturalArea: 0,
    vegetationArea: 0,
  };
}

export function FarmDialog({
  open,
  farm,
  producers,
  defaultProducerId,
  error,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  farm: Farm | null;
  producers: Producer[];
  defaultProducerId?: string;
  error: string | null;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: FarmInput) => void;
}) {
  const form = useForm<FarmInput>({
    resolver: zodResolver(farmSchema),
    defaultValues: emptyFarm(defaultProducerId ?? ""),
  });
  const idProducer = useWatch({ control: form.control, name: "idProducer" });
  const state = useWatch({ control: form.control, name: "state" });
  const totalArea = useWatch({ control: form.control, name: "totalArea" });
  const agriculturalArea = useWatch({ control: form.control, name: "agriculturalArea" });
  const vegetationArea = useWatch({ control: form.control, name: "vegetationArea" });

  useEffect(() => {
    if (!open) return;
    form.reset(
      farm
        ? {
            idProducer: farm.idProducer,
            name: farm.name,
            city: farm.city,
            state: farm.state,
            totalArea: Number(farm.totalArea),
            agriculturalArea: Number(farm.agriculturalArea),
            vegetationArea: Number(farm.vegetationArea),
          }
        : emptyFarm(defaultProducerId ?? ""),
    );
  }, [defaultProducerId, farm, form, open, producers]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{farm ? "Editar Fazenda" : "Nova Fazenda"}</DialogTitle>
          <DialogDescription>
            {farm
              ? "Atualize as informações de área e localização da propriedade."
              : "Cadastre uma nova propriedade rural e defina seu aproveitamento do solo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {farm ? (
            <div className="space-y-1">
              <Label htmlFor="producerName">Produtor Responsável</Label>
              <Input
                id="producerName"
                value={farm.producerName ?? "Produtor não informado"}
                readOnly
                className="bg-muted"
              />
            </div>
          ) : (
            <div className="space-y-1">
              <Label htmlFor="idProducer">Produtor Responsável</Label>
              <Select
                value={idProducer}
                onValueChange={(value) =>
                  form.setValue("idProducer", value, { shouldValidate: true })
                }
              >
                <SelectTrigger id="idProducer">
                  <SelectValue placeholder="Selecione um produtor" />
                </SelectTrigger>
                <SelectContent>
                  {producers.map((producer) => (
                    <SelectItem key={producer.idProducer} value={producer.idProducer}>
                      {producer.name} ({producer.document})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.idProducer && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.idProducer.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="name">Nome da Fazenda</Label>
            <Input id="name" placeholder="Ex: Fazenda Boa Esperança" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" {...form.register("city")} />
              {form.formState.errors.city && (
                <p className="text-destructive text-xs">{form.formState.errors.city.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="state">UF</Label>
              <Select
                value={state}
                onValueChange={(value) => form.setValue("state", value, { shouldValidate: true })}
              >
                <SelectTrigger id="state">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {brazilianStates.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="totalArea">Área Total (ha)</Label>
              <Input
                id="totalArea"
                type="number"
                step="0.01"
                min="0"
                {...form.register("totalArea", { valueAsNumber: true })}
              />
              {form.formState.errors.totalArea && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.totalArea.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="agriculturalArea">Agricultável (ha)</Label>
              <Input
                id="agriculturalArea"
                type="number"
                step="0.01"
                min="0"
                {...form.register("agriculturalArea", { valueAsNumber: true })}
              />
              {form.formState.errors.agriculturalArea && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.agriculturalArea.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="vegetationArea">Vegetação (ha)</Label>
              <Input
                id="vegetationArea"
                type="number"
                step="0.01"
                min="0"
                {...form.register("vegetationArea", { valueAsNumber: true })}
              />
              {form.formState.errors.vegetationArea && (
                <p className="text-destructive text-xs">
                  {form.formState.errors.vegetationArea.message}
                </p>
              )}
            </div>
          </div>

          <FarmAreaValidator
            totalArea={totalArea}
            agriculturalArea={agriculturalArea}
            vegetationArea={vegetationArea}
          />

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
              {pending ? "Salvando..." : farm ? "Salvar Alterações" : "Cadastrar Fazenda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
