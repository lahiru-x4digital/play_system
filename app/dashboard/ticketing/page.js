"use client";
import { Stepper } from "@/components/common/StepperComp";
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
import BookingConfimation from "@/components/ticketing/BookingConfimation";
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
  const [activeStep, setActiveStep] = React.useState(0);
  const isAdmin = useIsAdmin();
  const user = useSessionUser();
  const steps = [
    {
      id: "mobile",
      title: "Mobile Number",
      icon: <PhoneIcon className="h-4 w-4" />,
    },
    {
      id: "profile",
      title: "Customer Profile",
      icon: <UserIcon className="h-4 w-4" />,
    },
    {
      id: "booking",
      title: "Create Booking",
      icon: <ShoppingCartIcon className="h-4 w-4" />,
    },
    {
      id: "confirmation",
      title: "Confirmation",
      icon: <BarcodeIcon className="h-4 w-4" />,
    },
  ];

  const handleNext = () =>
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handlePrevious = () => setActiveStep((prev) => Math.max(prev - 1, 0));
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
  const onSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const data = methods.getValues();
    console.log("Form submitted:", data);
    // Add your form submission logic here
  };
  console.log(methods.watch("first_name"));
  return (
    <div className="">
      {/* Horizontal Stepper */}
      <div className="">
        <Stepper
          steps={steps}
          activeStep={activeStep}
          showNumbers={false}
          clickable
          orientation="horizontal"
          onStepClick={setActiveStep}
        />
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="w-full flex flex-col gap-4 m-2 border-2 p-4 rounded-2xl">
              {activeStep === 0 && (
                <>
                  <PhoneNumberField
                    control={methods.control}
                    name="mobile_number"
                    defaultCountry="ae"
                    preferred={["ae", "sa", "lk", "us", "gb"]}
                  />
                </>
              )}
              {activeStep === 1 && (
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
              {activeStep === 2 && <CreateBookingInput />}
              {activeStep === 3 && <BookingConfimation />}

              <div className="flex gap-2 justify-end">
                {/* back btn */}
                <Button
                  variant="outline"
                  onClick={() => setActiveStep((prev) => prev - 1)}
                  className="cursor-pointer"
                >
                  Back
                </Button>
                {activeStep === 0 && (
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveStep(1);
                    }}
                    className="cursor-pointer"
                  >
                    Check Profile
                  </Button>
                )}
                {activeStep === 1 && (
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveStep(2);
                    }}
                    className="cursor-pointer"
                  >
                    Create Booking
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
                    Confirm
                  </Button>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
