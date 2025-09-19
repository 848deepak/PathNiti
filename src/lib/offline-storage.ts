/**
 * Offline Storage System for PathNiti
 * Provides IndexedDB-based offline storage for quiz responses, user data, and cached content
 */

export interface OfflineQuizResponse {
  id: string;
  session_id: string;
  question_id: string;
  user_answer: number;
  time_taken: number;
  is_correct?: boolean;
  answered_at: string;
  synced: boolean;
  created_at: string;
}

export interface OfflineAssessmentSession {
  id: string;
  user_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  started_at?: string;
  completed_at?: string;
  aptitude_scores?: Record<string, number>;
  riasec_scores?: Record<string, number>;
  personality_scores?: Record<string, number>;
  subject_performance?: Record<string, { accuracy: number; speed: number }>;
  practical_constraints?: Record<string, string>;
  total_score: number;
  total_questions: number;
  answered_questions: number;
  time_spent: number;
  session_type: string;
  synced: boolean;
  created_at: string;
}

export interface OfflineCollege {
  id: string;
  name: string;
  type: string;
  location: {
    state: string;
    city: string;
    pincode?: string;
    coordinates?: { lat: number; lng: number };
  };
  address: string;
  website?: string;
  phone?: string;
  email?: string;
  established_year?: number;
  accreditation?: string;
  facilities?: string[];
  programs?: Array<{
    name: string;
    stream: string;
    level: string;
    duration: string;
    eligibility: string;
    fees: string;
  }>;
  is_active: boolean;
  cached_at: string;
  last_synced: string;
}

export interface OfflineScholarship {
  id: string;
  name: string;
  description: string;
  amount: string;
  eligibility_criteria: string;
  application_deadline: string;
  application_process: string;
  contact_info: string;
  is_active: boolean;
  cached_at: string;
  last_synced: string;
}

export interface OfflineAwarenessContent {
  id: string;
  title: string;
  content: string;
  type: 'infographic' | 'faq' | 'career_guide' | 'government_update';
  category: string;
  tags: string[];
  media_url?: string;
  created_at: string;
  cached_at: string;
}

export interface OfflineChatMessage {
  id: string;
  session_id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    capability_used?: string;
    confidence_score?: number;
    processing_time_ms?: number;
    is_offline_response?: boolean;
  };
  synced: boolean;
}

export interface OfflineUserProfile {
  id: string;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  class_level?: string;
  stream?: string;
  location?: any;
  interests?: string[];
  avatar_url?: string;
  role: string;
  is_verified: boolean;
  last_synced: string;
  pending_updates: boolean;
}

