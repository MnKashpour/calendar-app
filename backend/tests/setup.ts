import { exec } from 'child_process';
import dotenv from 'dotenv';

export default async () => {
  dotenv.config({ path: '.env' });

  process.env.NODE_ENV = 'test';

  await exec('npm run test:migrate');
};
