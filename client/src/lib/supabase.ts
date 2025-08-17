import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for common database operations
export const db = {
  // Dashboard operations
  dashboards: {
    async getAll() {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async getById(id: string) {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    async create(dashboard: Omit<Database['public']['Tables']['dashboards']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('dashboards')
        .insert(dashboard)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async update(id: string, updates: Partial<Database['public']['Tables']['dashboards']['Update']>) {
      const { data, error } = await supabase
        .from('dashboards')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async delete(id: string) {
      const { error } = await supabase
        .from('dashboards')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  // Data source operations
  dataSources: {
    async getAll() {
      const { data, error } = await supabase
        .from('data_sources')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async create(dataSource: Omit<Database['public']['Tables']['data_sources']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('data_sources')
        .insert(dataSource)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Report operations
  reports: {
    async getAll() {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },

    async create(report: Omit<Database['public']['Tables']['reports']['Insert'], 'id' | 'created_at' | 'updated_at'>) {
      const { data, error } = await supabase
        .from('reports')
        .insert(report)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }
};
