import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Add this for static export

// Add generateStaticParams for static export
export function generateStaticParams() {
  return [
    { categoryId: "doc-1" },
    { categoryId: "doc-2" },
    { categoryId: "doc-3" },
    { categoryId: "doc-4" },
    { categoryId: "doc-5" },
  ];
}
export const dynamic = "force-static";

interface CategoryParams {
  categoryId: string;
}

// GET a specific category with its documents
export async function GET(
  req: Request,
  { params }: { params: CategoryParams },
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

    // Get the category and its documents
    const category = await prisma.category.findUnique({
      where: {
        id: params.categoryId,
      },
      include: {
        documents: {
          where: {
            OR: [
              { userId: user.id },
              {
                collaborators: {
                  some: {
                    userId: user.id,
                  },
                },
              },
            ],
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
        _count: {
          select: { documents: true },
        },
      },
    });

    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH to update a category
export async function PATCH(
  req: Request,
  { params }: { params: CategoryParams },
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

    const { name, description } = await req.json();

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: {
        id: params.categoryId,
      },
    });

    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: {
        id: params.categoryId,
      },
      data: {
        name: name ?? category.name,
        description,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("[CATEGORY_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE a category
export async function DELETE(
  req: Request,
  { params }: { params: CategoryParams },
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

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: {
        id: params.categoryId,
      },
    });

    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // First, remove category from all documents
    await prisma.document.updateMany({
      where: {
        categoryId: params.categoryId,
      },
      data: {
        categoryId: null,
      },
    });

    // Delete the category
    await prisma.category.delete({
      where: {
        id: params.categoryId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
