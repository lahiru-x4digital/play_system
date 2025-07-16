"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { X, ZoomIn, ZoomOut, Check } from "lucide-react"

const MEDIA_CONFIGS = {
  logo: {
    aspectRatio: 1,
    maxSize: 512 * 1024, // 512KB
    dimensions: { width: 512, height: 512 },
    acceptedTypes: "image/*",
    title: "Logo Upload"
  },
  cover_image: {
    aspectRatio: 820/360,
    maxSize: 5 * 1024 * 1024, // 5MB
    dimensions: { width: 820, height: 360 },
    acceptedTypes: "image/*",
    title: "Cover Image Upload"
  },
  cover_video: {
    aspectRatio: 820/360,
    maxSize: 50 * 1024 * 1024, // 50MB
    dimensions: { width: 820, height: 360 },
    acceptedTypes: "video/*",
    title: "Cover Video Upload"
  }
}

export function MediaUpload({ 
  type, 
  onFileSelect, 
  maxSize, 
  aspectRatio, 
  accept,
  disabled = false,
  value = null,
  error = null,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [crop, setCrop] = useState(null)
  const [zoom, setZoom] = useState(1)
  const imageRef = useRef(null)

  const config = MEDIA_CONFIGS[type]

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file size
    if (file.size > config.maxSize) {
      alert(`File size must be less than ${config.maxSize/1024}KB`)
      return
    }

    // Validate file type
    if (!file.type.match(config.acceptedTypes)) {
      alert(`Only ${config.acceptedTypes} files are allowed`)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result)
      setIsOpen(true)
    }
    reader.readAsDataURL(file)
    setSelectedFile(file)
  }

  const handleCropComplete = (crop) => {
    if (imageRef.current && crop.width && crop.height) {
      const canvas = document.createElement('canvas')
      const scaleX = imageRef.current.naturalWidth / imageRef.current.width
      const scaleY = imageRef.current.naturalHeight / imageRef.current.height
      canvas.width = config.dimensions.width
      canvas.height = config.dimensions.height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(
        imageRef.current,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      )

      canvas.toBlob((blob) => {
        const file = new File([blob], selectedFile.name, { type: selectedFile.type })
        onFileSelect(file)
        setIsOpen(false)
      }, selectedFile.type)
    }
  }

  const handleZoomChange = (value) => {
    setZoom(value[0])
  }

  const getPreviewClassName = () => {
    switch(type) {
      case 'logo':
        return "mt-2 w-24 h-24 object-cover" // 96x96px preview for logo
      case 'cover_image':
      case 'cover_video':
        return "mt-2 max-w-full h-auto" // Full width for cover media
      default:
        return "mt-2 max-w-full h-auto"
    }
  }

  return (
    <div>
      <Input
        type="file"
        accept={config.acceptedTypes}
        onChange={handleFileSelect}
        disabled={disabled}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {value && (
        <div className="mt-2">
          {type === 'cover_video' ? (
            <video 
              src={typeof value === 'string' ? value : URL.createObjectURL(value)} 
              className={getPreviewClassName()}
              controls
            />
          ) : (
            <img 
              src={typeof value === 'string' ? value : URL.createObjectURL(value)} 
              alt="Preview"
              className={getPreviewClassName()}
            />
          )}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{config.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {type !== 'cover_video' && (
              <>
                <ReactCrop
                  crop={crop}
                  onChange={setCrop}
                  aspect={config.aspectRatio}
                  className="max-h-[600px] overflow-auto"
                >
                  <img
                    ref={imageRef}
                    src={preview}
                    alt="Crop preview"
                    style={{ transform: `scale(${zoom})` }}
                  />
                </ReactCrop>

                <div className="flex items-center gap-4">
                  <ZoomOut className="h-4 w-4" />
                  <Slider
                    value={[zoom]}
                    min={0.1}
                    max={3}
                    step={0.1}
                    onValueChange={handleZoomChange}
                  />
                  <ZoomIn className="h-4 w-4" />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleCropComplete(crop)}
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 