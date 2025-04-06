// This file contains static params for dynamic routes
export function generateStaticParams() {
  return [
    { nextauth: ["signin"] },
    { nextauth: ["callback"] },
    { nextauth: ["signout"] },
    { nextauth: ["session"] },
    { nextauth: ["csrf"] },
  ];
}
