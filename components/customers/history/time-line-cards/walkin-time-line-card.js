import { formatReservationDateTime } from '@/lib/format-time';
import { formatString } from '@/lib/formatkeyString'
import { convertTimeZoneReservationDateTime } from '@/lib/time-zone-converter';
import { formatDate } from '@/lib/utils'
import { Clock, User } from 'lucide-react'
import React from 'react'
import ActionTrackerBeforeAfterView from './ActionTrackerBeforeAfterView'

export default function WalkingTimeLineCard({data}) {
  const action_data_keys=Object.keys(data.action_data)
// console.log(data)
const changes= action_data_keys.map((key)=>{
  let after=""
  let before=""
  if(key === "table_numbers"){
   after = data.walkin_list?.tables?.map((table)=>table.table?.table_number).filter(Boolean).join(", ") || "-"
   before = data.action_data[key] || "-"
  } else if(key === "start_time" || key === "end_time"){
    after = convertTimeZoneReservationDateTime(data.walkin_list[key])
    before = convertTimeZoneReservationDateTime(data.action_data[key])
  }
else{
  after = data.walkin_list[key] 
  before = data.action_data[key]
  }
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
