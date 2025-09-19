#!/usr/bin/env node

/**
 * Complete Remaining Subjects
 * Adds questions for subjects that are below the 25-question requirement
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Additional questions for subjects below requirement
const remainingQuestions = {
  english: [
    { question_text: "What is the past participle of 'write'?", category: "english", subcategory: "grammar", options: ["wrote", "written", "writing", "writes"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "Choose the correct sentence:", category: "english", subcategory: "grammar", options: ["He don't like coffee", "He doesn't like coffee", "He not like coffee", "He no like coffee"], correct_answer: 1, difficulty_level: 1, time_limit: 60, scoring_weight: 1.0 },
    { question_text: "What is the comparative form of 'good'?", category: "english", subcategory: "grammar", options: ["gooder", "better", "best", "more good"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "Identify the noun in: 'The quick brown fox jumps'", category: "english", subcategory: "grammar", options: ["quick", "brown", "fox", "jumps"], correct_answer: 2, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "What is the opposite of 'ancient'?", category: "english", subcategory: "vocabulary", options: ["old", "modern", "historic", "traditional"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "Choose the correct spelling:", category: "english", subcategory: "spelling", options: ["recieve", "receive", "receve", "receeve"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "What does 'procrastinate' mean?", category: "english", subcategory: "vocabulary", options: ["To hurry", "To delay", "To complete", "To organize"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Which is a compound sentence?", category: "english", subcategory: "grammar", options: ["I went home", "I went home and ate dinner", "Going home", "Home is nice"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "What is alliteration?", category: "english", subcategory: "literature", options: ["Repetition of sounds", "Comparison using like", "Giving human qualities", "Exaggeration"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "In 'The cat sat on the mat', what is the preposition?", category: "english", subcategory: "grammar", options: ["cat", "sat", "on", "mat"], correct_answer: 2, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "What is the main purpose of a conclusion in an essay?", category: "english", subcategory: "writing", options: ["Introduce topic", "Provide examples", "Summarize main points", "Ask questions"], correct_answer: 2, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Which punctuation mark shows possession?", category: "english", subcategory: "grammar", options: ["Comma", "Apostrophe", "Semicolon", "Colon"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "What is a thesis statement?", category: "english", subcategory: "writing", options: ["First sentence", "Main argument", "Conclusion", "Example"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Choose the correct form: 'Neither John nor Mary _____ coming'", category: "english", subcategory: "grammar", options: ["is", "are", "were", "be"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "What is the theme of a story?", category: "english", subcategory: "literature", options: ["Main character", "Setting", "Central message", "Plot"], correct_answer: 2, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 }
  ],

  social_science: [
    { question_text: "Which river is called the 'Sorrow of Bengal'?", category: "social_science", subcategory: "geography", options: ["Ganga", "Damodar", "Brahmaputra", "Yamuna"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Who wrote the Indian National Anthem?", category: "social_science", subcategory: "history", options: ["Rabindranath Tagore", "Bankim Chandra", "Sarojini Naidu", "Subhash Bose"], correct_answer: 0, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "Which is the smallest state in India?", category: "social_science", subcategory: "geography", options: ["Sikkim", "Goa", "Tripura", "Manipur"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The Quit India Movement was launched in:", category: "social_science", subcategory: "history", options: ["1940", "1942", "1944", "1946"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Which amendment is known as 'Mini Constitution'?", category: "social_science", subcategory: "civics", options: ["42nd", "44th", "52nd", "73rd"], correct_answer: 0, difficulty_level: 3, time_limit: 90, scoring_weight: 3.0 },
    { question_text: "The Tropic of Cancer passes through how many Indian states?", category: "social_science", subcategory: "geography", options: ["6", "7", "8", "9"], correct_answer: 2, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "Who is known as the 'Iron Man of India'?", category: "social_science", subcategory: "history", options: ["Nehru", "Sardar Patel", "Subhash Bose", "Bhagat Singh"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "Which soil is formed by weathering of lava?", category: "social_science", subcategory: "geography", options: ["Alluvial", "Black", "Red", "Laterite"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The Indian Constitution was adopted on:", category: "social_science", subcategory: "civics", options: ["26 Jan 1950", "26 Nov 1949", "15 Aug 1947", "2 Oct 1947"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Which is the largest delta in the world?", category: "social_science", subcategory: "geography", options: ["Nile Delta", "Sundarbans Delta", "Mississippi Delta", "Amazon Delta"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The Preamble of Indian Constitution begins with:", category: "social_science", subcategory: "civics", options: ["We the People", "In the name of God", "By the grace", "We the citizens"], correct_answer: 0, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "Which movement was started by Mahatma Gandhi in 1930?", category: "social_science", subcategory: "history", options: ["Non-Cooperation", "Civil Disobedience", "Quit India", "Khilafat"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The monsoon winds in India are:", category: "social_science", subcategory: "geography", options: ["Permanent winds", "Seasonal winds", "Local winds", "Trade winds"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Who was the first woman Prime Minister of India?", category: "social_science", subcategory: "history", options: ["Sarojini Naidu", "Indira Gandhi", "Sushma Swaraj", "Pratibha Patil"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "The Right to Education Act was passed in:", category: "social_science", subcategory: "civics", options: ["2005", "2009", "2010", "2012"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 }
  ],

  economics: [
    { question_text: "What is the central problem of economics?", category: "economics", subcategory: "basic_concepts", options: ["Unemployment", "Scarcity", "Inflation", "Poverty"], correct_answer: 1, difficulty_level: 1, time_limit: 60, scoring_weight: 1.0 },
    { question_text: "The law of demand states that:", category: "economics", subcategory: "demand_supply", options: ["Price and demand are directly related", "Price and demand are inversely related", "Price doesn't affect demand", "Demand is always constant"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "What is GDP?", category: "economics", subcategory: "national_income", options: ["Gross Domestic Product", "General Development Plan", "Government Development Policy", "Global Development Program"], correct_answer: 0, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "Which market structure has only one seller?", category: "economics", subcategory: "market_structures", options: ["Perfect competition", "Monopoly", "Oligopoly", "Monopolistic competition"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "What is inflation?", category: "economics", subcategory: "macroeconomics", options: ["Fall in prices", "Rise in prices", "Stable prices", "No change in prices"], correct_answer: 1, difficulty_level: 1, time_limit: 45, scoring_weight: 1.0 },
    { question_text: "The elasticity of demand measures:", category: "economics", subcategory: "demand_supply", options: ["Change in supply", "Responsiveness of demand to price change", "Market size", "Consumer income"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "What is opportunity cost?", category: "economics", subcategory: "basic_concepts", options: ["Money spent", "Time taken", "Next best alternative foregone", "Total cost"], correct_answer: 2, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The Reserve Bank of India was established in:", category: "economics", subcategory: "monetary_policy", options: ["1935", "1947", "1950", "1969"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "What is fiscal policy?", category: "economics", subcategory: "government_policy", options: ["Monetary control", "Government spending and taxation", "Trade policy", "Employment policy"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The production possibility curve shows:", category: "economics", subcategory: "basic_concepts", options: ["Maximum production combinations", "Minimum costs", "Market demand", "Consumer preferences"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "What is marginal utility?", category: "economics", subcategory: "consumer_behavior", options: ["Total satisfaction", "Additional satisfaction from one more unit", "Average satisfaction", "Maximum satisfaction"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The break-even point is where:", category: "economics", subcategory: "production", options: ["Profit is maximum", "Loss is maximum", "Total revenue equals total cost", "Marginal cost is zero"], correct_answer: 2, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "What is a public good?", category: "economics", subcategory: "market_failure", options: ["Good sold by government", "Non-excludable and non-rival good", "Expensive good", "Imported good"], correct_answer: 1, difficulty_level: 3, time_limit: 90, scoring_weight: 3.0 },
    { question_text: "The multiplier effect refers to:", category: "economics", subcategory: "macroeconomics", options: ["Price increase", "Income generation process", "Cost reduction", "Market expansion"], correct_answer: 1, difficulty_level: 3, time_limit: 90, scoring_weight: 3.0 },
    { question_text: "What is balance of payments?", category: "economics", subcategory: "international_trade", options: ["Government budget", "Trade balance only", "Record of all economic transactions", "Foreign exchange reserves"], correct_answer: 2, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The Phillips curve shows relationship between:", category: "economics", subcategory: "macroeconomics", options: ["Inflation and unemployment", "Supply and demand", "Income and consumption", "Savings and investment"], correct_answer: 0, difficulty_level: 3, time_limit: 90, scoring_weight: 3.0 },
    { question_text: "What is perfect competition?", category: "economics", subcategory: "market_structures", options: ["One seller", "Few sellers", "Many sellers with identical products", "Differentiated products"], correct_answer: 2, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The law of diminishing returns applies to:", category: "economics", subcategory: "production", options: ["Long run only", "Short run only", "Both short and long run", "Neither"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "What is consumer surplus?", category: "economics", subcategory: "consumer_behavior", options: ["Extra money consumers have", "Difference between willingness to pay and actual price", "Total spending", "Savings"], correct_answer: 1, difficulty_level: 3, time_limit: 90, scoring_weight: 3.0 },
    { question_text: "The Lorenz curve measures:", category: "economics", subcategory: "welfare_economics", options: ["Economic growth", "Income inequality", "Price level", "Employment"], correct_answer: 1, difficulty_level: 3, time_limit: 90, scoring_weight: 3.0 },
    { question_text: "What is externality?", category: "economics", subcategory: "market_failure", options: ["External trade", "Side effect of economic activity", "Government intervention", "Market competition"], correct_answer: 1, difficulty_level: 3, time_limit: 90, scoring_weight: 3.0 },
    { question_text: "The Gini coefficient measures:", category: "economics", subcategory: "welfare_economics", options: ["Economic growth", "Income distribution", "Price stability", "Employment rate"], correct_answer: 1, difficulty_level: 3, time_limit: 90, scoring_weight: 3.0 },
    { question_text: "What is monetary policy?", category: "economics", subcategory: "monetary_policy", options: ["Government spending", "Control of money supply and interest rates", "Trade regulations", "Tax policy"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The IS-LM model shows:", category: "economics", subcategory: "macroeconomics", options: ["Supply and demand", "Goods and money market equilibrium", "International trade", "Labor market"], correct_answer: 1, difficulty_level: 3, time_limit: 90, scoring_weight: 3.0 },
    { question_text: "What is stagflation?", category: "economics", subcategory: "macroeconomics", options: ["High growth with low inflation", "High inflation with high unemployment", "Low inflation with low unemployment", "Stable prices"], correct_answer: 1, difficulty_level: 3, time_limit: 90, scoring_weight: 3.0 }
  ],

  accountancy: [
    { question_text: "What is the accounting equation?", category: "accountancy", subcategory: "basic_concepts", options: ["Assets = Liabilities + Capital", "Assets + Liabilities = Capital", "Assets = Capital - Liabilities", "Assets + Capital = Liabilities"], correct_answer: 0, difficulty_level: 1, time_limit: 60, scoring_weight: 1.0 },
    { question_text: "Which principle states that revenue should be recorded when earned?", category: "accountancy", subcategory: "accounting_principles", options: ["Matching principle", "Revenue recognition principle", "Cost principle", "Conservatism principle"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "What is depreciation?", category: "accountancy", subcategory: "fixed_assets", options: ["Increase in asset value", "Decrease in asset value over time", "Sale of assets", "Purchase of assets"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The double entry system means:", category: "accountancy", subcategory: "basic_concepts", options: ["Every transaction affects two accounts", "Recording twice", "Two books of accounts", "Two accountants"], correct_answer: 0, difficulty_level: 1, time_limit: 60, scoring_weight: 1.0 },
    { question_text: "Which account has a normal credit balance?", category: "accountancy", subcategory: "journal_entries", options: ["Assets", "Expenses", "Liabilities", "Drawings"], correct_answer: 2, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "What is a trial balance?", category: "accountancy", subcategory: "trial_balance", options: ["List of all accounts", "Statement of debit and credit balances", "Profit and loss statement", "Balance sheet"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The cash book is a combination of:", category: "accountancy", subcategory: "subsidiary_books", options: ["Journal and ledger", "Trial balance and balance sheet", "Profit and loss account", "Assets and liabilities"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "What is working capital?", category: "accountancy", subcategory: "financial_analysis", options: ["Fixed assets", "Current assets minus current liabilities", "Total capital", "Share capital"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The matching principle requires:", category: "accountancy", subcategory: "accounting_principles", options: ["Matching colors", "Matching revenues with related expenses", "Matching assets with liabilities", "Matching debits with credits"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "What is goodwill?", category: "accountancy", subcategory: "intangible_assets", options: ["Physical asset", "Intangible asset representing business reputation", "Current asset", "Liability"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The bank reconciliation statement is prepared to:", category: "accountancy", subcategory: "bank_reconciliation", options: ["Calculate bank charges", "Match cash book with bank statement", "Calculate interest", "Open bank account"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "What is provision for bad debts?", category: "accountancy", subcategory: "provisions", options: ["Money kept aside for doubtful debts", "Money received from debtors", "Money paid to creditors", "Bank loan"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The gross profit is calculated as:", category: "accountancy", subcategory: "trading_account", options: ["Sales - Purchases", "Sales - Cost of goods sold", "Total income - Total expenses", "Assets - Liabilities"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "What is a contra entry?", category: "accountancy", subcategory: "cash_book", options: ["Entry affecting both cash and bank", "Entry in red ink", "Opposite entry", "Error correction"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The current ratio is calculated as:", category: "accountancy", subcategory: "ratio_analysis", options: ["Current assets / Current liabilities", "Current liabilities / Current assets", "Fixed assets / Current assets", "Sales / Current assets"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "What is capital expenditure?", category: "accountancy", subcategory: "capital_revenue", options: ["Daily expenses", "Expenditure on acquiring fixed assets", "Salary payments", "Rent payments"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The acid test ratio excludes:", category: "accountancy", subcategory: "ratio_analysis", options: ["Cash", "Debtors", "Stock", "Bank"], correct_answer: 2, difficulty_level: 3, time_limit: 90, scoring_weight: 3.0 },
    { question_text: "What is a journal?", category: "accountancy", subcategory: "books_of_accounts", options: ["Book of original entry", "Book of final entry", "Cash register", "Bank statement"], correct_answer: 0, difficulty_level: 1, time_limit: 60, scoring_weight: 1.0 },
    { question_text: "The profit and loss account shows:", category: "accountancy", subcategory: "final_accounts", options: ["Financial position", "Profitability for a period", "Cash flows", "Asset values"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "What is reserve?", category: "accountancy", subcategory: "reserves_provisions", options: ["Money kept aside from profits", "Bank balance", "Fixed asset", "Current liability"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The balance sheet shows:", category: "accountancy", subcategory: "final_accounts", options: ["Profit for the year", "Financial position on a specific date", "Cash receipts and payments", "Revenue and expenses"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "What is petty cash?", category: "accountancy", subcategory: "cash_management", options: ["Large cash payments", "Small cash payments", "Bank deposits", "Credit sales"], correct_answer: 1, difficulty_level: 1, time_limit: 60, scoring_weight: 1.0 },
    { question_text: "The debt-equity ratio measures:", category: "accountancy", subcategory: "ratio_analysis", options: ["Profitability", "Liquidity", "Leverage", "Efficiency"], correct_answer: 2, difficulty_level: 3, time_limit: 90, scoring_weight: 3.0 },
    { question_text: "What is accrued income?", category: "accountancy", subcategory: "adjustments", options: ["Income received in advance", "Income earned but not received", "Income received", "Income not earned"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The return on investment ratio is calculated as:", category: "accountancy", subcategory: "ratio_analysis", options: ["Net profit / Capital employed", "Sales / Capital", "Assets / Liabilities", "Income / Expenses"], correct_answer: 0, difficulty_level: 3, time_limit: 90, scoring_weight: 3.0 }
  ],

  business_studies: [
    { question_text: "What is the primary objective of business?", category: "business_studies", subcategory: "nature_of_business", options: ["Social service", "Profit maximization", "Employment generation", "Environmental protection"], correct_answer: 1, difficulty_level: 1, time_limit: 60, scoring_weight: 1.0 },
    { question_text: "Which form of business organization has unlimited liability?", category: "business_studies", subcategory: "forms_of_organization", options: ["Company", "Partnership", "Sole proprietorship", "Both B and C"], correct_answer: 3, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "Who is known as the father of scientific management?", category: "business_studies", subcategory: "management_principles", options: ["Henri Fayol", "F.W. Taylor", "Max Weber", "Elton Mayo"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "What is planning in management?", category: "business_studies", subcategory: "planning", options: ["Deciding what to do", "Organizing resources", "Leading people", "Controlling activities"], correct_answer: 0, difficulty_level: 1, time_limit: 60, scoring_weight: 1.0 },
    { question_text: "The span of control refers to:", category: "business_studies", subcategory: "organizing", options: ["Number of subordinates under a manager", "Time period of control", "Area of control", "Level of control"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "What is motivation?", category: "business_studies", subcategory: "directing", options: ["Giving orders", "Inspiring people to work", "Checking performance", "Setting goals"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "The process of comparing actual performance with standards is:", category: "business_studies", subcategory: "controlling", options: ["Planning", "Organizing", "Directing", "Controlling"], correct_answer: 3, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "What is marketing?", category: "business_studies", subcategory: "marketing", options: ["Only selling", "Only advertising", "Creating and delivering value to customers", "Only pricing"], correct_answer: 2, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The 4 Ps of marketing are:", category: "business_studies", subcategory: "marketing_mix", options: ["Product, Price, Place, Promotion", "People, Process, Physical, Performance", "Plan, Prepare, Present, Perform", "Profit, People, Planet, Purpose"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "What is a brand?", category: "business_studies", subcategory: "marketing", options: ["Product name only", "Logo only", "Distinctive identity of a product", "Price tag"], correct_answer: 2, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Financial management deals with:", category: "business_studies", subcategory: "financial_management", options: ["Procurement and utilization of funds", "Only accounting", "Only auditing", "Only taxation"], correct_answer: 0, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "What is working capital?", category: "business_studies", subcategory: "financial_management", options: ["Fixed capital", "Current assets minus current liabilities", "Share capital", "Loan capital"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The capital structure refers to:", category: "business_studies", subcategory: "financial_management", options: ["Building structure", "Mix of debt and equity", "Organization structure", "Cost structure"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "What is recruitment?", category: "business_studies", subcategory: "human_resource_management", options: ["Training employees", "Searching for potential employees", "Promoting employees", "Retiring employees"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "Training and development helps in:", category: "business_studies", subcategory: "human_resource_management", options: ["Improving employee skills", "Reducing salary", "Increasing workload", "Decreasing motivation"], correct_answer: 0, difficulty_level: 1, time_limit: 60, scoring_weight: 1.0 },
    { question_text: "What is delegation?", category: "business_studies", subcategory: "organizing", options: ["Giving up authority", "Transferring responsibility and authority", "Taking back authority", "Sharing profits"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "Leadership is:", category: "business_studies", subcategory: "directing", options: ["Giving orders", "Influencing others to achieve goals", "Controlling people", "Managing resources"], correct_answer: 1, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "What is communication?", category: "business_studies", subcategory: "directing", options: ["Only speaking", "Exchange of information and ideas", "Only writing", "Only listening"], correct_answer: 1, difficulty_level: 1, time_limit: 60, scoring_weight: 1.0 },
    { question_text: "The consumer protection act was passed in:", category: "business_studies", subcategory: "consumer_protection", options: ["1986", "1991", "1995", "2000"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "What is social responsibility of business?", category: "business_studies", subcategory: "social_responsibility", options: ["Only profit making", "Obligations towards society", "Only following laws", "Only paying taxes"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "E-business refers to:", category: "business_studies", subcategory: "emerging_modes", options: ["Electronic business transactions", "Energy business", "Entertainment business", "Export business"], correct_answer: 0, difficulty_level: 2, time_limit: 60, scoring_weight: 2.0 },
    { question_text: "What is outsourcing?", category: "business_studies", subcategory: "emerging_modes", options: ["Internal production", "Contracting work to external agencies", "Expanding business", "Closing business"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "The concept of 'Just in Time' relates to:", category: "business_studies", subcategory: "operations_management", options: ["Inventory management", "Time management", "Human resource", "Financial management"], correct_answer: 0, difficulty_level: 3, time_limit: 90, scoring_weight: 3.0 },
    { question_text: "What is quality control?", category: "business_studies", subcategory: "operations_management", options: ["Controlling quantity", "Ensuring products meet standards", "Controlling costs", "Controlling time"], correct_answer: 1, difficulty_level: 2, time_limit: 75, scoring_weight: 2.0 },
    { question_text: "Corporate governance refers to:", category: "business_studies", subcategory: "corporate_governance", options: ["Government control", "System of directing and controlling companies", "Corporate social responsibility", "Corporate finance"], correct_answer: 1, difficulty_level: 3, time_limit: 90, scoring_weight: 3.0 }
  ]
};

async function completeRemainingSubjects() {
  console.log('🚀 Completing Remaining Subjects to Meet 25+ Requirement...\n');
  
  try {
    let totalGenerated = 0;
    
    for (const [subject, questions] of Object.entries(remainingQuestions)) {
      console.log(`📖 Processing ${subject}...`);
      
      // Check current count
      const { data: existing } = await supabase
        .from('quiz_questions')
        .select('*', { count: 'exact', head: true })
        .eq('category', subject)
        .eq('question_type', 'academic');
      
      const currentCount = existing?.length || 0;
      console.log(`  Current: ${currentCount} questions`);
      
      if (currentCount >= 25) {
        console.log(`  ✅ ${subject} already has sufficient questions`);
        continue;
      }
      
      const needed = 25 - currentCount;
      console.log(`  📝 Need ${needed} more questions`);
      
      // Take needed questions
      const questionsToAdd = questions.slice(0, needed).map(q => ({
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
          console.log(`  ❌ Error: ${error.message}`);
        } else {
          console.log(`  ✅ Added ${data?.length || 0} questions`);
          totalGenerated += data?.length || 0;
        }
      }
    }
    
    console.log(`\n🎉 Total new questions generated: ${totalGenerated}`);
    
    // Final verification
    console.log('\n🔍 Final Subject Status:');
    for (const subject of Object.keys(remainingQuestions)) {
      const { data } = await supabase
        .from('quiz_questions')
        .select('*', { count: 'exact', head: true })
        .eq('category', subject)
        .eq('question_type', 'academic');
      
      const count = data?.length || 0;
      const status = count >= 25 ? '✅' : '⚠️';
      console.log(`  ${status} ${subject}: ${count} questions`);
    }
    
  } catch (error) {
    console.error('❌ Completion failed:', error.message);
  }
}

completeRemainingSubjects();