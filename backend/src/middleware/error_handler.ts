import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import colors from 'colors';
import NotFoundError from '../utils/errors/not_found_error';
import InvalidDataError from '../utils/errors/invalid_data_error';
import UnauthorizedError from '../utils/errors/unauthorized_error';

export default (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof NotFoundError) {
    return res.status(404).json({
      message: err.message,
    });
  }

  if (err instanceof InvalidDataError) {
    return res.status(422).json({
      message: err.message,
      errors: err.invalidData,
    });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(err.authentication ? 401 : 403).json({
      message: err.message,
    });
  }

  console.error('-------------ERROR------------'.red.bold);
  console.error(colors.red(err));

  res.status(err?.statusCode ?? 500).json({
    message: err?.message ?? 'Server Error',
  });
};
