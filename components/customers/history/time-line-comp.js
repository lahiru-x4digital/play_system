"use client";
import { useState } from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  User,
  Database,
  Edit2,
} from "lucide-react";
import CustomerTrackingDialog from "./customer-tracking-dialog";

const actionTypeIcons = {
  "Reservation Update": <Edit2 className="w-4 h-4" />,
  "Reservation Create": <Database className="w-4 h-4" />,
  "Reservation Delete": <AlertCircle className="w-4 h-4" />,
  default: <Info className="w-4 h-4" />,
};

const actionTypeColors = {
  "Reservation Update": "#dcfce7", // light green
  "Reservation Create": "#dbeafe", // light blue
  "Reservation Delete": "#fee2e2", // light red
  default: "#f3f4f6", // light gray
};

const actionTypeIconColors = {
  "Reservation Update": "#10b981",
  "Reservation Create": "#3b82f6",
  "Reservation Delete": "#ef4444",
  default: "#6b7280",
};

export default function TimeLineComp({ trackingHistory = [] }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTableName, setSelectedTableName] = useState("");
  const [selectedData, setSelectedData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPayload, setSelectedPayload] = useState(null);

  const handleOpenDialog = (log, payload) => {
    setSelectedData(log);
    setSelectedTableName(log.action_data?.table_name);
    setSelectedId(log.action_data?.id);
    setSelectedPayload(payload);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedData(null);
    setSelectedTableName("");
    setSelectedId(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper function to format strings
  const formatString = (str) => {
    if (!str) return "";

    // Replace underscores with spaces
    str = str.replace(/_/g, " ");

    // Add space before uppercase letters that follow lowercase letters
    str = str.replace(/([a-z])([A-Z])/g, "$1 $2");

    // Split by spaces and format each word
    return str
      .split(" ")
      .map((word) => {
        const firstChar = word.charAt(0).toUpperCase();
        const rest = word.slice(1).toLowerCase();
        return firstChar + rest;
      })
      .join(" ");
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (
      typeof value === "string" &&
      value.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)
    ) {
      const date = new Date(value);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
    if (typeof value === "string") {
      return formatString(value);
    }
    return value.toString();
  };

  const formatChanges = (changes, actionType) => {
    if (!changes || !Array.isArray(changes)) return "";

    return changes
      .map((change) => {
        const keyName = formatString(change.key_name);

        // Format both before and after values
        const beforeValue = formatValue(change.before);
        const afterValue = formatValue(change.after);

        // Handle different action types
        if (actionType === "Reservation Delete") {
          return `${keyName}: ${beforeValue}`;
        } else if (actionType === "Reservation Create") {
          return `${keyName}: ${afterValue}`;
        } else {
          // For updates, show both before and after with arrow
          if (beforeValue !== afterValue) {
            return `${keyName}: ${beforeValue} ${
              beforeValue === "" ? "" : "→"
            } ${afterValue}`;
          }
          return `${keyName}: ${afterValue}`;
        }
      })
      .join("\n"); // Use newline instead of comma for better readability
  };
  console.log(trackingHistory);
  return (
    <div className="max-w-5xl mx-auto px-2">
      <VerticalTimeline
        layout="2-columns"
        className="vertical-timeline"
        style={{
          "--vertical-timeline-line-color": "#e5e7eb",
          "--vertical-timeline-line-width": "3px",
          "--vertical-timeline-line-height": "100%",
          "--vertical-timeline-line-radius": "1.5rem",
        }}
      >
        {trackingHistory.map((log) => (
          <VerticalTimelineElement
            key={log.id}
            contentStyle={{
              background:
                actionTypeColors[log.action_type] || actionTypeColors.default,
              color: "#1e293b",
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              borderLeft: `3px solid ${
                actionTypeColors[log.action_type] || actionTypeColors.default
              }`,
            }}
            contentArrowStyle={{
              borderRight: `6px solid ${
                actionTypeColors[log.action_type] || actionTypeColors.default
              }`,
            }}
            date=""
            iconStyle={{
              background:
                actionTypeIconColors[log.action_type] ||
                actionTypeIconColors.default,
              color: "#fff",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              border: `2px solid ${
                actionTypeColors[log.action_type] ||
                actionTypeIconColors.default
              }`,
            }}
            icon={actionTypeIcons[log.action_type] || actionTypeIcons.default}
          >
            <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {log.user?.name || "System"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(log.created_at)}
              </span>
            </div>

            <h3 className="text-sm font-semibold text-gray-800 leading-snug">
              {formatString(log.action_type)}
            </h3>

            <p className="text-xs mt-1 text-gray-700 leading-snug whitespace-pre-line">
              {formatChanges(log.action_data?.changes, log.action_type)}
            </p>

            {log.action_data?.table_name && log.action_data?.id && (
              <button
                onClick={() => handleOpenDialog(log, null)}
                className="mt-2 px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                View {formatString(log.action_data?.table_name)} Details
              </button>
            )}
            {log?.payload && (
              <button
                onClick={() => handleOpenDialog(log, log.payload)}
                className="mt-2 px-2 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                View {formatString(log.action_data?.table_name)} Details
              </button>
            )}
          </VerticalTimelineElement>
        ))}
      </VerticalTimeline>

      <CustomerTrackingDialog
        open={openDialog}
        tableName={selectedTableName}
        onClose={handleCloseDialog}
        id={selectedId}
        payload={selectedPayload}
      />
    </div>
  );
}
