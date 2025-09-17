/**
 * Script to populate quiz questions in the database
 * This script adds comprehensive aptitude and interest assessment questions
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const quizQuestions = [
  // Mathematics Questions
  {
    question_text: "If a train travels 300 km in 4 hours, what is its average speed?",
    question_type: "aptitude",
    category: "mathematics",
    options: ["75 km/h", "80 km/h", "85 km/h", "90 km/h"],
    correct_answer: 0,
    difficulty_level: 1,
    time_limit: 60
  },
  {
    question_text: "What is the value of x in the equation: 2x + 5 = 15?",
    question_type: "aptitude",
    category: "mathematics",
    options: ["3", "4", "5", "6"],
    correct_answer: 2,
    difficulty_level: 1,
    time_limit: 45
  },
  {
    question_text: "If the area of a circle is 154 cm², what is its radius? (π = 22/7)",
    question_type: "aptitude",
    category: "mathematics",
    options: ["7 cm", "8 cm", "9 cm", "10 cm"],
    correct_answer: 0,
    difficulty_level: 2,
    time_limit: 90
  },
  {
    question_text: "What is the next number in the sequence: 2, 6, 12, 20, 30, ?",
    question_type: "aptitude",
    category: "mathematics",
    options: ["40", "42", "44", "46"],
    correct_answer: 1,
    difficulty_level: 2,
    time_limit: 75
  },

  // Science Questions
  {
    question_text: "What is the chemical symbol for Gold?",
    question_type: "aptitude",
    category: "science",
    options: ["Go", "Gd", "Au", "Ag"],
    correct_answer: 2,
    difficulty_level: 1,
    time_limit: 30
  },
  {
    question_text: "Which planet is known as the 'Red Planet'?",
    question_type: "aptitude",
    category: "science",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correct_answer: 1,
    difficulty_level: 1,
    time_limit: 30
  },
  {
    question_text: "What is the unit of electric current?",
    question_type: "aptitude",
    category: "science",
    options: ["Volt", "Ampere", "Watt", "Ohm"],
    correct_answer: 1,
    difficulty_level: 1,
    time_limit: 30
  },
  {
    question_text: "Which gas makes up most of Earth's atmosphere?",
    question_type: "aptitude",
    category: "science",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    correct_answer: 2,
    difficulty_level: 1,
    time_limit: 30
  },

  // Interest Assessment Questions
  {
    question_text: "I enjoy solving complex problems and puzzles",
    question_type: "interest",
    category: "problem_solving",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
    correct_answer: null,
    difficulty_level: 1,
    time_limit: 45
  },
  {
    question_text: "I like working with numbers and calculations",
    question_type: "interest",
    category: "mathematics",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
    correct_answer: null,
    difficulty_level: 1,
    time_limit: 45
  },
  {
    question_text: "I enjoy reading books and literature",
    question_type: "interest",
    category: "arts",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
    correct_answer: null,
    difficulty_level: 1,
    time_limit: 45
  },
  {
    question_text: "I am interested in understanding how things work",
    question_type: "interest",
    category: "science",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
    correct_answer: null,
    difficulty_level: 1,
    time_limit: 45
  },
  {
    question_text: "I enjoy working with computers and technology",
    question_type: "interest",
    category: "technology",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
    correct_answer: null,
    difficulty_level: 1,
    time_limit: 45
  },
  {
    question_text: "I like helping others and working in teams",
    question_type: "interest",
    category: "social",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
    correct_answer: null,
    difficulty_level: 1,
    time_limit: 45
  },
  {
    question_text: "I am interested in business and finance",
    question_type: "interest",
    category: "commerce",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
    correct_answer: null,
    difficulty_level: 1,
    time_limit: 45
  },
  {
    question_text: "I enjoy creative activities like drawing, music, or writing",
    question_type: "interest",
    category: "creativity",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
    correct_answer: null,
    difficulty_level: 1,
    time_limit: 45
  },

  // Personality Questions
  {
    question_text: "I prefer working independently rather than in groups",
    question_type: "personality",
    category: "work_style",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
    correct_answer: null,
    difficulty_level: 1,
    time_limit: 45
  },
  {
    question_text: "I like to take leadership roles in group activities",
    question_type: "personality",
    category: "leadership",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
    correct_answer: null,
    difficulty_level: 1,
    time_limit: 45
  },
  {
    question_text: "I am comfortable speaking in front of large groups",
    question_type: "personality",
    category: "communication",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
    correct_answer: null,
    difficulty_level: 1,
    time_limit: 45
  },
  {
    question_text: "I prefer detailed, step-by-step instructions",
    question_type: "personality",
    category: "learning_style",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
    correct_answer: null,
    difficulty_level: 1,
    time_limit: 45
  },

  // Career Interest Questions
  {
    question_text: "I would like to work in a hospital or medical setting",
    question_type: "interest",
    category: "medical",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
    correct_answer: null,
    difficulty_level: 1,
    time_limit: 45
  },
  {
    question_text: "I am interested in designing and building things",
    question_type: "interest",
    category: "engineering",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
    correct_answer: null,
    difficulty_level: 1,
    time_limit: 45
  },
  {
    question_text: "I would enjoy teaching others",
    question_type: "interest",
    category: "education",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
    correct_answer: null,
    difficulty_level: 1,
    time_limit: 45
  },
  {
    question_text: "I am interested in law and justice",
    question_type: "interest",
    category: "law",
    options: ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"],
    correct_answer: null,
    difficulty_level: 1,
    time_limit: 45
  }
];

async function populateQuizQuestions() {
  try {
    console.log('Starting to populate quiz questions...');
    
    // Clear existing questions (optional - remove this if you want to keep existing data)
    console.log('Clearing existing quiz questions...');
    const { error: deleteError } = await supabase
      .from('quiz_questions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    
    if (deleteError) {
      console.error('Error clearing existing questions:', deleteError);
    } else {
      console.log('Existing questions cleared successfully');
    }
    
    // Insert new questions
    console.log('Inserting new quiz questions...');
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert(quizQuestions)
      .select();
    
    if (error) {
      console.error('Error inserting quiz questions:', error);
      return;
    }
    
    console.log(`Successfully inserted ${data.length} quiz questions!`);
    console.log('Quiz questions populated successfully!');
    
    // Display summary
    const questionTypes = {};
    const categories = {};
    
    data.forEach(q => {
      questionTypes[q.question_type] = (questionTypes[q.question_type] || 0) + 1;
      categories[q.category] = (categories[q.category] || 0) + 1;
    });
    
    console.log('\nSummary:');
    console.log('Question Types:', questionTypes);
    console.log('Categories:', categories);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
populateQuizQuestions();
