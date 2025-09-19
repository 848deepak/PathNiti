/**
 * Nearby Colleges by Stream API
 * Enhanced Google Maps integration for stream-specific college recommendations
 */

import { NextRequest, NextResponse } from 'next/server';

interface StreamCollegeMapping {
  [key: string]: string[];
}

// Enhanced mapping of streams to college types and keywords
const STREAM_COLLEGE_MAPPING: StreamCollegeMapping = {
  science: ['university', 'institute_of_technology', 'science_college', 'research_institute'],
  engineering: ['institute_of_technology', 'engineering_college', 'technical_institute'],
  medical: ['medical_college', 'hospital', 'medical_university', 'nursing_college'],
  commerce: ['university', 'commerce_college', 'business_school', 'management_institute'],
  arts: ['university', 'arts_college', 'liberal_arts', 'humanities_college'],
  vocational: ['technical_institute', 'polytechnic', 'skill_center', 'vocational_school']
};

// J&K specific colleges with stream information
const JK_COLLEGES_DATABASE = [
  {
    name: 'University of Jammu',
    streams: ['science', 'arts', 'commerce'],
    location: { lat: 32.7266, lng: 74.8570, city: 'Jammu' },
    type: 'Central University',
    established: 1969,
    notable_programs: ['B.Sc.', 'B.A.', 'B.Com.', 'M.Sc.', 'MBA'],
    placement_record: 'Good',
    fees_range: '50000-200000'
  },
  {
    name: 'University of Kashmir',
    streams: ['science', 'arts', 'commerce'],
    location: { lat: 34.1260, lng: 74.8369, city: 'Srinagar' },
    type: 'Central University',
    established: 1948,
    notable_programs: ['B.Sc.', 'B.A.', 'B.Com.', 'M.A.', 'M.Sc.'],
    placement_record: 'Good',
    fees_range: '40000-180000'
  },
  {
    name: 'NIT Srinagar',
    streams: ['engineering', 'science'],
    location: { lat: 34.0479, lng: 74.9048, city: 'Srinagar' },
    type: 'National Institute of Technology',
    established: 1960,
    notable_programs: ['B.Tech', 'M.Tech', 'Ph.D'],
    placement_record: 'Excellent',
    fees_range: '200000-400000'
  },
  {
    name: 'Government Medical College Jammu',
    streams: ['medical'],
    location: { lat: 32.7182, lng: 74.8624, city: 'Jammu' },
    type: 'Government Medical College',
    established: 1973,
    notable_programs: ['MBBS', 'MD', 'MS'],
    placement_record: 'Excellent',
    fees_range: '100000-300000'
  },
  {
    name: 'Government Medical College Srinagar',
    streams: ['medical'],
    location: { lat: 34.0479, lng: 74.7964, city: 'Srinagar' },
    type: 'Government Medical College',
    established: 1959,
    notable_programs: ['MBBS', 'MD', 'MS'],
    placement_record: 'Excellent',
    fees_range: '100000-300000'
  },
  {
    name: 'SMVD University',
    streams: ['engineering', 'science', 'commerce'],
    location: { lat: 32.9264, lng: 75.0225, city: 'Katra' },
    type: 'Deemed University',
    established: 2002,
    notable_programs: ['B.Tech', 'MBA', 'B.Sc.'],
    placement_record: 'Good',
    fees_range: '150000-300000'
  },
  {
    name: 'Islamic University of Science and Technology',
    streams: ['engineering', 'science', 'commerce'],
    location: { lat: 33.6844, lng: 75.3132, city: 'Awantipora' },
    type: 'Private University',
    established: 2005,
    notable_programs: ['B.Tech', 'MBA', 'B.Sc.'],
    placement_record: 'Good',
    fees_range: '200000-400000'
  },
  {
    name: 'Government Polytechnic Jammu',
    streams: ['vocational', 'engineering'],
    location: { lat: 32.7335, lng: 74.8639, city: 'Jammu' },
    type: 'Government Polytechnic',
    established: 1965,
    notable_programs: ['Diploma in Engineering'],
    placement_record: 'Good',
    fees_range: '30000-80000'
  },
  {
    name: 'Government Polytechnic Srinagar',
    streams: ['vocational', 'engineering'],
    location: { lat: 34.0837, lng: 74.7973, city: 'Srinagar' },
    type: 'Government Polytechnic',
    established: 1963,
    notable_programs: ['Diploma in Engineering'],
    placement_record: 'Good',
    fees_range: '30000-80000'
  },
  {
    name: 'Central University of Kashmir',
    streams: ['science', 'arts', 'commerce'],
    location: { lat: 33.9456, lng: 75.1686, city: 'Ganderbal' },
    type: 'Central University',
    established: 2009,
    notable_programs: ['B.A.', 'B.Sc.', 'M.A.', 'M.Sc.'],
    placement_record: 'Good',
    fees_range: '50000-150000'
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { location, stream, radius = 50000 } = body;

    if (!location || !stream) {
      return NextResponse.json(
        { error: 'Location and stream are required' },
        { status: 400 }
      );
    }

    // First, try to get colleges from our J&K database
    const localColleges = getLocalCollegesByStream(location, stream, radius);

    // Then, try Google Maps API for additional colleges
    let googleColleges: any[] = [];
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (apiKey && location.city) {
      try {
        googleColleges = await fetchGoogleCollegesByStream(location, stream, radius, apiKey);
      } catch (error) {
        console.error('Google Maps API error:', error);
      }
    }

    // Combine and deduplicate results
    const allColleges = combineCollegeResults(localColleges, googleColleges);

    // Add stream-specific information
    const enhancedColleges = allColleges.map(college => ({
      ...college,
      stream_relevance: calculateStreamRelevance(college, stream),
      recommended_programs: getRecommendedPrograms(stream),
      admission_process: getAdmissionProcess(stream),
      career_prospects: getCareerProspects(stream)
    }));

    // Sort by relevance and distance
    enhancedColleges.sort((a, b) => {
      const relevanceA = a.stream_relevance * 0.7 + (a.rating || 3) * 0.3;
      const relevanceB = b.stream_relevance * 0.7 + (b.rating || 3) * 0.3;
      return relevanceB - relevanceA;
    });

    return NextResponse.json({
      success: true,
      colleges: enhancedColleges.slice(0, 15), // Limit to top 15 results
      metadata: {
        total_found: enhancedColleges.length,
        stream: stream,
        location: location,
        radius_km: radius / 1000,
        sources: {
          local_database: localColleges.length,
          google_maps: googleColleges.length
        }
      }
    });

  } catch (error) {
    console.error('Error in nearby colleges by stream API:', error);
    
    // Fallback to local database only
    const { location, stream } = await request.json();
    const fallbackColleges = getLocalCollegesByStream(location, stream, 100000);
    
    return NextResponse.json({
      success: true,
      colleges: fallbackColleges,
      fallback: true,
      warning: 'Using local database only. Google Maps API unavailable.',
      metadata: {
        total_found: fallbackColleges.length,
        stream: stream,
        location: location,
        sources: {
          local_database: fallbackColleges.length,
          google_maps: 0
        }
      }
    });
  }
}

