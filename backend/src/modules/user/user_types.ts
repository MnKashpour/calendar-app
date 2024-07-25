import { Type, type Static } from '@sinclair/typebox';

export type UserStatus = 'active' | 'banned';
export type UserField = keyof User;
export const UserSchema = Type.Object({
  id: Type.Number({ minimum: 1 }),
  firstName: Type.String({ minLength: 2, maxLength: 30 }),
  lastName: Type.String({ minLength: 2, maxLength: 30 }),
  email: Type.String({ format: 'email', maxLength: 255 }),
  password: Type.String({ minLength: 6, maxLength: 255 }),
  status: Type.Enum({ active: 'active', banned: 'banned' }),
  createdAt: Type.Date(),
  updatedAt: Type.Date(),
});
export type User = Static<typeof UserSchema>;

// User Create Schema
export const UserCreateInputSchema = Type.Pick(UserSchema, [
  'firstName',
  'lastName',
  'email',
  'password',
]);
export type UserCreateInput = Static<typeof UserCreateInputSchema>;
export type UserCreate = UserCreateInput & { status: UserStatus };

// User Update Schema
export const UserUpdateStatusInputSchema = Type.Object({
  status: Type.Enum({ active: 'active', banned: 'banned' }),
});
export type UserUpdateStatusInput = Static<typeof UserUpdateStatusInputSchema>;
export type UserUpdateStatus = UserUpdateStatusInput;
