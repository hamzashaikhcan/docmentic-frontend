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

interface DocumentParams {
  documentId: string;
}

export async function GET(
  req: Request,
  { params }: { params: DocumentParams },
) {
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

    const document = await prisma.document.findUnique({
      where: {
        id: params.documentId,
      },
      include: {
        category: true,
      },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Check if user is the owner or a collaborator
    const canAccess =
      document.userId === user.id ||
      !!(await prisma.collaboration.findFirst({
        where: {
          documentId: document.id,
          userId: user.id,
        },
      }));

    if (!canAccess) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Log a view event
    await prisma.documentEvent.create({
      data: {
        event: "view",
        documentId: document.id,
        userId: user.id,
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("[DOCUMENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: DocumentParams },
) {
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

    const { title, content, categoryId } = await req.json();

    // Check if the document exists
    const document = await prisma.document.findUnique({
      where: {
        id: params.documentId,
      },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Check if user is the owner or a collaborator with edit access
    const canEdit =
      document.userId === user.id ||
      !!(await prisma.collaboration.findFirst({
        where: {
          documentId: document.id,
          userId: user.id,
          permission: {
            in: ["edit", "admin"],
          },
        },
      }));

    if (!canEdit) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update the document
    const updatedDocument = await prisma.document.update({
      where: {
        id: params.documentId,
      },
      data: {
        title: title ?? document.title,
        content: content ?? document.content,
        categoryId: categoryId !== undefined ? categoryId : document.categoryId,
      },
      include: {
        category: true,
      },
    });

    // Log an edit event
    await prisma.documentEvent.create({
      data: {
        event: "edit",
        documentId: updatedDocument.id,
        userId: user.id,
      },
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error("[DOCUMENT_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: DocumentParams },
) {
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

    // Check if the document exists
    const document = await prisma.document.findUnique({
      where: {
        id: params.documentId,
      },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    // Check if user is the owner
    if (document.userId !== user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete the document
    await prisma.document.delete({
      where: {
        id: params.documentId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DOCUMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
