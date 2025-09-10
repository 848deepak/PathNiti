// Mock Supabase client for deployment
export const supabase = {
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: (..._args: unknown[]) => Promise.resolve({ data: { user: null }, error: null }), // eslint-disable-line @typescript-eslint/no-unused-vars
    signInWithOAuth: (..._args: unknown[]) => Promise.resolve({ data: { user: null }, error: null }), // eslint-disable-line @typescript-eslint/no-unused-vars
    signUp: (..._args: unknown[]) => Promise.resolve({ data: { user: null }, error: null }), // eslint-disable-line @typescript-eslint/no-unused-vars
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: (..._args: unknown[]) => ({ // eslint-disable-line @typescript-eslint/no-unused-vars
      data: { subscription: { unsubscribe: () => {} } }
    }),
  },
  channel: (..._args: unknown[]) => ({ // eslint-disable-line @typescript-eslint/no-unused-vars
    on: (..._args: unknown[]) => ({ // eslint-disable-line @typescript-eslint/no-unused-vars
      subscribe: () => Promise.resolve({ status: 'SUBSCRIBED' }),
      unsubscribe: () => {}
    }),
  }),
  from: (..._args: unknown[]) => ({ // eslint-disable-line @typescript-eslint/no-unused-vars
    select: (..._args: unknown[]) => ({ // eslint-disable-line @typescript-eslint/no-unused-vars
      eq: (..._args: unknown[]) => ({ // eslint-disable-line @typescript-eslint/no-unused-vars
        single: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
    insert: (..._args: unknown[]) => Promise.resolve({ data: [], error: null }), // eslint-disable-line @typescript-eslint/no-unused-vars
    upsert: (..._args: unknown[]) => Promise.resolve({ data: [], error: null }), // eslint-disable-line @typescript-eslint/no-unused-vars
    update: (..._args: unknown[]) => Promise.resolve({ data: [], error: null }), // eslint-disable-line @typescript-eslint/no-unused-vars
    delete: () => Promise.resolve({ data: [], error: null }),
    single: () => Promise.resolve({ data: null, error: null }),
  }),
}