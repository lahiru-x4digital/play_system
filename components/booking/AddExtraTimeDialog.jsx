import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import { Input } from "@/components/ui/input"
import { Button } from '../ui/button'
import { useForm, FormProvider } from 'react-hook-form'
import { useAxiosPost } from '@/hooks/useAxiosPost'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import AdditionalHoursSelect from './AdditionalHoursSelect'
import { Loader2 } from 'lucide-react'

const reservationSchema = z.object({
  customer_types: z.array(z.object({
    additional_minutes: z.number().optional(),
    additional_minutes_price: z.number().optional(),
    additional_minutes_price_id: z.number().nullable(),
    minutes_qty: z.number().optional(),
  })),
});

export function AddExtraTimeDialog({ open, onOpenChange, barcodeId, barcodeNumber, customerTypeId, branchId, onSuccess }) {

  const { postHandler, postHandlerloading } = useAxiosPost()
  
  const methods = useForm({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      customer_types: [{
        additional_minutes: 0,
        additional_minutes_price: 0,
        additional_minutes_price_id: null,
        minutes_qty: 0,
      }]
    },
  });

  // Watch the quantity and price to calculate total
  const watchFields = methods.watch(['customer_types.0.minutes_qty', 'customer_types.0.additional_minutes_price']);
  const quantity = watchFields[0] || 0;
  const price = watchFields[1] || 0;
  const total = (quantity * price).toFixed(2);

  const handleWheel = (e) => {
    // Prevent the default behavior
    e.target.blur();
  };

  const onSubmit = async (data) => {
    const payload = {
      id: barcodeId,
      extra_minutes: data.customer_types[0].additional_minutes,
      extra_minute_price: data.customer_types[0].additional_minutes_price,
      extra_minute_qty: data.customer_types[0].minutes_qty
    }

    try {
      const res = await postHandler(`auto-booking/add-extra-time`, payload)
      if (onSuccess) onSuccess(res);
   
      methods.reset();
    } catch (error) {
      console.error('Error adding extra time:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Add Extra Time</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add Extra Time</DialogTitle>
          <DialogDescription>
            Barcode: <span className="font-medium text-foreground">{barcodeNumber}</span>
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Extra Time Details</h4>
                <div className="space-y-4 p-3 bg-muted/20 rounded-md">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Duration</label>
                      <AdditionalHoursSelect
                        name={`customer_types.${0}`}
                        branchId={branchId}
                        userType={customerTypeId}
                        className="w-full"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Qty</label>
                      <Input
                        type="number"
                        min={1}
                        {...methods.register(`customer_types.${0}.minutes_qty`, {
                          valueAsNumber: true,
                          min: 1,
                          required: true
                        })}
                        placeholder="1"
                        className="w-full"
                        onWheel={handleWheel}
                      />
                    </div>
                  
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium">Total:</span>
                    <span className="text-lg font-semibold">{total}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="sm:justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={postHandlerloading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={postHandlerloading || !quantity || !price}
                className="min-w-[120px]"
              >
                {postHandlerloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add Extra Time'
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
