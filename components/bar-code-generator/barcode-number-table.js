import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


const printBarcodes = async (groupName, barcodeListSearch, data, barcodeListLoading) => {
  if (barcodeListLoading) return;
  barcodeListSearch({
    pageSize: 1000,
    page: 1,
    search: null,
    barcode_number: null,
    play_customer_type_id: null,
    time_duration: null,
    mode: groupName,
  });
  const printWindow = window.open('', '', 'width=900,height=1200');
  const html = `
    <html>
      <head>
        <title>Print Barcodes</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            .barcode-table { width: 100%; border-collapse: collapse; }
            .barcode-table th, .barcode-table td { border: 1px solid #ccc; padding: 8px; font-size: 12px; }
            .barcode-table th { background: #f5f5f5; }
          }
          .barcode-table { width: 100%; border-collapse: collapse; }
          .barcode-table th, .barcode-table td { border: 1px solid #ccc; padding: 8px; font-size: 12px; }
          .barcode-table th { background: #f5f5f5; }
        </style>
      </head>
      <body>
        <h2>Barcodes for group: ${groupName}</h2>
        <table class="barcode-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Duration (Min)</th>
              <th>Code</th>
              <th>Created at</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(item => `
              <tr>
                <td>${item.play_customer_type?.name || '-'}</td>
                <td>${item.time_duration || '-'}</td>
                <td>${item.barcode_number || '-'}</td>
                <td>${item.created_date ? new Date(item.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <script>window.onload = function() { window.print(); };</script>
      </body>
    </html>
  `;
  printWindow.document.write(html);
  printWindow.document.close();
};

const BarcodeNumberTable = ({ data = [], groupName,barcodeListSearch,barcodeListLoading ,}) => {
  return (
    <div className="rounded-md border">
      <div className="flex justify-end p-2">
        {groupName && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={() => printBarcodes(groupName, barcodeListSearch, data, barcodeListLoading)}
            disabled={barcodeListLoading}
          >
            {barcodeListLoading ? 'Loading…' : 'Print All'}
          </button>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Duration (Min)</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Created at</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No barcodes found
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.play_customer_type.name || '-'}</TableCell>
                <TableCell>{item.time_duration || '-'}</TableCell>
                <TableCell className="font-mono">{item.barcode_number || '-'}</TableCell>
                <TableCell>
                  {item.created_date 
                    ? new Date(item.created_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '-'
                  }
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default BarcodeNumberTable
