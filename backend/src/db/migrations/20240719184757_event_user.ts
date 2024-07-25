import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('event_user', (table) => {
    table.integer('event_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.string('role').notNullable();
    table.string('status').notNullable().defaultTo('pending');

    table.timestamps(true, true);

    table
      .foreign('event_id')
      .references('id')
      .inTable('events')
      .onUpdate('cascade')
      .onDelete('cascade');
    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onUpdate('cascade')
      .onDelete('cascade');

    table.primary(['event_id', 'user_id']);
    table.index(['event_id']);
    table.index(['user_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('event_user');
}