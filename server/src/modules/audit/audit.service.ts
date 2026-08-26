import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { pageMeta } from "../../shared/pagination/pagination.dto.js";
import type { ListAuditsDto } from "./dtos/audit.dto.js";
import { AuditLog } from "./entities/audit.entity.js";

export interface AuditRecord {
  operation: string;
  resource: string;
  idResource?: string | null;
  outcome: "SUCCESS" | "FAILURE";
  idActor?: string | null;
  actorName?: string | null;
  actorEmail?: string | null;
  statusCode: number;
  errorCode?: string | null;
  errorMessage?: string | null;
  requestId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async record(data: AuditRecord): Promise<void> {
    try {
      await this.repo.save(
        this.repo.create({
          ...data,
          idResource: data.idResource ?? null,
          idActor: data.idActor ?? null,
          actorName: data.actorName ?? null,
          actorEmail: data.actorEmail ?? null,
          errorCode: data.errorCode ?? null,
          errorMessage: data.errorMessage ?? null,
          requestId: data.requestId ? data.requestId.slice(0, 128) : null,
          ipAddress: data.ipAddress ? data.ipAddress.slice(0, 64) : null,
          userAgent: data.userAgent ? data.userAgent.slice(0, 512) : null,
          metadata: data.metadata ?? {},
        }),
      );
    } catch (err) {
      this.logger.error("Failed to persist audit record", err);
    }
  }

  async list(input: ListAuditsDto) {
    const {
      page,
      limit,
      operation,
      resource,
      outcome,
      idActor,
      from,
      to,
      search,
    } = input;

    if (from && to && from > to) {
      const { BusinessRuleError } =
        await import("../../core/errors/application.error.js");
      throw new BusinessRuleError(
        "E_INVALID_DATE_RANGE",
        "O parâmetro 'from' não pode ser posterior a 'to'.",
      );
    }

    const qb: SelectQueryBuilder<AuditLog> = this.repo
      .createQueryBuilder("a")
      .orderBy("a.occurred_at", "DESC");

    if (operation) qb.andWhere("a.operation = :operation", { operation });
    if (resource) qb.andWhere("a.resource = :resource", { resource });
    if (outcome) qb.andWhere("a.outcome = :outcome", { outcome });
    if (idActor) qb.andWhere("a.id_actor = :idActor", { idActor });
    if (from) {
      qb.andWhere("a.occurred_at >= :from", {
        from: new Date(from + "T00:00:00Z"),
      });
    }
    if (to) {
      const toDate = new Date(to + "T00:00:00Z");
      toDate.setUTCDate(toDate.getUTCDate() + 1);
      qb.andWhere("a.occurred_at < :to", { to: toDate });
    }
    if (search) {
      const term = `%${search}%`;
      qb.andWhere(
        "(a.actor_name ILIKE :term OR a.actor_email ILIKE :term OR a.operation ILIKE :term OR a.resource ILIKE :term OR CAST(a.id_resource AS text) ILIKE :term)",
        { term },
      );
    }

    const [rows, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data: rows, meta: pageMeta(page, limit, total) };
  }
}
