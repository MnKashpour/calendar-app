import { Request, Response, NextFunction } from 'express';

export default async (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV != 'development') return next();

  await new Promise((r, j) => {
    setTimeout(() => r(1), 250);
  });

  return next();
};
