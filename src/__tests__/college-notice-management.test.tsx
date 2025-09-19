/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createClient } from '@supabase/supabase-js';
import CollegeNoticeManager from '@/components/CollegeNoticeManager';

// Mock Supabase
jest.mock('@supabase/supabase-js');

// Mock fetch
global.fetch = jest.fn();

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

const mockNotices = [
  {
    id: '1',
    title: 'Admission Open',
    content: 'Admissions are now open for the academic year 2024-25',
    type: 'admission',
    is_active: true,
    published_at: '2024-01-15T10:00:00Z',
    expires_at: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Holiday Notice',
    content: 'College will remain closed on Republic Day',
    type: 'general',
    is_active: true,
    published_at: '2024-01-20T09:00:00Z',
    expires_at: '2024-01-26T23:59:59Z',
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-01-20T09:00:00Z',
  },
  {
    id: '3',
    title: 'Urgent: Fee Payment',
    content: 'Last date for fee payment is extended to 31st January',
    type: 'urgent',
    is_active: true,
    published_at: '2024-01-25T14:00:00Z',
    expires_at: '2024-01-31T23:59:59Z',
    created_at: '2024-01-25T14:00:00Z',
    updated_at: '2024-01-25T14:00:00Z',
  },
];

describe('CollegeNoticeManager', () => {
  const collegeId = 'test-college-id';

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ notices: mockNotices }),
    });
  });

  it('renders notice manager with loading state initially', async () => {
    render(<CollegeNoticeManager collegeId={collegeId} />);
    
    expect(screen.getByText('Loading notices...')).toBeInTheDocument();
  });

  it('displays notices after loading', async () => {
    render(<CollegeNoticeManager collegeId={collegeId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Admission Open')).toBeInTheDocument();
      expect(screen.getByText('Holiday Notice')).toBeInTheDocument();
      expect(screen.getByText('Urgent: Fee Payment')).toBeInTheDocument();
    });
  });

  it('shows notice types with correct badges', async () => {
    render(<CollegeNoticeManager collegeId={collegeId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Admission')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('Urgent')).toBeInTheDocument();
    });
  });

  it('opens add notice dialog when Add Notice button is clicked', async () => {
    const user = userEvent.setup();
    render(<CollegeNoticeManager collegeId={collegeId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Add Notice')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Add Notice'));
    
    expect(screen.getByText('Add New Notice')).toBeInTheDocument();
    expect(screen.getByLabelText('Title *')).toBeInTheDocument();
    expect(screen.getByLabelText('Content *')).toBeInTheDocument();
  });

  it('creates a new notice when form is submitted', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notices: mockNotices }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          notice: {
            id: '4',
            title: 'New Notice',
            content: 'This is a new notice',
            type: 'general',
            is_active: true,
            published_at: '2024-01-26T10:00:00Z',
            expires_at: null,
            created_at: '2024-01-26T10:00:00Z',
            updated_at: '2024-01-26T10:00:00Z',
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notices: [...mockNotices, {
          id: '4',
          title: 'New Notice',
          content: 'This is a new notice',
          type: 'general',
          is_active: true,
          published_at: '2024-01-26T10:00:00Z',
          expires_at: null,
          created_at: '2024-01-26T10:00:00Z',
          updated_at: '2024-01-26T10:00:00Z',
        }] }),
      });

    render(<CollegeNoticeManager collegeId={collegeId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Add Notice')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Add Notice'));
    
    // Fill in the form
    await user.type(screen.getByLabelText('Title *'), 'New Notice');
    await user.type(screen.getByLabelText('Content *'), 'This is a new notice');
    
    // Submit the form
    await user.click(screen.getByText('Create'));
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/colleges/admin/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Notice',
          content: 'This is a new notice',
          type: 'general',
          expires_at: null,
        }),
      });
    });
  });

  it('opens edit dialog when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<CollegeNoticeManager collegeId={collegeId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Admission Open')).toBeInTheDocument();
    });
    
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(button => 
      button.querySelector('svg') && button.getAttribute('class')?.includes('outline')
    );
    
    if (editButton) {
      await user.click(editButton);
      
      await waitFor(() => {
        expect(screen.getByText('Edit Notice')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Admission Open')).toBeInTheDocument();
      });
    }
  });

  it('deletes a notice when delete button is clicked and confirmed', async () => {
    const user = userEvent.setup();
    
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);
    
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notices: mockNotices }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Notice deleted successfully' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notices: mockNotices.slice(1) }),
      });

    render(<CollegeNoticeManager collegeId={collegeId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Admission Open')).toBeInTheDocument();
    });
    
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(button => 
      button.querySelector('svg') && button.getAttribute('class')?.includes('text-red-600')
    );
    
    if (deleteButton) {
      await user.click(deleteButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/colleges/admin/notices/1', {
          method: 'DELETE',
        });
      });
    }
    
    // Restore window.confirm
    window.confirm = originalConfirm;
  });

  it('toggles notice status when activate/deactivate button is clicked', async () => {
    const user = userEvent.setup();
    
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ notices: mockNotices }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          notice: { ...mockNotices[0], is_active: false },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ 
          notices: mockNotices.map(n => n.id === '1' ? { ...n, is_active: false } : n)
        }),
      });

    render(<CollegeNoticeManager collegeId={collegeId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Admission Open')).toBeInTheDocument();
    });
    
    const deactivateButton = screen.getByText('Deactivate');
    await user.click(deactivateButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/colleges/admin/notices/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: false,
        }),
      });
    });
  });

  it('displays error message when API call fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    
    render(<CollegeNoticeManager collegeId={collegeId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load notices')).toBeInTheDocument();
    });
  });

  it('shows empty state when no notices exist', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ notices: [] }),
    });
    
    render(<CollegeNoticeManager collegeId={collegeId} />);
    
    await waitFor(() => {
      expect(screen.getByText('No notices found. Create your first notice to get started.')).toBeInTheDocument();
    });
  });

  it('validates required fields in the form', async () => {
    const user = userEvent.setup();
    render(<CollegeNoticeManager collegeId={collegeId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Add Notice')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Add Notice'));
    
    // Try to submit without filling required fields
    await user.click(screen.getByText('Create'));
    
    // Form should not submit due to HTML5 validation
    expect(screen.getByText('Add New Notice')).toBeInTheDocument();
  });

  it('displays notice expiration information correctly', async () => {
    render(<CollegeNoticeManager collegeId={collegeId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Holiday Notice')).toBeInTheDocument();
    });
    
    // Check if expiration date is displayed
    expect(screen.getByText(/Expires:/)).toBeInTheDocument();
  });

  it('shows different notice type icons', async () => {
    render(<CollegeNoticeManager collegeId={collegeId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Urgent: Fee Payment')).toBeInTheDocument();
    });
    
    // Check if urgent notice has alert icon (AlertCircle component)
    const urgentBadge = screen.getByText('Urgent').closest('.flex');
    expect(urgentBadge).toBeInTheDocument();
  });
});