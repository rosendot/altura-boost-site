// Helper functions to emit Socket.IO events from API routes

declare global {
  var io: any;
}

export function emitJobAccepted(jobId: string, boosterId: string) {
  if (global.io) {
    global.io.to('booster-hub').emit('job-accepted', {
      jobId,
      boosterId,
    });
    console.log('Socket.IO: Emitted job-accepted event for job:', jobId);
  } else {
    console.warn('Socket.IO: io instance not available');
  }
}

export function emitNewJob(job: any) {
  if (global.io) {
    global.io.to('booster-hub').emit('new-job', job);
    console.log('Socket.IO: Emitted new-job event for job:', job.id);
  } else {
    console.warn('Socket.IO: io instance not available');
  }
}

export function emitJobUpdate(job: any) {
  if (global.io) {
    global.io.to('booster-hub').emit('job-update', job);
    console.log('Socket.IO: Emitted job-update event for job:', job.id);
  } else {
    console.warn('Socket.IO: io instance not available');
  }
}
