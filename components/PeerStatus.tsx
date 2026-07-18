"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Radio } from "lucide-react";

const PeerStatus = () => {
  const { isSignedIn } = useUser();
  const [peers, setPeers] = useState<number | null>(null);
  const [discoveryKey, setDiscoveryKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;

    let cancelled = false;

    const join = async () => {
      try {
        const res = await fetch("/api/p2p/join", { method: "POST" });
        if (!res.ok) return; // not authenticated yet, or route unavailable — skip silently
        const data = await res.json();
        if (!cancelled && data.ok) {
          setDiscoveryKey(data.discoveryKey);
          setPeers(data.peers);
        }
      } catch (err) {
        console.error("Failed to join P2P swarm", err);
      }
    };

    const poll = async () => {
      try {
        const res = await fetch("/api/p2p/status");
        if (!res.ok) return; // not authenticated yet, or route unavailable — skip silently
        const data = await res.json();
        if (!cancelled && data.ok && data.status) {
          setPeers(data.status.peers);
        }
      } catch (err) {
        console.error("Failed to poll P2P status", err);
      }
    };

    join();
    const interval = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isSignedIn]);

  if (!isSignedIn || discoveryKey === null) return null;

  return (
    <div
      className="flex items-center space-x-1 text-xs text-slate-400"
      title={`Discovery key: ${discoveryKey}`}
    >
      <Radio className="h-3 w-3" />
      <span>
        {peers && peers > 0 ? `${peers} peer${peers > 1 ? "s" : ""} connected` : "Swarm active"}
      </span>
    </div>
  );
};

export default PeerStatus;
