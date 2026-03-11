import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '@/auth.config';
import { ensureStudentProfileForIdentity } from '@/lib/students/store';
import { UserRole } from '@/types';

export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.role || !session.user.loginId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== UserRole.STUDENT) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const student = await ensureStudentProfileForIdentity({
      id: session.user.id,
      loginId: session.user.loginId,
      role: session.user.role,
    });

    return NextResponse.json({ student });
  } catch (error) {
    console.error('[STUDENTS] Failed to load current student profile:', error);
    return NextResponse.json({ error: 'Failed to load student profile.' }, { status: 500 });
  }
}
