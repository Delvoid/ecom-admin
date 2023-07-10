import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import { db } from '@/lib/prismadb';

import cloudinary from 'cloudinary';
import { ProductValidator } from '@/lib/validators/product';

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME as string;
const api_key = process.env.CLOUDINARY_API_KEY as string;
const api_secret = process.env.CLOUDINARY_API_SECRET as string;

cloudinary.v2.config({
  cloud_name,
  api_key,
  api_secret,
});

function getCloudinaryImageId(url: string): string {
  const splitUrl = url.split('/');
  const fullId = splitUrl[splitUrl.length - 1]; // Get the last part, which is 'v1688683975/grr2umhhat4adrco7lnc.jpg'
  const idWithExtension = fullId.split('.')[0]; // Remove the extension, if any
  const idParts = idWithExtension.split('/'); // Split the version and the actual id
  return idParts[idParts.length - 1]; // Return the actual id
}

export async function GET(_req: Request, { params }: { params: { productId: string } }) {
  try {
    if (!params.productId) {
      return new NextResponse('Product id is required', { status: 400 });
    }

    const product = await db.product.findUnique({
      where: {
        id: params.productId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { productId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 403 });
    }

    if (!params.productId) {
      return new NextResponse('Product id is required', { status: 400 });
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

    const imagesUrls = await db.image.findMany({
      where: {
        productId: params.productId,
      },
    });

    console.log({ imagesUrls });

    if (imagesUrls) {
      const imageUrlDB = imagesUrls.map((imageUrl) => getCloudinaryImageId(imageUrl.url));

      if (imageUrlDB.length > 0) {
        await cloudinary.v2.api.delete_resources(imageUrlDB);
      }
    }

    const product = await db.product.delete({
      where: {
        id: params.productId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { productId: string; storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { name, price, categoryId, colorId, sizeId, images, isFeatured, isArchived } =
      ProductValidator.parse(body);

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 403 });
    }

    if (!params.productId) {
      return new NextResponse('Product id is required', { status: 400 });
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

    const imagesUrls = await db.image.findMany({
      where: {
        productId: params.productId,
      },
    });

    if (imagesUrls) {
      const imageUrlDB = imagesUrls.map((imageUrl) => getCloudinaryImageId(imageUrl.url));

      const imageList = images.map((image) => image.url);

      const removeImages = imageUrlDB.filter((image) => !imageList.includes(image));

      if (removeImages.length > 0) {
        await cloudinary.v2.api.delete_resources(removeImages);
      }
    }

    await db.product.update({
      where: {
        id: params.productId,
      },
      data: {
        name,
        price,
        categoryId,
        colorId,
        sizeId,
        images: {
          deleteMany: {},
        },
        isFeatured,
        isArchived,
      },
    });

    const product = await db.product.update({
      where: {
        id: params.productId,
      },
      data: {
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
