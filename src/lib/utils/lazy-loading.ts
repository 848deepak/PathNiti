/**
 * Lazy loading utilities for college list and search functionality
 * Provides efficient data loading with caching and pagination
 */

import { supabase } from '@/lib/supabase'

export interface LazyLoadConfig {
  pageSize: number
  cacheTimeout: number // in milliseconds
  preloadThreshold: number // items remaining before preloading next page
}

export interface LazyLoadResult<T> {
  data: T[]
  hasMore: boolean
  nextCursor?: string
  totalCount?: number
  isLoading: boolean
  error?: string
}

export interface CollegeSearchOptions {
  query?: string
  state?: string
  city?: string
  type?: string
  limit?: number
  offset?: number
}

// Cache interface
interface CacheEntry<T> {
  data: T[]
  timestamp: number
  hasMore: boolean
  totalCount?: number
}

class LazyLoadCache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private timeout: number

  constructor(timeout: number = 5 * 60 * 1000) { // 5 minutes default
    this.timeout = timeout
  }

  get(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > this.timeout) {
      this.cache.delete(key)
      return null
    }

    return entry
  }

  set(key: string, data: T[], hasMore: boolean, totalCount?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hasMore,
      totalCount
    })
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.timeout) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instances
const collegeCache = new LazyLoadCache<any>(10 * 60 * 1000) // 10 minutes for colleges
const searchCache = new LazyLoadCache<any>(2 * 60 * 1000) // 2 minutes for search results

// Cleanup caches periodically
setInterval(() => {
  collegeCache.cleanup()
  searchCache.cleanup()
}, 5 * 60 * 1000) // Every 5 minutes

export class CollegeLazyLoader {
  private config: LazyLoadConfig

  constructor(config: Partial<LazyLoadConfig> = {}) {
    this.config = {
      pageSize: 50,
      cacheTimeout: 10 * 60 * 1000, // 10 minutes
      preloadThreshold: 10,
      ...config
    }
  }

  /**
   * Load colleges with lazy loading and caching
   */
  async loadColleges(
    options: CollegeSearchOptions = {},
    useCache: boolean = true
  ): Promise<LazyLoadResult<any>> {
    const cacheKey = this.generateCacheKey('colleges', options)
    
    // Check cache first
    if (useCache) {
      const cached = collegeCache.get(cacheKey)
      if (cached) {
        return {
          data: cached.data,
          hasMore: cached.hasMore,
          totalCount: cached.totalCount,
          isLoading: false
        }
      }
    }

    try {
      const { data, error, count } = await this.fetchColleges(options)
      
      if (error) {
        throw new Error(error.message)
      }

      const hasMore = (data?.length || 0) === this.config.pageSize
      const result: LazyLoadResult<any> = {
        data: data || [],
        hasMore,
        totalCount: count || undefined,
        isLoading: false
      }

      // Cache the result
      if (useCache && data) {
        collegeCache.set(cacheKey, data, hasMore, count || undefined)
      }

      return result
    } catch (error) {
      return {
        data: [],
        hasMore: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load colleges'
      }
    }
  }

  /**
   * Search colleges with debouncing and caching
   */
  async searchColleges(
    query: string,
    options: Omit<CollegeSearchOptions, 'query'> = {},
    useCache: boolean = true
  ): Promise<LazyLoadResult<any>> {
    if (!query.trim()) {
      return this.loadColleges(options, useCache)
    }

    const searchOptions = { ...options, query: query.trim() }
    const cacheKey = this.generateCacheKey('search', searchOptions)

    // Check cache first
    if (useCache) {
      const cached = searchCache.get(cacheKey)
      if (cached) {
        return {
          data: cached.data,
          hasMore: cached.hasMore,
          totalCount: cached.totalCount,
          isLoading: false
        }
      }
    }

    try {
      const { data, error, count } = await this.fetchColleges(searchOptions)
      
      if (error) {
        throw new Error(error.message)
      }

      const hasMore = (data?.length || 0) === this.config.pageSize
      const result: LazyLoadResult<any> = {
        data: data || [],
        hasMore,
        totalCount: count || undefined,
        isLoading: false
      }

      // Cache the result
      if (useCache && data) {
        searchCache.set(cacheKey, data, hasMore, count || undefined)
      }

      return result
    } catch (error) {
      return {
        data: [],
        hasMore: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to search colleges'
      }
    }
  }

