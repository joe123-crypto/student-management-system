import { AgentMessageAuthor, Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { recordAuditLog } from '@/lib/auth/store';
import type { AgentChatMessage, AgentThread } from '@/types';

const agentThreadInclude = Prisma.validator<Prisma.AgentThreadInclude>()({
  messages: {
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  },
});

type AgentThreadRow = Prisma.AgentThreadGetPayload<{ include: typeof agentThreadInclude }>;

function toAgentChatMessage(
  record: Pick<AgentThreadRow['messages'][number], 'id' | 'author' | 'content' | 'createdAt'>,
): AgentChatMessage {
  return {
    id: record.id,
    author: record.author === AgentMessageAuthor.ASSISTANT ? 'assistant' : 'user',
    content: record.content,
    createdAt: record.createdAt.toISOString(),
  };
}

function toAgentThread(record: AgentThreadRow): AgentThread {
  return {
    id: record.id,
    title: record.title,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    messages: record.messages.map(toAgentChatMessage),
  };
}

function buildThreadTitle(message: string): string {
  const trimmed = message.trim().replace(/\s+/g, ' ');
  if (!trimmed) {
    return 'Attache Assistant';
  }

  return trimmed.length <= 72 ? trimmed : `${trimmed.slice(0, 69).trimEnd()}...`;
}

function buildEphemeralMessage(author: AgentChatMessage['author'], content: string): AgentChatMessage {
  return {
    id: `ephemeral-${author}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    author,
    content,
    createdAt: new Date().toISOString(),
  };
}

export function buildAttacheAssistantWelcome(): string {
  return [
    'Hello. I can help you review student records, summarize live dashboard scope, and draft communication for attache follow-up.',
    '',
    'Try asking me to:',
    '- summarize the current student scope',
    '- show the next best action',
    '- draft a missing-documents reminder',
  ].join('\n');
}

export function isMissingAgentPersistenceError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2021' &&
    typeof error.meta?.table === 'string' &&
    error.meta.table.includes('Agent')
  );
}

export function buildEphemeralWelcomeThread(): AgentThread {
  const now = new Date().toISOString();
  return {
    id: 'ephemeral-attache-thread',
    title: 'Attache Assistant',
    createdAt: now,
    updatedAt: now,
    messages: [buildEphemeralMessage('assistant', buildAttacheAssistantWelcome())],
  };
}

export function buildEphemeralExchangeThread(params: {
  userMessage: string;
  assistantMessage: string;
}): AgentThread {
  const welcomeThread = buildEphemeralWelcomeThread();
  const userMessage = buildEphemeralMessage('user', params.userMessage.trim());
  const assistantMessage = buildEphemeralMessage('assistant', params.assistantMessage.trim());

  return {
    ...welcomeThread,
    title: buildThreadTitle(params.userMessage),
    updatedAt: assistantMessage.createdAt,
    messages: [...welcomeThread.messages, userMessage, assistantMessage],
  };
}

async function createStarterThread(ownerUserId: string): Promise<AgentThreadRow> {
  return prisma.agentThread.create({
    data: {
      ownerUserId,
      title: 'Attache Assistant',
      messages: {
        create: {
          author: AgentMessageAuthor.ASSISTANT,
          content: buildAttacheAssistantWelcome(),
        },
      },
    },
    include: agentThreadInclude,
  });
}

export async function getLatestAgentThread(ownerUserId: string): Promise<AgentThread | null> {
  const thread = await prisma.agentThread.findFirst({
    where: {
      ownerUserId,
    },
    orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    include: agentThreadInclude,
  });

  return thread ? toAgentThread(thread) : null;
}

export async function getOrCreateLatestAgentThread(ownerUserId: string): Promise<AgentThread> {
  const existing = await getLatestAgentThread(ownerUserId);
  if (existing) {
    return existing;
  }

  const created = await createStarterThread(ownerUserId);
  await recordAuditLog({
    userId: ownerUserId,
    event: 'agent_thread_created',
    metadata: {
      threadId: created.id,
      channel: created.channel,
    },
  });
  return toAgentThread(created);
}

export async function appendAgentExchange(params: {
  ownerUserId: string;
  threadId?: string;
  userMessage: string;
  assistantMessage: string;
  metadata?: Record<string, unknown>;
}): Promise<AgentThread> {
  const normalizedUserMessage = params.userMessage.trim();
  const normalizedAssistantMessage = params.assistantMessage.trim();
  if (!normalizedUserMessage || !normalizedAssistantMessage) {
    throw new Error('Both user and assistant messages are required.');
  }

  const thread = await prisma.$transaction(async (tx) => {
    const existingThread = params.threadId
      ? await tx.agentThread.findFirst({
          where: {
            id: params.threadId,
            ownerUserId: params.ownerUserId,
          },
          include: agentThreadInclude,
        })
      : await tx.agentThread.findFirst({
          where: {
            ownerUserId: params.ownerUserId,
          },
          orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
          include: agentThreadInclude,
        });

    const ensuredThread =
      existingThread ||
      (await tx.agentThread.create({
        data: {
          ownerUserId: params.ownerUserId,
          title: buildThreadTitle(normalizedUserMessage),
        },
        include: agentThreadInclude,
      }));

    await tx.agentThread.update({
      where: { id: ensuredThread.id },
      data: {
        title: ensuredThread.title || buildThreadTitle(normalizedUserMessage),
        updatedAt: new Date(),
      },
    });

    await tx.agentMessage.createMany({
      data: [
        {
          threadId: ensuredThread.id,
          author: AgentMessageAuthor.USER,
          content: normalizedUserMessage,
          metadata: params.metadata ? (params.metadata as Prisma.InputJsonValue) : undefined,
        },
        {
          threadId: ensuredThread.id,
          author: AgentMessageAuthor.ASSISTANT,
          content: normalizedAssistantMessage,
          metadata: params.metadata ? (params.metadata as Prisma.InputJsonValue) : undefined,
        },
      ],
    });

    return tx.agentThread.findUniqueOrThrow({
      where: { id: ensuredThread.id },
      include: agentThreadInclude,
    });
  });

  await recordAuditLog({
    userId: params.ownerUserId,
    event: 'agent_exchange_recorded',
    metadata: {
      threadId: thread.id,
    },
  });

  return toAgentThread(thread);
}
