-- =====================================================
-- PathNiti Database Diagnostic Query
-- Copy and paste this entire query in Supabase SQL Editor
-- =====================================================

-- 1. CHECK EXTENSIONS
SELECT 
    'Extensions' as category,
    extname as name,
    extversion as version,
    'Extension' as type
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'postgis')
ORDER BY extname;

-- 2. CHECK CUSTOM TYPES
SELECT 
    'Custom Types' as category,
    t.typname as name,
    CASE 
        WHEN t.typtype = 'e' THEN 'ENUM'
        ELSE 'TYPE'
    END as type,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
FROM pg_type t
LEFT JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND t.typname IN ('user_role', 'stream_type', 'class_level', 'gender', 'college_type', 'notification_type', 'quiz_status')
GROUP BY t.typname, t.typtype
ORDER BY t.typname;

-- 3. CHECK TABLES
SELECT 
    'Tables' as category,
    schemaname,
    tablename as name,
    'Table' as type,
    CASE 
        WHEN schemaname = 'public' THEN '✅ Public Table'
        WHEN schemaname = 'auth' THEN '🔐 Auth Table'
        ELSE '❓ Other Schema'
    END as status
FROM pg_tables 
WHERE schemaname IN ('public', 'auth')
    AND tablename IN (
        'profiles', 'colleges', 'college_profiles', 'programs', 'scholarships', 
        'admission_deadlines', 'user_favorites', 'notifications', 'user_timeline',
        'quiz_questions', 'quiz_responses', 'quiz_sessions', 'career_pathways',
        'college_plugin_data', 'users'
    )
ORDER BY schemaname, tablename;

-- 4. CHECK TABLE COLUMNS (Key Tables)
SELECT 
    'Table Columns' as category,
    t.table_name as table_name,
    c.column_name as column_name,
    c.data_type as data_type,
    c.is_nullable as nullable,
    c.column_default as default_value,
    CASE 
        WHEN c.column_name = 'id' AND c.data_type = 'uuid' THEN '✅ Primary Key'
        WHEN c.column_name = 'role' AND c.data_type = 'USER-DEFINED' THEN '✅ Role Column'
        WHEN c.column_name LIKE '%_id' AND c.data_type = 'uuid' THEN '🔗 Foreign Key'
        ELSE '📝 Regular Column'
    END as column_type
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
    AND t.table_name IN ('profiles', 'colleges', 'college_profiles', 'programs')
ORDER BY t.table_name, c.ordinal_position;

-- 5. CHECK ROW LEVEL SECURITY STATUS
SELECT 
    'RLS Status' as category,
    schemaname,
    tablename as name,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
    AND tablename IN (
        'profiles', 'colleges', 'college_profiles', 'programs', 'scholarships', 
        'admission_deadlines', 'user_favorites', 'notifications', 'user_timeline',
        'quiz_responses', 'quiz_sessions'
    )
ORDER BY tablename;

-- 6. CHECK RLS POLICIES
SELECT 
    'RLS Policies' as category,
    schemaname,
    tablename as table_name,
    policyname as policy_name,
    permissive as is_permissive,
    roles as roles,
    cmd as command,
    CASE 
        WHEN cmd = 'SELECT' THEN '👁️ Read'
        WHEN cmd = 'INSERT' THEN '➕ Create'
        WHEN cmd = 'UPDATE' THEN '✏️ Update'
        WHEN cmd = 'DELETE' THEN '🗑️ Delete'
        WHEN cmd = 'ALL' THEN '🔄 All Operations'
        ELSE '❓ Other'
    END as operation,
    CASE 
        WHEN policyname LIKE '%own%' THEN '👤 Own Data'
        WHEN policyname LIKE '%admin%' THEN '👑 Admin Access'
        WHEN policyname LIKE '%authenticated%' THEN '🔐 Authenticated Users'
        WHEN policyname LIKE '%public%' THEN '🌐 Public Access'
        ELSE '❓ Custom Policy'
    END as policy_type
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN (
        'profiles', 'colleges', 'college_profiles', 'programs', 'scholarships', 
        'admission_deadlines', 'user_favorites', 'notifications', 'user_timeline',
        'quiz_responses', 'quiz_sessions'
    )
