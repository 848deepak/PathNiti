import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { SearchableSelect } from '@/components/ui/searchable-select'

// Mock the useDebounce hook
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: jest.fn((value) => value) // Return value immediately for testing
}))

const mockColleges = [
  {
    id: '1',
    name: 'Harvard University',
    location: { city: 'Cambridge', state: 'Massachusetts' }
  },
  {
    id: '2',
    name: 'Stanford University',
    location: { city: 'Stanford', state: 'California' }
  },
  {
    id: '3',
    name: 'MIT',
    location: { city: 'Cambridge', state: 'Massachusetts' }
  }
]

describe('SearchableSelect Component', () => {
  const defaultProps = {
    options: mockColleges,
    value: '',
    onChange: jest.fn(),
    onSearch: jest.fn(),
    searchQuery: '',
    placeholder: 'Select your college',
    searchPlaceholder: 'Search colleges...'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with placeholder text', () => {
    render(<SearchableSelect {...defaultProps} />)
    expect(screen.getByText('Select your college')).toBeInTheDocument()
  })

  it('opens dropdown when clicked', async () => {
    const user = userEvent.setup()
    render(<SearchableSelect {...defaultProps} />)
    
    const trigger = screen.getByRole('button', { name: /select your college/i })
    await user.click(trigger)
    
    expect(screen.getByPlaceholderText('Search colleges...')).toBeInTheDocument()
  })

  it('displays all options when dropdown is open', async () => {
    const user = userEvent.setup()
    render(<SearchableSelect {...defaultProps} />)
    
    const trigger = screen.getByRole('button', { name: /select your college/i })
    await user.click(trigger)
    
    expect(screen.getByText('Harvard University')).toBeInTheDocument()
    expect(screen.getByText('Stanford University')).toBeInTheDocument()
    expect(screen.getByText('MIT')).toBeInTheDocument()
  })

  it('calls onSearch when typing in search input', async () => {
    const user = userEvent.setup()
    const onSearch = jest.fn()
    render(<SearchableSelect {...defaultProps} onSearch={onSearch} />)
    
    const trigger = screen.getByRole('button', { name: /select your college/i })
    await user.click(trigger)
    
    const searchInput = screen.getByPlaceholderText('Search colleges...')
    await user.type(searchInput, 'H')
    
    // Check that onSearch was called
    expect(onSearch).toHaveBeenCalledWith('H')
  })

  it('calls onChange when option is selected', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<SearchableSelect {...defaultProps} onChange={onChange} />)
    
    const trigger = screen.getByRole('button', { name: /select your college/i })
    await user.click(trigger)
    
    const harvardOption = screen.getByText('Harvard University')
    await user.click(harvardOption)
    
    expect(onChange).toHaveBeenCalledWith('1')
  })

  it('displays selected option in trigger', () => {
    render(<SearchableSelect {...defaultProps} value="1" />)
    expect(screen.getByText('Harvard University - Cambridge, Massachusetts')).toBeInTheDocument()
  })

  it('shows loading state', async () => {
    const user = userEvent.setup()
    render(<SearchableSelect {...defaultProps} loading={true} />)
    
    const trigger = screen.getByRole('button', { name: /select your college/i })
    await user.click(trigger)
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows no results state with register option', async () => {
    const user = userEvent.setup()
    const onRegisterNew = jest.fn()
    render(
      <SearchableSelect 
        {...defaultProps} 
        options={[]} 
        onRegisterNew={onRegisterNew}
        registerNewText="Register New College"
        noResultsText="No colleges found"
      />
    )
    
    const trigger = screen.getByRole('button', { name: /select your college/i })
    await user.click(trigger)
    
    expect(screen.getByText('No colleges found')).toBeInTheDocument()
    
    const registerButton = screen.getByText('Register New College')
    await user.click(registerButton)
    
    expect(onRegisterNew).toHaveBeenCalled()
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    render(<SearchableSelect {...defaultProps} onChange={onChange} />)
    
    const trigger = screen.getByRole('button', { name: /select your college/i })
    
    // Open with Enter key
    await user.type(trigger, '{Enter}')
    expect(screen.getByPlaceholderText('Search colleges...')).toBeInTheDocument()
    
    // Navigate with arrow keys and select with Enter
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    
    expect(onChange).toHaveBeenCalledWith('2') // Stanford University
  })

  it('closes dropdown on Escape key', async () => {
    const user = userEvent.setup()
    render(<SearchableSelect {...defaultProps} />)
    
    const trigger = screen.getByRole('button', { name: /select your college/i })
    await user.click(trigger)
    
    expect(screen.getByPlaceholderText('Search colleges...')).toBeInTheDocument()
    
    await user.keyboard('{Escape}')
    
    expect(screen.queryByPlaceholderText('Search colleges...')).not.toBeInTheDocument()
  })

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup()
    render(
      <div>
        <SearchableSelect {...defaultProps} />
        <div data-testid="outside">Outside element</div>
      </div>
    )
    
    const trigger = screen.getByRole('button', { name: /select your college/i })
    await user.click(trigger)
    
    expect(screen.getByPlaceholderText('Search colleges...')).toBeInTheDocument()
    
    const outsideElement = screen.getByTestId('outside')
    await user.click(outsideElement)
    
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Search colleges...')).not.toBeInTheDocument()
    })
  })

  it('handles register new option in dropdown', async () => {
    const user = userEvent.setup()
    const onRegisterNew = jest.fn()
    render(
      <SearchableSelect 
        {...defaultProps} 
        onRegisterNew={onRegisterNew}
        registerNewText="Register New College"
      />
    )
    
    const trigger = screen.getByRole('button', { name: /select your college/i })
    await user.click(trigger)
    
    const registerOption = screen.getByText('Register New College')
    await user.click(registerOption)
    
    expect(onRegisterNew).toHaveBeenCalled()
  })
})