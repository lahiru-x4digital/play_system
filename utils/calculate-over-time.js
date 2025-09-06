function getBarcodeAllowedEnd(barcode) {
  let endHour = barcode.end_hour;
  let endMin = barcode.end_min;

  // If extra times exist, use the last one
  if (
    barcode.playReservationBarCodeExtraTimes &&
    barcode.playReservationBarCodeExtraTimes.length > 0
  ) {
    const lastExtra =
      barcode.playReservationBarCodeExtraTimes[
        barcode.playReservationBarCodeExtraTimes.length - 1
      ];
    endHour = lastExtra.end_hour ?? endHour;
    endMin = lastExtra.end_min ?? endMin;
  }

  const allowedEnd = new Date();
  allowedEnd.setHours(endHour ?? 0, endMin ?? 0, 0, 0);
  return allowedEnd;
}

export function getOverstayDuration(barcode) {
  const allowedEnd = getBarcodeAllowedEnd(barcode);
  const now = new Date();

  let endTime = allowedEnd;
  let compareTime = barcode.completed_at ? new Date(barcode.completed_at) : now;

  const overstayMs = compareTime - endTime;
  return overstayMs > 0 ? Math.floor(overstayMs / 60000) : 0; // minutes
}
