"use client"

import { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "@/components/ui/card"
import { UploadCloud, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Cropper from 'react-easy-crop'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function Dropzone({ 
  onSelect = () => {},
  multiple = false,
  maxFiles = 5,
  accept = {
    'image/png': ['.png'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/gif': ['.gif']
  },
  maxSize = 5242880, // 5MB
  className = "",
  aspectRatio = 1, // Default square
  minWidth = 200,
  minHeight = 200
}) {
  const [files, setFiles] = useState([])
  const [cropDialogOpen, setCropDialogOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const getCroppedImage = useCallback(async () => {
    try {
      return new Promise((resolve, reject) => {
        if (!currentImage?.src || !croppedAreaPixels) {
          reject(new Error('Missing image data'))
          return
        }

        const image = document.createElement('img')
        
        image.addEventListener('load', () => {
          const canvas = document.createElement('canvas')
          canvas.width = croppedAreaPixels.width
          canvas.height = croppedAreaPixels.height
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('No 2d context'))
            return
          }

          // Enable high quality image rendering
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          ctx.drawImage(
            image,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
          )

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas is empty'))
                return
              }
              // Create a new File object from the blob
              const file = new File(
                [blob], 
                currentImage.file.name, 
                {
                  type: currentImage.file.type,
                  lastModified: Date.now()
                }
              )
              resolve(file)
            },
            currentImage.file.type,
            1 // Maximum quality
          )
        })

        image.addEventListener('error', (error) => {
          reject(error)
        })

        image.src = currentImage.src
      })
    } catch (e) {
      console.error('Error getting cropped image:', e)
      return null
    }
  }, [croppedAreaPixels, currentImage])

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = () => {
        setCurrentImage({
          src: reader.result,
          file
        })
        setCropDialogOpen(true)
      }
      reader.readAsDataURL(file)
    } else {
      // Handle non-image files normally
      const newFiles = multiple 
        ? [...files, ...acceptedFiles]
        : [acceptedFiles[0]]
      setFiles(newFiles.slice(0, maxFiles))
    }
  }, [files, multiple, maxFiles])

  const handleCropComplete = useCallback(async () => {
    try {
      const croppedFile = await getCroppedImage()
      if (!croppedFile) {
        console.error('Failed to crop image')
        return
      }

      const newFiles = multiple 
        ? [...files, croppedFile]
        : [croppedFile]
      
      setFiles(newFiles.slice(0, maxFiles))
      onSelect(newFiles.slice(0, maxFiles)) // Ensure onSelect is called with the new files
      setCropDialogOpen(false)
      setCurrentImage(null)
      setZoom(1)
      setCrop({ x: 0, y: 0 })
    } catch (e) {
      console.error('Error completing crop:', e)
    }
  }, [getCroppedImage, currentImage, multiple, maxFiles, files, onSelect])

  const deleteFile = (indexToRemove) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove)
    setFiles(updatedFiles)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    accept,
    maxSize,
    maxFiles
  })

  useEffect(() => {
    if (files.length > 0) {
      onSelect(files)
    }
  }, [files, onSelect])

  return (
    <>
      <div className="space-y-4">
        <div 
          {...getRootProps()} 
          className={`
            border-2 border-dashed rounded-lg p-6 cursor-pointer
            hover:border-primary transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-border'}
            ${className}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <UploadCloud className="h-10 w-10 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <p>
                  Drag & drop files here, or click to select files
                  {!multiple && " (single file only)"}
                </p>
              )}
            </div>
          </div>
        </div>

        {files.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {files.map((file, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="relative group">
                  <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteFile(index)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-0">
                    {file && file.type && file.type.startsWith('image/') ? (
                      <div className="relative aspect-square">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={file.name || 'Image'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square flex items-center justify-center bg-secondary">
                        <p className="text-sm text-muted-foreground">
                          {file?.name || 'Unknown file'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          <div className="relative h-[400px]">
            {currentImage && (
              <Cropper
                image={currentImage.src}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                objectFit="contain"
              />
            )}
          </div>
          <div className="flex items-center gap-4 px-4">
            <span className="text-sm text-muted-foreground">Zoom:</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setCropDialogOpen(false)
                setCurrentImage(null)
                setZoom(1)
                setCrop({ x: 0, y: 0 })
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCropComplete}>
              <Check className="mr-2 h-4 w-4" />
              Apply Crop
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}