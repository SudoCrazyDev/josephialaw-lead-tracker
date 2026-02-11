export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      sources: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          source_id: string | null;
          webhook_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string;
          source_id?: string | null;
          webhook_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          phone?: string;
          source_id?: string | null;
          webhook_path?: string | null;
          created_at?: string;
        };
      };
      webhook_logs: {
        Row: {
          id: string;
          webhook_path: string;
          method: string;
          status_code: number;
          request_body: Json | null;
          response_body: Json | null;
          error_message: string | null;
          lead_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          webhook_path: string;
          method?: string;
          status_code: number;
          request_body?: Json | null;
          response_body?: Json | null;
          error_message?: string | null;
          lead_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          webhook_path?: string;
          method?: string;
          status_code?: number;
          request_body?: Json | null;
          response_body?: Json | null;
          error_message?: string | null;
          lead_id?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

export type Source = Database["public"]["Tables"]["sources"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];
export type LeadWithSource = Lead & { sources: Source | null };
export type WebhookLog = Database["public"]["Tables"]["webhook_logs"]["Row"];
