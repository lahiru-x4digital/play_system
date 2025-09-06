import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { useForm, FormProvider } from "react-hook-form";
import { useAxiosPost } from "@/hooks/useAxiosPost";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AdditionalHoursSelect from "./AdditionalHoursSelect";
import { Loader2 } from "lucide-react";
import PaymentInput from "../common/PaymentInput";

const reservationSchema = z.object({
  play_reservation_id: z.number(),
  additional_minutes: z.number(),
  additional_minutes_price: z.number(),
  additional_minutes_price_id: z.number(),
  payment_method: z.string().min(1, "Payment method is required"),
});

export function AddExtraTimeDialog({
  open,
  onOpenChange,
  barcodeId,
  barcodeNumber,
  reservation_rule_id,
  branchId,
  onSuccess,
}) {
  const { postHandler, postHandlerloading } = useAxiosPost();

  const methods = useForm({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      additional_minutes: 0,
      additional_minutes_price: 0,
      additional_minutes_price_id: null,
      minutes_qty: 0,
      payment_method: "STORE_CASH",
    },
  });

  // Watch the quantity and price to calculate total
  const watchFields = methods.watch([
    "customer_types.0.minutes_qty",
    "customer_types.0.additional_minutes_price",
  ]);

  const onSubmit = async (data) => {
    // get now time and extract hour , minute
    const now = new Date();
    const start_hour = now.getHours();
    const start_min = now.getMinutes();

    // Calculate end time by adding additional_minutes to start_min
    const additional_minutes = Number(data.additional_minutes);
    let total_minutes = start_hour * 60 + start_min + additional_minutes;
    let end_hour = Math.floor(total_minutes / 60);
    let end_min = total_minutes % 60;

    const payload = {
      extra_minutes: additional_minutes,
      extra_minute_price: Number(data.additional_minutes_price),
      start_hour: start_hour,
      start_min: start_min,
      end_hour: end_hour,
      end_min: end_min,
      Play_reservation_barcode_id: barcodeId,
      payment_method: data.payment_method,
    };

    try {
      const res = await postHandler(`auto-booking/add-extra-time`, payload);
      if (onSuccess) onSuccess(res);

      methods.reset();
    } catch (error) {
      console.error("Error adding extra time:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Add Extra Time
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add Extra Time</DialogTitle>
          <DialogDescription>
            Barcode:{" "}
            <span className="font-medium text-foreground">{barcodeNumber}</span>
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <div className="space-y-4 p-3 bg-muted/20 rounded-md">
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <AdditionalHoursSelect
                        name={`additional_minutes_price_id`}
                        branchId={branchId}
                        reservation_rule_id={reservation_rule_id}
                        className="w-full"
                      />
                    </div>
                    {/* <div className="w-24">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">
                        Qty
                      </label>
                      <Input
                        type="number"
                        min={1}
                        {...methods.register(
                          `customer_types.${0}.minutes_qty`,
                          {
                            valueAsNumber: true,
                            min: 1,
                            required: true,
                          }
                        )}
                        placeholder="1"
                        className="w-full"
                        onWheel={handleWheel}
                      />
                    </div> */}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <PaymentInput />

                    <span className="text-lg font-semibold">
                      Price : {methods.watch("additional_minutes_price")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="sm:justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={onOpenChange}
                disabled={postHandlerloading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={postHandlerloading}
                className="min-w-[120px]"
              >
                {postHandlerloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Extra Time"
                )}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
