export interface EventFiltersInterface {
  from: Date | null;
  to: Date | null;
  eventOwner: 'me' | 'others' | null;
}

export interface EventSortInterface {
  field: 'start' | 'createdAt';
  sorting: 'asc' | 'desc';
}
