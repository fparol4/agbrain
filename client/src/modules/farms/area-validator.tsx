import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import { formatNumber } from "@/shared/lib/format";

export function FarmAreaValidator({
  totalArea,
  agriculturalArea,
  vegetationArea,
}: {
  totalArea: number;
  agriculturalArea: number;
  vegetationArea: number;
}) {
  const total = Number(totalArea) || 0;
  const agricultural = Number(agriculturalArea) || 0;
  const vegetation = Number(vegetationArea) || 0;
  const used = agricultural + vegetation;

  if (total <= 0) {
    return (
      <div className="border-border bg-muted/30 text-muted-foreground space-y-1.5 rounded-md border p-3 text-xs">
        <div className="flex items-center gap-1.5 font-medium">
          <HelpCircle className="h-4 w-4" />
          <span>Distribuição do Solo</span>
        </div>
        <p>Informe a área total para validar o aproveitamento do solo.</p>
      </div>
    );
  }

  const exceeded = used > total;
  const difference = Math.abs(total - used);
  const agriculturalPercent = Math.min(100, (agricultural / total) * 100);
  const vegetationPercent = Math.min(100 - agriculturalPercent, (vegetation / total) * 100);

  return (
    <div
      className={`space-y-2 rounded-md border p-3 text-xs transition-colors ${
        exceeded
          ? "border-destructive/40 bg-destructive/5 text-destructive"
          : "border-emerald-200 bg-emerald-50/50 text-emerald-800"
      }`}
    >
      <div className="flex items-center justify-between font-medium">
        <div className="flex items-center gap-1.5">
          {exceeded ? (
            <>
              <AlertTriangle className="text-destructive h-4 w-4 shrink-0" />
              <span className="text-destructive font-semibold">
                {formatNumber(difference)} ha excedentes
              </span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span className="font-semibold text-emerald-700">
                {formatNumber(difference)} ha disponíveis
              </span>
            </>
          )}
        </div>
        <span className="text-muted-foreground">
          {formatNumber(used)} / {formatNumber(total)} ha
        </span>
      </div>

      <div className="bg-muted flex h-2.5 w-full overflow-hidden rounded-full">
        <div
          className="h-full bg-[#15803d] transition-all"
          style={{ width: `${agriculturalPercent}%` }}
          title={`Agricultável: ${agricultural} ha`}
        />
        <div
          className="h-full bg-[#0284c7] transition-all"
          style={{ width: `${vegetationPercent}%` }}
          title={`Vegetação: ${vegetation} ha`}
        />
      </div>

      <div className="text-muted-foreground flex items-center gap-3 pt-0.5 text-[11px]">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#15803d]" />
          Agricultável ({formatNumber(agricultural)} ha)
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-[#0284c7]" />
          Vegetação ({formatNumber(vegetation)} ha)
        </span>
      </div>
    </div>
  );
}
