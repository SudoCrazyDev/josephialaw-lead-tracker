"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RetellWebClient } from "retell-client-js-sdk";

type CallStatus = "idle" | "connecting" | "connected" | "ended" | "error";

export default function TalkPage() {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const clientRef = useRef<RetellWebClient | null>(null);

  const getClient = useCallback(() => {
    if (!clientRef.current) {
      clientRef.current = new RetellWebClient();
    }
    return clientRef.current;
  }, []);

  const startCall = useCallback(async () => {
    setErrorMessage(null);
    setStatus("connecting");
    setTranscript("");

    try {
      const res = await fetch("/api/retell/web-call", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to start call");
      }
      const { access_token } = await res.json();

      const client = getClient();
      await client.startCall({ accessToken: access_token });
      setStatus("connected");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }, [getClient]);

  const endCall = useCallback(() => {
    const client = clientRef.current;
    if (client) {
      client.stopCall();
    }
    setStatus("ended");
  }, []);

  useEffect(() => {
    const client = getClient();

    const onCallStarted = () => setStatus("connected");
    const onCallEnded = () => setStatus("ended");
    const onUpdate = (update: { transcript?: string }) => {
      if (typeof update?.transcript === "string") {
        setTranscript(update.transcript);
      }
    };
    const onError = (error: unknown) => {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "An error occurred");
    };

    client.on("call_started", onCallStarted);
    client.on("call_ended", onCallEnded);
    client.on("update", onUpdate);
    client.on("error", onError);

    return () => {
      client.off("call_started", onCallStarted);
      client.off("call_ended", onCallEnded);
      client.off("update", onUpdate);
      client.off("error", onError);
    };
  }, [getClient]);

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-[#e0e0e8] bg-white shadow-sm overflow-hidden">
        <header className="px-6 py-4 border-b border-[#e0e0e8] bg-white">
          <h1 className="text-lg font-semibold text-[#151a6c]">Talk to our AI agent</h1>
          <p className="text-sm text-[#5a5a6e] mt-0.5">
            {status === "idle" && "Click Start call to begin."}
            {status === "connecting" && "Connecting…"}
            {status === "connected" && "You’re on the call. Speak or click End call when done."}
            {status === "ended" && "Call ended. Start a new call anytime."}
            {status === "error" && (errorMessage || "Something went wrong.")}
          </p>
        </header>

        <main className="p-6 min-h-[200px]">
          {transcript ? (
            <div className="text-sm text-[#2a2a3e] whitespace-pre-wrap rounded-lg bg-[#f0f0f4] p-4 max-h-[280px] overflow-y-auto">
              {transcript}
            </div>
          ) : (
            <div className="text-sm text-[#9a9aae] text-center py-8">
              {status === "connected"
                ? "Transcript will appear here as you talk…"
                : "Transcript will show here after you start the call."}
            </div>
          )}
        </main>

        <footer className="px-6 py-4 border-t border-[#e0e0e8] bg-[#f8f7f4] flex flex-wrap gap-3 justify-center">
          {status !== "connected" && status !== "connecting" && (
            <button
              type="button"
              onClick={startCall}
              className="px-5 py-2.5 rounded-lg font-medium text-white bg-[#151a6c] hover:bg-[#0f1347] transition-colors"
            >
              Start call
            </button>
          )}
          {(status === "connected" || status === "connecting") && (
            <button
              type="button"
              onClick={endCall}
              className="px-5 py-2.5 rounded-lg font-medium text-white bg-[#be7b3c] hover:bg-[#a66a32] transition-colors"
            >
              End call
            </button>
          )}
          {status === "ended" && (
            <button
              type="button"
              onClick={startCall}
              className="px-5 py-2.5 rounded-lg font-medium text-white bg-[#151a6c] hover:bg-[#0f1347] transition-colors"
            >
              Start new call
            </button>
          )}
        </footer>
      </div>

      <p className="mt-4 text-xs text-[#9a9aae] text-center max-w-md">
        Share this page link with users so they can talk to your Retell AI agent. No login required.
      </p>
    </div>
  );
}
