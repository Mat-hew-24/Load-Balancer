// Auto-scaling configuration
export const AUTO_SCALING_CONFIG = {
  // Threshold for requests per second before killing a server
  REQUEST_THRESHOLD: 3,

  // Cooldown period in milliseconds before restarting a killed server
  RESTART_DELAY: 15000,

  // Stats update interval in milliseconds
  STATS_INTERVAL: 1000,

  // Health check interval in milliseconds
  HEALTH_CHECK_INTERVAL: 2000,
}
