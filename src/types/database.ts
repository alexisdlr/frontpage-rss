export type FeedHealthStatus = "active" | "stale" | "error";

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
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          layout: string;
          refresh_interval: number;
          category_order: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          layout?: string;
          refresh_interval?: number;
          category_order?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          layout?: string;
          refresh_interval?: number;
          category_order?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          user_id: string;
          theme: string;
          default_layout: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          theme?: string;
          default_layout?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          theme?: string;
          default_layout?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      feeds: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          url: string;
          custom_title: string | null;
          site_url: string | null;
          description: string | null;
          favicon_url: string | null;
          health_status: FeedHealthStatus;
          last_fetch_at: string | null;
          last_success_at: string | null;
          etag: string | null;
          last_modified: string | null;
          fetch_error: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          url: string;
          custom_title?: string | null;
          site_url?: string | null;
          description?: string | null;
          favicon_url?: string | null;
          health_status?: FeedHealthStatus;
          last_fetch_at?: string | null;
          last_success_at?: string | null;
          etag?: string | null;
          last_modified?: string | null;
          fetch_error?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          url?: string;
          custom_title?: string | null;
          site_url?: string | null;
          description?: string | null;
          favicon_url?: string | null;
          health_status?: FeedHealthStatus;
          last_fetch_at?: string | null;
          last_success_at?: string | null;
          etag?: string | null;
          last_modified?: string | null;
          fetch_error?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      feed_items: {
        Row: {
          id: string;
          feed_id: string;
          guid: string;
          url: string;
          title: string | null;
          description: string | null;
          content_html: string | null;
          author: string | null;
          published_at: string | null;
          fetched_at: string;
        };
        Insert: {
          id?: string;
          feed_id: string;
          guid: string;
          url: string;
          title?: string | null;
          description?: string | null;
          content_html?: string | null;
          author?: string | null;
          published_at?: string | null;
          fetched_at?: string;
        };
        Update: {
          id?: string;
          feed_id?: string;
          guid?: string;
          url?: string;
          title?: string | null;
          description?: string | null;
          content_html?: string | null;
          author?: string | null;
          published_at?: string | null;
          fetched_at?: string;
        };
        Relationships: [];
      };
      user_item_states: {
        Row: {
          user_id: string;
          item_id: string;
          is_read: boolean;
          read_at: string | null;
        };
        Insert: {
          user_id: string;
          item_id: string;
          is_read?: boolean;
          read_at?: string | null;
        };
        Update: {
          user_id?: string;
          item_id?: string;
          is_read?: boolean;
          read_at?: string | null;
        };
        Relationships: [];
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      feed_health_status: FeedHealthStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
