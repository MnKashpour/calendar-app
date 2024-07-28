import knex from '../../db/db';
import * as types from './user_types';

const userModel = () => knex<types.User>('users');

class UserDAL {
  sensitiveFields: types.UserField[] = ['password'];

  /**
   * Get user by id
   */
  async findUserById(id: number) {
    const user = await userModel().where('id', id).first();

    return user;
  }

  /**
   * Get user by email
   */
  async findUserByEmail(email: string) {
    const user = await userModel().where('email', email).first();

    return user;
  }

  /**
   * Insert a new user
   */
  async createUser(data: types.UserCreate) {
    const [user] = await userModel().insert(data).returning('id');

    return user.id;
  }

  /**
   * Update user status
   */
  async updateStatus(id: number, data: types.UserUpdateStatus) {
    await userModel().where('id', id).update({
      status: data.status,
    });
  }

  /**
   * Get users of event
   */
  async getUsersOfEvent(eventId: number) {
    return await userModel()
      .join('event_user', 'event_user.user_id', 'users.id')
      .where('event_id', eventId)
      .select('users.*', 'event_user.role as user_role', 'event_user.status as user_status');
  }
}

export default new UserDAL();
