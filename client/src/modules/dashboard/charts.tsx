import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { EmptyState } from "@/shared/components/shared-states";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import type { NameValue } from "./model";

const DISTRIBUTION_COLORS = ["#166534", "#0f766e", "#0369a1", "#7c3aed", "#b45309", "#be123c"];
const SOIL_COLORS = ["#15803d", "#0284c7"];
const tooltipStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "6px",
  border: "1px solid #e5e7eb",
};

export function StatesChart({ data }: { data: NameValue[] }) {
  return (
    <DistributionPieChart
      title="Fazendas por Estado"
      description="Distribuição territorial das propriedades cadastradas"
      data={data}
      valueLabel="fazenda(s)"
      emptyMessage="Nenhuma fazenda registrada para este filtro."
    />
  );
}

export function CropsChart({ data, year }: { data: NameValue[]; year: number }) {
  return (
    <DistributionPieChart
      title={`Culturas Plantadas (${year})`}
      description="Propriedades que registraram cada cultura na safra selecionada"
      data={data}
      valueLabel="propriedade(s)"
      emptyMessage="Nenhuma cultura registrada na safra selecionada."
    />
  );
}

export function SoilUseChart({ data }: { data: NameValue[] }) {
  return (
    <DistributionPieChart
      title="Uso do Solo"
      description="Área agricultável e vegetação preservada"
      data={data}
      valueLabel="ha"
      emptyMessage="Sem dados de área registrados."
      colors={SOIL_COLORS}
    />
  );
}

function DistributionPieChart({
  title,
  description,
  data,
  valueLabel,
  emptyMessage,
  colors = DISTRIBUTION_COLORS,
}: {
  title: string;
  description: string;
  data: NameValue[];
  valueLabel: string;
  emptyMessage: string;
  colors?: string[];
}) {
  const hasData = data.some((item) => item.value > 0);

  return (
    <ChartCard title={title} description={description}>
      {!hasData ? (
        <EmptyState description={emptyMessage} />
      ) : (
        <div className="flex flex-col items-center">
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((item, index) => (
                    <Cell key={item.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    `${value.toLocaleString("pt-BR")} ${valueLabel}`,
                    "Quantidade",
                  ]}
                  contentStyle={tooltipStyle}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-semibold">{item.value.toLocaleString("pt-BR")}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
