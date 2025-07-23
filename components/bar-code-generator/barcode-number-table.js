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

  const chunkSize = 10;
  const pages = Array.from({ length: Math.ceil(data.length / chunkSize) }, (_, i) =>
    data.slice(i * chunkSize, (i + 1) * chunkSize)
  );

  const html = `
    <html>
      <head>
        <style>
          @page {
            size: 190mm 250mm;
            margin: 0;
            padding:0;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: sans-serif;
            background:"red";
          }
          .page {
            width: 190mm;
            height: 250mm;
            display: flex;
            flex-wrap: wrap;
            page-break-after: always;
          }
          .barcode-block {
            width: 19mm;
            height: 250mm;
            display: flex flex-row;
            align-items: center;
            justify-content: flex-start;
            box-sizing: border-box;
          }
          .barcode-block:last-child {
            border-bottom: none;
          }
        </style>
      </head>
      <body>
        ${pages.map((pageItems, pageIndex) => `
          <div class="page">
            ${pageItems.map(item => `
              <div class="barcode-block">
                <div style="text-align: center; font-size: 9pt;">
                  ${item.play_customer_type?.name || '-'}
                  <!-- Add barcode number or other info here if needed -->
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
        <script>window.onload = function() { window.print(); }</script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '', 'width=900,height=1200');
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
