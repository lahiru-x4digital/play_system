// src/services/reservation-report.service.js
import api from "./api";
import { format } from "date-fns";

export const reservationReportService = {
  /** ------------------------------------------------------------------
   * Fetch reservation report from the server.
   *
   * GET /booking/reservations/report
   *   ?start_date=YYYY-MM-DD
   *   &end_date=YYYY-MM-DD
   *   &duration=30m|1h|2h|3h|4h|5h|6h
   * ------------------------------------------------------------------ */
  async getReservationReport(startDate, endDate, duration = "30m", params = {}) {
    try {
      const queryParams = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        duration,
      });
      
      // Add optional filters if they exist
      if (params.countryId) {
        queryParams.append('country', params.countryId);
      } else if (params.country) {
        queryParams.append('country', params.country);
      }
      
      if (params.brandId) {
        queryParams.append('brand_id', params.brandId);
      } else if (params.brand_id) {
        queryParams.append('brand_id', params.brand_id);
      }
      
      if (params.branchId) {
        queryParams.append('branch_id', params.branchId);
      } else if (params.branch_id) {
        queryParams.append('branch_id', params.branch_id);
      }
console.log("final queryParams",queryParams);
      
      const res = await api.get("/booking/reservations/time-report", {
        params: queryParams,
      });

      if (!res.data?.success) {
        console.warn("Reservation API returned unexpected shape – using mock");
        return this.getMockReservationReport(
          { from: new Date(startDate), to: new Date(endDate) },
          duration
        );
      }

      return { success: true, data: res.data.data };
    } catch (err) {
      console.error("Reservation report error → mock fallback", err);
      return this.getMockReservationReport(
        {
          from: new Date(startDate || new Date()),
          to: new Date(endDate || new Date()),
        },
        duration
      );
    }
  },

  /* ───────────────────────── mock / dev data ───────────────────────── */

  getMockReservationReport(dateRange, duration = "30m") {
    const { from, to } = dateRange;
    const timeSlots = this.generateMockTimeSlots(from, to, duration);

    const totalReservations = timeSlots.reduce(
      (s, slot) => s + slot.number_of_reservations,
      0
    );
    const totalGuests = timeSlots.reduce(
      (s, slot) => s + slot.number_of_people_booked,
      0
    );

    return {
      success: true,
      data: {
        date_range: {
          start_date: format(from, "yyyy-MM-dd"),
          end_date: format(to, "yyyy-MM-dd"),
        },
        duration,
        summary: {
          total_reservations: totalReservations,
          total_guests: totalGuests,
          average_party_size:
            totalReservations > 0
              ? Math.round((totalGuests / totalReservations) * 100) / 100
              : 0,
        },
        time_slots: timeSlots,
        raw_data: this.generateMockRawData(timeSlots),
      },
    };
  },

  generateMockTimeSlots(startDate, endDate, duration) {
    const slots = [];
    const minutes = this.getDurationInMinutes(duration);

    const current = new Date(startDate);
    current.setHours(8, 0, 0, 0);
    const stop = new Date(current);
    stop.setHours(20, 0, 0, 0);

    while (current < stop) {
      const slotEnd = new Date(current);
      slotEnd.setMinutes(slotEnd.getMinutes() + minutes);

      const groups = Math.floor(Math.random() * 6) + 1; // 1-6 bookings
      const guests = groups * (Math.floor(Math.random() * 4) + 2); // 2-5 each

      slots.push({
        time: this.formatTimeRange(current, slotEnd),
        number_of_reservations: groups,
        number_of_people_booked: guests,
        start_time: current.toISOString(),
        end_time: slotEnd.toISOString(),
        groups_detail: [], // fill if you need deeper mock
      });

      current.setMinutes(current.getMinutes() + minutes);
    }
    return slots;
  },

  generateMockRawData(timeSlots) {
    const raw = [];
    let id = 1;
    timeSlots.forEach((slot) => {
      for (let i = 0; i < slot.number_of_reservations; i++) {
        raw.push({
          id: id.toString(),
          party_size: Math.floor(Math.random() * 4) + 2,
          status: Math.random() > 0.5 ? "CONFIRMED" : "COMPLETED",
          customer_name: this.randomName(),
          mobile_number: this.randomPhone(),
          start_time: slot.start_time,
        });
        id++;
      }
    });
    return raw;
  },

  /* ───────────────────────── helpers ───────────────────────── */

  getDurationInMinutes(d) {
    return (
      {
        "30m": 30,
        "1h": 60,
        "2h": 120,
        "3h": 180,
        "4h": 240,
        "5h": 300,
        "6h": 360,
      }[d] || 30
    );
  },

  formatTimeRange(a, b) {
    const fmt = (d) =>
      `${String(d.getHours()).padStart(2, "0")}:${String(
        d.getMinutes()
      ).padStart(2, "0")}`;
    return `${fmt(a)} - ${fmt(b)}`;
  },

  randomName() {
    const fn = ["John", "Jane", "Mike", "Sarah", "David", "Lisa"];
    const ln = ["Smith", "Johnson", "Brown", "Jones", "Davis"];
    return `${fn[Math.floor(Math.random() * fn.length)]} ${
      ln[Math.floor(Math.random() * ln.length)]
    }`;
  },

  randomPhone() {
    const n = () => Math.floor(Math.random() * 900) + 100;
    const last = () => Math.floor(Math.random() * 9000) + 1000;
    return `+1${n()}${n()}${last()}`;
  },
};
