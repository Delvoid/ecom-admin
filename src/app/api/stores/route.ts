import { db } from '@/lib/prismadb';
import { StoreValidator } from '@/lib/validators/store';
import { auth } from '@clerk/nextjs';
import { z } from 'zod';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();

    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { name } = StoreValidator.parse(body);
    const store = await db.store.create({
      data: { name, userId },
    });

    return new Response(JSON.stringify(store), { status: 201 });
  } catch (error) {
    console.error('[STORES_POST', error);
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }
    return new Response('Could not create store. Please try again.', { status: 500 });
  }
}
