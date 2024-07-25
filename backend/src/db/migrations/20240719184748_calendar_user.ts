import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('calendar_user', (table) => {
    table.integer('calendar_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.string('role').notNullable();
    table.string('status').notNullable().defaultTo('pending');

    table.timestamps(true, true);

    table
      .foreign('calendar_id')
      .references('id')
      .inTable('calendars')
      .onUpdate('cascade')
      .onDelete('cascade');
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onUpdate('cascade')
      .onDelete('cascade');
    table.primary(['calendar_id', 'user_id']);
    table.index(['calendar_id']);
    table.index(['user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('calendar_user');
}
