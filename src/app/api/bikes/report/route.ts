import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdirSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const bikeData = {
      make: formData.get('make') as string,
      model: formData.get('model') as string,
      year: formData.get('year') ? parseInt(formData.get('year') as string) : null,
      color: formData.get('color') as string,
      category: formData.get('category') as string,
      vin: formData.get('vin') as string,
      engineNumber: formData.get('engineNumber') as string,
      plateNumber: formData.get('plateNumber') as string,
    };

    const theftData = {
      theftDate: new Date(formData.get('theftDate') as string),
      theftLocation: formData.get('theftLocation') as string,
      description: formData.get('description') as string,
      policeReport: formData.get('policeReport') as string,
    };

    const reporterData = {
      name: formData.get('reporterName') as string,
      email: formData.get('reporterEmail') as string,
      phone: formData.get('reporterPhone') as string,
    };

    // Validate required fields
    if (!bikeData.make || !bikeData.model || !theftData.theftDate || !theftData.theftLocation || !theftData.description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create or find user
    let user = await db.user.findUnique({
      where: { email: reporterData.email }
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: reporterData.email,
          name: reporterData.name,
          phone: reporterData.phone,
        }
      });
    }

    // Create bike
    const bike = await db.bike.create({
      data: {
        ...bikeData,
        ownerId: user.id,
      }
    });

    // Handle image uploads
    const images = formData.getAll('images') as File[];
    const imageUrls: string[] = [];

    for (const image of images) {
      if (image instanceof File && image.size > 0) {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Generate unique filename
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${image.name}`;
        const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
        
        // Ensure uploads directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        mkdirSync(uploadDir, { recursive: true });
        
        // Save file
        await writeFile(filepath, buffer);
        
        // Create image record
        const imageUrl = `/uploads/${filename}`;
        imageUrls.push(imageUrl);
        
        await db.bikeImage.create({
          data: {
            url: imageUrl,
            filename: image.name,
            bikeId: bike.id,
          }
        });
      }
    }

    // Create theft report
    const theftReport = await db.theftReport.create({
      data: {
        ...theftData,
        bikeId: bike.id,
        reportedBy: user.id,
      }
    });

    // Return success response
    return NextResponse.json({
      message: 'Theft report submitted successfully',
      reportId: theftReport.id,
      bikeId: bike.id,
      imageCount: imageUrls.length,
    }, { status: 201 });

  } catch (error) {
    console.error('Error submitting theft report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}