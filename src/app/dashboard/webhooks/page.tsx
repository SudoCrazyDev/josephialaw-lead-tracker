"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Webhook, ChevronDown, CheckCircle, XCircle, AlertCircle, Copy, ExternalLink } from "lucide-react";
import { getWebhookLogs, getWebhookPaths, getAppUrl, WEBHOOK_ENDPOINTS, type WebhookLogRow } from "./actions";

function StatusBadge({ statusCode }: { statusCode: number }) {
  const isSuccess = statusCode >= 200 && statusCode < 300;
  const isClientError = statusCode >= 400 && statusCode < 500;
  const Icon = isSuccess ? CheckCircle : isClientError ? AlertCircle : XCircle;
  const bg = isSuccess
    ? "rgba(34, 197, 94, 0.15)"
    : isClientError
      ? "rgba(234, 179, 8, 0.15)"
      : "rgba(239, 68, 68, 0.15)";
  const color = isSuccess ? "#16a34a" : isClientError ? "#ca8a04" : "#dc2626";

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
      style={{ backgroundColor: bg, color }}
    >
      <Icon className="w-3.5 h-3.5" />
      {statusCode}
    </span>
  );
}

export default function WebhooksPage() {
  const [logs, setLogs] = useState<WebhookLogRow[]>([]);
  const [paths, setPaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPath, setFilterPath] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [appUrl, setAppUrl] = useState("");
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAppUrl().then(setAppUrl);
  }, []);

  async function copyWebhookUrl(path: string) {
    const url = `${appUrl.replace(/\/$/, "")}/api/webhooks/${path}`;
    await navigator.clipboard.writeText(url);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pathsData, logsData] = await Promise.all([
        getWebhookPaths(),
        getWebhookLogs({
          webhook_path: filterPath || undefined,
          status_code: filterStatus ? parseInt(filterStatus, 10) : undefined,
          limit: 100,
        }),
      ]);
      setPaths(pathsData);
      setLogs(logsData);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filterPath, filterStatus]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".webhook-log-row",
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.02, ease: "power2.out" }
      );
    }, tableRef);
    return () => ctx.revert();
  }, [logs]);

  return (
    <div className="space-y-6">
      {appUrl && (
        <div className="bg-white rounded-2xl border border-[#e8e8ec] shadow-sm p-5">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: "#151a6c" }}>
            <ExternalLink className="w-4 h-4" />
            Webhook URLs for testing (NEXT_APP_URL)
          </h3>
          <p className="text-sm text-[#5a5a6e] mb-4">
            Use these URLs with localtunnel or your public URL. Send <code className="px-1.5 py-0.5 rounded bg-[#f0f0f0] text-xs">POST</code> with JSON or form body.
          </p>
          <ul className="space-y-2">
            {WEBHOOK_ENDPOINTS.map(({ path, label }) => {
              const fullUrl = `${appUrl.replace(/\/$/, "")}/api/webhooks/${path}`;
              const isCopied = copiedPath === path;
              return (
                <li key={path} className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium w-40 shrink-0" style={{ color: "#151a6c" }}>
                    {label}
                  </span>
                  <code className="flex-1 min-w-0 text-xs text-[#5a5a6e] truncate font-mono bg-[#f8f7f4] px-2 py-1.5 rounded-lg">
                    {fullUrl}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyWebhookUrl(path)}
                    className="flex items-center gap-1.5 shrink-0 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors"
                    style={{ backgroundColor: "rgba(190, 123, 60, 0.15)", color: "#be7b3c" }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {isCopied ? "Copied" : "Copy"}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2
          className="text-2xl font-semibold flex items-center gap-2"
          style={{ color: "#151a6c" }}
        >
          <Webhook className="w-7 h-7" />
          Webhook logs
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={filterPath}
              onChange={(e) => setFilterPath(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 rounded-xl border border-[#e0e0e5] bg-white text-[#151a6c] text-sm focus:outline-none focus:ring-2 focus:ring-[#151a6c] focus:border-transparent"
            >
              <option value="">All webhooks</option>
              {paths.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
          </div>
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 rounded-xl border border-[#e0e0e5] bg-white text-[#151a6c] text-sm focus:outline-none focus:ring-2 focus:ring-[#151a6c] focus:border-transparent"
            >
              <option value="">All statuses</option>
              <option value="201">201 Created</option>
              <option value="200">200 OK</option>
              <option value="400">400 Bad Request</option>
              <option value="401">401 Unauthorized</option>
              <option value="415">415 Unsupported</option>
              <option value="500">500 Error</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a5a6e]" />
          </div>
          <button
            type="button"
            onClick={() => load()}
            className="py-2 px-4 rounded-xl border border-[#e0e0e5] text-sm font-medium hover:bg-[#f8f7f4] transition-colors"
            style={{ color: "#151a6c" }}
          >
            Refresh
          </button>
        </div>
      </div>

      <div
        ref={tableRef}
        className="bg-white rounded-2xl border border-[#e8e8ec] shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="p-12 text-center text-[#5a5a6e]">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-[#5a5a6e]">
            No webhook requests yet. Requests will appear here when your forms or integrations call the webhook URLs.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e8e8ec] bg-[#f8f7f4]">
                  <th className="text-left py-3 px-4 font-medium" style={{ color: "#151a6c" }}>
                    Time
                  </th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: "#151a6c" }}>
                    Webhook
                  </th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: "#151a6c" }}>
                    Method
                  </th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: "#151a6c" }}>
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: "#151a6c" }}>
                    Lead
                  </th>
                  <th className="text-left py-3 px-4 font-medium" style={{ color: "#151a6c" }}>
                    Error
                  </th>
                  <th className="text-left py-3 px-4 font-medium w-16" style={{ color: "#151a6c" }} />
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <Fragment key={log.id}>
                    <tr
                      key={log.id}
                      className="webhook-log-row border-b border-[#e8e8ec] hover:bg-[#fafafa]"
                    >
                      <td className="py-3 px-4 text-[#5a5a6e] whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs" style={{ color: "#151a6c" }}>
                        {log.webhook_path}
                      </td>
                      <td className="py-3 px-4 text-[#5a5a6e]">{log.method}</td>
                      <td className="py-3 px-4">
                        <StatusBadge statusCode={log.status_code} />
                      </td>
                      <td className="py-3 px-4 text-[#5a5a6e]">
                        {log.lead_id ? (
                          <span className="text-green-600">Created</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#5a5a6e] max-w-[200px] truncate">
                        {log.error_message ?? "—"}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(expandedId === log.id ? null : log.id)
                          }
                          className="text-xs font-medium hover:underline"
                          style={{ color: "#be7b3c" }}
                        >
                          {expandedId === log.id ? "Hide" : "Details"}
                        </button>
                      </td>
                    </tr>
                    {expandedId === log.id && (
                      <tr className="bg-[#f8f7f4] border-b border-[#e8e8ec]">
                        <td colSpan={7} className="py-3 px-4">
                          <div className="grid gap-4 sm:grid-cols-2 text-xs">
                            <div>
                              <p className="font-semibold mb-1" style={{ color: "#151a6c" }}>
                                Request body
                              </p>
                              <pre className="p-3 rounded-lg bg-white border border-[#e8e8ec] overflow-x-auto max-h-40 overflow-y-auto">
                                {JSON.stringify(log.request_body ?? {}, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <p className="font-semibold mb-1" style={{ color: "#151a6c" }}>
                                Response body
                              </p>
                              <pre className="p-3 rounded-lg bg-white border border-[#e8e8ec] overflow-x-auto max-h-40 overflow-y-auto">
                                {JSON.stringify(log.response_body ?? {}, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
