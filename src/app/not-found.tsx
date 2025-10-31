export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">The page you are looking for does not exist.</p>
      <a
        href="/"
        className="inline-flex h-10 items-center justify-center rounded-md bg-black px-4 text-white hover:opacity-90 dark:bg-white dark:text-black"
      >
        Go home
      </a>
    </div>
  );
}

export const dynamic = "force-dynamic";



