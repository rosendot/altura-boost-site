import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client for broadcasting
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

interface Job {
  id: string;
  job_number: string;
  service_name: string;
  game_name: string;
  payout_amount: number;
  estimated_hours: number;
  requirements: string;
  weapon_class: string | null;
  created_at: string;
  status: string;
}

export async function broadcastNewJob(job: Job) {
  const channel = supabase.channel('booster-hub');

  await channel.send({
    type: 'broadcast',
    event: 'new-job',
    payload: job,
  });

  return channel;
}

export async function broadcastJobAccepted(jobId: string) {
  const channel = supabase.channel('booster-hub');

  await channel.send({
    type: 'broadcast',
    event: 'job-accepted',
    payload: { jobId },
  });

  return channel;
}

export async function broadcastJobUpdate(job: Job) {
  const channel = supabase.channel('booster-hub');

  await channel.send({
    type: 'broadcast',
    event: 'job-update',
    payload: job,
  });

  return channel;
}
