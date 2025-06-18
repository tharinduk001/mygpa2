import { supabase } from './lib/supabaseClient.js';

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
    
    if (error && error.code === 'PGRST116') {
      // Table doesn't exist, but connection is working
      console.log('✅ Supabase connection successful! (Table not found is expected)');
      return { success: true, message: 'Connection successful' };
    } else if (error) {
      console.error('❌ Supabase connection error:', error);
      return { success: false, error };
    } else {
      console.log('✅ Supabase connection successful!');
      return { success: true, data };
    }
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return { success: false, error };
  }
};

// Test auth functionality
export const testSupabaseAuth = async () => {
  try {
    console.log('Testing Supabase auth...');
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Auth test error:', error);
      return { success: false, error };
    }
    
    console.log('✅ Auth system accessible!');
    return { success: true, session: data.session };
  } catch (error) {
    console.error('❌ Auth test failed:', error);
    return { success: false, error };
  }
};
