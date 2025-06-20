/**
 * Types index file
 * Re-exports all types from various categorized files
 */

export interface VerificationRecord {
  id: string;
  created_at: string;
  status: string;
  type: string;
  claim_id?: string;
  result?: string;
  error?: string;
}
