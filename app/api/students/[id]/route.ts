import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '@/auth.config';
import { ensureStudentProfileForIdentity, findStudentProfileById, updateStudentProfile } from '@/lib/students/store';
import type { StudentProfile } from '@/types';
import { UserRole } from '@/types';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    if (session.user.role === UserRole.STUDENT) {
      if (!session.user.loginId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const currentStudent = await ensureStudentProfileForIdentity({
        id: session.user.id,
        loginId: session.user.loginId,
        role: session.user.role,
      });

      if (!currentStudent || currentStudent.id !== id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (session.user.role !== UserRole.ATTACHE) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existing = await findStudentProfileById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Student profile not found.' }, { status: 404 });
    }

    const body = (await request.json()) as { patch?: unknown };
    if (!body.patch || typeof body.patch !== 'object') {
      return NextResponse.json({ error: 'Invalid student patch.' }, { status: 400 });
    }

    const student = await updateStudentProfile(id, body.patch as Partial<StudentProfile>);
    return NextResponse.json({ student });
  } catch (error) {
    console.error('[STUDENTS] Failed to update student profile:', error);
    return NextResponse.json({ error: 'Failed to update student profile.' }, { status: 500 });
  }
}
