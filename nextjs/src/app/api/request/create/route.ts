import { adminDb } from '@/lib/firebase-admin';
import { authOptions } from '@/lib/next-auth-config';
import { FieldValue } from 'firebase-admin/firestore';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const senderID = session.user.id;

    const { receiverID, message }: { receiverID: string; message: string } = await req.json();

    if (!receiverID) {
      return NextResponse.json({ error: 'Missing receiverID' }, { status: 400 });
    }

    if (senderID === receiverID) {
      return NextResponse.json({ error: 'Cannot send request to yourself' }, { status: 400 });
    }

    if (message && message.length > 500) {
      return NextResponse.json({ error: 'Message is too long' }, { status: 400 });
    }

    const requestsRef = adminDb.collection('requests');

    const existingRequestQuery = await requestsRef
      .where('senderID', '==', senderID)
      .where('receiverID', '==', receiverID)
      .where('status', 'in', ['pending', 'accepted', 'declined'])
      .limit(1)
      .get();

    if (!existingRequestQuery.empty) {
      const existingStatus = existingRequestQuery.docs[0].data().status;
      return NextResponse.json(
        { error: `A request with '${existingStatus}' status already exists.` },
        { status: 409 },
      );
    }

    const newRequest = {
      senderID,
      receiverID,
      message: message || '',
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
    };

    const docRef = await requestsRef.add(newRequest);

    return NextResponse.json({ message: 'Request sent successfully', requestID: docRef.id });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
