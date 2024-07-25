export interface Paginated<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  data: T[];
  totalCount: number;
}
