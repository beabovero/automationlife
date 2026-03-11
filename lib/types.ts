export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'retrying' | 'partial'
export type AccountStatus = 'pending' | 'active' | 'failed' | 'banned'
export type TransactionType = 'purchase' | 'deduction' | 'refund' | 'admin_grant'

// ─── Row types ────────────────────────────────────────────────────────────────

type UserSettingsRow = {
  id: string
  user_id: string
  geelark_api_key: string | null
  credits: number
  total_accounts_created: number
  trial_used: boolean
  plan: string | null
  plan_expires_at: string | null
  created_at: string
  updated_at: string
}

type JobRow = {
  id: string
  user_id: string
  status: JobStatus
  total_accounts: number
  completed_accounts: number
  failed_accounts: number
  credits_reserved: number
  credits_charged: number
  config: Json
  created_at: string
  updated_at: string
  started_at: string | null
  completed_at: string | null
  worker_id: string | null
  error_message: string | null
}

type AccountRow = {
  id: string
  job_id: string
  user_id: string
  status: AccountStatus
  geelark_phone_id: string | null
  geelark_profile_id: string | null
  bumble_username: string | null
  phone_number: string | null
  sms_provider_order_id: string | null
  stage_reached: number | null
  current_checkpoint: string | null
  error_message: string | null
  retry_count: number
  credits_charged: number
  created_at: string
  updated_at: string
  completed_at: string | null
}

type AccountPhotoRow = {
  id: string
  account_id: string
  job_id: string
  user_id: string
  storage_path: string
  original_filename: string | null
  order_index: number
  created_at: string
}

type AccountStatusEventRow = {
  id: string
  account_id: string
  job_id: string
  user_id: string
  stage: number | null
  checkpoint: string | null
  status: string
  message: string | null
  metadata: Json | null
  created_at: string
}

type CreditTransactionRow = {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  description: string | null
  job_id: string | null
  account_id: string | null
  created_at: string
}

// ─── Database schema ──────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      user_settings: {
        Row: UserSettingsRow
        Insert: {
          user_id: string
          geelark_api_key?: string | null
          credits?: number
          total_accounts_created?: number
          trial_used?: boolean
          plan?: string | null
          plan_expires_at?: string | null
        }
        Update: {
          geelark_api_key?: string | null
          credits?: number
          total_accounts_created?: number
          trial_used?: boolean
          plan?: string | null
          plan_expires_at?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: { user_id: string; created_at: string }
        Insert: { user_id: string }
        Update: Record<string, never>
        Relationships: []
      }
      jobs: {
        Row: JobRow
        Insert: {
          user_id: string
          status: JobStatus
          total_accounts: number
          completed_accounts: number
          failed_accounts: number
          credits_reserved: number
          credits_charged: number
          config: Json
          started_at?: string | null
          completed_at?: string | null
          worker_id?: string | null
          error_message?: string | null
        }
        Update: {
          status?: JobStatus
          completed_accounts?: number
          failed_accounts?: number
          credits_charged?: number
          config?: Json
          started_at?: string | null
          completed_at?: string | null
          worker_id?: string | null
          error_message?: string | null
        }
        Relationships: []
      }
      accounts: {
        Row: AccountRow
        Insert: {
          job_id: string
          user_id: string
          status: AccountStatus
          geelark_phone_id?: string | null
          geelark_profile_id?: string | null
          bumble_username?: string | null
          phone_number?: string | null
          sms_provider_order_id?: string | null
          stage_reached?: number | null
          current_checkpoint?: string | null
          error_message?: string | null
          retry_count?: number
          credits_charged?: number
          completed_at?: string | null
        }
        Update: {
          status?: AccountStatus
          geelark_phone_id?: string | null
          geelark_profile_id?: string | null
          bumble_username?: string | null
          phone_number?: string | null
          sms_provider_order_id?: string | null
          stage_reached?: number | null
          current_checkpoint?: string | null
          error_message?: string | null
          retry_count?: number
          credits_charged?: number
          completed_at?: string | null
        }
        Relationships: []
      }
      account_photos: {
        Row: AccountPhotoRow
        Insert: {
          account_id: string
          job_id: string
          user_id: string
          storage_path: string
          original_filename?: string | null
          order_index: number
        }
        Update: Record<string, never>
        Relationships: []
      }
      account_status_events: {
        Row: AccountStatusEventRow
        Insert: {
          account_id: string
          job_id: string
          user_id: string
          stage?: number | null
          checkpoint?: string | null
          status: string
          message?: string | null
          metadata?: Json | null
        }
        Update: Record<string, never>
        Relationships: []
      }
      credit_transactions: {
        Row: CreditTransactionRow
        Insert: {
          user_id: string
          type: TransactionType
          amount: number
          description?: string | null
          job_id?: string | null
          account_id?: string | null
        }
        Update: Record<string, never>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// ─── Convenience exports ──────────────────────────────────────────────────────

export type UserSettings = UserSettingsRow
export type Job = JobRow
export type Account = AccountRow
export type AccountPhoto = AccountPhotoRow
export type AccountStatusEvent = AccountStatusEventRow
export type CreditTransaction = CreditTransactionRow

// Per-account config — one entry per Bumble account in the batch
// Field names match EXACTLY what desktop_automation.py reads:
//   profile.get("desiredName"), profile.get("birthday"), profile.get("gender")
//   context["profileName"] (from metadata.profileName)
export interface AccountConfig {
  profileName: string        // Geelark dashboard label (e.g. @handle, Order#123)
  profileNote: string        // Optional remarks shown in Geelark
  desiredName: string        // Bumble display name
  birthday: string           // YYYY-MM-DD
  gender: 'male' | 'female'
  proxy: string              // host:port:user:pass
  photos: string[]           // Supabase storage paths
}

// Job config shape (stored as JSON in jobs.config)
export interface JobConfig {
  country: string            // ISO country code (e.g. 'TH')
  accounts: AccountConfig[]  // one entry per account in the batch
}
