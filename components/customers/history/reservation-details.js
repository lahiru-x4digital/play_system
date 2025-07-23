import React, { useState, useEffect } from 'react'
import { reservationService } from '@/services/reservation.service'
import { format } from 'date-fns'

export default function ReservationDetails({ id }) {
  const [reservation, setReservation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const data = await reservationService.getReservationById(id)
        if (data?.data) {
          setReservation(data.data)
        } else {
          setError('No reservation found with this ID')
        }
      } catch (error) {
        console.error('Failed to fetch reservation:', error)
        setError('Failed to load reservation details')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchReservation()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 text-lg font-medium">{error}</div>
      </div>
    )
  }

  if (!reservation) return null

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return '#fbbf24'
      case 'CONFIRMED':
        return '#10b981'
      case 'CANCELED':
        return '#ef4444'
      default:
        return '#3b82f6'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified'
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm a')
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm font-medium text-gray-500">Reservation ID</div>
            <div className="text-2xl font-bold">#{reservation.reservation_id || 'Not specified'}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full" style={{ backgroundColor: getStatusColor(reservation.reservationStatus) }}>
              <span className="text-sm font-semibold text-white">
                {reservation.reservationStatus || 'Not specified'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Customer</div>
            <div className="text-lg font-semibold">
              {reservation.customer?.first_name || 'Not specified'} {reservation.customer?.last_name || ''}
            </div>
            <div className="text-gray-600">{reservation.customer?.mobile_number || 'Not specified'}</div>
            <div className="text-gray-600">{reservation.customer?.email || 'Not specified'}</div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500">Branch</div>
            <div className="text-lg font-semibold">
              {reservation.branch?.branch_name || 'Not specified'}
            </div>
            <div className="text-gray-600">{reservation.branch?.address || 'Not specified'}</div>
            <div className="text-gray-600">{reservation.branch?.country?.country_name || 'Not specified'}</div>
          </div>
        </div>
      </div>

      {/* Reservation Details */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-gray-500">Reservation Details</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Date & Time</div>
            <div className="text-lg font-semibold">
              <div>Start: {formatDate(reservation.start_time)}</div>
              <div>End: {formatDate(reservation.end_time)}</div>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500">Party Size</div>
            <div className="text-lg font-semibold">{reservation.party_size || 'Not specified'}</div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500">Section</div>
            <div className="text-lg font-semibold">{reservation.section?.name || 'Not specified'}</div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500">Payment Status</div>
            <div className="text-lg font-semibold" style={{ color: getStatusColor(reservation.payment_status) }}>
              {reservation.payment_status || 'Not specified'}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-gray-500">Additional Information</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Created</div>
            <div className="text-lg font-semibold">{formatDate(reservation.created_date)}</div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500">Last Updated</div>
            <div className="text-lg font-semibold">{formatDate(reservation.updated_date)}</div>
          </div>

          {reservation.notes && (
            <div className="col-span-2">
              <div className="text-sm font-medium text-gray-500">Notes</div>
              <div className="text-gray-700">{reservation.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
