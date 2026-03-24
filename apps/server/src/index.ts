import app from './app.js';
import { config } from './config/index.js';
import { startBrazeSyncScheduler } from './orchestration/scheduler.js';

app.listen(config.PORT, () => {
  console.log(`Server running on http://localhost:${config.PORT}`);
  console.log(`Health check: http://localhost:${config.PORT}/api/health`);

  // Start Braze status polling (every 5 min)
  if (config.NODE_ENV !== 'test') {
    startBrazeSyncScheduler();
  }
});
