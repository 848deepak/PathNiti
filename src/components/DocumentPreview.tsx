"use client"

import { useState, useEffect } from "react"
import { Eye, Download, Trash2, FileText, Image, AlertCircle, Loader2, X } from "lucide-react"
import { Button, Card, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Alert, AlertDescription } from "@/components/ui"
import { documentStorageService, type DocumentMetadata, type StorageBucket } from "@/lib/services/document-storage-service"
import { formatFileSize, isImageFile, isPDFFile } from "@/lib/utils/file-validation"

interface DocumentPreviewProps {
  document: DocumentMetadata
  onDelete?: (documentId: string) => void
  onDownload?: (document: DocumentMetadata) => void
  showActions?: boolean
  compact?: boolean
}

interface DocumentViewerProps {
  document: DocumentMetadata
  isOpen: boolean
  onClose: () => void
}

function DocumentViewer({ document, isOpen, onClose }: DocumentViewerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && document) {
      loadPreview()
    }
  }, [isOpen, document])

  const loadPreview = async () => {
    setLoading(true)
    setError(null)

    try {
      // For images, get a preview URL with optimization
      if (isImageFile({ type: document.file_type } as File)) {
        const { url, error } = await documentStorageService.getPreviewUrl(
          document.file_path,
          document.bucket_name as StorageBucket,
          { width: 800, quality: 80 }
        )
        
        if (error) {
          setError(error)
        } else {
          setPreviewUrl(url)
        }
      } else {
        // For other files, get signed URL for secure access
        const { url, error } = await documentStorageService.getSignedUrl(
          document.file_path,
          document.bucket_name as StorageBucket
        )
        
        if (error) {
          setError(error)
        } else {
          setPreviewUrl(url)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview')
    } finally {
      setLoading(false)
    }
  }

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading preview...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )
    }

    if (!previewUrl) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Preview not available</p>
          </div>
        </div>
      )
    }

    // Render based on file type
    if (isImageFile({ type: document.file_type } as File)) {
      return (
        <div className="flex justify-center">
          <img
            src={previewUrl}
            alt={document.file_name}
            className="max-w-full max-h-96 object-contain rounded-lg"
            onError={() => setError('Failed to load image')}
          />
        </div>
      )
    }

    if (isPDFFile({ type: document.file_type } as File)) {
      return (
        <div className="w-full h-96">
          <iframe
            src={`${previewUrl}#toolbar=0`}
            className="w-full h-full border rounded-lg"
            title={document.file_name}
            onError={() => setError('Failed to load PDF')}
          />
        </div>
      )
    }

    // For other document types, show download option
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-700 mb-4">Preview not available for this file type</p>
          <Button
            onClick={() => window.open(previewUrl, '_blank')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download to View
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {isImageFile({ type: document.file_type } as File) ? (
                <Image className="h-5 w-5" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
              {document.file_name}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{formatFileSize(document.file_size)}</span>
            <span>•</span>
            <span>Uploaded {new Date(document.uploaded_at).toLocaleDateString()}</span>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function DocumentPreview({ 
  document, 
  onDelete, 
  onDownload, 
  showActions = true, 
  compact = false 
}: DocumentPreviewProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!onDelete) return

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const result = await documentStorageService.deleteFile(document.id)
      if (result.success) {
        onDelete(document.id)
      } else {
        setDeleteError(result.error || 'Failed to delete document')
      }
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete document')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownload = async () => {
    try {
      const { url, error } = await documentStorageService.getSignedUrl(
        document.file_path,
        document.bucket_name as StorageBucket
      )

      if (error) {
        console.error('Download error:', error)
        return
      }

      if (url) {
        // Create a temporary link to trigger download
        const link = document.createElement('a')
        link.href = url
        link.download = document.file_name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      onDownload?.(document)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const getFileIcon = () => {
    if (isImageFile({ type: document.file_type } as File)) {
      return <Image className="h-4 w-4 text-blue-500" />
    }
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  if (compact) {
    return (
      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {getFileIcon()}
          <span className="text-sm text-gray-700 truncate">{document.file_name}</span>
          <span className="text-xs text-gray-500">{formatFileSize(document.file_size)}</span>
        </div>
        
        {showActions && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsViewerOpen(true)}
              title="Preview"
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              title="Download"
            >
              <Download className="h-3 w-3" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                title="Delete"
                className="text-red-500 hover:text-red-700"
              >
                {isDeleting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
        )}

        <DocumentViewer
          document={document}
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
        />
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {getFileIcon()}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {document.file_name}
              </h4>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span>{formatFileSize(document.file_size)}</span>
                <span>•</span>
                <span>Uploaded {new Date(document.uploaded_at).toLocaleDateString()}</span>
                {document.document_type && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{document.document_type.replace('_', ' ')}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {showActions && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsViewerOpen(true)}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-1 text-red-500 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>

        {deleteError && (
          <Alert variant="destructive" className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{deleteError}</AlertDescription>
          </Alert>
        )}

        <DocumentViewer
          document={document}
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
        />
      </CardContent>
    </Card>
  )
}