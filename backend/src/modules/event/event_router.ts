import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../utils/async_handler';
import EventService from './event_service';
import { protect } from '../../middleware/auth';
import { validator } from '../../utils/validator';
import * as types from './event_types';
import { Type } from '@sinclair/typebox';
import InvalidDataError from '../../utils/errors/invalid_data_error';

const router = express.Router();

/**
 * Get all events paginated
 */
router.get(
  '/',
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const params = validator<types.GetEventQueryParams>(types.GetEventQueryParamsSchema, req.query);

    const eventsPaginated = await EventService.getAllEventPaginatedForUser(req.userId!, params);

    return res.status(200).json(eventsPaginated);
  })
);

/**
 * Get specific event by id
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

    const event = await EventService.getEventByIdForUser(req.userId!, id);

    return res.status(200).json(event);
  })
);

/**
 * Create event
 */
router.post(
  '/',
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const body = validator<types.EventInput>(types.EventInputSchema, req.body);

    if (body.start > body.end) {
      throw new InvalidDataError('Invalid data provided', [
        { property: 'end', message: 'End cannot be before Start' },
      ]);
    }

    const eventId = await EventService.createEventForUser(req.userId!, body);

    return res.status(201).json({
      id: eventId,
    });
  })
);

/**
 * Update specific event by id
 */
router.put(
  '/:id([0-9]+)',
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.params.id) {
      return res.status(400).json({
        message: 'invalid route parameter',
      });
    }
    const eventId = parseInt(req.params.id);

    const body = validator<types.EventInput>(types.EventInputSchema, req.body);

    if (body.start > body.end) {
      throw new InvalidDataError('Invalid data provided', [
        { property: 'end', message: 'End cannot be before Start' },
      ]);
    }

    if (!(await EventService.userHasEventRole(req.userId!, eventId, ['owner', 'writer']))) {
      return res.status(403).json({
        message: 'You are not authorized to do this action',
      });
    }

    await EventService.updateEvent(eventId, body);

    return res.status(200).json({
      message: 'Updated Successfully',
    });
  })
);

/**
 * Delete event
 */
router.delete(
  '/:id([0-9]+)',
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.params.id) {
      return res.status(400).json({
        message: 'invalid route parameter',
      });
    }
    const eventId = parseInt(req.params.id);

    if (!(await EventService.userHasEventRole(req.userId!, eventId, ['owner']))) {
      return res.status(403).json({
        message: 'You are not authorized to do this action',
      });
    }

    await EventService.deleteEvent(eventId);

    return res.status(200).json({
      message: 'Updated Successfully',
    });
  })
);

export default router;
