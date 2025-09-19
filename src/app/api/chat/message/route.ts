import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sarthiAI, type SarthiUserProfile } from '@/lib/sarthi-ai';
import { QuestionGenerator } from '@/lib/question-generator';

interface ChatMessageRequest {
  session_id: string;
  message: string;
  user_profile?: {
    user_id: string;
    class_level?: string;
    stream?: string;
    interests?: string[];
    location?: any;
  };
}

interface ChatResponse {
  response: string;
  capability_used: string;
  confidence_score?: number;
  processing_time_ms: number;
  metadata?: any;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { session_id, message, user_profile }: ChatMessageRequest = await request.json();

    if (!session_id || !message) {
      return NextResponse.json(
        { error: 'Session ID and message are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Store user message (only if session_id is a valid UUID)
    let userMessage = null;
    let userMessageError = null;
    
    if (session_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const { data, error } = await supabase
        .from('conversation_messages')
        .insert({
          session_id,
          message_type: 'user',
          content: message,
          metadata: {
            user_agent: request.headers.get('user-agent'),
            timestamp: new Date().toISOString(),
          },
        })
        .select()
        .single();
      
      userMessage = data;
      userMessageError = error;
    }

    if (userMessageError) {
      console.error('Error storing user message:', userMessageError);
    }

    // Process message and generate response
    const chatResponse = await processMessage(message, user_profile);

    // Store assistant response (only if session_id is a valid UUID)
    let assistantMessage = null;
    let assistantMessageError = null;
    
    if (session_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      const { data, error } = await supabase
        .from('conversation_messages')
        .insert({
          session_id,
          message_type: 'assistant',
          content: chatResponse.response,
          metadata: {
            capability_used: chatResponse.capability_used,
            confidence_score: chatResponse.confidence_score,
            processing_time_ms: chatResponse.processing_time_ms,
            timestamp: new Date().toISOString(),
          },
        })
        .select()
        .single();
      
      assistantMessage = data;
      assistantMessageError = error;
    }

    if (assistantMessageError) {
      console.error('Error storing assistant message:', assistantMessageError);
    }

    // Log interaction for analytics
    if (userMessage && assistantMessage) {
      await supabase
        .from('sarthi_interactions')
        .insert({
          session_id,
          message_id: assistantMessage.id,
          capability_used: chatResponse.capability_used,
          input_data: { message, user_profile },
          output_data: chatResponse.metadata,
          confidence_score: chatResponse.confidence_score,
          processing_time_ms: chatResponse.processing_time_ms,
        });
    }

    return NextResponse.json(chatResponse);
  } catch (error) {
    console.error('Error in chat message processing:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        response: 'I apologize, but I encountered an error processing your request. Please try again.',
        capability_used: 'error',
        processing_time_ms: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

async function processMessage(message: string, user_profile?: any): Promise<ChatResponse> {
  const startTime = Date.now();
  const lowerMessage = message.toLowerCase();

  try {
    // Determine capability based on message content
    const capability = determineCapability(lowerMessage);
    
    switch (capability) {
      case 'recommendation':
        return await handleRecommendationRequest(message, user_profile, startTime);
      
      case 'question_generation':
        return await handleQuestionGenerationRequest(message, user_profile, startTime);
      
      case 'college_info':
        return await handleCollegeInfoRequest(message, user_profile, startTime);
      
      case 'general_chat':
      default:
        return await handleGeneralChat(message, user_profile, startTime);
    }
  } catch (error) {
    console.error('Error processing message:', error);
    return {
      response: 'I apologize, but I encountered an error processing your request. Please try rephrasing your question or ask me something else.',
      capability_used: 'error',
      processing_time_ms: Date.now() - startTime,
    };
  }
}

function determineCapability(message: string): string {
  // Recommendation keywords
  const recommendationKeywords = [
    'recommend', 'suggestion', 'stream', 'course', 'career', 'path', 'future',
    'what should i', 'which stream', 'help me choose', 'guidance', 'advice',
    'science', 'commerce', 'arts', 'engineering', 'medical', 'after 10th', 'after 12th'
  ];

  // Question generation keywords
  const questionKeywords = [
    'question', 'practice', 'quiz', 'mcq', 'test', 'exam', 'generate',
    'math', 'mathematics', 'science', 'physics', 'chemistry', 'biology',
    'english', 'social', 'history', 'geography', 'economics'
  ];

  // College info keywords
  const collegeKeywords = [
    'college', 'university', 'institute', 'admission', 'cutoff', 'fees',
    'engineering college', 'medical college', 'nearby', 'location', 'program',
    'clg', 'collage', 'collages', 'colleges', 'jammu', 'kashmir', 'srinagar',
    'leh', 'kargil', 'anantnag', 'baramulla', 'budgam', 'kupwara', 'pulwama',
    'shopian', 'bandipora', 'ganderbal', 'doda', 'kishtwar', 'ramban',
    'rajouri', 'poonch', 'udhampur', 'reasi', 'kathua', 'samba'
  ];

  if (recommendationKeywords.some(keyword => message.includes(keyword))) {
    return 'recommendation';
  }
  
  if (questionKeywords.some(keyword => message.includes(keyword))) {
    return 'question_generation';
  }
  
  if (collegeKeywords.some(keyword => message.includes(keyword))) {
    return 'college_info';
  }

  return 'general_chat';
}

async function handleRecommendationRequest(message: string, user_profile: any, startTime: number): Promise<ChatResponse> {
  try {
    if (!user_profile) {
      return {
        response: `I'd love to help with course recommendations! Please tell me your class level (10th, 11th, or 12th), interests, and location so I can give you personalized suggestions.`,
        capability_used: 'recommendation',
        confidence_score: 0.8,
        processing_time_ms: Date.now() - startTime,
      };
    }

    // Create Sarthi user profile
    const sarthiProfile: SarthiUserProfile = {
      user_id: user_profile.user_id || 'anonymous',
      age: 16, // Default age for class 10-12 students
      class_level: user_profile.class_level || '12',
      current_stream: user_profile.stream,
      interests: user_profile.interests || [],
      location: {
        state: user_profile.location?.state || 'Jammu and Kashmir',
        city: user_profile.location?.city,
        district: user_profile.location?.district,
      },
      family_background: {
        income_range: 'middle',
        parent_education: 'high_school',
        parent_occupation: 'service',
        family_expectations: ['job_security', 'good_salary'],
      },
      concerns: ['earning_potential', 'job_security'],
    };

    const recommendations = await sarthiAI.getEnhancedRecommendations(sarthiProfile);
    
    const response = `Based on your profile, I recommend **${recommendations.primary_recommendation.stream.toUpperCase()}**.

${recommendations.primary_recommendation.reasoning}

**Key Benefits:**
• Time to earn: ${recommendations.primary_recommendation.time_to_earn}
• Average salary: ${recommendations.primary_recommendation.average_salary}
• Job demand: ${recommendations.primary_recommendation.job_demand_trend}

**Alternative:** ${recommendations.alternatives[0]?.stream.toUpperCase() || 'Commerce'}

**Next Steps:**
${recommendations.action_plan.slice(0, 2).map(step => `• ${step}`).join('\n')}

Need more details or college options?`;

    return {
      response,
      capability_used: 'recommendation',
      confidence_score: recommendations.recommendation_confidence || 0.85,
      processing_time_ms: Date.now() - startTime,
      metadata: {
        primary_recommendation: recommendations.primary_recommendation,
        alternatives: recommendations.alternatives,
      },
    };
  } catch (error) {
    console.error('Error in recommendation handling:', error);
    return {
      response: 'I apologize, but I encountered an error generating recommendations. Please try again or provide more specific information about your interests and goals.',
      capability_used: 'recommendation',
      processing_time_ms: Date.now() - startTime,
    };
  }
}

async function handleQuestionGenerationRequest(message: string, user_profile: any, startTime: number): Promise<ChatResponse> {
  try {
    // Extract subject and class from message
    const subjectMatch = message.match(/(math|mathematics|science|physics|chemistry|biology|english|social|history|geography|economics)/i);
    const classMatch = message.match(/(10|11|12|tenth|eleventh|twelfth)/i);
    const countMatch = message.match(/(\d+)\s*(questions?|mcqs?)/i);

    const subject = subjectMatch ? subjectMatch[1].toLowerCase() : null;
    const classLevel = classMatch ? classMatch[1] : (user_profile?.class_level || '12');
    const count = countMatch ? parseInt(countMatch[1]) : 5;

    if (!subject) {
      return {
        response: `I'd love to generate practice questions! Please specify the subject (Math, Science, English, or Social Science) and class (10, 11, or 12). For example: "Generate 10 math questions for class 12"`,
        capability_used: 'question_generation',
        confidence_score: 0.9,
        processing_time_ms: Date.now() - startTime,
      };
    }

    // Map subject names
    const subjectMap: { [key: string]: string } = {
      'math': 'mathematics',
      'mathematics': 'mathematics',
      'science': 'science',
      'physics': 'science',
      'chemistry': 'science',
      'biology': 'science',
      'english': 'english',
      'social': 'social_science',
      'history': 'social_science',
      'geography': 'social_science',
      'economics': 'social_science',
    };

    const mappedSubject = subjectMap[subject] || subject;
    const grade = parseInt(classLevel);

    if (![10, 11, 12].includes(grade)) {
      return {
        response: 'I can only generate questions for classes 10, 11, and 12. Please specify a valid class level.',
        capability_used: 'question_generation',
        processing_time_ms: Date.now() - startTime,
      };
    }

    const generator = new QuestionGenerator();
    const questions = await generator.generateQuestionsForSubject(grade, mappedSubject, count);

    if (questions.length === 0) {
      return {
        response: 'I apologize, but I couldn\'t generate questions for that subject and class combination. Please try a different subject or class level.',
        capability_used: 'question_generation',
        processing_time_ms: Date.now() - startTime,
      };
    }

    const response = `Here are ${questions.length} practice questions for **${mappedSubject.replace('_', ' ').toUpperCase()}** (Class ${grade}):

${questions.map((q, index) => `
**Q${index + 1}:** ${q.question_text}

A) ${q.options[0]}
B) ${q.options[1]}
C) ${q.options[2]}
D) ${q.options[3]}

*Answer: ${q.options[q.correct_answer]}*
`).join('\n')}

Need more questions or help with something else?`;

    return {
      response,
      capability_used: 'question_generation',
      confidence_score: 0.9,
      processing_time_ms: Date.now() - startTime,
      metadata: {
        subject: mappedSubject,
        class_level: grade,
        question_count: questions.length,
      },
    };
  } catch (error) {
    console.error('Error in question generation:', error);
    return {
      response: 'I apologize, but I encountered an error generating questions. Please try again with a different subject or class level.',
      capability_used: 'question_generation',
      processing_time_ms: Date.now() - startTime,
    };
  }
}

async function handleCollegeInfoRequest(message: string, user_profile: any, startTime: number): Promise<ChatResponse> {
  try {
    // Check if we can use Gemini API (within free tier limits)
    const { usageMonitor } = await import('@/lib/usage-monitor');
    
    if (!usageMonitor.canMakeRequest()) {
      console.log('Using fallback response to stay within free tier limits');
      return getFallbackCollegeResponse(message, startTime);
    }

    // Use Gemini API for college information
    const geminiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/ai/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: message,
        context: user_profile ? JSON.stringify(user_profile) : 'No user profile available',
        type: 'college_guidance'
      })
    });

    if (!geminiResponse.ok) {
      throw new Error('Gemini API request failed');
    }

    const geminiData = await geminiResponse.json();
    
    if (geminiData.error) {
      throw new Error(geminiData.error);
    }

    return {
      response: geminiData.response,
      capability_used: 'college_info',
      confidence_score: 0.95,
      processing_time_ms: Date.now() - startTime,
      metadata: {
        ai_model: 'gemini-1.5-flash',
        usage: geminiData.usage
      },
    };
  } catch (error) {
    console.error('Error in college info request:', error);
    return getFallbackCollegeResponse(message, startTime);
  }
}

