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
import { brazilianStates } from "@/shared/lib/brazilian-states";
import { producerSchema } from "./model";
import type { Producer, ProducerInput } from "./model";

const emptyProducer: ProducerInput = {
  name: "",
  documentType: "CPF",
  document: "",
  email: "",
  city: "",
  state: "MT",
  status: "ACTIVE",
};

export function ProducerDialog({
  open,
  producer,
  error,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  producer: Producer | null;
  error: string | null;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: ProducerInput) => void;
}) {
  const form = useForm<ProducerInput>({
    resolver: zodResolver(producerSchema),
    defaultValues: emptyProducer,
  });
  const documentType = useWatch({ control: form.control, name: "documentType" });
  const state = useWatch({ control: form.control, name: "state" });
  const status = useWatch({ control: form.control, name: "status" });

  useEffect(() => {
    if (!open) return;
    form.reset(
      producer
        ? {
            name: producer.name,
            documentType: producer.documentType,
            document: producer.document,
            email: producer.email,
            city: producer.city,
            state: producer.state,
            status: producer.status,
          }
        : emptyProducer,
    );
  }, [form, open, producer]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{producer ? "Editar Produtor" : "Novo Produtor"}</DialogTitle>
          <DialogDescription>
            {producer
              ? "Atualize as informações cadastrais do produtor rural."
              : "Preencha os dados para registrar um novo produtor."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1">
            <Label htmlFor="name">Nome completo ou razão social</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="documentType">Tipo</Label>
              <Select
                value={documentType}
                onValueChange={(value: "CPF" | "CNPJ") =>
                  form.setValue("documentType", value, { shouldValidate: true })
                }
              >
                <SelectTrigger id="documentType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CPF">CPF</SelectItem>
                  <SelectItem value="CNPJ">CNPJ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="document">Documento ({documentType})</Label>
              <Input
                id="document"
                placeholder={documentType === "CPF" ? "000.000.000-00" : "12.ABC.345/01DE-35"}
                {...form.register("document")}
              />
              {form.formState.errors.document && (
                <p className="text-destructive text-xs">{form.formState.errors.document.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">E-mail de contato</Label>
            <Input id="email" type="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-destructive text-xs">{form.formState.errors.email.message}</p>
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

          <div className="space-y-1">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value: "ACTIVE" | "INACTIVE") =>
                form.setValue("status", value, { shouldValidate: true })
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Ativo</SelectItem>
                <SelectItem value="INACTIVE">Inativo</SelectItem>
              </SelectContent>
            </Select>
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
              {pending ? "Salvando..." : producer ? "Salvar Alterações" : "Cadastrar Produtor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
