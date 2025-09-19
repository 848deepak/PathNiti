#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Comprehensive college database
const comprehensiveColleges = [
  // IITs
  {
    name: "IIT Delhi",
    type: "government",
    location: {
      city: "New Delhi",
      state: "Delhi",
      pincode: "110016",
      district: "South Delhi",
      coordinates: { lat: 28.545, lng: 77.165 }
    },
    address: "Hauz Khas, New Delhi, 110016",
    website: "https://iitd.ac.in",
    phone: "+91-11-26591735",
    email: "info@iitd.ac.in",
    established_year: 1961,
    accreditation: ["NAAC A++", "NBA", "UGC"],
    facilities: {
      labs: true, wifi: true, hostel: true, sports: true, 
      canteen: true, library: true, research_center: true
    },
    programs: {
      available: ["Engineering", "Technology", "Management", "Science"]
    },
    cut_off_data: {
      "2023": { "Engineering": 98, "Technology": 97, "Management": 95 }
    },
    admission_process: {
      "Engineering": "JEE Advanced rank",
      "Technology": "JEE Advanced rank", 
      "Management": "CAT score + Interview"
    },
    fees: {
      "Engineering": "₹2.5 Lakhs/year",
      "Management": "₹8 Lakhs/year"
    },
    is_verified: true,
    is_active: true
  },
  {
    name: "IIT Bombay",
    type: "government",
    location: {
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400076",
      district: "Mumbai",
      coordinates: { lat: 19.1334, lng: 72.9133 }
    },
    address: "Powai, Mumbai, 400076",
    website: "https://iitb.ac.in",
    phone: "+91-22-25722545",
    email: "info@iitb.ac.in",
    established_year: 1958,
    accreditation: ["NAAC A++", "NBA", "UGC"],
    facilities: {
      labs: true, wifi: true, hostel: true, sports: true,
      canteen: true, library: true, research_center: true
    },
    programs: {
      available: ["Engineering", "Technology", "Management", "Science"]
    },
    cut_off_data: {
      "2023": { "Engineering": 99, "Technology": 98, "Management": 96 }
    },
    admission_process: {
      "Engineering": "JEE Advanced rank",
      "Technology": "JEE Advanced rank",
      "Management": "CAT score + Interview"
    },
    fees: {
      "Engineering": "₹2.5 Lakhs/year",
      "Management": "₹8 Lakhs/year"
    },
    is_verified: true,
    is_active: true
  },
  {
    name: "IIT Madras",
    type: "government",
    location: {
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600036",
      district: "Chennai",
      coordinates: { lat: 12.9915, lng: 80.2337 }
    },
    address: "IIT Campus, Chennai, 600036",
    website: "https://iitm.ac.in",
    phone: "+91-44-22578200",
    email: "info@iitm.ac.in",
    established_year: 1959,
    accreditation: ["NAAC A++", "NBA", "UGC"],
    facilities: {
      labs: true, wifi: true, hostel: true, sports: true,
      canteen: true, library: true, research_center: true
    },
    programs: {
      available: ["Engineering", "Technology", "Management", "Science"]
    },
    cut_off_data: {
      "2023": { "Engineering": 98, "Technology": 97, "Management": 95 }
    },
    admission_process: {
      "Engineering": "JEE Advanced rank",
      "Technology": "JEE Advanced rank",
      "Management": "CAT score + Interview"
    },
    fees: {
      "Engineering": "₹2.5 Lakhs/year",
      "Management": "₹8 Lakhs/year"
    },
    is_verified: true,
    is_active: true
  },

  // NITs
  {
    name: "NIT Trichy",
    type: "government",
    location: {
      city: "Tiruchirappalli",
      state: "Tamil Nadu",
      pincode: "620015",
      district: "Tiruchirappalli",
      coordinates: { lat: 10.7905, lng: 78.7047 }
    },
    address: "NIT Campus, Tiruchirappalli, 620015",
    website: "https://nitt.edu",
    phone: "+91-431-2503000",
    email: "info@nitt.edu",
    established_year: 1964,
    accreditation: ["NAAC A++", "NBA", "UGC"],
    facilities: {
      labs: true, wifi: true, hostel: true, sports: true,
      canteen: true, library: true
    },
    programs: {
      available: ["Engineering", "Technology", "Management"]
    },
    cut_off_data: {
      "2023": { "Engineering": 95, "Technology": 94, "Management": 92 }
    },
    admission_process: {
      "Engineering": "JEE Main score",
      "Technology": "JEE Main score",
      "Management": "CAT score + Interview"
    },
    fees: {
      "Engineering": "₹1.5 Lakhs/year",
      "Management": "₹5 Lakhs/year"
    },
    is_verified: true,
    is_active: true
  },
  {
    name: "NIT Warangal",
    type: "government",
    location: {
      city: "Warangal",
      state: "Telangana",
      pincode: "506004",
      district: "Warangal",
      coordinates: { lat: 17.9689, lng: 79.5941 }
    },
    address: "NIT Campus, Warangal, 506004",
    website: "https://nitw.ac.in",
    phone: "+91-870-2459191",
    email: "info@nitw.ac.in",
    established_year: 1959,
    accreditation: ["NAAC A++", "NBA", "UGC"],
    facilities: {
      labs: true, wifi: true, hostel: true, sports: true,
      canteen: true, library: true
    },
    programs: {
      available: ["Engineering", "Technology", "Management"]
    },
    cut_off_data: {
      "2023": { "Engineering": 94, "Technology": 93, "Management": 91 }
    },
    admission_process: {
      "Engineering": "JEE Main score",
      "Technology": "JEE Main score",
      "Management": "CAT score + Interview"
    },
    fees: {
      "Engineering": "₹1.5 Lakhs/year",
      "Management": "₹5 Lakhs/year"
    },
    is_verified: true,
    is_active: true
  },

  // Central Universities
  {
    name: "Delhi University",
    type: "government",
    location: {
      city: "New Delhi",
      state: "Delhi",
      pincode: "110007",
      district: "North Delhi",
      coordinates: { lat: 28.7041, lng: 77.1025 }
    },
    address: "University of Delhi, Delhi, 110007",
    website: "https://du.ac.in",
    phone: "+91-11-27667011",
    email: "info@du.ac.in",
    established_year: 1922,
    accreditation: ["NAAC A++", "UGC"],
    facilities: {
      labs: true, wifi: true, hostel: true, sports: true,
      canteen: true, library: true
    },
    programs: {
      available: ["Arts", "Science", "Commerce", "Engineering", "Medicine", "Law"]
    },
    cut_off_data: {
      "2023": { "Arts": 85, "Science": 90, "Commerce": 88, "Engineering": 95 }
    },
    admission_process: {
      "Arts": "Based on Class 12 marks",
      "Science": "Class 12 marks + Entrance exam",
      "Commerce": "Based on Class 12 marks",
      "Engineering": "JEE Main score"
    },
    fees: {
      "Arts": "₹15,000/year",
      "Science": "₹25,000/year",
      "Commerce": "₹20,000/year",
      "Engineering": "₹1.5 Lakhs/year"
    },
    is_verified: true,
    is_active: true
  },
  {
    name: "Jawaharlal Nehru University",
    type: "government",
    location: {
      city: "New Delhi",
      state: "Delhi",
      pincode: "110067",
      district: "South Delhi",
      coordinates: { lat: 28.545, lng: 77.165 }
    },
    address: "JNU, New Delhi, 110067",
    website: "https://jnu.ac.in",
    phone: "+91-11-26704000",
    email: "info@jnu.ac.in",
    established_year: 1969,
    accreditation: ["NAAC A++", "UGC"],
    facilities: {
      labs: true, wifi: true, hostel: true, sports: true,
      canteen: true, library: true
    },
    programs: {
      available: ["Arts", "Science", "Social Sciences", "Languages", "International Studies"]
    },
    cut_off_data: {
      "2023": { "Arts": 88, "Science": 92, "Social Sciences": 90 }
    },
    admission_process: {
      "Arts": "JNUEE entrance exam",
      "Science": "JNUEE entrance exam",
      "Social Sciences": "JNUEE entrance exam"
    },
    fees: {
      "Arts": "₹20,000/year",
      "Science": "₹30,000/year",
      "Social Sciences": "₹25,000/year"
    },
    is_verified: true,
    is_active: true
  },
  {
    name: "University of Mumbai",
    type: "government",
    location: {
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      district: "Mumbai",
      coordinates: { lat: 19.076, lng: 72.8777 }
    },
    address: "University of Mumbai, Mumbai, 400001",
    website: "https://mu.ac.in",
    phone: "+91-22-26543000",
    email: "info@mu.ac.in",
    established_year: 1857,
    accreditation: ["NAAC A++", "UGC"],
    facilities: {
      labs: true, wifi: true, hostel: true, sports: true,
      canteen: true, library: true
    },
    programs: {
      available: ["Arts", "Science", "Commerce", "Engineering", "Medicine", "Law", "Management"]
    },
    cut_off_data: {
      "2023": { "Arts": 82, "Science": 87, "Commerce": 85, "Engineering": 92 }
    },
    admission_process: {
      "Arts": "Based on Class 12 marks",
      "Science": "Class 12 marks + Entrance exam",
      "Commerce": "Based on Class 12 marks",
      "Engineering": "JEE Main score"
    },
    fees: {
      "Arts": "₹12,000/year",
      "Science": "₹20,000/year",
      "Commerce": "₹15,000/year",
      "Engineering": "₹1.2 Lakhs/year"
    },
    is_verified: true,
    is_active: true
  },

  // Private Universities
  {
    name: "BITS Pilani",
    type: "private",
    location: {
      city: "Pilani",
      state: "Rajasthan",
      pincode: "333031",
      district: "Jhunjhunu",
      coordinates: { lat: 28.3670, lng: 75.6030 }
    },
    address: "BITS Pilani, Pilani, 333031",
    website: "https://bits-pilani.ac.in",
    phone: "+91-1596-242210",
    email: "info@bits-pilani.ac.in",
    established_year: 1964,
    accreditation: ["NAAC A++", "NBA", "UGC"],
    facilities: {
      labs: true, wifi: true, hostel: true, sports: true,
      canteen: true, library: true, research_center: true
    },
    programs: {
      available: ["Engineering", "Technology", "Management", "Science", "Pharmacy"]
    },
    cut_off_data: {
      "2023": { "Engineering": 96, "Technology": 95, "Management": 93 }
    },
    admission_process: {
      "Engineering": "BITSAT score",
      "Technology": "BITSAT score",
      "Management": "BITSAT score + Interview"
    },
    fees: {
      "Engineering": "₹4 Lakhs/year",
      "Management": "₹6 Lakhs/year"
    },
    is_verified: true,
    is_active: true
  },
  {
    name: "VIT University",
    type: "private",
    location: {
      city: "Vellore",
      state: "Tamil Nadu",
      pincode: "632014",
      district: "Vellore",
      coordinates: { lat: 12.9716, lng: 79.1596 }
    },
    address: "VIT University, Vellore, 632014",
    website: "https://vit.ac.in",
    phone: "+91-416-2202125",
    email: "info@vit.ac.in",
    established_year: 1984,
    accreditation: ["NAAC A++", "NBA", "UGC"],
    facilities: {
      labs: true, wifi: true, hostel: true, sports: true,
      canteen: true, library: true, research_center: true
    },
    programs: {
      available: ["Engineering", "Technology", "Management", "Science", "Law"]
    },
    cut_off_data: {
      "2023": { "Engineering": 94, "Technology": 93, "Management": 91 }
    },
    admission_process: {
      "Engineering": "VITEEE score",
      "Technology": "VITEEE score",
      "Management": "VITEEE score + Interview"
    },
    fees: {
      "Engineering": "₹3.5 Lakhs/year",
      "Management": "₹5.5 Lakhs/year"
    },
    is_verified: true,
    is_active: true
  },
  {
    name: "Manipal Institute of Technology",
    type: "private",
    location: {
      city: "Manipal",
      state: "Karnataka",
      pincode: "576104",
      district: "Udupi",
      coordinates: { lat: 13.3509, lng: 74.7940 }
    },
    address: "MIT, Manipal, 576104",
    website: "https://manipal.edu",
    phone: "+91-820-2571201",
    email: "info@manipal.edu",
    established_year: 1957,
    accreditation: ["NAAC A++", "NBA", "UGC"],
    facilities: {
      labs: true, wifi: true, hostel: true, sports: true,
      canteen: true, library: true, research_center: true
    },
    programs: {
      available: ["Engineering", "Technology", "Management", "Medicine"]
    },
    cut_off_data: {
      "2023": { "Engineering": 92, "Technology": 91, "Management": 89 }
    },
    admission_process: {
      "Engineering": "MET score",
      "Technology": "MET score",
      "Management": "MET score + Interview"
    },
    fees: {
      "Engineering": "₹3 Lakhs/year",
      "Management": "₹5 Lakhs/year"
    },
    is_verified: true,
    is_active: true
  },

  // Medical Colleges
  {
    name: "AIIMS Delhi",
    type: "government",
    location: {
      city: "New Delhi",
      state: "Delhi",
      pincode: "110029",
      district: "South Delhi",
      coordinates: { lat: 28.5679, lng: 77.2090 }
    },
    address: "AIIMS, New Delhi, 110029",
    website: "https://aiims.edu",
    phone: "+91-11-26588500",
    email: "info@aiims.edu",
    established_year: 1956,
    accreditation: ["NAAC A++", "UGC", "MCI"],
    facilities: {
      labs: true, wifi: true, hostel: true, sports: true,
      canteen: true, library: true, hospital: true
    },
    programs: {
      available: ["Medicine", "Nursing", "Paramedical", "Research"]
    },
    cut_off_data: {
      "2023": { "Medicine": 99, "Nursing": 95, "Paramedical": 90 }
    },
    admission_process: {
      "Medicine": "NEET score",
      "Nursing": "NEET score",
      "Paramedical": "NEET score"
    },
    fees: {
      "Medicine": "₹1,500/year",
      "Nursing": "₹1,000/year",
      "Paramedical": "₹1,200/year"
    },
    is_verified: true,
    is_active: true
  },
  {
    name: "CMC Vellore",
    type: "private",
    location: {
      city: "Vellore",
      state: "Tamil Nadu",
      pincode: "632004",
      district: "Vellore",
      coordinates: { lat: 12.9202, lng: 79.1500 }
    },
    address: "CMC Vellore, Vellore, 632004",
    website: "https://cmcvellore.ac.in",
    phone: "+91-416-2282012",
    email: "info@cmcvellore.ac.in",
    established_year: 1900,
    accreditation: ["NAAC A++", "UGC", "MCI"],
    facilities: {
      labs: true, wifi: true, hostel: true, sports: true,
      canteen: true, library: true, hospital: true
    },
    programs: {
      available: ["Medicine", "Nursing", "Paramedical", "Research"]
    },
    cut_off_data: {
      "2023": { "Medicine": 98, "Nursing": 94, "Paramedical": 89 }
    },
    admission_process: {
      "Medicine": "NEET score",
      "Nursing": "NEET score",
      "Paramedical": "NEET score"
    },
    fees: {
      "Medicine": "₹2 Lakhs/year",
      "Nursing": "₹1.5 Lakhs/year",
      "Paramedical": "₹1.8 Lakhs/year"
    },
    is_verified: true,
    is_active: true
  },

  // Law Colleges
  {
    name: "National Law School of India University",
    type: "government",
    location: {
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560072",
      district: "Bangalore",
      coordinates: { lat: 12.9716, lng: 77.5946 }
    },
    address: "NLSIU, Bangalore, 560072",
    website: "https://nls.ac.in",
    phone: "+91-80-23213160",
    email: "info@nls.ac.in",
    established_year: 1987,
    accreditation: ["NAAC A++", "UGC", "BCI"],
    facilities: {
      labs: true, wifi: true, hostel: true, sports: true,
      canteen: true, library: true, moot_court: true
    },
    programs: {
      available: ["Law", "Legal Studies", "Criminology"]
    },
    cut_off_data: {
      "2023": { "Law": 97, "Legal Studies": 95, "Criminology": 93 }
    },
    admission_process: {
      "Law": "CLAT score",
      "Legal Studies": "CLAT score",
      "Criminology": "CLAT score"
    },
    fees: {
      "Law": "₹2 Lakhs/year",
      "Legal Studies": "₹1.8 Lakhs/year",
      "Criminology": "₹1.5 Lakhs/year"
    },
    is_verified: true,
    is_active: true
  },

  // Management Institutes
  {
    name: "IIM Ahmedabad",
    type: "government",
    location: {
      city: "Ahmedabad",
      state: "Gujarat",
      pincode: "380015",
      district: "Ahmedabad",
      coordinates: { lat: 23.0225, lng: 72.5714 }
    },
    address: "IIM Ahmedabad, Ahmedabad, 380015",
    website: "https://iima.ac.in",
    phone: "+91-79-66323456",
    email: "info@iima.ac.in",
    established_year: 1961,
    accreditation: ["NAAC A++", "UGC", "AACSB"],
    facilities: {
      labs: true, wifi: true, hostel: true, sports: true,
      canteen: true, library: true, case_study_center: true
    },
    programs: {
      available: ["Management", "Business Administration", "Executive MBA"]
    },
    cut_off_data: {
      "2023": { "Management": 99, "Business Administration": 98, "Executive MBA": 95 }
    },
    admission_process: {
      "Management": "CAT score + Interview",
      "Business Administration": "CAT score + Interview",
      "Executive MBA": "CAT score + Interview + Work Experience"
    },
    fees: {
      "Management": "₹23 Lakhs/year",
      "Business Administration": "₹25 Lakhs/year",
      "Executive MBA": "₹30 Lakhs/year"
    },
    is_verified: true,
    is_active: true
  },
  {
    name: "IIM Bangalore",
    type: "government",
    location: {
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560076",
      district: "Bangalore",
      coordinates: { lat: 12.9716, lng: 77.5946 }
    },
    address: "IIM Bangalore, Bangalore, 560076",
    website: "https://iimb.ac.in",
    phone: "+91-80-26993000",
    email: "info@iimb.ac.in",
    established_year: 1973,
    accreditation: ["NAAC A++", "UGC", "AACSB"],
    facilities: {
      labs: true, wifi: true, hostel: true, sports: true,
      canteen: true, library: true, case_study_center: true
    },
    programs: {
      available: ["Management", "Business Administration", "Executive MBA"]
    },
    cut_off_data: {
      "2023": { "Management": 98, "Business Administration": 97, "Executive MBA": 94 }
    },
    admission_process: {
      "Management": "CAT score + Interview",
      "Business Administration": "CAT score + Interview",
      "Executive MBA": "CAT score + Interview + Work Experience"
    },
    fees: {
      "Management": "₹22 Lakhs/year",
      "Business Administration": "₹24 Lakhs/year",
      "Executive MBA": "₹28 Lakhs/year"
    },
    is_verified: true,
    is_active: true
  }
];

