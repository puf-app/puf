/**
 * Backend may return the user at the top level, under `user`, `profile`, or `data`,
 * and `_id` may be a string or Mongo-extended JSON `{ $oid: "..." }`.
 */
export function extractMongoId(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string' && value.trim() !== '') return value.trim();
  if (typeof value === 'object' && value !== null && '$oid' in value) {
    return String((value as { $oid: string }).$oid);
  }
  return String(value);
}

/**
 * Unwrap profile payload from GET /api/users/getCurrentUserProfile (or similar).
 * Handles e.g. `{ user: {...} }`, `{ data: { user: {...} } }`, or flat user object.
 */
export function unwrapUserProfile(data: unknown): Record<string, unknown> {
  if (data == null || typeof data !== 'object') {
    throw new Error('Invalid profile response');
  }
  let node = data as Record<string, unknown>;
  for (let i = 0; i < 5; i++) {
    if (extractMongoId(node._id ?? node.id)) return node;
    const next = node.user ?? node.profile ?? node.data;
    if (next && typeof next === 'object') {
      node = next as Record<string, unknown>;
      continue;
    }
    break;
  }
  return node;
}

export function getProfileUserId(data: unknown): string {
  const obj = unwrapUserProfile(data);
  const id = extractMongoId(obj._id ?? obj.id);
  if (!id) {
    throw new Error('Profile response has no user id');
  }
  return id;
}
