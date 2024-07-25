import NotFoundError from '../../utils/errors/not_found_error';
import { omitSensitiveFields } from '../../utils/helper';
import { AuthService } from '../auth';
import { calendarService } from '../calendar';
import UserDAL from './user_dal';
import * as types from './user_types';

class UserService {
  /**
   * Get user by id
   */
  async findUserById(id: number, includeSensitiveFields: types.UserField[] = []) {
    const user = await UserDAL.findUserById(id);

    if (!user) {
      throw new NotFoundError('User Not Found');
    }

    const userCalenderId = await calendarService.getDefaultCalendarIdForUser(user.id);

    return omitSensitiveFields(
      { ...user, defaultCalendarId: userCalenderId },
      UserDAL.sensitiveFields,
      includeSensitiveFields
    );
  }

  /**
   * Get user by email
   */
  async findUserByEmail(email: string, includeSensitiveFields: types.UserField[] = []) {
    const user = await UserDAL.findUserByEmail(email);

    if (!user) {
      throw new NotFoundError('User Not Found');
    }

    const userCalenderId = await calendarService.getDefaultCalendarIdForUser(user.id);

    return omitSensitiveFields(
      { ...user, defaultCalendarId: userCalenderId },
      UserDAL.sensitiveFields,
      includeSensitiveFields
    );
  }

  /**
   * Create a new user
   */
  async createUser(data: types.UserCreateInput) {
    const id = await UserDAL.createUser({
      ...data,
      password: await AuthService.hashPassword(data.password),
      status: 'active',
    });

    await calendarService.createCalendarForUser(id, {
      name: 'Main Calendar',
    });

    return id;
  }

  /**
   * Update user status
   */
  async updateStatus(id: number, data: types.UserUpdateStatusInput) {
    const exists = !!(await UserDAL.findUserById(id));

    if (!exists) {
      throw new NotFoundError('User Not Found');
    }

    await UserDAL.updateStatus(id, data);
  }

  /**
   * check if this email exists
   */
  async emailExists(email: string) {
    const user = await UserDAL.findUserByEmail(email);
    return !!user;
  }
}

export default new UserService();
