import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Add this for static export
export const dynamic = "force-static";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10);
    const eventType = searchParams.get("eventType");
    const documentId = searchParams.get("documentId");

    // Calculate the date 30 days ago for filtering
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Build where clauses for the query
    const whereClause: any = {
      userId: user.id,
      createdAt: {
        gte: thirtyDaysAgo,
      },
    };

    // Add optional filters
    if (eventType) {
      whereClause.event = eventType;
    }

    if (documentId) {
      whereClause.documentId = documentId;
    }

    // Get recent events
    const recentEvents = await prisma.documentEvent.findMany({
      where: whereClause,
      include: {
        document: {
          select: {
            id: true,
            title: true,
            userId: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    // Process the events to add additional metadata
    const processedEvents = recentEvents.map((event) => {
      // Determine if the user owns the document
      const isOwner = event.document?.userId === user.id;

      return {
        ...event,
        isOwner,
      };
    });

    return NextResponse.json(processedEvents);
  } catch (error) {
    console.error("[DASHBOARD_EVENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
