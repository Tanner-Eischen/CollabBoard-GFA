/**
 * Shared user types for CollabBoard.
 */

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  provider: string;
  providerId: string;
}
