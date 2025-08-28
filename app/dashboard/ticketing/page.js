"use client"
import { Stepper } from '@/components/common/StepperComp';
import { BarcodeIcon, PhoneIcon, ShoppingCartIcon, UserIcon } from 'lucide-react';
import React, { useState } from 'react'

export default function page() {
  const [activeStep, setActiveStep] = React.useState(0);

  const steps = [
    { id: "account", title: "Mobile Number", icon: <PhoneIcon className="h-4 w-4" /> },
    { id: "profile", title: "Customer Profile", icon: <UserIcon className="h-4 w-4" /> },
    { id: "billing", title: "Create Booking", icon: <ShoppingCartIcon className="h-4 w-4" /> },
    { id: "print_parcode", title: "Print Barcode", icon: <BarcodeIcon className="h-4 w-4" /> },
  ];

  const handleNext = () => setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  const handlePrevious = () => setActiveStep((prev) => Math.max(prev - 1, 0));



  return (
    <div className="">
     

      {/* Horizontal Stepper */}
      <div className="">
        <h2 className="text-lg font-semibold mb-4">Ticketing</h2>
        <Stepper
        steps={steps}
        activeStep={activeStep}
        showNumbers={false}
        clickable
        orientation="horizontal"
        onStepClick={setActiveStep}
      />

      </div>

 
    </div>

  )
}
