#!/usr/bin/env node

/**
 * Populate Database-driven Colleges
 * This script replaces MOOC-based college data with comprehensive database-driven college entries
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Comprehensive college data for different streams and locations
const collegeData = [
  // Engineering Colleges
  {
    name: 'Indian Institute of Technology Delhi',
    type: 'government',
    location: { city: 'New Delhi', state: 'Delhi', country: 'India' },
    address: 'Hauz Khas, New Delhi, Delhi 110016',
    website: 'https://home.iitd.ac.in',
    phone: '+91-11-2659-1735',
    email: 'info@iitd.ac.in',
    established_year: 1961,
    accreditation: ['NAAC A++', 'NBA', 'NIRF Rank 2'],
    programs: {
      undergraduate: ['B.Tech Computer Science', 'B.Tech Mechanical', 'B.Tech Electrical', 'B.Tech Civil'],
      postgraduate: ['M.Tech', 'MBA', 'M.Sc'],
      doctoral: ['Ph.D']
    },
    cut_off_data: {
      jee_advanced_rank: { general: 500, obc: 800, sc: 1500, st: 2000 },
      gate_score: { general: 750, obc: 700, sc: 650, st: 600 }
    },
    admission_process: {
      undergraduate: 'JEE Advanced',
      postgraduate: 'GATE/JAM/CAT',
      application_fee: 2500
    },
    fees: {
      tuition_fee_per_year: 200000,
      hostel_fee_per_year: 50000,
      other_fees_per_year: 25000,
      total_estimated_cost: 275000
    },
    facilities: ['Library', 'Hostels', 'Sports Complex', 'Research Labs', 'Placement Cell'],
    is_verified: true,
    is_active: true
  },
  {
    name: 'Delhi Technological University',
    type: 'government',
    location: { city: 'New Delhi', state: 'Delhi', country: 'India' },
    address: 'Bawana Road, Delhi 110042',
    website: 'https://dtu.ac.in',
    phone: '+91-11-2787-2200',
    email: 'info@dtu.ac.in',
    established_year: 1941,
    accreditation: ['NAAC A+', 'NBA'],
    programs: {
      undergraduate: ['B.Tech', 'B.Arch'],
      postgraduate: ['M.Tech', 'MBA', 'MCA'],
      doctoral: ['Ph.D']
    },
    cut_off_data: {
      jee_main_rank: { general: 15000, obc: 25000, sc: 45000, st: 60000 }
    },
    admission_process: {
      undergraduate: 'JEE Main',
      postgraduate: 'GATE/CAT/CMAT',
      application_fee: 1500
    },
    fees: {
      tuition_fee_per_year: 150000,
      hostel_fee_per_year: 40000,
      other_fees_per_year: 20000,
      total_estimated_cost: 210000
    },
    facilities: ['Central Library', 'Hostels', 'Sports Facilities', 'Innovation Hub'],
    is_verified: true,
    is_active: true
  },
  
  // Medical Colleges
  {
    name: 'All India Institute of Medical Sciences Delhi',
    type: 'government',
    location: { city: 'New Delhi', state: 'Delhi', country: 'India' },
    address: 'Ansari Nagar, New Delhi 110029',
    website: 'https://aiims.edu',
    phone: '+91-11-2659-3333',
    email: 'info@aiims.edu',
    established_year: 1956,
    accreditation: ['NAAC A++', 'MCI Approved'],
    programs: {
      undergraduate: ['MBBS', 'B.Sc Nursing'],
      postgraduate: ['MD', 'MS', 'M.Sc', 'M.Ch', 'DM'],
      doctoral: ['Ph.D']
    },
    cut_off_data: {
      neet_score: { general: 720, obc: 700, sc: 650, st: 600 }
    },
    admission_process: {
      undergraduate: 'NEET UG',
      postgraduate: 'NEET PG/AIIMS PG',
      application_fee: 1500
    },
    fees: {
      tuition_fee_per_year: 5000,
      hostel_fee_per_year: 15000,
      other_fees_per_year: 10000,
      total_estimated_cost: 30000
    },
    facilities: ['Hospital', 'Research Centers', 'Library', 'Hostels'],
    is_verified: true,
    is_active: true
  },
  
  // Arts and Science Colleges
  {
    name: 'University of Delhi',
    type: 'government',
    location: { city: 'New Delhi', state: 'Delhi', country: 'India' },
    address: 'University of Delhi, Delhi 110007',
    website: 'https://du.ac.in',
    phone: '+91-11-2766-7011',
    email: 'info@du.ac.in',
    established_year: 1922,
    accreditation: ['NAAC A++', 'UGC Approved'],
    programs: {
      undergraduate: ['B.A', 'B.Sc', 'B.Com', 'B.A (Hons)', 'B.Sc (Hons)'],
      postgraduate: ['M.A', 'M.Sc', 'M.Com', 'MBA'],
      doctoral: ['Ph.D']
    },
    cut_off_data: {
      class_12_percentage: { general: 95, obc: 92, sc: 88, st: 85 }
    },
    admission_process: {
      undergraduate: 'CUET UG',
      postgraduate: 'CUET PG/Entrance Test',
      application_fee: 750
    },
    fees: {
      tuition_fee_per_year: 25000,
      hostel_fee_per_year: 30000,
      other_fees_per_year: 15000,
      total_estimated_cost: 70000
    },
    facilities: ['Multiple Libraries', 'Sports Complex', 'Cultural Centers'],
    is_verified: true,
    is_active: true
  },
  
  // Commerce Colleges
  {
    name: 'Shri Ram College of Commerce',
    type: 'government',
    location: { city: 'New Delhi', state: 'Delhi', country: 'India' },
    address: 'University of Delhi, Maurice Nagar, Delhi 110007',
    website: 'https://srcc.edu',
    phone: '+91-11-2766-7011',
    email: 'principal@srcc.du.ac.in',
    established_year: 1926,
    accreditation: ['NAAC A++'],
    programs: {
      undergraduate: ['B.Com (Hons)', 'B.A Economics (Hons)'],
      postgraduate: ['M.Com', 'M.A Economics']
    },
    cut_off_data: {
      class_12_percentage: { general: 99, obc: 97, sc: 94, st: 92 }
    },
    admission_process: {
      undergraduate: 'CUET UG',
      application_fee: 750
    },
    fees: {
      tuition_fee_per_year: 30000,
      other_fees_per_year: 20000,
      total_estimated_cost: 50000
    },
    facilities: ['Library', 'Computer Labs', 'Placement Cell', 'Auditorium'],
    is_verified: true,
    is_active: true
  }
];

async function populateColleges() {
  console.log('🏫 Populating Database-driven Colleges...\n');
  
  try {
    // Clear existing MOOC-based data if any
    console.log('🧹 Clearing existing college data...');
    const { error: deleteError } = await supabase
      .from('colleges')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except non-existent ID
    
    if (deleteError && !deleteError.message.includes('No rows found')) {
      console.log('⚠️  Note: Could not clear existing data:', deleteError.message);
    }
    
    // Insert new database-driven college data
    console.log('📝 Inserting comprehensive college data...');
    const { data: insertedColleges, error: insertError } = await supabase
      .from('colleges')
      .insert(collegeData)
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting colleges:', insertError.message);
      return;
    }
    
    console.log(`✅ Successfully inserted ${insertedColleges?.length || 0} colleges`);
    
    // Verify the data
    await verifyColleges();
    
    console.log('\n🎉 College database population completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Admin can now manage colleges through the dashboard');
    console.log('   2. Add more colleges as needed');
    console.log('   3. Update college information regularly');
    console.log('   4. Implement college verification workflow');
    
  } catch (error) {
    console.error('❌ Population failed:', error.message);
  }
}

async function verifyColleges() {
  console.log('\n🔍 Verifying college data...');
  
  // Count by type
  const types = ['government', 'government_aided', 'private', 'deemed'];
  for (const type of types) {
    const { data, error } = await supabase
      .from('colleges')
      .select('*', { count: 'exact', head: true })
      .eq('type', type);
    
    if (!error) {
      console.log(`   ${type}: ${data?.length || 0} colleges`);
    }
  }
  
  // Count by verification status
  const { data: verifiedCount } = await supabase
    .from('colleges')
    .select('*', { count: 'exact', head: true })
    .eq('is_verified', true);
  
  const { data: totalCount } = await supabase
    .from('colleges')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total Colleges: ${totalCount?.length || 0}`);
  console.log(`   Verified Colleges: ${verifiedCount?.length || 0}`);
  console.log(`   Pending Verification: ${(totalCount?.length || 0) - (verifiedCount?.length || 0)}`);
}

// Run the population
populateColleges();