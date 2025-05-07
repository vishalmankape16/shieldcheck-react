'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Camera, X } from 'lucide-react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { createWorker } from 'tesseract.js'

interface UrlScannerProps {
  onUrlDetected: (url: string) => void
}

export function UrlScanner({ onUrlDetected }: UrlScannerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)

  // Start camera with rear-facing camera if available
  const startCamera = async () => {
    try {
      setIsCameraReady(false)
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false // Explicitly disable audio
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        // Wait for video to be ready
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              resolve(true)
            }
          }
        })
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Unable to access camera. Please make sure you have granted camera permissions.')
    }
  }

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setCapturedImage(null)
    setIsCameraReady(false)
  }, [stream])

  const handleOpen = () => {
    setIsOpen(true)
    startCamera()
  }

  const handleClose = () => {
    setIsOpen(false)
    stopCamera()
  }

  const captureImage = async () => {
    if (!videoRef.current || !isCameraReady) return

    try {
      setIsProcessing(true)
      
      // Create canvas and capture frame from video
      const canvas = document.createElement('canvas')
      const video = videoRef.current
      
      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth || video.clientWidth
      canvas.height = video.videoHeight || video.clientHeight
      
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Ensure video is playing and has valid dimensions
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Draw the video frame to the canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert to data URL
        const imageData = canvas.toDataURL('image/jpeg', 0.9)
        
        // Verify that we got valid image data
        if (imageData && imageData.length > 100) {
          setCapturedImage(imageData)
          // Only stop the camera after we've successfully captured the image
          stopCamera()
        } else {
          throw new Error('Failed to capture image')
        }
      } else {
        throw new Error('Video not ready')
      }
    } catch (error) {
      console.error('Error capturing image:', error)
      alert('Error capturing image. Please try again.')
      // If capture fails, don't stop the camera
      setCapturedImage(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera()
  }

  const confirmImage = async () => {
    if (capturedImage) {
      try {
        setIsProcessing(true);

        const worker = await createWorker();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');

        const { data: { text } } = await worker.recognize(capturedImage);
        await worker.terminate();

        // Extract URL from the recognized text
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urlMatch = text.match(urlRegex);

        if (urlMatch && urlMatch.length > 0) {
          const detectedUrl = urlMatch[0];
          console.log('Detected URL:', detectedUrl);
          onUrlDetected(detectedUrl);
          handleClose();
        } else {
          alert('No URL detected in the image. Please try again.');
        }
      } catch (error) {
        console.error('Error recognizing URL:', error);
        alert('Error recognizing URL. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Handle video stream ready state
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleVideoReady = () => {
      setIsCameraReady(true)
    }

    video.addEventListener('loadeddata', handleVideoReady)
    return () => {
      video.removeEventListener('loadeddata', handleVideoReady)
    }
  }, [stream])

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
            <DialogTitle>Scan URL</DialogTitle>
          </DialogHeader>
          
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
            {!capturedImage ? (
              // Camera view
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onLoadedMetadata={(e) => {
                    // Ensure video is ready to play
                    const video = e.target as HTMLVideoElement
                    video.play()
                  }}
                />
                {/* Overlay guide for URL alignment */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-white border-dashed w-3/4 h-16 rounded-lg opacity-50 flex items-center justify-center">
                    <span className="text-white text-sm">Align URL here</span>
                  </div>
                </div>
              </>
            ) : (
              // Captured image view
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full h-full object-cover"
              />
            )}
            
            {isProcessing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white">Processing...</div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button 
              variant="secondary" 
              onClick={capturedImage ? retakePhoto : handleClose}
              disabled={isProcessing}
            >
              <X className="mr-2 h-4 w-4" />
              {capturedImage ? 'Retake' : 'Cancel'}
            </Button>
            
            <Button 
              onClick={capturedImage ? confirmImage : captureImage}
              disabled={isProcessing || (!capturedImage && !isCameraReady)}
            >
              <Camera className="mr-2 h-4 w-4" />
              {capturedImage ? 'Confirm' : 'Capture'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 