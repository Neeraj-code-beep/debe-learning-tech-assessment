import UpcomingSessions from "./components/UpcomingSessions";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <main className="w-full max-w-4xl">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Parent Portal
        </h1>
        <p className="mb-8 text-sm text-zinc-600 dark:text-zinc-400">
          Manage and reschedule your child&apos;s upcoming tutoring sessions.
        </p>
        <UpcomingSessions />
      </main>
    </div>
  );
}
