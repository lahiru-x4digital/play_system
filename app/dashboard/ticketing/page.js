"use client";
import {
  BarcodeIcon,
  PhoneIcon,
  ShoppingCartIcon,
  UserIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
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

import StepConfirmation from "@/components/ticketing/StepConfirmation";
import { extractHourMin, extractHourMinFromUTC } from "@/utils/time-converter";
import toast from "react-hot-toast";
import useGetSinglePlayReservation from "@/hooks/useGetSinglePlayReservation";
import { playReservationService } from "@/services/play/playreservation.service";
const reservationSchema = z.object({
  mobile_number: z.string().min(1, { message: "Mobile number is required" }),
  payment_method: z.string().min(1, { message: "Payment method is required" }),
  amount: z.number().min(0, { message: "Amount is required" }),
  customer_type: z.string().optional(),
  member_level: z.string().optional(),
  first_name: z.string(),
  last_name: z.string(),
  branch_id: z.number().min(1, { message: "Branch is required" }),
  date: z.string().min(1, { message: "Date is required" }),
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
      start_hour: z.number().min(0).max(23),
      start_min: z.number().min(0).max(59),
      end_hour: z.number().min(0).max(23),
      end_min: z.number().min(0).max(59),
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
  const { playReservation, playReservationLoading, playReservationRefresh } =
    useGetSinglePlayReservation();
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
      payment_method: "STORE_CASH",
      amount: 0,
      customer_types: [],
      additional_products: [],
    },
  });
  //watch error
  const errors = methods.formState.errors;
  //total price customer_types.reducer with customers.length
  useEffect(() => {
    if (errors.mobile_number) toast.error(errors.mobile_number.message);
    if (errors.branch_id) toast.error(errors.branch_id.message);
    // if (errors.first_name) toast.error(errors.first_name.message);
    // if (errors.last_name) toast.error(errors.last_name.message);
    // Add more as needed
  }, [errors]);
  const onSubmit = async (data) => {
    console.log(data);
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      mobile_number: data.mobile_number,
      branch_id: isAdmin ? data.branch_id : user?.branchId,
      reservation_date: data.date,
      total_price: data.amount,
      status: "CONFIRMED",
      payment_status: "PAID",
      payment_method: data.payment_method,
      customer_types:
        data.customer_types?.map((item) => {
          return {
            rule_id: item.rule_id,
            price: item.price,
            start_hour: item.start_hour,
            start_min: item.start_min,
            end_hour: item.end_hour,
            end_min: item.end_min,
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
      const response = await playReservationService.createPlayReservation(
        payload
      );
      setActiveStep(4);
      setDisabledSteps([1, 2, 3]);
      setReservationId(response.data.playReservation.id); // <-- Correct way
      console.log("RESID", response.data.playReservation.id);
      playReservationRefresh(response.data.playReservation.id); // <-- Pass correct ID
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
                    <div className="mt-2 flex flex-wrap gap-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Customer Tier:{" "}
                        </span>
                        <span className="inline-block bg-muted px-2 py-0.5 rounded text-sm font-medium">
                          {methods.watch("customer_type") || "_"}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Member Level:{" "}
                        </span>
                        <span className="inline-block bg-muted px-2 py-0.5 rounded text-sm font-medium">
                          {methods.watch("member_level") || "_"}
                        </span>
                      </div>
                    </div>
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

              <div className="flex gap-2 justify-end mt-4">
                {/* back btn */}
                {activeStep !== 4 && (
                  <Button
                    variant="outline"
                    onClick={() => setActiveStep((prev) => prev - 1)}
                    className="cursor-pointer"
                    disabled={activeStep === 1}
                  >
                    Back
                  </Button>
                )}
                {activeStep === 4 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      //refresh page
                      window.location.reload();
                    }}
                    className="cursor-pointer"
                  >
                    New Booking
                  </Button>
                )}

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
                  <Button
                    type="submit"
                    className="cursor-pointer"
                    disabled={methods.watch("customer_types").length === 0}
                  >
                    Confirm
                  </Button>
                )}
                {activeStep == 4 && (
                  <StepConfirmation playReservation={playReservation} />
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