class OfflineStorageManager {
  private dbName = 'PathNitiOfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores(db);
      };
    });
  }

  private createObjectStores(db: IDBDatabase): void {
    // Quiz responses store
    if (!db.objectStoreNames.contains('quiz_responses')) {
      const quizStore = db.createObjectStore('quiz_responses', { keyPath: 'id' });
      quizStore.createIndex('session_id', 'session_id', { unique: false });
      quizStore.createIndex('synced', 'synced', { unique: false });
      quizStore.createIndex('created_at', 'created_at', { unique: false });
    }

    // Assessment sessions store
    if (!db.objectStoreNames.contains('assessment_sessions')) {
      const sessionStore = db.createObjectStore('assessment_sessions', { keyPath: 'id' });
      sessionStore.createIndex('user_id', 'user_id', { unique: false });
      sessionStore.createIndex('status', 'status', { unique: false });
      sessionStore.createIndex('synced', 'synced', { unique: false });
    }

    // Colleges cache store
    if (!db.objectStoreNames.contains('colleges_cache')) {
      const collegeStore = db.createObjectStore('colleges_cache', { keyPath: 'id' });
      collegeStore.createIndex('type', 'type', { unique: false });
      collegeStore.createIndex('location_state', 'location.state', { unique: false });
      collegeStore.createIndex('last_synced', 'last_synced', { unique: false });
    }

    // Scholarships cache store
    if (!db.objectStoreNames.contains('scholarships_cache')) {
      const scholarshipStore = db.createObjectStore('scholarships_cache', { keyPath: 'id' });
      scholarshipStore.createIndex('is_active', 'is_active', { unique: false });
      scholarshipStore.createIndex('last_synced', 'last_synced', { unique: false });
    }

    // Awareness content store
    if (!db.objectStoreNames.contains('awareness_content')) {
      const contentStore = db.createObjectStore('awareness_content', { keyPath: 'id' });
      contentStore.createIndex('type', 'type', { unique: false });
      contentStore.createIndex('category', 'category', { unique: false });
      contentStore.createIndex('cached_at', 'cached_at', { unique: false });
    }

    // Chat messages store
    if (!db.objectStoreNames.contains('chat_messages')) {
      const chatStore = db.createObjectStore('chat_messages', { keyPath: 'id' });
      chatStore.createIndex('session_id', 'session_id', { unique: false });
      chatStore.createIndex('timestamp', 'timestamp', { unique: false });
      chatStore.createIndex('synced', 'synced', { unique: false });
    }

    // User profile store
    if (!db.objectStoreNames.contains('user_profile')) {
      const profileStore = db.createObjectStore('user_profile', { keyPath: 'id' });
      profileStore.createIndex('email', 'email', { unique: true });
      profileStore.createIndex('pending_updates', 'pending_updates', { unique: false });
    }

    // Sync queue store
    if (!db.objectStoreNames.contains('sync_queue')) {
      const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      syncStore.createIndex('type', 'type', { unique: false });
      syncStore.createIndex('priority', 'priority', { unique: false });
      syncStore.createIndex('created_at', 'created_at', { unique: false });
    }
  }

  // Quiz Response Methods
  async saveQuizResponse(response: Omit<OfflineQuizResponse, 'id' | 'synced' | 'created_at'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const quizResponse: OfflineQuizResponse = {
      ...response,
      id,
      synced: false,
      created_at: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['quiz_responses'], 'readwrite');
      const store = transaction.objectStore('quiz_responses');
      const request = store.add(quizResponse);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getQuizResponses(sessionId: string): Promise<OfflineQuizResponse[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['quiz_responses'], 'readonly');
      const store = transaction.objectStore('quiz_responses');
      const index = store.index('session_id');
      const request = index.getAll(sessionId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedQuizResponses(): Promise<OfflineQuizResponse[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['quiz_responses'], 'readonly');
      const store = transaction.objectStore('quiz_responses');
      const index = store.index('synced');
      const request = index.getAll(false);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async markQuizResponseSynced(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['quiz_responses'], 'readwrite');
      const store = transaction.objectStore('quiz_responses');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const response = getRequest.result;
        if (response) {
          response.synced = true;
          const putRequest = store.put(response);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Quiz response not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Assessment Session Methods
  async saveAssessmentSession(session: Omit<OfflineAssessmentSession, 'id' | 'synced' | 'created_at'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const assessmentSession: OfflineAssessmentSession = {
      ...session,
      id,
      synced: false,
      created_at: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assessment_sessions'], 'readwrite');
      const store = transaction.objectStore('assessment_sessions');
      const request = store.add(assessmentSession);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async updateAssessmentSession(id: string, updates: Partial<OfflineAssessmentSession>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assessment_sessions'], 'readwrite');
      const store = transaction.objectStore('assessment_sessions');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const session = getRequest.result;
        if (session) {
          const updatedSession = { ...session, ...updates };
          const putRequest = store.put(updatedSession);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          reject(new Error('Assessment session not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getAssessmentSession(id: string): Promise<OfflineAssessmentSession | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assessment_sessions'], 'readonly');
      const store = transaction.objectStore('assessment_sessions');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedAssessmentSessions(): Promise<OfflineAssessmentSession[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['assessment_sessions'], 'readonly');
      const store = transaction.objectStore('assessment_sessions');
      const index = store.index('synced');
      const request = index.getAll(false);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // College Cache Methods
  async cacheColleges(colleges: OfflineCollege[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['colleges_cache'], 'readwrite');
      const store = transaction.objectStore('colleges_cache');
      
      const requests = colleges.map(college => store.put(college));
      let completed = 0;
      let hasError = false;

      requests.forEach(request => {
        request.onsuccess = () => {
          completed++;
          if (completed === requests.length && !hasError) {
            resolve();
          }
        };
        request.onerror = () => {
          hasError = true;
          reject(request.error);
        };
      });
    });
  }

  async getCachedColleges(filters?: {
    state?: string;
    type?: string;
    limit?: number;
  }): Promise<OfflineCollege[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['colleges_cache'], 'readonly');
      const store = transaction.objectStore('colleges_cache');
      const request = store.getAll();

      request.onsuccess = () => {
        let colleges = request.result || [];

        // Apply filters
        if (filters?.state) {
          colleges = colleges.filter(college => college.location?.state === filters.state);
        }
        if (filters?.type) {
          colleges = colleges.filter(college => college.type === filters.type);
        }
        if (filters?.limit) {
          colleges = colleges.slice(0, filters.limit);
        }

        resolve(colleges);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Scholarship Cache Methods
  async cacheScholarships(scholarships: OfflineScholarship[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scholarships_cache'], 'readwrite');
      const store = transaction.objectStore('scholarships_cache');
      
      const requests = scholarships.map(scholarship => store.put(scholarship));
      let completed = 0;
      let hasError = false;

      requests.forEach(request => {
        request.onsuccess = () => {
          completed++;
          if (completed === requests.length && !hasError) {
            resolve();
          }
        };
        request.onerror = () => {
          hasError = true;
          reject(request.error);
        };
      });
    });
  }

  async getCachedScholarships(): Promise<OfflineScholarship[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scholarships_cache'], 'readonly');
      const store = transaction.objectStore('scholarships_cache');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Awareness Content Methods
  async cacheAwarenessContent(content: OfflineAwarenessContent[]): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['awareness_content'], 'readwrite');
      const store = transaction.objectStore('awareness_content');
      
      const requests = content.map(item => store.put(item));
      let completed = 0;
      let hasError = false;

      requests.forEach(request => {
        request.onsuccess = () => {
          completed++;
          if (completed === requests.length && !hasError) {
            resolve();
          }
        };
        request.onerror = () => {
          hasError = true;
          reject(request.error);
        };
      });
    });
  }

  async getCachedAwarenessContent(type?: string, category?: string): Promise<OfflineAwarenessContent[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['awareness_content'], 'readonly');
      const store = transaction.objectStore('awareness_content');
      const request = store.getAll();

      request.onsuccess = () => {
        let content = request.result || [];

        if (type) {
          content = content.filter(item => item.type === type);
        }
        if (category) {
          content = content.filter(item => item.category === category);
        }

        resolve(content);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Chat Message Methods
  async saveChatMessage(message: Omit<OfflineChatMessage, 'id' | 'synced'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const chatMessage: OfflineChatMessage = {
      ...message,
      id,
      synced: false,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chat_messages'], 'readwrite');
      const store = transaction.objectStore('chat_messages');
      const request = store.add(chatMessage);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  async getChatMessages(sessionId: string): Promise<OfflineChatMessage[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['chat_messages'], 'readonly');
      const store = transaction.objectStore('chat_messages');
      const index = store.index('session_id');
      const request = index.getAll(sessionId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // User Profile Methods
  async saveUserProfile(profile: OfflineUserProfile): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['user_profile'], 'readwrite');
      const store = transaction.objectStore('user_profile');
      const request = store.put(profile);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getUserProfile(): Promise<OfflineUserProfile | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['user_profile'], 'readonly');
      const store = transaction.objectStore('user_profile');
      const request = store.getAll();

      request.onsuccess = () => {
        const profiles = request.result || [];
        resolve(profiles.length > 0 ? profiles[0] : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Sync Queue Methods
  async addToSyncQueue(type: string, data: any, priority: number = 1): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const syncItem = {
      type,
      data,
      priority,
      created_at: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.add(syncItem);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSyncQueue(): Promise<Array<{ id: number; type: string; data: any; priority: number; created_at: string }>> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readonly');
      const store = transaction.objectStore('sync_queue');
      const request = store.getAll();

      request.onsuccess = () => {
        const items = request.result || [];
        // Sort by priority (higher first) and then by created_at
        items.sort((a, b) => {
          if (a.priority !== b.priority) {
            return b.priority - a.priority;
          }
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async removeFromSyncQueue(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['sync_queue'], 'readwrite');
      const store = transaction.objectStore('sync_queue');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Utility Methods
  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const storeNames = [
      'quiz_responses',
      'assessment_sessions',
      'colleges_cache',
      'scholarships_cache',
      'awareness_content',
      'chat_messages',
      'user_profile',
      'sync_queue'
    ];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeNames, 'readwrite');
      let completed = 0;
      let hasError = false;

      storeNames.forEach(storeName => {
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => {
          completed++;
          if (completed === storeNames.length && !hasError) {
            resolve();
          }
        };
        request.onerror = () => {
          hasError = true;
          reject(request.error);
        };
      });
    });
  }

  async getStorageStats(): Promise<{
    quizResponses: number;
    assessmentSessions: number;
    cachedColleges: number;
    cachedScholarships: number;
    awarenessContent: number;
    chatMessages: number;
    syncQueueItems: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const storeNames = [
      'quiz_responses',
      'assessment_sessions',
      'colleges_cache',
      'scholarships_cache',
      'awareness_content',
      'chat_messages',
      'sync_queue'
    ];

    const stats: any = {};

    for (const storeName of storeNames) {
      const count = await new Promise<number>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.count();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const key = storeName.replace('_', '') + (storeName === 'sync_queue' ? 'Items' : '');
      stats[key] = count;
    }

    return stats;
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageManager();

// Initialize on module load
if (typeof window !== 'undefined') {
  offlineStorage.initialize().catch(console.error);
}
