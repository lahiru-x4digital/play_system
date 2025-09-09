import { formatString } from '@/lib/formatkeyString';
import React from 'react';

export default function ActionTrackerBeforeAfterView({ label, before, after }) {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white flex items-center justify-between gap-4">
      {/* Key/Label */}
      <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">
        {formatString(label)}
      </p>
      <p className="text-sm font-extrabold text-gray-700 whitespace-nowrap ">
      {before || '-'}
      </p>

      {/* Values */}
      {/* <div className="flex items-center gap-8 flex-1 justify-end">
        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500 uppercase">Before</span>
          <span className="text-sm text-red-600 font-medium whitespace-nowrap">
            {before || '-'}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-xs text-gray-500 uppercase">Now</span>
          <span className="text-sm text-green-600 font-medium whitespace-nowrap">
            {after || '-'}
          </span>
        </div>
      </div> */}
    </div>
  );
}
