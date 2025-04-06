import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { documents } from "@/lib/dummy-data";

// Add this for static export
export const dynamic = "force-static";

// New static search function that doesn't use headers
export async function GET(request: Request) {
  try {
    // We need to parse URL parameters
    const url = new URL(request.url);
    const query = url.searchParams.get("q") || "";
    const authorFilter = url.searchParams.get("author") || "";
    const tagsFilter = url.searchParams.get("tags") || "";
    const categoryFilter = url.searchParams.get("category") || "";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    if (!query) {
      return NextResponse.json({
        results: [],
        total: 0,
        page,
        limit,
        message: "No search query provided",
      });
    }

    // Filter documents based on query and filters
    let results = documents.filter((doc) => {
      const matchesQuery =
        doc.title.toLowerCase().includes(query.toLowerCase()) ||
        doc.content.toLowerCase().includes(query.toLowerCase());

      const matchesAuthor =
        !authorFilter ||
        doc.author.toLowerCase().includes(authorFilter.toLowerCase());

      const matchesTags =
        !tagsFilter ||
        tagsFilter
          .split(",")
          .some((tag) =>
            doc.tags
              .map((t) => t.toLowerCase())
              .includes(tag.trim().toLowerCase()),
          );

      const matchesCategory =
        !categoryFilter || doc.categoryId === categoryFilter;

      return matchesQuery && matchesAuthor && matchesTags && matchesCategory;
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    return NextResponse.json({
      results: paginatedResults.map((doc) => ({
        id: doc.id,
        title: doc.title,
        excerpt: doc.excerpt,
        author: doc.author,
        updatedAt: doc.updatedAt,
        categoryId: doc.categoryId,
        tags: doc.tags,
        matches: {
          title: doc.title.toLowerCase().includes(query.toLowerCase()),
          content: doc.content.toLowerCase().includes(query.toLowerCase()),
        },
      })),
      total: results.length,
      page,
      limit,
      message:
        results.length > 0 ? "Search results retrieved" : "No results found",
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      {
        results: [],
        total: 0,
        page: 1,
        limit: 10,
        message: "Error processing search",
      },
      { status: 500 },
    );
  }
}