async function populateComprehensiveColleges() {
  console.log('🏛️ Populating Comprehensive College Database...\n');

  try {
    // First, clear existing duplicates
    console.log('🧹 Cleaning up existing duplicates...');
    
    // Get all existing colleges
    const { data: existingColleges, error: fetchError } = await supabase
      .from('colleges')
      .select('*');

    if (fetchError) {
      console.error('❌ Error fetching existing colleges:', fetchError.message);
      return;
    }

    // Group by name to find duplicates
    const collegeGroups = {};
    existingColleges?.forEach(college => {
      if (!collegeGroups[college.name]) {
        collegeGroups[college.name] = [];
      }
      collegeGroups[college.name].push(college);
    });

    // Delete duplicates (keep the most recent one)
    let deletedCount = 0;
    for (const [name, colleges] of Object.entries(collegeGroups)) {
      if (colleges.length > 1) {
        // Sort by created_at, keep the latest
        colleges.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const toDelete = colleges.slice(1); // Keep first, delete rest
        
        for (const college of toDelete) {
          const { error: deleteError } = await supabase
            .from('colleges')
            .delete()
            .eq('id', college.id);
          
          if (!deleteError) {
            deletedCount++;
          }
        }
      }
    }

    console.log(`✅ Cleaned up ${deletedCount} duplicate colleges`);

    // Now insert comprehensive college data
    console.log('\n📚 Inserting comprehensive college data...');
    
    let insertedCount = 0;
    for (const college of comprehensiveColleges) {
      // Check if college already exists
      const { data: existingCollege } = await supabase
        .from('colleges')
        .select('id')
        .eq('name', college.name)
        .limit(1);

      if (!existingCollege || existingCollege.length === 0) {
        const { data: insertedCollege, error: insertError } = await supabase
          .from('colleges')
          .insert([college])
          .select();

        if (insertError) {
          console.error(`❌ Error inserting ${college.name}:`, insertError.message);
        } else {
          console.log(`✅ Inserted: ${college.name}`);
          insertedCount++;
        }
      } else {
        console.log(`⚠️  ${college.name} already exists, skipping...`);
      }
    }

    // Verify the final data
    console.log('\n🔍 Verifying final college database...');
    
    const { data: finalColleges, error: finalError } = await supabase
      .from('colleges')
      .select('*')
      .eq('is_active', true);

    if (finalError) {
      console.error('❌ Error fetching final data:', finalError.message);
    } else {
      console.log(`📊 Final Database Summary:`);
      console.log(`   - Total Active Colleges: ${finalColleges?.length || 0}`);
      
      // Group by type
      const byType = {};
      finalColleges?.forEach(college => {
        byType[college.type] = (byType[college.type] || 0) + 1;
      });
      
      console.log(`   - Government Colleges: ${byType.government || 0}`);
      console.log(`   - Private Colleges: ${byType.private || 0}`);
      
      // Group by state
      const byState = {};
      finalColleges?.forEach(college => {
        const state = college.location?.state || 'Unknown';
        byState[state] = (byState[state] || 0) + 1;
      });
      
      console.log(`   - States Covered: ${Object.keys(byState).length}`);
      Object.entries(byState).forEach(([state, count]) => {
        console.log(`     * ${state}: ${count} colleges`);
      });
    }

    console.log('\n🎉 Comprehensive college database population completed!');
    console.log(`📈 New colleges inserted: ${insertedCount}`);
    console.log(`📈 Duplicates removed: ${deletedCount}`);

  } catch (error) {
    console.error('❌ Population failed:', error.message);
    process.exit(1);
  }
}

populateComprehensiveColleges();