function getFallbackCollegeResponse(message: string, startTime: number): ChatResponse {
  const lowerMessage = message.toLowerCase();
  
  // Provide specific fallback responses based on query
  if (lowerMessage.includes('jammu')) {
    return {
      response: `Great question about colleges in Jammu! 🏔️

**Top Colleges in Jammu & Kashmir:**
• **University of Jammu** - Comprehensive university with multiple streams
• **Government College of Engineering & Technology** - Engineering programs
• **Government Medical College** - Medical and healthcare programs
• **Amar Singh College** - Arts, Commerce, and Science programs
• **MAM College** - Various undergraduate programs

**Popular Streams Available:**
• Engineering (Computer, Civil, Mechanical, Electrical)
• Medical (MBBS, BDS, Nursing)
• Arts (History, Political Science, English, Economics)
• Commerce (B.Com, Business Administration)
• Science (Physics, Chemistry, Mathematics, Biology)

**Next Steps:**
• Check admission requirements and cut-offs
• Visit college websites for detailed information
• Consider your interests and career goals
• Look into scholarship opportunities

Need more specific information about any particular college or stream? 😊`,
      capability_used: 'college_info',
      processing_time_ms: Date.now() - startTime,
    };
  }
  
  return {
    response: `I'd be happy to help you find colleges! 🏫

To give you the best recommendations, could you tell me:
• What stream are you interested in? (Engineering, Medical, Arts, Commerce, Science)
• Which city or state are you looking in?
• What's your current class level?

I can help you find colleges, check admission requirements, and explore career options! 😊`,
    capability_used: 'college_info',
    processing_time_ms: Date.now() - startTime,
  };
}

