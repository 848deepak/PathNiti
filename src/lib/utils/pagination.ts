/**
 * Pagination Utilities
 * Provides consistent pagination logic for applications, courses, and other large datasets
 */

export interface PaginationParams {
  page: number
  limit: number
  offset?: number
}

export interface PaginationResult<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
    offset: number
  }
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  offset: number
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit)
  const offset = (page - 1) * limit
  
  return {
    page: Math.max(1, page),
    limit: Math.max(1, limit),
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    offset
  }
}

/**
 * Validate and normalize pagination parameters
 */
export function normalizePaginationParams(
  page?: string | number,
  limit?: string | number,
  maxLimit = 100
): PaginationParams {
  const normalizedPage = Math.max(1, parseInt(String(page || 1)))
  const normalizedLimit = Math.min(
    maxLimit,
    Math.max(1, parseInt(String(limit || 10)))
  )
  
  return {
    page: normalizedPage,
    limit: normalizedLimit,
    offset: (normalizedPage - 1) * normalizedLimit
  }
}

/**
 * Create pagination result object
 */
export function createPaginationResult<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginationResult<T> {
  const pagination = calculatePagination(page, limit, total)
  
  return {
    data,
    pagination
  }
}

/**
 * Generate page numbers for pagination UI
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number,
  maxVisible = 5
): (number | '...')[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = []
  const halfVisible = Math.floor(maxVisible / 2)

  // Always show first page
  pages.push(1)

  let startPage = Math.max(2, currentPage - halfVisible)
  let endPage = Math.min(totalPages - 1, currentPage + halfVisible)

  // Adjust range if we're near the beginning or end
  if (currentPage <= halfVisible + 1) {
    endPage = Math.min(totalPages - 1, maxVisible - 1)
  } else if (currentPage >= totalPages - halfVisible) {
    startPage = Math.max(2, totalPages - maxVisible + 2)
  }

  // Add ellipsis if there's a gap after first page
  if (startPage > 2) {
    pages.push('...')
  }

  // Add middle pages
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  // Add ellipsis if there's a gap before last page
  if (endPage < totalPages - 1) {
    pages.push('...')
  }

  // Always show last page (if it's not the first page)
  if (totalPages > 1) {
    pages.push(totalPages)
  }

  return pages
}

/**
 * Cursor-based pagination utilities for real-time data
 */
export interface CursorPaginationParams {
  cursor?: string
  limit: number
  direction?: 'forward' | 'backward'
}

export interface CursorPaginationResult<T> {
  data: T[]
  nextCursor?: string
  prevCursor?: string
  hasNext: boolean
  hasPrev: boolean
}

/**
 * Create cursor pagination result
 */
export function createCursorPaginationResult<T extends { id: string; created_at?: string }>(
  data: T[],
  limit: number,
  direction: 'forward' | 'backward' = 'forward'
): CursorPaginationResult<T> {
  const hasNext = data.length === limit
  const hasPrev = direction === 'backward' || data.length > 0

  let nextCursor: string | undefined
  let prevCursor: string | undefined

  if (data.length > 0) {
    if (direction === 'forward') {
      nextCursor = hasNext ? data[data.length - 1].id : undefined
      prevCursor = data[0].id
    } else {
      nextCursor = data[0].id
      prevCursor = hasNext ? data[data.length - 1].id : undefined
    }
  }

  return {
    data,
    nextCursor,
    prevCursor,
    hasNext,
    hasPrev
  }
}

/**
 * Supabase pagination helper
 */
export class SupabasePagination {
  /**
   * Apply pagination to a Supabase query
   */
  static applyPagination<T>(
    query: any,
    params: PaginationParams
  ) {
    return query.range(params.offset, params.offset + params.limit - 1)
  }

  /**
   * Get total count for pagination
   */
  static async getTotalCount(
    query: any
  ): Promise<number> {
    const { count, error } = await query.select('*', { count: 'exact', head: true })
    
    if (error) {
      console.error('Error getting total count:', error)
      return 0
    }
    
    return count || 0
  }

  /**
   * Execute paginated query with count
   */
  static async executePaginatedQuery<T>(
    baseQuery: any,
    params: PaginationParams
  ): Promise<PaginationResult<T>> {
    // Get total count
    const total = await this.getTotalCount(baseQuery)

    // Get paginated data
    const { data, error } = await this.applyPagination(baseQuery, params)

    if (error) {
      throw new Error(`Pagination query failed: ${error.message}`)
    }

    return createPaginationResult(data || [], params.page, params.limit, total)
  }
}

/**
 * React hook for pagination state management
 */
export function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  const goToPage = (newPage: number) => {
    setPage(Math.max(1, newPage))
  }

  const nextPage = () => {
    setPage(prev => prev + 1)
  }

  const prevPage = () => {
    setPage(prev => Math.max(1, prev - 1))
  }

  const changeLimit = (newLimit: number) => {
    setLimit(Math.max(1, newLimit))
    setPage(1) // Reset to first page when changing limit
  }

  const reset = () => {
    setPage(initialPage)
    setLimit(initialLimit)
  }

  return {
    page,
    limit,
    offset: (page - 1) * limit,
    goToPage,
    nextPage,
    prevPage,
    changeLimit,
    reset
  }
}

/**
 * Infinite scroll pagination utilities
 */
export interface InfiniteScrollParams {
  hasMore: boolean
  loading: boolean
  threshold?: number
}

export function useInfiniteScroll(
  callback: () => void,
  params: InfiniteScrollParams
) {
  const { hasMore, loading, threshold = 100 } = params

  useEffect(() => {
    if (!hasMore || loading) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      
      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        callback()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [callback, hasMore, loading, threshold])
}

// Import React hooks if available
let useState: any, useEffect: any
try {
  const React = require('react')
  useState = React.useState
  useEffect = React.useEffect
} catch {
  // React not available, hooks will be undefined
}

export default {
  calculatePagination,
  normalizePaginationParams,
  createPaginationResult,
  generatePageNumbers,
  createCursorPaginationResult,
  SupabasePagination
}