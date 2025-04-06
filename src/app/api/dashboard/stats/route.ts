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

    // Calculate the date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get basic stats about user's documents
    const totalDocuments = await prisma.document.count({
      where: { userId: user.id },
    });

    // Get recently edited documents
    const recentlyEdited = await prisma.document.findMany({
      where: {
        userId: user.id,
        updatedAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Get events count and recently viewed documents
    const eventsCountData = await prisma.documentEvent.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      include: {
        document: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalEvents = eventsCountData.length;

    // Get recently viewed documents
    const viewEvents = eventsCountData.filter(
      (event) => event.event === "view",
    );
    const viewedDocIds = new Set<string>();
    const recentlyViewed = [];

    for (const event of viewEvents) {
      if (!viewedDocIds.has(event.documentId) && recentlyViewed.length < 5) {
        viewedDocIds.add(event.documentId);
        recentlyViewed.push(event.document);
      }
    }

    // Get top event types
    const eventCounts: Record<string, number> = {};
    for (const event of eventsCountData) {
      eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;
    }

    const topEvents = Object.entries(eventCounts)
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get collaborations count
    const collaborationsCount = await prisma.collaboration.count({
      where: {
        OR: [
          { userId: user.id },
          {
            document: {
              userId: user.id,
            },
          },
        ],
      },
    });

    // Get categories with document counts
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            documents: {
              where: { userId: user.id },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Return all the stats
    return NextResponse.json({
      totalDocuments,
      totalEvents,
      recentlyEdited,
      recentlyViewed,
      topEvents,
      collaborationsCount,
      categories,
    });
  } catch (error) {
    console.error("[DASHBOARD_STATS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
