import { jsPDF } from "jspdf";

export interface InvoiceItem {
  description: string;
  sacCode: string;
  quantity: number;
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  total: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate?: string | Date;
  buyer: { name: string; email: string };
  items: InvoiceItem[];
  totalTaxableValue: number;
  totalCgst: number;
  totalSgst: number;
  totalAmount: number;
  couponDiscount?: number;
  razorpay_payment_id: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function r2(n: number) { return Math.round(n * 100) / 100; }

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function numWords(n: number): string {
  if (n === 0) return "Zero";
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");
  if (n < 1000) return ONES[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + numWords(n % 100) : "");
  if (n < 100000) return numWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + numWords(n % 1000) : "");
  if (n < 10000000) return numWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + numWords(n % 100000) : "");
  return numWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + numWords(n % 10000000) : "");
}

function amountInWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise  = Math.round((amount - rupees) * 100);
  let words = "Rupees " + numWords(rupees);
  if (paise > 0) words += " and " + numWords(paise) + " Paise";
  return words + " Only";
}

function formatDate(d?: string | Date): string {
  const dt = d ? new Date(d) : new Date();
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ─── Colours ─────────────────────────────────────────────────────────────────
const BURGUNDY   = [107, 30, 46]  as [number, number, number];
const GOLD       = [180, 145, 60] as [number, number, number];
const INK        = [26,  26,  26] as [number, number, number];
const LIGHT_GRAY = [245, 245, 245] as [number, number, number];
const MID_GRAY   = [200, 200, 200] as [number, number, number];
const WHITE      = [255, 255, 255] as [number, number, number];

// ─── Main export ─────────────────────────────────────────────────────────────

export function downloadInvoicePdf(invoice: InvoiceData): void {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const W = 210; // A4 width mm
  const M = 14;  // left/right margin

  let y = 0;

  // ── Header band ────────────────────────────────────────────────────────────
  doc.setFillColor(...BURGUNDY);
  doc.rect(0, 0, W, 30, "F");

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("THE EDULAW", M, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Pune, Maharashtra — India's Premier Legal Education Store", M, 19);
  doc.text("GSTIN: 27EFLPK0704R1ZY", M, 24);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("TAX INVOICE", W - M, 13, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("(Original for Recipient)", W - M, 19, { align: "right" });

  y = 35;

  // ── Gold rule ──────────────────────────────────────────────────────────────
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.line(M, y, W - M, y);
  y += 5;

  // ── Invoice meta + Bill To (two-column) ────────────────────────────────────
  const col2 = W / 2 + 2;

  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("INVOICE DETAILS", M, y);
  doc.text("BILL TO", col2, y);

  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const dateStr = formatDate(invoice.invoiceDate);
  const metaLines: [string, string][] = [
    ["Invoice No.", invoice.invoiceNumber],
    ["Invoice Date", dateStr],
    ["Place of Supply", "Maharashtra (27)"],
    ["SAC Code", "998431"],
  ];

  metaLines.forEach(([label, val]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label + ":", M, y);
    doc.setFont("helvetica", "normal");
    doc.text(val, M + 32, y);
    y += 5;
  });

  // Bill To (starts at same y level as first meta line)
  let yBill = y - metaLines.length * 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(invoice.buyer.name || "Customer", col2, yBill + 0);
  doc.setFont("helvetica", "normal");
  doc.text(invoice.buyer.email, col2, yBill + 5);
  doc.text("B2C (Unregistered)", col2, yBill + 10);

  y = Math.max(y, yBill + 20) + 4;

  // ── Gold rule ──────────────────────────────────────────────────────────────
  doc.setDrawColor(...GOLD);
  doc.line(M, y, W - M, y);
  y += 4;

  // ── Items table header ─────────────────────────────────────────────────────
  const cols = {
    no:      M,
    desc:    M + 7,
    sac:     M + 75,
    taxable: M + 92,
    cgst:    M + 117,
    sgst:    M + 142,
    total:   M + 167,
  };

  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(M, y, W - M * 2, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK);
  const th = y + 5;
  doc.text("#", cols.no, th);
  doc.text("Description", cols.desc, th);
  doc.text("SAC", cols.sac, th);
  doc.text("Taxable Val.", cols.taxable, th, { align: "right" });
  doc.text(`CGST (9%)`, cols.cgst, th, { align: "right" });
  doc.text(`SGST (9%)`, cols.sgst, th, { align: "right" });
  doc.text("Total", cols.total + 15, th, { align: "right" });

  y += 9;

  // ── Item rows ──────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  invoice.items.forEach((item, idx) => {
    const rowColor = idx % 2 === 1 ? LIGHT_GRAY : WHITE;
    doc.setFillColor(...rowColor);
    doc.rect(M, y - 1, W - M * 2, 8, "F");

    const rowY = y + 5;
    doc.setTextColor(...INK);
    doc.text(String(idx + 1), cols.no, rowY);

    // Truncate long descriptions
    const desc = item.description.length > 38
      ? item.description.slice(0, 35) + "..."
      : item.description;
    doc.text(desc, cols.desc, rowY);
    doc.text(item.sacCode, cols.sac, rowY);
    doc.text(r2(item.taxableValue).toFixed(2), cols.taxable, rowY, { align: "right" });
    doc.text(r2(item.cgstAmount).toFixed(2), cols.cgst, rowY, { align: "right" });
    doc.text(r2(item.sgstAmount).toFixed(2), cols.sgst, rowY, { align: "right" });
    doc.text(r2(item.total).toFixed(2), cols.total + 15, rowY, { align: "right" });

    y += 8;
  });

  // ── Totals block ───────────────────────────────────────────────────────────
  y += 2;
  doc.setDrawColor(...MID_GRAY);
  doc.setLineWidth(0.3);
  doc.line(M, y, W - M, y);
  y += 5;

  const totX  = W - M - 60;
  const valX  = W - M;
  const lineH = 5.5;

  const totals: [string, number, boolean][] = [
    ["Total Taxable Value", invoice.totalTaxableValue, false],
    ["CGST @ 9%", invoice.totalCgst, false],
    ["SGST @ 9%", invoice.totalSgst, false],
    ...(invoice.couponDiscount && invoice.couponDiscount > 0
      ? [["Coupon Discount", -invoice.couponDiscount, false] as [string, number, boolean]]
      : []),
    ["TOTAL AMOUNT", invoice.totalAmount, true],
  ];

  totals.forEach(([label, val, bold]) => {
    if (bold) {
      doc.setFillColor(...BURGUNDY);
      // Corrected rect width and placement
      doc.rect(totX - 2, y - 3.5, W - M - (totX - 2), lineH + 1, "F");
      doc.setTextColor(...WHITE);
    } else {
      doc.setTextColor(...INK);
    }
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 9 : 8);
    doc.text(label, totX, y + 1);
    doc.text(`Rs. ${r2(Math.abs(val)).toFixed(2)}`, valX, y + 1, { align: "right" });
    y += lineH;
  });

  doc.setTextColor(...INK);
  y += 3;

  // ── Amount in words ────────────────────────────────────────────────────────
  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(M, y, W - M * 2, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("Amount in Words:", M + 2, y + 5);
  doc.setFont("helvetica", "normal");
  doc.text(amountInWords(invoice.totalAmount), M + 38, y + 5);
  y += 13;

  // ── Payment reference ──────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 120, 120);
  doc.text(`Payment Reference: ${invoice.razorpay_payment_id}`, M, y);
  y += 5;

  // ── Footer ─────────────────────────────────────────────────────────────────
  doc.setFillColor(...BURGUNDY);
  doc.rect(0, 282, W, 15, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(
    "This is a computer-generated invoice and does not require a physical signature.",
    W / 2, 288, { align: "center" }
  );
  doc.text(
    "For queries: support@theedulaw.in  |  store.theedulaw.in",
    W / 2, 293, { align: "center" }
  );

  // ── Save ───────────────────────────────────────────────────────────────────
  doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
}

/**
 * Builds InvoiceData from OrderSuccess state or Dashboard purchase record.
 * Use when you don't have pre-computed GST breakdown (back-calculates from prices).
 */
export function buildInvoiceFromPurchase(params: {
  invoiceNumber: string;
  invoiceDate?: string | Date;
  buyerName: string;
  buyerEmail: string;
  cartItems: Array<{ title: string; price: number }>;
  couponDiscount?: number;
  razorpay_payment_id: string;
}): InvoiceData {
  const r2 = (n: number) => Math.round(n * 100) / 100;

  const items: InvoiceItem[] = params.cartItems.map(item => {
    const taxable = r2(item.price / 1.18);
    const cgst    = r2(taxable * 0.09);
    const sgst    = r2(taxable * 0.09);
    return {
      description: item.title,
      sacCode: "998431",
      quantity: 1,
      taxableValue: taxable,
      cgstRate: 9,
      cgstAmount: cgst,
      sgstRate: 9,
      sgstAmount: sgst,
      total: item.price,
    };
  });

  return {
    invoiceNumber: params.invoiceNumber,
    invoiceDate: params.invoiceDate,
    buyer: { name: params.buyerName, email: params.buyerEmail },
    items,
    totalTaxableValue: r2(items.reduce((s, i) => s + i.taxableValue, 0)),
    totalCgst: r2(items.reduce((s, i) => s + i.cgstAmount, 0)),
    totalSgst: r2(items.reduce((s, i) => s + i.sgstAmount, 0)),
    totalAmount: items.reduce((s, i) => s + i.total, 0),
    couponDiscount: params.couponDiscount || 0,
    razorpay_payment_id: params.razorpay_payment_id,
  };
}
