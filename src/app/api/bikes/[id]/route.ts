import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const bike = await db.bike.findUnique({
      where: { id },
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
          include: {
            reporter: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        images: {
          select: {
            id: true,
            url: true,
            filename: true,
            createdAt: true
          }
        }
      }
    });

    if (!bike) {
      return NextResponse.json(
        { error: 'Bike not found' },
        { status: 404 }
      );
    }

    // Determine bike status based on theft reports
    const approvedReport = bike.reports.find(report => report.status === 'APPROVED');
    const status = approvedReport ? 'stolen' : 'clean';

    const response = {
      id: bike.id,
      status,
      bike: {
        make: bike.make,
        model: bike.model,
        year: bike.year,
        color: bike.color,
        category: bike.category,
        vin: bike.vin,
        engineNumber: bike.engineNumber,
        plateNumber: bike.plateNumber,
        owner: bike.owner,
        images: bike.images
      },
      reports: bike.reports.map(report => ({
        id: report.id,
        status: report.status,
        theftDate: report.theftDate,
        theftLocation: report.theftLocation,
        description: report.description,
        policeReport: report.policeReport,
        reportedAt: report.createdAt,
        reporter: report.reporter
      })),
      createdAt: bike.createdAt,
      updatedAt: bike.updatedAt
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching bike details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}