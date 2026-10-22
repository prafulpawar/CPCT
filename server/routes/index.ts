import { Router } from 'express';
import typingRoutes from './typingRoutes.ts';
import mockTestRoutes from './mockTestRoutes.ts';
import analyticsRoutes from './analyticsRoutes.ts';
import userRoutes from './userRoutes.ts';

const apiRouter = Router();

apiRouter.use('/typing', typingRoutes);
apiRouter.use('/mock-tests', mockTestRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/users', userRoutes);

export default apiRouter;
