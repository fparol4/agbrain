import { ConflictError } from "../../../src/core/errors/application.error.js";
import { HarvestsUseCases } from "../../../src/modules/harvests/usecases/harvests.usecases.js";

describe("HarvestsUseCases", () => {
  const harvests = {
    exists: vi.fn(),
    resolveCrops: vi.fn(),
    create: vi.fn(),
    findOrFail: vi.fn(),
    serialize: vi.fn((value) => value),
    save: vi.fn(),
    replaceCrops: vi.fn(),
    remove: vi.fn(),
    list: vi.fn(),
  };
  const farms = { findOrFail: vi.fn() };
  const normalization = {
    normalize: vi.fn((values: string[]) =>
      values.map((name) => ({ name, normalizedName: name.toLowerCase() })),
    ),
  };
  const useCases = new HarvestsUseCases(
    harvests as never,
    farms as never,
    normalization as never,
  );
  beforeEach(() => {
    vi.resetAllMocks();
    harvests.exists.mockResolvedValue(null);
    harvests.serialize.mockImplementation((value) => value);
    normalization.normalize.mockImplementation((values: string[]) =>
      values.map((name) => ({ name, normalizedName: name.toLowerCase() })),
    );
  });

  it("creates a harvest", async () => {
    harvests.resolveCrops.mockResolvedValue([{ name: "Soja" }]);
    harvests.create.mockResolvedValue({ idHarvest: "harvest" });
    harvests.findOrFail.mockResolvedValue({ idHarvest: "harvest", year: 2026 });
    await expect(
      useCases.create({ idFarm: "farm", year: 2026, crops: ["Soja"] }),
    ).resolves.toMatchObject({ year: 2026 });
  });

  it("rejects a duplicate farm and year", async () => {
    harvests.exists.mockResolvedValue({ idHarvest: "existing" });
    await expect(
      useCases.create({ idFarm: "farm", year: 2026, crops: ["Soja"] }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("updates a harvest", async () => {
    harvests.findOrFail.mockResolvedValue({
      idHarvest: "harvest",
      idFarm: "farm",
      year: 2026,
      crops: [],
    });
    await useCases.update("harvest", { year: 2027 });
    expect(harvests.save).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ year: 2027 }),
    );
  });

  it("replaces crops when updating a harvest", async () => {
    const harvest = {
      idHarvest: "harvest",
      idFarm: "farm",
      year: 2026,
      crops: [{ name: "Soja" }],
    };
    harvests.findOrFail.mockResolvedValue(harvest);
    harvests.resolveCrops.mockResolvedValue([{ name: "Milho" }]);

    await useCases.update("harvest", { crops: ["Milho"] });

    expect(harvests.replaceCrops).toHaveBeenCalledWith(harvest, [
      { name: "Milho" },
    ]);
  });

  it("rejects a duplicate target farm and year on update", async () => {
    harvests.findOrFail.mockResolvedValue({
      idHarvest: "harvest",
      idFarm: "farm",
      year: 2026,
      crops: [],
    });
    harvests.exists.mockResolvedValue({ idHarvest: "another" });
    await expect(
      useCases.update("harvest", { year: 2027 }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
