import UpcomingSessions from "./components/UpcomingSessions";

export default function Home() {
  return (
    <div className="min-h-screen bg-bg px-4 py-10 sm:px-6 lg:px-8">
      <main className="mx-auto w-full max-w-3xl">
        {/* Page header */}
        <header className="mb-10">
          <h1 className="heading-serif text-3xl text-text-primary sm:text-4xl">
            Parent Portal
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Your child&apos;s upcoming tutoring schedule
          </p>
        </header>

        <UpcomingSessions />
      </main>
    </div>
  );
}
