const cron = require('node-cron');
const ingestionService = require('./ingestionService');

class SchedulerService {
  init() {
    // Schedule ingestion every 4 hours (00:00, 04:00, 08:00, 12:00, 16:00, 20:00)
    cron.schedule('0 */4 * * *', async () => {
      console.log('[Scheduler] Executing scheduled 4-hour RSS & Google News ingestion...');
      try {
        await ingestionService.runPipeline();
      } catch (err) {
        console.error('[Scheduler] Ingestion error:', err.message);
      }
    });

    console.log('✓ Ingestion cron scheduler active (Interval: Every 4 hours)');
  }
}

module.exports = new SchedulerService();
