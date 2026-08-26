import { BusinessRuleError } from "../../../src/core/errors/application.error.js";
import { resolveAuditMeta } from "../../../src/modules/audit/audit.request.js";
import { AuditService } from "../../../src/modules/audit/audit.service.js";
import { ListAuditsUseCase } from "../../../src/modules/audit/usecases/list-audits.usecase.js";

// ---------------------------------------------------------------------------
// resolveAuditMeta – fallback resolver used by exception filter for guard rejections
// ---------------------------------------------------------------------------

describe("resolveAuditMeta", () => {
  it("resolves POST /api/v1/auth/login to auth.login / SESSION", () => {
    const meta = resolveAuditMeta("POST", "/api/v1/auth/login");
    expect(meta).toEqual({ operation: "auth.login", resource: "SESSION" });
  });

  it("resolves DELETE /api/v1/auth/session to auth.logout / SESSION", () => {
    expect(resolveAuditMeta("DELETE", "/api/v1/auth/session")).toEqual({
      operation: "auth.logout",
      resource: "SESSION",
    });
  });

  it("resolves POST /api/v1/producers to producer.create / PRODUCER", () => {
    expect(resolveAuditMeta("POST", "/api/v1/producers")).toEqual({
      operation: "producer.create",
      resource: "PRODUCER",
    });
  });

  it("resolves PATCH /api/v1/producers/:id to producer.update / PRODUCER", () => {
    expect(resolveAuditMeta("PATCH", "/api/v1/producers/some-uuid")).toEqual({
      operation: "producer.update",
      resource: "PRODUCER",
    });
  });

  it("resolves DELETE /api/v1/harvests/:id to harvest.delete / HARVEST", () => {
    expect(resolveAuditMeta("DELETE", "/api/v1/harvests/some-uuid")).toEqual({
      operation: "harvest.delete",
      resource: "HARVEST",
    });
  });

  it("returns null for a non-audited route", () => {
    expect(resolveAuditMeta("GET", "/api/v1/producers")).toBeNull();
    expect(resolveAuditMeta("GET", "/api/v1/dashboard")).toBeNull();
    expect(resolveAuditMeta("GET", "/health")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// ListAuditsUseCase – delegates to service
// ---------------------------------------------------------------------------

describe("ListAuditsUseCase", () => {
  const auditService = { list: vi.fn() };
  const useCase = new ListAuditsUseCase(auditService as never);

  beforeEach(() => vi.clearAllMocks());

  it("delegates to audit service and returns result", async () => {
    const expected = {
      data: [],
      meta: { page: 1, limit: 20, total: 0, lastPage: 1 },
    };
    auditService.list.mockResolvedValue(expected);
    const input = { page: 1, limit: 20 };
    await expect(useCase.execute(input as never)).resolves.toBe(expected);
    expect(auditService.list).toHaveBeenCalledWith(input);
  });
});

// ---------------------------------------------------------------------------
// AuditService – list filters, date validation, best-effort failure
// ---------------------------------------------------------------------------

function makeQb() {
  const qb = {
    orderBy: vi.fn(),
    andWhere: vi.fn(),
    skip: vi.fn(),
    take: vi.fn(),
    getManyAndCount: vi.fn(),
  };
  // All chainable
  qb.orderBy.mockReturnValue(qb);
  qb.andWhere.mockReturnValue(qb);
  qb.skip.mockReturnValue(qb);
  qb.take.mockReturnValue(qb);
  qb.getManyAndCount.mockResolvedValue([[], 0]);
  return qb;
}

describe("AuditService.list", () => {
  const qb = makeQb();
  const repo = {
    createQueryBuilder: vi.fn(() => qb),
    save: vi.fn(),
    create: vi.fn((v: unknown) => v),
  };
  const service = new AuditService(repo as never);

  beforeEach(() => {
    vi.clearAllMocks();
    qb.orderBy.mockReturnValue(qb);
    qb.andWhere.mockReturnValue(qb);
    qb.skip.mockReturnValue(qb);
    qb.take.mockReturnValue(qb);
    qb.getManyAndCount.mockResolvedValue([[], 0]);
    repo.createQueryBuilder.mockReturnValue(qb);
  });

  it("returns newest-first paginated results", async () => {
    qb.getManyAndCount.mockResolvedValue([[{ idAudit: "1" }], 1]);
    const result = await service.list({ page: 1, limit: 20 } as never);
    expect(result.meta).toEqual({ page: 1, limit: 20, total: 1, lastPage: 1 });
    expect(qb.orderBy).toHaveBeenCalledWith("a.occurred_at", "DESC");
  });

  it("applies operation filter", async () => {
    await service.list({
      page: 1,
      limit: 20,
      operation: "auth.login",
    } as never);
    expect(qb.andWhere).toHaveBeenCalledWith(
      "a.operation = :operation",
      expect.objectContaining({ operation: "auth.login" }),
    );
  });

  it("applies outcome filter", async () => {
    await service.list({ page: 1, limit: 20, outcome: "FAILURE" } as never);
    expect(qb.andWhere).toHaveBeenCalledWith(
      "a.outcome = :outcome",
      expect.objectContaining({ outcome: "FAILURE" }),
    );
  });

  it("throws BusinessRuleError when from > to", async () => {
    await expect(
      service.list({
        page: 1,
        limit: 20,
        from: "2026-12-31",
        to: "2026-01-01",
      } as never),
    ).rejects.toBeInstanceOf(BusinessRuleError);
  });

  it("does not throw when from === to", async () => {
    await expect(
      service.list({
        page: 1,
        limit: 20,
        from: "2026-01-01",
        to: "2026-01-01",
      } as never),
    ).resolves.toBeDefined();
  });
});

describe("AuditService.record", () => {
  it("swallows repository errors (best-effort)", async () => {
    const repo = {
      save: vi.fn().mockRejectedValue(new Error("DB down")),
      create: vi.fn((v: unknown) => v),
      createQueryBuilder: vi.fn(),
    };
    const service = new AuditService(repo as never);
    await expect(
      service.record({
        operation: "auth.login",
        resource: "SESSION",
        outcome: "SUCCESS",
        statusCode: 200,
      }),
    ).resolves.toBeUndefined();
  });

  it("does not store password or token fields", async () => {
    const saved: unknown[] = [];
    const repo = {
      save: vi.fn((v: unknown) => {
        saved.push(v);
        return Promise.resolve(v);
      }),
      create: vi.fn((v: unknown) => v),
      createQueryBuilder: vi.fn(),
    };
    const service = new AuditService(repo as never);
    await service.record({
      operation: "auth.login",
      resource: "SESSION",
      outcome: "SUCCESS",
      statusCode: 200,
      metadata: {},
    });
    const record = saved[0] as Record<string, unknown>;
    expect(record).not.toHaveProperty("password");
    expect(record).not.toHaveProperty("token");
    expect(record).not.toHaveProperty("passwordHash");
  });
});
