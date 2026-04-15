import { useEffect, useState, useCallback } from "react";
import { fetchDiscovered, fetchSoftware, fetchTags, loginAdmin, reviewDiscovered } from "./api";
import type { DiscoveredProject, Software, Tag } from "./types";
import { SoftwareCard } from "./components/SoftwareCard";
import { DiscoveredCard } from "./components/DiscoveredCard";
import { AdSenseHorizontal } from "./components/AdSense";

const deepShadow = "rgba(0,0,0,0.01) 0px 1px 3px, rgba(0,0,0,0.02) 0px 3px 7px, rgba(0,0,0,0.02) 0px 7px 15px, rgba(0,0,0,0.04) 0px 14px 28px, rgba(0,0,0,0.05) 0px 23px 52px";

export default function App() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [items, setItems] = useState<Software[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string>("");
  const [sort, setSort] = useState<string>("stargazers_desc");
  const [tab, setTab] = useState<"catalog" | "discovered">("catalog");

  const [adminToken, setAdminToken] = useState<string>(() => localStorage.getItem("ash_token") || "");
  const [showLogin, setShowLogin] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const [discovered, setDiscovered] = useState<DiscoveredProject[]>([]);
  const [discoveredPage, setDiscoveredPage] = useState(1);
  const [discoveredTotal, setDiscoveredTotal] = useState(0);
  const [discoveredStatus, setDiscoveredStatus] = useState<string>("approved");
  const [discoveredLoading, setDiscoveredLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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

  const loadDiscovered = useCallback(async (p: number, opts?: { reset?: boolean }) => {
    setDiscoveredLoading(true);
    try {
      const res = await fetchDiscovered({
        status: discoveredStatus,
        page: p,
        limit,
        token: adminToken || undefined,
      });
      if (opts?.reset) {
        setDiscovered(res.items);
      } else {
        setDiscovered((prev) => [...prev, ...res.items]);
      }
      setDiscoveredTotal(res.total);
      setDiscoveredPage(p);
      setIsAdmin(res.isAdmin);
    } catch (e) {
      console.error(e);
    } finally {
      setDiscoveredLoading(false);
    }
  }, [discoveredStatus, adminToken]);

  useEffect(() => {
    fetchTags().then(setTags).catch(console.error);
  }, []);

  useEffect(() => {
    setPage(1);
    load(1, { reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag, search, sort]);

  useEffect(() => {
    if (tab === "discovered") {
      setDiscoveredPage(1);
      loadDiscovered(1, { reset: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, discoveredStatus, adminToken]);

  const totalPages = Math.ceil(total / limit);
  const discoveredTotalPages = Math.ceil(discoveredTotal / limit);

  async function handleLogin() {
    try {
      const res = await loginAdmin(loginUser, loginPass);
      localStorage.setItem("ash_token", res.token);
      setAdminToken(res.token);
      setShowLogin(false);
      setLoginPass("");
    } catch {
      alert("Login failed");
    }
  }

  async function handleReview(id: string, action: "approve" | "reject") {
    if (!adminToken) return;
    try {
      await reviewDiscovered(id, action, adminToken);
      setDiscovered((prev) => prev.filter((d) => d.id !== id));
      setDiscoveredTotal((t) => Math.max(0, t - 1));
    } catch {
      alert("Review failed");
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f5f4]">
      <header className="sticky top-0 z-20 bg-white border-b border-[rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center gap-3 sm:gap-4">
          <h1 className="text-[18px] font-bold tracking-[-0.25px] text-[rgba(0,0,0,0.95)]">
            <button onClick={() => { setTab("catalog"); setActiveTag(""); setSearch(""); }}>
              awesome-selfhosted
            </button>
          </h1>
          <div className="flex-1 min-w-0">
            {tab === "catalog" && (
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects..."
                className="w-full max-w-[180px] sm:max-w-md px-3 py-2 text-[15px] bg-white border border-[#dddddd] rounded-[4px] text-[rgba(0,0,0,0.95)] placeholder-[#a39e98] focus:outline-none focus:ring-2 focus:ring-[#097fe8]"
              />
            )}
          </div>
          <div className="flex items-center gap-3 text-[15px] font-semibold">
            <button
              onClick={() => setTab("catalog")}
              className={tab === "catalog" ? "text-[rgba(0,0,0,0.95)]" : "text-[#615d59] hover:text-[rgba(0,0,0,0.95)] transition-colors"}
            >
              Catalog
            </button>
            <button
              onClick={() => setTab("discovered")}
              className={tab === "discovered" ? "text-[rgba(0,0,0,0.95)]" : "text-[#615d59] hover:text-[rgba(0,0,0,0.95)] transition-colors"}
            >
              Discovered
            </button>
            {adminToken ? (
              <button
                onClick={() => { localStorage.removeItem("ash_token"); setAdminToken(""); setIsAdmin(false); }}
                className="text-[#615d59] hover:text-[rgba(0,0,0,0.95)] transition-colors"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="text-[#615d59] hover:text-[rgba(0,0,0,0.95)] transition-colors"
              >
                Admin
              </button>
            )}
          </div>
        </div>

        {tab === "catalog" && (
          <div className="max-w-6xl mx-auto px-4 pb-3 flex flex-wrap items-center gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-1.5 text-[13px] font-medium bg-white border border-[#dddddd] rounded-[4px] text-[rgba(0,0,0,0.95)] focus:outline-none focus:ring-2 focus:ring-[#097fe8]"
            >
              <option value="stargazers_desc">Most stars</option>
              <option value="updated_desc">Recently updated</option>
              <option value="name_asc">Name A-Z</option>
            </select>

            <button
              onClick={() => setActiveTag("")}
              className={`px-3 py-1.5 text-[13px] font-semibold rounded-[9999px] border transition-colors ${
                activeTag === ""
                  ? "bg-[rgba(0,0,0,0.95)] text-white border-[rgba(0,0,0,0.95)]"
                  : "bg-white text-[rgba(0,0,0,0.95)] border-[rgba(0,0,0,0.1)] hover:bg-[rgba(0,0,0,0.02)]"
              }`}
            >
              All
            </button>

            {tags.slice(0, 12).map((t) => (
              <button
                key={t.name}
                onClick={() => setActiveTag(t.name === activeTag ? "" : t.name)}
                className={`px-3 py-1.5 text-[13px] font-semibold rounded-[9999px] border transition-colors ${
                  activeTag === t.name
                    ? "bg-[rgba(0,0,0,0.95)] text-white border-[rgba(0,0,0,0.95)]"
                    : "bg-white text-[rgba(0,0,0,0.95)] border-[rgba(0,0,0,0.1)] hover:bg-[rgba(0,0,0,0.02)]"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}

        {tab === "discovered" && adminToken && (
          <div className="max-w-6xl mx-auto px-4 pb-3 flex items-center gap-2">
            {["pending", "approved", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setDiscoveredStatus(s)}
                className={`px-3 py-1.5 text-[13px] font-semibold rounded-[9999px] border capitalize transition-colors ${
                  discoveredStatus === s
                    ? "bg-[rgba(0,0,0,0.95)] text-white border-[rgba(0,0,0,0.95)]"
                    : "bg-white text-[rgba(0,0,0,0.95)] border-[rgba(0,0,0,0.1)] hover:bg-[rgba(0,0,0,0.02)]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <AdSenseHorizontal />

        {tab === "catalog" && (
          <>
            {items.length === 0 && !loading && (
              <div className="text-center text-[#615d59] py-20">No projects found.</div>
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
                  className="px-6 py-2.5 text-[15px] font-semibold bg-[#0075de] text-white rounded-[4px] hover:bg-[#005bab] disabled:bg-[#a39e98] disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
                >
                  {loading ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}

        {tab === "discovered" && (
          <>
            {discovered.length === 0 && !discoveredLoading && (
              <div className="text-center text-[#615d59] py-20">
                {discoveredStatus === "approved" ? "No discovered projects yet." : "Nothing here."}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {discovered.map((item) => (
                <DiscoveredCard
                  key={item.id}
                  item={item}
                  isAdmin={isAdmin}
                  onApprove={() => handleReview(item.id, "approve")}
                  onReject={() => handleReview(item.id, "reject")}
                />
              ))}
            </div>
            {discoveredPage < discoveredTotalPages && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => loadDiscovered(discoveredPage + 1)}
                  disabled={discoveredLoading}
                  className="px-6 py-2.5 text-[15px] font-semibold bg-[#0075de] text-white rounded-[4px] hover:bg-[#005bab] disabled:bg-[#a39e98] disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
                >
                  {discoveredLoading ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-[12px] border border-[rgba(0,0,0,0.1)] p-6 w-full max-w-sm"
            style={{ boxShadow: deepShadow }}
          >
            <h2 className="text-[22px] font-bold tracking-[-0.25px] text-[rgba(0,0,0,0.95)] mb-4">Admin Login</h2>
            <input
              value={loginUser}
              onChange={(e) => setLoginUser(e.target.value)}
              placeholder="Username"
              className="w-full mb-3 px-3 py-2 text-[15px] bg-white border border-[#dddddd] rounded-[4px] text-[rgba(0,0,0,0.95)] placeholder-[#a39e98] focus:outline-none focus:ring-2 focus:ring-[#097fe8]"
            />
            <input
              type="password"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              placeholder="Password"
              className="w-full mb-4 px-3 py-2 text-[15px] bg-white border border-[#dddddd] rounded-[4px] text-[rgba(0,0,0,0.95)] placeholder-[#a39e98] focus:outline-none focus:ring-2 focus:ring-[#097fe8]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleLogin}
                className="flex-1 px-4 py-2.5 text-[15px] font-semibold bg-[#0075de] text-white rounded-[4px] hover:bg-[#005bab] active:scale-[0.98] transition-transform"
              >
                Login
              </button>
              <button
                onClick={() => setShowLogin(false)}
                className="px-4 py-2.5 text-[15px] font-semibold bg-[rgba(0,0,0,0.05)] text-[rgba(0,0,0,0.95)] rounded-[4px] hover:bg-[rgba(0,0,0,0.08)] active:scale-[0.98] transition-transform"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-[rgba(0,0,0,0.1)] bg-white py-6 text-center text-[13px] text-[#615d59]">
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
