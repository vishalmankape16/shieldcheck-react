'use client'

import { useState, useRef } from 'react'
import { Camera, X } from 'lucide-react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'

interface UrlScannerProps {
  onUrlDetected: (url: string) => void
}

export function UrlScanner({ onUrlDetected }: UrlScannerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    startCamera()
  }

  const handleClose = () => {
    setIsOpen(false)
    stopCamera()
  }

  // This is a placeholder for actual URL/barcode detection
  // You would need to implement actual detection logic here
  const captureImage = async () => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(videoRef.current, 0, 0)
    
    // Here you would implement actual URL/barcode detection
    // For now, we'll just simulate a detection
    handleClose()
    onUrlDetected('https://example.com')
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={handleOpen}
        className="absolute right-3 top-1/2 -translate-y-1/2"
        title="Scan URL with camera"
      >
        <Camera className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan URL or Barcode</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex justify-between">
            <Button variant="secondary" onClick={handleClose}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={captureImage}>
              <Camera className="mr-2 h-4 w-4" />
              Capture
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 