async function handleGeneralChat(message: string, user_profile: any, startTime: number): Promise<ChatResponse> {
  const lowerMessage = message.toLowerCase();
  
  // Handle greetings with more variety
  const greetings = ['hello', 'hi', 'hey', 'hy', 'good morning', 'good afternoon', 'good evening', 'namaste', 'namaskar'];
  const isGreeting = greetings.some(greeting => lowerMessage.includes(greeting));

  if (isGreeting) {
    const responses = [
      `Hi there! 👋 I'm Sarthi, your friendly education counselor. I'm here to help you with course recommendations, practice questions, college information, and career guidance. What's on your mind today?`,
      `Hello! 😊 Great to meet you! I'm Sarthi, and I specialize in helping students like you make informed decisions about their education. How can I assist you today?`,
      `Hey! 🎓 I'm Sarthi, your education companion. Whether you need help choosing a stream, finding colleges, or preparing for exams, I'm here to guide you. What would you like to explore?`
    ];
    
    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      capability_used: 'general_chat',
      confidence_score: 0.95,
      processing_time_ms: Date.now() - startTime,
    };
  }

  // Handle help requests
  if (lowerMessage.includes('help') || lowerMessage.includes('what can you do') || lowerMessage.includes('capabilities')) {
    return {
      response: `I'm here to help you with your educational journey! Here's what I can do:

🎯 **Course & Career Guidance**
• Stream recommendations (Science, Commerce, Arts)
• Career path suggestions
• Subject selection advice

📚 **Academic Support**
• Practice questions for classes 10-12
• Subject-specific quizzes
• Exam preparation tips

🏫 **College Information**
• Find colleges by location
• Admission requirements
• Fee structures and scholarships

💡 **General Education Help**
• Study tips and strategies
• Time management advice
• Goal setting guidance

Just ask me anything - I'm here to help! 😊`,
      capability_used: 'general_chat',
      confidence_score: 0.9,
      processing_time_ms: Date.now() - startTime,
    };
  }

  // Handle location-based queries that might be college-related
  if (lowerMessage.includes('jammu') || lowerMessage.includes('kashmir') || lowerMessage.includes('srinagar')) {
    return {
      response: `I'd be happy to help you find colleges in Jammu & Kashmir! 🏔️

To give you the best recommendations, could you tell me:
• What stream are you interested in? (Engineering, Medical, Arts, Commerce, Science)
• Which city specifically? (Jammu, Srinagar, Leh, etc.)
• What's your current class level?

Or just ask me "colleges in Jammu for engineering" and I'll help you find the best options! 😊`,
      capability_used: 'general_chat',
      confidence_score: 0.8,
      processing_time_ms: Date.now() - startTime,
    };
  }

  // Handle unclear or short messages
  if (message.length < 3) {
    return {
      response: `I'm not sure I understood that. Could you please rephrase your question? 😊

I can help with:
• Course recommendations
• College information
• Practice questions
• Career guidance

What would you like to know?`,
      capability_used: 'general_chat',
      confidence_score: 0.6,
      processing_time_ms: Date.now() - startTime,
    };
  }

  // Try to use Gemini for general queries (only if within limits)
  try {
    const { usageMonitor } = await import('@/lib/usage-monitor');
    
    if (usageMonitor.canMakeRequest()) {
      const geminiResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/ai/gemini`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: message,
          context: user_profile ? JSON.stringify(user_profile) : 'No user profile available',
          type: 'general'
        })
      });

      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json();
        if (geminiData.response && !geminiData.error) {
          return {
            response: geminiData.response,
            capability_used: 'general_chat',
            confidence_score: 0.9,
            processing_time_ms: Date.now() - startTime,
            metadata: {
              ai_model: 'gemini-1.5-flash',
              usage: geminiData.usage
            },
          };
        }
      }
    } else {
      console.log('Using fallback response to stay within free tier limits');
    }
  } catch (error) {
    console.error('Gemini API error in general chat:', error);
  }

  // Fallback response with more helpful suggestions
  return {
    response: `I'm here to help with your education! 😊 

Here are some things you can ask me:
• "Recommend a stream for me"
• "Colleges in [your city] for engineering"
• "Practice questions for class 12 physics"
• "Career options in commerce"
• "Scholarships for medical students"

What would you like to explore today?`,
    capability_used: 'general_chat',
    confidence_score: 0.7,
    processing_time_ms: Date.now() - startTime,
  };
}
