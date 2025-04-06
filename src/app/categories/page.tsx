"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Plus, Folder, FileText, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  categories,
  addCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from "@/lib/dummy-data";

export default function CategoriesPage() {
  const router = useRouter();
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Use the dummy data instead of fetching from API
    setCategoriesList([...categories]);
    setLoading(false);
  }, []);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const newCategory = addCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || null,
      });

      setCategoriesList([...categoriesList, newCategory]);
      setNewCategoryName("");
      setNewCategoryDescription("");
      setIsDialogOpen(false);
      toast.success("Category created successfully");
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      const updated = updateCategory(editingCategory.id, {
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || null,
      });

      if (updated) {
        setCategoriesList(
          categoriesList.map((cat) => (cat.id === updated.id ? updated : cat)),
        );
        setNewCategoryName("");
        setNewCategoryDescription("");
        setIsDialogOpen(false);
        setEditingCategory(null);
        setIsEditing(false);
        toast.success("Category updated successfully");
      } else {
        toast.error("Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? Documents in this category will not be deleted but will no longer be categorized.",
      )
    ) {
      return;
    }

    try {
      const result = deleteCategory(categoryId);

      if (result) {
        setCategoriesList(
          categoriesList.filter((cat) => cat.id !== categoryId),
        );
        toast.success("Category deleted successfully");
      } else {
        toast.error("Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryDescription(category.description || "");
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleViewCategory = (categoryId: string) => {
    router.push(`/categories/${categoryId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Categories</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setNewCategoryName("");
                  setNewCategoryDescription("");
                  setIsEditing(false);
                  setEditingCategory(null);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Category" : "Create New Category"}
                </DialogTitle>
                <DialogDescription>
                  {isEditing
                    ? "Update this category's details."
                    : "Create a new category to organize your documents."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>
                  <Input
                    id="name"
                    placeholder="Category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description (optional)
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Category description"
                    value={newCategoryDescription}
                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setNewCategoryName("");
                    setNewCategoryDescription("");
                    setIsEditing(false);
                    setEditingCategory(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={
                    isEditing ? handleUpdateCategory : handleCreateCategory
                  }
                >
                  {isEditing ? "Update Category" : "Create Category"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Separator className="my-6" />

        {categoriesList.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">No categories yet</h2>
            <p className="mt-2 text-muted-foreground">
              Create a category to better organize your documents.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create your first category
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categoriesList.map((category) => (
              <Card key={category.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">{category.name}</CardTitle>
                  <CardDescription>
                    {category.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>
                      {category._count?.documents || 0}{" "}
                      {(category._count?.documents || 0) === 1
                        ? "document"
                        : "documents"}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Created on{" "}
                    {format(new Date(category.createdAt), "MMMM d, yyyy")}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => handleViewCategory(category.id)}
                  >
                    View Documents
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
