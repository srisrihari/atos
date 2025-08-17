import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../shared/types/supabase';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper functions for database operations with admin privileges
export const dbAdmin = {
  async createUserProfile(userId: string, data: { full_name?: string; avatar_url?: string }) {
    const { error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        ...data
      });

    if (error) throw error;
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async getDashboardWithInsights(dashboardId: string) {
    const { data, error } = await supabase
      .from('dashboards')
      .select(`
        *,
        ai_insights (*)
      `)
      .eq('id', dashboardId)
      .single();

    if (error) throw error;
    return data;
  },

  async createAIInsight(insight: Database['public']['Tables']['ai_insights']['Insert']) {
    const { data, error } = await supabase
      .from('ai_insights')
      .insert(insight)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateDashboardWidgets(dashboardId: string, widgets: any[]) {
    const { data, error } = await supabase
      .from('dashboards')
      .update({ 
        widgets,
        updated_at: new Date().toISOString()
      })
      .eq('id', dashboardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};