// Database types for Supabase
// Generated based on the schema for community skills

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      skill_templates: {
        Row: {
          id: string;
          created_by: string | null;
          name: string;
          description: string | null;
          long_description: string | null;
          category: string;
          estimated_time_saved: string | null;
          role_title: string | null;
          role_department: string | null;
          role_level: string | null;
          system_instruction: string;
          user_prompt_template: string;
          output_format: string;
          recommended_model: string;
          max_tokens: number;
          temperature: number;
          inputs: unknown[];
          use_count: number;
          rating_sum: number;
          rating_count: number;
          created_at: string;
          updated_at: string;
          is_public: boolean;
        };
        Insert: {
          id?: string;
          created_by?: string | null;
          name: string;
          description?: string | null;
          long_description?: string | null;
          category: string;
          estimated_time_saved?: string | null;
          role_title?: string | null;
          role_department?: string | null;
          role_level?: string | null;
          system_instruction: string;
          user_prompt_template: string;
          output_format?: string;
          recommended_model?: string;
          max_tokens?: number;
          temperature?: number;
          inputs?: unknown[];
          use_count?: number;
          rating_sum?: number;
          rating_count?: number;
          created_at?: string;
          updated_at?: string;
          is_public?: boolean;
        };
        Update: {
          id?: string;
          created_by?: string | null;
          name?: string;
          description?: string | null;
          long_description?: string | null;
          category?: string;
          estimated_time_saved?: string | null;
          role_title?: string | null;
          role_department?: string | null;
          role_level?: string | null;
          system_instruction?: string;
          user_prompt_template?: string;
          output_format?: string;
          recommended_model?: string;
          max_tokens?: number;
          temperature?: number;
          inputs?: unknown[];
          use_count?: number;
          rating_sum?: number;
          rating_count?: number;
          created_at?: string;
          updated_at?: string;
          is_public?: boolean;
        };
      };
      skill_tags: {
        Row: {
          id: string;
          skill_id: string;
          tag: string;
        };
        Insert: {
          id?: string;
          skill_id: string;
          tag: string;
        };
        Update: {
          id?: string;
          skill_id?: string;
          tag?: string;
        };
      };
      skill_ratings: {
        Row: {
          id: string;
          skill_id: string;
          user_id: string;
          rating: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          skill_id: string;
          user_id: string;
          rating: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          skill_id?: string;
          user_id?: string;
          rating?: number;
          created_at?: string;
        };
      };
    };
    Functions: {
      increment_skill_use_count: {
        Args: { skill_id: string };
        Returns: void;
      };
    };
  };
}
