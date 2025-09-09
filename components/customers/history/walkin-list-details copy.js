import React, { useState, useEffect } from 'react'
import { reservationService } from '@/services/reservation.service'
import { format } from 'date-fns'
import { waitingListService } from '@/services/waitinglist.service'
import walkInService from '@/services/walkin.service'

export default function WalkinListDetails({ id }) {
  const [walkin, setWalkin] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
console.log(walkin)
  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const data = await walkInService.getWalkInById(id)
        if (data?.data) {
          setWalkin(data?.data)
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

  if (!walkin) return null

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
console.log(walkin)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 text-xl">Customer Information</h3>
          <div className="space-y-1">
            <div>
              <span className="font-medium">Name:</span> {walkin.customer.first_name} {walkin.customer.last_name || ''}
            </div>
            <div>
              <span className="font-medium">Mobile:</span> {walkin.customer.mobile_number}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-gray-900 text-xl">Waiting List Details</h3>
          <div className="space-y-1">
            <div>
              <span className="font-medium">Status:</span> 
              <span className={`px-2 py-1 rounded-full text-sm ${
                walkin.status === 'NOSHOW' ? 'bg-red-100 text-red-700' : 
                walkin.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                'bg-gray-100 text-gray-700'
              }`}>
                {walkin.status}
              </span>
            </div>
            <div>
              <span className="font-medium">Party Size:</span> {walkin.party_size}
            </div>
            <div>
              <span className="font-medium">Branch:</span> {walkin.branch.branch_name}
            </div>
            <div>
              <span className="font-medium">Created:</span> {format(new Date(walkin.createdAt), 'MMM d, yyyy h:mm a')}
            </div>
            
          </div>
        </div>
      </div>

      {walkin.notes && (
        <div className="mt-4">
          <h3 className="font-medium text-gray-900">Notes</h3>
          <p className="text-gray-600">{walkin.notes}</p>
        </div>
      )}
    </div>
  )
}
