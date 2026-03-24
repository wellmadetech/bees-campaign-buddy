import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { config } from './config/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: config.NODE_ENV === 'production' ? true : 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan(config.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

// API routes
app.use('/api', routes);

// Serve client in production
if (config.NODE_ENV === 'production') {
  // __dirname is apps/server/dist/ in compiled output
  // client dist is at apps/client/dist/ — so go up to apps/, then into client/dist
  const clientDist = path.resolve(__dirname, '../../client/dist');
  console.log(`[Static] Serving client from: ${clientDist}`);
  app.use(express.static(clientDist));
  app.get('*', (_req, res, next) => {
    const indexPath = path.join(clientDist, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) next(err);
    });
  });
}

app.use(errorHandler);

export default app;
