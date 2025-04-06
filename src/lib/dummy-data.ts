import { v4 as uuidv4 } from "uuid";

// Mock data types
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  title: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  description: string;
}

// Document type
export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  userId: string;
  categoryId: string | null;
  versions: DocumentVersion[];
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: Date;
  _count?: {
    documents: number;
  };
}

export interface DocumentEvent {
  id: string;
  event: string;
  documentId: string;
  userId: string;
  createdAt: Date;
  metadata?: string;
}

// Create mock user
export const currentUser: User = {
  id: "user-1",
  name: "Test User",
  email: "test@example.com",
  image: "https://github.com/shadcn.png",
  createdAt: new Date("2023-01-01"),
  updatedAt: new Date("2023-01-01"),
};

// Generate some example categories
export const categories: Category[] = [
  {
    id: "cat-1",
    name: "Work",
    description: "Work-related documents",
    color: "#ef4444",
    createdAt: new Date("2023-01-15"),
    _count: { documents: 2 },
  },
  {
    id: "cat-2",
    name: "Personal",
    description: "Personal documents and notes",
    color: "#3b82f6",
    createdAt: new Date("2023-01-20"),
    _count: { documents: 1 },
  },
  {
    id: "cat-3",
    name: "Projects",
    description: "Project documentation",
    color: "#10b981",
    createdAt: new Date("2023-02-05"),
    _count: { documents: 0 },
  },
  {
    id: "cat-4",
    name: "Notes",
    description: "Quick notes and ideas",
    color: "#f59e0b",
    createdAt: new Date("2023-01-10"),
    _count: { documents: 1 },
  },
];

// Mock documents
export const documents: Document[] = [
  {
    id: "doc-1",
    title: "Meeting Notes",
    content: JSON.stringify([
      {
        type: "paragraph",
        children: [{ text: "Important meeting notes from the team call." }],
      },
    ]),
    createdAt: new Date("2023-02-10"),
    updatedAt: new Date("2023-02-15"),
    published: true,
    userId: currentUser.id,
    categoryId: "cat-1",
    versions: [
      {
        id: "ver-1",
        documentId: "doc-1",
        title: "Meeting Notes",
        content: JSON.stringify([
          {
            type: "paragraph",
            children: [{ text: "Important meeting notes from the team call." }],
          },
        ]),
        createdAt: new Date("2023-02-10"),
        createdBy: currentUser.name,
        description: "Initial version",
      },
    ],
  },
  {
    id: "doc-2",
    title: "Project Roadmap",
    content: JSON.stringify([
      {
        type: "paragraph",
        children: [{ text: "Outline of the Q1 product roadmap." }],
      },
    ]),
    createdAt: new Date("2023-03-01"),
    updatedAt: new Date("2023-03-05"),
    published: true,
    userId: currentUser.id,
    categoryId: "cat-1",
    versions: [
      {
        id: "ver-2",
        documentId: "doc-2",
        title: "Project Roadmap",
        content: JSON.stringify([
          {
            type: "paragraph",
            children: [{ text: "Outline of the Q1 product roadmap." }],
          },
        ]),
        createdAt: new Date("2023-03-01"),
        createdBy: currentUser.name,
        description: "Initial version",
      },
    ],
  },
  {
    id: "doc-3",
    title: "Shopping List",
    content: JSON.stringify([
      {
        type: "paragraph",
        children: [{ text: "Items to buy at the grocery store." }],
      },
    ]),
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2023-03-10"),
    published: false,
    userId: currentUser.id,
    categoryId: "cat-2",
    versions: [
      {
        id: "ver-3",
        documentId: "doc-3",
        title: "Shopping List",
        content: JSON.stringify([
          {
            type: "paragraph",
            children: [{ text: "Items to buy at the grocery store." }],
          },
        ]),
        createdAt: new Date("2023-03-10"),
        createdBy: currentUser.name,
        description: "Initial version",
      },
    ],
  },
];

// Mock document events
export const documentEvents: DocumentEvent[] = [
  {
    id: "event-1",
    event: "create",
    documentId: "doc-1",
    userId: currentUser.id,
    createdAt: new Date("2023-02-10"),
  },
  {
    id: "event-2",
    event: "edit",
    documentId: "doc-1",
    userId: currentUser.id,
    createdAt: new Date("2023-02-15"),
  },
  {
    id: "event-3",
    event: "create",
    documentId: "doc-2",
    userId: currentUser.id,
    createdAt: new Date("2023-03-01"),
  },
];

