/**
 * Comprehensive tests for error handling and validation implementation
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock Next.js dependencies
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn()
  })
}))

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      headers: new Map()
    }))
  }
}))

// Mock global Request and Response
global.Request = jest.fn() as any
global.Response = jest.fn() as any

import { APIValidator, ValidationSchemas } from '@/lib/utils/api-validation'
import { APIErrorHandler } from '@/lib/utils/api-error-handling'
import { useEnhancedFormValidation, ValidationRules } from '@/hooks/useEnhancedFormValidation'
import { EnhancedForm } from '@/components/EnhancedForm'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingButton, OperationStatus, DataLoadingState } from '@/components/ui/loading-states'
import { FormErrorDisplay, FieldError } from '@/components/ui/form-error-display'

describe('API Validation', () => {
  describe('APIValidator', () => {
    it('should validate required fields correctly', () => {
      const schema = {
        name: { required: true, type: 'string' as const },
        email: { required: true, type: 'email' as const }
      }

      const validData = { name: 'John Doe', email: 'john@example.com' }
      const invalidData = { name: '', email: 'invalid-email' }

      const validResult = APIValidator.validateData(validData, schema)
      const invalidResult = APIValidator.validateData(invalidData, schema)

      expect(validResult.isValid).toBe(true)
      expect(invalidResult.isValid).toBe(false)
      expect(invalidResult.errors.name).toBe('name is required')
      expect(invalidResult.errors.email).toBe('email must be a valid email address')
    })

    it('should sanitize data correctly', () => {
      const schema = {
        name: { required: true, type: 'string' as const, maxLength: 10 }
      }

      const data = { name: '  John Doe  ' }
      const result = APIValidator.validateData(data, schema)

      expect(result.isValid).toBe(true)
      expect(result.sanitizedData.name).toBe('John Doe')
    })

    it('should validate college registration schema', () => {
      const validData = {
        name: 'Test College',
        type: 'private',
        location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
        address: '123 Test Street, Mumbai',
        email: 'test@college.edu',
        established_year: 2000
      }

      const result = APIValidator.validateData(validData, ValidationSchemas.collegeRegistration)
      expect(result.isValid).toBe(true)
    })

    it('should validate student application schema', () => {
      const validData = {
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        class_stream: 'Science',
        documents: {
          marksheet_10th: 'url1',
          marksheet_12th: 'url2'
        }
      }

      const result = APIValidator.validateData(validData, ValidationSchemas.studentApplication)
      expect(result.isValid).toBe(true)
    })

    it('should validate file uploads', () => {
      const validFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const invalidFile = new File(['content'], 'test.exe', { type: 'application/exe' })

      const validResult = APIValidator.validateFileUpload(validFile)
      const invalidResult = APIValidator.validateFileUpload(invalidFile)

      expect(validResult.isValid).toBe(true)
      expect(invalidResult.isValid).toBe(false)
      expect(invalidResult.error).toContain('File type not allowed')
    })
  })
})

describe('API Error Handling', () => {
  describe('APIErrorHandler', () => {
    it('should create standardized error responses', () => {
      const response = APIErrorHandler.createErrorResponse('Test error', 400)
      expect(response.status).toBe(400)
    })

    it('should create validation error responses', () => {
      const errors = { name: 'Name is required', email: 'Invalid email' }
      const response = APIErrorHandler.createValidationErrorResponse(errors)
      expect(response.status).toBe(400)
    })

    it('should parse Supabase errors correctly', () => {
      const supabaseError = { code: '23505', message: 'duplicate key value' }
      const parsed = APIErrorHandler.parseSupabaseError(supabaseError)
      
      expect(parsed.code).toBe('DUPLICATE_RESOURCE')
      expect(parsed.statusCode).toBe(409)
    })

    it('should create user-friendly error messages', () => {
      const error = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        statusCode: 400,
        timestamp: new Date().toISOString()
      }

      const friendlyMessage = APIErrorHandler.createUserFriendlyMessage(error)
      expect(friendlyMessage).toBe('Please check your input and try again.')
    })
  })
})

describe('Enhanced Form Validation Hook', () => {
  const TestComponent = ({ schema, onSubmit }: any) => {
    const {
      formState,
      submissionState,
      isFormValid,
      updateField,
      submitForm,
      getFieldProps,
      getFieldError
    } = useEnhancedFormValidation({
      schema,
      initialValues: {}
    })

    return (
      <form onSubmit={(e) => { e.preventDefault(); submitForm(onSubmit) }}>
        <input
          data-testid="name-input"
          {...getFieldProps('name')}
        />
        {getFieldError('name') && (
          <span data-testid="name-error">{getFieldError('name')}</span>
        )}
        <button 
          type="submit" 
          disabled={!isFormValid || submissionState.isSubmitting}
          data-testid="submit-button"
        >
          {submissionState.isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
        {submissionState.submitError && (
          <span data-testid="submit-error">{submissionState.submitError}</span>
        )}
      </form>
    )
  }

  it('should validate fields in real-time', async () => {
    const schema = {
      name: ValidationRules.required
    }

    const mockSubmit = jest.fn().mockResolvedValue({})

    render(<TestComponent schema={schema} onSubmit={mockSubmit} />)

    const input = screen.getByTestId('name-input')
    const submitButton = screen.getByTestId('submit-button')

    // Initially submit should be disabled
    expect(submitButton).toBeDisabled()

    // Type in input
    await userEvent.type(input, 'John Doe')

    // Wait for validation
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })

    // Clear input
    await userEvent.clear(input)

    // Should show error and disable submit
    await waitFor(() => {
      expect(screen.getByTestId('name-error')).toHaveTextContent('name is required')
      expect(submitButton).toBeDisabled()
    })
  })

  it('should handle form submission', async () => {
    const schema = {
      name: ValidationRules.required
    }

    const mockSubmit = jest.fn().mockResolvedValue({ success: true })

    render(<TestComponent schema={schema} onSubmit={mockSubmit} />)

    const input = screen.getByTestId('name-input')
    const submitButton = screen.getByTestId('submit-button')

    await userEvent.type(input, 'John Doe')

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({ name: 'John Doe' })
    })
  })

  it('should handle submission errors', async () => {
    const schema = {
      name: ValidationRules.required
    }

    const mockSubmit = jest.fn().mockRejectedValue(new Error('Submission failed'))

    render(<TestComponent schema={schema} onSubmit={mockSubmit} />)

    const input = screen.getByTestId('name-input')
    const submitButton = screen.getByTestId('submit-button')

    await userEvent.type(input, 'John Doe')

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByTestId('submit-error')).toHaveTextContent('Submission failed')
    })
  })
})

describe('Error Boundary', () => {
  const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error')
    }
    return <div>No error</div>
  }

  it('should catch and display errors', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary showErrorDetails={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })
})

describe('Loading States', () => {
  it('should render LoadingButton correctly', () => {
    render(
      <LoadingButton isLoading={true} loadingText="Loading...">
        Submit
      </LoadingButton>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render OperationStatus correctly', () => {
    render(
      <OperationStatus
        status="error"
        errorText="Operation failed"
        onRetry={() => {}}
      />
    )

    expect(screen.getByText('Operation failed')).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('should render DataLoadingState correctly', () => {
    render(
      <DataLoadingState
        isLoading={false}
        error="Failed to load data"
        onRetry={() => {}}
      >
        <div>Data content</div>
      </DataLoadingState>
    )

    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })
})

describe('Form Error Display', () => {
  it('should render FormErrorDisplay with error', () => {
    render(
      <FormErrorDisplay
        error="Test error message"
        recoveryActions={[
          {
            label: 'Retry',
            action: () => {},
            type: 'primary'
          }
        ]}
      />
    )

    expect(screen.getByText('Test error message')).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('should render FieldError correctly', () => {
    render(
      <FieldError
        error="Field is required"
        fieldName="test-field"
      />
    )

    expect(screen.getByText('Field is required')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})

describe('Enhanced Form Component', () => {
  const mockFields = [
    {
      name: 'name',
      label: 'Name',
      type: 'text' as const,
      required: true
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email' as const,
      required: true
    }
  ]

  const mockSchema = {
    name: ValidationRules.required,
    email: ValidationRules.email
  }

  it('should render form fields correctly', () => {
    const mockSubmit = jest.fn().mockResolvedValue({})

    render(
      <EnhancedForm
        fields={mockFields}
        schema={mockSchema}
        onSubmit={mockSubmit}
        title="Test Form"
      />
    )

    expect(screen.getByText('Test Form')).toBeInTheDocument()
    expect(screen.getByLabelText('Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Email *')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })

  it('should validate form and enable/disable submit button', async () => {
    const mockSubmit = jest.fn().mockResolvedValue({})

    render(
      <EnhancedForm
        fields={mockFields}
        schema={mockSchema}
        onSubmit={mockSubmit}
      />
    )

    const nameInput = screen.getByLabelText('Name *')
    const emailInput = screen.getByLabelText('Email *')
    const submitButton = screen.getByRole('button', { name: 'Submit' })

    // Initially disabled
    expect(submitButton).toBeDisabled()

    // Fill in valid data
    await userEvent.type(nameInput, 'John Doe')
    await userEvent.type(emailInput, 'john@example.com')

    // Should be enabled
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })
})