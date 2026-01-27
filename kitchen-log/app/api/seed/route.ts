// app/api/seed/route.ts (temporaire, à appeler une fois via le navigateur)
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import masterData from '../../../ingredient_master.json'; // Ajuste le chemin


export async function GET() {
    const batch = writeBatch(db);
    let count = 0;

    for (const item of masterData.slice(0, 400)) {
        const ref = doc(collection(db, "ingredients"));
        batch.set(ref, item);
        count++;
    }

    await batch.commit();
    return NextResponse.json({ seeded: count });
}