/**
 * Get colleges from local J&K database by stream
 */
function getLocalCollegesByStream(location: any, stream: string, radius: number): any[] {
  return JK_COLLEGES_DATABASE
    .filter(college => college.streams.includes(stream))
    .map(college => ({
      id: college.name.toLowerCase().replace(/\s+/g, '_'),
      name: college.name,
      lat: college.location.lat,
      lng: college.location.lng,
      rating: 4.0, // Default rating for local colleges
      address: `${college.location.city}, Jammu and Kashmir`,
      type: college.type,
      established: college.established,
      programs: college.notable_programs,
      placement_record: college.placement_record,
      fees_range: college.fees_range,
      distance: calculateDistance(
        location.lat || 32.7266, // Default to Jammu
        location.lng || 74.8570,
        college.location.lat,
        college.location.lng
      ),
      source: 'local_database',
      verified: true
    }))
    .filter(college => college.distance <= radius / 1000); // Convert radius to km
}

/**
 * Fetch colleges from Google Maps API with stream-specific search
 */
async function fetchGoogleCollegesByStream(
  location: any, 
  stream: string, 
  radius: number, 
  apiKey: string
): Promise<any[]> {
  const collegeTypes = STREAM_COLLEGE_MAPPING[stream] || ['university'];
  const colleges: any[] = [];

  for (const type of collegeTypes) {
    try {
      const searchQuery = `${type} ${stream} college`;
      const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat || 32.7266},${location.lng || 74.8570}&radius=${radius}&keyword=${encodeURIComponent(searchQuery)}&key=${apiKey}`;

      const response = await fetch(apiUrl);
      if (!response.ok) continue;

      const data = await response.json();
      if (data.status === 'OK' && data.results) {
        const formattedColleges = data.results.map((place: any) => ({
          id: place.place_id,
          name: place.name,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          rating: place.rating || 3.5,
          address: place.vicinity || place.formatted_address,
          type: place.types?.join(', ') || 'College',
          photos: place.photos?.slice(0, 3).map((photo: any) => ({
            reference: photo.photo_reference,
            url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`
          })) || [],
          source: 'google_maps',
          verified: false
        }));

        colleges.push(...formattedColleges);
      }
    } catch (error) {
      console.error(`Error fetching ${type} colleges:`, error);
    }
  }

  return colleges;
}

