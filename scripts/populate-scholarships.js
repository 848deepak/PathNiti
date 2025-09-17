/**
 * Script to populate scholarships in the database
 * This script adds comprehensive government and private scholarships
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const scholarships = [
  // Government Scholarships
  {
    name: "National Merit Scholarship",
    description: "Merit-based scholarship for outstanding students pursuing higher education in government institutions.",
    provider: "Government of India",
    amount: { min: 50000, max: 100000, currency: "INR" },
    eligibility: {
      academic_requirements: ["Class 12 passed with minimum 85% marks"],
      income_criteria: "Family income less than ₹5 Lakh per annum",
      age_limit: "Below 25 years",
      other_requirements: ["Must be enrolled in government institution"]
    },
    application_deadline: "2024-03-15",
    application_process: "Online application through National Scholarship Portal",
    documents_required: ["Marksheets", "Income certificate", "Aadhaar card", "Bank details"],
    website: "https://scholarships.gov.in",
    contact_info: {
      email: "nsp-support@nic.in",
      phone: "0120-6619540"
    }
  },
  {
    name: "Post Matric Scholarship for SC/ST Students",
    description: "Scholarship for Scheduled Caste and Scheduled Tribe students pursuing post-matriculation courses.",
    provider: "Ministry of Social Justice and Empowerment",
    amount: { min: 30000, max: 120000, currency: "INR" },
    eligibility: {
      academic_requirements: ["Class 10+ passed"],
      income_criteria: "Family income less than ₹2.5 Lakh per annum",
      caste_requirements: "Must belong to SC/ST category",
      other_requirements: ["Must be enrolled in recognized institution"]
    },
    application_deadline: "2024-04-30",
    application_process: "Online application through National Scholarship Portal",
    documents_required: ["Caste certificate", "Income certificate", "Marksheets", "Admission proof"],
    website: "https://scholarships.gov.in",
    contact_info: {
      email: "scst-scholarship@socialjustice.nic.in",
      phone: "011-23381092"
    }
  },
  {
    name: "Girl Child Scholarship",
    description: "Special scholarship scheme to promote education among girl children and reduce gender gap in education.",
    provider: "Ministry of Women & Child Development",
    amount: { min: 5000, max: 15000, currency: "INR" },
    eligibility: {
      academic_requirements: ["Class 10+ passed"],
      income_criteria: "Family income less than ₹6 Lakh per annum",
      gender_requirements: "Must be a female student",
      other_requirements: ["Must be enrolled in recognized institution"]
    },
    application_deadline: "2024-07-15",
    application_process: "Online application through National Scholarship Portal",
    documents_required: ["Birth certificate", "Income certificate", "Marksheets", "Bank details"],
    website: "https://scholarships.gov.in",
    contact_info: {
      email: "girlchild-scholarship@wcd.nic.in",
      phone: "011-23388400"
    }
  },
  {
    name: "Minority Scholarship",
    description: "Scholarship for students from minority communities (Muslim, Christian, Sikh, Buddhist, Jain, Parsi) pursuing higher education.",
    provider: "Ministry of Minority Affairs",
    amount: { min: 3000, max: 12000, currency: "INR" },
    eligibility: {
      academic_requirements: ["Class 10+ passed"],
      income_criteria: "Family income less than ₹2.5 Lakh per annum",
      community_requirements: "Must belong to minority community",
      other_requirements: ["Must be enrolled in recognized institution"]
    },
    application_deadline: "2024-08-30",
    application_process: "Online application through National Scholarship Portal",
    documents_required: ["Minority community certificate", "Income certificate", "Marksheets", "Admission proof"],
    website: "https://scholarships.gov.in",
    contact_info: {
      email: "minority-scholarship@minorityaffairs.gov.in",
      phone: "011-23389318"
    }
  },
  {
    name: "Central Sector Scholarship",
    description: "Merit-based scholarship for students pursuing undergraduate and postgraduate courses in recognized institutions.",
    provider: "Ministry of Education",
    amount: { min: 10000, max: 20000, currency: "INR" },
    eligibility: {
      academic_requirements: ["Class 12 passed with minimum 80% marks"],
      income_criteria: "Family income less than ₹8 Lakh per annum",
      age_limit: "Below 30 years",
      other_requirements: ["Must be enrolled in recognized institution"]
    },
    application_deadline: "2024-05-31",
    application_process: "Online application through National Scholarship Portal",
    documents_required: ["Marksheets", "Income certificate", "Admission proof", "Bank details"],
    website: "https://scholarships.gov.in",
    contact_info: {
      email: "central-scholarship@education.gov.in",
      phone: "011-23381200"
    }
  },
  {
    name: "Prime Minister's Scholarship Scheme",
    description: "Scholarship for children of ex-servicemen and serving personnel of armed forces and paramilitary forces.",
    provider: "Ministry of Defence",
    amount: { min: 25000, max: 30000, currency: "INR" },
    eligibility: {
      academic_requirements: ["Class 12 passed with minimum 60% marks"],
      family_requirements: "Must be child of ex-serviceman or serving personnel",
      other_requirements: ["Must be enrolled in recognized institution"]
    },
    application_deadline: "2024-06-15",
    application_process: "Online application through Kendriya Sainik Board",
    documents_required: ["Service certificate", "Marksheets", "Admission proof", "Bank details"],
    website: "https://ksb.gov.in",
    contact_info: {
      email: "pms-scholarship@ksb.gov.in",
      phone: "011-23382304"
    }
  },
  {
    name: "AICTE Pragati Scholarship",
    description: "Scholarship for girl students pursuing technical education in AICTE approved institutions.",
    provider: "All India Council for Technical Education",
    amount: { min: 50000, max: 50000, currency: "INR" },
    eligibility: {
      academic_requirements: ["Class 12 passed with minimum 50% marks"],
      income_criteria: "Family income less than ₹8 Lakh per annum",
      gender_requirements: "Must be a female student",
      course_requirements: "Must be pursuing technical course in AICTE approved institution"
    },
    application_deadline: "2024-09-30",
    application_process: "Online application through AICTE portal",
    documents_required: ["Marksheets", "Income certificate", "Admission proof", "AICTE approval letter"],
    website: "https://www.aicte-india.org",
    contact_info: {
      email: "pragati@aicte-india.org",
      phone: "011-29581300"
    }
  },
  {
    name: "UGC NET Fellowship",
    description: "Fellowship for students pursuing research in universities and colleges.",
    provider: "University Grants Commission",
    amount: { min: 31000, max: 35000, currency: "INR" },
    eligibility: {
      academic_requirements: ["Postgraduate degree with minimum 55% marks", "Qualified UGC NET"],
      age_limit: "Below 30 years",
      other_requirements: ["Must be enrolled for Ph.D. in recognized university"]
    },
    application_deadline: "2024-10-31",
    application_process: "Online application through UGC portal",
    documents_required: ["NET certificate", "Marksheets", "Research proposal", "University admission proof"],
    website: "https://www.ugc.ac.in",
    contact_info: {
      email: "net-fellowship@ugc.ac.in",
      phone: "011-23604446"
    }
  },
  {
    name: "ICAR Junior Research Fellowship",
    description: "Fellowship for students pursuing research in agricultural sciences.",
    provider: "Indian Council of Agricultural Research",
    amount: { min: 25000, max: 28000, currency: "INR" },
    eligibility: {
      academic_requirements: ["Postgraduate degree in agricultural sciences with minimum 60% marks"],
      age_limit: "Below 30 years",
      other_requirements: ["Must be enrolled for Ph.D. in ICAR institute"]
    },
    application_deadline: "2024-11-15",
    application_process: "Online application through ICAR portal",
    documents_required: ["Marksheets", "Research proposal", "ICAR admission proof", "Bank details"],
    website: "https://www.icar.org.in",
    contact_info: {
      email: "jrf@icar.org.in",
      phone: "011-25841000"
    }
  },
  {
    name: "CSIR Junior Research Fellowship",
    description: "Fellowship for students pursuing research in science and technology.",
    provider: "Council of Scientific and Industrial Research",
    amount: { min: 31000, max: 35000, currency: "INR" },
    eligibility: {
      academic_requirements: ["Postgraduate degree in science with minimum 55% marks", "Qualified CSIR NET"],
      age_limit: "Below 28 years",
      other_requirements: ["Must be enrolled for Ph.D. in CSIR institute"]
    },
    application_deadline: "2024-12-31",
    application_process: "Online application through CSIR portal",
    documents_required: ["CSIR NET certificate", "Marksheets", "Research proposal", "Institute admission proof"],
    website: "https://www.csir.res.in",
    contact_info: {
      email: "jrf@csir.res.in",
      phone: "011-25841000"
    }
  }
];

async function populateScholarships() {
  try {
    console.log('Starting to populate scholarships...');
    
    // Clear existing scholarships (optional - remove this if you want to keep existing data)
    console.log('Clearing existing scholarships...');
    const { error: deleteError } = await supabase
      .from('scholarships')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    
    if (deleteError) {
      console.error('Error clearing existing scholarships:', deleteError);
    } else {
      console.log('Existing scholarships cleared successfully');
    }
    
    // Insert new scholarships
    console.log('Inserting new scholarships...');
    const { data, error } = await supabase
      .from('scholarships')
      .insert(scholarships)
      .select();
    
    if (error) {
      console.error('Error inserting scholarships:', error);
      return;
    }
    
    console.log(`Successfully inserted ${data.length} scholarships!`);
    console.log('Scholarships populated successfully!');
    
    // Display summary
    const providers = {};
    data.forEach(s => {
      providers[s.provider] = (providers[s.provider] || 0) + 1;
    });
    
    console.log('\nSummary:');
    console.log('Providers:', providers);
    console.log('Total scholarships:', data.length);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
populateScholarships();
