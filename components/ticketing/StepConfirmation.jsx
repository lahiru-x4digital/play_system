import useGetSinglePlayReservation from "@/hooks/useGetSinglePlayReservation";
import React, { useEffect, useMemo } from "react";
import BarcodePrintView from "../booking/BarcodePrintView";

export default function StepConfirmation({ playReservation }) {
  return (
    <div>
      <BarcodePrintView reservation={playReservation} />
    </div>
  );
}
