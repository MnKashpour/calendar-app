import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('events', (table) => {
    table.increments('id');
    table.string('title').notNullable();
    table.string('location');
    table.boolean('all_day').notNullable();
    table.timestamp('start').notNullable();
    table.timestamp('end').notNullable();
    table.string('color').notNullable();
    table.string('icon').notNullable();
    table.string('note', 1000);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('events');
}
