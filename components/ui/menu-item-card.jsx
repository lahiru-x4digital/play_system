import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, ImageOff } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

export function MenuItemCard({ menuItem, onDelete, onEdit }) {
  const [imageError, setImageError] = useState(false)

  const handleDelete = () => {
    if (menuItem && menuItem.id) {
      onDelete(menuItem.id);
    }
  };

  return (
    <Card className="overflow-hidden mt-4"> {/* Added top margin here */}
      <div className="relative w-full h-48">
        {menuItem.image_url && !imageError ? (
          <Image
            src={menuItem.image_url}
            alt={menuItem.item_name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <ImageOff className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold">{menuItem.item_name}</h3>
            <p className="text-sm text-gray-500">Code: {menuItem.item_code}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(menuItem)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-8 w-8 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-2">
          <p className="text-xl font-bold text-primary">
            {menuItem.country?.currency} {menuItem.item_price.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {menuItem.country?.country_name}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {menuItem.brand?.brand_name}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}