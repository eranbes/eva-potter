'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@/components/providers/UserProvider';
import SnitchOverlay from './SnitchOverlay';

interface SnitchState {
  active: boolean;
  eventId?: number;
  expiresAt?: string;
  rewardPoints?: number;
}

const SnitchContext = createContext<null>(null);

export function SnitchProvider({ children }: { children: React.ReactNode }) {
  const { user, refreshUser } = useUser();
  const [snitchState, setSnitchState] = useState<SnitchState | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const lastSeenEventRef = useRef<number | null>(null);

  // Poll for snitch status
  useEffect(() => {
    if (!user) return;

    let active = true;

    const poll = async () => {
      try {
        const res = await fetch('/api/snitch/status');
        if (!res.ok) return;
        const data = await res.json();

        if (!active) return;

        if (data.active && data.eventId && data.eventId !== lastSeenEventRef.current) {
          setSnitchState({
            active: true,
            eventId: data.eventId,
            expiresAt: data.expiresAt,
            rewardPoints: data.rewardPoints,
          });
          setShowOverlay(true);
          lastSeenEventRef.current = data.eventId;
        }
      } catch {
        // Silently fail — next poll will retry
      }
    };

    poll();
    const interval = setInterval(poll, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user]);

  const handleClaim = useCallback(
    async (eventId: number) => {
      const res = await fetch('/api/snitch/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      const data = await res.json();

      if (data.success) {
        await refreshUser();
      }

      return data;
    },
    [refreshUser]
  );

  const handleDismiss = useCallback(() => {
    setShowOverlay(false);
    setSnitchState(null);
  }, []);

  return (
    <SnitchContext.Provider value={null}>
      {children}
      {showOverlay && snitchState?.active && snitchState.eventId && snitchState.expiresAt && (
        <SnitchOverlay
          eventId={snitchState.eventId}
          expiresAt={snitchState.expiresAt}
          rewardPoints={snitchState.rewardPoints!}
          onClaim={handleClaim}
          onDismiss={handleDismiss}
        />
      )}
    </SnitchContext.Provider>
  );
}
