// Mock Supabase client for deployment
export const supabase = {
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: (_credentials: any) => Promise.resolve({ data: { user: null }, error: null }), // eslint-disable-line @typescript-eslint/no-explicit-any
    signInWithOAuth: (_options: any) => Promise.resolve({ data: { user: null }, error: null }), // eslint-disable-line @typescript-eslint/no-explicit-any
    signUp: (_credentials: any) => Promise.resolve({ data: { user: null }, error: null }), // eslint-disable-line @typescript-eslint/no-explicit-any
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: (_callback: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
      data: { subscription: { unsubscribe: () => {} } }
    }),
  },
  channel: (_name: string) => ({
    on: (_event: string, _config: any, _callback: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
      subscribe: () => Promise.resolve({ status: 'SUBSCRIBED' }),
      unsubscribe: () => {}
    }),
  }),
  from: (_table: string) => ({
    select: (_columns?: string) => ({
      eq: (_column: string, _value: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        single: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
    insert: (_data: any) => Promise.resolve({ data: [], error: null }), // eslint-disable-line @typescript-eslint/no-explicit-any
    upsert: (_data: any) => Promise.resolve({ data: [], error: null }), // eslint-disable-line @typescript-eslint/no-explicit-any
    update: (_data: any) => Promise.resolve({ data: [], error: null }), // eslint-disable-line @typescript-eslint/no-explicit-any
    delete: () => Promise.resolve({ data: [], error: null }),
    single: () => Promise.resolve({ data: null, error: null }),
  }),
}