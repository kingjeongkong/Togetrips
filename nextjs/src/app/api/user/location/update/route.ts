import { adminDb } from '@/lib/firebase-admin';
import { authOptions } from '@/lib/next-auth-config';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { city, state } = await req.json();
  const userRef = adminDb.collection('users').doc(session.user.id);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const currentData = userDoc.data();
  const currentLocation = currentData?.location || {};

  const updateObj: Record<string, any> = {};
  if (currentLocation.city !== city) {
    updateObj['location.city'] = city;
  }
  if (currentLocation.state !== state) {
    updateObj['location.state'] = state;
  }

  if (Object.keys(updateObj).length === 0) {
    return NextResponse.json({
      message: 'No changes detected. Location is already up to date.',
      noChanges: true,
    });
  }

  updateObj.updatedAt = new Date().toISOString();
  await userRef.update(updateObj);

  return NextResponse.json({ message: 'Location updated' });
}
