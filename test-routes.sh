#!/bin/bash

BASE_URL="http://localhost:3000"

echo "Testing routes..."
echo "----------------"

# Test the homepage
echo "Home page:"
curl -s "$BASE_URL/" | grep -o "<h1>Welcome to DocuMaker</h1>" || echo "Failed to find content on homepage"
echo ""

# Test the test page
echo "Test page:"
curl -s "$BASE_URL/test-page/" | grep -o "<h1>Server Rendered Test Page</h1>" || echo "Failed to find content on test page"
echo ""

# Test the documents list
echo "Documents list:"
curl -s "$BASE_URL/documents/" | grep -o "<h1>Document List</h1>" || echo "Failed to find content on documents page"
echo ""

# Test a specific document
echo "Document detail (doc-1):"
curl -s "$BASE_URL/documents/doc-1/" | grep -o "Document found: Meeting Notes" || echo "Failed to find content on document detail page"
echo ""

# Test the static HTML file
echo "Static HTML page:"
curl -s "$BASE_URL/test.html" | grep -o "<h1>Test Page</h1>" || echo "Failed to find content on static HTML page"
echo ""

echo "Test complete."
