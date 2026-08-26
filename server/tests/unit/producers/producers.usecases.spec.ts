import {
  BusinessRuleError,
  ConflictError,
} from "../../../src/core/errors/application.error.js";
import { ProducersUseCases } from "../../../src/modules/producers/usecases/producers.usecases.js";

const input = {
  name: "Empresa Rural",
  documentType: "CNPJ" as const,
  document: "12.ABC.345/01DE-35",
  email: "rural@example.com",
  city: "Sorriso",
  state: "mt",
  status: "ACTIVE" as const,
};

describe("ProducersUseCases", () => {
  const service = {
    findByDocument: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    findOrFail: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
    list: vi.fn(),
  };
  const useCases = new ProducersUseCases(service as never);
  beforeEach(() => {
    vi.resetAllMocks();
    service.findByDocument.mockResolvedValue(null);
    service.findByEmail.mockResolvedValue(null);
  });

  it("creates a producer with a canonical alphanumeric CNPJ", async () => {
    service.create.mockImplementation(async (value) => value);
    await expect(useCases.create(input)).resolves.toMatchObject({
      document: "12ABC34501DE35",
      state: "MT",
    });
  });

  it("rejects an invalid document", async () => {
    await expect(
      useCases.create({ ...input, document: "invalid" }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it("rejects a duplicated document", async () => {
    service.findByDocument.mockResolvedValue({ idProducer: "another" });
    await expect(useCases.create(input)).rejects.toBeInstanceOf(ConflictError);
  });

  it("rejects a duplicated email", async () => {
    service.findByEmail.mockResolvedValue({ idProducer: "another" });
    await expect(useCases.create(input)).rejects.toBeInstanceOf(ConflictError);
  });

  it("updates a producer", async () => {
    const producer = {
      ...input,
      idProducer: "one",
      document: "12ABC34501DE35",
      state: "MT",
    };
    service.findOrFail.mockResolvedValue(producer);
    service.save.mockResolvedValue({ ...producer, name: "Updated" });
    await expect(
      useCases.update("one", { name: "Updated" }),
    ).resolves.toMatchObject({ name: "Updated" });
  });

  it("rejects a document owned by another producer on update", async () => {
    service.findOrFail.mockResolvedValue({
      ...input,
      idProducer: "one",
      document: "12ABC34501DE35",
    });
    service.findByDocument.mockResolvedValue({ idProducer: "another" });
    await expect(useCases.update("one", {})).rejects.toBeInstanceOf(
      ConflictError,
    );
  });

  it("rejects an email owned by another producer on update", async () => {
    service.findOrFail.mockResolvedValue({
      ...input,
      idProducer: "one",
      document: "12ABC34501DE35",
    });
    service.findByEmail.mockResolvedValue({ idProducer: "another" });
    await expect(useCases.update("one", {})).rejects.toBeInstanceOf(
      ConflictError,
    );
  });
});
