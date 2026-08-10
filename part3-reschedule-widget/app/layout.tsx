import "./globals.css";

export const metadata = {
  title: "Parent Portal – Session Reschedule",
  description: "View and reschedule your child's upcoming tutoring sessions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
