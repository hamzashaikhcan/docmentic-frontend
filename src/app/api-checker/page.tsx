import ApiChecker from "../../components/api-checker";

export default function ApiCheckerPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">API Connection Checker</h1>
      <ApiChecker />
    </div>
  );
}
