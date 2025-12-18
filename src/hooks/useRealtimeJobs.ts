import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

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

export function useRealtimeJobs() {
  const [isConnected, setIsConnected] = useState(false);
  const [activeBoostersCount, setActiveBoostersCount] = useState(0);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Create a channel for the booster hub
    const boosterChannel = supabase.channel('booster-hub', {
      config: {
        presence: {
          key: 'booster-presence',
        },
      },
    });

    // Subscribe to presence - track active boosters
    boosterChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = boosterChannel.presenceState();
        const count = Object.keys(presenceState).length;
        setActiveBoostersCount(count);
      })
      .on('presence', { event: 'join' }, () => {
        const presenceState = boosterChannel.presenceState();
        const count = Object.keys(presenceState).length;
        setActiveBoostersCount(count);
      })
      .on('presence', { event: 'leave' }, () => {
        const presenceState = boosterChannel.presenceState();
        const count = Object.keys(presenceState).length;
        setActiveBoostersCount(count);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          // Track this booster's presence
          await boosterChannel.track({
            online_at: new Date().toISOString(),
          });
        } else if (status === 'CLOSED') {
          setIsConnected(false);
        }
      });

    setChannel(boosterChannel);

    // Cleanup on unmount
    return () => {
      boosterChannel.unsubscribe();
      setIsConnected(false);
    };
  }, []);

  // Listen for new jobs via broadcast
  const onNewJob = useCallback((callback: (job: Job) => void) => {
    if (!channel) return;

    channel.on('broadcast', { event: 'new-job' }, (payload) => {
      callback(payload.payload as Job);
    });
  }, [channel]);

  // Listen for job accepted events via broadcast
  const onJobAccepted = useCallback((callback: (data: { jobId: string }) => void) => {
    if (!channel) return;

    channel.on('broadcast', { event: 'job-accepted' }, (payload) => {
      callback(payload.payload as { jobId: string });
    });
  }, [channel]);

  // Listen for job updates via broadcast
  const onJobUpdate = useCallback((callback: (job: Job) => void) => {
    if (!channel) return;

    channel.on('broadcast', { event: 'job-update' }, (payload) => {
      callback(payload.payload as Job);
    });
  }, [channel]);

  return {
    isConnected,
    activeBoostersCount,
    onNewJob,
    onJobAccepted,
    onJobUpdate,
    channel,
  };
}
