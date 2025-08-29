import React, { useEffect, useState } from "react";
import SelectBranch from "../common/selectBranch";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { bookingService } from "@/services/booking.service";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { format } from "date-fns";
import { motion } from "framer-motion";
import GenerateTimeSlots, { TimeSlotSelector } from "./GenerateTimeSlots";
import AnimatedRuleCard from "./AnimatedRuleCard";
import { Input } from "../ui/input";
import AddToCart from "./AddToCart";
import { Button } from "../ui/button";
import CartItem from "./CartItem";

export default function CreateBookingInput() {
  const { control, watch } = useFormContext();
    const { fields, append, remove } = useFieldArray({
      control: control,
      name: "customer_types",
    });
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [kidsCount, setKidsCount] = useState("");
//!
 const [kids, setKids] = useState([
    { name: '', birthday: '' }
  ]);

  const handleKidChange = (index, field, value) => {
    const updatedKids = [...kids];
    updatedKids[index] = { ...updatedKids[index], [field]: value };
    setKids(updatedKids);
  };

  const addKid = () => {
    if (kids.length < kidsCount) {
      setKids([...kids, { name: '', birthday: '' }]);
    } else if (kids.length > kidsCount) {
      setKids(kids.slice(0, kidsCount));
    }
  };

  const removeKid = (index) => {
    const updatedKids = [...kids];
    updatedKids.splice(index, 1);
    setKids(updatedKids);
    setKidsCount(kidsCount - 1);
  };

  React.useEffect(() => {
    addKid();
  }, [kidsCount]);
//!
  const branchId = watch("branch_id");
  const selectedDate = watch("date");

  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      try {
        const { success, data } = await bookingService.getReservationRules({
          branch_id: branchId,
          date: selectedDate,
        });
        if (success) {
          setRules(data);
        }
      } catch (error) {
        console.error("Failed to fetch reservation rules:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, [branchId, selectedDate]);

  const handleAddToCart = (cartItem) => {
    append({
      rule_id: cartItem.rule_id,
      price: cartItem.price,
      customers: cartItem.customers,
      rule_name:cartItem.rule_name
    });
  };
  console.log(watch("customer_types"))
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Booking</h1>

      <div className="">
        <Controller
          name="branch_id"
          control={control}
          rules={{ required: "Branch is required" }}
          render={({ field, fieldState }) => (
            <SelectBranch
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              label="Branch"
            />
          )}
        />

        <Controller
          name="date"
          control={control}
          rules={{ required: "Date is required" }}
          render={({ field, fieldState }) => (
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                className="border rounded px-3 py-2 w-full"
                {...field}
              />
              {fieldState.error && (
                <p className="text-red-500 text-sm mt-1">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
          defaultValue={new Date().toISOString().split("T")[0]}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-3"></div>
          <span className="text-muted-foreground">
            Loading availability rules...
          </span>
        </div>
      ) : (
        <div className="">
          <div className=" bg-gray-50">
            <h1>Choose Your Child’s Age Group</h1>
         <div className="flex flex-row gap-2">
         {rules.map((rule, i) => (
              <div className="min-w-96 "
              >
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <AnimatedRuleCard rule={rule} onRuleSelect={setSelectedRule} selectedRule={selectedRule} />
                </motion.div>
              </div>
            ))}
         </div>
          </div>
        <CartItem/>
          <div className="mt-6 p-6 border rounded-lg bg-white">
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Number of Kids</label>
        <Input 
          type="number" 
          min="1" 
          value={kidsCount} 
          onChange={(e) => setKidsCount(Math.max(1, parseInt(e.target.value)))} 
          className="w-24"
        />
      </div>

      <div className="space-y-6">
        {kids.map((kid, index) => (
          <div key={index} className="p-4 border rounded-lg relative">
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeKid(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                aria-label="Remove kid"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            
            <h3 className="font-medium mb-4">Kid {index + 1}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <Input
                  type="text"
                  value={kid.name}
                  onChange={(e) => handleKidChange(index, 'name', e.target.value)}
                  placeholder="Enter name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Birthday</label>
                <Input
                  type="date"
                  value={kid.birthday}
                  onChange={(e) => handleKidChange(index, 'birthday', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
          {selectedRule && (
            <div className="mt-8">
              <TimeSlotSelector
              onSlotSelect={(slot) => {
                setSelectedSlot(slot)
                console.log(slot)
              }}
                rule={selectedRule || []}
                selectedDate={selectedDate}
                key={selectedRule?.id || 'no-rule'}
                kidsCount={kidsCount}
              />
            </div>
          )}
      <Button
        onClick={() => {
          append({
            rule_id: selectedRule.id,
            price: selectedRule.price,
            customers: kids,
            rule_name: selectedRule.name,
            start_time: selectedSlot.formattedStart,
            end_time: selectedSlot.formattedEnd
          })
       
        }}
      >
        Add to Cart
      </Button>
        </div>
      )}
    </div>
  );
}
