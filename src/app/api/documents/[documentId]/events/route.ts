import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Add this for static export

// Add generateStaticParams for static export
export function generateStaticParams() {
  return [
    { documentId: "doc-1" },
    { documentId: "doc-2" },
    { documentId: "doc-3" },
    { documentId: "doc-4" },
    { documentId: "doc-5" },
  ];
}
export const dynamic = "force-static";

interface Params {
  params: {
    documentId: string;
  };
}

// Create a new document event
export async function POST(req: Request, { params }: Params) {
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

    // Check if the document exists and the user has access to it
    const document = await prisma.document.findUnique({
      where: {
        id: params.documentId,
      },
      include: {
        collaborators: true,
      },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Verify user has access to this document
    const isOwner = document.userId === user.id;
    const isCollaborator = document.collaborators.some(
      (collab) => collab.userId === user.id,
    );

    if (!isOwner && !isCollaborator) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get event data from request body
    const { event, metadata } = await req.json();

    if (!event) {
      return new NextResponse("Event type is required", { status: 400 });
    }

    // Create the event record
    const documentEvent = await prisma.documentEvent.create({
      data: {
        event,
        documentId: params.documentId,
        userId: user.id,
        metadata: metadata || null,
      },
    });

    return NextResponse.json(documentEvent);
  } catch (error) {
    console.error("[DOCUMENT_EVENT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Get document events (with optional filtering)
export async function GET(req: Request, { params }: Params) {
  try {
    const session = await getServerSession();
    const { searchParams } = new URL(req.url);

    const eventType = searchParams.get("event");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = searchParams.has("limit")
      ? Number.parseInt(searchParams.get("limit") as string)
      : 100;

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

    // Check if the document exists and the user has access to it
    const document = await prisma.document.findUnique({
      where: {
        id: params.documentId,
      },
      include: {
        collaborators: true,
      },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Only the owner or admin collaborators can view all events
    const isOwner = document.userId === user.id;
    const isAdmin = document.collaborators.some(
      (collab) => collab.userId === user.id && collab.permission === "admin",
    );

    if (!isOwner && !isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Build the query with filters
    const query: any = {
      where: {
        documentId: params.documentId,
      },
      orderBy: {
        createdAt: "desc" as const,
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    };

    // Apply filters if provided
    if (eventType) {
      query.where.event = eventType;
    }

    if (startDate) {
      query.where.createdAt = {
        ...query.where.createdAt,
        gte: new Date(startDate),
      };
    }

    if (endDate) {
      query.where.createdAt = {
        ...query.where.createdAt,
        lte: new Date(endDate),
      };
    }

    // Get the events
    const events = await prisma.documentEvent.findMany(query);

    return NextResponse.json(events);
  } catch (error) {
    console.error("[DOCUMENT_EVENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
