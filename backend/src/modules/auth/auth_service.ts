import InvalidDataError from '../../utils/errors/invalid_data_error';
import NotFoundError from '../../utils/errors/not_found_error';
import UnauthorizedError from '../../utils/errors/unauthorized_error';
import { omitSensitiveFields } from '../../utils/helper';
import { User, UserService } from '../user';
import { LoginInput, RegisterInput } from './auth_types';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class AuthService {
  /**
   * Login user
   */
  async login(cred: LoginInput) {
    let user;

    try {
      user = await UserService.findUserByEmail(cred.email, ['password']);
    } catch (error) {
      if (!(error instanceof NotFoundError)) {
        throw error;
      }
    }

    if (!user || !(await this.matchPassword(user.password!, cred.password))) {
      throw new UnauthorizedError('Invalid credentials', true);
    }

    const token = this.getJwtToken(user.id!);

    return { token, user: omitSensitiveFields(user, ['password']) };
  }

  /**
   * Register user
   */
  async register(registerInput: RegisterInput) {
    const emailExists = await UserService.emailExists(registerInput.email);

    if (emailExists) {
      throw new Error('EMAIL_EXISTS'); //TODO define make type with all error codes
    }

    const userId = await UserService.createUser(registerInput);

    const token = this.getJwtToken(userId);

    const user = await UserService.findUserById(userId);

    return { token, user };
  }

  /**
   * Create Jwt token
   */
  getJwtToken(userId: number) {
    return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  }

  /**
   * Check user's password with an entered password
   */
  async matchPassword(hashedPassword: string, enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }

  /**
   * Hash password
   */
  async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
  }
}

export default new AuthService();
