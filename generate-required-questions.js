#!/usr/bin/env node

/**
 * Generate Required Subject-wise Questions
 * This script ensures each subject has at least 25 questions in the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Subject requirements per class
const REQUIRED_SUBJECTS = {
  10: ['science', 'mathematics', 'english', 'social_science'],
  11: ['physics', 'chemistry', 'mathematics', 'biology', 'english', 'economics', 'accountancy', 'business_studies'],
  12: ['physics', 'chemistry', 'mathematics', 'biology', 'english', 'economics', 'accountancy', 'business_studies']
};

// Comprehensive question bank for each subject
const questionBank = {
  mathematics: {
    10: [
      // Real Numbers
      { question_text: "Which of the following is an irrational number?", category: "mathematics", subcategory: "real_numbers", options: ["√16", "√25", "√7", "√36"], correct_answer: 2, difficulty_level: 1, time_limit: 60, scoring_weight: 1.0 },
      { question_text: "Express 0.overline{3} as a fraction", category: "mathematics", subcategory: "real_numbers", options: ["1/3", "3/10", "1/9", "3/9"], correct_answer: 0, difficulty_level: 2, time_limit: 90, scoring_weight: 2.0 },
      { question_text: "The decimal expansion of 22/7 is:", category: "mathematics", subcategory: "real_numbers", options: ["Terminating", "Non-terminating repeating", "Non-terminating non-repeating", "None"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 1.5 },
      { question_text: "Every rational number is:", category: "mathematics", subcategory: "real_numbers", options: ["A natural number", "A whole number", "A real number", "An integer"], correct_answer: 2, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
      { question_text: "If √2 = 1.414, then √8 equals:", category: "mathematics", subcategory: "real_numbers", options: ["2.828", "5.656", "4.242", "1.414"], correct_answer: 0, difficulty_level: 3, time_limit: 120, scoring_weight: 3.0 },
      
      // Polynomials
      { question_text: "The degree of polynomial 3x² + 2x + 1 is:", category: "mathematics", subcategory: "polynomials", options: ["1", "2", "3", "0"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
      { question_text: "If p(x) = x² - 3x + 2, then p(2) equals:", category: "mathematics", subcategory: "polynomials", options: ["0", "2", "4", "-2"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
      { question_text: "The zeros of polynomial x² - 5x + 6 are:", category: "mathematics", subcategory: "polynomials", options: ["2, 3", "1, 6", "-2, -3", "5, 6"], correct_answer: 0, difficulty_level: 2, time_limit: 90, scoring_weight: 2.0 },
      { question_text: "Which of the following is a quadratic polynomial?", category: "mathematics", subcategory: "polynomials", options: ["x + 1", "x² + 1", "x³ + 1", "√x + 1"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
      { question_text: "The coefficient of x² in 3x² - 2x + 5 is:", category: "mathematics", subcategory: "polynomials", options: ["3", "-2", "5", "1"], correct_answer: 0, difficulty_level: 1, time_limit: 30, scoring_weight: 1.0 },
      
      // Linear Equations
      { question_text: "Solve: 2x + 5 = 13", category: "mathematics", subcategory: "linear_equations", options: ["x = 4", "x = 3", "x = 5", "x = 6"], correct_answer: 0, difficulty_level: 1, time_limit: 60, scoring_weight: 1.0 },
      { question_text: "The solution of 3x + 2y = 12 and x - y = 1 is:", category: "mathematics", subcategory: "linear_equations", options: ["x=2, y=3", "x=3, y=2", "x=4, y=0", "x=1, y=4"], correct_answer: 0, difficulty_level: 3, time_limit: 120, scoring_weight: 3.0 },
      { question_text: "If 5x - 3 = 2x + 9, then x equals:", category: "mathematics", subcategory: "linear_equations", options: ["4", "3", "6", "2"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
      { question_text: "The graph of a linear equation in two variables is:", category: "mathematics", subcategory: "linear_equations", options: ["A point", "A straight line", "A curve", "A circle"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
      { question_text: "Solve: 3(x + 2) = 2(x + 5)", category: "mathematics", subcategory: "linear_equations", options: ["x = 4", "x = 2", "x = 6", "x = 8"], correct_answer: 0, difficulty_level: 2, time_limit: 90, scoring_weight: 2.0 },
      
      // Quadratic Equations
      { question_text: "The discriminant of x² - 4x + 4 is:", category: "mathematics", subcategory: "quadratic_equations", options: ["0", "4", "16", "-4"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
      { question_text: "The roots of x² - 7x + 12 = 0 are:", category: "mathematics", subcategory: "quadratic_equations", options: ["3, 4", "2, 6", "1, 12", "-3, -4"], correct_answer: 0, difficulty_level: 2, time_limit: 90, scoring_weight: 2.0 },
      { question_text: "If the discriminant of ax² + bx + c = 0 is zero, then roots are:", category: "mathematics", subcategory: "quadratic_equations", options: ["Real and distinct", "Real and equal", "Complex", "Irrational"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
      { question_text: "The quadratic formula is:", category: "mathematics", subcategory: "quadratic_equations", options: ["x = (-b ± √(b²-4ac))/2a", "x = (b ± √(b²-4ac))/2a", "x = (-b ± √(b²+4ac))/2a", "x = (-b ± √(4ac-b²))/2a"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
      { question_text: "The sum of roots of x² - 5x + 6 = 0 is:", category: "mathematics", subcategory: "quadratic_equations", options: ["5", "-5", "6", "-6"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
      
      // Arithmetic Progressions
      { question_text: "In an AP, if a = 2 and d = 3, then the 5th term is:", category: "mathematics", subcategory: "arithmetic_progressions", options: ["14", "17", "11", "20"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
      { question_text: "The sum of first n natural numbers is:", category: "mathematics", subcategory: "arithmetic_progressions", options: ["n(n+1)/2", "n(n-1)/2", "n²", "2n"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
      { question_text: "If the first term of an AP is 5 and common difference is 3, the 10th term is:", category: "mathematics", subcategory: "arithmetic_progressions", options: ["32", "35", "29", "38"], correct_answer: 0, difficulty_level: 2, time_limit: 90, scoring_weight: 2.0 },
      { question_text: "The common difference of AP: 2, 5, 8, 11, ... is:", category: "mathematics", subcategory: "arithmetic_progressions", options: ["3", "2", "5", "1"], correct_answer: 0, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
      { question_text: "In an AP, if a₁ = 10 and a₅ = 26, then d is:", category: "mathematics", subcategory: "arithmetic_progressions", options: ["4", "3", "5", "6"], correct_answer: 0, difficulty_level: 3, time_limit: 120, scoring_weight: 3.0 },
      
      // Coordinate Geometry
      { question_text: "The distance between points (0,0) and (3,4) is:", category: "mathematics", subcategory: "coordinate_geometry", options: ["5", "7", "12", "25"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
      { question_text: "The midpoint of (2,4) and (6,8) is:", category: "mathematics", subcategory: "coordinate_geometry", options: ["(4,6)", "(8,12)", "(2,2)", "(3,5)"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
      { question_text: "The slope of line passing through (1,2) and (3,6) is:", category: "mathematics", subcategory: "coordinate_geometry", options: ["2", "1", "3", "4"], correct_answer: 0, difficulty_level: 2, time_limit: 90, scoring_weight: 2.0 }
    ],
    11: [
      // Trigonometry
      { question_text: "What is the value of sin²θ + cos²θ?", category: "mathematics", subcategory: "trigonometry", options: ["0", "1", "2", "θ"], correct_answer: 1, difficulty_level: 1, time_limit: 60, scoring_weight: 1.0 },
      { question_text: "sin(90° - θ) equals:", category: "mathematics", subcategory: "trigonometry", options: ["sin θ", "cos θ", "tan θ", "cot θ"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
      { question_text: "The value of tan 45° is:", category: "mathematics", subcategory: "trigonometry", options: ["0", "1", "√3", "1/√3"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
      { question_text: "If sin θ = 3/5, then cos θ equals:", category: "mathematics", subcategory: "trigonometry", options: ["4/5", "3/4", "5/4", "5/3"], correct_answer: 0, difficulty_level: 2, time_limit: 90, scoring_weight: 2.0 },
      { question_text: "The period of sin x is:", category: "mathematics", subcategory: "trigonometry", options: ["π", "2π", "π/2", "4π"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 }
    ],
    12: [
      // Calculus
      { question_text: "Find the derivative of f(x) = x³ - 2x² + 5x - 1", category: "mathematics", subcategory: "calculus", options: ["3x² - 4x + 5", "3x² - 2x + 5", "x² - 4x + 5", "3x² - 4x + 1"], correct_answer: 0, difficulty_level: 3, time_limit: 120, scoring_weight: 3.0 },
      { question_text: "∫2x dx equals:", category: "mathematics", subcategory: "calculus", options: ["x² + C", "2x² + C", "x²/2 + C", "2x + C"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
      { question_text: "The derivative of sin x is:", category: "mathematics", subcategory: "calculus", options: ["cos x", "-cos x", "sin x", "-sin x"], correct_answer: 0, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
      { question_text: "∫(3x² + 2x + 1) dx equals:", category: "mathematics", subcategory: "calculus", options: ["x³ + x² + x + C", "3x³ + 2x² + x + C", "6x + 2 + C", "x³ + x² + C"], correct_answer: 0, difficulty_level: 2, time_limit: 90, scoring_weight: 2.0 },
      { question_text: "The second derivative of x⁴ is:", category: "mathematics", subcategory: "calculus", options: ["12x²", "4x³", "x³", "24x"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 }
    ]
  },
  
  science: {
    10: [
      // Light
      { question_text: "The law of reflection states that:", category: "science", subcategory: "light", options: ["Angle of incidence = Angle of reflection", "Angle of incidence = 2 × Angle of reflection", "Angle of reflection = 2 × Angle of incidence", "Both angles are always 45°"], correct_answer: 0, difficulty_level: 1, time_limit: 60, scoring_weight: 1.0 },
      { question_text: "A concave mirror has focal length 20 cm. Its radius of curvature is:", category: "science", subcategory: "light", options: ["10 cm", "20 cm", "40 cm", "80 cm"], correct_answer: 2, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
      { question_text: "Which type of mirror is used in vehicle headlights?", category: "science", subcategory: "light", options: ["Plane mirror", "Concave mirror", "Convex mirror", "Cylindrical mirror"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
      { question_text: "The refractive index of water is approximately:", category: "science", subcategory: "light", options: ["1.0", "1.33", "1.5", "2.0"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
      { question_text: "Total internal reflection occurs when light travels from:", category: "science", subcategory: "light", options: ["Denser to rarer medium", "Rarer to denser medium", "Same medium", "Vacuum to air"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
      { question_text: "The speed of light in vacuum is:", category: "science", subcategory: "light", options: ["3 × 10⁸ m/s", "3 × 10⁶ m/s", "3 × 10¹⁰ m/s", "3 × 10⁴ m/s"], correct_answer: 0, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
      { question_text: "A convex lens is also called:", category: "science", subcategory: "light", options: ["Diverging lens", "Converging lens", "Plane lens", "Cylindrical lens"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
      { question_text: "The phenomenon of bending of light is called:", category: "science", subcategory: "light", options: ["Reflection", "Refraction", "Diffraction", "Interference"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
      { question_text: "Which color has the longest wavelength in visible light?", category: "science", subcategory: "light", options: ["Red", "Blue", "Green", "Violet"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
      
      // Electricity
      { question_text: "Ohm's law states that V = IR. Here R represents:", category: "science", subcategory: "electricity", options: ["Current", "Voltage", "Resistance", "Power"], correct_answer: 2, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
      { question_text: "The SI unit of electric current is:", category: "science", subcategory: "electricity", options: ["Volt", "Ampere", "Ohm", "Watt"], correct_answer: 1, difficulty_level: 1, time_limit: 30, scoring_weight: 1.0 },
      { question_text: "A current of 2A flows through a resistor of 5Ω. The voltage is:", category: "science", subcategory: "electricity", options: ["2.5V", "7V", "10V", "3V"], correct_answer: 2, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
      { question_text: "Electric power is measured in:", category: "science", subcategory: "electricity", options: ["Joule", "Watt", "Ampere", "Volt"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
      { question_text: "In a series circuit, the current is:", category: "science", subcategory: "electricity", options: ["Same everywhere", "Different everywhere", "Zero", "Maximum at ends"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
      { question_text: "The heating effect of current is used in:", category: "science", subcategory: "electricity", options: ["Electric bulb", "Electric heater", "Electric iron", "All of these"], correct_answer: 3, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
      { question_text: "A fuse wire is made of:", category: "science", subcategory: "electricity", options: ["Copper", "Aluminum", "Lead-tin alloy", "Iron"], correct_answer: 2, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
      { question_text: "The direction of conventional current is:", category: "science", subcategory: "electricity", options: ["Positive to negative", "Negative to positive", "Both directions", "No specific direction"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
      
      // Acids and Bases
      { question_text: "The pH of pure water at 25°C is:", category: "science", subcategory: "acids_bases", options: ["0", "7", "14", "1"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
      { question_text: "Which of the following is a strong acid?", category: "science", subcategory: "acids_bases", options: ["Acetic acid", "Citric acid", "Hydrochloric acid", "Carbonic acid"], correct_answer: 2, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
      { question_text: "The chemical formula of baking soda is:", category: "science", subcategory: "acids_bases", options: ["NaOH", "NaHCO₃", "Na₂CO₃", "NaCl"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
      { question_text: "Acids turn blue litmus paper:", category: "science", subcategory: "acids_bases", options: ["Blue", "Red", "Green", "Yellow"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
      { question_text: "The process of neutralization produces:", category: "science", subcategory: "acids_bases", options: ["Salt and water", "Only salt", "Only water", "Gas"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
      { question_text: "Which gas is evolved when acid reacts with metal?", category: "science", subcategory: "acids_bases", options: ["Oxygen", "Hydrogen", "Carbon dioxide", "Nitrogen"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
      { question_text: "The pH scale ranges from:", category: "science", subcategory: "acids_bases", options: ["0 to 7", "7 to 14", "0 to 14", "1 to 10"], correct_answer: 2, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
      { question_text: "Antacids are:", category: "science", subcategory: "acids_bases", options: ["Acidic", "Basic", "Neutral", "Amphoteric"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
      
      // Life Processes
      { question_text: "Which organ pumps blood in the human body?", category: "science", subcategory: "life_processes", options: ["Lungs", "Heart", "Liver", "Kidney"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
      { question_text: "The process by which plants make food is called:", category: "science", subcategory: "life_processes", options: ["Respiration", "Photosynthesis", "Transpiration", "Digestion"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
      { question_text: "Which gas is released during photosynthesis?", category: "science", subcategory: "life_processes", options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 }
    ]
  }
};

async function generateRequiredQuestions() {
  console.log('🚀 Generating Required Questions (25+ per subject)...\n');
  
  try {
    let totalGenerated = 0;
    
    for (const [grade, subjects] of Object.entries(REQUIRED_SUBJECTS)) {
      console.log(`📚 Processing Class ${grade}...`);
      
      for (const subject of subjects) {
        console.log(`  📖 Checking ${subject} questions...`);
        
        // Check current count
        const { data: existing, error: countError } = await supabase
          .from('quiz_questions')
          .select('*', { count: 'exact', head: true })
          .eq('category', subject)
          .eq('question_type', 'academic');
        
        const currentCount = existing?.length || 0;
        console.log(`    Current count: ${currentCount}`);
        
        if (currentCount >= 25) {
          console.log(`    ✅ ${subject} already has sufficient questions (${currentCount})`);
          continue;
        }
        
        const needed = 25 - currentCount;
        console.log(`    📝 Need ${needed} more questions for ${subject}`);
        
        // Get questions from our bank
        const gradeQuestions = questionBank[subject]?.[grade] || [];
        if (gradeQuestions.length === 0) {
          console.log(`    ⚠️  No question bank available for ${subject} grade ${grade}`);
          continue;
        }
        
        // Take the needed number of questions
        const questionsToAdd = gradeQuestions.slice(0, needed).map(q => ({
          ...q,
          question_type: 'academic',
          is_active: true
        }));
        
        if (questionsToAdd.length > 0) {
          const { data, error } = await supabase
            .from('quiz_questions')
            .insert(questionsToAdd)
            .select();
          
          if (error) {
            console.log(`    ❌ Error inserting questions: ${error.message}`);
          } else {
            console.log(`    ✅ Added ${data?.length || 0} questions for ${subject}`);
            totalGenerated += data?.length || 0;
          }
        }
      }
    }
    
    console.log(`\n🎉 Generation complete! Total new questions: ${totalGenerated}`);
    await verifyRequiredQuestions();
    
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
  }
}

async function verifyRequiredQuestions() {
  console.log('\n🔍 Verifying Question Requirements...');
  
  for (const [grade, subjects] of Object.entries(REQUIRED_SUBJECTS)) {
    console.log(`\n📊 Class ${grade} Verification:`);
    
    for (const subject of subjects) {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*', { count: 'exact', head: true })
        .eq('category', subject)
        .eq('question_type', 'academic');
      
      if (error) {
        console.log(`   ❌ ${subject}: Error - ${error.message}`);
      } else {
        const count = data?.length || 0;
        const status = count >= 25 ? '✅' : count > 0 ? '⚠️' : '❌';
        const statusText = count >= 25 ? 'REQUIREMENT MET' : 'BELOW REQUIREMENT';
        console.log(`   ${status} ${subject}: ${count} questions (${statusText})`);
      }
    }
  }
  
  // Overall summary
  const { data: totalQuestions } = await supabase
    .from('quiz_questions')
    .select('*', { count: 'exact', head: true })
    .eq('question_type', 'academic');
  
  console.log(`\n📈 Total Academic Questions: ${totalQuestions?.length || 0}`);
}

generateRequiredQuestions();