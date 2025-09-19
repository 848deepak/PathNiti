/**
 * Enhanced college profile data types for dynamic college profiles system
 */

export interface LocationData {
  latitude?: number;
  longitude?: number;
  city: string;
  state: string;
  country: string;
  pincode?: string;
}

export interface AdmissionCriteria {
  minimum_percentage?: number;
  entrance_exam_required?: boolean;
  entrance_exam_name?: string;
  application_deadline?: string;
  eligibility_criteria: string[];
  selection_process: string[];
}

export interface ScholarshipInfo {
  name: string;
  description: string;
  eligibility: string[];
  amount?: string;
  application_deadline?: string;
}

export interface EntranceTestInfo {
  name: string;
  description: string;
  exam_date?: string;
  registration_deadline?: string;
  syllabus_url?: string;
}

export interface FeeStructure {
  tuition_fee?: number;
  hostel_fee?: number;
  other_fees?: number;
  total_fee?: number;
  fee_breakdown: Array<{
    category: string;
    amount: number;
    description?: string;
  }>;
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  duration?: string;
  eligibility?: string;
  fees?: {
    tuition: number;
    other: number;
    total: number;
  };
  seats?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'admission' | 'event' | 'urgent';
  is_active: boolean;
  published_at: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CollegeType = 'government' | 'government_aided' | 'private' | 'deemed';

export interface CollegeProfileData {
  id: string;
  slug: string | null;
  name: string;
  type: CollegeType;
  location: LocationData;
  address: string;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  established_year?: number | null;
  accreditation?: string[] | null;
  about?: string | null;
  admission_criteria?: AdmissionCriteria | null;
  scholarships?: ScholarshipInfo[] | null;
  entrance_tests?: EntranceTestInfo[] | null;
  fee_structure?: FeeStructure | null;
  gallery?: string[] | null;
  facilities?: any | null;
  programs?: any | null;
  cut_off_data?: any | null;
  admission_process?: any | null;
  fees?: any | null;
  images?: string[] | null;
  is_verified: boolean;
  is_active: boolean;
  courses: Course[];
  notices: Notice[];
  events: Event[];
  created_at: string;
  updated_at: string;
}

export interface CollegeProfileCreateData {
  name: string;
  type: CollegeType;
  location: LocationData;
  address: string;
  website?: string;
  phone?: string;
  email?: string;
  established_year?: number;
  accreditation?: string[];
  about?: string;
  admission_criteria?: AdmissionCriteria;
  scholarships?: ScholarshipInfo[];
  entrance_tests?: EntranceTestInfo[];
  fee_structure?: FeeStructure;
  gallery?: string[];
}

export interface CollegeProfileUpdateData extends Partial<CollegeProfileCreateData> {
  slug?: string;
}

export interface CollegeSlugValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}