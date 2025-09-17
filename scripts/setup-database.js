#!/usr/bin/env node

/**
 * Database Setup Script for PathNiti
 * This script initializes the Supabase database with sample data
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL')
  console.error('   SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nPlease check your .env file and try again.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Sample data
const sampleColleges = [
  {
    name: "Delhi University",
    type: "government",
    location: {
      state: "Delhi",
      city: "New Delhi",
      district: "North Delhi",
      pincode: "110007",
      coordinates: { lat: 28.7041, lng: 77.1025 }
    },
    address: "University of Delhi, Delhi, 110007",
    website: "https://du.ac.in",
    phone: "+91-11-27667011",
    email: "info@du.ac.in",
    established_year: 1922,
    accreditation: ["NAAC A++", "UGC"],
    facilities: {
      hostel: true,
      library: true,
      sports: true,
      labs: true,
      wifi: true,
      canteen: true
    },
    programs: {
      available: ["Arts", "Science", "Commerce", "Engineering", "Medicine", "Law"]
    },
    is_verified: true,
    is_active: true
  },
  {
    name: "Jawaharlal Nehru University",
    type: "government",
    location: {
      state: "Delhi",
      city: "New Delhi",
      district: "South Delhi",
      pincode: "110067",
      coordinates: { lat: 28.5450, lng: 77.1650 }
    },
    address: "JNU, New Delhi, 110067",
    website: "https://jnu.ac.in",
    phone: "+91-11-26704000",
    email: "info@jnu.ac.in",
    established_year: 1969,
    accreditation: ["NAAC A++", "UGC"],
    facilities: {
      hostel: true,
      library: true,
      sports: true,
      labs: true,
      wifi: true,
      canteen: true
    },
    programs: {
      available: ["Arts", "Science", "Social Sciences", "Languages", "International Studies"]
    },
    is_verified: true,
    is_active: true
  },
  {
    name: "University of Mumbai",
    type: "government",
    location: {
      state: "Maharashtra",
      city: "Mumbai",
      district: "Mumbai",
      pincode: "400001",
      coordinates: { lat: 19.0760, lng: 72.8777 }
    },
    address: "University of Mumbai, Mumbai, 400001",
    website: "https://mu.ac.in",
    phone: "+91-22-26526000",
    email: "info@mu.ac.in",
    established_year: 1857,
    accreditation: ["NAAC A++", "UGC"],
    facilities: {
      hostel: true,
      library: true,
      sports: true,
      labs: true,
      wifi: true,
      canteen: true
    },
    programs: {
      available: ["Arts", "Science", "Commerce", "Engineering", "Medicine", "Law", "Management"]
    },
    is_verified: true,
    is_active: true
  }
]

const sampleScholarships = [
  {
    name: "National Merit Scholarship",
    description: "Merit-based scholarship for outstanding students pursuing higher education in government institutions.",
    provider: "Government of India",
    amount: {
      min: 50000,
      max: 50000,
      currency: "INR",
      period: "yearly"
    },
    eligibility: {
      academic_requirements: ["Class 12 passed", "Minimum 85% marks"],
      income_limit: 500000,
      age_limit: 25,
      other_requirements: ["Admitted to government institution"]
    },
    application_deadline: "2024-03-15",
    application_process: "Apply online through National Scholarship Portal",
    documents_required: ["Marksheet", "Income Certificate", "Admission Proof", "Bank Details"],
    website: "https://scholarships.gov.in",
    contact_info: {
      email: "scholarships@education.gov.in",
      phone: "+91-11-23381234"
    },
    is_active: true
  },
  {
    name: "Post Matric Scholarship for SC/ST",
    description: "Financial assistance for SC/ST students pursuing post-matriculation courses.",
    provider: "Ministry of Social Justice",
    amount: {
      min: 20000,
      max: 120000,
      currency: "INR",
      period: "yearly"
    },
    eligibility: {
      academic_requirements: ["Class 10+ passed"],
      category: ["SC", "ST"],
      income_limit: 250000,
      other_requirements: ["Admitted to recognized institution"]
    },
    application_deadline: "2024-04-30",
    application_process: "Apply through state scholarship portal",
    documents_required: ["Caste Certificate", "Marksheet", "Income Certificate", "Admission Proof"],
    website: "https://scholarships.gov.in",
    contact_info: {
      email: "scst-scholarship@socialjustice.gov.in",
      phone: "+91-11-23381234"
    },
    is_active: true
  }
]

const sampleTimelineEvents = [
  {
    title: "JEE Main 2024 Registration",
    description: "Registration for JEE Main 2024 examination begins",
    deadline_date: "2024-12-15",
    deadline_type: "exam",
    stream: "engineering",
    class_level: "12",
    is_active: true
  },
  {
    title: "NEET 2024 Application Deadline",
    description: "Last date to submit NEET 2024 application forms",
    deadline_date: "2024-01-15",
    deadline_type: "deadline",
    stream: "medical",
    class_level: "12",
    is_active: true
  },
  {
    title: "CUET 2024 Registration",
    description: "Common University Entrance Test registration opens",
    deadline_date: "2024-02-01",
    deadline_type: "exam",
    stream: "arts",
    class_level: "12",
    is_active: true
  }
]

async function setupDatabase() {
  console.log('🚀 Setting up PathNiti database...\n')

  try {
    // 1. Insert sample colleges
    console.log('📚 Inserting sample colleges...')
    const { data: colleges, error: collegesError } = await supabase
      .from('colleges')
      .insert(sampleColleges)
      .select()

    if (collegesError) {
      console.error('❌ Error inserting colleges:', collegesError)
    } else {
      console.log(`✅ Inserted ${colleges.length} colleges`)
    }

    // 2. Insert sample scholarships
    console.log('\n💰 Inserting sample scholarships...')
    const { data: scholarships, error: scholarshipsError } = await supabase
      .from('scholarships')
      .insert(sampleScholarships)
      .select()

    if (scholarshipsError) {
      console.error('❌ Error inserting scholarships:', scholarshipsError)
    } else {
      console.log(`✅ Inserted ${scholarships.length} scholarships`)
    }

    // 3. Insert sample timeline events
    console.log('\n📅 Inserting sample timeline events...')
    const { data: events, error: eventsError } = await supabase
      .from('admission_deadlines')
      .insert(sampleTimelineEvents)
      .select()

    if (eventsError) {
      console.error('❌ Error inserting timeline events:', eventsError)
    } else {
      console.log(`✅ Inserted ${events.length} timeline events`)
    }

    // 4. Create admin user (if not exists)
    console.log('\n👤 Creating admin user...')
    const adminEmail = 'admin@pathniti.in'
    const adminPassword = 'admin123!'
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'User'
      }
    })

    if (authError) {
      console.log('ℹ️  Admin user might already exist:', authError.message)
    } else {
      // Create admin profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: adminEmail,
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          is_verified: true
        })

      if (profileError) {
        console.error('❌ Error creating admin profile:', profileError)
      } else {
        console.log('✅ Admin user created successfully')
        console.log(`   Email: ${adminEmail}`)
        console.log(`   Password: ${adminPassword}`)
      }
    }

    console.log('\n🎉 Database setup completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('   1. Update your .env file with the correct Supabase credentials')
    console.log('   2. Run the application: npm run dev')
    console.log('   3. Login with admin credentials to access admin panel')
    console.log('   4. Start adding more colleges, scholarships, and events')

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

// Run the setup
setupDatabase()