/**
 * Combine and deduplicate college results
 */
function combineCollegeResults(localColleges: any[], googleColleges: any[]): any[] {
  const combined = [...localColleges];
  const existingNames = new Set(localColleges.map(c => c.name.toLowerCase()));

  googleColleges.forEach(college => {
    const nameKey = college.name.toLowerCase();
    if (!existingNames.has(nameKey)) {
      combined.push(college);
      existingNames.add(nameKey);
    }
  });

  return combined;
}

/**
 * Calculate stream relevance score for a college
 */
function calculateStreamRelevance(college: any, stream: string): number {
  let score = 0.5; // Base score

  // Check name for stream keywords
  const nameKeywords = {
    engineering: ['engineering', 'technology', 'technical', 'polytechnic'],
    medical: ['medical', 'health', 'nursing', 'pharmacy'],
    science: ['science', 'research', 'institute'],
    commerce: ['commerce', 'business', 'management', 'economics'],
    arts: ['arts', 'humanities', 'liberal'],
    vocational: ['polytechnic', 'technical', 'skill', 'vocational']
  };

  const keywords = nameKeywords[stream as keyof typeof nameKeywords] || [];
  const collegeName = college.name.toLowerCase();
  
  keywords.forEach(keyword => {
    if (collegeName.includes(keyword)) {
      score += 0.3;
    }
  });

  // Bonus for local database colleges (verified data)
  if (college.source === 'local_database') {
    score += 0.2;
  }

  // Bonus for higher ratings
  if (college.rating && college.rating > 4.0) {
    score += 0.1;
  }

  return Math.min(score, 1.0);
}

/**
 * Get recommended programs for a stream
 */
function getRecommendedPrograms(stream: string): string[] {
  const programs: Record<string, string[]> = {
    science: ['B.Sc. Physics', 'B.Sc. Chemistry', 'B.Sc. Mathematics', 'B.Sc. Biology'],
    engineering: ['B.Tech Computer Science', 'B.Tech Mechanical', 'B.Tech Civil', 'B.Tech Electrical'],
    medical: ['MBBS', 'BDS', 'B.Pharmacy', 'BSc Nursing'],
    commerce: ['B.Com', 'BBA', 'CA Foundation', 'Economics Honours'],
    arts: ['B.A. History', 'B.A. Political Science', 'B.A. Psychology', 'B.A. English'],
    vocational: ['Diploma in Engineering', 'Certificate courses', 'Skill development programs']
  };

  return programs[stream] || ['Bachelor\'s programs'];
}

/**
 * Get admission process information for a stream
 */
function getAdmissionProcess(stream: string): string {
  const processes: Record<string, string> = {
    science: 'Merit-based on Class 12 marks, entrance exams for specialized courses',
    engineering: 'JEE Main/Advanced, state engineering entrance exams',
    medical: 'NEET, state medical entrance exams',
    commerce: 'Merit-based on Class 12 marks, entrance exams for professional courses',
    arts: 'Merit-based on Class 12 marks, some universities conduct entrance exams',
    vocational: 'Class 10/12 based, skill assessment tests'
  };

  return processes[stream] || 'Merit-based admission process';
}

/**
 * Get career prospects for a stream
 */
function getCareerProspects(stream: string): string[] {
  const prospects: Record<string, string[]> = {
    science: ['Research Scientist', 'Data Analyst', 'Laboratory Technician', 'Science Teacher'],
    engineering: ['Software Engineer', 'Mechanical Engineer', 'Civil Engineer', 'Project Manager'],
    medical: ['Doctor', 'Nurse', 'Pharmacist', 'Medical Researcher'],
    commerce: ['Chartered Accountant', 'Financial Analyst', 'Business Manager', 'Banker'],
    arts: ['Civil Services', 'Teacher', 'Journalist', 'Social Worker'],
    vocational: ['Technical Expert', 'Skilled Tradesperson', 'Entrepreneur', 'Industry Specialist']
  };

  return prospects[stream] || ['Various career opportunities'];
}

/**
 * Calculate distance between two coordinates
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export async function GET() {
  return NextResponse.json({
    message: 'Nearby Colleges by Stream API',
    supported_streams: Object.keys(STREAM_COLLEGE_MAPPING),
    jk_colleges_count: JK_COLLEGES_DATABASE.length,
    usage: {
      POST: {
        body: {
          location: { city: 'string', state: 'string', lat: 'number (optional)', lng: 'number (optional)' },
          stream: 'string (science|engineering|medical|commerce|arts|vocational)',
          radius: 'number (in meters, default: 50000)'
        }
      }
    }
  });
}