  /**
   * Load more colleges (pagination)
   */
  async loadMore(
    currentData: any[],
    options: CollegeSearchOptions = {}
  ): Promise<LazyLoadResult<any>> {
    const nextOptions = {
      ...options,
      offset: (options.offset || 0) + this.config.pageSize
    }

    const result = await this.loadColleges(nextOptions, false) // Don't use cache for pagination

    return {
      ...result,
      data: [...currentData, ...result.data]
    }
  }

  /**
   * Preload next page if threshold is reached
   */
  shouldPreload(currentIndex: number, totalLoaded: number): boolean {
    const remaining = totalLoaded - currentIndex - 1 // -1 because currentIndex is 0-based
    return remaining <= this.config.preloadThreshold
  }

  /**
   * Invalidate cache for colleges
   */
  invalidateCache(pattern?: string): void {
    collegeCache.invalidate(pattern)
    searchCache.invalidate(pattern)
  }

  /**
   * Fetch colleges from database
   */
  private async fetchColleges(options: CollegeSearchOptions) {
    let query = supabase
      .from('colleges')
      .select('id, name, location, type, is_verified', { count: 'exact' })
      .eq('is_active', true)

    // Apply search filters
    if (options.query) {
      const searchTerm = `%${options.query}%`
      query = query.or(`name.ilike.${searchTerm},location->>city.ilike.${searchTerm},location->>state.ilike.${searchTerm}`)
    }

    if (options.state) {
      query = query.eq('location->>state', options.state)
    }

    if (options.city) {
      query = query.eq('location->>city', options.city)
    }

    if (options.type) {
      query = query.eq('type', options.type)
    }

    // Apply pagination
    const limit = options.limit || this.config.pageSize
    const offset = options.offset || 0
    
    query = query
      .order('name')
      .range(offset, offset + limit - 1)

    return query
  }

  /**
   * Generate cache key for options
   */
  private generateCacheKey(prefix: string, options: CollegeSearchOptions): string {
    const keyParts = [prefix]
    
    if (options.query) keyParts.push(`q:${options.query}`)
    if (options.state) keyParts.push(`s:${options.state}`)
    if (options.city) keyParts.push(`c:${options.city}`)
    if (options.type) keyParts.push(`t:${options.type}`)
    if (options.limit) keyParts.push(`l:${options.limit}`)
    if (options.offset) keyParts.push(`o:${options.offset}`)

    return keyParts.join('|')
  }
}

/**
 * React hook for lazy loading colleges
 */
export function useCollegeLazyLoader(config?: Partial<LazyLoadConfig>) {
  const loader = new CollegeLazyLoader(config)

  return {
    loadColleges: loader.loadColleges.bind(loader),
    searchColleges: loader.searchColleges.bind(loader),
    loadMore: loader.loadMore.bind(loader),
    shouldPreload: loader.shouldPreload.bind(loader),
    invalidateCache: loader.invalidateCache.bind(loader)
  }
}

/**
 * Virtualization helper for large lists
 */
export class VirtualizedList {
  private itemHeight: number
  private containerHeight: number
  private overscan: number

  constructor(itemHeight: number, containerHeight: number, overscan: number = 5) {
    this.itemHeight = itemHeight
    this.containerHeight = containerHeight
    this.overscan = overscan
  }

  /**
   * Calculate visible range for virtualization
   */
  getVisibleRange(scrollTop: number, totalItems: number): {
    startIndex: number
    endIndex: number
    visibleItems: number
  } {
    const visibleItems = Math.ceil(this.containerHeight / this.itemHeight)
    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.overscan)
    const endIndex = Math.min(totalItems - 1, startIndex + visibleItems + this.overscan * 2)

    return {
      startIndex,
      endIndex,
      visibleItems
    }
  }

  /**
   * Calculate total height for virtual scrolling
   */
  getTotalHeight(totalItems: number): number {
    return totalItems * this.itemHeight
  }

  /**
   * Calculate offset for visible items
   */
  getOffsetY(startIndex: number): number {
    return startIndex * this.itemHeight
  }
}

// Export singleton instance for convenience
export const collegeLazyLoader = new CollegeLazyLoader()