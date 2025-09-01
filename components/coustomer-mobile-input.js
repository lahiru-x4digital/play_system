"use client";
import React, { useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import {
  validatePhoneNumber,
  extractCountryCode,
  getISOCountryCode,
  hasMobileNumberRequiredLength, // ← util
} from "@/utils/phone-validation";
import { customerService } from "@/services/customer.service";

const DEBOUNCE_MS = 100;

export function PhoneNumberField({
  control,
  name,
  defaultCountry = "ae",
  preferred = ["ae", "sa", "lk", "us", "gb"],
}) {
  const { setError, clearErrors, getValues, setValue } = useFormContext();
  const timer = useRef(null);
  const [isFree, setIsFree] = useState(false); // banner flag

  /* ----- debounced uniqueness check ------------------ */
  const checkUniqueness = async (digits) => {
    const { success, data } = await customerService.searchCustomerByMobile(
      digits
    );

    if (success && data?.customers?.[0]) {
      // Only update fields if we found a customer
      setValue("first_name", data.customers[0].first_name || "");
      setValue("last_name", data.customers[0].last_name || "");
      setValue("member_level", data.customers[0].customer_level || "");
      setValue("customer_type", data.customers[0].customer_type || "");
      setError(name, { type: "manual", message: "Number Found" });
      setIsFree(false);
    } else if (getValues(name)?.replace(/\D/g, "") === digits) {
      // Only clear errors if the current value matches what we just checked
      clearErrors(name);
      setIsFree(true);
    }
  };

  /* --------------- render ----------------------------- */
  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: "Mobile number is required" }}
      render={({ field, fieldState }) => {
        const cc = extractCountryCode(field.value || `+${defaultCountry}`);
        const iso = getISOCountryCode(cc);
        const { isValid, error } = validatePhoneNumber(field.value, iso);

        return (
          <FormItem>
            <FormLabel>Mobile Number*</FormLabel>

            <FormControl>
              <PhoneInput
                country={defaultCountry}
                value={field.value}
                onChange={(raw, cData) => {
                  field.onChange(raw);

                  // normal format validation
                  const iso2 = getISOCountryCode(cData.dialCode);
                  const result = validatePhoneNumber(raw, iso2);
                  result.isValid
                    ? clearErrors(name)
                    : setError(name, { type: "manual", message: result.error });

                  // reset banner if user changes digits again
                  setIsFree(false);

                  // run uniqueness query only when user typed full length
                  const digits = raw.replace(/\D/g, "");
                  if (timer.current) clearTimeout(timer.current);
                  if (hasMobileNumberRequiredLength(iso2, raw)) {
                    timer.current = setTimeout(
                      () => checkUniqueness(digits),
                      DEBOUNCE_MS
                    );
                  }
                }}
                preferredCountries={preferred}
                enableSearch
              />
            </FormControl>

            <p className="text-xs mt-1 text-gray-600">
              {fieldState.error?.message || error}
            </p>
            {isFree && (
              <p className="text-xs mt-1 text-gray-600">
                Number does not exist
              </p>
            )}
          </FormItem>
        );
      }}
    />
  );
}
