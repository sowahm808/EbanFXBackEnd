import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { requireAuth } from './middleware/auth';
import { requireRole } from './middleware/role';
import { errorHandler } from './middleware/error';
import { publicRoutes } from './routes/publicRoutes';
import { userRoutes } from './routes/userRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { webhookRoutes } from './routes/webhookRoutes';
import { openApiSpec } from './docs/openapi';

const app = express();
app.use(cors());
app.use(express.json());

app.use(publicRoutes);
app.use(webhookRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use(requireAuth);
app.use(userRoutes);
app.use(requireRole('admin', 'compliance'), adminRoutes);

app.use(errorHandler);

export default app;
