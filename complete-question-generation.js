#!/usr/bin/env node

/**
 * Complete Question Generation for All Required Subjects
 * Ensures 25+ questions for each subject in classes 10, 11, and 12
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Required subjects per class
const REQUIRED_SUBJECTS = {
  10: ['science', 'mathematics', 'english', 'social_science'],
  11: ['physics', 'chemistry', 'mathematics', 'biology', 'english', 'economics', 'accountancy', 'business_studies'],
  12: ['physics', 'chemistry', 'mathematics', 'biology', 'english', 'economics', 'accountancy', 'business_studies']
};

// Additional questions to reach 25+ per subject
const additionalQuestions = {
  // Class 11 & 12 Physics
  physics: [
    { question_text: "A car accelerates from rest at 2 m/s². What is its velocity after 5 seconds?", category: "physics", subcategory: "kinematics", options: ["5 m/s", "10 m/s", "15 m/s", "20 m/s"], correct_answer: 1, difficulty_level: 2, time_limit: 90, scoring_weight: 2.0 },
    { question_text: "Newton's first law is also known as:", category: "physics", subcategory: "laws_of_motion", options: ["Law of Inertia", "Law of Acceleration", "Law of Action-Reaction", "Law of Gravitation"], correct_answer: 0, difficulty_level: 1, time_limit: 60, scoring_weight: 1.0 },
    { question_text: "The SI unit of force is:", category: "physics", subcategory: "mechanics", options: ["Newton", "Joule", "Watt", "Pascal"], correct_answer: 0, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "What is the formula for gravitational force?", category: "physics", subcategory: "gravitation", options: ["F = Gm₁m₂/r²", "F = ma", "F = kx", "F = qE"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The escape velocity from Earth is approximately:", category: "physics", subcategory: "gravitation", options: ["11.2 km/s", "7.9 km/s", "9.8 m/s", "3.0 × 10⁸ m/s"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "Which law states that energy cannot be created or destroyed?", category: "physics", subcategory: "energy", options: ["Conservation of Energy", "Conservation of Momentum", "Newton's First Law", "Ohm's Law"], correct_answer: 0, difficulty_level: 1, time_limit: 60, scoring_weight: 1.0 },
    { question_text: "The unit of electric charge is:", category: "physics", subcategory: "electrostatics", options: ["Coulomb", "Ampere", "Volt", "Ohm"], correct_answer: 0, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "Coulomb's law gives the force between:", category: "physics", subcategory: "electrostatics", options: ["Two point charges", "Current-carrying conductors", "Magnetic poles", "Parallel plates"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The magnetic field inside a solenoid is:", category: "physics", subcategory: "magnetism", options: ["Uniform", "Zero", "Maximum at ends", "Minimum at center"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "Electromagnetic induction was discovered by:", category: "physics", subcategory: "electromagnetic_induction", options: ["Faraday", "Newton", "Einstein", "Maxwell"], correct_answer: 0, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "The frequency of AC supply in India is:", category: "physics", subcategory: "alternating_current", options: ["50 Hz", "60 Hz", "100 Hz", "25 Hz"], correct_answer: 0, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "Which phenomenon explains the blue color of the sky?", category: "physics", subcategory: "optics", options: ["Scattering", "Reflection", "Refraction", "Diffraction"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The critical angle depends on:", category: "physics", subcategory: "optics", options: ["Refractive indices", "Wavelength only", "Intensity", "Polarization"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "X-rays were discovered by:", category: "physics", subcategory: "modern_physics", options: ["Roentgen", "Curie", "Rutherford", "Bohr"], correct_answer: 0, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "The photoelectric effect was explained by:", category: "physics", subcategory: "modern_physics", options: ["Einstein", "Planck", "Bohr", "Heisenberg"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Alpha particles are:", category: "physics", subcategory: "nuclear_physics", options: ["Helium nuclei", "Electrons", "Protons", "Neutrons"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The half-life of a radioactive element is:", category: "physics", subcategory: "nuclear_physics", options: ["Time for half nuclei to decay", "Time for complete decay", "Time for 25% decay", "Time for 75% decay"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "Nuclear fission involves:", category: "physics", subcategory: "nuclear_physics", options: ["Splitting heavy nuclei", "Combining light nuclei", "Electron capture", "Beta decay"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The binding energy per nucleon is maximum for:", category: "physics", subcategory: "nuclear_physics", options: ["Iron", "Hydrogen", "Uranium", "Helium"], correct_answer: 0, difficulty_level: 3, time_limit: 90, scoring_weight: 3.0 },
    { question_text: "Simple harmonic motion has:", category: "physics", subcategory: "oscillations", options: ["Constant period", "Constant velocity", "Constant acceleration", "Constant displacement"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The time period of a simple pendulum depends on:", category: "physics", subcategory: "oscillations", options: ["Length and g", "Mass and length", "Amplitude only", "Mass only"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "Sound waves are:", category: "physics", subcategory: "waves", options: ["Longitudinal", "Transverse", "Both", "Neither"], correct_answer: 0, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "The Doppler effect occurs due to:", category: "physics", subcategory: "waves", options: ["Relative motion", "Interference", "Diffraction", "Polarization"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Young's double slit experiment demonstrates:", category: "physics", subcategory: "wave_optics", options: ["Interference", "Diffraction", "Polarization", "Scattering"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The work function in photoelectric effect is:", category: "physics", subcategory: "modern_physics", options: ["Minimum energy to remove electron", "Maximum kinetic energy", "Photon energy", "Binding energy"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 }
  ],

  // Class 11 & 12 Chemistry
  chemistry: [
    { question_text: "The maximum number of electrons in M shell is:", category: "chemistry", subcategory: "atomic_structure", options: ["2", "8", "18", "32"], correct_answer: 2, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Which type of bond is formed in NaCl?", category: "chemistry", subcategory: "chemical_bonding", options: ["Covalent", "Ionic", "Metallic", "Hydrogen"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The shape of ammonia molecule is:", category: "chemistry", subcategory: "molecular_geometry", options: ["Pyramidal", "Linear", "Tetrahedral", "Planar"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "Which gas is evolved when zinc reacts with HCl?", category: "chemistry", subcategory: "acids_bases", options: ["Oxygen", "Hydrogen", "Chlorine", "Nitrogen"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The IUPAC name of CH₃CH₂OH is:", category: "chemistry", subcategory: "organic_chemistry", options: ["Ethanol", "Methanol", "Propanol", "Butanol"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Benzene has how many pi electrons?", category: "chemistry", subcategory: "organic_chemistry", options: ["6", "4", "8", "12"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The catalyst used in Haber's process is:", category: "chemistry", subcategory: "industrial_chemistry", options: ["Iron", "Nickel", "Platinum", "Vanadium"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Which element has the highest electronegativity?", category: "chemistry", subcategory: "periodic_properties", options: ["Fluorine", "Oxygen", "Nitrogen", "Chlorine"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The oxidation state of Cr in K₂Cr₂O₇ is:", category: "chemistry", subcategory: "redox_reactions", options: ["+6", "+3", "+2", "+7"], correct_answer: 0, difficulty_level: 3, time_limit: 90, scoring_weight: 3.0 },
    { question_text: "Which law states that equal volumes of gases contain equal number of molecules?", category: "chemistry", subcategory: "gaseous_state", options: ["Avogadro's law", "Boyle's law", "Charles' law", "Gay-Lussac's law"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The molarity of pure water is:", category: "chemistry", subcategory: "solutions", options: ["55.6 M", "18 M", "1 M", "100 M"], correct_answer: 0, difficulty_level: 3, time_limit: 90, scoring_weight: 3.0 },
    { question_text: "Which type of isomerism is shown by glucose and fructose?", category: "chemistry", subcategory: "biomolecules", options: ["Functional", "Chain", "Position", "Optical"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The entropy of a perfectly crystalline solid at 0K is:", category: "chemistry", subcategory: "thermodynamics", options: ["Zero", "Maximum", "Minimum", "Undefined"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "Le Chatelier's principle is related to:", category: "chemistry", subcategory: "equilibrium", options: ["Chemical equilibrium", "Atomic structure", "Bonding", "Kinetics"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The rate of reaction depends on:", category: "chemistry", subcategory: "chemical_kinetics", options: ["Concentration", "Temperature", "Catalyst", "All of these"], correct_answer: 3, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Which metal is extracted by electrolysis?", category: "chemistry", subcategory: "metallurgy", options: ["Aluminum", "Iron", "Copper", "Silver"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The coordination number of central atom in [Cu(NH₃)₄]²⁺ is:", category: "chemistry", subcategory: "coordination_compounds", options: ["4", "2", "6", "8"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "Which vitamin is synthesized in human body?", category: "chemistry", subcategory: "biomolecules", options: ["Vitamin D", "Vitamin C", "Vitamin A", "Vitamin B"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The monomer of natural rubber is:", category: "chemistry", subcategory: "polymers", options: ["Isoprene", "Ethylene", "Propylene", "Styrene"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Which reaction is used to convert alkyl halides to alcohols?", category: "chemistry", subcategory: "organic_reactions", options: ["Hydrolysis", "Reduction", "Oxidation", "Substitution"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The hybridization of carbon in methane is:", category: "chemistry", subcategory: "chemical_bonding", options: ["sp³", "sp²", "sp", "sp³d"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Which compound shows tautomerism?", category: "chemistry", subcategory: "organic_chemistry", options: ["Acetone", "Benzene", "Methane", "Ethane"], correct_answer: 0, difficulty_level: 3, time_limit: 90, scoring_weight: 3.0 },
    { question_text: "The pH of 0.1 M HCl solution is:", category: "chemistry", subcategory: "ionic_equilibrium", options: ["1", "0.1", "2", "0.01"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "Which element shows maximum catenation?", category: "chemistry", subcategory: "carbon_compounds", options: ["Carbon", "Silicon", "Nitrogen", "Oxygen"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The number of sigma bonds in ethyne is:", category: "chemistry", subcategory: "chemical_bonding", options: ["3", "2", "4", "5"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 }
  ],

  // Class 11 & 12 Biology
  biology: [
    { question_text: "Which organelle is known as the powerhouse of the cell?", category: "biology", subcategory: "cell_biology", options: ["Nucleus", "Mitochondria", "Ribosome", "ER"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "In which part of chloroplast does light reaction occur?", category: "biology", subcategory: "photosynthesis", options: ["Stroma", "Thylakoid membrane", "Outer membrane", "Inner membrane"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The genetic material in most organisms is:", category: "biology", subcategory: "molecular_biology", options: ["DNA", "RNA", "Protein", "Carbohydrate"], correct_answer: 0, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "Which enzyme is used in PCR?", category: "biology", subcategory: "biotechnology", options: ["Taq polymerase", "Ligase", "Helicase", "Primase"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The number of chromosomes in human gametes is:", category: "biology", subcategory: "genetics", options: ["23", "46", "22", "44"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Which hormone regulates blood sugar?", category: "biology", subcategory: "endocrinology", options: ["Insulin", "Thyroxine", "Adrenaline", "Growth hormone"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The site of protein synthesis is:", category: "biology", subcategory: "cell_biology", options: ["Ribosome", "Nucleus", "Mitochondria", "Golgi body"], correct_answer: 0, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "Which blood group is universal donor?", category: "biology", subcategory: "human_physiology", options: ["O", "A", "B", "AB"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The process of water absorption by roots is:", category: "biology", subcategory: "plant_physiology", options: ["Osmosis", "Diffusion", "Active transport", "All of these"], correct_answer: 3, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "Which part of brain controls breathing?", category: "biology", subcategory: "human_physiology", options: ["Medulla", "Cerebrum", "Cerebellum", "Hypothalamus"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The theory of evolution was proposed by:", category: "biology", subcategory: "evolution", options: ["Darwin", "Mendel", "Watson", "Lamarck"], correct_answer: 0, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "Which is the largest phylum in animal kingdom?", category: "biology", subcategory: "taxonomy", options: ["Arthropoda", "Chordata", "Mollusca", "Cnidaria"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The functional unit of kidney is:", category: "biology", subcategory: "human_physiology", options: ["Nephron", "Neuron", "Alveoli", "Villus"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Which vitamin is essential for blood clotting?", category: "biology", subcategory: "nutrition", options: ["Vitamin K", "Vitamin C", "Vitamin D", "Vitamin A"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The exchange of gases in plants occurs through:", category: "biology", subcategory: "plant_physiology", options: ["Stomata", "Lenticels", "Both", "Cuticle"], correct_answer: 2, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Which hormone is called stress hormone?", category: "biology", subcategory: "endocrinology", options: ["Cortisol", "Insulin", "Thyroxine", "Oxytocin"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The process of formation of gametes is called:", category: "biology", subcategory: "reproduction", options: ["Gametogenesis", "Fertilization", "Embryogenesis", "Organogenesis"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Which structure connects muscle to bone?", category: "biology", subcategory: "human_physiology", options: ["Tendon", "Ligament", "Cartilage", "Joint"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The study of fossils is called:", category: "biology", subcategory: "evolution", options: ["Paleontology", "Taxonomy", "Ecology", "Embryology"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Which gas is released during photosynthesis?", category: "biology", subcategory: "photosynthesis", options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"], correct_answer: 0, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "The basic unit of classification is:", category: "biology", subcategory: "taxonomy", options: ["Species", "Genus", "Family", "Order"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Which type of immunity is provided by vaccination?", category: "biology", subcategory: "immunology", options: ["Active", "Passive", "Natural", "Innate"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The longest bone in human body is:", category: "biology", subcategory: "human_anatomy", options: ["Femur", "Tibia", "Humerus", "Radius"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Which organelle is absent in animal cells?", category: "biology", subcategory: "cell_biology", options: ["Cell wall", "Nucleus", "Mitochondria", "Ribosome"], correct_answer: 0, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "The process of cell division in somatic cells is:", category: "biology", subcategory: "cell_division", options: ["Mitosis", "Meiosis", "Binary fission", "Budding"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 }
  ]
};

async function completeQuestionGeneration() {
  console.log('🚀 Completing Question Generation for All Subjects...\n');
  
  try {
    let totalGenerated = 0;
    
    for (const [grade, subjects] of Object.entries(REQUIRED_SUBJECTS)) {
      console.log(`📚 Processing Class ${grade}...`);
      
      for (const subject of subjects) {
        console.log(`  📖 Checking ${subject}...`);
        
        // Check current count
        const { data: existing } = await supabase
          .from('quiz_questions')
          .select('*', { count: 'exact', head: true })
          .eq('category', subject)
          .eq('question_type', 'academic');
        
        const currentCount = existing?.length || 0;
        console.log(`    Current: ${currentCount} questions`);
        
        if (currentCount >= 25) {
          console.log(`    ✅ ${subject} has sufficient questions`);
          continue;
        }
        
        const needed = 25 - currentCount;
        console.log(`    📝 Need ${needed} more questions`);
        
        // Get questions from additional bank
        const availableQuestions = additionalQuestions[subject] || [];
        if (availableQuestions.length === 0) {
          console.log(`    ⚠️  No additional questions available for ${subject}`);
          continue;
        }
        
        // Take needed questions
        const questionsToAdd = availableQuestions.slice(0, needed).map(q => ({
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
            console.log(`    ❌ Error: ${error.message}`);
          } else {
            console.log(`    ✅ Added ${data?.length || 0} questions`);
            totalGenerated += data?.length || 0;
          }
        }
      }
    }
    
    console.log(`\n🎉 Total new questions generated: ${totalGenerated}`);
    await verifyAllSubjects();
    
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
  }
}

async function verifyAllSubjects() {
  console.log('\n🔍 Final Verification of All Subjects...');
  
  for (const [grade, subjects] of Object.entries(REQUIRED_SUBJECTS)) {
    console.log(`\n📊 Class ${grade}:`);
    
    for (const subject of subjects) {
      const { data } = await supabase
        .from('quiz_questions')
        .select('*', { count: 'exact', head: true })
        .eq('category', subject)
        .eq('question_type', 'academic');
      
      const count = data?.length || 0;
      const status = count >= 25 ? '✅' : count > 0 ? '⚠️' : '❌';
      const statusText = count >= 25 ? 'REQUIREMENT MET' : 'BELOW REQUIREMENT';
      console.log(`   ${status} ${subject}: ${count} questions (${statusText})`);
    }
  }
  
  // Overall summary
  const { data: totalQuestions } = await supabase
    .from('quiz_questions')
    .select('*', { count: 'exact', head: true })
    .eq('question_type', 'academic');
  
  console.log(`\n📈 Total Academic Questions: ${totalQuestions?.length || 0}`);
  
  // Count subjects meeting requirement
  let subjectsMet = 0;
  let totalSubjects = 0;
  
  for (const subjects of Object.values(REQUIRED_SUBJECTS)) {
    for (const subject of subjects) {
      totalSubjects++;
      const { data } = await supabase
        .from('quiz_questions')
        .select('*', { count: 'exact', head: true })
        .eq('category', subject)
        .eq('question_type', 'academic');
      
      if ((data?.length || 0) >= 25) {
        subjectsMet++;
      }
    }
  }
  
  console.log(`📊 Subjects Meeting Requirement: ${subjectsMet}/${totalSubjects}`);
}

completeQuestionGeneration();