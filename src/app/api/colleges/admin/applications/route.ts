import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  normalizePaginationParams,
  createPaginationResult,
} from "@/lib/utils/pagination";
import { applicationCache, CacheKeys } from "@/lib/services/cache-service";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);

    // Get current user
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user has college role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (!profile || profile.role !== "college") {
      return NextResponse.json(
        { error: "Forbidden - College role required" },
        { status: 403 },
      );
    }

    // Get college information from college_profiles
    const { data: collegeProfile } = await supabase
      .from("college_profiles")
      .select(
        `
        college_id,
        colleges!inner (
          id,
          name,
          slug
        )
      `,
      )
      .eq("id", session.user.id)
      .single();

    if (!collegeProfile) {
      return NextResponse.json(
        { error: "College profile not found" },
        { status: 404 },
      );
    }

    const college = {
      id: collegeProfile.college_id,
      name: collegeProfile.colleges?.[0]?.name || "Unknown College",
      slug: collegeProfile.colleges?.[0]?.slug || "unknown",
    };

    // Parse and normalize query parameters
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const { page, limit } = normalizePaginationParams(
      searchParams.get("page") || undefined,
      searchParams.get("limit") || undefined,
      50, // max limit
    );

    // Try to get from cache first
    const cacheKey = CacheKeys.collegeApplications(college.id, page, {
      status: status || "all",
      search: search || "",
    });

    const cachedData = applicationCache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Use optimized database function for better performance
    const { data, error } = await supabase
      .rpc("get_college_applications_paginated", {
        college_slug: college.slug,
        filter_status: status,
        search_term: search,
        page_size: limit,
        page_offset: (page - 1) * limit,
      })
      .single();

    if (error) {
      console.error("Error fetching applications:", error);
      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 },
      );
    }

    const result = {
      applications: (data as { applications?: unknown[] }).applications || [],
      pagination: {
        page,
        limit,
        total: (data as { total_count?: number }).total_count || 0,
        totalPages: Math.ceil(((data as { total_count?: number }).total_count || 0) / limit),
        hasNext: page * limit < ((data as { total_count?: number }).total_count || 0),
        hasPrev: page > 1,
      },
    };

    // Cache the result
    applicationCache.set(cacheKey, result, 2 * 60 * 1000); // 2 minutes cache

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in college applications API:", error);

    // Fallback to original implementation if optimized function fails
    try {
      return await getFallbackApplications(request);
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  }
}

// Fallback implementation using original logic
async function getFallbackApplications(request: NextRequest) {
  const supabase = createClient();
  const { searchParams } = new URL(request.url);

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get college information
  const { data: collegeProfile } = await supabase
    .from("college_profiles")
    .select(
      `
      college_id,
      colleges!inner (
        id,
        name
      )
    `,
    )
    .eq("id", session!.user.id)
    .single();

  const college = {
    id: collegeProfile!.college_id,
    name: (collegeProfile!.colleges as { name?: string })?.name || "Unknown College",
  };

  // Parse query parameters
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const { page, limit, offset } = normalizePaginationParams(
    searchParams.get("page") || undefined,
    searchParams.get("limit") || undefined,
    50,
  );

  // Build optimized query with better indexing
  let query = supabase
    .from("student_applications")
    .select(
      `
      id,
      full_name,
      email,
      phone,
      class_stream,
      status,
      submitted_at,
      reviewed_at,
      feedback,
      documents,
      profiles!student_applications_student_id_fkey (
        first_name,
        last_name,
        email
      )
    `,
    )
    .eq("college_id", college.id)
    .order("submitted_at", { ascending: false });

  // Apply filters
  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
    );
  }

  // Apply pagination
  query = query.range(offset!, offset! + limit - 1);

  const { data: applications, error: applicationsError } = await query;

  if (applicationsError) {
    throw applicationsError;
  }

  // Get total count
  let countQuery = supabase
    .from("student_applications")
    .select("*", { count: "exact", head: true })
    .eq("college_id", college.id);

  if (status && status !== "all") {
    countQuery = countQuery.eq("status", status);
  }

  if (search) {
    countQuery = countQuery.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
    );
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    throw countError;
  }

  const result = createPaginationResult(
    applications || [],
    page,
    limit,
    count || 0,
  );

  return NextResponse.json({
    applications: result.data,
    pagination: result.pagination,
  });
}
