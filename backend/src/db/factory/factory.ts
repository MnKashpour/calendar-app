import { Knex } from 'knex';

export default interface Factory<T> {
  define(knex: Knex, ...arg: any[]): Promise<T>;
  make(knex: Knex, ...arg: any[]): Promise<T[]>;
}
