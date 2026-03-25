import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceOrder {
  id: string;
  order_number: string;
  created_at: string;
  total_amount: number;
  status: string;
  items: any;
  payment_method: string;
  payment_status: string;
  shipping_address: any;
}

export const generateInvoicePDF = (order: InvoiceOrder) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const shippingAddress = typeof order.shipping_address === 'string'
    ? JSON.parse(order.shipping_address)
    : order.shipping_address;

  const orderItems = Array.isArray(order.items) ? order.items : 
    (typeof order.items === 'string' ? JSON.parse(order.items) : [order.items]);

  // Header
  doc.setFillColor(22, 163, 74); // green-600
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('AGRIZIN', 14, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Agricultural Marketplace', 14, 25);
  doc.text('Tax Invoice / Bill of Supply', pageWidth - 14, 18, { align: 'right' });
  doc.text(`Invoice Date: ${new Date(order.created_at).toLocaleDateString('en-IN')}`, pageWidth - 14, 25, { align: 'right' });

  // Order info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Order Number: ${order.order_number}`, 14, 45);
  doc.text(`Order Date: ${new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, 14, 52);
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment Method: ${order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method?.toUpperCase() || 'Online'}`, 14, 59);

  // Sold By & Ship To
  const colWidth = (pageWidth - 28) / 2;
  
  // Sold By
  doc.setFillColor(245, 245, 245);
  doc.rect(14, 68, colWidth, 40, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(22, 163, 74);
  doc.text('SOLD BY:', 18, 76);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Agrizin Marketplace Pvt Ltd', 18, 83);
  doc.text('Hyderabad, Telangana - 500001', 18, 89);
  doc.text('GSTIN: 36AXXXX1234X1ZX', 18, 95);
  doc.text('PAN: AXXXX1234X', 18, 101);

  // Ship To
  doc.setFillColor(245, 245, 245);
  doc.rect(14 + colWidth, 68, colWidth, 40, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text('SHIP TO / BILLING ADDRESS:', 18 + colWidth, 76);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  if (shippingAddress) {
    doc.text(shippingAddress.name || 'Customer', 18 + colWidth, 83);
    doc.text(shippingAddress.address || '', 18 + colWidth, 89);
    doc.text(`${shippingAddress.city || ''}, ${shippingAddress.state || ''} - ${shippingAddress.pincode || ''}`, 18 + colWidth, 95);
    doc.text(`Phone: ${shippingAddress.phone || 'N/A'}`, 18 + colWidth, 101);
  }

  // Items table
  const itemsTotal = orderItems.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
  const listingPrice = Math.round(itemsTotal * 1.2);
  const discount = listingPrice - itemsTotal;
  const shipping = order.total_amount > 500 ? 0 : 40;
  const taxableAmount = itemsTotal;
  const cgst = Math.round(taxableAmount * 0.09);
  const sgst = Math.round(taxableAmount * 0.09);

  const tableBody = orderItems.map((item: any, idx: number) => {
    const qty = item.quantity || 1;
    const price = item.price || 0;
    const total = qty * price;
    const itemCgst = Math.round(total * 0.09);
    const itemSgst = Math.round(total * 0.09);
    return [
      (idx + 1).toString(),
      item.name || `Item ${idx + 1}`,
      qty.toString(),
      `Rs.${price.toLocaleString('en-IN')}`,
      `Rs.${Math.round(price * 1.2).toLocaleString('en-IN')}`,
      `Rs.${(Math.round(price * 1.2) - price).toLocaleString('en-IN')}`,
      `Rs.${total.toLocaleString('en-IN')}`,
      `Rs.${itemCgst.toLocaleString('en-IN')} (9%)`,
      `Rs.${itemSgst.toLocaleString('en-IN')} (9%)`
    ];
  });

  autoTable(doc, {
    startY: 115,
    head: [['#', 'Product', 'Qty', 'Unit Price', 'MRP', 'Discount', 'Taxable Amt', 'CGST', 'SGST']],
    body: tableBody,
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74], fontSize: 7, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 40 },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Summary
  const summaryX = pageWidth - 80;
  doc.setFontSize(9);
  const summaryItems = [
    ['Subtotal (MRP)', `Rs.${listingPrice.toLocaleString('en-IN')}`],
    ['Discount', `- Rs.${discount.toLocaleString('en-IN')}`],
    ['Taxable Amount', `Rs.${taxableAmount.toLocaleString('en-IN')}`],
    ['CGST (9%)', `Rs.${cgst.toLocaleString('en-IN')}`],
    ['SGST (9%)', `Rs.${sgst.toLocaleString('en-IN')}`],
    ['Shipping', shipping === 0 ? 'FREE' : `Rs.${shipping}`],
  ];

  let sy = finalY;
  summaryItems.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.text(label, summaryX, sy);
    doc.text(value, pageWidth - 14, sy, { align: 'right' });
    sy += 7;
  });

  // Total
  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(0.5);
  doc.line(summaryX, sy, pageWidth - 14, sy);
  sy += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Grand Total', summaryX, sy);
  doc.text(`Rs.${order.total_amount.toLocaleString('en-IN')}`, pageWidth - 14, sy, { align: 'right' });

  // Footer disclaimer
  sy += 15;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('This is a computer-generated invoice and does not require a signature.', 14, sy);
  doc.text('Agrizin acts only as a marketplace. Seller is responsible for product quality and legal compliance.', 14, sy + 5);
  doc.text('For queries, contact: support@agrizin.com | +91-XXXXXXXXXX', 14, sy + 10);

  // Save
  doc.save(`Agrizin_Invoice_${order.order_number}.pdf`);
};
