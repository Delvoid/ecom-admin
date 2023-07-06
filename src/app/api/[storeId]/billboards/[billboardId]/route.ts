import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import { db } from '@/lib/prismadb';
import { BillboardValidator } from '@/lib/validators/billboard';

import cloudinary from 'cloudinary';

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME as string;
const api_key = process.env.CLOUDINARY_API_KEY as string;
const api_secret = process.env.CLOUDINARY_API_SECRET as string;

cloudinary.v2.config({
  cloud_name,
  api_key,
  api_secret,
});

console.log({ cloud_name, api_key, api_secret });

function getCloudinaryImageId(url: string): string {
  const splitUrl = url.split('/');
  const fullId = splitUrl[splitUrl.length - 1]; // Get the last part, which is 'v1688683975/grr2umhhat4adrco7lnc.jpg'
  const idWithExtension = fullId.split('.')[0]; // Remove the extension, if any
  const idParts = idWithExtension.split('/'); // Split the version and the actual id
  return idParts[idParts.length - 1]; // Return the actual id
}

export async function GET(_req: Request, { params }: { params: { billboardId: string } }) {
  try {
    if (!params.billboardId) {
      return new NextResponse('Billboard id is required', { status: 400 });
    }

    const billboard = await db.billboard.findUnique({
      where: {
        id: params.billboardId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log('[BILLBOARD_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { billboardId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 403 });
    }

    if (!params.billboardId) {
      return new NextResponse('Billboard id is required', { status: 400 });
    }

    const storeByUserId = await db.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 405 });
    }

    const billboard = await db.billboard.delete({
      where: {
        id: params.billboardId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log('[BILLBOARD_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { billboardId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { label, imageUrl } = BillboardValidator.parse(body);

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 403 });
    }

    if (!params.billboardId) {
      return new NextResponse('Billboard id is required', { status: 400 });
    }

    const storeByUserId = await db.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 405 });
    }

    const billboardByStoreId = await db.billboard.findFirst({
      where: {
        id: params.billboardId,
      },
    });

    if (!billboardByStoreId) {
      return new NextResponse('Billboard not found', { status: 404 });
    }

    if (billboardByStoreId.imageUrl && billboardByStoreId.imageUrl !== imageUrl) {
      console.log('Deleting old image');
      console.log(billboardByStoreId.imageUrl);
      const url = getCloudinaryImageId(billboardByStoreId.imageUrl);
      console.log({ url });
      await cloudinary.v2.api.delete_resources([url]);
    }

    const billboard = await db.billboard.update({
      where: {
        id: params.billboardId,
      },
      data: {
        label,
        imageUrl,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log('[BILLBOARD_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
