'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, SendHorizontal, ShieldCheck, Sparkles, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAgent } from '@/components/shell/domains/agent/useAgent';
import type { AttacheAgentContext, User } from '@/types';
import { UserRole } from '@/types';

const quickActions = [
  "Summarize the students I'm viewing",
  'Summarize recent updates',
  'Show next best action',
  'Draft a missing-documents reminder',
];

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function AssistantMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="mb-3 mt-6 text-[1.35rem] font-black leading-tight text-[color:var(--theme-text)] first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-3 mt-5 text-[1.2rem] font-black leading-tight text-[color:var(--theme-text)] first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-2 mt-5 text-[1.05rem] font-bold leading-tight text-[color:var(--theme-text)] first:mt-0">
            {children}
          </h3>
        ),
        p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="mb-4 list-disc space-y-2 pl-6 last:mb-0">{children}</ul>,
        ol: ({ children }) => <ol className="mb-4 list-decimal space-y-2 pl-6 last:mb-0">{children}</ol>,
        li: ({ children }) => <li className="pl-1">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="mb-4 border-l-4 border-[color:rgba(160,58,19,0.28)] pl-4 italic text-[color:var(--theme-text-muted)] last:mb-0">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="font-semibold text-[color:var(--theme-primary-soft)] underline decoration-[rgba(160,58,19,0.35)] underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            {children}
          </a>
        ),
        code: ({ children, className }) => {
          const isBlock = Boolean(className);

          if (isBlock) {
            return (
              <code className="block overflow-x-auto rounded-2xl bg-[rgba(37,79,34,0.08)] px-4 py-3 font-mono text-[0.92rem] leading-7 text-[color:var(--theme-text)]">
                {children}
              </code>
            );
          }

          return (
            <code className="rounded-md bg-[rgba(37,79,34,0.08)] px-1.5 py-1 font-mono text-[0.92em] text-[color:var(--theme-primary)]">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <pre className="mb-4 last:mb-0">{children}</pre>,
        strong: ({ children }) => <strong className="font-black text-[color:var(--theme-text)]">{children}</strong>,
        em: ({ children }) => <em className="italic text-[color:var(--theme-text)]">{children}</em>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function FloatingChatWidget({
  role,
  user,
  context,
}: {
  role: UserRole;
  user: User | null;
  context?: AttacheAgentContext;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const { messages, isLoading, isSending, sendMessage } = useAgent(user, context);

  const title = useMemo(
    () => (role === UserRole.ATTACHE ? 'Attache Support' : 'Student Support'),
    [role],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    const node = scrollContainerRef.current;

    if (!node) {
      return;
    }

    node.scrollTo({
      top: node.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, pendingMessage, isSending, isOpen]);

  async function handleSend(nextContent: string) {
    const trimmedContent = nextContent.trim();

    if (!trimmedContent || isSending) {
      return;
    }

    setDraft('');
    setPendingMessage(trimmedContent);

    try {
      await sendMessage(trimmedContent);
    } catch (error) {
      console.error('[AGENT] Failed to send widget message:', error);
    } finally {
      setPendingMessage(null);
    }
  }

  return (
    <>
      <div
        className={`theme-overlay fixed inset-0 z-30 transition-opacity duration-300 ${
          isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 right-0 z-40 w-full max-w-[26rem] transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="theme-card relative flex h-full flex-col border-l border-[color:var(--theme-border)] bg-[color:rgba(252,248,234,0.96)] shadow-[0_32px_70px_rgba(37,79,34,0.16)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(245,130,74,0.22),transparent_62%)]" />

          <div className="relative flex items-start justify-between gap-4 border-b border-[color:rgba(220,205,166,0.72)] px-5 py-5 sm:px-6">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[color:rgba(160,58,19,0.2)] bg-[color:rgba(255,255,255,0.65)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-[color:var(--theme-primary-soft)]">
                <Sparkles className="h-3.5 w-3.5" />
                Assistant
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="theme-card-muted inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition hover:border-[color:var(--theme-primary-soft)] hover:text-[color:var(--theme-primary-soft)]"
              aria-label="Close chat panel"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative border-b border-[color:rgba(220,205,166,0.6)] px-5 py-4 sm:px-6">
              <div className="theme-card-muted flex items-start gap-3 rounded-[1.5rem] border px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--theme-primary)] text-white shadow-[0_16px_30px_-16px_rgba(37,79,34,0.7)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="theme-heading text-sm font-bold">Private and secure</p>
                <p className="theme-text-muted mt-1 text-xs leading-5">
                  Ask for summaries, recent updates, or message drafts based on the student records you can access.
                </p>
              </div>
            </div>
          </div>

          <div ref={scrollContainerRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="theme-text-muted text-center text-[11px] font-bold uppercase tracking-[0.22em]">
              Start a conversation
            </div>

            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => {
                    void handleSend(action);
                  }}
                  className="theme-card-muted rounded-full border px-3 py-2 text-xs font-bold text-[color:var(--theme-primary)] transition hover:border-[color:var(--theme-primary-soft)] hover:text-[color:var(--theme-primary-soft)]"
                >
                  {action}
                </button>
              ))}
            </div>

            {isLoading && messages.length === 0 ? (
              <div className="flex justify-start">
                <div className="theme-card-muted inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm text-[color:var(--theme-text-muted)]">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[color:var(--theme-primary-soft)]" />
                  Loading assistant thread...
                </div>
              </div>
            ) : null}

            {messages.map((message) => {
              const isUser = message.author === 'user';
              const sentAt = formatMessageTime(message.createdAt);

              if (!isUser) {
                return (
                  <div key={message.id} className="w-full px-1 py-1">
                    <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[color:var(--theme-primary)]">
                      <Bot className="h-3.5 w-3.5" />
                      <span>Assistant</span>
                      <span className="h-1 w-1 rounded-full bg-current/60" />
                      <span className="theme-text-muted">{sentAt}</span>
                    </div>
                    <div className="theme-text-muted max-w-none text-[1.05rem] leading-9">
                      <AssistantMarkdown content={message.content} />
                    </div>
                  </div>
                );
              }

              return (
                <div key={message.id} className="flex justify-end">
                  <div
                    className="max-w-[85%] rounded-[1.6rem] border border-[color:rgba(160,58,19,0.18)] bg-[color:var(--theme-primary-soft)] px-4 py-3 text-white shadow-[0_18px_36px_-30px_rgba(37,79,34,0.7)]"
                  >
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em]">
                      <span>You</span>
                      <span className="h-1 w-1 rounded-full bg-current/60" />
                      <span className="text-white/75">{sentAt}</span>
                    </div>
                    <p className="text-sm leading-6 text-white">{message.content}</p>
                  </div>
                </div>
              );
            })}

            {pendingMessage ? (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-[1.6rem] border border-[color:rgba(160,58,19,0.18)] bg-[color:var(--theme-primary-soft)] px-4 py-3 text-white shadow-[0_18px_36px_-30px_rgba(37,79,34,0.7)] opacity-80">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em]">
                    <span>You</span>
                  </div>
                  <p className="text-sm leading-6 text-white">{pendingMessage}</p>
                </div>
              </div>
            ) : null}

            {isSending ? (
              <div className="flex justify-start">
                <div className="theme-card-muted inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm text-[color:var(--theme-text-muted)]">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[color:var(--theme-primary-soft)]" />
                  Assistant is replying...
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-[color:rgba(220,205,166,0.72)] px-5 py-4 sm:px-6">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void handleSend(draft);
              }}
            >
              <div className="theme-card-muted flex items-end gap-3 rounded-[1.75rem] border p-2.5">
                <textarea
                  rows={2}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Type your message here..."
                  className="theme-input min-h-[3.5rem] flex-1 resize-none rounded-[1.25rem] border-0 bg-transparent px-3 py-2.5 text-sm outline-none focus:shadow-none"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || isSending}
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--theme-primary)] text-white shadow-[0_18px_30px_-18px_rgba(37,79,34,0.9)] transition hover:bg-[color:var(--theme-primary-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send message"
                >
                  <SendHorizontal className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-5 right-5 z-30 inline-flex h-16 w-16 items-center justify-center rounded-[1.6rem] border border-[color:rgba(160,58,19,0.2)] bg-[linear-gradient(145deg,var(--theme-card),color-mix(in_srgb,var(--theme-surface)_38%,white))] text-[color:var(--theme-primary)] shadow-[0_24px_40px_-18px_rgba(37,79,34,0.55)] transition duration-300 hover:-translate-y-1 hover:border-[color:var(--theme-primary-soft)] hover:text-[color:var(--theme-primary-soft)] ${
          isOpen ? 'pointer-events-none translate-y-2 opacity-0' : 'translate-y-0 opacity-100'
        }`}
        aria-label="Open assistant"
      >
        <div className="absolute inset-0 rounded-[1.6rem] bg-[radial-gradient(circle_at_top,rgba(245,130,74,0.28),transparent_60%)]" />
        <div className="relative flex flex-col items-center gap-1">
          <Bot className="h-7 w-7" />
          <span className="text-[8px] font-black uppercase tracking-[0.22em]">Assistant</span>
        </div>
      </button>
    </>
  );
}
