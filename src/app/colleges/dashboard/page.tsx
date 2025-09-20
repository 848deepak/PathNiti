import { Metadata } from "next";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Define comprehensive College interface
interface CollegeData {
  id: string;
  name: string;
  slug?: string;
  college_courses?: unknown[];
  college_notices?: unknown[];
  location?: { city?: string; state?: string };
  is_verified?: boolean;
  [key: string]: unknown; // For additional properties
}
import CollegeProfileManager from "@/components/CollegeProfileManager";
import CollegeApplicationManager from "@/components/CollegeApplicationManager";
import CollegeCourseManager from "@/components/CollegeCourseManager";
import CollegeNoticeManager from "@/components/CollegeNoticeManager";
import { CollegeNotifications } from "@/components/CollegeNotifications";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  Users,
  BookOpen,
  Calendar,
  Settings,
  Plus,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "College Dashboard | PathNiti",
  description:
    "Manage your college profile, courses, and student applications.",
};

export default async function CollegeDashboardPage() {
  const supabase = createServerClient();

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login?redirect=/colleges/dashboard");
  }

  // Check if user has college role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", session.user.id)
    .single();

  if (!profile) {
    redirect("/auth/complete-profile?redirect=/colleges/dashboard");
  }

  if (profile.role !== "college") {
    redirect("/dashboard?error=college-role-required");
  }

  // Check if user has a college profile
  const { data: collegeProfile } = await supabase
    .from("college_profiles")
    .select(
      `
      college_id,
      colleges!inner (
        *,
        college_courses(*),
        college_notices(*)
      )
    `,
    )
    .eq("id", session.user.id)
    .single();

  // If no college profile found, redirect to registration
  if (!collegeProfile) {
    redirect("/colleges/register");
  }

  const college = collegeProfile.colleges as unknown as CollegeData;

  // Get application statistics
  const { data: applicationStats } = await supabase
    .from("student_applications")
    .select("status")
    .eq("college_id", (college as CollegeData).id); 
  const totalApplications = applicationStats?.length || 0;
  const pendingApplications =
    applicationStats?.filter((app) => app.status === "pending").length || 0;
  // const approvedApplications = applicationStats?.filter(app => app.status === 'approved').length || 0
  // const rejectedApplications = applicationStats?.filter(app => app.status === 'rejected').length || 0

  // Transform the data to match our interface
  const collegeData = {
    ...(college as CollegeData),
    slug: (college as CollegeData).slug || "",
    courses: (college as CollegeData).college_courses || [],
    notices: (college as CollegeData).college_notices || [],
    events: [], // Events will be added later when implemented
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">
              College Dashboard
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {collegeData.slug && (
              <Button variant="outline" asChild>
                <Link href={`/colleges/${collegeData.slug}`} target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Profile
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <Building className="h-4 w-4 mr-2" />
                Back to Main Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {(collegeData as CollegeData).name}
          </h1>
          <p className="text-gray-600">
            Manage your college profile, courses, and student applications.
          </p>
          <div className="mt-4 flex items-center space-x-4">
            <Badge variant={(collegeData as CollegeData).is_verified ? "default" : "secondary"}>
              {(collegeData as CollegeData).is_verified ? (                 <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Verified
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-1" />
                  Pending Verification
                </>
              )}
            </Badge>
            <span className="text-sm text-gray-600">
              {(collegeData as CollegeData).location?.city}, {(collegeData as CollegeData).location?.state}
            </span>
            {(collegeData as CollegeData).slug && (               <span className="text-sm text-blue-600">
                /colleges/{(collegeData as CollegeData).slug}
              </span>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Active Courses
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {collegeData.courses?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Applications
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalApplications}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Pending Review
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingApplications}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Active Notices
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {collegeData.notices?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Section */}
        <div className="mb-8">
          <CollegeNotifications userId={session.user.id} />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              College Profile
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses ({collegeData.courses?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="notices" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Notices ({collegeData.notices?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Applications ({pendingApplications} pending)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks for managing your college
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    className="justify-start h-auto p-4"
                    variant="outline"
                  >
                    <div className="text-left">
                      <div className="flex items-center mb-1">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Course
                      </div>
                      <p className="text-xs text-gray-500">
                        Create new course offerings
                      </p>
                    </div>
                  </Button>
                  <Button
                    className="justify-start h-auto p-4"
                    variant="outline"
                  >
                    <div className="text-left">
                      <div className="flex items-center mb-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Post Notice
                      </div>
                      <p className="text-xs text-gray-500">
                        Share important updates
                      </p>
                    </div>
                  </Button>
                  <Button
                    className="justify-start h-auto p-4"
                    variant="outline"
                  >
                    <div className="text-left">
                      <div className="flex items-center mb-1">
                        <Users className="h-4 w-4 mr-2" />
                        View Applications
                      </div>
                      <p className="text-xs text-gray-500">
                        Manage student applications
                      </p>
                    </div>
                  </Button>
                  <Button
                    className="justify-start h-auto p-4"
                    variant="outline"
                  >
                    <div className="text-left">
                      <div className="flex items-center mb-1">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit Profile
                      </div>
                      <p className="text-xs text-gray-500">
                        Update college information
                      </p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* College Profile Manager */}
            <CollegeProfileManager initialData={null} />
          </TabsContent>

          <TabsContent value="courses">
            <CollegeCourseManager
              collegeId={(college as CollegeData).id}
              collegeName={(college as CollegeData).name}
            />
          </TabsContent>

          <TabsContent value="notices">
            <CollegeNoticeManager collegeId={(college as CollegeData).id} />
          </TabsContent>

          <TabsContent value="applications">
            <CollegeApplicationManager
              collegeId={(college as CollegeData).id}
              collegeName={(college as CollegeData).name}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
