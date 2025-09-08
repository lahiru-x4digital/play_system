import React, { useState, useEffect } from 'react'
//import { reservationService } from '@/services/reservation.service'
import { format } from 'date-fns'
import { waitingListService } from '@/services/waitinglist.service'

export default function WaitingListDetails({ id }) {
  const [reservation, setReservation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const data = await waitingListService.getWaitingListById(id)
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900">Customer Information</h3>
          <div className="space-y-1">
            <div>
              <span className="font-medium">Name:</span> {reservation.customer.first_name} {reservation.customer.last_name || ''}
            </div>
            <div>
              <span className="font-medium">Mobile:</span> {reservation.customer.mobile_number}
            </div>
            <div>
              <span className="font-medium">Customer Level:</span> {reservation.customer.customer_level}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-gray-900">Waiting List Details</h3>
          <div className="space-y-1">
            <div>
              <span className="font-medium">Status:</span> 
              <span className={`px-2 py-1 rounded-full text-sm ${
                reservation.status === 'NOSHOW' ? 'bg-red-100 text-red-700' : 
                reservation.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                'bg-gray-100 text-gray-700'
              }`}>
                {reservation.status}
              </span>
            </div>
            <div>
              <span className="font-medium">Party Size:</span> {reservation.party_size}
            </div>
            <div>
              <span className="font-medium">Branch:</span> {reservation.branch.branch_name}
            </div>
            <div>
              <span className="font-medium">Created:</span> {format(new Date(reservation.createdAt), 'MMM d, yyyy h:mm a')}
            </div>
            <div>
              <span className="font-medium">Status Updated:</span> {format(new Date(reservation.status_updated_at), 'MMM d, yyyy h:mm a')}
            </div>
          </div>
        </div>
      </div>

      {reservation.notes && (
        <div className="mt-4">
          <h3 className="font-medium text-gray-900">Notes</h3>
          <p className="text-gray-600">{reservation.notes}</p>
        </div>
      )}
    </div>
  )
}
