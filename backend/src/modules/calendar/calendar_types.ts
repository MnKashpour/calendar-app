import { Type, type Static } from '@sinclair/typebox';

// calendar user role
export type CalendarUserRole = 'owner' | 'viewer';
export type CalendarUserStatus = 'accepted' | 'rejected' | 'pending';
export type CalendarUser = {
  calendarId: number;
  userId: number;
  role: CalendarUserRole;
  status: CalendarUserStatus;
};

// Calendar Schema
export const CalendarSchema = Type.Object({
  id: Type.Number({ minimum: 1 }),
  name: Type.String({ minLength: 1, maxLength: 30 }),
  createdAt: Type.Date(),
  updatedAt: Type.Date(),
});
export type Calendar = Static<typeof CalendarSchema>;
export type CalendarField = keyof Calendar;

// Calendar Create & Update Schema
export const CalendarInputSchema = Type.Pick(CalendarSchema, ['name']);
export type CalendarInput = Static<typeof CalendarInputSchema>;

// Calendar events filter with month
export const CalendarEventMonthFilterSchema = Type.Object({
  year: Type.Integer({ minimum: 2023, maximum: 2100 }),
  month: Type.Integer({ minimum: 1, maximum: 12 }),
});
export type CalendarEventMonthFilter = Static<typeof CalendarEventMonthFilterSchema>;
