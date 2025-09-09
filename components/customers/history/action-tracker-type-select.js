import React from "react";

export default function ActionTrackerTypeSelect({onChange,value}) {
  const actionTypes = [

    { value: "all", label: "All",  },
    { value: "club_event", label: "Club Event", },
    { value: "pos_event", label: "Pos Event",},
    { value: "feedback", label: "Feedback",},
    { value: "customer", label: "Customer Profile",},
    { value: "reservation", label: "Reservation",},
    { value: "waiting_list", label: "Waiting List",},
    { value: "walkin_list", label: "Walk-in List",},
    { value: "gift_card", label: "Gift Card",},
  ];

  const handleChange = (e) => {
    onChange(e.target.value); // just the string
  };
  
  return (
    <div>
      <select
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 "
        onChange={handleChange}
        value={value }
      >
        {actionTypes.map((action) => (
          <option key={action.value} value={action.value}>
            {action.label}
          </option>
        ))}
      </select>
    </div>
  );
}
