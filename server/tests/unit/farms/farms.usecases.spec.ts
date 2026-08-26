import { BusinessRuleError } from "../../../src/core/errors/application.error.js";
import { FarmsUseCases } from "../../../src/modules/farms/usecases/farms.usecases.js";

const input = {
  idProducer: "producer",
  name: "Farm",
  city: "Sorriso",
  state: "mt",
  totalArea: 100,
  agriculturalArea: 70,
  vegetationArea: 30,
};

describe("FarmsUseCases", () => {
  const farms = {
    create: vi.fn(),
    serialize: vi.fn((value) => value),
    findOrFail: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
    list: vi.fn(),
  };
  const producers = { findOrFail: vi.fn() };
  const useCases = new FarmsUseCases(farms as never, producers as never);
  beforeEach(() => {
    vi.resetAllMocks();
    farms.serialize.mockImplementation((value) => value);
  });

  it("creates a valid farm", async () => {
    farms.create.mockImplementation(async (value) => value);
    await expect(useCases.create(input)).resolves.toMatchObject({
      state: "MT",
    });
  });

  it("rejects an invalid area allocation", async () => {
    await expect(
      useCases.create({ ...input, agriculturalArea: 80, vegetationArea: 30 }),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it("updates a farm using its unchanged areas", async () => {
    farms.findOrFail.mockResolvedValue(input);
    farms.save.mockResolvedValue({ ...input, name: "Updated" });
    await expect(
      useCases.update("farm", { name: "Updated" }),
    ).resolves.toMatchObject({ name: "Updated" });
  });
});
