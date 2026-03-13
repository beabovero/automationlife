export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'retrying' | 'partial'
export type AccountStatus = 'pending' | 'active' | 'failed' | 'banned'

// ─── Row types (verified against live Supabase schema) ────────────────────────

type UserSettingsRow = {
  user_id: string
  geelark_api_key: string | null
  geelark_app_id: string | null
  geelark_base_url: string | null
  credits: number
  total_accounts_created: number
  plan: string | null
  plan_started_at: string | null
  created_at: string
  updated_at: string
}

type JobRow = {
  id: string
  user_id: string
  status: JobStatus
  total_accounts: number
  completed_count: number
  failed_count: number
  created_at: string
  updated_at: string
}

type AccountRow = {
  id: string
  job_id: string
  user_id: string
  position: number
  status: AccountStatus
  is_retry: boolean
  original_account_id: string | null
  retry_attempt: number
  profile_name: string | null
  birthday: string | null
  gender: string | null
  country: string | null
  proxy: string | null
  remarks: string | null
  geelark_env_id: string | null
  geelark_env_serial_no: string | null
  failure_reason: string | null
  credits_charged: boolean
  created_at: string
  updated_at: string
}

type AccountStatusEventRow = {
  id: string
  account_id: string
  job_id: string
  user_id: string
  label: string | null
  status: string
  created_at: string
}

type CreditTransactionRow = {
  id: string
  user_id: string
  amount: number
  reason: string | null
  notes: string | null
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
          geelark_app_id?: string | null
          geelark_base_url?: string | null
          credits?: number
          total_accounts_created?: number
          plan?: string | null
          plan_started_at?: string | null
        }
        Update: {
          geelark_api_key?: string | null
          geelark_app_id?: string | null
          geelark_base_url?: string | null
          credits?: number
          total_accounts_created?: number
          plan?: string | null
          plan_started_at?: string | null
          updated_at?: string
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
          completed_count?: number
          failed_count?: number
        }
        Update: {
          status?: JobStatus
          completed_count?: number
          failed_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      accounts: {
        Row: AccountRow
        Insert: {
          job_id: string
          user_id: string
          position: number
          status: AccountStatus
          is_retry?: boolean
          original_account_id?: string | null
          retry_attempt?: number
          profile_name?: string | null
          birthday?: string | null
          gender?: string | null
          country?: string | null
          proxy?: string | null
          remarks?: string | null
          geelark_env_id?: string | null
          geelark_env_serial_no?: string | null
          failure_reason?: string | null
          credits_charged?: boolean
        }
        Update: {
          status?: AccountStatus
          geelark_env_id?: string | null
          geelark_env_serial_no?: string | null
          failure_reason?: string | null
          credits_charged?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      account_photos: {
        Row: {
          id: string
          account_id: string
          user_id: string
          storage_path: string
          processed_path: string | null
          position: number
          created_at: string
        }
        Insert: {
          account_id: string
          user_id: string
          storage_path: string
          processed_path?: string | null
          position: number
        }
        Update: {
          processed_path?: string | null
        }
        Relationships: []
      }
      account_status_events: {
        Row: AccountStatusEventRow
        Insert: {
          account_id: string
          job_id: string
          user_id: string
          label?: string | null
          status: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      credit_transactions: {
        Row: CreditTransactionRow
        Insert: {
          user_id: string
          amount: number
          reason?: string | null
          notes?: string | null
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
export type AccountStatusEvent = AccountStatusEventRow
export type CreditTransaction = CreditTransactionRow

// Per-account config passed in job creation form
export interface AccountConfig {
  profileName: string
  profileNote: string
  desiredName: string
  birthday: string    // YYYY-MM-DD
  gender: 'male' | 'female'
  proxy: string       // host:port:user:pass
  photos: string[]    // Supabase storage paths
}

export interface JobConfig {
  country: string
  accounts: AccountConfig[]
}
