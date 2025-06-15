import { db } from '@/lib/firebase-config';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  await addDoc(collection(db, 'requests'), {
    ...body,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userAId = searchParams.get('userAId');
  const userBId = searchParams.get('userBId');
  const status = searchParams.getAll('status');

  const requestsRef = collection(db, 'requests');

  if (userAId && userBId && status.length > 0) {
    const q = query(
      requestsRef,
      where('senderId', 'in', [userAId, userBId]),
      where('receiverId', 'in', [userAId, userBId]),
      where('status', 'in', status),
    );
    const snap = await getDocs(q);
    const filtered = snap.docs
      .map((doc) => ({
        id: doc.id,
        ...(doc.data() as { senderId?: string; receiverId?: string; status?: string }),
      }))
      .filter(
        (req) =>
          req.senderId &&
          req.receiverId &&
          req.status &&
          ((req.senderId === userAId && req.receiverId === userBId) ||
            (req.senderId === userBId && req.receiverId === userAId)) &&
          status.includes(req.status),
      );
    return NextResponse.json(filtered);
  }

  // 파라미터가 부족하면 빈 배열 반환
  return NextResponse.json([]);
}
