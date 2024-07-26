export async function truncateAllTables(knex) {
  const tables = await knex
    .select('table_name')
    .from('information_schema.tables')
    .where('table_schema', 'public');

  for (const table of tables) {
    await knex.raw(`TRUNCATE TABLE "${table.tableName}" CASCADE;`);
  }
}
