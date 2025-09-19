/**
 * Performance Optimizations Test Suite
 * Tests the caching, database optimizations, and performance improvements
 */

import { collegeProfileServiceEnhanced } from '@/lib/services/college-profile-service'
import { 
  collegeProfileCache, 
  CacheKeys, 
  CacheInvalidation 
} from '@/lib/services/cache-service'

describe('Performance Optimizations', () => {
  beforeEach(() => {
    // Clear all caches before each test
    CacheInvalidation.invalidateAllCaches()
  })

  describe('Caching System', () => {
    it('cache service should initialize correctly', () => {
      const stats = collegeProfileCache.getStats()
      expect(stats).toBeDefined()
      expect(stats.maxSize).toBeGreaterThan(0)
      expect(stats.size).toBeGreaterThanOrEqual(0)
    })

    it('should cache college profiles', async () => {
      const testSlug = 'test-college-cache'
      const cacheKey = CacheKeys.collegeProfile(testSlug)

      // Initially should not be cached
      expect(collegeProfileCache.has(cacheKey)).toBe(false)

      // Mock college data
      const mockCollege = {
        id: 'test-id',
        slug: testSlug,
        name: 'Test College',
        type: 'university'
      }

      // Set cache
      collegeProfileCache.set(cacheKey, mockCollege)

      // Should now be cached
      expect(collegeProfileCache.has(cacheKey)).toBe(true)
      
      const cachedData = collegeProfileCache.get(cacheKey)
      expect(cachedData).toEqual(mockCollege)
    })

    it('should handle cache expiration', async () => {
      const testSlug = 'test-expiry'
      const cacheKey = CacheKeys.collegeProfile(testSlug)
      const mockData = { id: 'test', name: 'Test' }

      // Set with very short TTL
      collegeProfileCache.set(cacheKey, mockData, 100) // 100ms

      // Should be available immediately
      expect(collegeProfileCache.get(cacheKey)).toEqual(mockData)

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150))

      // Should be expired
      expect(collegeProfileCache.get(cacheKey)).toBeNull()
    })

    it('should provide cache statistics', () => {
      const stats = collegeProfileServiceEnhanced.getCacheStats()
      
      expect(stats).toBeDefined()
      expect(stats.profileCache).toBeDefined()
      expect(stats.listCache).toBeDefined()
      expect(stats.courseCache).toBeDefined()
      expect(stats.noticeCache).toBeDefined()
    })
  })

  describe('Image Optimization', () => {
    it('should identify optimizable images', () => {
      const { ImageOptimizationUtils } = require('@/lib/services/image-optimization-service')
      
      expect(ImageOptimizationUtils.isOptimizationSupported('https://supabase.co/image.jpg')).toBe(true)
      expect(ImageOptimizationUtils.isOptimizationSupported('https://example.com/image.jpg')).toBe(false)
    })

    it('should generate optimized URLs', () => {
      const { ImageOptimizationUtils } = require('@/lib/services/image-optimization-service')
      
      const originalUrl = 'https://supabase.co/storage/v1/object/public/images/test.jpg'
      const optimizedUrl = ImageOptimizationUtils.getOptimizedUrl(originalUrl, 800, 600, 85, 'webp')
      
      expect(optimizedUrl).toContain('width=800')
      expect(optimizedUrl).toContain('height=600')
      expect(optimizedUrl).toContain('quality=85')
      expect(optimizedUrl).toContain('format=webp')
    })
  })
})