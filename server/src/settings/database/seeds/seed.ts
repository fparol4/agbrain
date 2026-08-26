import { PasswordService } from "../../../modules/auth/password.service.js";
import { User } from "../../../modules/auth/entities/user.entity.js";
import { Farm } from "../../../modules/farms/entities/farm.entity.js";
import { Crop } from "../../../modules/harvests/entities/crop.entity.js";
import { Harvest } from "../../../modules/harvests/entities/harvest.entity.js";
import { Producer } from "../../../modules/producers/entities/producer.entity.js";
import { dataSource } from "../datasource.js";

const producers = [
  {
    key: "ana",
    name: "Ana Souza",
    documentType: "CPF" as const,
    document: "52998224725",
    email: "ana.souza@example.com",
    city: "Rio Verde",
    state: "GO",
    status: "ACTIVE" as const,
  },
  {
    key: "cerrado",
    name: "Cooperativa Vale do Cerrado",
    documentType: "CNPJ" as const,
    document: "04252011000110",
    email: "contato@valedocerrado.example.com",
    city: "Sorriso",
    state: "MT",
    status: "ACTIVE" as const,
  },
  {
    key: "lucas",
    name: "Lucas Oliveira",
    documentType: "CPF" as const,
    document: "11144477735",
    email: "lucas.oliveira@example.com",
    city: "Uberaba",
    state: "MG",
    status: "ACTIVE" as const,
  },
  {
    key: "serra-azul",
    name: "Fazenda Serra Azul Ltda.",
    documentType: "CNPJ" as const,
    document: "11222333000181",
    email: "contato@serraazul.example.com",
    city: "Barreiras",
    state: "BA",
    status: "INACTIVE" as const,
  },
];

const farms = [
  {
    producer: "ana",
    name: "Fazenda Boa Esperança",
    city: "Rio Verde",
    state: "GO",
    totalArea: 320,
    agriculturalArea: 240,
    vegetationArea: 80,
  },
  {
    producer: "ana",
    name: "Sítio Ipê",
    city: "Jataí",
    state: "GO",
    totalArea: 95,
    agriculturalArea: 60,
    vegetationArea: 35,
  },
  {
    producer: "cerrado",
    name: "Fazenda Campo Verde",
    city: "Sorriso",
    state: "MT",
    totalArea: 1450,
    agriculturalArea: 1100,
    vegetationArea: 350,
  },
  {
    producer: "cerrado",
    name: "Fazenda Horizonte",
    city: "Lucas do Rio Verde",
    state: "MT",
    totalArea: 780,
    agriculturalArea: 530,
    vegetationArea: 250,
  },
  {
    producer: "lucas",
    name: "Fazenda Santa Clara",
    city: "Uberaba",
    state: "MG",
    totalArea: 520,
    agriculturalArea: 395,
    vegetationArea: 125,
  },
  {
    producer: "serra-azul",
    name: "Fazenda Serra Azul",
    city: "Barreiras",
    state: "BA",
    totalArea: 410,
    agriculturalArea: 180,
    vegetationArea: 230,
  },
];

const harvests = [
  { farm: "Fazenda Boa Esperança", year: 2025, crops: ["Soja", "Milho"] },
  { farm: "Fazenda Boa Esperança", year: 2026, crops: ["Soja"] },
  { farm: "Sítio Ipê", year: 2026, crops: ["Café", "Feijão"] },
  { farm: "Fazenda Campo Verde", year: 2025, crops: ["Milho", "Algodão"] },
  { farm: "Fazenda Campo Verde", year: 2026, crops: ["Soja", "Milho"] },
  { farm: "Fazenda Horizonte", year: 2026, crops: ["Milho", "Algodão"] },
  { farm: "Fazenda Santa Clara", year: 2025, crops: ["Café"] },
  { farm: "Fazenda Santa Clara", year: 2026, crops: ["Café", "Soja"] },
  { farm: "Fazenda Serra Azul", year: 2026, crops: ["Feijão"] },
];

function normalizedName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

await dataSource.initialize();

try {
  await dataSource.transaction(async (manager) => {
    const users = manager.getRepository(User);
    const email = (process.env.ADMIN_EMAIL ?? "admin@admin.com").trim()
      .toLowerCase();
    if (!(await users.findOneBy({ email }))) {
      await users.save(
        users.create({
          name: process.env.ADMIN_NAME ?? "Admin",
          email,
          passwordHash: await new PasswordService().hash(
            process.env.ADMIN_PASSWORD ?? "admin1234",
          ),
          active: true,
        }),
      );
    }

    const producerRepository = manager.getRepository(Producer);
    const seededProducers = new Map<string, Producer>();
    for (const input of producers) {
      let producer = await producerRepository.findOneBy({
        document: input.document,
      });
      if (!producer) {
        const { key, ...values } = input;
        producer = await producerRepository.save(
          producerRepository.create(values),
        );
      }
      seededProducers.set(input.key, producer);
    }

    const farmRepository = manager.getRepository(Farm);
    const seededFarms = new Map<string, Farm>();
    for (const input of farms) {
      const producer = seededProducers.get(input.producer)!;
      let farm = await farmRepository.findOneBy({
        idProducer: producer.idProducer,
        name: input.name,
      });
      if (!farm) {
        const { producer: _, ...values } = input;
        farm = await farmRepository.save(
          farmRepository.create({ ...values, idProducer: producer.idProducer }),
        );
      }
      seededFarms.set(`${input.producer}:${input.name}`, farm);
    }

    const cropRepository = manager.getRepository(Crop);
    const cropNames = [
      ...new Set(harvests.flatMap((harvest) => harvest.crops)),
    ];
    const seededCrops = new Map<string, Crop>();
    for (const name of cropNames) {
      const normalized = normalizedName(name);
      let crop = await cropRepository.findOneBy({ normalizedName: normalized });
      if (!crop) {
        crop = await cropRepository.save(
          cropRepository.create({ name, normalizedName: normalized }),
        );
      }
      seededCrops.set(name, crop);
    }

    const harvestRepository = manager.getRepository(Harvest);
    for (const input of harvests) {
      const farm = [...seededFarms.values()].find(
        (item) => item.name === input.farm,
      )!;
      if (
        await harvestRepository.findOneBy({
          idFarm: farm.idFarm,
          year: input.year,
        })
      )
        continue;
      await harvestRepository.save(
        harvestRepository.create({
          idFarm: farm.idFarm,
          year: input.year,
          crops: input.crops.map((name) => seededCrops.get(name)!),
        }),
      );
    }
  });
} finally {
  await dataSource.destroy();
}
