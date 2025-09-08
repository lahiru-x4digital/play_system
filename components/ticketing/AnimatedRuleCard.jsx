"use client";
import React from "react";
import { CheckIcon } from "lucide-react";

const AnimatedRuleCard = ({ rule, onRuleSelect, selectedRule }) => {
  const isSelected = selectedRule?.id === rule.id;

  return (
    <div
      key={rule.id}
      onClick={() => onRuleSelect(rule)}
      className={`cursor-pointer border rounded-xl p-4 mb-2 transition-colors ${
        isSelected ? "border-black bg-black/5" : "border-gray-200 bg-white"
      }`}
      style={{ minWidth: 180 }}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <div
            className={`text-base font-bold ${
              isSelected ? "text-black" : "text-gray-900"
            }`}
          >
            {rule.name}
          </div>
          <div className="text-xs text-gray-500 mt-1">{rule.description}</div>
        </div>
        {isSelected && (
          <span className="inline-flex items-center justify-center w-7 h-7 bg-black rounded-full">
            <CheckIcon size={18} color="white" />
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 mt-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">Duration</span>
          <span
            className={
              isSelected ? "text-black font-semibold" : "text-gray-700"
            }
          >
            {rule.slot_booking_period} mins
          </span>
        </div>
        {rule.price && (
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">Price</span>
            <span
              className={`px-2 py-0.5 rounded-full font-semibold ${
                isSelected
                  ? "bg-black/10 text-black"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {rule.price}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedRuleCard;
