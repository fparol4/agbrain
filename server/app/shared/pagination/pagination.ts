export interface PaginationInput {
  page?: number
  limit?: number
}

export function normalizePagination({ page = 1, limit = 20 }: PaginationInput) {
  const normalizedPage = Math.max(1, Math.trunc(page))
  const normalizedLimit = Math.min(100, Math.max(1, Math.trunc(limit)))

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    offset: (normalizedPage - 1) * normalizedLimit,
  }
}
