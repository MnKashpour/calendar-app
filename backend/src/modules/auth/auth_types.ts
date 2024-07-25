import { Static, Type } from '@sinclair/typebox';

// Login Schema
export const LoginInputSchema = Type.Object({
  email: Type.String({ minLength: 2, maxLength: 30, format: 'email' }),
  password: Type.String({ minLength: 2, maxLength: 30 }),
});
export type LoginInput = Static<typeof LoginInputSchema>;

// Register Schema
export const RegisterInputSchema = Type.Object({
  firstName: Type.String({ minLength: 2, maxLength: 30 }),
  lastName: Type.String({ minLength: 2, maxLength: 30 }),
  email: Type.String({ minLength: 2, format: 'email' }),
  password: Type.String({ minLength: 2 }),
});
export type RegisterInput = Static<typeof RegisterInputSchema>;
