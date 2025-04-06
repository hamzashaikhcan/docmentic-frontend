export default function TestPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Server Rendered Test Page</h1>
      <p>
        This is a server-rendered page to check if Next.js server components are
        working.
      </p>

      <h2>Document Links</h2>
      <ul>
        <li>
          <a href="/">Go to Home</a>
        </li>
        <li>
          <a href="/documents">View All Documents</a>
        </li>
        <li>
          <a href="/documents/doc-1">View Document 1 (Meeting Notes)</a>
        </li>
        <li>
          <a href="/documents/doc-2">View Document 2 (Project Roadmap)</a>
        </li>
        <li>
          <a href="/documents/doc-3">View Document 3 (Shopping List)</a>
        </li>
      </ul>
    </div>
  );
}
