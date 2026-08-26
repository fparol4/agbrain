export interface NameValue {
  name: string;
  value: number;
}

export interface TopProducer {
  idProducer: string;
  name: string;
  farmCount: number;
  totalHectares: number;
}

export interface AreaProgressPoint {
  month: string;
  hectares: number;
}

interface DashboardBase {
  scope: "GENERAL" | "PRODUCER";
  year: number;
  availableYears: number[];
  totalFarms: number;
  totalHectares: number;
  activeCrops: number;
  states: NameValue[];
  crops: NameValue[];
  soilUse: NameValue[];
  areaProgress: AreaProgressPoint[];
}

export interface GeneralDashboard extends DashboardBase {
  scope: "GENERAL";
  totalProducers: number;
  producerStatus: NameValue[];
  topProducers: TopProducer[];
}

export interface ProducerDashboard extends DashboardBase {
  scope: "PRODUCER";
  idProducer: string;
  producerName: string;
}

export type Dashboard = GeneralDashboard | ProducerDashboard;
