export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      dashboards: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          layout: {
            columns: number;
            rows: number;
            gridGap: number;
          };
          widgets: Array<{
            id: string;
            type: string;
            title: string;
            position: { x: number; y: number };
            size: { width: number; height: number };
            dataSource: string;
            settings: Record<string, unknown>;
          }>;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          layout?: {
            columns: number;
            rows: number;
            gridGap: number;
          };
          widgets?: Array<{
            id: string;
            type: string;
            title: string;
            position: { x: number; y: number };
            size: { width: number; height: number };
            dataSource: string;
            settings: Record<string, unknown>;
          }>;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          layout?: {
            columns: number;
            rows: number;
            gridGap: number;
          };
          widgets?: Array<{
            id: string;
            type: string;
            title: string;
            position: { x: number; y: number };
            size: { width: number; height: number };
            dataSource: string;
            settings: Record<string, unknown>;
          }>;
          updated_at?: string;
        };
      };
      data_sources: {
        Row: {
          id: string;
          name: string;
          type: string;
          config: Record<string, unknown>;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: string;
          config: Record<string, unknown>;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          type?: string;
          config?: Record<string, unknown>;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          dashboard_id: string | null;
          schedule: Record<string, unknown> | null;
          delivery_config: Record<string, unknown> | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          dashboard_id?: string;
          schedule?: Record<string, unknown>;
          delivery_config?: Record<string, unknown>;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          dashboard_id?: string;
          schedule?: Record<string, unknown>;
          delivery_config?: Record<string, unknown>;
          updated_at?: string;
        };
      };
      ai_insights: {
        Row: {
          id: string;
          dashboard_id: string;
          insight_type: string;
          content: Record<string, unknown>;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          dashboard_id: string;
          insight_type: string;
          content: Record<string, unknown>;
          user_id: string;
          created_at?: string;
        };
        Update: {
          dashboard_id?: string;
          insight_type?: string;
          content?: Record<string, unknown>;
        };
      };
    };
  };
}
