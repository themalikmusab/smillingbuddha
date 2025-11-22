/**
 * Formatting utilities for display
 */

import { format, formatDistance } from 'date-fns';

/**
 * Format timestamp to readable time
 */
export function formatTime(timestamp: number): string {
  return format(new Date(timestamp), 'HH:mm:ss');
}

/**
 * Format timestamp to readable date and time
 */
export function formatDateTime(timestamp: number): string {
  return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss');
}

/**
 * Format duration in seconds to readable string
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Format time distance (e.g., "2 minutes ago")
 */
export function formatTimeDistance(timestamp: number): string {
  return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
}

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength - 3)}...`;
}

/**
 * Format FPS with one decimal place
 */
export function formatFPS(fps: number): string {
  return fps.toFixed(1);
}

/**
 * Calculate percentage
 */
export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}
