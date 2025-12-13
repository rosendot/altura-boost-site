# Socket.IO Real-Time Updates - Implementation Guide

## Overview

The booster hub now uses Socket.IO for real-time updates, allowing boosters to see available jobs and jobs being taken by other boosters instantly without refreshing the page.

## Architecture

### Server Setup

The Socket.IO server is initialized in [server.js](server.js) as a custom Next.js server. This allows us to maintain a persistent WebSocket connection alongside Next.js API routes.

**Key Files:**
- `server.js` - Custom server with Socket.IO integration
- `src/lib/socket/server.ts` - Socket.IO server utilities (alternative approach)
- `src/lib/socket/emit.ts` - Helper functions to emit events from API routes

### Client Setup

The client connects to the Socket.IO server using a custom React hook.

**Key Files:**
- `src/hooks/useSocket.ts` - React hook for Socket.IO client connection
- `src/app/hub/page.tsx` - Booster hub page with real-time updates

## Events

### Server → Client Events

1. **`job-accepted`**
   - Emitted when a booster accepts a job
   - Payload: `{ jobId: string, boosterId: string }`
   - Effect: Removes the job from all boosters' available job lists

2. **`new-job`**
   - Emitted when a new job is created
   - Payload: `Job` object
   - Effect: Adds the new job to all boosters' available job lists

3. **`job-update`**
   - Emitted when a job is updated
   - Payload: `Job` object
   - Effect: Updates the job in all boosters' available job lists

### Client → Server Events

1. **`join-booster-hub`**
   - Emitted when a booster connects to join the hub room
   - Effect: Adds the socket to the 'booster-hub' room

## Running the Application

### Development

```bash
npm run dev
```

This starts the custom Node.js server with Socket.IO on port 3000.

### Production

```bash
npm run build
npm start
```

## How to Emit Events from API Routes

Use the helper functions in `src/lib/socket/emit.ts`:

```typescript
import { emitJobAccepted, emitNewJob, emitJobUpdate } from '@/lib/socket/emit';

// When a job is accepted
emitJobAccepted(jobId, boosterId);

// When a new job is created (e.g., from Stripe webhook)
emitNewJob(newJob);

// When a job is updated
emitJobUpdate(updatedJob);
```

### Example: Emitting New Job Event from Stripe Webhook

```typescript
// In src/app/api/webhooks/stripe/route.ts
import { emitNewJob } from '@/lib/socket/emit';

// After creating jobs in the database
const { data: newJobs } = await supabase
  .from('jobs')
  .insert([...])
  .select();

// Emit event for each new job
newJobs?.forEach(job => {
  emitNewJob(job);
});
```

## Client Usage

The booster hub page automatically connects to Socket.IO and listens for events:

```typescript
const {
  isConnected,
  joinBoosterHub,
  onJobUpdate,
  onJobAccepted,
  onNewJob,
} = useSocket();

useEffect(() => {
  if (isConnected) {
    joinBoosterHub();

    onNewJob((job) => {
      // Add job to list
      setJobs(prev => [job, ...prev]);
    });

    onJobAccepted(({ jobId }) => {
      // Remove job from list
      setJobs(prev => prev.filter(j => j.id !== jobId));
    });
  }
}, [isConnected]);
```

## Features

✅ Real-time job updates across all connected boosters
✅ Connection status indicator (green = connected, red = connecting)
✅ Automatic reconnection on disconnect
✅ Room-based broadcasting (only boosters in the hub receive updates)
✅ Clean event listener management (proper cleanup on unmount)

## Testing

1. Open the booster hub in two different browser windows/tabs
2. Accept a job in one window
3. The job should immediately disappear from the other window
4. Check the connection status indicator (top right of the page)

## Environment Variables

For production, set:
- `NEXT_PUBLIC_APP_URL` - Your production URL for CORS configuration

## Notes

- The Socket.IO path is `/api/socket` (configured in both server and client)
- Events are broadcast to the `booster-hub` room only
- The connection uses WebSocket with polling fallback for compatibility
- The custom server is required because Next.js API routes are stateless and don't support persistent WebSocket connections
