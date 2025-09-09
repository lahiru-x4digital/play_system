import { formatReservationDateTime } from '@/lib/format-time';
import { formatString } from '@/lib/formatkeyString'
import { convertTimeZoneReservationDateTime } from '@/lib/time-zone-converter';
import { formatDate } from '@/lib/utils'
import { Clock, User } from 'lucide-react'
import React from 'react'
import ActionTrackerBeforeAfterView from './ActionTrackerBeforeAfterView'

export default function ClubEventTimeLineCard({data}) {
  const action_data_keys=Object.keys(data.action_data)
const changes= action_data_keys.map((key)=>{
  let after = parseFloat(data.customer?.total_points_balance).toFixed(2);
  let before = parseFloat(data.action_data[key]).toFixed(2);
  return (
   <ActionTrackerBeforeAfterView key={key} label={key} before={before} after={after} />
  )
})
    return (
    <div className="space-y-1">
    {changes}
    </div>
  )
  
}
