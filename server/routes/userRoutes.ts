import { Router } from 'express';
import { getCurrentUser, getAllUsers, updateUserProfile } from '../controllers/userController.ts';

const router = Router();

router.get('/current', getCurrentUser);
router.get('/all', getAllUsers);
router.put('/profile', updateUserProfile);

export default router;
