import jwt, { JwtPayload } from 'jsonwebtoken';
import asyncHandler from '../utils/async_handler';
import UnauthorizedError from '../utils/errors/unauthorized_error';

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new UnauthorizedError('Unauthorized to access this route', true);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    req.userId = parseInt(decoded.sub!);

    next();
  } catch (err) {
    return next(new UnauthorizedError('Not authorized to access this route', true));
  }
});
