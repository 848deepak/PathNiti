'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../providers';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Clock, 
  DollarSign, 
  MapPin, 
  GraduationCap, 
  Award,
  Target,
  AlertTriangle,
  CheckCircle,
  Brain,
  Heart,
  Users,
  BookOpen,
  Star,
  Calendar,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';

interface RecommendationData {
  assessment: {
    id: string;
    aptitude_scores: Record<string, number>;
    riasec_scores: Record<string, number>;
    personality_scores: Record<string, number>;
    subject_performance: Record<string, any>;
    practical_constraints: Record<string, string>;
    total_score: number;
    completed_at: string;
  };
  recommendations: {
    primary_recommendations: Array<{
      stream: string;
      reasoning: string;
      time_to_earn: string;
      average_salary: string;
      job_demand_trend: string;
      confidence_score: number;
    }>;
    secondary_recommendations: Array<{
      stream: string;
      reasoning: string;
      time_to_earn: string;
      average_salary: string;
      job_demand_trend: string;
      confidence_score: number;
    }>;
    backup_options: Array<{
      course: string;
      why_considered: string;
      alternate_path?: string;
    }>;
    recommended_colleges: Array<{
      college_id: string;
      college_name: string;
      address: string;
      stream_offered: string;
      admission_criteria: string;
      fee_structure: string;
      match_score: number;
      reasons: string[];
    }>;
    relevant_scholarships: Array<{
      scholarship_id: string;
      name: string;
      eligibility: string;
      benefit: string;
      application_deadline: string;
      match_score: number;
    }>;
    overall_reasoning: string;
    recommendation_confidence: number;
  };
}

