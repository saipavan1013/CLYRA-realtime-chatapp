/**
 * Extracts a Firestore Timestamp and converts to milliseconds.
 * Handles both Firestore Timestamp objects and plain JS timestamps.
 */
export function toMillis(timestamp) {
  if (!timestamp) return 0;
  if (typeof timestamp?.toDate === 'function') {
    return timestamp.toDate().getTime();
  }
  return typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
}

/**
 * Checks if a timestamp (ms) is within the given threshold of now.
 */
export function isWithinThreshold(timestampMs, thresholdMs) {
  return Date.now() - timestampMs < thresholdMs;
}
