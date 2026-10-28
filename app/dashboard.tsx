"use client";
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Sparkles,
  Database,
  BookOpen,
  Globe,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Search,
  X,
  Check,
  ChevronRight,
  Activity,
  LockKeyhole,
  Layers3,
  MessageSquare,
  CircleHelp,
  Download,
  Menu,
  LoaderCircle,
  CheckCheck,
  TriangleAlert,
  LogOut,
} from "lucide-react";
import type { Source, Answer } from "@/lib/engine";
type Event = { id: string; question: string; outcome: string; detail: string; created: string };
const prompts = [
  ["Data governance", "How long are customer logs retained?"],
  ["Security & compliance", "How is customer data encrypted?"],
  ["Customer operations", "What is the Enterprise uptime SLA?"],
];
const policies = [
  [
    "Source verification",
    "Only reviewed documents enter the answer pipeline. Unverified API payloads stay excluded.",
  ],
  [
    "Access boundaries",
    "Restricted documents are excluded on the server before retrieval. Each account has its own workspace.",
  ],
  ["Freshness checks", "Documents older than 180 days are excluded, even if previously verified."],
  [
    "Injection screening",
    "Known instruction-override patterns are blocked in requests and quarantined in imported content.",
  ],
  [
    "Evidence-only answers",
    "The engine returns matching source excerpts with citations. Missing evidence produces a refusal.",
  ],
  [
    "Sensitive pattern redaction",
    "Email addresses, common credential formats, and US-style identity numbers are redacted from output.",
  ],
];
function Badge({ value }: { value: string }) {
  return (
    <span
      className={
        "badge " +
        (value === "Verified" || value === "Grounded"
          ? "green"
          : value === "Blocked" || value === "Quarantined"
            ? "red"
            : value === "Stale" || value === "Unverified" || value === "Needs review"
              ? "amber"
              : "gray")
      }
    >
      <i />
      {value}
    </span>
  );
}
function KindIcon({ kind }: { kind: string }) {
  const Icon = kind === "SQL" ? Database : kind === "API" ? Globe : BookOpen;
  return (
    <span className={"source-icon " + kind.toLowerCase()}>
      <Icon size={18} />
    </span>
  );
}
export default function Home() {
  const [tab, setTab] = useState("Assistant"),
    [sources, setSources] = useState<Source[]>([]),
    [history, setHistory] = useState<Event[]>([]),
    [loading, setLoading] = useState(true),
    [hasWorkspace, setHasWorkspace] = useState(false),
    [eligibleCount, setEligibleCount] = useState(0),
    [auth, setAuth] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [question, setQuestion] = useState(""),
    [asked, setAsked] = useState(""),
    [answer, setAnswer] = useState<Answer | null>(null),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("All sources"),
    [selected, setSelected] = useState<Source | null>(null),
    [add, setAdd] = useState(false),
    [help, setHelp] = useState(false),
    [mobile, setMobile] = useState(false),
    [isNarrow, setIsNarrow] = useState(false),
    [resetSession, setResetSession] = useState(false),
    [notice, setNotice] = useState("");
  const [title, setTitle] = useState(""),
    [kind, setKind] = useState("Wiki"),
    [content, setContent] = useState("");
  async function load() {
    try {
      const r = await fetch("/api/workspace");
      if (r.status === 401) {
        setAuth(true);
        return;
      }
      const d = (await r.json()) as {
        error?: string;
        sources: Source[];
        history: Event[];
        eligibleCount: number;
      };
      if (!r.ok) throw Error(d.error);
      setSources(d.sources);
      setHistory(d.history);
      setEligibleCount(d.eligibleCount);
      setHasWorkspace(true);
      setAuth(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load workspace.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 820px)");
    const sync = () => {
      setIsNarrow(media.matches);
      if (!media.matches) setMobile(false);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!isNarrow || !mobile) return;
    const sidebar = document.getElementById("workspace-sidebar");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.getElementById("sidebar-close")?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const nodes = Array.from(
        sidebar?.querySelectorAll<HTMLElement>("a[href],button:not(:disabled)") || [],
      );
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    sidebar?.addEventListener("keydown", trap);
    return () => {
      document.body.style.overflow = previousOverflow;
      sidebar?.removeEventListener("keydown", trap);
      if (window.matchMedia("(max-width: 820px)").matches)
        document.querySelector<HTMLButtonElement>(".mobile-menu")?.focus();
    };
  }, [isNarrow, mobile]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setAdd(false);
        setHelp(false);
        setResetSession(false);
        setMobile(false);
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);
  useEffect(() => {
    if (!selected && !add && !help && !resetSession) return;
    const previous = document.activeElement as HTMLElement | null;
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".modal button:not(:disabled), .modal input, .modal textarea, .modal select, .modal a[href]",
        ),
      );
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [selected, add, help, resetSession]);
  async function post(body: object) {
    const r = await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = (await r.json()) as Answer & { error?: string };
    if (!r.ok) throw Error(d.error || "Request failed.");
    return d;
  }
  async function ask(q = question) {
    if (!q.trim() || busy) return;
    setBusy(true);
    setError("");
    setAsked(q);
    setAnswer(null);
    setQuestion(q);
    try {
      setAnswer(await post({ action: "ask", question: q }));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  }
  async function mutate(action: string, id?: string) {
    setBusy(true);
    setError("");
    try {
      await post(action === "add" ? { action, title, kind, content } : { action, id });
      await load();
      setSelected(null);
      if (action === "add") {
        setAdd(false);
        setTitle("");
        setContent("");
      }
      setNotice(
        action === "add"
          ? "Source added. Review it before use."
          : action === "verify"
            ? "Source reviewed and approved."
            : "Source availability updated.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }
  function navigate(next: string) {
    setTab(next);
    setMobile(false);
    setSearch("");
  }
  function exportAudit() {
    const blob = new Blob(
      [
        JSON.stringify(
          history.map(({ detail, ...e }) => ({ ...e, result: JSON.parse(detail) })),
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "veritas-audit.json";
    a.click();
    URL.revokeObjectURL(url);
    setNotice("Audit exported.");
  }
  const verified = eligibleCount;
  const filtered = sources.filter(
    (s) =>
      (filter === "All sources" || s.kind === filter) &&
      s.title.toLowerCase().includes(search.toLowerCase()),
  );
  const denied = history.filter((e) => e.outcome !== "Grounded").length;
  return (
    <div className="app-shell">
      <aside
        id="workspace-sidebar"
        aria-label="Workspace navigation"
        className={"sidebar " + (mobile ? "open" : "")}
        inert={isNarrow && !mobile}
      >
        {isNarrow && (
          <button
            id="sidebar-close"
            className="sidebar-close"
            aria-label="Close navigation"
            onClick={() => setMobile(false)}
          >
            <X size={20} />
          </button>
        )}
        <a className="brand" href="/" aria-label="Veritas home">
          <span className="brand-mark">
            <Layers3 size={25} />
          </span>
          veritas<span className="brand-dot">.</span>
        </a>
        <div className="workspace">
          <span className="workspace-avatar">V</span>
          <div>
            <strong>Acme workspace</strong>
            <small>Private demo environment</small>
          </div>
          <LockKeyhole size={13} />
        </div>
        <span className="nav-label">WORKSPACE</span>
        <nav>
          {[
            { Icon: MessageSquare, label: "Assistant" },
            { Icon: Database, label: "Sources" },
            { Icon: ShieldCheck, label: "Safety policies" },
            { Icon: Activity, label: "Audit trail" },
          ].map(({ Icon, label }) => (
            <button
              key={label}
              onClick={() => navigate(label)}
              className={tab === label ? "active" : ""}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === "Sources" && <b>{sources.length}</b>}
              {label === "Assistant" && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="safety-card">
            <ShieldCheck size={22} />
            <strong>Evidence comes first.</strong>
            <p>
              Every answer has a source.
              <br />
              Every boundary has a check.
            </p>
            <button onClick={() => navigate("Safety policies")}>
              Explore safeguards <ArrowUpRight size={14} />
            </button>
          </div>
          <button className="help-link" onClick={() => setHelp(true)}>
            <CircleHelp size={17} />
            How Veritas works
            <ArrowUpRight size={14} />
          </button>
          <div className="profile">
            <span className="avatar">G</span>
            <div>
              <strong>Your private workspace</strong>
              <small>Guest session · Demo</small>
            </div>
            <button
              title="Start a new guest workspace"
              aria-label="Start a new guest workspace"
              onClick={() => {
                setMobile(false);
                setResetSession(true);
                setError("");
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      {isNarrow && mobile && (
        <button
          className="sidebar-backdrop"
          aria-label="Dismiss navigation"
          tabIndex={-1}
          onClick={() => setMobile(false)}
        />
      )}
      <div className="main-shell" inert={isNarrow && mobile}>
        <header className="topbar">
          <div className="breadcrumbs">
            <button
              className="mobile-menu"
              aria-label="Open navigation"
              aria-expanded={mobile}
              aria-controls="workspace-sidebar"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{tab}</strong>
          </div>
          <div className="top-actions">
            <span className="demo-label">
              <i />
              DEMO WORKSPACE
            </span>
            <button className="icon-button" onClick={() => setHelp(true)} aria-label="Help">
              <CircleHelp size={19} />
            </button>
            <span className="avatar small">G</span>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">TRUST IS BUILT ON EVIDENCE</div>
              <h1>
                {tab === "Assistant"
                  ? "Your knowledge. Verified."
                  : tab === "Sources"
                    ? "A clearer view of your sources."
                    : tab === "Audit trail"
                      ? "Nothing happens silently."
                      : "Boundaries you can see."}
              </h1>
              <p>
                {tab === "Assistant"
                  ? "Get grounded answers from your enterprise knowledge, with safety built in."
                  : tab === "Sources"
                    ? "Review, organize, and control the knowledge your assistant can use."
                    : tab === "Audit trail"
                      ? "Inspect every question, decision, and supporting source."
                      : "Server-enforced checks between your data and every answer."}
              </p>
            </div>
            {tab === "Sources" ? (
              <button
                className="primary"
                disabled={auth || loading || !hasWorkspace}
                onClick={() => setAdd(true)}
              >
                <Plus size={17} />
                Add source
              </button>
            ) : tab === "Audit trail" ? (
              <button className="secondary" onClick={exportAudit} disabled={!history.length}>
                <Download size={16} />
                Export audit
              </button>
            ) : (
              <span className="secure-pill">
                <ShieldCheck size={15} />
                Private by default
              </span>
            )}
          </div>
          {error && (
            <div className="error" role="alert">
              <TriangleAlert size={18} />
              <span>{error}</span>
              <button
                onClick={() => {
                  setError("");
                  load();
                }}
              >
                Retry
              </button>
            </div>
          )}
          {auth ? (
            <section className="signin card">
              <ShieldCheck size={40} />
              <h2>Your knowledge stays yours.</h2>
              <p>
                Open your isolated guest workspace with sample sources, saved queries, and an audit
                trail. Your session is stored in this browser.
              </p>
              <button className="primary" onClick={() => load()}>
                Open guest workspace <ArrowRight size={17} />
              </button>
              <small>No company accounts or API keys needed.</small>
            </section>
          ) : loading ? (
            <div className="loading">
              <LoaderCircle className="spin" />
              Preparing your private workspace…
            </div>
          ) : !hasWorkspace ? (
            <section className="signin card" aria-live="polite">
              <TriangleAlert size={36} />
              <h2>Workspace unavailable</h2>
              <p>
                The workspace could not load. Retry to reconnect; your existing session will be
                preserved.
              </p>
              <button
                className="primary"
                onClick={() => {
                  setError("");
                  setLoading(true);
                  load();
                }}
              >
                Retry connection <ArrowRight size={16} />
              </button>
            </section>
          ) : (
            <>
              <section className="stats">
                <div>
                  <span>
                    Knowledge sources
                    <Database size={16} />
                  </span>
                  <strong>
                    {sources.length}
                    <small>across 3 source types</small>
                  </strong>
                </div>
                <div>
                  <span>
                    Eligible sources
                    <ShieldCheck size={16} />
                  </span>
                  <strong>
                    {verified}
                    <small className="positive">verified & internal</small>
                  </strong>
                </div>
                <div>
                  <span>
                    Queries evaluated
                    <Activity size={16} />
                  </span>
                  <strong>
                    {history.length}
                    <small>latest 50 requests</small>
                  </strong>
                </div>
                <div>
                  <span>
                    Answers withheld
                    <LockKeyhole size={16} />
                  </span>
                  <strong>
                    {denied}
                    <small>blocked or insufficient evidence</small>
                  </strong>
                </div>
              </section>
              {tab === "Assistant" && (
                <div className="assistant-grid">
                  <div className="assistant-main">
                    <section className="ask-card card">
                      <div className="card-header">
                        <div className="section-title">
                          <span className="spark-icon">
                            <Sparkles size={18} />
                          </span>
                          <h2>Ask Veritas</h2>
                        </div>
                        <span className="mini-pill">Evidence mode</span>
                      </div>
                      <div className="ask-intro">
                        <h3>Good questions deserve grounded answers.</h3>
                        <p>Ask about policies, security, or customer operations.</p>
                      </div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          ask();
                        }}
                      >
                        <div className="composer">
                          <label className="sr-only" htmlFor="question">
                            Ask a question
                          </label>
                          <textarea
                            id="question"
                            maxLength={1200}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="What would you like to know about your company?"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                e.preventDefault();
                                ask();
                              }
                            }}
                          />
                          <div className="composer-footer">
                            <span>
                              <LockKeyhole size={13} />
                              Your workspace only
                            </span>
                            <button className="primary" disabled={busy || !question.trim()}>
                              {busy ? (
                                <LoaderCircle className="spin" size={16} />
                              ) : (
                                <ArrowRight size={17} />
                              )}
                              <span>{busy ? "Checking evidence…" : "Ask Veritas"}</span>
                            </button>
                          </div>
                        </div>
                      </form>
                      <div className="try-label">A GOOD PLACE TO START</div>
                      <div className="prompt-grid">
                        {prompts.map(([label, q]) => (
                          <button key={q} onClick={() => ask(q)} disabled={busy}>
                            <span>{label}</span>
                            <strong>{q}</strong>
                            <ArrowUpRight size={15} />
                          </button>
                        ))}
                      </div>
                      <div className="engine-note">
                        <CheckCheck size={14} />
                        Extractive answers · cited sources · no external AI model
                      </div>
                    </section>
                    {answer && (
                      <section className="answer-card card" aria-live="polite">
                        <div className="card-header">
                          <div className="section-title">
                            <ShieldCheck size={20} />
                            <h2>Evidence report</h2>
                          </div>
                          <Badge value={answer.outcome} />
                        </div>
                        <h3>{asked}</h3>
                        <p>{answer.message}</p>
                        {answer.citations.map((c, i) => (
                          <div className="citation" key={c.id}>
                            <div>
                              <span className="citation-number">{i + 1}</span>
                              <strong>{c.title}</strong>
                              <span className="mini-pill">{c.kind}</span>
                            </div>
                            <blockquote>{c.excerpt}</blockquote>
                            <button
                              onClick={() =>
                                setSelected(sources.find((s) => s.id === c.id) || null)
                              }
                            >
                              Inspect source <ArrowUpRight size={13} />
                            </button>
                          </div>
                        ))}
                        <div className="answer-footer">
                          <span>{answer.excluded} sources excluded by safeguards</span>
                          <span>
                            {answer.elapsed != null ? `${answer.elapsed} ms · ` : ""}Saved to audit
                            trail
                          </span>
                        </div>
                      </section>
                    )}
                    <section className="recent card">
                      <div className="card-header">
                        <h2>Recent activity</h2>
                        <button className="text-button" onClick={() => navigate("Audit trail")}>
                          View audit trail <ArrowRight size={14} />
                        </button>
                      </div>
                      {history.length ? (
                        history.slice(0, 3).map((e) => (
                          <button
                            className="activity-row"
                            key={e.id}
                            onClick={() => {
                              setAnswer(JSON.parse(e.detail));
                              setAsked(e.question);
                            }}
                          >
                            <span className="activity-icon">
                              <MessageSquare size={15} />
                            </span>
                            <span className="activity-question">
                              {e.question}
                              <small>{new Date(e.created).toLocaleString()}</small>
                            </span>
                            <Badge value={e.outcome} />
                            <ChevronRight size={15} />
                          </button>
                        ))
                      ) : (
                        <div className="empty-inline">
                          <Activity size={23} />
                          <div>
                            <strong>A clean slate. A clear trail.</strong>
                            <p>Your first question will appear here with its safety decision.</p>
                          </div>
                        </div>
                      )}
                    </section>
                  </div>
                  <aside className="right-rail">
                    <section className="guard-card card">
                      <div className="card-header">
                        <h2>
                          <ShieldCheck size={18} />
                          Safety pipeline
                        </h2>
                        <span className="live-dot" />
                      </div>
                      <p className="muted">Every request goes through the same checks.</p>
                      <div className="pipeline">
                        {(
                          answer?.checks || [
                            {
                              label: "Request screening",
                              detail: "Check for sensitive requests.",
                              state: "",
                            },
                            {
                              label: "Access control",
                              detail: "Respect document permissions.",
                              state: "",
                            },
                            {
                              label: "Source integrity",
                              detail: "Verify trust and freshness.",
                              state: "",
                            },
                            {
                              label: "Evidence grounding",
                              detail: "Cite or withhold the answer.",
                              state: "",
                            },
                            {
                              label: "Output redaction",
                              detail: "Mask sensitive patterns.",
                              state: "",
                            },
                          ]
                        ).map((c, i) => (
                          <div className="pipeline-step" key={c.label}>
                            <span className={"step-circle " + c.state}>
                              {c.state === "passed" ? (
                                <Check size={13} />
                              ) : c.state === "blocked" ? (
                                <X size={13} />
                              ) : (
                                i + 1
                              )}
                            </span>
                            <div>
                              <strong>{c.label}</strong>
                              <p>{c.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="guard-footer">
                        <LockKeyhole size={13} />
                        Enforced on the server
                      </div>
                    </section>
                    <section className="connected card">
                      <div className="card-header">
                        <h2>Knowledge, connected</h2>
                      </div>
                      {["Wiki", "SQL", "API"].map((k) => (
                        <div className="connected-row" key={k}>
                          <KindIcon kind={k} />
                          <div>
                            <strong>
                              {k === "Wiki"
                                ? "Internal wikis"
                                : k === "SQL"
                                  ? "SQL snapshots"
                                  : "API payloads"}
                            </strong>
                            <small>{sources.filter((s) => s.kind === k).length} sources</small>
                          </div>
                          <span className={"tiny-tag " + (k === "API" ? "amber" : "")}>
                            {k === "API" ? "Review" : "Demo"}
                          </span>
                        </div>
                      ))}
                      <button className="text-button" onClick={() => navigate("Sources")}>
                        Manage sources <ArrowRight size={14} />
                      </button>
                    </section>
                    <div className="rail-note">
                      <span>BUILT FOR PROMPT WARS</span>
                      <p>
                        Less blind trust.
                        <br />
                        <strong>More visible evidence.</strong>
                      </p>
                      <div className="small-orbit">
                        <ShieldCheck size={29} />
                      </div>
                    </div>
                  </aside>
                </div>
              )}
              {tab === "Sources" && (
                <section className="card sources-card">
                  <div className="source-toolbar">
                    <div className="filters">
                      {["All sources", "Wiki", "SQL", "API"].map((f) => (
                        <button
                          key={f}
                          className={filter === f ? "selected" : ""}
                          onClick={() => setFilter(f)}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <label className="search">
                      <Search size={16} />
                      <input
                        aria-label="Search sources"
                        placeholder="Search sources…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Source name</th>
                          <th>Trust status</th>
                          <th>Access</th>
                          <th>Reviewed / imported</th>
                          <th>Retrieval</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((s) => (
                          <tr key={s.id}>
                            <td>
                              <button className="source-name" onClick={() => setSelected(s)}>
                                <KindIcon kind={s.kind} />
                                <span>
                                  {s.title}
                                  <small>
                                    {s.kind} ·{" "}
                                    {s.id.startsWith("wiki-") ||
                                    s.id.startsWith("sql-") ||
                                    s.id.startsWith("api-")
                                      ? "Sample dataset"
                                      : "Imported content"}
                                  </small>
                                </span>
                              </button>
                            </td>
                            <td>
                              <Badge value={s.status} />
                            </td>
                            <td>
                              <span className="access">
                                <LockKeyhole size={12} />
                                {s.access}
                              </span>
                            </td>
                            <td>{s.updated}</td>
                            <td>
                              <button
                                disabled={busy}
                                className={"toggle " + (s.enabled ? "on" : "")}
                                role="switch"
                                aria-checked={!!s.enabled}
                                aria-label={"Enable " + s.title}
                                onClick={() => mutate("toggle", s.id)}
                              >
                                <span />
                              </button>
                            </td>
                            <td>
                              <button
                                className="icon-button"
                                aria-label={"Inspect " + s.title}
                                onClick={() => setSelected(s)}
                              >
                                <ChevronRight size={17} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {!filtered.length && (
                    <div className="empty-inline">No sources match your search.</div>
                  )}
                  <div className="table-footer">
                    <span>{filtered.length} sources</span>
                    <span>Enabled does not override trust or access checks.</span>
                  </div>
                </section>
              )}
              {tab === "Safety policies" && (
                <>
                  <div className="policy-banner">
                    <ShieldCheck size={28} />
                    <div>
                      <h2>Fail closed. Explain why.</h2>
                      <p>
                        If evidence or permission is missing, Veritas withholds the answer and
                        records the decision.
                      </p>
                    </div>
                    <span className="badge green">
                      <i />
                      Always enforced
                    </span>
                  </div>
                  <div className="policy-grid">
                    {policies.map(([title, description], i) => (
                      <section className="card policy" key={title}>
                        <span className="policy-number">0{i + 1}</span>
                        <ShieldCheck size={22} />
                        <h2>{title}</h2>
                        <p>{description}</p>
                        <span className="policy-enabled">
                          <Check size={13} />
                          Enabled on the server
                        </span>
                      </section>
                    ))}
                  </div>
                  <div className="limitations card">
                    <TriangleAlert size={20} />
                    <div>
                      <h3>A transparent prototype</h3>
                      <p>
                        Pattern checks are not comprehensive data-loss prevention. Source approval
                        is a human assertion, not fact verification. Conflict detection is a
                        conservative numeric heuristic. This demo uses text snapshots, not live
                        enterprise connectors, and must undergo security review before handling real
                        confidential data.
                      </p>
                    </div>
                  </div>
                </>
              )}
              {tab === "Audit trail" && (
                <section className="card audit-card">
                  <div className="card-header">
                    <h2>Request history</h2>
                    <span className="muted">Latest 50 requests · your account only</span>
                  </div>
                  {history.length ? (
                    history.map((e) => (
                      <button
                        key={e.id}
                        className="audit-row"
                        onClick={() => {
                          setAnswer(JSON.parse(e.detail));
                          setAsked(e.question);
                          navigate("Assistant");
                        }}
                      >
                        <span className="activity-icon">
                          <Activity size={17} />
                        </span>
                        <div>
                          <strong>{e.question}</strong>
                          <small>
                            {new Date(e.created).toLocaleString()} · {e.id.slice(0, 8)}
                          </small>
                        </div>
                        <Badge value={e.outcome} />
                        <ArrowUpRight size={17} />
                      </button>
                    ))
                  ) : (
                    <div className="big-empty">
                      <Activity size={35} />
                      <h2>Your audit trail starts with a question.</h2>
                      <p>Every answer and refusal is saved here automatically.</p>
                      <button className="primary" onClick={() => navigate("Assistant")}>
                        Ask your first question <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </section>
              )}
            </>
          )}
          <footer className="page-footer">
            <span>
              <Layers3 size={13} />
              VERITAS <b>/</b> Evidence-first enterprise intelligence
            </span>
            <span>Sample data · Private workspace</span>
          </footer>
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          <Check size={17} />
          {notice}
        </div>
      )}
      {(selected || add || help || resetSession) && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setSelected(null);
            setAdd(false);
            setHelp(false);
            setResetSession(false);
          }}
        >
          <section
            className="modal card"
            role="dialog"
            aria-modal="true"
            aria-label={
              resetSession
                ? "Start a new workspace"
                : add
                  ? "Add a source"
                  : selected
                    ? "Source details"
                    : "About Veritas"
            }
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close icon-button"
              autoFocus
              aria-label="Close dialog"
              onClick={() => {
                setSelected(null);
                setAdd(false);
                setHelp(false);
                setResetSession(false);
              }}
            >
              <X size={20} />
            </button>
            {resetSession ? (
              <>
                <span className="spark-icon">
                  <LogOut size={22} />
                </span>
                <h2>Start a new workspace?</h2>
                <p>
                  This ends your current guest session. Your current imports and audit history will
                  no longer be accessible from this browser. Export your audit first if you need a
                  copy.
                </p>
                <div className="dialog-actions">
                  <button
                    className="secondary"
                    onClick={() => setResetSession(false)}
                    disabled={busy}
                  >
                    Keep my workspace
                  </button>
                  <button
                    className="primary"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      setError("");
                      try {
                        const response = await fetch("/api/session", { method: "DELETE" });
                        if (!response.ok)
                          throw new Error("Could not end the session. Please retry.");
                        setAnswer(null);
                        setQuestion("");
                        setAsked("");
                        setSources([]);
                        setHistory([]);
                        setHasWorkspace(false);
                        setEligibleCount(0);
                        setResetSession(false);
                        setLoading(true);
                        await load();
                      } catch (e) {
                        setError(e instanceof Error ? e.message : "Could not end the session.");
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    {busy ? "Starting…" : "Start fresh"}
                  </button>
                </div>
                {error && (
                  <p className="modal-error" role="alert">
                    {error}
                  </p>
                )}
              </>
            ) : selected ? (
              <>
                <KindIcon kind={selected.kind} />
                <h2>{selected.title}</h2>
                <div className="modal-tags">
                  <Badge value={selected.status} />
                  <span className="access">
                    <LockKeyhole size={13} />
                    {selected.access}
                  </span>
                </div>
                <p className="muted">Reviewed / imported {selected.updated}</p>
                <div className="source-content">{selected.content}</div>
                <p className="form-note">
                  Approving a source means you have checked its accuracy and authority. Veritas
                  cannot independently verify these claims.
                </p>
                {selected.status !== "Verified" &&
                  selected.status !== "Quarantined" &&
                  selected.access !== "Restricted" && (
                    <button
                      className="primary"
                      disabled={busy}
                      onClick={() => mutate("verify", selected.id)}
                    >
                      <Check size={16} />I reviewed this source — approve
                    </button>
                  )}
                {error && (
                  <p className="modal-error" role="alert">
                    {error}
                  </p>
                )}
              </>
            ) : add ? (
              <>
                <span className="spark-icon">
                  <Plus size={22} />
                </span>
                <h2>Add knowledge, thoughtfully.</h2>
                <p className="muted">
                  Import a text snapshot. New sources require review before retrieval.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    mutate("add");
                  }}
                >
                  <label>
                    Source name
                    <input
                      required
                      minLength={3}
                      maxLength={120}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Remote work policy"
                    />
                  </label>
                  <label>
                    Source type
                    <select value={kind} onChange={(e) => setKind(e.target.value)}>
                      <option>Wiki</option>
                      <option>SQL</option>
                      <option>API</option>
                    </select>
                  </label>
                  <label>
                    Source content
                    <textarea
                      required
                      minLength={20}
                      maxLength={20000}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Paste the source text or a readable SQL/API snapshot…"
                    />
                  </label>
                  <p className="form-note">
                    Use synthetic or public data in this hackathon demo. SQL and API imports are
                    text snapshots, not live connections.
                  </p>
                  {error && (
                    <p className="modal-error" role="alert">
                      {error}
                    </p>
                  )}
                  <button className="primary" disabled={busy}>
                    <Plus size={16} />
                    {busy ? "Adding…" : "Add for review"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <span className="brand-mark">
                  <Layers3 size={25} />
                </span>
                <h2>
                  Know the source.
                  <br />
                  Trust the process.
                </h2>
                <p>
                  Veritas is an evidence-first enterprise knowledge workbench built for Prompt Wars.
                </p>
                <ol>
                  <li>Add a wiki, SQL, or API text snapshot.</li>
                  <li>Review its content and approve it for retrieval.</li>
                  <li>Ask a question. The server checks trust, freshness, and access.</li>
                  <li>Inspect cited excerpts and the saved decision trail.</li>
                </ol>
                <p className="form-note">
                  This version uses an extractive retrieval engine, not a generative model. No data
                  is sent to an external AI provider. All company records are synthetic examples.
                </p>
                <button
                  className="primary"
                  onClick={() => {
                    setHelp(false);
                    navigate("Assistant");
                  }}
                >
                  Explore the workspace <ArrowRight size={16} />
                </button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
