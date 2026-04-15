import { useEffect, useState, useCallback } from "react";
import { fetchSoftware, fetchTags } from "./api";
import type { Software, Tag } from "./types";
import { SoftwareCard } from "./components/SoftwareCard";
import { AdSenseHorizontal } from "./components/AdSense";

export default function App() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [items, setItems] = useState<Software[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string>("");
  const [sort, setSort] = useState<string>("stargazers_desc");
  const limit = 24;

  const load = useCallback(async (p: number, opts?: { reset?: boolean }) => {
    setLoading(true);
    try {
      const res = await fetchSoftware({
        tag: activeTag || undefined,
        search: search || undefined,
        sort,
        page: p,
        limit,
      });
      if (opts?.reset) {
        setItems(res.items);
      } else {
        setItems((prev) => [...prev, ...res.items]);
      }
      setTotal(res.total);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeTag, search, sort]);

  useEffect(() => {
    fetchTags().then(setTags).catch(console.error);
  }, []);

  useEffect(() => {
    setPage(1);
    load(1, { reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag, search, sort]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-neutral-900/95 border-b border-neutral-200 dark:border-neutral-800 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <h1 className="text-lg font-bold tracking-tight">
            <a href="/">awesome-selfhosted</a>
          </h1>
          <div className="flex-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full max-w-md px-3 py-2 text-sm bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 outline-none"
            />
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-500">
            <span>{total.toLocaleString()} projects</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-3 flex flex-wrap items-center gap-2">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-2 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
          >
            <option value="stargazers_desc">Most stars</option>
            <option value="updated_desc">Recently updated</option>
            <option value="name_asc">Name A-Z</option>
          </select>

          <button
            onClick={() => setActiveTag("")}
            className={`px-2 py-1.5 text-xs border ${activeTag === "" ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
          >
            All
          </button>

          {tags.slice(0, 12).map((t) => (
            <button
              key={t.name}
              onClick={() => setActiveTag(t.name === activeTag ? "" : t.name)}
              className={`px-2 py-1.5 text-xs border ${activeTag === t.name ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : "border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-4">
        <AdSenseHorizontal />

        {items.length === 0 && !loading && (
          <div className="text-center text-neutral-500 py-20">No projects found.</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <SoftwareCard key={item.id} item={item} />
          ))}
        </div>

        {page < totalPages && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => load(page + 1)}
              disabled={loading}
              className="px-6 py-2 text-sm bg-black text-white dark:bg-white dark:text-black hover:opacity-80 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </main>

      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-6 text-center text-xs text-neutral-500">
        <p>
          Data sourced from{" "}
          <a href="https://github.com/awesome-selfhosted/awesome-selfhosted-data" target="_blank" rel="noreferrer">
            awesome-selfhosted-data
          </a>
        </p>
      </footer>
    </div>
  );
}
