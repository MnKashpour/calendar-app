import { Type, type Static } from '@sinclair/typebox';
import { eventColors, eventIcons } from '../../utils/constants';

// Event user role
export type EventUserRole = 'owner' | 'writer' | 'viewer';
export type EventUserStatus = 'accepted' | 'rejected' | 'pending';
export type EventUser = {
  eventId: number;
  userId: number;
  role: EventUserRole;
  status: EventUserStatus;
};

// Event Schema
export const EventSchema = Type.Object({
  id: Type.Number({ minimum: 1 }),
  title: Type.String({ minLength: 1, maxLength: 100 }),
  location: Type.Optional(Type.String({ maxLength: 255 })),
  allDay: Type.Boolean({}),
  start: { ...Type.Date({}), type: 'string', format: 'date-time' },
  end: {
    ...Type.Date({}),
    type: 'string',
    format: 'date-time',
  },
  color: Type.Enum(eventColors.reduce((a, v) => ({ ...a, [v]: v }), {})),
  icon: Type.Enum(eventIcons.reduce((a, v) => ({ ...a, [v]: v }), {})),
  note: Type.Optional(Type.String({})),
  createdAt: Type.Date(),
  updatedAt: Type.Date(),
});
export type Event = Static<typeof EventSchema>;
export type EventField = keyof Event;

// Event Create & Update Schema
export const EventInputSchema = Type.Pick(EventSchema, [
  'title',
  'location',
  'allDay',
  'start',
  'end',
  'color',
  'icon',
  'note',
]);
export type EventInput = Static<typeof EventInputSchema>;

// allowed event filters
export const EventFiltersSchema = Type.Object({
  eventOwner: Type.Optional(Type.Enum({ me: 'me', others: 'others' })),
  from: Type.Optional({ ...Type.Date({}), type: 'string', format: 'date-time' }),
  to: Type.Optional({ ...Type.Date({}), type: 'string', format: 'date-time' }),
});
export type EventFilters = Static<typeof EventFiltersSchema>;

// Event get all paginated query params schema
export const GetEventQueryParamsSchema = Type.Object({
  search: Type.Optional(Type.String({})),
  filters: Type.Optional(EventFiltersSchema),
  sort: Type.Optional(
    Type.Object({
      field: Type.Enum({ start: 'start', createdAt: 'createdAt' }),
      sorting: Type.Enum({ asc: 'asc', desc: 'desc' }),
    })
  ),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  pageSize: Type.Optional(Type.Integer({ minimum: 1, maximum: 30 })),
});
export type GetEventQueryParams = Static<typeof GetEventQueryParamsSchema>;
