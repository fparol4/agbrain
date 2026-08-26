import { GetDashboardUseCase } from "../../../src/modules/dashboard/usecases/get-dashboard.usecase.js";

describe("GetDashboardUseCase", () => {
  const dashboard = { get: vi.fn() };
  const producers = { findOrFail: vi.fn() };
  const useCase = new GetDashboardUseCase(
    dashboard as never,
    producers as never,
  );
  beforeEach(() => vi.resetAllMocks());

  it("returns the general dashboard", async () => {
    dashboard.get.mockResolvedValue({ scope: "GENERAL" });
    await expect(useCase.execute({})).resolves.toEqual({ scope: "GENERAL" });
  });

  it("returns a producer-filtered dashboard", async () => {
    producers.findOrFail.mockResolvedValue({ name: "Producer" });
    dashboard.get.mockResolvedValue({ scope: "PRODUCER" });
    await expect(useCase.execute({ idProducer: "producer" })).resolves.toEqual({
      scope: "PRODUCER",
    });
    expect(dashboard.get).toHaveBeenCalledWith(
      { idProducer: "producer" },
      "Producer",
    );
  });
});
