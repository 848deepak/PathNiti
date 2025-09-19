/**
 * @jest-environment jsdom
 */

import { validateFile, sanitizeFileName, formatFileSize, isImageFile, isPDFFile } from '@/lib/utils/file-validation'

describe('Document Storage Integration', () => {
  describe('File Validation', () => {
    it('should reject empty files', () => {
      const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' })
      const result = validateFile(emptyFile)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('File cannot be empty')
    })

    it('should accept valid PDF files', () => {
      const pdfContent = new Uint8Array(2048) // 2KB file
      const pdfFile = new File([pdfContent], 'test.pdf', { type: 'application/pdf' })
      const result = validateFile(pdfFile)
      expect(result.isValid).toBe(true)
    })

    it('should detect file types correctly', () => {
      const imageFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
      const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      
      expect(isImageFile(imageFile)).toBe(true)
      expect(isImageFile(pdfFile)).toBe(false)
      expect(isPDFFile(pdfFile)).toBe(true)
      expect(isPDFFile(imageFile)).toBe(false)
    })

    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
    })

    it('should sanitize filenames', () => {
      const dangerousName = 'test<>:"/\\|?*.pdf'
      const sanitized = sanitizeFileName(dangerousName)
      expect(sanitized).toBe('test_.pdf')
    })
  })
})
