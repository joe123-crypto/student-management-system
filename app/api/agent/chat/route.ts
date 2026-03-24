import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '@/auth.config';
import { buildAttacheAgentReply } from '@/lib/agent/reply';
import {
  appendAgentExchange,
  buildEphemeralExchangeThread,
  buildEphemeralWelcomeThread,
  getOrCreateLatestAgentThread,
  isMissingAgentPersistenceError,
} from '@/lib/agent/store';
import { listAnnouncements } from '@/lib/announcements/store';
import { listPermissionRequests } from '@/lib/permission-requests/store';
import { listStudentProfiles } from '@/lib/students/store';
import type { AttacheAgentContext } from '@/types';
import { UserRole } from '@/types';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

function normalizeContext(value: unknown): AttacheAgentContext | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const context = value as Partial<AttacheAgentContext>;
  const filteredStudentIds = Array.isArray(context.filteredStudentIds)
    ? context.filteredStudentIds.filter((entry): entry is string => typeof entry === 'string')
    : [];
  const selectedStudentIds = Array.isArray(context.selectedStudentIds)
    ? context.selectedStudentIds.filter((entry): entry is string => typeof entry === 'string')
    : [];

  return {
    filteredStudentIds,
    selectedStudentIds,
    searchQuery: typeof context.searchQuery === 'string' ? context.searchQuery : '',
    statusFilter: typeof context.statusFilter === 'string' ? context.statusFilter : 'ALL',
    university: typeof context.university === 'string' ? context.university : 'ALL',
    program: typeof context.program === 'string' ? context.program : 'ALL',
    duplicatesOnly: context.duplicatesOnly === true,
  };
}

export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.role || !session.user.id) {
    return unauthorized();
  }

  if (session.user.role !== UserRole.ATTACHE) {
    return forbidden();
  }

  try {
    const thread = await getOrCreateLatestAgentThread(session.user.id);
    return NextResponse.json({ thread });
  } catch (error) {
    if (isMissingAgentPersistenceError(error)) {
      return NextResponse.json({
        thread: buildEphemeralWelcomeThread(),
        persistenceAvailable: false,
      });
    }

    console.error('[AGENT] Failed to load latest thread:', error);
    return NextResponse.json({ error: 'Failed to load assistant thread.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  let parsedMessage = '';
  let parsedThreadId: string | undefined;
  let parsedContext: AttacheAgentContext | undefined;

  if (!session?.user?.role || !session.user.id) {
    return unauthorized();
  }

  if (session.user.role !== UserRole.ATTACHE) {
    return forbidden();
  }

  try {
    const body = (await request.json()) as {
      threadId?: unknown;
      message?: unknown;
      context?: unknown;
    };

    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const threadId = typeof body.threadId === 'string' ? body.threadId : undefined;
    const context = normalizeContext(body.context);
    parsedMessage = message;
    parsedThreadId = threadId;
    parsedContext = context;

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    const [students, announcements, permissionRequests] = await Promise.all([
      listStudentProfiles(),
      listAnnouncements(),
      listPermissionRequests(),
    ]);

    const reply = buildAttacheAgentReply({
      prompt: message,
      students,
      announcements,
      permissionRequests,
      context,
    });

    const thread = await appendAgentExchange({
      ownerUserId: session.user.id,
      threadId: parsedThreadId,
      userMessage: message,
      assistantMessage: reply.content,
      metadata: {
        ...(reply.metadata || {}),
        context,
      },
    });

    return NextResponse.json({ thread });
  } catch (error) {
    if (isMissingAgentPersistenceError(error)) {
      if (!parsedMessage) {
        return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
      }

      const [students, announcements, permissionRequests] = await Promise.all([
        listStudentProfiles(),
        listAnnouncements(),
        listPermissionRequests(),
      ]);

      const fallbackReply = buildAttacheAgentReply({
        prompt: parsedMessage,
        students,
        announcements,
        permissionRequests,
        context: parsedContext,
      });

      return NextResponse.json({
        thread: buildEphemeralExchangeThread({
          userMessage: parsedMessage,
          assistantMessage: fallbackReply.content,
        }),
        persistenceAvailable: false,
      });
    }

    console.error('[AGENT] Failed to process chat message:', error);
    return NextResponse.json({ error: 'Failed to process assistant message.' }, { status: 500 });
  }
}
