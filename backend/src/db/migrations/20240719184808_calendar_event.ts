import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('calendar_event', (table) => {
    table.integer('calendar_id').unsigned().notNullable();
    table.integer('event_id').unsigned().notNullable();

    table.timestamps(true, false);

    table
      .foreign('calendar_id')
      .references('id')
      .inTable('calendars')
      .onUpdate('cascade')
      .onDelete('cascade');
    table
      .foreign('event_id')
      .references('id')
      .inTable('events')
      .onUpdate('cascade')
      .onDelete('cascade');

    table.primary(['event_id', 'calendar_id']);
    table.index(['event_id']);
    table.index(['calendar_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('calendar_event');
}
