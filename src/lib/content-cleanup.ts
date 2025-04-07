// utils/content-cleanup.ts

/**
 * Cleans up raw markdown content to make it ready for the editor
 * - Removes markdown fences
 * - Preserves actual content
 * - Handles duplicated sections intelligently
 */
export function cleanupMarkdownContent(content: string): string {
    if (!content) return '';
    
    // Step 1: Remove markdown code blocks markers
    let cleaned = content.replace(/```markdown\s*|```\s*/g, '');
    
    // Step 2: Remove separator lines
    cleaned = cleaned.replace(/^---+\s*$/gm, '');
    
    // Step 3: Handle duplicate sections by merging content
    
    // First pass: Extract all sections with their content
    const sections: { heading: string, content: string }[] = [];
    
    // Regex to match headings and their content
    const regex = /^(#{1,6})\s+(.+?)$\s*([\s\S]*?)(?=\n+#{1,6}\s+|$)/gm;
    let match;
    
    while ((match = regex.exec(cleaned)) !== null) {
      const level = match[1];
      const title = match[2].trim();
      // The content following the heading, up to the next heading
      const sectionContent = match[3].trim();
      
      // Add to our sections list
      sections.push({
        heading: `${level} ${title}`,
        content: sectionContent
      });
    }
    
    // If no sections were found, return the original content
    if (sections.length === 0) {
      return cleaned;
    }
    
    // Second pass: Merge duplicate headings (keeping the most comprehensive content)
    const mergedSections = new Map<string, string>();
    
    for (const section of sections) {
      const key = section.heading.replace(/^#+\s+/, '').toLowerCase();
      
      if (!mergedSections.has(key) || 
          section.content.length > mergedSections.get(key)!.length) {
        mergedSections.set(key, section.content);
      }
    }
    
    // Third pass: Reconstruct the document preserving heading order
    let result = '';
    const processedHeadings = new Set<string>();
    
    // Add back the content in the original order of headings
    for (const section of sections) {
      const key = section.heading.replace(/^#+\s+/, '').toLowerCase();
      
      // Only add each heading once
      if (!processedHeadings.has(key)) {
        processedHeadings.add(key);
        result += `${section.heading}\n\n${mergedSections.get(key)}\n\n`;
      }
    }
    
    // Clean up extra whitespace
    result = result.replace(/\n{3,}/g, '\n\n').trim();
    
    return result;
  }

  