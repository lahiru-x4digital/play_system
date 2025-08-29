import React from 'react'
import { useFormContext } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export default function CartItem() {
  const { watch, setValue } = useFormContext()
  const customerTypes = watch("customer_types") || []

  // Don't render if empty
  if (customerTypes.length === 0) return null

  const removeCustomerType = (indexToRemove) => {
    const updated = customerTypes.filter((_, index) => index !== indexToRemove)
    setValue("customer_types", updated)
  }
  //total ptice 
  const total = customerTypes.reduce((total, customerType) => {
    return total + customerType.price
  }, 0)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-xl font-bold"
      >
        Cart Items
      </motion.h1>

      <AnimatePresence>
        {customerTypes.map((customerType, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}
            layout
          >
            <Card className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate pr-2">
                      {customerType.rule_name}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="secondary">{total}</Badge>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600"
                        onClick={() => removeCustomerType(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-2">
                {customerType.customers.map((customer, customerIndex) => (
                  <motion.div
                    key={customerIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + customerIndex * 0.03 }}
                    className="flex justify-between items-center p-2 bg-muted/30 rounded text-sm"
                  >
                    <span className="font-medium">{customer.name}</span>
                    <span className="text-muted-foreground">{customer.birthday}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}