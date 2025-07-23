import useGetSinglePlayReservation from '@/hooks/useGetSinglePlayReservation'
import React, { useEffect } from 'react'
import { useForm, useFieldArray, FormProvider } from 'react-hook-form'
import BarcodeInput from '../common/BarcodeInput'

export default function AddScanForm({ reservation_id }) {
    const { playReservation, playReservationRefresh } = useGetSinglePlayReservation()
    const methods = useForm({
        defaultValues: {
            barcodes: []
        }
    })
    const { control, handleSubmit, register } = methods
    const { fields, replace } = useFieldArray({
        control,
        name: "barcodes",
    });

    // Load reservation data
    useEffect(() => {
        if (reservation_id) {
            playReservationRefresh(reservation_id)
        }
    }, [reservation_id])

    // Set up barcode fields based on reservation customer types (count > 0)
    useEffect(() => {
        if (playReservation && playReservation.play_reservation_customer_types) {
            replace(
                playReservation.play_reservation_customer_types
                    .filter(ct => ct.count > 0)
                    .map(ct => ({
                        playReservationCustomerTypeId: ct.id,
                        barcode: '',
                        playCustomerTypeName: ct.playCustomerType?.name || '',
                        playPricingDuration: ct.playPricing?.duration || ''
                    }))
            )
        }
    }, [playReservation, replace])

    const onSubmit = (data) => {
        // data.barcodes is an array of { playReservationCustomerTypeId, barcode }
        console.log('Submitted barcodes:', data.barcodes)
    }

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
                {fields.map((field, index) => (
                    <div key={field.id} style={{ marginBottom: 16 }}>
                            <BarcodeInput
                                key={field.id}
                                index={index}
                                typeName={field.playCustomerTypeName}
                                duration={field.playPricingDuration}
                            />
                    </div>
                ))}
            </form>
        </FormProvider>
    )
}
