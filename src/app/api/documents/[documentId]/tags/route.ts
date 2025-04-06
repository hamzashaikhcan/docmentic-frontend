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

// Get all tags for a document
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

    // Check user has access to this document
    const isOwner = document.userId === user.id;
    const isCollaborator = document.collaborators.some(
      (collab) => collab.userId === user.id,
    );

    if (!isOwner && !isCollaborator) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get tags for this document
    const documentTags = await prisma.tagsOnDocuments.findMany({
      where: {
        documentId: params.documentId,
      },
      include: {
        tag: true,
      },
    });

    // Transform to a simpler structure
    const tags = documentTags.map((dt) => ({
      id: dt.tag.id,
      name: dt.tag.name,
      color: dt.tag.color,
    }));

    return NextResponse.json(tags);
  } catch (error) {
    console.error("[DOCUMENT_TAGS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Add a tag to a document
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

    // Parse request body
    const { name, color = "#3b82f6" } = await req.json();

    if (!name) {
      return new NextResponse("Tag name is required", { status: 400 });
    }

    // Check if the document exists and the user has permission
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

    // Check user has permission (owner or edit/admin collaborator)
    const isOwner = document.userId === user.id;
    const canEdit = document.collaborators.some(
      (collab) =>
        collab.userId === user.id &&
        (collab.permission === "edit" || collab.permission === "admin"),
    );

    if (!isOwner && !canEdit) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Find or create tag
    let tag = await prisma.tag.findUnique({
      where: {
        name,
      },
    });

    if (!tag) {
      tag = await prisma.tag.create({
        data: {
          name,
          color,
        },
      });
    }

    // Check if tag is already associated with this document
    const existingLink = await prisma.tagsOnDocuments.findUnique({
      where: {
        documentId_tagId: {
          documentId: params.documentId,
          tagId: tag.id,
        },
      },
    });

    if (existingLink) {
      return NextResponse.json(tag);
    }

    // Link tag to document
    await prisma.tagsOnDocuments.create({
      data: {
        documentId: params.documentId,
        tagId: tag.id,
      },
    });

    // Log the tag event
    await prisma.documentEvent.create({
      data: {
        event: "tag_added",
        documentId: params.documentId,
        userId: user.id,
        metadata: JSON.stringify({
          tagId: tag.id,
          tagName: tag.name,
        }),
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("[DOCUMENT_TAGS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Remove a tag from a document
export async function DELETE(req: Request, { params }: Params) {
  try {
    const session = await getServerSession();
    const { searchParams } = new URL(req.url);
    const tagId = searchParams.get("tagId");

    if (!session || !session.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!tagId) {
      return new NextResponse("Tag ID is required", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if the document exists and the user has permission
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

    // Check user has permission (owner or edit/admin collaborator)
    const isOwner = document.userId === user.id;
    const canEdit = document.collaborators.some(
      (collab) =>
        collab.userId === user.id &&
        (collab.permission === "edit" || collab.permission === "admin"),
    );

    if (!isOwner && !canEdit) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the tag to delete
    const tag = await prisma.tag.findUnique({
      where: {
        id: tagId,
      },
    });

    if (!tag) {
      return new NextResponse("Tag not found", { status: 404 });
    }

    // Delete the tag association
    await prisma.tagsOnDocuments.delete({
      where: {
        documentId_tagId: {
          documentId: params.documentId,
          tagId,
        },
      },
    });

    // Log the tag removal event
    await prisma.documentEvent.create({
      data: {
        event: "tag_removed",
        documentId: params.documentId,
        userId: user.id,
        metadata: JSON.stringify({
          tagId,
          tagName: tag.name,
        }),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DOCUMENT_TAGS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
