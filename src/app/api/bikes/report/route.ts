import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { put } from '@vercel/blob'; // Import 'put' dari Vercel Blob
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // --- 1. Ekstrak Data dari FormData ---
    
    // Data Pelapor (User)
    const reporterData = {
      email: formData.get('reporterEmail') as string,
      name: formData.get('reporterName') as string,
      phone: formData.get('reporterPhone') as string,
    };

    // Data Motor (Bike)
    const bikeData = {
      vin: formData.get('vin') as string, // VIN adalah kunci utama
      make: formData.get('make') as string,
      model: formData.get('model') as string,
      year: formData.get('year') ? parseInt(formData.get('year') as string) : null,
      color: formData.get('color') as string,
      category: formData.get('category') as string,
      engineNumber: formData.get('engineNumber') as string,
      plateNumber: formData.get('plateNumber') as string,
    };

    // Data Laporan Pencurian (Theft)
    const theftData = {
      theftDate: new Date(formData.get('theftDate') as string),
      theftLocation: formData.get('theftLocation') as string,
      description: formData.get('description') as string,
      policeReport: formData.get('policeReport') as string,
    };

    // Validasi
    if (!bikeData.vin || !bikeData.make || !theftData.theftDate || !theftData.theftLocation || !reporterData.email) {
      return NextResponse.json(
        { error: 'Missing required fields (VIN, Make, Theft Date, Location, Reporter Email are required)' },
        { status: 400 }
      );
    }

    // --- 2. Logika Database: User dan Bike (Gunakan Upsert) ---

    // Cari atau Buat User berdasarkan Email
    const user = await db.user.upsert({
      where: { email: reporterData.email },
      update: { // Update nama/telepon jika pengguna sudah ada
        name: reporterData.name,
        phone: reporterData.phone,
      },
      create: { // Buat pengguna baru jika email belum ada
        email: reporterData.email,
        name: reporterData.name,
        phone: reporterData.phone,
      },
    });

    // **PERBAIKAN UNTUK P2002 (Unique Constraint)**
    // Cari atau Buat Motor berdasarkan VIN (Nomor Rangka)
    const bike = await db.bike.upsert({
      where: { vin: bikeData.vin }, // Kunci unik
      update: { // Jika motor sudah ada di DB, update datanya
        ...bikeData,
        ownerId: user.id,
      },
      create: { // Jika motor belum ada, buat baru
        ...bikeData,
        ownerId: user.id,
      },
    });

    // --- 3. Logika Upload Gambar (Gunakan Vercel Blob) ---

    const images = formData.getAll('images') as File[];
    const imageUrls: string[] = [];

    for (const image of images) {
      if (image instanceof File && image.size > 0) {
        // Buat nama file unik
        const filename = `${Date.now()}-${bikeData.vin}-${image.name}`;
        
        // Upload ke Vercel Blob
        const blob = await put(filename, image, {
          access: 'public', // Buat file dapat diakses publik
        });
        
        // Simpan URL publik dari Vercel Blob
        const imageUrl = blob.url;
        imageUrls.push(imageUrl);
        
        // Buat record gambar di database, hubungkan ke motor
        await db.bikeImage.create({
          data: {
            url: imageUrl,
            filename: image.name,
            bikeId: bike.id,
          }
        });
      }
    }

    // --- 4. Buat Laporan Pencurian (Theft Report) ---
    
    // Sekarang kita bisa membuat laporan pencurian, karena kita pasti punya 'bike.id'
    const theftReport = await db.theftReport.create({
      data: {
        ...theftData,
        bikeId: bike.id,      // Hubungkan ke motor
        reportedBy: user.id,  // Hubungkan ke pelapor
      }
    });

    // --- 5. Kirim Respon Sukses ---
    return NextResponse.json({
      message: 'Theft report submitted successfully',
      reportId: theftReport.id,
      bikeId: bike.id,
      imageCount: imageUrls.length,
      imageUrls: imageUrls, // Kirim kembali URL gambar yang di-upload
    }, { status: 201 });

  } catch (error) {
    console.error('Error submitting theft report:', error);

    // Tangani error P2002 (Unique Constraint) secara spesifik jika masih terjadi
    // (Meskipun upsert seharusnya sudah menanganinya, ini adalah praktik yang baik)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A unique constraint violation occurred. This might be a temporary issue, please try again.' },
          { status: 409 } // 409 Conflict
        );
      }
    }
    
    // Tangani error lainnya
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

