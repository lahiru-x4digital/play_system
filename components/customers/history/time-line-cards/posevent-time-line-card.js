import { formatReservationDateTime } from '@/lib/format-time';
import { formatString } from '@/lib/formatkeyString'
import { convertTimeZoneReservationDateTime } from '@/lib/time-zone-converter';
import { formatDate } from '@/lib/utils'
import { Clock, User } from 'lucide-react'
import React from 'react'
import ActionTrackerBeforeAfterView from './ActionTrackerBeforeAfterView'

export default function PosEventTimeLineCard({data}) {

    return (
    <div className="space-y-1">
    <div className="p-2 border rounded-lg shadow-sm bg-white">
         {/* Key/Label */}
         <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">
           Event Type - {data?.pos_event?.eventType}
         </p>
         <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">
           ELTID - {data?.pos_event?.etlId}
         </p>
       </div>
    </div>
  )
  
}
