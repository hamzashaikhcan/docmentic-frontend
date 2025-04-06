"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  FileText,
  Image,
  FileDown,
  Settings,
  FilePdf,
  FileImage,
  FileCode,
  FileType2,
} from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface ExportDialogProps {
  documentId: string;
  documentTitle: string;
  documentContent: string;
  children?: React.ReactNode;
}

export function ExportDialog({
  documentId,
  documentTitle,
  documentContent,
  children,
}: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [loading, setLoading] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeCoverPage: true,
    includeMetadata: true,
    tableOfContents: false,
    watermark: false,
    pageNumbers: true,
    quality: "high",
  });

  const handleExport = async () => {
    setLoading(true);

    try {
      // Log the export event
      await fetch(`/api/documents/${documentId}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: "export",
          metadata: JSON.stringify({
            format: exportFormat,
            options: exportOptions,
          }),
        }),
      });

      // Handle different export formats
      switch (exportFormat) {
        case "pdf":
          await exportToPdf();
          break;
        case "markdown":
          exportToMarkdown();
          break;
        case "word":
          exportToWord();
          break;
        case "html":
          exportToHtml();
          break;
        case "image":
          await exportToImage();
          break;
        case "plaintext":
          exportToPlainText();
          break;
        default:
          toast.error("Unsupported export format");
      }

      toast.success(`Document exported as ${formatName(exportFormat)}`);
      setOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export document");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get formatted export name
  const formatName = (format: string): string => {
    const formatNames: Record<string, string> = {
      pdf: "PDF",
      markdown: "Markdown",
      word: "Word Document",
      html: "HTML",
      image: "Image",
      plaintext: "Plain Text",
    };
    return formatNames[format] || format.toUpperCase();
  };

  // Export to PDF with enhanced options
  const exportToPdf = async () => {
    // Find the editor content element
    const element = document.querySelector(".novel-prose-lg");

    if (!element) {
      toast.error("Could not find document content to export");
      return;
    }

    // Create a canvas from the element
    const canvas = await html2canvas(element as HTMLElement, {
      scale: exportOptions.quality === "high" ? 2 : 1,
      useCORS: true,
      allowTaint: true,
    });

    // Create PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
    });

    // Add a cover page if requested
    if (exportOptions.includeCoverPage) {
      pdf.setFillColor(34, 34, 34); // Dark gray background
      pdf.rect(
        0,
        0,
        pdf.internal.pageSize.getWidth(),
        pdf.internal.pageSize.getHeight(),
        "F",
      );

      // Add title
      pdf.setTextColor(255, 255, 255); // White text
      pdf.setFontSize(24);
      pdf.text(documentTitle, pdf.internal.pageSize.getWidth() / 2, 100, {
        align: "center",
      });

      // Add metadata if requested
      if (exportOptions.includeMetadata) {
        const date = new Date().toLocaleDateString();
        pdf.setFontSize(12);
        pdf.text(
          `Generated on: ${date}`,
          pdf.internal.pageSize.getWidth() / 2,
          120,
          { align: "center" },
        );
        // Add more metadata here
      }

      // Add a new page for content
      pdf.addPage();
    }

    // Add a title if not using cover page
    if (!exportOptions.includeCoverPage) {
      pdf.setFontSize(20);
      pdf.text(documentTitle, pdf.internal.pageSize.getWidth() / 2, 20, {
        align: "center",
      });
    }

    // Add watermark if requested
    if (exportOptions.watermark) {
      pdf.setTextColor(200, 200, 200, 0.3); // Light gray, semi-transparent
      pdf.setFontSize(40);
      pdf.text(
        "Docmentic",
        pdf.internal.pageSize.getWidth() / 2,
        pdf.internal.pageSize.getHeight() / 2,
        {
          align: "center",
          angle: 45,
        },
      );
      pdf.setTextColor(0, 0, 0); // Reset text color
    }

    // Calculate dimensions to fit the content
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Add the content image
    pdf.addImage(
      imgData,
      "PNG",
      10,
      exportOptions.includeCoverPage ? 10 : 30,
      pdfWidth,
      pdfHeight,
    );

    // Add page numbers if requested
    if (exportOptions.pageNumbers) {
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pdf.internal.pageSize.getWidth() / 2,
          pdf.internal.pageSize.getHeight() - 10,
          {
            align: "center",
          },
        );
      }
    }

    // Save the PDF
    pdf.save(`${documentTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`);
  };

  const exportToMarkdown = () => {
    try {
      // Try to parse the JSON content
      const content = JSON.parse(documentContent);

      // This is a simplified conversion to markdown
      // In a real app, you would use a proper JSON-to-markdown converter
      let markdown = `# ${documentTitle}\n\n`;

      // Very basic conversion for demonstration
      if (Array.isArray(content)) {
        content.forEach((node) => {
          if (node.type === "heading") {
            const level = "#".repeat(node.attrs?.level || 1);
            markdown += `${level} ${node.content?.[0]?.text || ""}\n\n`;
          } else if (node.type === "paragraph") {
            if (node.content) {
              const text = node.content.map((c: any) => c.text || "").join("");
              markdown += `${text}\n\n`;
            } else {
              markdown += "\n";
            }
          } else if (node.type === "bulletList") {
            if (node.content) {
              node.content.forEach((item: any) => {
                if (item.content?.[0]?.content) {
                  const text = item.content[0].content
                    .map((c: any) => c.text || "")
                    .join("");
                  markdown += `* ${text}\n`;
                }
              });
              markdown += "\n";
            }
          }
        });
      }

      // Create a downloadable link
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${documentTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error converting to markdown:", error);
      toast.error("Could not convert document to markdown");
    }
  };

  const exportToHtml = () => {
    try {
      // Find the editor content element
      const element = document.querySelector(".novel-prose-lg");

      if (!element) {
        toast.error("Could not find document content to export");
        return;
      }

      // Get the HTML
      const html = `<!DOCTYPE html>
<html>
<head>
  <title>${documentTitle}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    h1 { font-size: 2.5rem; margin-bottom: 1.5rem; }
    p { line-height: 1.6; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <h1>${documentTitle}</h1>
  ${element.innerHTML}
</body>
</html>`;

      // Create a downloadable link
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${documentTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting to HTML:", error);
      toast.error("Could not export document to HTML");
    }
  };

  const exportToImage = async () => {
    // Find the editor content element
    const element = document.querySelector(".novel-prose-lg");

    if (!element) {
      toast.error("Could not find document content to export");
      return;
    }

    // Create a canvas from the element
    const canvas = await html2canvas(element as HTMLElement);

    // Create a downloadable link
    const link = document.createElement("a");
    link.download = `${documentTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.png`;
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToWord = () => {
    try {
      // Find the editor content element
      const element = document.querySelector(".novel-prose-lg");

      if (!element) {
        toast.error("Could not find document content to export");
        return;
      }

      // Create header with styles
      const header = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office'
              xmlns:w='urn:schemas-microsoft-com:office:word'
              xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>${documentTitle}</title>
          <style>
            body { font-family: 'Calibri', sans-serif; }
            h1 { font-size: 24pt; }
            h2 { font-size: 18pt; }
            p { font-size: 12pt; line-height: 1.5; }
          </style>
        </head>
        <body>
          <h1>${documentTitle}</h1>
      `;

      // Create footer
      const footer = `
        </body>
        </html>
      `;

      // Get the content and create the complete document
      const sourceHTML = header + element.innerHTML + footer;

      // Create a Blob with the content
      const blob = new Blob([sourceHTML], { type: "application/msword" });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `${documentTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting to Word:", error);
      toast.error("Could not export document to Word format");
    }
  };

  const exportToPlainText = () => {
    try {
      // Find the editor content element
      const element = document.querySelector(".novel-prose-lg");

      if (!element) {
        toast.error("Could not find document content to export");
        return;
      }

      // Get the text content (strips HTML tags)
      const textContent = `${documentTitle}\n\n${element.textContent}`;

      // Create a Blob with the content
      const blob = new Blob([textContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `${documentTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting to plain text:", error);
      toast.error("Could not export document to plain text format");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-[#333333] text-white">
        <DialogHeader>
          <DialogTitle>Export Document</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a format to export your document.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="formats" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-[#222]">
            <TabsTrigger
              value="formats"
              className="data-[state=active]:bg-[#333]"
            >
              Formats
            </TabsTrigger>
            <TabsTrigger
              value="options"
              className="data-[state=active]:bg-[#333]"
            >
              Options
            </TabsTrigger>
          </TabsList>

          <TabsContent value="formats" className="py-4">
            <RadioGroup
              value={exportFormat}
              onValueChange={setExportFormat}
              className="space-y-3"
            >
              <div className="flex items-center gap-x-2 space-y-0">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label
                  htmlFor="pdf"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FilePdf className="h-4 w-4 text-red-500" />
                  PDF Document
                </Label>
              </div>
              <div className="flex items-center gap-x-2 space-y-0">
                <RadioGroupItem value="word" id="word" />
                <Label
                  htmlFor="word"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileType2 className="h-4 w-4 text-blue-500" />
                  Word Document (.doc)
                </Label>
              </div>
              <div className="flex items-center gap-x-2 space-y-0">
                <RadioGroupItem value="markdown" id="markdown" />
                <Label
                  htmlFor="markdown"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileCode className="h-4 w-4 text-green-500" />
                  Markdown (.md)
                </Label>
              </div>
              <div className="flex items-center gap-x-2 space-y-0">
                <RadioGroupItem value="html" id="html" />
                <Label
                  htmlFor="html"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-orange-500" />
                  HTML Document
                </Label>
              </div>
              <div className="flex items-center gap-x-2 space-y-0">
                <RadioGroupItem value="plaintext" id="plaintext" />
                <Label
                  htmlFor="plaintext"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="h-4 w-4 text-gray-400" />
                  Plain Text (.txt)
                </Label>
              </div>
              <div className="flex items-center gap-x-2 space-y-0">
                <RadioGroupItem value="image" id="image" />
                <Label
                  htmlFor="image"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileImage className="h-4 w-4 text-purple-500" />
                  Image (.png)
                </Label>
              </div>
            </RadioGroup>
          </TabsContent>

          <TabsContent value="options" className="py-4">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="includeCoverPage"
                  className="text-sm flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    id="includeCoverPage"
                    checked={exportOptions.includeCoverPage}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        includeCoverPage: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-[#555] bg-[#222]"
                  />
                  Include cover page
                </Label>

                <Label
                  htmlFor="includeMetadata"
                  className="text-sm flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    id="includeMetadata"
                    checked={exportOptions.includeMetadata}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        includeMetadata: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-[#555] bg-[#222]"
                  />
                  Include metadata
                </Label>

                <Label
                  htmlFor="tableOfContents"
                  className="text-sm flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    id="tableOfContents"
                    checked={exportOptions.tableOfContents}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        tableOfContents: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-[#555] bg-[#222]"
                  />
                  Generate table of contents
                </Label>

                <Label
                  htmlFor="watermark"
                  className="text-sm flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    id="watermark"
                    checked={exportOptions.watermark}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        watermark: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-[#555] bg-[#222]"
                  />
                  Add watermark
                </Label>

                <Label
                  htmlFor="pageNumbers"
                  className="text-sm flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    id="pageNumbers"
                    checked={exportOptions.pageNumbers}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        pageNumbers: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-[#555] bg-[#222]"
                  />
                  Include page numbers
                </Label>
              </div>

              <div className="mt-4">
                <Label htmlFor="quality" className="text-sm">
                  Export Quality
                </Label>
                <div className="flex gap-4 mt-2">
                  <Label
                    htmlFor="quality-standard"
                    className="text-sm flex items-center gap-2"
                  >
                    <input
                      type="radio"
                      id="quality-standard"
                      name="quality"
                      checked={exportOptions.quality === "standard"}
                      onChange={() =>
                        setExportOptions({
                          ...exportOptions,
                          quality: "standard",
                        })
                      }
                      className="h-4 w-4 rounded border-[#555] bg-[#222]"
                    />
                    Standard
                  </Label>
                  <Label
                    htmlFor="quality-high"
                    className="text-sm flex items-center gap-2"
                  >
                    <input
                      type="radio"
                      id="quality-high"
                      name="quality"
                      checked={exportOptions.quality === "high"}
                      onChange={() =>
                        setExportOptions({ ...exportOptions, quality: "high" })
                      }
                      className="h-4 w-4 rounded border-[#555] bg-[#222]"
                    />
                    High
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between px-2">
          <div className="text-sm text-gray-400">
            Exporting as:{" "}
            <span className="font-medium text-white">
              {formatName(exportFormat)}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-[#333] bg-[#222] hover:bg-[#333] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Exporting..." : "Export"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
