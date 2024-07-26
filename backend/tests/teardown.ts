import knex from '../src/db/db';

export default async () => {
  await knex.destroy();
};
