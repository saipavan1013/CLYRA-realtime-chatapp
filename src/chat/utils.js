/**
 * Formats a timestamp for message display.
 * Returns "2:30 PM" for today, "Yesterday 2:30 PM" for yesterday,
 * or "Jan 15, 2:30 PM" for older dates.
 */
export function formatMessageTime(timestamp) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday =
    date.toDateString() === new Date(now - 864e5).toDateString();

  const timeStr = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) return timeStr;
  if (isYesterday) return `Yesterday ${timeStr}`;
  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
