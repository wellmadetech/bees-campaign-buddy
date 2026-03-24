import app from './app.js';
import { config } from './config/index.js';

const PORT = config.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Environment: ${config.NODE_ENV}`);

  // Start Braze status polling (every 5 min) — lazy import to avoid crashing on DB issues
  if (config.NODE_ENV !== 'test') {
    import('./orchestration/scheduler.js')
      .then(({ startBrazeSyncScheduler }) => startBrazeSyncScheduler())
      .catch((err) => console.error('[Scheduler] Failed to start:', err));
  }
});
