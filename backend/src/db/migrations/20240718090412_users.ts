import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id');
    table.string('first_name').nullable();
    table.string('last_name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string('status').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
