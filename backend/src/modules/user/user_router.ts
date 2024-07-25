import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../utils/async_handler';
import UserService from './user_service';
import { protect } from '../../middleware/auth';

const router = express.Router();

/**
 * Get authenticated user
 */
router.get(
  '/me',
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.findUserById(req.userId!);

    res.status(200).json(user);
  })
);

/**
 * Get user by id
 */
router.get(
  '/:id([0-9]+)',
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.params.id) {
      return res.status(400).json({
        message: 'invalid route parameter',
      });
    }

    const id = parseInt(req.params.id);

    const user = await UserService.findUserById(id);

    return res.status(200).json(user);
  })
);

export default router;
