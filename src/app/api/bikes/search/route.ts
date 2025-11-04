import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'vin', 'engine', 'plate'
    const value = searchParams.get('value');

    if (!type || !value) {
      return NextResponse.json(
        { error: 'Missing search parameters' },
        { status: 400 }
      );
    }

    if (!['vin', 'engine', 'plate'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid search type' },
        { status: 400 }
      );
    }

    // Handle empty value for VIN search
    if (type === 'vin' && (!value || value.trim() === '')) {
      return NextResponse.json(
        { error: 'VIN value cannot be empty' },
        { status: 400 }
      );
    }

    // Build search query based on type
    let searchField = '';
    let searchValue = value.trim();
    
    switch (type) {
      case 'vin':
        searchField = 'vin';
        // Untuk VIN, kita tidak ingin mencari null/empty values
        if (!searchValue) {
          return NextResponse.json(
            { error: 'VIN value cannot be empty' },
            { status: 400 }
          );
        }
        break;
      case 'engine':
        searchField = 'engineNumber';
        break;
      case 'plate':
        searchField = 'plateNumber';
        break;
    }

    // Find bike by the specified field
    const bike = await db.bike.findFirst({
      where: {
        [searchField]: {
          equals: searchValue,
          mode: 'insensitive' // Case-insensitive search
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        reports: {
          where: {
            status: 'APPROVED' // Only show approved reports
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        images: {
          select: {
            id: true,
            url: true,
            filename: true
          }
        }
      }
    });

    if (!bike) {
      return NextResponse.json({
        found: false,
        message: 'No bike found with the provided information'
      });
    }

    // Determine bike status based on theft reports
    const hasApprovedTheftReport = bike.reports.length > 0;
    const status = hasApprovedTheftReport ? 'stolen' : 'clean';

    // Format response
    const response = {
      found: true,
      status,
      bike: {
        id: bike.id,
        make: bike.make,
        model: bike.model,
        year: bike.year,
        color: bike.color,
        category: bike.category,
        images: bike.images
      },
      theftReport: hasApprovedTheftReport ? {
        id: bike.reports[0].id,
        theftDate: bike.reports[0].theftDate,
        theftLocation: bike.reports[0].theftLocation,
        description: bike.reports[0].description,
        policeReport: bike.reports[0].policeReport,
        reportedAt: bike.reports[0].createdAt
      } : null,
      lastUpdated: bike.updatedAt,
      searchedAt: new Date()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error searching bike:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
