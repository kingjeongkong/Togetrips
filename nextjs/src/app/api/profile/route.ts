import { db } from '@/lib/firebase-config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({}, { status: 400 });

  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) return NextResponse.json({}, { status: 404 });

  return NextResponse.json(userDoc.data());
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({}, { status: 400 });

  const body = await req.json();
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, body);
  const userDoc = await getDoc(userRef);

  return NextResponse.json(userDoc.data());
}
