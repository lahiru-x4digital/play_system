"use client";

import { useState } from 'react'
import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { CheckCircle2, AlertCircle, Info, Clock, User, Database, Edit2, Eye } from 'lucide-react';
import CustomerTrackingDialog from './customer-tracking-dialog';
import FeedbackTimeLineCard from './time-line-cards/feedback-time-line-card';
import { formatString } from '@/lib/formatkeyString';
import { formatFeedbackPayload } from './time-line-format-playload';
import ReservationTimeLineCard from './time-line-cards/Reservation-time-line-card';
import { Button } from '@/components/ui/button';
import PosEventTimeLineCard from './time-line-cards/posevent-time-line-card';
import ActionTrackerBeforeAfterView from './time-line-cards/ActionTrackerBeforeAfterView';
import ClubEventTimeLineCard from './time-line-cards/clubevent-time-line-card copy';
import WalkingTimeLineCard from './time-line-cards/walkin-time-line-card';
import WaitingTimeLineCard from './time-line-cards/waiting-time-line-card';
import CustomerTimeLineCard from './time-line-cards/Customer-time-line-card';
import GiftCardTimeLineCard from './time-line-cards/gift-card-time-line-card';

const actionTypeIcons = {
  'Reservation Update': <Edit2 className="w-4 h-4" />,
  'Reservation Create': <Database className="w-4 h-4" />,
  'Reservation Delete': <AlertCircle className="w-4 h-4" />,
  default: <Info className="w-4 h-4" />
};

const actionTypeColors = {
  'Reservation Update': '#dcfce7', // light green
  'Reservation Create': '#dbeafe', // light blue
  'Reservation Delete': '#fee2e2', // light red
  default: '#f3f4f6' // light gray
};

const actionTypeIconColors = {
  'Reservation Update': '#10b981',
  'Reservation Create': '#3b82f6',
  'Reservation Delete': '#ef4444',
  default: '#6b7280'
};

export default function TimeLineComp({ trackingHistory = []}) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedActionType, setSelectedActionType] = useState('');
  const [selectedId, setSelectedId] = useState(null);


  const handleOpenDialog = (action_type,id) => {
    setSelectedActionType(action_type);
    setSelectedId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedActionType('');
    setSelectedId(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  return (
    <div className="mx-auto px-2">
      <VerticalTimeline 
        layout="2-columns" 
        className="vertical-timeline"
        style={{
          '--vertical-timeline-line-color': '#e5e7eb',
          '--vertical-timeline-line-width': '3px',
          '--vertical-timeline-line-height': '100%',
          '--vertical-timeline-line-radius': '1.5rem'
        }}
      >
       
        {trackingHistory.map((log) => (
          <VerticalTimelineElement
            key={log.id}
            
            contentStyle={{
              background: actionTypeColors[log.action_type] || actionTypeColors.default,
              color: '#1e293b',
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              borderLeft: `3px solid ${actionTypeColors[log.action_type] || actionTypeColors.default}`,

            }}
            contentArrowStyle={{
              borderRight: `6px solid ${actionTypeColors[log.action_type] || actionTypeColors.default}`,
            }}
            date=""
            iconStyle={{
              background: actionTypeIconColors[log.action_type] || actionTypeIconColors.default,
              color: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              border: `2px solid ${actionTypeColors[log.action_type] || actionTypeIconColors.default}`
            }}
            icon={actionTypeIcons[log.action_type] || actionTypeIcons.default}
          >
       <h3 className="text-sm font-semibold text-gray-800 leading-snug">
              {formatString(log.action_type)} 
            </h3>
       <h3 className="text-xs font-semibold text-gray-500 leading-snug capitalize flex gap-2">
              <span>
              {log.operation}</span> / <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(log.created_at)}
              </span>
            </h3>
       
            {
              log.action_type==='customer' && <CustomerTimeLineCard data={log}/>
            }
            {
              log.action_type==='feedback' && <FeedbackTimeLineCard data={log}/>
            }
       
            {
              log.action_type==='reservation' && <ReservationTimeLineCard data={log}/>
            }
            {
              log.action_type==='pos_event' && <PosEventTimeLineCard data={log}/>
            }
            {
              log.club_event_id && <ClubEventTimeLineCard data={log}/>
            }
            {
              log.walkin_id && <WalkingTimeLineCard data={log}/>
            }
            {
              log.waiting_id && <WaitingTimeLineCard data={log}/>
            }
            {
              log.gift_card_transaction_id && <GiftCardTimeLineCard data={log}/>
            }
          

            {log.action_type !== 'customer_profile' && log.action_data?.table_name && log.action_data?.id && (
              <button 
                onClick={() => handleOpenDialog(log,null)}
                className="mt-2 px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                View {formatString(log.action_data?.table_name)} Details
              </button>
            )}
        {log.waiting_id && (
         <Button 
           className="mt-2" 
           variant="default" 
           size="icon"
           onClick={() => handleOpenDialog(log.action_type,log.waiting_id)}
         >
           <Eye className="w-4 h-4"/>
         </Button>
       )}
        {log.walkin_id && (
         <Button 
           className="mt-2" 
           variant="default" 
           size="icon"
           onClick={() => handleOpenDialog(log.action_type,log.walkin_id)}
         >
           <Eye className="w-4 h-4"/>
         </Button>
       )}
       {log.feedback_id && (
         <Button 
           className="mt-2" 
           variant="default" 
           size="icon"
           onClick={() => handleOpenDialog(log.action_type,log.feedback_id)}
         >
           <Eye className="w-4 h-4"/>
         </Button>
       )}
       {log.club_event_id && (
         <Button 
           className="mt-2" 
           variant="default" 
           size="icon"
           onClick={() => handleOpenDialog(log.action_type,log.club_event_id)}
         >
           <Eye className="w-4 h-4"/>
         </Button>
       )}
       {log.pos_event_id && (
         <Button 
           className="mt-2" 
           variant="default" 
           size="icon"
           onClick={() => handleOpenDialog(log.action_type,log.pos_event_id)}
         >
           <Eye className="w-4 h-4"/>
         </Button>
       )}
       {log.reservation_id && (
         <Button 
           className="mt-2" 
           variant="default" 
           size="icon"
           onClick={(e) => {
             e.stopPropagation();
             window.open(`/dashboard/reservations/${log.reservation_id}`, '_blank');
           }}
         >
           <Eye className="w-4 h-4"/>
         </Button>
       )}
       {log.action_type==='customer' && (
         <Button 
           className="mt-2" 
           variant="default" 
           size="icon"
           onClick={(e) => {
             e.stopPropagation();
             window.open(`/dashboard/customers/${log.customer_id}`, '_blank');
           }}
         >
           <Eye className="w-4 h-4"/>
         </Button>
       )}
      
          </VerticalTimelineElement>
        ))}
       
      </VerticalTimeline>

      <CustomerTrackingDialog
        open={openDialog}
        action_type={selectedActionType}
        onClose={handleCloseDialog}
        id={selectedId}
      />
    </div>
  );
}
