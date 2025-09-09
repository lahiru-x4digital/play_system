import { formatReservationDateTime } from '@/lib/format-time';
import { formatString } from '@/lib/formatkeyString'
import { convertTimeZoneReservationDateTime } from '@/lib/time-zone-converter';
import { formatDate } from '@/lib/utils'
import { Clock, User } from 'lucide-react'
import React from 'react'


export default function FeedbackTimeLineCard({data}) {
console.log(data)
    return (
    <div className="space-y-1">
    <div className="p-2 border rounded-lg shadow-sm bg-white">
         {/* Key/Label */}
         <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">
           {data?.feedback?.submited && data.operation==='update' ? "Feedback Submitted" : "A feedback link has been sent."}
         </p>
         <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">
         </p>
       </div>
    </div>
  )
  
}
