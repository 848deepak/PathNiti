import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
// import { Database } from '@/lib/supabase/types' // Unused import

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");

    let userId: string;

    if (userIdParam) {
      // If userId is provided as query parameter, use it directly
      userId = userIdParam;
    } else {
      // Otherwise, get the authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      userId = user.id;
    }

    // Verify user is a student (only if we have a valid userId)
    if (userId) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, first_name, last_name")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Profile fetch error for user:", userId, profileError);
        return NextResponse.json(
          { 
            error: "Profile not found or access denied.", 
            details: profileError.message,
            userId: userId 
          },
          { status: 403 },
        );
      }

      if (!profile) {
        console.error("No profile found for user:", userId);
        return NextResponse.json(
          { 
            error: "User profile not found. Please complete your profile setup.", 
            userId: userId 
          },
          { status: 403 },
        );
      }

      if (profile.role !== "student") {
        console.error("User role mismatch. Expected 'student', got:", profile.role, "for user:", userId);
        return NextResponse.json(
          { 
            error: "Access denied. Student role required.", 
            currentRole: profile.role,
            userId: userId 
          },
          { status: 403 },
        );
      }
    } else {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Fetch notifications for the user
    const { data: notifications, error: notificationsError } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("sent_at", { ascending: false })
      .limit(50); // Limit to recent 50 notifications

    if (notificationsError) {
      console.error("Error fetching notifications:", notificationsError);
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: notifications || [],
    });
  } catch (error) {
    console.error("Unexpected error in student notifications API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
