'use client'
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle ,CardContent } from '../ui/card';


// Sample data
const rules = [
  {
    id: 1,
    name: "Basic Consultation",
    slot_booking_period: 30,
    price: "$50"
  },
  {
    id: 2,
    name: "Premium Session",
    slot_booking_period: 60,
    price: "$100"
  },
  {
    id: 3,
    name: "Extended Consultation",
    slot_booking_period: 90,
    price: "$150"
  }
];

const AnimatedRuleCard = ({rule,onRuleSelect,selectedRule}) => {

  return (
    <div className="p-8">
          <motion.div
            key={rule.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3,
              layout: { duration: 0.2 }
            }}
            whileHover={{ 
              y: -4,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onRuleSelect(rule)}
            className="cursor-pointer"
          >
            <Card
              className={`rounded-2xl border-2 transition-all duration-200 relative overflow-hidden ${
                selectedRule?.id === rule.id 
                  ? 'border-green-500 shadow-lg shadow-green-500/20' 
                  : 'border-transparent hover:border-gray-200 shadow-sm'
              }`}
            >
              {/* Animated selection indicator */}
              <AnimatePresence>
                {selectedRule?.id === rule.id && (
                  <>
                    {/* Animated border glow */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 rounded-2xl ring-2 ring-green-500/20 pointer-events-none"
                    />
                    
                    {/* Selection badge */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 500,
                        damping: 30 
                      }}
                      className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                    >
                      <motion.svg
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20,6 9,17 4,12" />
                      </motion.svg>
                    </motion.div>

                    {/* Subtle background pulse */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.03, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 bg-green-500 rounded-2xl pointer-events-none"
                    />
                  </>
                )}
              </AnimatePresence>

              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold tracking-tight pr-8">
                  <motion.span
                    animate={{
                      color: selectedRule?.id === rule.id ? '#10b981' : '#1f2937'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {rule.name}
                  </motion.span>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  <motion.div 
                    className="flex items-center justify-between text-sm"
                    animate={{
                      scale: selectedRule?.id === rule.id ? 1.02 : 1
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-gray-600">
                      Duration
                    </span>
                    <motion.span 
                      className="font-medium"
                      animate={{
                        color: selectedRule?.id === rule.id ? '#10b981' : '#374151'
                      }}
                    >
                      {rule.slot_booking_period} mins
                    </motion.span>
                  </motion.div>

                  {rule.price && (
                    <motion.div 
                      className="flex items-center justify-between text-sm"
                      animate={{
                        scale: selectedRule?.id === rule.id ? 1.02 : 1
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-gray-600">Price</span>
                      <motion.span 
                        className="inline-block px-2 py-0.5 text-sm font-medium rounded-full"
                        animate={{
                          backgroundColor: selectedRule?.id === rule.id ? '#d1fae5' : '#f3f4f6',
                          color: selectedRule?.id === rule.id ? '#10b981' : '#6b7280'
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {rule.price}
                      </motion.span>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
    </div>
  );
};

export default AnimatedRuleCard;