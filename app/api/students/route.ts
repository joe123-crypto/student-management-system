import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '@/auth.config';
import { deleteStudentProfiles, importStudentProfiles, listStudentProfiles } from '@/lib/students/store';
import type { StudentProfile } from '@/types';
import { UserRole } from '@/types';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.role) {
    return unauthorized();
  }

  if (session.user.role !== UserRole.ATTACHE) {
    return forbidden();
  }

  try {
    const students = await listStudentProfiles();
    return NextResponse.json({ students });
  } catch (error) {
    console.error('[STUDENTS] Failed to list student profiles:', error);
    return NextResponse.json({ error: 'Failed to load students.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.role) {
    return unauthorized();
  }

  if (session.user.role !== UserRole.ATTACHE) {
    return forbidden();
  }

  try {
    const body = (await request.json()) as {
      mode?: 'append' | 'replace';
      records?: unknown[];
    };

    if (!Array.isArray(body.records) || (body.mode !== 'append' && body.mode !== 'replace')) {
      return NextResponse.json({ error: 'Invalid import payload.' }, { status: 400 });
    }

    const students = await importStudentProfiles(body.records as StudentProfile[], body.mode);
    return NextResponse.json({ students });
  } catch (error) {
    console.error('[STUDENTS] Failed to import student profiles:', error);
    return NextResponse.json({ error: 'Failed to import students.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.role) {
    return unauthorized();
  }

  if (session.user.role !== UserRole.ATTACHE) {
    return forbidden();
  }

  try {
    const body = (await request.json()) as { ids?: unknown[] };
    const ids = Array.isArray(body.ids) ? body.ids.filter((id): id is string => typeof id === 'string') : [];

    await deleteStudentProfiles(ids);
    return NextResponse.json({ deletedIds: ids });
  } catch (error) {
    console.error('[STUDENTS] Failed to delete student profiles:', error);
    return NextResponse.json({ error: 'Failed to delete students.' }, { status: 500 });
  }
}
