"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { FileText, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistance } from "date-fns";
import { documents } from "@/lib/dummy-data";

interface SearchProps {
  trigger?: React.ReactNode;
}

export function SearchDialog({ trigger }: SearchProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Handle keyboard shortcut to open the search dialog
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const onSelect = (id: string) => {
    router.push(`/documents/${id}`);
    setOpen(false);
  };

  return (
    <>
      {trigger && <span onClick={() => setOpen(true)}>{trigger}</span>}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search all documents..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Documents">
            {documents.map((doc) => (
              <CommandItem key={doc.id} onSelect={() => onSelect(doc.id)}>
                <FileText className="mr-2 h-4 w-4" />
                <span>{doc.title}</span>
                <CommandShortcut>
                  {formatDistance(new Date(doc.updatedAt), new Date(), {
                    addSuffix: true,
                  })}
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
