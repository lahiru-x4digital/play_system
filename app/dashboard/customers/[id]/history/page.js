'use client'
import TimeLineComp from '@/components/customers/history/time-line-comp'
import useGetCustomerTracking from '@/hooks/useGetCustomerTracking';
import React from 'react'
import { format } from 'date-fns'
import { Calendar } from 'lucide-react'
import { useParams, useSearchParams } from 'next/navigation';

const QUICK_RANGES = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'This Month', days: new Date().getDate() - 1 },
];

export default function page() {
  const {id}=useParams()
  const searchParams = useSearchParams();
  const mobile = searchParams.get("mobile");
  const { trackingHistory, loading, error, params, setCustomerId, setActionTypeFilter, setDateRange, refresh } = useGetCustomerTracking({id,mobile});
  const [startDate, setStartDate] = React.useState(new Date());
  const [endDate, setEndDate] = React.useState(new Date());

  const handleDateChange = (event) => {
    const selectedDate = new Date(event.target.value);
    // Reset time to start of day (00:00:00)
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    
    // Set end to end of the same day (23:59:59.999)
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);

    setStartDate(start);
    setEndDate(end);
    setDateRange({
      start: start,
      end: end
    });
    refresh();
  };

  const handleFilter = () => {
    setDateRange({
      start: startDate,
      end: endDate
    });
    refresh();
  };

  const handleReset = () => {
    setStartDate(new Date());
    setEndDate(new Date());
    setDateRange({
      start: '',
      end: ''
    });
    refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Filter History</h2>
        
        {/* Quick Range Buttons */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Range</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_RANGES.map((range) => (
              <button
                key={range.label}
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(start.getDate() - range.days);
                  setStartDate(start);
                  setEndDate(end);
                }}
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="date"
                id="start-date"
                value={startDate.toISOString().split('T')[0]}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="date"
                id="end-date"
                value={endDate.toISOString().split('T')[0]}
                min={startDate.toISOString().split('T')[0]}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleFilter}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Apply Filter
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 flex items-center text-sm text-gray-500">
        <Calendar className="w-4 h-4 mr-2" />
        <span>
          Showing results from {format(startDate, 'MMM d, yyyy')} to {format(endDate, 'MMM d, yyyy')}
          {trackingHistory?.length > 0 && ` • ${trackingHistory.length} entries found`}
        </span>
      </div>

      <div className="mt-6">
        <TimeLineComp 
          trackingHistory={trackingHistory} 
          loading={loading} 
          error={error} 
          handleDateChange={handleDateChange} 
        />
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          <p>Error loading tracking history: {error.message}</p>
        </div>
      </div>
    );
  }
}