ORDER BY tablename, policyname;

-- 7. CHECK INDEXES
SELECT 
    'Indexes' as category,
    schemaname,
    tablename as table_name,
    indexname as index_name,
    indexdef as definition,
    CASE 
        WHEN indexname LIKE 'idx_%' THEN '✅ Custom Index'
        WHEN indexname LIKE '%_pkey' THEN '🔑 Primary Key'
        WHEN indexname LIKE '%_fkey' THEN '🔗 Foreign Key'
        ELSE '❓ Other Index'
    END as index_type
FROM pg_indexes 
WHERE schemaname = 'public'
    AND tablename IN (
        'profiles', 'colleges', 'college_profiles', 'programs', 'scholarships', 
        'admission_deadlines', 'user_favorites', 'notifications', 'user_timeline',
        'quiz_responses', 'quiz_sessions'
    )
ORDER BY tablename, indexname;

-- 8. CHECK TRIGGERS
SELECT 
    'Triggers' as category,
    schemaname,
    tablename as table_name,
    triggername as trigger_name,
    CASE 
        WHEN triggername LIKE '%updated_at%' THEN '⏰ Timestamp Update'
        ELSE '❓ Other Trigger'
    END as trigger_type
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
    AND c.relname IN (
        'profiles', 'colleges', 'college_profiles', 'programs', 'scholarships', 
        'admission_deadlines', 'user_favorites', 'notifications', 'user_timeline',
        'quiz_responses', 'quiz_sessions'
    )
    AND NOT t.tgisinternal
ORDER BY c.relname, t.tgname;

-- 9. CHECK FUNCTIONS
SELECT 
    'Functions' as category,
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments,
    CASE 
        WHEN p.proname = 'update_updated_at_column' THEN '✅ Timestamp Function'
        ELSE '❓ Other Function'
    END as function_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.proname IN ('update_updated_at_column')
ORDER BY p.proname;

-- 10. CHECK SAMPLE DATA (if any exists)
SELECT 
    'Sample Data' as category,
    'profiles' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
    COUNT(CASE WHEN role = 'college' THEN 1 END) as colleges
FROM public.profiles
UNION ALL
SELECT 
    'Sample Data' as category,
    'colleges' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN is_verified = true THEN 1 END) as verified,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active,
    0 as other
FROM public.colleges
UNION ALL
SELECT 
    'Sample Data' as category,
    'college_profiles' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN is_verified = true THEN 1 END) as verified,
    0 as other1,
    0 as other2
FROM public.college_profiles;

-- 11. SUMMARY REPORT
SELECT 
    'SUMMARY' as category,
    'Database Setup Status' as item,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_extension WHERE extname IN ('uuid-ossp', 'postgis')) = 2 
        THEN '✅ Extensions OK'
        ELSE '❌ Missing Extensions'
    END as status,
    'Check extensions above' as details
UNION ALL
SELECT 
    'SUMMARY' as category,
    'Custom Types' as item,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_type WHERE typname IN ('user_role', 'stream_type', 'class_level', 'gender', 'college_type', 'notification_type', 'quiz_status')) = 7
        THEN '✅ Types OK'
        ELSE '❌ Missing Types'
    END as status,
    'Check custom types above' as details
UNION ALL
SELECT 
    'SUMMARY' as category,
    'Core Tables' as item,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('profiles', 'colleges', 'college_profiles', 'programs')) = 4
        THEN '✅ Tables OK'
        ELSE '❌ Missing Tables'
    END as status,
    'Check tables above' as details
UNION ALL
SELECT 
    'SUMMARY' as category,
    'RLS Policies' as item,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles') >= 4
        THEN '✅ Profiles RLS OK'
        ELSE '❌ Profiles RLS Missing'
    END as status,
    'Check RLS policies above' as details
UNION ALL
SELECT 
    'SUMMARY' as category,
    'College Profiles RLS' as item,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'college_profiles') >= 4
        THEN '✅ College RLS OK'
        ELSE '❌ College RLS Missing'
    END as status,
    'Check college RLS policies above' as details;



