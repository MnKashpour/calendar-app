import express from 'express';

import { userRouter } from './modules/user';
import { authRouter } from './modules/auth';
import { eventRouter } from './modules/event';
import { calendarRouter } from './modules/calendar';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/events', eventRouter);
router.use('/calendars', calendarRouter);

export default router;
