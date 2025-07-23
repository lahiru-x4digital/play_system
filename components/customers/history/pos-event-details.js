import React from "react";

export default function PosEventDetails({ payload }) {
  return (
    <div className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[90vh] space-y-4">
     

      {Array.isArray(payload) ? (
        payload.map((section, index) => (
          <div key={index} className="bg-white shadow p-4 rounded-md border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Section {index + 1}</h3>

            {/* Try structured view if it's a simple flat object */}
            {typeof section === "object" && section !== null ? (
              <div className="text-sm space-y-1">
                {Object.entries(section).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium text-gray-800">{key}:</span>{" "}
                    <span className="text-gray-700">
                      {typeof value === "object" ? (
                        <pre className="bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre-wrap text-xs">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        value?.toString()
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="text-xs text-gray-700 bg-gray-50 p-2 rounded whitespace-pre-wrap">
                {JSON.stringify(section, null, 2)}
              </pre>
            )}
          </div>
        ))
      ) : (
        <pre className="text-sm text-gray-800 whitespace-pre-wrap">
          {JSON.stringify(payload, null, 2)}
        </pre>
      )}
    </div>
  );
}
