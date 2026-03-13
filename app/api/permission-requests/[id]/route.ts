import { PermissionRequestStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import authConfig from '@/auth.config';
import { normalizePermissionRequestStatus } from '@/lib/permission-requests/serializers';
import {
  PermissionRequestValidationError,
  updatePermissionRequestStatus,
} from '@/lib/permission-requests/store';
import { UserRole } from '@/types';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.role || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== UserRole.ATTACHE) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as { status?: unknown };
    const status = normalizePermissionRequestStatus(body.status);

    if (!status || status === PermissionRequestStatus.PENDING) {
      return NextResponse.json({ error: 'Permission request status must be APPROVED or REJECTED.' }, { status: 400 });
    }

    const permissionRequest = await updatePermissionRequestStatus({
      id,
      status,
      reviewedById: session.user.id,
    });

    return NextResponse.json({ permissionRequest });
  } catch (error) {
    if (error instanceof PermissionRequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('[PERMISSION_REQUESTS] Failed to update permission request status:', error);
    return NextResponse.json({ error: 'Failed to update permission request.' }, { status: 500 });
  }
}
