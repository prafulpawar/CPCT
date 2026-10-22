import { Router } from 'express';
import { getStudentDashboard, getLeaderboard } from '../controllers/analyticsController.ts';

const router = Router();

router.get('/dashboard', getStudentDashboard);
router.get('/leaderboard', getLeaderboard);

export default router;
