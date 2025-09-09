import { formatReservationDateTime } from '@/lib/format-time';
import { formatString } from '@/lib/formatkeyString';
import { convertTimeZoneReservationDateTime } from '@/lib/time-zone-converter';
import { formatDate } from '@/lib/utils';
import { CreditCard, DollarSign, RefreshCw, Hash } from 'lucide-react';
import React from 'react';

export default function GiftCardTimeLineCard({ data }) {
  const transaction = data.gift_card_transaction;

  return (
    <div className="space-y-2">
      <div className="p-4 border rounded-2xl shadow-sm bg-white">
        {/* Header */}
        {/* <div className="flex items-center justify-between border-b pb-2 mb-3">
          <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-500" />
            Gift Card Transaction
          </h3>
          <span className="text-xs text-gray-500">
            {formatDate(transaction?.created_at) || '—'}
          </span>
        </div> */}

        {/* Transaction Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
          
            <p className="text-sm text-gray-600">
              <span className="font-medium">Amount:</span>{' '}
              <span className="font-bold text-gray-800">
                {transaction?.amount || '-'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* <RefreshCw className="w-4 h-4 text-blue-600" /> */}
            <p className="text-sm text-gray-600">
              <span className="font-medium">Transaction Type:</span>{' '}
              <span className="font-bold text-gray-800 capitalize">
                {transaction?.transaction_type || '-'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            
            <p className="text-sm text-gray-600">
              <span className="font-medium">Remaining Balance:</span>{' '}
              <span className="font-bold text-gray-800">
                {transaction?.remaining_balance || '-'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* <Hash className="w-4 h-4 text-purple-600" /> */}
            <p className="text-sm text-gray-600">
              <span className="font-medium">Card Number:</span>{' '}
              <span className="font-mono font-bold text-gray-900">
                {transaction?.gift_card?.card_number || '-'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
