import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import axios from "axios";
import { createAxiosForServer } from "@/lib/axiosServer";

// Add this for static export
export const dynamic = "force-static";

export async function POST(req: Request) {
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

    if (!title || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        title,
        content,
        userId: user.id,
        categoryId,
      },
    });

    // Create a document creation event
    await prisma.documentEvent.create({
      data: {
        event: "create",
        documentId: document.id,
        userId: user.id,
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("[DOCUMENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const axios = await createAxiosForServer();

    const documents = await axios.get("/api/documents");

    console.log("documents: ", documents);
    return NextResponse.json(documents);
  } catch (error) {
    console.error("[DOCUMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
