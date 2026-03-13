import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '@/auth.config';
import {
  PermissionRequestConflictError,
  PermissionRequestValidationError,
  createPermissionRequest,
  listPermissionRequests,
} from '@/lib/permission-requests/store';
import { UserRole } from '@/types';

export async function GET() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== UserRole.ATTACHE) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const requests = await listPermissionRequests();
    return NextResponse.json({ requests });
  } catch (error) {
    console.error('[PERMISSION_REQUESTS] Failed to list permission requests:', error);
    return NextResponse.json({ error: 'Failed to load permission requests.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      inscriptionNumber?: unknown;
      fullName?: unknown;
      passportNumber?: unknown;
    };

    const inscriptionNumber =
      typeof body.inscriptionNumber === 'string' ? body.inscriptionNumber : '';
    const fullName = typeof body.fullName === 'string' ? body.fullName : '';
    const passportNumber =
      typeof body.passportNumber === 'string' ? body.passportNumber : '';

    if (!inscriptionNumber.trim() || !fullName.trim() || !passportNumber.trim()) {
      return NextResponse.json({ error: 'Full name, passport number, and inscription number are required.' }, { status: 400 });
    }

    const permissionRequest = await createPermissionRequest({
      inscriptionNumber,
      fullName,
      passportNumber,
    });

    return NextResponse.json({ permissionRequest }, { status: 201 });
  } catch (error) {
    if (error instanceof PermissionRequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof PermissionRequestConflictError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error('[PERMISSION_REQUESTS] Failed to create permission request:', error);
    return NextResponse.json({ error: 'Failed to submit permission request.' }, { status: 500 });
  }
}
