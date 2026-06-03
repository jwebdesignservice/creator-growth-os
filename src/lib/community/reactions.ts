/**
 * Allowed emoji reactions on community discussion posts. Shared by the server
 * action (validation) and the client reaction bar (picker) so the two can
 * never drift. Plain module — no server-only imports — safe for the client.
 */
export const POST_REACTIONS = ["❤️", "🎉", "👏", "😮", "🔥"] as const;
export type PostReactionEmoji = (typeof POST_REACTIONS)[number];
