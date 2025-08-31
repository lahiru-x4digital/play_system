"use client";
import {
  BarcodeIcon,
  PhoneIcon,
  ShoppingCartIcon,
  UserIcon,
} from "lucide-react";
import React, { useState } from "react";
import { FormProvider } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useSessionUser, { useIsAdmin } from "@/lib/getuserData";
import { Button } from "@/components/ui/button";
import {
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneNumberField } from "@/components/coustomer-mobile-input";
import CreateBookingInput from "@/components/ticketing/create-booking-input";
import StepperComp from "@/components/common/StepperComp";
import { playReservationService } from "@/services/play_reservation.service";
import { set } from "lodash";
import StepConfirmation from "@/components/ticketing/StepConfirmation";
import { extractHourMin } from "@/utils/time-converter";
const reservationSchema = z.object({
  mobile_number: z.string().min(1, { message: "Mobile number is required" }),
  payment_method: z.string().min(1, { message: "Payment method is required" }),
  amount: z.number().min(0, { message: "Amount is required" }),
  first_name: z.string(),
  last_name: z.string(),
  branch_id: z.number().min(1, { message: "Branch is required" }),
  customer_types: z.array(
    z.object({
      rule_id: z.number(),
      price: z.number(),
      rule_name: z.string(),
      customers: z.array(
        z.object({
          name: z.string().optional(),
          birthday: z.string().optional(),
        })
      ),
      start_time: z.string(),
      end_time: z.string(),
    })
  ),
  additional_products: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      price: z.number(),
      qty: z.number(),
    })
  ),
});
export default function page() {
  const [activeStep, setActiveStep] = React.useState(1); // Start from 1
  const [disabledSteps, setDisabledSteps] = React.useState([]);
  const [reservationId, setReservationId] = useState(150);
  const isAdmin = useIsAdmin();
  const user = useSessionUser();

  const handleStep = (step) => () => {
    setActiveStep(step);
  };
  const methods = useForm({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      mobile_number: "",
      first_name: "",
      last_name: "",
      branch_id: user?.branchId,
      payment_method: "CASH",
      amount: 0,
      customer_types: [],
      additional_products: [],
    },
  });
  //watch error
  const errors = methods.formState.errors;
  //total price customer_types.reducer with customers.length

  const onSubmit = async (data) => {
    console.log(data);
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      mobile_number: data.mobile_number,
      branch_id: isAdmin ? data.branch_id : user?.branchId,
      total_price: data.amount,
      status: "CONFIRMED",
      payment_status: "PAID",
      customer_types:
        data.customer_types?.map((item) => {
          const start = extractHourMin(item.start_time);
          const end = extractHourMin(item.end_time);

          return {
            rule_id: item.rule_id,
            price: item.price,
            start_hour: start.hour,
            start_min: start.min,
            end_hour: end.hour,
            end_min: end.min,
            customers:
              item.customers?.filter(
                (customer) =>
                  customer.name !== "" &&
                  customer.name !== undefined &&
                  customer.name !== null
              ) || [],
          };
        }) || [],
      // products:
      //   data.additional_products?.map((item) => ({
      //     play_product_id: item.id,
      //     quantity: item.qty,
      //   })) || [],
    };
    try {
      const response = await playReservationService.createReservation(payload);
      setActiveStep(4);
      setDisabledSteps([1, 2, 3]);
      setReservationId(response.id);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="">
      <div className="">
        <StepperComp
          activeStep={activeStep}
          onStepChange={setActiveStep}
          disabledSteps={disabledSteps}
        />
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="w-full flex justify-center flex-col gap-4 m-2 border-2 p-2 rounded-2xl">
              {activeStep === 1 && (
                <div className=" flex  items-center gap-2">
                  <PhoneNumberField
                    control={methods.control}
                    name="mobile_number"
                    defaultCountry="ae"
                    preferred={["ae", "sa", "lk", "us", "gb"]}
                  />
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveStep(2);
                    }}
                    className="cursor-pointer"
                  >
                    Check Profile
                  </Button>
                </div>
              )}
              {activeStep === 2 && (
                <div className="space-y-6">
                  {/* Section header with mobile badge */}
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      Customer Profile
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Linked to mobile number:{" "}
                      <span className="inline-block bg-muted px-2 py-0.5 rounded text-sm font-medium">
                        {methods.watch("mobile_number")}
                      </span>
                    </p>
                  </div>
                  {/* Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          {...methods.register("first_name")}
                          placeholder="John"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          {...methods.register("last_name")}
                          placeholder="Doe"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          {...methods.register("email")}
                          placeholder="you@example.com"
                          type="email"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                </div>
              )}
              {activeStep === 3 && <CreateBookingInput />}

              <div className="flex gap-2 justify-end">
                {/* back btn */}
                <Button
                  variant="outline"
                  onClick={() => setActiveStep((prev) => prev - 1)}
                  className="cursor-pointer"
                  disabled={activeStep === 1}
                >
                  Back
                </Button>

                {activeStep === 2 && (
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveStep(3);
                    }}
                    className="cursor-pointer"
                  >
                    Create Booking
                  </Button>
                )}
                {activeStep === 3 && (
                  <Button type="submit" className="cursor-pointer">
                    Confirm
                  </Button>
                )}
                {activeStep == 4 && (
                  <StepConfirmation reservationId={reservationId} />
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
