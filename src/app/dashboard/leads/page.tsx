"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import gsap from "gsap";
import { UserPlus, Loader2, X } from "lucide-react";
import { createLead, getLeads } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium text-white transition-all hover:opacity-95 disabled:opacity-70 disabled:cursor-not-allowed"
      style={{ backgroundColor: "#be7b3c" }}
    >
      {pending ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <UserPlus className="w-5 h-5" />
          Add Lead
        </>
      )}
    </button>
  );
}

const inputClass =
  "w-full px-4 py-2.5 rounded-xl border border-[#e0e0e5] bg-[#fafafa] text-[#151a6c] placeholder:text-[#9a9aab] focus:outline-none focus:ring-2 focus:ring-[#151a6c] focus:border-transparent";
const labelClass = "block text-sm font-medium mb-1.5";

export default function LeadTrackerPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const [leads, setLeads] = useState<
    Array<{
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string | null;
      webhook_path: string | null;
      created_at: string;
    }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const leadsData = await getLeads();
        setLeads(leadsData as typeof leads);
      } catch {
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!dialogRef.current || !dialogContentRef.current) return;
    if (dialogOpen) {
      dialogRef.current.showModal();
      const ctx = gsap.context(() => {
        gsap.fromTo(
          dialogContentRef.current,
          { opacity: 0, scale: 0.96, y: 8 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.25,
            ease: "power2.out",
          }
        );
      });
      return () => ctx.revert();
    } else {
      dialogRef.current.close();
    }
  }, [dialogOpen]);

  function handleDialogClose() {
    setDialogOpen(false);
    setError(null);
  }

  function handleDialogBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) handleDialogClose();
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await createLead(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    formRef.current?.reset();
    handleDialogClose();
    const leadsData = await getLeads();
    setLeads(leadsData as typeof leads);
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".lead-list-block",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2
          className="text-2xl font-semibold"
          style={{ color: "#151a6c" }}
        >
          Lead Tracker
        </h2>
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl font-medium text-white transition-all hover:opacity-95 active:scale-[0.99]"
          style={{ backgroundColor: "#be7b3c" }}
        >
          <UserPlus className="w-5 h-5" />
          Add Lead
        </button>
      </div>

      <dialog
        ref={dialogRef}
        onClose={handleDialogClose}
        onClick={handleDialogBackdropClick}
        className="fixed top-1/2 left-1/2 w-[min(calc(100vw-2rem),28rem)] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#e8e8ec] shadow-xl p-0 bg-white backdrop:bg-black/40 backdrop:backdrop-blur-sm"
        aria-labelledby="add-lead-title"
        aria-modal="true"
      >
        <div ref={dialogContentRef} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3
              id="add-lead-title"
              className="text-lg font-semibold"
              style={{ color: "#151a6c" }}
            >
              Add lead
            </h3>
            <button
              type="button"
              onClick={handleDialogClose}
              className="p-2 rounded-lg text-[#5a5a6e] hover:bg-[#f0f0f0] hover:text-[#151a6c] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form
            ref={formRef}
            action={handleSubmit}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div>
              <label htmlFor="modal_first_name" className={labelClass} style={{ color: "#151a6c" }}>
                First name
              </label>
              <input
                id="modal_first_name"
                name="first_name"
                type="text"
                required
                className={inputClass}
                placeholder="Jane"
              />
            </div>
            <div>
              <label htmlFor="modal_last_name" className={labelClass} style={{ color: "#151a6c" }}>
                Last name
              </label>
              <input
                id="modal_last_name"
                name="last_name"
                type="text"
                required
                className={inputClass}
                placeholder="Doe"
              />
            </div>
            <div>
              <label htmlFor="modal_email" className={labelClass} style={{ color: "#151a6c" }}>
                Email
              </label>
              <input
                id="modal_email"
                name="email"
                type="email"
                required
                className={inputClass}
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label htmlFor="modal_phone" className={labelClass} style={{ color: "#151a6c" }}>
                Phone
              </label>
              <input
                id="modal_phone"
                name="phone"
                type="tel"
                className={inputClass}
                placeholder="(555) 123-4567"
              />
            </div>
            {error && (
              <p className="sm:col-span-2 text-sm text-red-600">{error}</p>
            )}
            <div className="sm:col-span-2 flex gap-3">
              <button
                type="button"
                onClick={handleDialogClose}
                className="flex-1 py-3 rounded-xl font-medium border border-[#e0e0e5] text-[#151a6c] hover:bg-[#f8f7f4] transition-colors"
              >
                Cancel
              </button>
              <div className="flex-1">
                <SubmitButton />
              </div>
            </div>
          </form>
        </div>
      </dialog>

      <section className="lead-list-block">
        <div className="bg-white rounded-2xl border border-[#e8e8ec] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e8e8ec]">
            <h3
              className="text-lg font-semibold"
              style={{ color: "#151a6c" }}
            >
              Recent leads
            </h3>
          </div>
          {loading ? (
            <div className="p-8 text-center text-[#5a5a6e]">Loading…</div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center text-[#5a5a6e]">
              No leads yet. Click &quot;Add Lead&quot; to add one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e8e8ec] bg-[#f8f7f4]">
                    <th className="text-left py-3 px-4 font-medium" style={{ color: "#151a6c" }}>Name</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: "#151a6c" }}>Email</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: "#151a6c" }}>Phone</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: "#151a6c" }}>Source</th>
                    <th className="text-left py-3 px-4 font-medium" style={{ color: "#151a6c" }}>Added</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-[#e8e8ec] hover:bg-[#fafafa]"
                    >
                      <td className="py-3 px-4 font-medium" style={{ color: "#151a6c" }}>
                        {lead.first_name} {lead.last_name}
                      </td>
                      <td className="py-3 px-4 text-[#5a5a6e]">{lead.email}</td>
                      <td className="py-3 px-4 text-[#5a5a6e]">{lead.phone || "—"}</td>
                      <td className="py-3 px-4">
                        <span
                          className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium font-mono"
                          style={{
                            backgroundColor: "rgba(190, 123, 60, 0.15)",
                            color: "#be7b3c",
                          }}
                        >
                          {lead.webhook_path ?? "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#5a5a6e]">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
