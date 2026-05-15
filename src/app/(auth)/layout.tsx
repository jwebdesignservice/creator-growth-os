// Auth shell is intentionally bare — each page draws its own multi-column
// layout so the sign-in (3-col) and sign-up (2-col) compositions can match
// the design comps exactly.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-cream-100">{children}</div>;
}
