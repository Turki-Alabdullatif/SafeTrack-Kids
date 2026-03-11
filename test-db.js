/**
 * Quick script to test if the Supabase database connection works.
 * Run from the react-app folder: node test-db.js   OR   npm run test:db
 *
 * Expects schema from ERD: USER, ORGANIZER, EVENT, BRACELET, PARENT, CHILD, Active_Sessions, Location_Logs
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gzzgfexnklerpffrjkid.supabase.co';
const supabaseKey = 'sb_publishable_zcksWHYsKOKBJIjWK9CEfA_QWvEtDpm';

const supabase = createClient(supabaseUrl, supabaseKey);

const TABLES = ['USER', 'ORGANIZER', 'EVENT', 'BRACELET', 'PARENT', 'CHILD', 'Active_Sessions', 'Location_Logs'];

async function testDatabase() {
  console.log('Testing Supabase database (SafeTrackKids ERD schema)...\n');

  try {
    let connected = false;
    for (const tableName of ['CHILD', 'child']) {
      const { data, error } = await supabase.from(tableName).select('*').limit(1);
      if (!error) {
        connected = true;
        console.log('✅ Connection successful!');
        console.log(`   Table "${tableName}" exists. Row count sample: ${data?.length ?? 0}.`);
        break;
      }
      if (error?.code !== 'PGRST205') {
        console.error(`❌ Error querying "${tableName}":`, error.message);
        process.exit(1);
      }
    }

    if (!connected) {
      console.log('✅ Connection to Supabase is working.');
      console.log('⚠️  CHILD table not found. Run supabase_schema.sql in Supabase Dashboard → SQL Editor.');
      return;
    }

    // Quick check for other ERD tables (optional)
    const found = [];
    for (const table of TABLES) {
      const { error } = await supabase.from(table).select('*').limit(0);
      if (!error) found.push(table);
    }
    console.log(`   Tables found: ${found.join(', ') || 'none'}`);
    console.log('\nDatabase is working correctly.');
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  }
}

testDatabase();
