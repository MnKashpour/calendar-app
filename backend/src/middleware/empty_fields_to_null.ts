import { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction) => {
  if (!req.body || Object.prototype.toString.call(req.body) !== '[object Object]') return next();

  req.body = setEmptyToNull(req.body);

  return next();
};

function setEmptyToNull(obj: any) {
  if (obj === null || obj === undefined) return obj;

  for (const key of Object.keys(obj)) {
    const value = obj[key];

    if (Array.isArray(value)) {
      value.map((o) => {
        if (typeof o === 'object') {
          setEmptyToNull(o);
        }
      });
    } else if (typeof value === 'string') {
      if (value.trim() === '') {
        obj[key] = null;
      }
    } else if (typeof value === 'object') {
      setEmptyToNull(value);
    }
  }

  return obj;
}