// Helper functions to manipulate dummy data
export function addDocument(
  doc: Omit<Document, "id" | "createdAt" | "updatedAt" | "versions">,
): Document {
  const newDoc = {
    ...doc,
    id: `doc-${uuidv4()}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    versions: [
      {
        id: `ver-${uuidv4()}`,
        documentId: "", // Will be updated after document creation
        title: doc.title,
        content: doc.content,
        createdAt: new Date(),
        createdBy: currentUser.name,
        description: "Initial version",
      },
    ],
  };

  // Update document ID reference in the version
  newDoc.versions[0].documentId = newDoc.id;

  documents.push(newDoc);

  // Update category document count
  if (newDoc.categoryId) {
    const category = categories.find((c) => c.id === newDoc.categoryId);
    if (category && category._count) {
      category._count.documents += 1;
    }
  }

  // Add create event
  documentEvents.push({
    id: `event-${uuidv4()}`,
    event: "create",
    documentId: newDoc.id,
    userId: newDoc.userId,
    createdAt: new Date(),
  });

  return newDoc;
}

export function updateDocument(
  id: string,
  update: Partial<Document>,
): Document | null {
  const index = documents.findIndex((d) => d.id === id);
  if (index === -1) return null;

  const updatedDoc = { ...documents[index] };
  let createNewVersion = false;

  if (
    update.categoryId !== undefined &&
    update.categoryId !== updatedDoc.categoryId
  ) {
    // Decrement old category count if exists
    if (updatedDoc.categoryId) {
      const oldCategory = categories.find(
        (c) => c.id === updatedDoc.categoryId,
      );
      if (
        oldCategory &&
        oldCategory._count &&
        oldCategory._count.documents > 0
      ) {
        oldCategory._count.documents -= 1;
      }
    }

    // Increment new category count if exists
    if (update.categoryId) {
      const newCategory = categories.find((c) => c.id === update.categoryId);
      if (newCategory && newCategory._count) {
        newCategory._count.documents += 1;
      }
    }
    updatedDoc.categoryId = update.categoryId;
  }

  if (update.title !== undefined) {
    updatedDoc.title = update.title;
    createNewVersion = true;
  }

  if (update.content !== undefined && update.content !== updatedDoc.content) {
    updatedDoc.content = update.content;
    createNewVersion = true;
  }

  // Create a new version if content or title changed
  if (createNewVersion) {
    const newVersion: DocumentVersion = {
      id: `ver-${uuidv4()}`,
      documentId: updatedDoc.id,
      title: updatedDoc.title,
      content: updatedDoc.content,
      createdAt: new Date(),
      createdBy: currentUser.name,
      description: `Updated ${new Date().toLocaleString()}`,
    };

    updatedDoc.versions.push(newVersion);
    updatedDoc.updatedAt = new Date();
  }

  documents[index] = updatedDoc;

  // Add edit event
  documentEvents.push({
    id: `event-${uuidv4()}`,
    event: "edit",
    documentId: id,
    userId: currentUser.id,
    createdAt: new Date(),
  });

  return updatedDoc;
}

export function deleteDocument(id: string): boolean {
  const index = documents.findIndex((d) => d.id === id);
  if (index === -1) return false;

  // Update category count
  if (documents[index].categoryId) {
    const category = categories.find(
      (c) => c.id === documents[index].categoryId,
    );
    if (category && category._count && category._count.documents > 0) {
      category._count.documents -= 1;
    }
  }

  documents.splice(index, 1);

  // Add delete event
  documentEvents.push({
    id: `event-${uuidv4()}`,
    event: "delete",
    documentId: id,
    userId: currentUser.id,
    createdAt: new Date(),
  });

  return true;
}

export function addCategory(
  cat: Omit<Category, "id" | "createdAt" | "_count">,
): Category {
  const newCat = {
    ...cat,
    id: `cat-${uuidv4()}`,
    createdAt: new Date(),
    _count: { documents: 0 },
  };

  categories.push(newCat);
  return newCat;
}

export function updateCategory(
  id: string,
  update: Partial<Category>,
): Category | null {
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return null;

  categories[index] = {
    ...categories[index],
    ...update,
  };

  return categories[index];
}

export function deleteCategory(id: string): boolean {
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return false;

  // Update documents to remove categoryId
  documents.forEach((doc) => {
    if (doc.categoryId === id) {
      doc.categoryId = null;
    }
  });

  categories.splice(index, 1);
  return true;
}

// Add the missing functions
export function getDocumentVersions(
  documentId: string,
): DocumentVersion[] | null {
  const document = documents.find((d) => d.id === documentId);
  if (!document) return null;

  return document.versions.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

export function restoreDocumentVersion(
  documentId: string,
  versionId: string,
): Document | null {
  const document = documents.find((d) => d.id === documentId);
  if (!document) return null;

  const version = document.versions.find((v) => v.id === versionId);
  if (!version) return null;

  // Create a new version for the current state before restoring
  const newVersion: DocumentVersion = {
    id: `ver-${uuidv4()}`,
    documentId: document.id,
    title: document.title,
    content: document.content,
    createdAt: new Date(),
    createdBy: currentUser.name,
    description: `State before restoring to version ${version.id}`,
  };

  document.versions.push(newVersion);

  // Update the document with the version data
  document.title = version.title;
  document.content = version.content;
  document.updatedAt = new Date();

  // Add restore event
  documentEvents.push({
    id: `event-${uuidv4()}`,
    event: "restore",
    documentId: document.id,
    userId: currentUser.id,
    createdAt: new Date(),
  });

  return document;
}

export function findDocumentById(id: string): Document | undefined {
  return documents.find((doc) => doc.id === id);
}

export function findCategoryById(
  categoryId: string | null,
): Category | undefined {
  if (!categoryId) return undefined;
  return categories.find((cat) => cat.id === categoryId);
}
