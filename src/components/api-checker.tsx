"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ApiChecker() {
  const [results, setResults] = useState<undefined | null | any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkApi = async () => {
    setIsLoading(true);
    setResults(null);

    const apiUrl = "http://localhost:8000/api/auth/login";
    console.log(`Testing API: ${apiUrl}`);

    try {
      // First try - form data (standard FastAPI/Django approach)
      const formData = new URLSearchParams();
      formData.append("username", "test@example.com");
      formData.append("password", "password123");

      const formResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: formData,
      }).catch((e) => null);

      // Second try - JSON (alternative API approach)
      const jsonResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      }).catch((e) => null);

      // Get raw response for both approaches
      const formResponseText = formResponse
        ? await formResponse.text()
        : "Failed to connect";
      const jsonResponseText = jsonResponse
        ? await jsonResponse.text()
        : "Failed to connect";

      // Check if responses are HTML
      const formIsHtml =
        formResponseText.trim().startsWith("<!DOCTYPE") ||
        formResponseText.trim().startsWith("<html");
      const jsonIsHtml =
        jsonResponseText.trim().startsWith("<!DOCTYPE") ||
        jsonResponseText.trim().startsWith("<html");

      setResults({
        formRequest: {
          status: formResponse?.status || "Connection failed",
          isHtml: formIsHtml,
          excerpt:
            formResponseText.substring(0, 300) +
            (formResponseText.length > 300 ? "..." : ""),
        },
        jsonRequest: {
          status: jsonResponse?.status || "Connection failed",
          isHtml: jsonIsHtml,
          excerpt:
            jsonResponseText.substring(0, 300) +
            (jsonResponseText.length > 300 ? "..." : ""),
        },
      });
    } catch (err) {
      console.error("API test error:", err);
      setResults({
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>API Connection Issue Detector</CardTitle>
          <CardDescription>
            This tool will help diagnose your API connection problems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This will test your API at{" "}
            <code className="px-1 py-0.5 text-black bg-gray-100 rounded">
              http://localhost:8000/api/auth/login
            </code>
            with both form-encoded and JSON request formats.
          </p>

          <Button onClick={checkApi} disabled={isLoading} className="w-full">
            {isLoading ? "Testing API..." : "Test API Connection"}
          </Button>

          {results && (
            <div className="mt-6 space-y-6">
              {results.error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                  <strong>Error:</strong> {results.error}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h3 className="font-medium">Form URL-encoded Request:</h3>
                    <div
                      className={`p-3 rounded text-black ${results.formRequest.isHtml ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50 border border-gray-200"}`}
                    >
                      <p>
                        <strong>Status:</strong> {results.formRequest.status}
                      </p>
                      {results.formRequest.isHtml && (
                        <p className="text-yellow-700 font-medium mt-1">
                          ⚠️ API is returning HTML instead of JSON
                        </p>
                      )}
                      <pre className="mt-2 bg-gray-100 p-2 rounded text-sm overflow-x-auto  text-black">
                        {results.formRequest.excerpt}
                      </pre>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">JSON Request:</h3>
                    <div
                      className={`p-3 rounded  text-black ${results.jsonRequest.isHtml ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50 border border-gray-200"}`}
                    >
                      <p>
                        <strong>Status:</strong> {results.jsonRequest.status}
                      </p>
                      {results.jsonRequest.isHtml && (
                        <p className="text-yellow-700 font-medium mt-1">
                          ⚠️ API is returning HTML instead of JSON
                        </p>
                      )}
                      <pre className="mt-2 bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                        {results.jsonRequest.excerpt}
                      </pre>
                    </div>
                  </div>

                  {(results.formRequest.isHtml ||
                    results.jsonRequest.isHtml) && (
                    <div className="bg-orange-50 border border-orange-200 p-4 rounded">
                      <h3 className="font-medium text-orange-800">
                        Problem Detected: API Returning HTML Instead of JSON
                      </h3>
                      <p className="mt-2">
                        Your API is returning HTML content instead of JSON. This
                        usually means:
                      </p>
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>
                          Your API URL is pointing to a web page instead of an
                          API endpoint
                        </li>
                        <li>
                          Your backend is configured to serve a web interface at
                          this URL
                        </li>
                        <li>
                          You might be using an incorrect URL format for your
                          API
                        </li>
                      </ul>

                      <h4 className="font-medium mt-4 text-orange-800">
                        Suggested Solutions:
                      </h4>
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>Check if your backend API is running correctly</li>
                        <li>
                          Verify the correct API URL with your backend developer
                        </li>
                        <li>
                          Look for API documentation for the correct endpoints
                        </li>
                        <li>
                          The URL might need to include a version (e.g.,{" "}
                          <code>/v1/api/auth/login</code>)
                        </li>
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
