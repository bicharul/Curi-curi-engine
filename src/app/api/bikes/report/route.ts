import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    let put: any;
    try {
      const blobModule = await import('@vercel/blob');
      put = blobModule.put;
      if (!put) throw new Error('@vercel/blob does not export "put"');
    } catch (err) {
      console.error('Missing or incompatible @vercel/blob module:', err);
      return NextResponse.json(
        { error: 'Server misconfiguration: missing @vercel/blob. Run `npm install @vercel/blob` and redeploy.' },
        { status: 500 }
      );
    }

    const reporterData = {
      email: formData.get('reporterEmail') as string,
      name: formData.get('reporterName') as string,
      phone: formData.get('reporterPhone') as string,
    };

    const bikeData = {
      vin: formData.get('vin') as string,
      make: formData.get('make') as string,
      model: formData.get('model') as string,
      year: formData.get('year') ? parseInt(formData.get('year') as string) : null,
      color: formData.get('color') as string,
      category: formData.get('category') as string,
      engineNumber: formData.get('engineNumber') as string,
      plateNumber: formData.get('plateNumber') as string,
    };

    const theftData = {
      theftDate: new Date(formData.get('theftDate') as string),
      theftLocation: formData.get('theftLocation') as string,
      description: formData.get('description') as string,
      policeReport: formData.get('policeReport') as string,
    };

    if (bikeData.vin === '') {
      bikeData.vin = null;
    }

    if (!bikeData.make || !theftData.theftDate || !theftData.theftLocation || !reporterData.email) {
      return NextResponse.json(
        { error: 'Missing required fields (Make, Theft Date, Location, Reporter Email are required)' },
        { status: 400 }
      );
    }

    const user = await db.user.upsert({
      where: { email: reporterData.email },
      update: {
        name: reporterData.name,
        phone: reporterData.phone,
      },
      create: {
        email: reporterData.email,
        name: reporterData.name,
        phone: reporterData.phone,
      },
    });

    let bike;
    if (bikeData.vin) {
      bike = await db.bike.upsert({
        where: { vin: bikeData.vin },
        update: {
          ...bikeData,
          ownerId: user.id,
        },
        create: {
          ...bikeData,
          ownerId: user.id,
        },
      });
    } else {
      const createBikeData = {
        ...bikeData,
        ownerId: user.id,
        vin: null,
        engineNumber: bikeData.engineNumber || null,
        plateNumber: bikeData.plateNumber || null,
      };

      bike = await db.bike.create({ data: createBikeData });
    }

    const images = formData.getAll('images') as File[];
    const imageUrls: string[] = [];

    for (const image of images) {
      if (image instanceof File && image.size > 0) {
        const filename = `${Date.now()}-${bike.id}-${image.name}`;
        const blob = await put(filename, image, { access: 'public' });
        const imageUrl = blob.url;
        imageUrls.push(imageUrl);

        await db.bikeImage.create({
          data: {
            url: imageUrl,
            filename: image.name,
            bikeId: bike.id,
          },
        });
      }
    }

    const theftReport = await db.theftReport.create({
      data: {
        ...theftData,
        bikeId: bike.id,
        reportedBy: user.id,
      },
    });

    return NextResponse.json(
      {
        message: 'Theft report submitted successfully',
        reportId: theftReport.id,
        bikeId: bike.id,
        imageCount: imageUrls.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting theft report:', error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0];
        return NextResponse.json(
          { error: 'Data sudah ada', message: `${field} sudah terdaftar dalam sistem` },
          { status: 409 }
        );
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}