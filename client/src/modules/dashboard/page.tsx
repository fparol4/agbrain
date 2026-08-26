import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Trees, X, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/shared/components/page-header";
import { ErrorState, LoadingSkeleton } from "@/shared/components/shared-states";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { formatNumber } from "@/shared/lib/format";
import { getDashboard } from "./api";
import { CropsChart, SoilUseChart, StatesChart } from "./charts";

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const idProducer = searchParams.get("idProducer") || undefined;
  const yearParam = searchParams.get("year");
  const year = yearParam ? Number(yearParam) : undefined;

  const dashboard = useQuery({
    queryKey: ["dashboard", { idProducer, year }],
    queryFn: () => getDashboard({ idProducer, year }),
  });

  const updateParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  if (dashboard.isLoading) return <LoadingSkeleton rows={8} />;
  if (dashboard.isError || !dashboard.data) {
    return (
      <ErrorState message="Não foi possível carregar o dashboard." onRetry={dashboard.refetch} />
    );
  }

  const data = dashboard.data;
  const general = data.scope === "GENERAL";

  return (
    <div className="space-y-6">
      <PageHeader
        title={general ? "Dashboard Geral" : `Dashboard: ${data.producerName}`}
        description={
          general
            ? "Visão consolidada de produtores, fazendas e safras"
            : "Indicadores e métricas do produtor selecionado"
        }
        action={
          <div className="flex items-center gap-3">
            {idProducer && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateParam("idProducer")}
                className="h-9 gap-1.5 text-xs"
              >
                <X className="h-3.5 w-3.5" />
                Limpar filtro de produtor
              </Button>
            )}
            {data.availableYears.length > 0 && (
              <Select
                value={String(data.year)}
                onValueChange={(value) => updateParam("year", value)}
              >
                <SelectTrigger className="h-9 w-[120px] text-xs sm:text-sm">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {data.availableYears.map((item) => (
                    <SelectItem key={item} value={String(item)}>
                      Safra {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        }
      />

      {!general && (
        <div className="bg-muted/40 border-border flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">Produtor Selecionado</Badge>
            <span className="text-sm font-semibold">{data.producerName}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => updateParam("idProducer")}>
            Ver dashboard geral
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard label="Total de Fazendas" value={data.totalFarms} icon={Building2} />
        <KpiCard
          label="Área Total (Hectares)"
          value={`${formatNumber(data.totalHectares)} ha`}
          icon={Trees}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <StatesChart data={data.states} />
        <CropsChart data={data.crops} year={data.year} />
        <SoilUseChart data={data.soilUse} />
      </div>

      {general && data.topProducers.length > 0 && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Principais Produtores</CardTitle>
            <CardDescription>
              Maiores produtores por área total cadastrada (clique para filtrar o dashboard)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-border rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produtor</TableHead>
                    <TableHead className="text-center">Fazendas</TableHead>
                    <TableHead className="text-right">Área Total</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topProducers.map((producer) => (
                    <TableRow key={producer.idProducer}>
                      <TableCell className="font-medium">{producer.name}</TableCell>
                      <TableCell className="text-center">{producer.farmCount}</TableCell>
                      <TableCell className="text-right">
                        {formatNumber(producer.totalHectares)} ha
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateParam("idProducer", producer.idProducer)}
                        >
                          Filtrar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{label}</CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default DashboardPage;
