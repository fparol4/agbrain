export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  lastPage: number;
}

export interface PagedResult<T> {
  data: T[];
  meta: PageMeta;
}
