import "reflect-metadata";
import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DataSource } from "typeorm";

const env = {
  NODE_ENV: "test",
  HOST: "127.0.0.1",
  PORT: "0",
  CLIENT_URL: "http://localhost:5173",
  DB_HOST: "127.0.0.1",
  DB_PORT: "5433",
  DB_USER: "agbrain",
  DB_PASSWORD: "agbrain",
  DB_DATABASE: "agbrain_test",
  SESSION_COOKIE: "agbrain-session",
  SESSION_TTL_HOURS: "2",
};
Object.assign(process.env, env);

const missingId = "00000000-0000-4000-8000-000000000099";
const producerInput = {
  name: "Empresa Rural",
  documentType: "CNPJ",
  document: "12.ABC.345/01DE-35",
  email: "rural@example.com",
  city: "Sorriso",
  state: "MT",
  status: "ACTIVE",
};

describe("API", () => {
  let app: INestApplication;
  let database: DataSource;
  let baseUrl: string;

  beforeAll(async () => {
    const [{ dataSource }, { User }, { PasswordService }] = await Promise.all([
      import("../../src/settings/database/datasource.js"),
      import("../../src/modules/auth/entities/user.entity.js"),
      import("../../src/modules/auth/password.service.js"),
    ]);
    await dataSource.initialize();
    await dataSource.runMigrations();
    const users = dataSource.getRepository(User);
    if (!(await users.findOneBy({ email: "admin@test.local" }))) {
      await users.save({
        name: "Test Administrator",
        email: "admin@test.local",
        active: true,
        passwordHash: await new PasswordService().hash("test-password"),
      });
    }
    await dataSource.destroy();

    const [{ AppModule }, { configureApp }] = await Promise.all([
      import("../../src/app.module.js"),
      import("../../src/core/http/configure-app.js"),
    ]);
    app = await NestFactory.create(AppModule, { logger: false });
    configureApp(app);
    await app.listen(0, "127.0.0.1");
    database = app.get(DataSource);
    baseUrl = await app.getUrl();
  });

  beforeEach(async () => {
    await database.query(
      "TRUNCATE harvest_crops, harvests, crops, farm_area_events, farms, producers, sessions RESTART IDENTITY CASCADE",
    );
  });

  afterAll(async () => app?.close());

  async function call(path: string, init: RequestInit = {}, cookie?: string) {
    const headers = new Headers(init.headers);
    headers.set("accept", "application/json");
    if (init.body) headers.set("content-type", "application/json");
    if (cookie) headers.set("cookie", cookie);
    const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
    const text = await response.text();
    return { response, body: text ? JSON.parse(text) : undefined };
  }

  async function login() {
    const result = await call("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@test.local",
        password: "test-password",
      }),
    });
    expect(result.response.status).toBe(200);
    return result.response.headers.get("set-cookie")!.split(";")[0];
  }

  async function createProducer(
    cookie: string,
    override: Record<string, unknown> = {},
  ) {
    return call(
      "/api/v1/producers",
      {
        method: "POST",
        body: JSON.stringify({ ...producerInput, ...override }),
      },
      cookie,
    );
  }

  it("reports health without authentication", async () => {
    const result = await call("/health");
    expect(result.response.status).toBe(200);
    expect(result.body).toEqual({ status: "ok", checks: { database: "up" } });
  });

  it("rejects invalid credentials", async () => {
    const result = await call("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@test.local",
        password: "wrong-password",
      }),
    });
    expect(result.response.status).toBe(401);
    expect(result.body.error.code).toBe("E_INVALID_CREDENTIALS");
  });

  it("rejects unauthenticated access", async () => {
    const result = await call("/api/v1/producers");
    expect(result.response.status).toBe(401);
    expect(result.body.error.code).toBe("E_UNAUTHORIZED");
  });

  it("rejects DTO-invalid input", async () => {
    const result = await createProducer(await login(), { email: "invalid" });
    expect(result.response.status).toBe(400);
    expect(result.body.error.code).toBe("E_VALIDATION_ERROR");
  });

  it("rejects an invalid rural document", async () => {
    const result = await createProducer(await login(), { document: "invalid" });
    expect(result.response.status).toBe(422);
    expect(result.body.error.code).toBe("E_INVALID_DOCUMENT");
  });

  it("rejects a duplicated producer document", async () => {
    const cookie = await login();
    expect((await createProducer(cookie)).response.status).toBe(201);
    const result = await createProducer(cookie, {
      email: "another@example.com",
    });
    expect(result.response.status).toBe(409);
    expect(result.body.error.code).toBe("E_CONFLICT");
  });

  it("rejects a duplicated producer email", async () => {
    const cookie = await login();
    expect((await createProducer(cookie)).response.status).toBe(201);
    const result = await createProducer(cookie, {
      documentType: "CPF",
      document: "529.982.247-25",
    });
    expect(result.response.status).toBe(409);
    expect(result.body.error.code).toBe("E_CONFLICT");
  });

  it("returns not found for a missing resource", async () => {
    const result = await call(
      `/api/v1/producers/${missingId}`,
      {},
      await login(),
    );
    expect(result.response.status).toBe(404);
    expect(result.body.error.code).toBe("E_RESOURCE_NOT_FOUND");
  });

  it("rejects invalid farm area allocation", async () => {
    const cookie = await login();
    const producer = (await createProducer(cookie)).body.data;
    const result = await call(
      "/api/v1/farms",
      {
        method: "POST",
        body: JSON.stringify({
          idProducer: producer.idProducer,
          name: "Farm",
          city: "Sorriso",
          state: "MT",
          totalArea: 100,
          agriculturalArea: 80,
          vegetationArea: 30,
        }),
      },
      cookie,
    );
    expect(result.response.status).toBe(422);
    expect(result.body.error.code).toBe("E_INVALID_FARM_AREA");
  });

  it("rejects a duplicate harvest for the same farm and year", async () => {
    const cookie = await login();
    const producer = (await createProducer(cookie)).body.data;
    const farm = (
      await call(
        "/api/v1/farms",
        {
          method: "POST",
          body: JSON.stringify({
            idProducer: producer.idProducer,
            name: "Farm",
            city: "Sorriso",
            state: "MT",
            totalArea: 100,
            agriculturalArea: 70,
            vegetationArea: 30,
          }),
        },
        cookie,
      )
    ).body.data;
    const input = { idFarm: farm.idFarm, year: 2026, crops: ["Soja"] };
    expect(
      (
        await call(
          "/api/v1/harvests",
          { method: "POST", body: JSON.stringify(input) },
          cookie,
        )
      ).response.status,
    ).toBe(201);
    const result = await call(
      "/api/v1/harvests",
      { method: "POST", body: JSON.stringify(input) },
      cookie,
    );
    expect(result.response.status).toBe(409);
    expect(result.body.error.code).toBe("E_CONFLICT");
  });

  it("manages producers, farms, harvests and both dashboard scopes", async () => {
    const cookie = await login();
    const producerResult = await createProducer(cookie);
    expect(producerResult.response.status).toBe(201);
    const producer = producerResult.body.data;

    const farmResult = await call(
      "/api/v1/farms",
      {
        method: "POST",
        body: JSON.stringify({
          idProducer: producer.idProducer,
          name: "Farm",
          city: "Sorriso",
          state: "MT",
          totalArea: 100,
          agriculturalArea: 70,
          vegetationArea: 30,
        }),
      },
      cookie,
    );
    expect(farmResult.response.status).toBe(201);
    const farm = farmResult.body.data;

    const harvestResult = await call(
      "/api/v1/harvests",
      {
        method: "POST",
        body: JSON.stringify({
          idFarm: farm.idFarm,
          year: 2026,
          crops: ["Soja", "Milho"],
        }),
      },
      cookie,
    );
    expect(harvestResult.response.status).toBe(201);
    const harvest = harvestResult.body.data;

    const updatedHarvest = await call(
      `/api/v1/harvests/${harvest.idHarvest}`,
      {
        method: "PATCH",
        body: JSON.stringify({ crops: ["Soja"] }),
      },
      cookie,
    );
    expect(updatedHarvest.response.status).toBe(200);
    expect(updatedHarvest.body.data.crops).toEqual([
      expect.objectContaining({ name: "Soja" }),
    ]);

    const general = await call("/api/v1/dashboard?year=2026", {}, cookie);
    expect(general.body.data).toMatchObject({
      scope: "GENERAL",
      totalProducers: 1,
      totalFarms: 1,
      totalHectares: 100,
    });
    const filtered = await call(
      `/api/v1/dashboard?idProducer=${producer.idProducer}&year=2026`,
      {},
      cookie,
    );
    expect(filtered.body.data).toMatchObject({
      scope: "PRODUCER",
      producerName: "Empresa Rural",
      totalFarms: 1,
    });

    expect(
      (
        await call(
          `/api/v1/harvests/${harvest.idHarvest}`,
          { method: "DELETE" },
          cookie,
        )
      ).response.status,
    ).toBe(204);
    expect(
      (await call(`/api/v1/farms/${farm.idFarm}`, { method: "DELETE" }, cookie))
        .response.status,
    ).toBe(204);
    expect(
      (
        await call(
          `/api/v1/producers/${producer.idProducer}`,
          { method: "DELETE" },
          cookie,
        )
      ).response.status,
    ).toBe(204);
  });

  it("logs out and invalidates the session", async () => {
    const cookie = await login();
    expect(
      (await call("/api/v1/auth/session", { method: "DELETE" }, cookie))
        .response.status,
    ).toBe(204);
    expect((await call("/api/v1/auth/me", {}, cookie)).response.status).toBe(
      401,
    );
  });
});
