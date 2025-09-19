#!/usr/bin/env node

/**
 * Generate Subject-wise Questions for Academic Assessment System
 * This script generates comprehensive questions for classes 10, 11, and 12
 * across all required subjects and inserts them into the database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Subject configuration for each class
const SUBJECTS_CONFIG = {
  10: ['science', 'mathematics', 'english', 'social_science'],
  11: ['physics', 'chemistry', 'mathematics', 'biology', 'english', 'economics', 'accountancy', 'business_studies'],
  12: ['physics', 'chemistry', 'mathematics', 'biology', 'english', 'economics', 'accountancy', 'business_studies']
};

// Question generation functions for each subject
const questionGenerators = {
  mathematics: generateMathQuestions,
  science: generateScienceQuestions,
  physics: generatePhysicsQuestions,
  chemistry: generateChemistryQuestions,
  biology: generateBiologyQuestions,
  english: generateEnglishQuestions,
  social_science: generateSocialScienceQuestions,
  economics: generateEconomicsQuestions,
  accountancy: generateAccountancyQuestions,
  business_studies: generateBusinessStudiesQuestions
};

async function generateAllQuestions() {
  console.log('🚀 Starting Subject-wise Question Generation...\n');
  
  try {
    let totalGenerated = 0;
    
    for (const [grade, subjects] of Object.entries(SUBJECTS_CONFIG)) {
      console.log(`📚 Processing Class ${grade}...`);
      
      for (const subject of subjects) {
        console.log(`  📖 Generating ${subject} questions...`);
        
        const generator = questionGenerators[subject];
        if (!generator) {
          console.log(`    ⚠️  No generator found for ${subject}, skipping...`);
          continue;
        }
        
        const questions = generator(parseInt(grade));
        
        if (questions.length > 0) {
          const { data, error } = await supabase
            .from('questions')
            .insert(questions)
            .select();
          
          if (error) {
            console.log(`    ❌ Error inserting ${subject} questions: ${error.message}`);
          } else {
            console.log(`    ✅ Inserted ${questions.length} ${subject} questions`);
            totalGenerated += questions.length;
          }
        }
      }
    }
    
    console.log(`\n🎉 Generation complete! Total questions: ${totalGenerated}`);
    await verifyQuestions();
    
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
  }
}//
 Mathematics question generator
function generateMathQuestions(grade) {
  const questions = [];
  const baseId = `math_${grade}_`;
  
  if (grade === 10) {
    questions.push(
      {
        grade,
        subject: 'mathematics',
        topic: 'Real Numbers',
        question_type: 'mcq_single',
        difficulty: 'easy',
        text: 'Which of the following is an irrational number?',
        options: ['√16', '√25', '√7', '√36'],
        correct_answer: '√7',
        explanation: '√7 cannot be expressed as a ratio of two integers, making it irrational.',
        time_seconds: 60,
        marks: 1,
        tags: ['real_numbers', 'irrational'],
        competency_codes: ['MATH_10_REAL_NUMBERS'],
        is_active: true,
        pending_review: false
      },
      {
        grade,
        subject: 'mathematics',
        topic: 'Polynomials',
        question_type: 'mcq_single',
        difficulty: 'medium',
        text: 'If p(x) = x² - 3x + 2, then p(2) equals:',
        options: ['0', '2', '4', '-2'],
        correct_answer: '0',
        explanation: 'p(2) = 2² - 3(2) + 2 = 4 - 6 + 2 = 0',
        time_seconds: 90,
        marks: 2,
        tags: ['polynomials', 'substitution'],
        competency_codes: ['MATH_10_POLYNOMIALS'],
        is_active: true,
        pending_review: false
      },
      {
        grade,
        subject: 'mathematics',
        topic: 'Linear Equations',
        question_type: 'mcq_single',
        difficulty: 'easy',
        text: 'Solve for x: 2x + 5 = 13',
        options: ['x = 4', 'x = 3', 'x = 5', 'x = 6'],
        correct_answer: 'x = 4',
        explanation: '2x + 5 = 13 → 2x = 8 → x = 4',
        time_seconds: 60,
        marks: 1,
        tags: ['linear_equations', 'algebra'],
        competency_codes: ['MATH_10_LINEAR'],
        is_active: true,
        pending_review: false
      }
    );
  }
  
  if (grade === 11) {
    questions.push(
      {
        grade,
        subject: 'mathematics',
        topic: 'Trigonometry',
        question_type: 'mcq_single',
        difficulty: 'medium',
        text: 'What is the value of sin²θ + cos²θ?',
        options: ['0', '1', '2', 'θ'],
        correct_answer: '1',
        explanation: 'This is the fundamental trigonometric identity: sin²θ + cos²θ = 1',
        time_seconds: 60,
        marks: 1,
        tags: ['trigonometry', 'identities'],
        competency_codes: ['MATH_11_TRIG'],
        is_active: true,
        pending_review: false
      },
      {
        grade,
        subject: 'mathematics',
        topic: 'Sequences and Series',
        question_type: 'mcq_single',
        difficulty: 'medium',
        text: 'Find the 10th term of the arithmetic sequence: 2, 5, 8, 11, ...',
        options: ['29', '32', '35', '38'],
        correct_answer: '29',
        explanation: 'a₁ = 2, d = 3, so a₁₀ = 2 + (10-1)×3 = 2 + 27 = 29',
        time_seconds: 90,
        marks: 2,
        tags: ['sequences', 'arithmetic_progression'],
        competency_codes: ['MATH_11_SEQUENCES'],
        is_active: true,
        pending_review: false
      }
    );
  }
  
  if (grade === 12) {
    questions.push(
      {
        grade,
        subject: 'mathematics',
        topic: 'Calculus',
        question_type: 'mcq_single',
        difficulty: 'hard',
        text: 'Find the derivative of f(x) = x³ - 2x² + 5x - 1',
        options: ['3x² - 4x + 5', '3x² - 2x + 5', 'x² - 4x + 5', '3x² - 4x + 1'],
        correct_answer: '3x² - 4x + 5',
        explanation: 'f\'(x) = 3x² - 2(2x) + 5 = 3x² - 4x + 5',
        time_seconds: 120,
        marks: 3,
        tags: ['calculus', 'derivatives'],
        competency_codes: ['MATH_12_CALCULUS'],
        is_active: true,
        pending_review: false
      }
    );
  }
  
  return questions;
}

// Science question generator (for class 10)
function generateScienceQuestions(grade) {
  if (grade !== 10) return [];
  
  return [
    {
      grade,
      subject: 'science',
      topic: 'Light',
      question_type: 'mcq_single',
      difficulty: 'easy',
      text: 'Which of the following is the correct statement about the law of reflection?',
      options: [
        'Angle of incidence = Angle of reflection',
        'Angle of incidence = 2 × Angle of reflection',
        'Angle of reflection = 2 × Angle of incidence',
        'Both angles are always 45°'
      ],
      correct_answer: 'Angle of incidence = Angle of reflection',
      explanation: 'The law of reflection states that the angle of incidence equals the angle of reflection.',
      time_seconds: 60,
      marks: 1,
      tags: ['light', 'reflection', 'physics'],
      competency_codes: ['SCI_10_LIGHT'],
      is_active: true,
      pending_review: false
    },
    {
      grade,
      subject: 'science',
      topic: 'Acids and Bases',
      question_type: 'mcq_single',
      difficulty: 'medium',
      text: 'What is the pH of a neutral solution at 25°C?',
      options: ['0', '7', '14', '1'],
      correct_answer: '7',
      explanation: 'A neutral solution has equal concentrations of H⁺ and OH⁻ ions, giving pH = 7.',
      time_seconds: 60,
      marks: 1,
      tags: ['acids_bases', 'ph', 'chemistry'],
      competency_codes: ['SCI_10_ACIDS_BASES'],
      is_active: true,
      pending_review: false
    },
    {
      grade,
      subject: 'science',
      topic: 'Life Processes',
      question_type: 'mcq_single',
      difficulty: 'easy',
      text: 'Which organ is responsible for pumping blood in the human body?',
      options: ['Lungs', 'Heart', 'Liver', 'Kidney'],
      correct_answer: 'Heart',
      explanation: 'The heart is a muscular organ that pumps blood throughout the body.',
      time_seconds: 45,
      marks: 1,
      tags: ['life_processes', 'circulation', 'biology'],
      competency_codes: ['SCI_10_LIFE_PROCESSES'],
      is_active: true,
      pending_review: false
    }
  ];
}

// Physics question generator (for classes 11 and 12)
function generatePhysicsQuestions(grade) {
  if (grade === 10) return [];
  
  const questions = [];
  
  if (grade === 11) {
    questions.push(
      {
        grade,
        subject: 'physics',
        topic: 'Motion in a Straight Line',
        question_type: 'mcq_single',
        difficulty: 'medium',
        text: 'A car accelerates from rest at 2 m/s². What is its velocity after 5 seconds?',
        options: ['5 m/s', '10 m/s', '15 m/s', '20 m/s'],
        correct_answer: '10 m/s',
        explanation: 'Using v = u + at, where u = 0, a = 2 m/s², t = 5s: v = 0 + 2×5 = 10 m/s',
        time_seconds: 90,
        marks: 2,
        tags: ['kinematics', 'acceleration'],
        competency_codes: ['PHY_11_MOTION'],
        is_active: true,
        pending_review: false
      },
      {
        grade,
        subject: 'physics',
        topic: 'Laws of Motion',
        question_type: 'mcq_single',
        difficulty: 'easy',
        text: 'Newton\'s first law is also known as:',
        options: ['Law of Inertia', 'Law of Acceleration', 'Law of Action-Reaction', 'Law of Gravitation'],
        correct_answer: 'Law of Inertia',
        explanation: 'Newton\'s first law states that objects at rest stay at rest and objects in motion stay in motion unless acted upon by an external force.',
        time_seconds: 60,
        marks: 1,
        tags: ['laws_of_motion', 'inertia'],
        competency_codes: ['PHY_11_LAWS_MOTION'],
        is_active: true,
        pending_review: false
      }
    );
  }
  
  if (grade === 12) {
    questions.push(
      {
        grade,
        subject: 'physics',
        topic: 'Electric Charges and Fields',
        question_type: 'mcq_single',
        difficulty: 'hard',
        text: 'Two point charges of +2μC and -3μC are placed 10cm apart. What is the force between them? (k = 9×10⁹ N⋅m²/C²)',
        options: ['5.4 N', '54 N', '0.54 N', '540 N'],
        correct_answer: '5.4 N',
        explanation: 'F = k|q₁q₂|/r² = 9×10⁹ × 2×10⁻⁶ × 3×10⁻⁶ / (0.1)² = 5.4 N',
        time_seconds: 150,
        marks: 3,
        tags: ['electrostatics', 'coulombs_law'],
        competency_codes: ['PHY_12_ELECTROSTATICS'],
        is_active: true,
        pending_review: false
      }
    );
  }
  
  return questions;
}// Chemist
ry question generator
function generateChemistryQuestions(grade) {
  if (grade === 10) return [];
  
  const questions = [];
  
  if (grade === 11) {
    questions.push(
      {
        grade,
        subject: 'chemistry',
        topic: 'Structure of Atom',
        question_type: 'mcq_single',
        difficulty: 'medium',
        text: 'What is the maximum number of electrons in the M shell?',
        options: ['2', '8', '18', '32'],
        correct_answer: '18',
        explanation: 'The M shell (n=3) can hold a maximum of 2n² = 2×3² = 18 electrons.',
        time_seconds: 60,
        marks: 1,
        tags: ['atomic_structure', 'electron_configuration'],
        competency_codes: ['CHEM_11_ATOMIC_STRUCTURE'],
        is_active: true,
        pending_review: false
      },
      {
        grade,
        subject: 'chemistry',
        topic: 'Chemical Bonding',
        question_type: 'mcq_single',
        difficulty: 'medium',
        text: 'Which type of bond is formed between sodium and chlorine in NaCl?',
        options: ['Covalent bond', 'Ionic bond', 'Metallic bond', 'Hydrogen bond'],
        correct_answer: 'Ionic bond',
        explanation: 'Sodium loses an electron to chlorine, forming Na⁺ and Cl⁻ ions held together by electrostatic forces.',
        time_seconds: 60,
        marks: 1,
        tags: ['chemical_bonding', 'ionic_compounds'],
        competency_codes: ['CHEM_11_BONDING'],
        is_active: true,
        pending_review: false
      }
    );
  }
  
  if (grade === 12) {
    questions.push(
      {
        grade,
        subject: 'chemistry',
        topic: 'Chemical Kinetics',
        question_type: 'mcq_single',
        difficulty: 'hard',
        text: 'For a first-order reaction, the half-life is:',
        options: ['Proportional to initial concentration', 'Independent of initial concentration', 'Inversely proportional to initial concentration', 'Proportional to square of initial concentration'],
        correct_answer: 'Independent of initial concentration',
        explanation: 'For first-order reactions, t₁/₂ = 0.693/k, which is independent of initial concentration.',
        time_seconds: 90,
        marks: 2,
        tags: ['chemical_kinetics', 'reaction_rates'],
        competency_codes: ['CHEM_12_KINETICS'],
        is_active: true,
        pending_review: false
      }
    );
  }
  
  return questions;
}

// Biology question generator
function generateBiologyQuestions(grade) {
  if (grade === 10) return [];
  
  const questions = [];
  
  if (grade === 11) {
    questions.push(
      {
        grade,
        subject: 'biology',
        topic: 'Cell Structure and Function',
        question_type: 'mcq_single',
        difficulty: 'easy',
        text: 'Which organelle is known as the powerhouse of the cell?',
        options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Endoplasmic Reticulum'],
        correct_answer: 'Mitochondria',
        explanation: 'Mitochondria produce ATP through cellular respiration, providing energy for cellular processes.',
        time_seconds: 45,
        marks: 1,
        tags: ['cell_biology', 'organelles'],
        competency_codes: ['BIO_11_CELL_STRUCTURE'],
        is_active: true,
        pending_review: false
      },
      {
        grade,
        subject: 'biology',
        topic: 'Photosynthesis',
        question_type: 'mcq_single',
        difficulty: 'medium',
        text: 'In which part of the chloroplast does the light reaction of photosynthesis occur?',
        options: ['Stroma', 'Thylakoid membrane', 'Outer membrane', 'Inner membrane'],
        correct_answer: 'Thylakoid membrane',
        explanation: 'Light reactions occur in the thylakoid membranes where chlorophyll and other photosynthetic pigments are located.',
        time_seconds: 75,
        marks: 2,
        tags: ['photosynthesis', 'chloroplast'],
        competency_codes: ['BIO_11_PHOTOSYNTHESIS'],
        is_active: true,
        pending_review: false
      }
    );
  }
  
  if (grade === 12) {
    questions.push(
      {
        grade,
        subject: 'biology',
        topic: 'Genetics',
        question_type: 'mcq_single',
        difficulty: 'hard',
        text: 'In a dihybrid cross between AaBb × AaBb, what is the phenotypic ratio?',
        options: ['3:1', '1:2:1', '9:3:3:1', '1:1:1:1'],
        correct_answer: '9:3:3:1',
        explanation: 'In a dihybrid cross, the phenotypic ratio is 9:3:3:1 for dominant-dominant : dominant-recessive : recessive-dominant : recessive-recessive.',
        time_seconds: 120,
        marks: 3,
        tags: ['genetics', 'dihybrid_cross'],
        competency_codes: ['BIO_12_GENETICS'],
        is_active: true,
        pending_review: false
      }
    );
  }
  
  return questions;
}

// English question generator
function generateEnglishQuestions(grade) {
  const questions = [];
  
  if (grade === 10) {
    questions.push(
      {
        grade,
        subject: 'english',
        topic: 'Grammar',
        question_type: 'mcq_single',
        difficulty: 'easy',
        text: 'Choose the correct form: "She _____ to school every day."',
        options: ['go', 'goes', 'going', 'gone'],
        correct_answer: 'goes',
        explanation: 'With third person singular subjects, we use the -s form of the verb in simple present tense.',
        time_seconds: 45,
        marks: 1,
        tags: ['grammar', 'verb_forms'],
        competency_codes: ['ENG_10_GRAMMAR'],
        is_active: true,
        pending_review: false
      },
      {
        grade,
        subject: 'english',
        topic: 'Literature',
        question_type: 'mcq_single',
        difficulty: 'medium',
        text: 'What figure of speech is used in "The wind whispered through the trees"?',
        options: ['Metaphor', 'Simile', 'Personification', 'Alliteration'],
        correct_answer: 'Personification',
        explanation: 'Personification gives human qualities (whispering) to non-human things (wind).',
        time_seconds: 60,
        marks: 2,
        tags: ['literature', 'figures_of_speech'],
        competency_codes: ['ENG_10_LITERATURE'],
        is_active: true,
        pending_review: false
      }
    );
  }
  
  if (grade === 11) {
    questions.push(
      {
        grade,
        subject: 'english',
        topic: 'Reading Comprehension',
        question_type: 'mcq_single',
        difficulty: 'medium',
        text: 'In the sentence "Despite the heavy rain, the match continued," what does "despite" indicate?',
        options: ['Cause', 'Effect', 'Contrast', 'Comparison'],
        correct_answer: 'Contrast',
        explanation: '"Despite" is a preposition that shows contrast between two ideas.',
        time_seconds: 60,
        marks: 1,
        tags: ['reading_comprehension', 'connectors'],
        competency_codes: ['ENG_11_READING'],
        is_active: true,
        pending_review: false
      }
    );
  }
  
  if (grade === 12) {
    questions.push(
      {
        grade,
        subject: 'english',
        topic: 'Writing Skills',
        question_type: 'mcq_single',
        difficulty: 'medium',
        text: 'Which of the following is the correct format for a formal letter?',
        options: ['Date, Address, Salutation, Body, Closing', 'Address, Date, Salutation, Body, Closing', 'Salutation, Date, Address, Body, Closing', 'Body, Date, Address, Salutation, Closing'],
        correct_answer: 'Address, Date, Salutation, Body, Closing',
        explanation: 'The correct format for a formal letter is: sender\'s address, date, recipient\'s address, salutation, body, closing.',
        time_seconds: 75,
        marks: 2,
        tags: ['writing_skills', 'formal_letter'],
        competency_codes: ['ENG_12_WRITING'],
        is_active: true,
        pending_review: false
      }
    );
  }
  
  return questions;
}

// Social Science question generator (for class 10)
function generateSocialScienceQuestions(grade) {
  if (grade !== 10) return [];
  
  return [
    {
      grade,
      subject: 'social_science',
      topic: 'History - Nationalism in India',
      question_type: 'mcq_single',
      difficulty: 'easy',
      text: 'Who led the Salt March in 1930?',
      options: ['Jawaharlal Nehru', 'Mahatma Gandhi', 'Subhas Chandra Bose', 'Sardar Patel'],
      correct_answer: 'Mahatma Gandhi',
      explanation: 'Mahatma Gandhi led the Salt March (Dandi March) in 1930 as part of the Civil Disobedience Movement.',
      time_seconds: 45,
      marks: 1,
      tags: ['history', 'nationalism', 'freedom_struggle'],
      competency_codes: ['SS_10_NATIONALISM'],
      is_active: true,
      pending_review: false
    },
    {
      grade,
      subject: 'social_science',
      topic: 'Geography - Resources and Development',
      question_type: 'mcq_single',
      difficulty: 'medium',
      text: 'Which type of soil is most suitable for cotton cultivation?',
      options: ['Alluvial soil', 'Black soil', 'Red soil', 'Laterite soil'],
      correct_answer: 'Black soil',
      explanation: 'Black soil (regur soil) is rich in lime, iron, magnesia and potash, making it ideal for cotton cultivation.',
      time_seconds: 60,
      marks: 1,
      tags: ['geography', 'soil_types', 'agriculture'],
      competency_codes: ['SS_10_GEOGRAPHY'],
      is_active: true,
      pending_review: false
    },
    {
      grade,
      subject: 'social_science',
      topic: 'Political Science - Democracy',
      question_type: 'mcq_single',
      difficulty: 'easy',
      text: 'What is the minimum age for voting in India?',
      options: ['16 years', '18 years', '21 years', '25 years'],
      correct_answer: '18 years',
      explanation: 'The minimum voting age in India was reduced from 21 to 18 years by the 61st Constitutional Amendment in 1989.',
      time_seconds: 45,
      marks: 1,
      tags: ['political_science', 'democracy', 'voting'],
      competency_codes: ['SS_10_DEMOCRACY'],
      is_active: true,
      pending_review: false
    }
  ];
}// Econ
omics question generator
function generateEconomicsQuestions(grade) {
  if (grade === 10) return [];
  
  const questions = [];
  
  if (grade === 11) {
    questions.push(
      {
        grade,
        subject: 'economics',
        topic: 'Introduction to Economics',
        question_type: 'mcq_single',
        difficulty: 'easy',
        text: 'What is the central problem of economics?',
        options: ['Unemployment', 'Scarcity', 'Inflation', 'Poverty'],
        correct_answer: 'Scarcity',
        explanation: 'Scarcity of resources relative to unlimited wants is the fundamental economic problem.',
        time_seconds: 60,
        marks: 1,
        tags: ['basic_concepts', 'scarcity'],
        competency_codes: ['ECO_11_BASICS'],
        is_active: true,
        pending_review: false
      },
      {
        grade,
        subject: 'economics',
        topic: 'Demand and Supply',
        question_type: 'mcq_single',
        difficulty: 'medium',
        text: 'When the price of a good increases, what happens to its demand (ceteris paribus)?',
        options: ['Demand increases', 'Demand decreases', 'Demand remains constant', 'Cannot be determined'],
        correct_answer: 'Demand decreases',
        explanation: 'According to the law of demand, there is an inverse relationship between price and quantity demanded.',
        time_seconds: 75,
        marks: 2,
        tags: ['demand_supply', 'law_of_demand'],
        competency_codes: ['ECO_11_DEMAND_SUPPLY'],
        is_active: true,
        pending_review: false
      }
    );
  }
  
  if (grade === 12) {
    questions.push(
      {
        grade,
        subject: 'economics',
        topic: 'National Income',
        question_type: 'mcq_single',
        difficulty: 'hard',
        text: 'Which of the following is NOT included in the calculation of GDP?',
        options: ['Government expenditure', 'Private investment', 'Transfer payments', 'Net exports'],
        correct_answer: 'Transfer payments',
        explanation: 'Transfer payments like pensions and subsidies are not included in GDP as they don\'t represent current production.',
        time_seconds: 90,
        marks: 2,
        tags: ['national_income', 'gdp'],
        competency_codes: ['ECO_12_NATIONAL_INCOME'],
        is_active: true,
        pending_review: false
      }
    );
  }
  
  return questions;
}

// Accountancy question generator
function generateAccountancyQuestions(grade) {
  if (grade === 10) return [];
  
  const questions = [];
  
  if (grade === 11) {
    questions.push(
      {
        grade,
        subject: 'accountancy',
        topic: 'Introduction to Accounting',
        question_type: 'mcq_single',
        difficulty: 'easy',
        text: 'What is the accounting equation?',
        options: ['Assets = Liabilities + Capital', 'Assets + Liabilities = Capital', 'Assets = Capital - Liabilities', 'Assets + Capital = Liabilities'],
        correct_answer: 'Assets = Liabilities + Capital',
        explanation: 'The fundamental accounting equation states that Assets = Liabilities + Owner\'s Equity (Capital).',
        time_seconds: 60,
        marks: 1,
        tags: ['accounting_equation', 'basics'],
        competency_codes: ['ACC_11_BASICS'],
        is_active: true,
        pending_review: false
      },
      {
        grade,
        subject: 'accountancy',
        topic: 'Journal Entries',
        question_type: 'mcq_single',
        difficulty: 'medium',
        text: 'When goods are purchased on credit, which accounts are affected?',
        options: ['Cash A/c (Dr), Purchases A/c (Cr)', 'Purchases A/c (Dr), Creditors A/c (Cr)', 'Creditors A/c (Dr), Purchases A/c (Cr)', 'Cash A/c (Dr), Creditors A/c (Cr)'],
        correct_answer: 'Purchases A/c (Dr), Creditors A/c (Cr)',
        explanation: 'Purchases account is debited (expense increases) and Creditors account is credited (liability increases).',
        time_seconds: 90,
        marks: 2,
        tags: ['journal_entries', 'credit_transactions'],
        competency_codes: ['ACC_11_JOURNAL'],
        is_active: true,
        pending_review: false
      }
    );
  }
  
  if (grade === 12) {
    questions.push(
      {
        grade,
        subject: 'accountancy',
        topic: 'Partnership Accounts',
        question_type: 'mcq_single',
        difficulty: 'hard',
        text: 'In the absence of partnership deed, profits are shared:',
        options: ['In capital ratio', 'Equally among partners', 'In the ratio of time devoted', 'As decided by senior partner'],
        correct_answer: 'Equally among partners',
        explanation: 'According to the Partnership Act, in the absence of an agreement, profits and losses are shared equally.',
        time_seconds: 75,
        marks: 2,
        tags: ['partnership', 'profit_sharing'],
        competency_codes: ['ACC_12_PARTNERSHIP'],
        is_active: true,
        pending_review: false
      }
    );
  }
  
  return questions;
}

// Business Studies question generator
function generateBusinessStudiesQuestions(grade) {
  if (grade === 10) return [];
  
  const questions = [];
  
  if (grade === 11) {
    questions.push(
      {
        grade,
        subject: 'business_studies',
        topic: 'Nature and Purpose of Business',
        question_type: 'mcq_single',
        difficulty: 'easy',
        text: 'What is the primary objective of business?',
        options: ['Social service', 'Profit maximization', 'Employment generation', 'Environmental protection'],
        correct_answer: 'Profit maximization',
        explanation: 'While businesses have multiple objectives, the primary economic objective is profit maximization.',
        time_seconds: 60,
        marks: 1,
        tags: ['business_objectives', 'profit'],
        competency_codes: ['BS_11_NATURE'],
        is_active: true,
        pending_review: false
      },
      {
        grade,
        subject: 'business_studies',
        topic: 'Forms of Business Organization',
        question_type: 'mcq_single',
        difficulty: 'medium',
        text: 'Which form of business organization has unlimited liability?',
        options: ['Company', 'Partnership', 'Sole proprietorship', 'Both B and C'],
        correct_answer: 'Both B and C',
        explanation: 'Both partnership and sole proprietorship have unlimited liability, unlike companies which have limited liability.',
        time_seconds: 75,
        marks: 2,
        tags: ['business_organization', 'liability'],
        competency_codes: ['BS_11_ORGANIZATION'],
        is_active: true,
        pending_review: false
      }
    );
  }
  
  if (grade === 12) {
    questions.push(
      {
        grade,
        subject: 'business_studies',
        topic: 'Principles of Management',
        question_type: 'mcq_single',
        difficulty: 'medium',
        text: 'Who is known as the father of scientific management?',
        options: ['Henri Fayol', 'F.W. Taylor', 'Max Weber', 'Elton Mayo'],
        correct_answer: 'F.W. Taylor',
        explanation: 'Frederick Winslow Taylor is known as the father of scientific management for his systematic approach to improving efficiency.',
        time_seconds: 60,
        marks: 1,
        tags: ['management_principles', 'scientific_management'],
        competency_codes: ['BS_12_MANAGEMENT'],
        is_active: true,
        pending_review: false
      }
    );
  }
  
  return questions;
}

// Verification function
async function verifyQuestions() {
  console.log('\n🔍 Verifying generated questions...');
  
  for (const [grade, subjects] of Object.entries(SUBJECTS_CONFIG)) {
    console.log(`\n📊 Class ${grade} Summary:`);
    
    for (const subject of subjects) {
      const { data, error } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .eq('grade', parseInt(grade))
        .eq('subject', subject);
      
      if (error) {
        console.log(`   ❌ ${subject}: Error - ${error.message}`);
      } else {
        const count = data?.length || 0;
        const status = count >= 25 ? '✅' : count > 0 ? '⚠️' : '❌';
        console.log(`   ${status} ${subject}: ${count} questions`);
      }
    }
  }
  
  // Overall summary
  const { data: totalQuestions } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n📈 Total Questions in Database: ${totalQuestions?.length || 0}`);
}

// Run the generation
generateAllQuestions();