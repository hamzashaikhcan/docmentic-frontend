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

// Get collaborators for a document
export async function GET(req: Request, { params }: Params) {
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

    // Check if user is the owner or a collaborator with permission
    const document = await prisma.document.findUnique({
      where: {
        id: params.documentId,
      },
      include: {
        collaborators: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Check if user has access to view collaborators
    if (document.userId !== user.id) {
      const userCollaboration = document.collaborators.find(
        (collab) => collab.userId === user.id,
      );

      if (!userCollaboration || userCollaboration.permission === "view") {
        return new NextResponse("Unauthorized", { status: 401 });
      }
    }

    // Get collaborators with user details
    const collaborators = await prisma.collaboration.findMany({
      where: {
        documentId: params.documentId,
      },
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
    });

    return NextResponse.json(collaborators);
  } catch (error) {
    console.error("[COLLABORATORS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Add a new collaborator
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

    // Parse the request body
    const { email, permission } = await req.json();

    if (!email || !permission) {
      return new NextResponse("Email and permission are required", {
        status: 400,
      });
    }

    // Check if document exists and user is the owner or admin collaborator
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

    // Only the owner or admin collaborators can add collaborators
    const isOwner = document.userId === user.id;
    const isAdmin = document.collaborators.some(
      (collab) => collab.userId === user.id && collab.permission === "admin",
    );

    if (!isOwner && !isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find or create user to add as collaborator
    const userToAdd = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!userToAdd) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if user is already a collaborator
    const existingCollaboration = await prisma.collaboration.findUnique({
      where: {
        documentId_userId: {
          documentId: params.documentId,
          userId: userToAdd.id,
        },
      },
    });

    if (existingCollaboration) {
      // Update existing collaboration permission
      const updatedCollaboration = await prisma.collaboration.update({
        where: {
          id: existingCollaboration.id,
        },
        data: {
          permission,
        },
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
      });

      return NextResponse.json(updatedCollaboration);
    }

    // Create new collaboration
    const collaboration = await prisma.collaboration.create({
      data: {
        document: {
          connect: {
            id: params.documentId,
          },
        },
        user: {
          connect: {
            id: userToAdd.id,
          },
        },
        permission,
      },
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
    });

    // Log the collaboration event
    await prisma.documentEvent.create({
      data: {
        event: "collaborator_added",
        documentId: params.documentId,
        userId: user.id,
        metadata: JSON.stringify({
          collaboratorId: userToAdd.id,
          permission,
        }),
      },
    });

    return NextResponse.json(collaboration);
  } catch (error) {
    console.error("[COLLABORATORS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Update or delete a collaborator
export async function DELETE(req: Request, { params }: Params) {
  try {
    const session = await getServerSession();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!session || !session.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if document exists and user is the owner or admin collaborator
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

    // Only the owner or admin collaborators can remove collaborators
    const isOwner = document.userId === user.id;
    const isAdmin = document.collaborators.some(
      (collab) => collab.userId === user.id && collab.permission === "admin",
    );

    // Users can remove themselves
    const isSelf = userId === user.id;

    if (!isOwner && !isAdmin && !isSelf) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find the collaboration to delete
    const collaboration = await prisma.collaboration.findUnique({
      where: {
        documentId_userId: {
          documentId: params.documentId,
          userId,
        },
      },
    });

    if (!collaboration) {
      return new NextResponse("Collaboration not found", { status: 404 });
    }

    // Delete the collaboration
    await prisma.collaboration.delete({
      where: {
        id: collaboration.id,
      },
    });

    // Log the collaboration event
    await prisma.documentEvent.create({
      data: {
        event: "collaborator_removed",
        documentId: params.documentId,
        userId: user.id,
        metadata: JSON.stringify({
          collaboratorId: userId,
        }),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[COLLABORATORS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
