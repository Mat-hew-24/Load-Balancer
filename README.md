# Load Balancer

A demonstration load balancer with round-robin distribution, health checks, and auto-scaling capabilities. Built with Node.js and Next.js for visualization.

## Features

- **Round Robin Load Balancing** - Distributes incoming requests evenly across healthy backend servers
- **Health Checks** - Periodically monitors server health and removes unhealthy servers from the pool
- **Auto-Scaling** - Automatically restarts overloaded servers based on request thresholds
- **Real-Time Dashboard** - Next.js frontend displaying live server stats, request counts, and health status
- **Cooldown Management** - Prevents rapid restart cycles with configurable cooldown periods

## Architecture

```
Client → nginx (port 80) → Load Balancer (port 8080) → Backend Servers (ports 5001-5005)
                                      ↓
                              Next.js Dashboard (port 3000)
```

nginx acts as a reverse proxy, receiving client requests on port 80 and forwarding them to the load balancer on port 8080. The load balancer then distributes requests across the backend servers.

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

```bash
npm install
```

### Running the Application

```bash
npm run dev
```

This starts:

- Next.js dashboard on `http://localhost:3000`
- Load balancer on `http://localhost:8080`
- 5 backend servers on ports 5001-5005

## Configuration

### Backend Servers

Edit `app/scripts/config.json` to add, remove, or modify backend servers.

### Auto-Scaling Parameters

Edit `app/scripts/config.js` to configure:

| Parameter               | Default | Description                                     |
| ----------------------- | ------- | ----------------------------------------------- |
| `REQUEST_THRESHOLD`     | 2       | Requests per interval before a server is killed |
| `RESTART_DELAY`         | 15000ms | Cooldown before restarting a killed server      |
| `STATS_INTERVAL`        | 1000ms  | How often request stats are evaluated           |
| `HEALTH_CHECK_INTERVAL` | 2000ms  | How often server health is checked              |

## Making This Demo Production-Ready

To convert this demo into a viable production load balancer:

1. **Increase Request Threshold** - The current threshold of 2 requests/second is intentionally low for demo purposes. For production, set `REQUEST_THRESHOLD` to a value appropriate for your server capacity (e.g., 1000-10000+ depending on your infrastructure).

2. **Adjust Restart Delay** - The 15-second cooldown is set for demo visibility. In production, consider shorter delays (2-5 seconds) for faster recovery, or implement exponential backoff for repeated failures.

3. **Reduce Stats Interval** - While 1 second works for demos, production systems may benefit from shorter intervals (100-500ms) for more responsive scaling decisions.

4. **Health Check Tuning** - Decrease `HEALTH_CHECK_INTERVAL` for faster failure detection in production environments. Add more sophisticated health endpoints that verify actual service functionality.

5. **Replace Backend Servers** - Point to your actual application servers in `config.json` with their real hosts and ports instead of localhost.

6. **Add Persistence** - Implement session persistence/sticky sessions if your application requires it.

7. **Enable HTTPS** - Use the nginx configuration provided or add TLS termination at the load balancer level.

8. **Horizontal Scaling** - Add more backend servers to `config.json` to handle increased load.
