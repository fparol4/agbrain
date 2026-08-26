import { expect, test } from "@playwright/test";

const mockAdminUser = {
  idUser: "11111111-1111-4000-8000-111111111111",
  name: "Administrador Teste",
  email: "admin@agbrain.local",
};

const mockProducer = {
  idProducer: "22222222-2222-4000-8000-222222222222",
  name: "Empresa Rural Modelo",
  documentType: "CNPJ",
  document: "12.ABC.345/01DE-35",
  email: "rural@modelo.local",
  city: "Sorriso",
  state: "MT",
  status: "ACTIVE",
  createdAt: "2026-08-25T12:00:00.000Z",
  updatedAt: "2026-08-25T12:00:00.000Z",
};

const mockFarm = {
  idFarm: "33333333-3333-4000-8000-333333333333",
  idProducer: mockProducer.idProducer,
  name: "Fazenda Progresso",
  city: "Sorriso",
  state: "MT",
  totalArea: 1000,
  agriculturalArea: 700,
  vegetationArea: 300,
  createdAt: "2026-08-25T12:00:00.000Z",
  updatedAt: "2026-08-25T12:00:00.000Z",
};

const mockHarvest = {
  idHarvest: "44444444-4444-4000-8000-444444444444",
  idFarm: mockFarm.idFarm,
  year: 2026,
  crops: [
    { idCrop: "66666666-6666-4666-8666-666666666666", name: "Soja" },
    { idCrop: "77777777-7777-4777-8777-777777777777", name: "Milho" },
  ],
};

const mockDashboard = {
  scope: "GENERAL",
  year: 2026,
  availableYears: [2026, 2025],
  totalProducers: 1,
  totalFarms: 1,
  totalHectares: 1000,
  activeCrops: 2,
  states: [{ name: "MT", value: 1 }],
  crops: [
    { name: "Soja", value: 1 },
    { name: "Milho", value: 1 },
  ],
  soilUse: [
    { name: "Área agricultável", value: 700 },
    { name: "Vegetação", value: 300 },
  ],
  areaProgress: [{ month: "ago", hectares: 1000 }],
  producerStatus: [{ name: "ACTIVE", value: 1 }],
  topProducers: [
    {
      idProducer: mockProducer.idProducer,
      name: mockProducer.name,
      farmCount: 1,
      totalHectares: 1000,
    },
  ],
};

const mockAuditLog = {
  idAudit: "55555555-5555-4000-8000-555555555555",
  operation: "producer.create",
  resource: "PRODUCER",
  idResource: mockProducer.idProducer,
  outcome: "SUCCESS",
  idActor: mockAdminUser.idUser,
  actorName: mockAdminUser.name,
  actorEmail: mockAdminUser.email,
  statusCode: 201,
  errorCode: null,
  errorMessage: null,
  requestId: "req-12345",
  ipAddress: "127.0.0.1",
  userAgent: "Mozilla/5.0",
  metadata: { resourceName: mockProducer.name },
  occurredAt: "2026-08-25T12:00:00.000Z",
};

test.describe("Authentication and Protection", () => {
  test("unauthenticated user is redirected to /login without flashing protected content", async ({
    page,
  }) => {
    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          error: { code: "E_UNAUTHORIZED", message: "Autenticação necessária." },
        }),
      });
    });

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole("heading", { name: "ag-brain" })).toBeVisible();
    await expect(page.getByLabel("E-mail")).toBeVisible();
  });

  test("successful administrator login reaches dashboard", async ({ page }) => {
    let authed = false;

    await page.route("**/api/v1/auth/me", async (route) => {
      if (!authed) {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ error: { code: "E_UNAUTHORIZED", message: "Não autorizado" } }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ user: mockAdminUser }),
        });
      }
    });

    await page.route("**/api/v1/auth/login", async (route) => {
      authed = true;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: mockAdminUser }),
      });
    });

    await page.route("**/api/v1/dashboard**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: mockDashboard }),
      });
    });

    await page.route("**/api/v1/producers**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [mockProducer],
          meta: { page: 1, limit: 100, total: 1, lastPage: 1 },
        }),
      });
    });

    await page.goto("/login");
    await page.getByLabel("E-mail").fill("admin@agbrain.local");
    await page.getByLabel("Senha").fill("senha12345");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByRole("heading", { name: "Dashboard Geral" })).toBeVisible();
  });
});

test.describe("Dashboard, Producers, Farms, Harvests and Audit Flows", () => {
  test.beforeEach(async ({ page }) => {
    // Default mock authenticated state
    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: mockAdminUser }),
      });
    });

    await page.route("**/api/v1/dashboard**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: mockDashboard }),
      });
    });

    await page.route("**/api/v1/producers**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [mockProducer],
          meta: { page: 1, limit: 20, total: 1, lastPage: 1 },
        }),
      });
    });

    await page.route("**/api/v1/farms**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [mockFarm],
          meta: { page: 1, limit: 20, total: 1, lastPage: 1 },
        }),
      });
    });

    await page.route("**/api/v1/harvests**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [mockHarvest],
          meta: { page: 1, limit: 20, total: 1, lastPage: 1 },
        }),
      });
    });

    await page.route("**/api/v1/audits**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [mockAuditLog],
          meta: { page: 1, limit: 20, total: 1, lastPage: 1 },
        }),
      });
    });
  });

  test("can view audit trail and open detail dialog", async ({ page }) => {
    await page.goto("/audit");
    await expect(page.getByRole("heading", { name: "Trilha de Auditoria" })).toBeVisible();

    await expect(page.getByText("Produtor criado").filter({ visible: true })).toBeVisible();

    await page
      .getByRole("button", { name: /^(Ver detalhes|Detalhes)$/ })
      .filter({ visible: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Detalhes do Evento de Auditoria" }),
    ).toBeVisible();
    await expect(page.getByText("req-12345")).toBeVisible();
  });

  test("farm area validation warns when exceeded", async ({ page }) => {
    await page.goto("/farms");
    await page.getByRole("button", { name: "Nova Fazenda" }).click();

    await page.getByLabel("Área Total (ha)").fill("100");
    await page.getByLabel("Agricultável (ha)").fill("80");
    await page.getByLabel("Vegetação (ha)").fill("30");

    await expect(page.getByText("10 ha excedentes")).toBeVisible();
  });
});
