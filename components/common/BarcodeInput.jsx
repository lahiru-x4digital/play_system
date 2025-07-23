import useGetSingleBarcode from '@/hooks/useGetSingleBarcode';
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

export default function BarcodeInput({ index, typeName, duration }) {
    const { register,watch,setValue } = useFormContext();
    const {barcode,barcodeLoading,barcodeRefresh}=useGetSingleBarcode()

    useEffect(()=>{
        if(watch(`barcodes.${index}.barcode`).length===10){
            barcodeRefresh(watch(`barcodes.${index}.barcode`))
        }
        
    },[watch(`barcodes.${index}.barcode`)]);

    useEffect(()=>{
        if(barcode && barcode.barcode_number){
            console.log({"CODE TIME":barcode.time_duration,"RESERVATION DURATION":duration,"TYPE of Code":barcode.play_customer_type?.name,"TYPE NAME":typeName})
            if(barcode.time_duration===duration && barcode.play_customer_type?.name===typeName){
                setValue(`barcodes.${index}.barcode`,barcode.barcode_number)
            }else{
                setValue(`barcodes.${index}.barcode`,'')
            }
        } 
    },[barcode])

    return (
        <div style={{ marginBottom: 16 }}>
            <div>
                <strong>Type:</strong> {typeName} <br />
                <strong>Duration:</strong> {duration}
            </div>
            <input
                {...register(`barcodes.${index}.barcode`)}
                placeholder={`Enter barcode for ${typeName}`}
                style={{ marginTop: 8, width: 250 }}
            />
        </div>
    );
}
