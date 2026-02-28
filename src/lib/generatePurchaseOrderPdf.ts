import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import type { PurchaseOrderDetail } from '@/hooks/usePurchaseOrders';

const NAVY = '#1B3A5C';
const AMBER = '#F59E0B';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function generatePurchaseOrderPdf(order: PurchaseOrderDetail, projectName: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // === HEADER ===
  // Logo text fallback (SVG text elements don't render well in jsPDF)
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text('ObraBoa', margin, y + 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor('#64748B');
  doc.text('O assistente da sua Obra', margin, y + 13);

  // Accent line
  doc.setDrawColor(AMBER);
  doc.setLineWidth(1);
  doc.line(margin, y + 16, margin + 50, y + 16);

  // Order number + date (right side)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text(order.order_number, pageWidth - margin, y + 6, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#64748B');
  doc.text(format(parseISO(order.created_at), 'dd/MM/yyyy'), pageWidth - margin, y + 12, { align: 'right' });

  y += 22;

  // Project name
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(NAVY);
  doc.text(`Projeto: ${projectName}`, margin, y);
  y += 8;

  // === SUPPLIER INFO ===
  doc.setFillColor('#F1F5F9');
  doc.roundedRect(margin, y, contentWidth, order.supplier_contact ? 16 : 10, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#334155');
  doc.text('Fornecedor:', margin + 3, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(order.supplier_name, margin + 28, y + 6);

  if (order.supplier_contact) {
    doc.setFont('helvetica', 'bold');
    doc.text('Contato:', margin + 3, y + 12);
    doc.setFont('helvetica', 'normal');
    doc.text(order.supplier_contact, margin + 22, y + 12);
    y += 20;
  } else {
    y += 14;
  }

  // === ITEMS TABLE ===
  const hasPrice = order.items.some((item) => item.unit_price > 0);

  const head = hasPrice
    ? [['#', 'Descrição', 'Qtd', 'Unid.', 'Preço Unit.', 'Total']]
    : [['#', 'Descrição', 'Qtd', 'Unid.']];

  const body = order.items.map((item, i) => {
    const row: (string | number)[] = [
      i + 1,
      item.description,
      item.quantity,
      item.unit,
    ];
    if (hasPrice) {
      row.push(formatCurrency(item.unit_price));
      row.push(formatCurrency(item.quantity * item.unit_price));
    }
    return row;
  });

  const grandTotal = order.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  if (hasPrice) {
    body.push([
      '',
      '',
      '',
      '',
      { content: 'Total Geral', styles: { fontStyle: 'bold', halign: 'right' } } as any,
      { content: formatCurrency(grandTotal), styles: { fontStyle: 'bold' } } as any,
    ]);
  }

  autoTable(doc, {
    startY: y,
    head,
    body,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      lineColor: '#E2E8F0',
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: NAVY,
      textColor: '#FFFFFF',
      fontStyle: 'bold',
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: '#F8FAFC',
    },
    columnStyles: hasPrice
      ? {
          0: { cellWidth: 10, halign: 'center' },
          2: { cellWidth: 18, halign: 'right' },
          3: { cellWidth: 18 },
          4: { cellWidth: 28, halign: 'right' },
          5: { cellWidth: 28, halign: 'right' },
        }
      : {
          0: { cellWidth: 10, halign: 'center' },
          2: { cellWidth: 20, halign: 'right' },
          3: { cellWidth: 20 },
        },
  });

  y = (doc as any).lastAutoTable.finalY + 6;

  // === OBSERVATIONS ===
  if (order.observations) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(NAVY);
    doc.text('Observações', margin, y);
    y += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#334155');
    const lines = doc.splitTextToSize(order.observations, contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 4 + 4;
  }

  // === FOOTER (on all pages) ===
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#94A3B8');
    doc.text(
      `Gerado por ObraBoa • ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`,
      margin,
      pageH - 8
    );
    doc.text(`Página ${p} de ${totalPages}`, pageWidth - margin, pageH - 8, { align: 'right' });

    // Footer line
    doc.setDrawColor('#E2E8F0');
    doc.setLineWidth(0.3);
    doc.line(margin, pageH - 12, pageWidth - margin, pageH - 12);
  }

  return doc;
}
