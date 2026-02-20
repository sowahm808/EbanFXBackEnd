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
const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    }
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(publicRoutes);
app.use(webhookRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use(requireAuth);
app.use(userRoutes);
app.use(requireRole('admin', 'compliance'), adminRoutes);

app.use(errorHandler);

export default app;
