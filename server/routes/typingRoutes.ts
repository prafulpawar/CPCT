import { Router } from 'express';
import {
  getPassages,
  getPassageById,
  submitTypingResult,
  getTypingHistory,
  getTypingAnalytics,
} from '../controllers/typingController.ts';

const router = Router();

router.get('/passages', getPassages);
router.get('/passages/:id', getPassageById);
router.post('/submit', submitTypingResult);
router.get('/history', getTypingHistory);
router.get('/analytics', getTypingAnalytics);

export default router;
