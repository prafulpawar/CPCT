import { Router } from 'express';
import {
  getMockTests,
  getMockTestById,
  submitMockTest,
  getTestSubmissions,
  getSubmissionReview,
} from '../controllers/mockTestController.ts';

const router = Router();

router.get('/', getMockTests);
router.get('/:id', getMockTestById);
router.post('/:id/submit', submitMockTest);
router.get('/user/submissions', getTestSubmissions);
router.get('/submission/:id/review', getSubmissionReview);

export default router;
