import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uchdmckyuambhedqopua.supabase.co';
const supabaseKey = 'sb_publishable_CWc-5yS2OtZYyZIePX77kg_sGVSsx1d';

export const supabaseClient = createClient(supabaseUrl, supabaseKey);