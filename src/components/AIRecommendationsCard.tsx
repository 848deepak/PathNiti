'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Star, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Clock,
  GraduationCap,
  Award,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface AIRecommendationsCardProps {
  userId: string;
  className?: string;
}

interface RecommendationData {
  assessment: {
    id: string;
    overall_score: number;
    completed_at: string;
    aptitude_scores: Record<string, number>;
    riasec_scores: Record<string, number>;
    personality_scores: Record<string, number>;
  };
  recommendations: {
    primary_recommendations: any[];
    secondary_recommendations: any[];
    backup_options: any[];
    recommended_colleges: any[];
    relevant_scholarships: any[];
    overall_reasoning: string;
    confidence_score: number;
    generated_at: string;
  };
}

export function AIRecommendationsCard({ userId, className = '' }: AIRecommendationsCardProps) {
  const [data, setData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchRecommendations();
    }
  }, [userId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/student/recommendations?user_id=${userId}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to fetch recommendations');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-gray-600">Loading your personalized recommendations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}. Complete an assessment to get personalized AI recommendations.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button asChild>
              <Link href="/comprehensive-assessment">
                <Brain className="h-4 w-4 mr-2" />
                Take Assessment
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const { assessment, recommendations } = data;
  const primaryRec = recommendations.primary_recommendations?.[0];
  const topCollege = recommendations.recommended_colleges?.[0];
  const topScholarship = recommendations.relevant_scholarships?.[0];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Recommendations
          </CardTitle>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            {Math.round(recommendations.confidence_score * 100)}% Confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Recommendation */}
        {primaryRec && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Recommended Stream: {primaryRec.stream?.toUpperCase() || 'General'}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {primaryRec.reasoning || 'Based on your assessment results and interests.'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {primaryRec.time_to_earn && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {primaryRec.time_to_earn}
                    </Badge>
                  )}
                  {primaryRec.average_salary && (
                    <Badge variant="outline" className="text-xs">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {primaryRec.average_salary}
                    </Badge>
                  )}
                  {primaryRec.job_demand_trend && (
                    <Badge variant="outline" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {primaryRec.job_demand_trend}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top College Recommendation */}
        {topCollege && (
          <div className="border border-gray-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Recommended College: {topCollege.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {topCollege.location?.city}, {topCollege.location?.state}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {topCollege.type?.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {topCollege.website && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={topCollege.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Visit Website
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Scholarship */}
        {topScholarship && (
          <div className="border border-gray-200 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {topScholarship.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {topScholarship.description}
                </p>
                <div className="flex items-center gap-2">
                  {topScholarship.amount && (
                    <Badge variant="outline" className="text-xs">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {topScholarship.amount}
                    </Badge>
                  )}
                  {topScholarship.deadline && (
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(topScholarship.deadline).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Reasoning */}
        {recommendations.overall_reasoning && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              AI Analysis
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {recommendations.overall_reasoning}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="flex-1">
            <Link href="/assessment-results">
              <Brain className="h-4 w-4 mr-2" />
              View Full Results
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href="/colleges">
              <GraduationCap className="h-4 w-4 mr-2" />
              Explore Colleges
            </Link>
          </Button>
        </div>

        {/* Assessment Score Summary */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Assessment Score:</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{assessment.overall_score}%</span>
              <Badge variant="secondary" className="text-xs">
                Completed {new Date(assessment.completed_at).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AIRecommendationsCard;
