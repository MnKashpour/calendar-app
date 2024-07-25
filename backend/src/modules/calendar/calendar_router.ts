import express, { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../utils/async_handler';
import CalendarService from './calendar_service';
import { protect } from '../../middleware/auth';
import { validator } from '../../utils/validator';
import * as types from './calendar_types';

const router = express.Router();

/**
 * Get all calendars that the user have access to
 */
router.get(
  '/',
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const calendars = await CalendarService.getAllCalendarsForUser(req.userId!);

    return res.status(200).json(calendars);
  })
);

/**
 * Get specific calendar by id
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

    const calendar = await CalendarService.getCalendarByIdForUser(req.userId!, +req.params.id);

    return res.status(200).json(calendar);
  })
);

/**
 * Get all events for a calendar in a specific month
 */
router.get(
  '/:id([0-9]+)/events',
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.params.id) {
      return res.status(400).json({
        message: 'invalid route parameter',
      });
    }
    const calendarId = +req.params.id;

    const body = validator<types.CalendarEventMonthFilter>(
      types.CalendarEventMonthFilterSchema,
      req.query as any
    );

    const { calendar, events } = await CalendarService.getAllMonthEventsInCalendarForUser(
      req.userId!,
      calendarId,
      body
    );

    return res.status(200).json({
      calendar,
      events,
    });
  })
);

/**
 * Create Calendar
 */
// router.post(
//   '/',
//   protect,
//   asyncHandler(async (req: Request, res: Response) => {
//     const body = validator<types.CalendarInput>(types.CalendarInputSchema, req.body);

//     const calendarId = await CalendarService.createCalendarForUser(req.userId!, body);

//     return res.status(201).json({
//       id: calendarId,
//     });
//   })
// );

/**
 * Update specific calendar by id
 */
// router.put(
//   '/:id([0-9]+)',
//   protect,
//   asyncHandler(async (req: Request, res: Response) => {
//     if (!req.params.id) {
//       return res.status(400).json({
//         message: 'invalid route parameter',
//       });
//     }
//     const calendarId = +req.params.id;

//     const body = validator<types.CalendarInput>(types.CalendarInputSchema, req.body);

//     if (!(await CalendarService.userHasCalendarRole(req.userId!, calendarId, ['owner']))) {
//       return res.status(403).json({
//         message: 'You are not authorized to do this action',
//       });
//     }

//     await CalendarService.updateCalendar(calendarId, body);

//     return res.status(201).json({
//       message: 'Updated Successfully',
//     });
//   })
// );

/**
 * Delete calendar
 */
// router.delete(
//   '/:id([0-9]+)',
//   protect,
//   asyncHandler(async (req: Request, res: Response) => {
//     if (!req.params.id) {
//       return res.status(400).json({
//         message: 'invalid route parameter',
//       });
//     }
//     const calendarId = +req.params.id;

//     if (!(await CalendarService.userHasCalendarRole(req.userId!, calendarId, ['owner']))) {
//       return res.status(403).json({
//         message: 'You are not authorized to do this action',
//       });
//     }

//     await CalendarService.deleteCalendar(req.userId!, calendarId);

//     return res.status(201).json({
//       message: 'Updated Successfully',
//     });
//   })
// );

export default router;
