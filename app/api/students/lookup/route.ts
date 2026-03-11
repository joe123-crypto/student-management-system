import { NextResponse } from 'next/server';
import { lookupStudentInscription } from '@/lib/students/store';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const inscriptionNumber = url.searchParams.get('inscriptionNumber')?.trim().toUpperCase() || '';

  if (!inscriptionNumber) {
    return NextResponse.json({ error: 'Missing inscription number.' }, { status: 400 });
  }

  try {
    const exists = await lookupStudentInscription(inscriptionNumber);
    return NextResponse.json({ exists });
  } catch (error) {
    console.error('[STUDENTS] Failed to look up inscription number:', error);
    return NextResponse.json({ error: 'Failed to verify inscription number.' }, { status: 500 });
  }
}
