'use client';

import { useEffect, useState } from 'react';
import type { AgentThread, AttacheAgentContext, User } from '@/types';
import { UserRole } from '@/types';

export function useAgent(user: User | null, context?: AttacheAgentContext) {
  const [thread, setThread] = useState<AgentThread | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadThread() {
      if (!user || user.role !== UserRole.ATTACHE) {
        if (!isCancelled) {
          setThread(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetch('/api/agent/chat', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to load agent thread (${response.status}).`);
        }

        const payload = (await response.json()) as { thread?: AgentThread };
        if (!isCancelled) {
          setThread(payload.thread || null);
        }
      } catch (error) {
        console.error('[AGENT] Failed to hydrate agent thread:', error);
        if (!isCancelled) {
          setThread(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadThread();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  async function sendMessage(message: string) {
    const normalizedMessage = message.trim();
    if (!normalizedMessage || !user || user.role !== UserRole.ATTACHE) {
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId: thread?.id,
          message: normalizedMessage,
          context,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || `Failed to send agent message (${response.status}).`);
      }

      const payload = (await response.json()) as { thread?: AgentThread };
      setThread(payload.thread || null);
    } catch (error) {
      console.error('[AGENT] Failed to send agent message:', error);
      throw error;
    } finally {
      setIsSending(false);
    }
  }

  return {
    thread,
    messages: thread?.messages || [],
    isLoading,
    isSending,
    sendMessage,
  };
}
