import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../utils/async_handler';
import EventService from './event_service';
import { protect } from '../../middleware/auth';
import { validator } from '../../utils/validator';
import * as types from './event_types';
import { Type } from '@sinclair/typebox';
import InvalidDataError from '../../utils/errors/invalid_data_error';
import { UserService } from '../user';

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

/**
 * Pending events
 */
router.get(
  '/invites/pending',
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const pending = await EventService.getPendingEvents(req.userId!);

    return res.status(200).json(pending);
  })
);

/**
 * Accept invite
 */
router.put(
  '/:id([0-9]+)/invites/accept',
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.params.id) {
      return res.status(400).json({
        message: 'invalid route parameter',
      });
    }
    const eventId = parseInt(req.params.id);

    await EventService.acceptEventInvite(eventId, req.userId!);

    return res.status(200).json();
  })
);

/**
 * Delete invite
 */
router.delete(
  '/:id([0-9]+)/invite',
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.params.id) {
      return res.status(400).json({
        message: 'invalid route parameter',
      });
    }
    const eventId = parseInt(req.params.id);

    if (await EventService.userHasEventRole(req.userId!, eventId, ['owner'])) {
      return res.status(400).json({
        message: 'You cannot delete yourself from your event!',
      });
    }

    await EventService.deleteUserEvent(eventId, req.userId!);

    return res.status(200).json();
  })
);

/**
 * Event users
 */
router.get(
  '/:id([0-9]+)/users',
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
        message: 'You are not authorized to access this resource',
      });
    }

    const eventUsers = await UserService.getUsersOfEvent(eventId);

    return res.status(200).json(eventUsers);
  })
);

/**
 * Add user to event
 */
router.post(
  '/:id([0-9]+)/users',
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.params.id) {
      return res.status(400).json({
        message: 'invalid route parameter',
      });
    }
    const eventId = parseInt(req.params.id);

    const body = validator<types.AddEventUserInput>(types.AddEventUserInputSchema, req.body);

    if (!(await EventService.userHasEventRole(req.userId!, eventId, ['owner']))) {
      return res.status(403).json({
        message: 'You are not authorized to access this resource',
      });
    }

    const user = await UserService.findUserByEmail(body.email);

    await EventService.addUserToEvent(eventId, user.id!, body.role);

    return res.status(200).json();
  })
);

/**
 * Update user role for event
 */
router.put(
  '/:id([0-9]+)/users/:userId([0-9]+)',
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.params.id || !req.params.userId) {
      return res.status(400).json({
        message: 'invalid route parameter',
      });
    }
    const eventId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);

    const body = validator<types.UpdateEventUserRoleInput>(
      types.UpdateEventUserRoleInputSchema,
      req.body
    );

    if (!(await EventService.userHasEventRole(req.userId!, eventId, ['owner']))) {
      return res.status(403).json({
        message: 'You are not authorized to access this resource',
      });
    }

    if (req.userId === userId) {
      return res.status(400).json({
        message: 'You cannot update the role for yourself!',
      });
    }

    await EventService.updateUserEventRole(eventId, userId, body.role);

    return res.status(200).json();
  })
);

/**
 * Delete user from event
 */
router.delete(
  '/:id([0-9]+)/users/:userId([0-9]+)',
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.params.id || !req.params.userId) {
      return res.status(400).json({
        message: 'invalid route parameter',
      });
    }
    const eventId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);

    if (!(await EventService.userHasEventRole(req.userId!, eventId, ['owner']))) {
      return res.status(403).json({
        message: 'You are not authorized to access this resource',
      });
    }

    if (req.userId === userId) {
      return res.status(400).json({
        message: 'You cannot delete yourself from your event!',
      });
    }

    await EventService.deleteUserEvent(eventId, userId);

    return res.status(200).json();
  })
);

export default router;
