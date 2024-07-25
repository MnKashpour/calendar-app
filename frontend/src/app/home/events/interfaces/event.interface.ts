export interface EventInterface {
  id: number;
  title: string;
  location?: string;
  allDay: boolean;
  start: Date;
  end: Date;
  color: string;
  icon: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
  userRole?: 'viewer' | 'writer' | 'owner';
}
