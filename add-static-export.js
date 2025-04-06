const fs = require('fs');
const path = require('path');

const apiRoutePaths = [
  'src/app/api/search/route.ts',
  'src/app/api/categories/[categoryId]/route.ts',
  'src/app/api/categories/route.ts',
  'src/app/api/dashboard/events/route.ts',
  'src/app/api/dashboard/stats/route.ts',
  'src/app/api/documents/[documentId]/tags/route.ts',
  'src/app/api/documents/[documentId]/events/route.ts',
  'src/app/api/documents/[documentId]/collaborators/route.ts',
  'src/app/api/documents/[documentId]/route.ts',
  'src/app/api/documents/route.ts',
  'src/app/api/auth/[...nextauth]/route.ts',
  'src/app/api/auth/register/route.ts',
  'src/app/api/auth/forgot-password/route.ts',
  'src/app/api/auth/verify-token/route.ts',
  'src/app/api/auth/reset-password/route.ts'
];

// Separate dynamic routes that need generateStaticParams
const dynamicApiRoutePaths = [
  'src/app/api/categories/[categoryId]/route.ts',
  'src/app/api/documents/[documentId]/tags/route.ts',
  'src/app/api/documents/[documentId]/events/route.ts',
  'src/app/api/documents/[documentId]/collaborators/route.ts',
  'src/app/api/documents/[documentId]/route.ts',
  'src/app/api/auth/[...nextauth]/route.ts'
];

// Dynamic page paths
const dynamicPagePaths = [
  'src/app/categories/[categoryId]/page.tsx',
  'src/app/documents/[documentId]/page.tsx'
];

// Function to add export const dynamic
function addDynamicExport(filePath) {
  const fullPath = path.resolve(__dirname, filePath);

  try {
    // Read the file
    let content = fs.readFileSync(fullPath, 'utf8');

    // Check if the file already has the export const dynamic
    if (!content.includes('export const dynamic')) {
      // Find the imports section
      const importEndIndex = content.lastIndexOf('import');
      let insertIndex = content.indexOf('\n', importEndIndex);

      if (insertIndex === -1) {
        // Fallback if we can't find the end of imports
        insertIndex = content.indexOf('\n\n');
      }

      // Add the export const dynamic line after the imports
      const newContent =
        content.substring(0, insertIndex + 1) +
        '\n// Add this for static export\nexport const dynamic = "force-static";\n' +
        content.substring(insertIndex + 1);

      // Write the modified content back to the file
      fs.writeFileSync(fullPath, newContent, 'utf8');
      console.log(`Updated ${filePath} - Added dynamic export configuration`);
    } else {
      console.log(`Skipped ${filePath} - Already has dynamic export configuration`);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`Skipped ${filePath} - File does not exist`);
    } else {
      console.error(`Error processing ${filePath}:`, error);
    }
  }
}

// Function to add generateStaticParams
function addGenerateStaticParams(filePath) {
  const fullPath = path.resolve(__dirname, filePath);

  try {
    // Read the file
    let content = fs.readFileSync(fullPath, 'utf8');

    // Check if the file already has generateStaticParams
    if (!content.includes('generateStaticParams')) {
      // Extract parameter name from the file path
      const paramMatch = filePath.match(/\[([^\/\]]+)\]/);
      let paramName = paramMatch ? paramMatch[1] : 'id';

      // Special case for [...nextauth] route
      if (paramName === '...nextauth') {
        paramName = 'nextauth';
      }

      // Create the generateStaticParams function
      const staticParamsFunc = `
// Add generateStaticParams for static export
export function generateStaticParams() {
  return [
    { ${paramName}: 'doc-1' },
    { ${paramName}: 'doc-2' },
    { ${paramName}: 'doc-3' },
    { ${paramName}: 'doc-4' },
    { ${paramName}: 'doc-5' },
  ];
}
`;

      // Find the position to insert the function (before the first export function/const)
      const exportIndex = content.indexOf('export ');
      if (exportIndex !== -1) {
        const newContent =
          content.substring(0, exportIndex) +
          staticParamsFunc +
          content.substring(exportIndex);

        // Write the modified content back to the file
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${filePath} - Added generateStaticParams`);
      } else {
        console.log(`Skipped ${filePath} - Couldn't find appropriate position to insert generateStaticParams`);
      }
    } else {
      console.log(`Skipped ${filePath} - Already has generateStaticParams`);
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`Skipped ${filePath} - File does not exist`);
    } else {
      console.error(`Error processing ${filePath}:`, error);
    }
  }
}

// Function for handling client components that need generateStaticParams
function addStaticParamsToClientComponent(filePath) {
  const fullPath = path.resolve(__dirname, filePath);
  const dirName = path.dirname(fullPath);
  const staticParamsFile = path.join(dirName, 'generateStaticParams.ts');

  try {
    // Check if the file exists first
    if (fs.existsSync(fullPath)) {
      // Extract parameter name from the file path
      const paramMatch = filePath.match(/\[([^\/\]]+)\]/);
      let paramName = paramMatch ? paramMatch[1] : 'id';

      // Create content for the generateStaticParams file
      const staticParamsContent = `
// This file contains static params for dynamic routes
export function generateStaticParams() {
  return [
    { ${paramName}: 'doc-1' },
    { ${paramName}: 'doc-2' },
    { ${paramName}: 'doc-3' },
    { ${paramName}: 'doc-4' },
    { ${paramName}: 'doc-5' },
  ];
}
`;

      // Write the file
      fs.writeFileSync(staticParamsFile, staticParamsContent);
      console.log(`Created ${staticParamsFile}`);
    } else {
      console.log(`Skipped ${filePath} - File does not exist`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// 1. Add dynamic export to all API routes
apiRoutePaths.forEach(routePath => {
  addDynamicExport(routePath);
});

// 2. Add generateStaticParams to dynamic routes
dynamicApiRoutePaths.forEach(routePath => {
  addGenerateStaticParams(routePath);
});

// 3. Add generateStaticParams to dynamic pages
dynamicPagePaths.forEach(pagePath => {
  addStaticParamsToClientComponent(pagePath);
});

console.log('Finished updating API route files');
