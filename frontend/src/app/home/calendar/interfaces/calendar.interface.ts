export interface CalendarInterface {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  userRole?: 'viewer' | 'writer' | 'owner';
}
