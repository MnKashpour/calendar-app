import express, { Request, Response } from 'express';
import AuthService from './auth_service';
import { LoginInput, LoginInputSchema, RegisterInput, RegisterInputSchema } from './auth_types';
import asyncHandler from '../../utils/async_handler';
import { validator } from '../../utils/validator';
import { protect } from '../../middleware/auth';
import UnauthorizedError from '../../utils/errors/unauthorized_error';
import InvalidDataError from '../../utils/errors/invalid_data_error';

const router = express.Router();

/**
 * Login user
 */
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const body = validator<LoginInput>(LoginInputSchema, req.body);

    try {
      var { token, user } = await AuthService.login(body);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return res.status(400).json({
          message: 'Provided Credentials are invalid',
          code: 'INVALID_CRED',
        });
      }

      throw error;
    }

    return res.status(200).json({
      success: true,
      token,
      user,
    });
  })
);

/**
 * Register user
 */
router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response) => {
    const body = validator<RegisterInput>(RegisterInputSchema, req.body);

    try {
      var { token, user } = await AuthService.register(body);
    } catch (error) {
      if (error instanceof Error && error.message == 'EMAIL_EXISTS') {
        throw new InvalidDataError('Email already exists', [
          { property: 'email', message: 'Email already exists' },
        ]);
      }

      throw error;
    }

    return res.status(201).json({
      success: true,
      token,
      user,
    });
  })
);

/**
 * Logout user
 */
router.post(
  '/logout',
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({
      message: 'logged out successfully',
    });
  })
);

export default router;
