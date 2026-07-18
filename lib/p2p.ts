import Corestore from "corestore";
import Hyperswarm from "hyperswarm";
import crypto from "crypto";
import path from "path";
import b4a from "b4a";

/**
 * P2P sync layer for Nebula Drive.
 *
 * - Hypercore: an append-only, cryptographically-signed log. Every file
 *   event (upload / rename / delete) for a user is appended here. This is
 *   the thing that actually gets replicated peer-to-peer.
 * - Hyperswarm: peer discovery + connection layer. Peers join a shared
 *   "topic" (derived from the user's id) and Hyperswarm's DHT (built on
 *   UDP hole punching) finds other peers on that topic and establishes a
 *   direct connection between them wherever possible, falling back to a
 *   relay only when a direct hole-punched connection can't be made.
 *
 * Firebase/Firestore stays the authoritative metadata index + realtime DB
 * for the UI (fast reads, queries, security rules). This module is the
 * decentralized sync path that runs alongside it: any peer holding the
 * same core (e.g. another one of the user's devices, or a collaborator
 * who was given the core's public key) can replicate the log directly.
 */

type FileEvent = {
  type: "upload" | "rename" | "delete";
  fileId: string;
  fileName: string;
  size?: number;
  mimeType?: string;
  timestamp: number;
};

interface UserSwarm {
  core: any;
  swarm: any;
  peerCount: number;
}

// Reuse across hot-reloads / requests within the same Node process,
// same pattern used for the Firebase singleton in firebase.ts.
const globalForP2P = global as unknown as {
  __nebulaCorestore?: any;
  __nebulaSwarms?: Map<string, UserSwarm>;
};

function getCorestore() {
  if (!globalForP2P.__nebulaCorestore) {
    globalForP2P.__nebulaCorestore = new Corestore(
      path.join(process.cwd(), ".nebula-p2p")
    );
  }
  return globalForP2P.__nebulaCorestore;
}

function getSwarmRegistry() {
  if (!globalForP2P.__nebulaSwarms) {
    globalForP2P.__nebulaSwarms = new Map();
  }
  return globalForP2P.__nebulaSwarms;
}

// Deterministic 32-byte discovery topic derived from the user id.
// Anyone who knows the userId (e.g. an authorized peer device) can
// derive the same topic and find the swarm.
function topicForUser(userId: string): Buffer {
  return crypto.createHash("sha256").update(`nebula-drive:${userId}`).digest();
}

export async function joinUserSwarm(userId: string): Promise<{
  discoveryKey: string;
  peers: number;
}> {
  const registry = getSwarmRegistry();
  const existing = registry.get(userId);
  if (existing) {
    return {
      discoveryKey: b4a.toString(existing.core.discoveryKey, "hex"),
      peers: existing.peerCount,
    };
  }

  const store = getCorestore();
  // One append-only core per user, named deterministically so re-opening
  // the app resumes the same core instead of creating a new one.
  const core = store.get({ name: `user-${userId}-files` });
  await core.ready();

  const swarm = new Hyperswarm();
  const topic = topicForUser(userId);

  const entry: UserSwarm = { core, swarm, peerCount: 0 };
  registry.set(userId, entry);

  swarm.on("connection", (conn: any) => {
    entry.peerCount += 1;
    // Replicate the hypercore feed directly over this peer connection.
    // Hyperswarm has already done the NAT traversal (hole punching via
    // its DHT) to establish this socket, direct peer-to-peer, before we
    // get here.
    core.replicate(conn);
    conn.on("close", () => {
      entry.peerCount = Math.max(0, entry.peerCount - 1);
    });
    conn.on("error", () => {
      entry.peerCount = Math.max(0, entry.peerCount - 1);
    });
  });

  // server: true  -> announce ourselves so other peers can find us
  // client: true  -> also actively look for peers announcing this topic
  swarm.join(topic, { server: true, client: true });
  await swarm.flush();

  return {
    discoveryKey: b4a.toString(core.discoveryKey, "hex"),
    peers: entry.peerCount,
  };
}

export async function appendFileEvent(userId: string, event: FileEvent) {
  const registry = getSwarmRegistry();
  let entry = registry.get(userId);
  if (!entry) {
    await joinUserSwarm(userId);
    entry = registry.get(userId)!;
  }
  await entry.core.append(JSON.stringify(event));
  return { length: entry.core.length };
}

export function getSwarmStatus(userId: string) {
  const registry = getSwarmRegistry();
  const entry = registry.get(userId);
  if (!entry) return null;
  return {
    discoveryKey: b4a.toString(entry.core.discoveryKey, "hex"),
    length: entry.core.length,
    peers: entry.peerCount,
  };
}

export async function getFileLog(userId: string): Promise<FileEvent[]> {
  const registry = getSwarmRegistry();
  const entry = registry.get(userId);
  if (!entry) return [];
  const events: FileEvent[] = [];
  for (let i = 0; i < entry.core.length; i++) {
    const block = await entry.core.get(i);
    try {
      events.push(JSON.parse(b4a.toString(block)));
    } catch {
      // skip malformed entries
    }
  }
  return events;
}
