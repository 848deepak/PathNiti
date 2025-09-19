/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/colleges/admin/notices/route';
import { PUT, DELETE } from '@/app/api/colleges/admin/notices/[id]/route';

// Mock Supabase
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        order: jest.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(),
    })),
  })),
};

jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => mockSupabaseClient),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('/api/colleges/admin/notices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const request = new NextRequest('http://localhost:3000/api/colleges/admin/notices');
      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 403 if user is not a college admin', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          })),
        })),
      });

      const request = new NextRequest('http://localhost:3000/api/colleges/admin/notices');
      const response = await GET(request);

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('Forbidden');
    });

    it('should return notices for authenticated college admin', async () => {
      const mockNotices = [
        {
          id: '1',
          title: 'Test Notice',
          content: 'Test content',
          type: 'general',
          is_active: true,
          published_at: '2024-01-15T10:00:00Z',
        },
      ];

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: { college_id: 'college-id' },
                error: null,
              }),
            })),
          })),
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                data: mockNotices,
                error: null,
              })),
            })),
          })),
        });

      const request = new NextRequest('http://localhost:3000/api/colleges/admin/notices');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.notices).toEqual(mockNotices);
    });
  });

  describe('POST', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      const request = new NextRequest('http://localhost:3000/api/colleges/admin/notices', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Notice',
          content: 'Test content',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 if required fields are missing', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { college_id: 'college-id' },
              error: null,
            }),
          })),
        })),
      });

      const request = new NextRequest('http://localhost:3000/api/colleges/admin/notices', {
        method: 'POST',
        body: JSON.stringify({
          title: '', // Empty title
          content: 'Test content',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Title and content are required');
    });

    it('should create notice successfully', async () => {
      const mockNotice = {
        id: '1',
        title: 'Test Notice',
        content: 'Test content',
        type: 'general',
        is_active: true,
        published_at: '2024-01-15T10:00:00Z',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: { college_id: 'college-id' },
                error: null,
              }),
            })),
          })),
        })
        .mockReturnValueOnce({
          insert: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: mockNotice,
                error: null,
              }),
            })),
          })),
        });

      const request = new NextRequest('http://localhost:3000/api/colleges/admin/notices', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Notice',
          content: 'Test content',
          type: 'general',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.notice).toEqual(mockNotice);
    });
  });
});

describe('/api/colleges/admin/notices/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT', () => {
    it('should update notice successfully', async () => {
      const mockNotice = {
        id: '1',
        title: 'Updated Notice',
        content: 'Updated content',
        type: 'general',
        is_active: true,
        published_at: '2024-01-15T10:00:00Z',
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: { college_id: 'college-id' },
                error: null,
              }),
            })),
          })),
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: { college_id: 'college-id' },
                error: null,
              }),
            })),
          })),
        })
        .mockReturnValueOnce({
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn().mockResolvedValue({
                  data: mockNotice,
                  error: null,
                }),
              })),
            })),
          })),
        });

      const request = new NextRequest('http://localhost:3000/api/colleges/admin/notices/1', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated Notice',
          content: 'Updated content',
        }),
      });

      const response = await PUT(request, { params: { id: '1' } });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.notice).toEqual(mockNotice);
    });
  });

  describe('DELETE', () => {
    it('should delete notice successfully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      mockSupabaseClient.from
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: { college_id: 'college-id' },
                error: null,
              }),
            })),
          })),
        })
        .mockReturnValueOnce({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: { college_id: 'college-id' },
                error: null,
              }),
            })),
          })),
        })
        .mockReturnValueOnce({
          delete: jest.fn(() => ({
            eq: jest.fn().mockResolvedValue({
              error: null,
            }),
          })),
        });

      const request = new NextRequest('http://localhost:3000/api/colleges/admin/notices/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: '1' } });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.message).toBe('Notice deleted successfully');
    });
  });
});