function AssessmentResultsPageContent() {
  const { user, loading, requireAuth } = useAuth();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [data, setData] = useState<RecommendationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !sessionId) return;

    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/assessment?user_id=${user.id}&session_id=${sessionId}`);
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          setError('Failed to load assessment results');
        }
      } catch (err) {
        setError('An error occurred while loading results');
        console.error('Error fetching results:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [user, sessionId]);

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">Loading your personalized recommendations...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Handle unauthenticated users
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please sign in to view your assessment results.</p>
            <Button onClick={() => window.location.href = '/auth/login'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error Loading Results</h2>
            <p className="text-gray-600">{error || 'Assessment results not found'}</p>
            <Button className="mt-4" onClick={() => window.location.href = '/comprehensive-assessment'}>
              Take Assessment Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { assessment, recommendations } = data;

  const getDemandColor = (trend: string) => {
    switch (trend) {
      case 'very_high':
      case 'growing':
        return 'text-green-600 bg-green-50';
      case 'high':
        return 'text-blue-600 bg-blue-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Your Career Recommendations</h1>
        </div>
        <p className="text-gray-600">
          Based on your comprehensive assessment completed on {new Date(assessment.completed_at).toLocaleDateString()}
        </p>
      </div>

      {/* Overall Score & Confidence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {assessment.total_score}/100
            </div>
            <Progress value={assessment.total_score} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5" />
              Confidence Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold mb-2 ${getConfidenceColor(recommendations.recommendation_confidence)}`}>
              {Math.round(recommendations.recommendation_confidence * 100)}%
            </div>
            <Progress value={recommendations.recommendation_confidence * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Assessment Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-gray-700 mb-2">
              Comprehensive
            </div>
            <p className="text-sm text-gray-600">
              Multi-dimensional career analysis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="recommendations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="colleges" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Colleges
          </TabsTrigger>
          <TabsTrigger value="scholarships" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Scholarships
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Analysis
          </TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          {/* AI Reasoning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                {recommendations.overall_reasoning}
              </p>
            </CardContent>
          </Card>

          {/* Primary Recommendations */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500" />
              Primary Recommendations
            </h2>
            <div className="grid gap-4">
              {recommendations.primary_recommendations.map((rec, index) => (
                <Card key={index} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl capitalize">
                        {rec.stream.replace('_', ' ')}
                      </CardTitle>
                      <Badge className={getConfidenceColor(rec.confidence_score)}>
                        {Math.round(rec.confidence_score * 100)}% Match
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{rec.reasoning}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Time to Earn</p>
                          <p className="font-semibold">{rec.time_to_earn}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Average Salary</p>
                          <p className="font-semibold">{rec.average_salary}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-600">Job Demand</p>
                          <Badge className={getDemandColor(rec.job_demand_trend)}>
                            {rec.job_demand_trend.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Secondary Recommendations */}
          {recommendations.secondary_recommendations.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Target className="h-6 w-6 text-blue-500" />
                Alternative Options
              </h2>
              <div className="grid gap-4">
                {recommendations.secondary_recommendations.map((rec, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg capitalize">
                          {rec.stream.replace('_', ' ')}
                        </CardTitle>
                        <Badge variant="outline">
                          {Math.round(rec.confidence_score * 100)}% Match
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{rec.reasoning}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span>{rec.time_to_earn}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span>{rec.average_salary}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                          <Badge size="sm" className={getDemandColor(rec.job_demand_trend)}>
                            {rec.job_demand_trend.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Backup Options */}
          {recommendations.backup_options.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
                Backup Options
              </h2>
              <div className="grid gap-4">
                {recommendations.backup_options.map((option, index) => (
                  <Card key={index} className="border-l-4 border-l-orange-500">
                    <CardHeader>
                      <CardTitle className="text-lg">{option.course}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{option.why_considered}</p>
                      {option.alternate_path && (
                        <p className="text-sm text-blue-600 mt-2">
                          <strong>Alternative Path:</strong> {option.alternate_path}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Colleges Tab */}
        <TabsContent value="colleges" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Recommended Colleges</h2>
            <Badge variant="outline">
              {recommendations.recommended_colleges.length} matches found
            </Badge>
          </div>

          <div className="grid gap-6">
            {recommendations.recommended_colleges.map((college, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{college.college_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4" />
                        {college.address}
                      </CardDescription>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {Math.round(college.match_score * 100)}% Match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Streams Offered</h4>
                      <p className="text-gray-700">{college.stream_offered}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Fee Structure</h4>
                      <p className="text-gray-700">{college.fee_structure}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Admission Criteria</h4>
                    <p className="text-gray-700">{college.admission_criteria}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Why This College?</h4>
                    <div className="flex flex-wrap gap-2">
                      {college.reasons.map((reason, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Scholarships Tab */}
        <TabsContent value="scholarships" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Available Scholarships</h2>
            <Badge variant="outline">
              {recommendations.relevant_scholarships.length} opportunities
            </Badge>
          </div>

          <div className="grid gap-4">
            {recommendations.relevant_scholarships.map((scholarship, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{scholarship.name}</CardTitle>
                    <Badge className="bg-green-100 text-green-800">
                      {Math.round(scholarship.match_score * 100)}% Match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Benefit</h4>
                      <p className="text-gray-700">{scholarship.benefit}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Deadline</h4>
                      <p className="text-gray-700 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {scholarship.application_deadline}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Eligibility</h4>
                    <p className="text-gray-700">{scholarship.eligibility}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <h2 className="text-2xl font-bold">Assessment Analysis</h2>
          
          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aptitude Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  Aptitude Scores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(assessment.aptitude_scores).map(([skill, score]) => (
                  <div key={skill}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium capitalize">
                        {skill.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm text-gray-600">
                        {Math.round(score * 100)}%
                      </span>
                    </div>
                    <Progress value={score * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* RIASEC Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  Interest Profile (RIASEC)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(assessment.riasec_scores).map(([interest, score]) => (
                  <div key={interest}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium capitalize">
                        {interest}
                      </span>
                      <span className="text-sm text-gray-600">
                        {Math.round(score * 100)}%
                      </span>
                    </div>
                    <Progress value={score * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Personality Traits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  Personality Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(assessment.personality_scores).map(([trait, score]) => (
                  <div key={trait}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium capitalize">
                        {trait.replace(/_/g, ' vs ')}
                      </span>
                      <span className="text-sm text-gray-600">
                        {Math.round(score * 100)}%
                      </span>
                    </div>
                    <Progress value={score * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Practical Constraints */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  Practical Considerations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(assessment.practical_constraints).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {value.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4 justify-center">
        <Button variant="outline" onClick={() => window.print()}>
          Download Report
        </Button>
        <Button onClick={() => window.location.href = '/comprehensive-assessment'}>
          Retake Assessment
        </Button>
      </div>
    </div>
  );
}

export default function AssessmentResultsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">Loading your assessment results...</h2>
          </div>
        </div>
      </div>
    }>
      <AssessmentResultsPageContent />
    </Suspense>
  );
}
