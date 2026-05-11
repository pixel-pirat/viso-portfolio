/**
 * Client-side PDF generation using jsPDF + html2canvas.
 *
 * The template builders return a hidden DOM node styled with inline CSS
 * (so they're independent of the active theme — PDFs always print on white).
 * `exportNodeToPdf` rasterizes the node and saves a multi-page PDF.
 *
 * Designed to be replaced by a backend renderer later: each `build…Pdf`
 * function takes a typed payload, so swapping to `await api.pdf(...)` is
 * a one-line change at each call site.
 */

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { Invoice, Proposal, ClientProject } from "@/store/types";

type Brand = { studioName: string; legalName?: string; tagline?: string; email?: string };

const A4 = { width: 210, height: 297 }; // mm

async function exportNodeToPdf(node: HTMLElement, filename: string) {
  // Mount off-screen so the user never sees flicker.
  const wrap = document.createElement("div");
  wrap.style.position = "fixed";
  wrap.style.left = "-99999px";
  wrap.style.top = "0";
  wrap.style.width = "794px"; // ~A4 width @ 96dpi
  wrap.appendChild(node);
  document.body.appendChild(wrap);

  try {
    const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const imgWidthMm = A4.width;
    const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    let heightLeft = imgHeightMm;
    let position = 0;
    pdf.addImage(dataUrl, "JPEG", 0, position, imgWidthMm, imgHeightMm);
    heightLeft -= A4.height;
    while (heightLeft > 0) {
      position = heightLeft - imgHeightMm;
      pdf.addPage();
      pdf.addImage(dataUrl, "JPEG", 0, position, imgWidthMm, imgHeightMm);
      heightLeft -= A4.height;
    }
    pdf.save(filename);
  } finally {
    document.body.removeChild(wrap);
  }
}

const baseStyle = `
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #0a0a0a;
  background: #ffffff;
  padding: 48px 56px;
  line-height: 1.5;
`;

function header(brand: Brand) {
  return `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;border-bottom:1px solid #e5e5e5;padding-bottom:18px;margin-bottom:28px;">
      <div>
        <div style="font-family:'Sora',sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.02em;">${brand.legalName || brand.studioName}</div>
        ${brand.tagline ? `<div style="font-size:11px;color:#6b6b6b;margin-top:4px;">${brand.tagline}</div>` : ""}
      </div>
      ${brand.email ? `<div style="font-size:11px;color:#6b6b6b;text-align:right;">${brand.email}</div>` : ""}
    </div>
  `;
}

function footer(text: string) {
  return `
    <div style="margin-top:48px;border-top:1px solid #e5e5e5;padding-top:14px;font-size:10px;color:#9a9a9a;text-align:center;letter-spacing:0.08em;text-transform:uppercase;">${text}</div>
  `;
}

function html(node: string) {
  const el = document.createElement("div");
  el.style.cssText = baseStyle;
  el.innerHTML = node;
  return el;
}

/* ---------------- Invoice ---------------- */

export function exportInvoicePdf(
  invoice: Invoice,
  project: ClientProject,
  brand: Brand,
) {
  const node = html(`
    ${header(brand)}
    <div style="display:flex;justify-content:space-between;gap:32px;margin-bottom:32px;">
      <div>
        <div style="font-size:11px;color:#6b6b6b;letter-spacing:0.1em;text-transform:uppercase;">Invoice</div>
        <div style="font-family:'Sora',sans-serif;font-size:32px;font-weight:800;letter-spacing:-0.02em;margin-top:6px;">${invoice.number}</div>
        <div style="font-size:11px;color:#6b6b6b;margin-top:6px;">Issued ${new Date(invoice.createdAt).toLocaleDateString()}</div>
        ${invoice.dueDate ? `<div style="font-size:11px;color:#6b6b6b;">Due ${new Date(invoice.dueDate).toLocaleDateString()}</div>` : ""}
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px;color:#6b6b6b;letter-spacing:0.1em;text-transform:uppercase;">Billed to</div>
        <div style="font-weight:600;margin-top:6px;">${project.clientName}</div>
        <div style="font-size:12px;color:#444;">${project.clientEmail}</div>
        <div style="font-size:11px;color:#9a9a9a;margin-top:8px;">Project · ${project.title}</div>
      </div>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;">
      <thead>
        <tr style="background:#f8f8f8;">
          <th style="text-align:left;padding:12px 14px;border-bottom:1px solid #e5e5e5;font-weight:600;">Description</th>
          <th style="text-align:right;padding:12px 14px;border-bottom:1px solid #e5e5e5;font-weight:600;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:14px;border-bottom:1px solid #f0f0f0;">${invoice.description}</td>
          <td style="padding:14px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${invoice.amount}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td style="padding:16px 14px;text-align:right;font-weight:600;font-size:12px;color:#6b6b6b;text-transform:uppercase;letter-spacing:0.1em;">Total</td>
          <td style="padding:16px 14px;text-align:right;font-family:'Sora',sans-serif;font-size:22px;font-weight:800;">${invoice.amount}</td>
        </tr>
      </tfoot>
    </table>

    <div style="display:inline-block;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;padding:6px 12px;border-radius:999px;background:${invoice.status === "paid" ? "#10b981" : invoice.status === "overdue" ? "#ef4444" : "#0a0a0a"};color:#fff;">${invoice.status}</div>

    ${footer("Thank you for your business — generated by Studio")}
  `);
  return exportNodeToPdf(node, `${invoice.number}.pdf`);
}

/* ---------------- Proposal ---------------- */

export function exportProposalPdf(proposal: Proposal, brand: Brand) {
  const node = html(`
    ${header(brand)}
    <div style="font-size:11px;color:#6b6b6b;letter-spacing:0.1em;text-transform:uppercase;">Proposal</div>
    <h1 style="font-family:'Sora',sans-serif;font-size:34px;font-weight:800;letter-spacing:-0.02em;margin:6px 0 6px;">${proposal.title}</h1>
    <div style="font-size:12px;color:#6b6b6b;">For ${proposal.clientName} · ${proposal.clientEmail}</div>
    <div style="font-size:11px;color:#9a9a9a;margin-top:4px;">Issued ${new Date(proposal.createdAt).toLocaleDateString()}</div>

    <p style="margin-top:28px;font-size:14px;color:#222;">${proposal.summary}</p>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:24px;">
      <div style="border:1px solid #e5e5e5;border-radius:10px;padding:16px;">
        <div style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#6b6b6b;">Investment</div>
        <div style="font-family:'Sora',sans-serif;font-size:24px;font-weight:800;margin-top:6px;">${proposal.price}</div>
      </div>
      <div style="border:1px solid #e5e5e5;border-radius:10px;padding:16px;">
        <div style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#6b6b6b;">Timeline</div>
        <div style="font-family:'Sora',sans-serif;font-size:24px;font-weight:800;margin-top:6px;">${proposal.timelineWeeks} weeks</div>
      </div>
    </div>

    <h2 style="font-family:'Sora',sans-serif;font-size:18px;font-weight:700;margin-top:32px;margin-bottom:12px;">Scope of work</h2>
    <ul style="padding-left:18px;font-size:13px;color:#222;">
      ${proposal.scope.map((s) => `<li style="margin-bottom:6px;">${s}</li>`).join("")}
    </ul>

    <div style="margin-top:36px;font-size:11px;color:#6b6b6b;">
      Status: <strong style="text-transform:uppercase;letter-spacing:0.1em;">${proposal.status}</strong>
    </div>

    ${footer("This proposal is valid for 30 days from issue.")}
  `);
  return exportNodeToPdf(node, `proposal-${proposal.id}.pdf`);
}

/* ---------------- Project summary ---------------- */

export function exportProjectSummaryPdf(project: ClientProject, brand: Brand) {
  const totalInvoiced = project.invoices.length;
  const paid = project.invoices.filter((i) => i.status === "paid").length;
  const doneMs = project.milestones.filter((m) => m.status === "done").length;

  const node = html(`
    ${header(brand)}
    <div style="font-size:11px;color:#6b6b6b;letter-spacing:0.1em;text-transform:uppercase;">Project summary</div>
    <h1 style="font-family:'Sora',sans-serif;font-size:30px;font-weight:800;letter-spacing:-0.02em;margin:6px 0;">${project.title}</h1>
    <div style="font-size:12px;color:#6b6b6b;">${project.clientName} · ${project.clientEmail}</div>
    <div style="font-size:11px;color:#9a9a9a;margin-top:4px;">Started ${new Date(project.startedAt).toLocaleDateString()} · Stage: ${project.stage}</div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:24px;">
      ${stat("Milestones", `${doneMs}/${project.milestones.length}`)}
      ${stat("Invoices paid", `${paid}/${totalInvoiced}`)}
      ${stat("Messages", `${project.messages.length}`)}
    </div>

    <h2 style="font-family:'Sora',sans-serif;font-size:18px;font-weight:700;margin-top:32px;margin-bottom:12px;">Milestones</h2>
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead><tr style="background:#f8f8f8;">
        <th style="text-align:left;padding:10px 12px;border-bottom:1px solid #e5e5e5;">Title</th>
        <th style="text-align:left;padding:10px 12px;border-bottom:1px solid #e5e5e5;">Status</th>
        <th style="text-align:left;padding:10px 12px;border-bottom:1px solid #e5e5e5;">Due</th>
      </tr></thead>
      <tbody>
        ${project.milestones.map((m) => `
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">${m.title}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-transform:uppercase;letter-spacing:0.08em;font-size:10px;">${m.status.replace("_", " ")}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#6b6b6b;">${m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "—"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    ${project.invoices.length ? `
      <h2 style="font-family:'Sora',sans-serif;font-size:18px;font-weight:700;margin-top:28px;margin-bottom:12px;">Invoices</h2>
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead><tr style="background:#f8f8f8;">
          <th style="text-align:left;padding:10px 12px;border-bottom:1px solid #e5e5e5;">#</th>
          <th style="text-align:left;padding:10px 12px;border-bottom:1px solid #e5e5e5;">Description</th>
          <th style="text-align:right;padding:10px 12px;border-bottom:1px solid #e5e5e5;">Amount</th>
          <th style="text-align:left;padding:10px 12px;border-bottom:1px solid #e5e5e5;">Status</th>
        </tr></thead>
        <tbody>
          ${project.invoices.map((i) => `
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-weight:600;">${i.number}</td>
              <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">${i.description}</td>
              <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${i.amount}</td>
              <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-transform:uppercase;letter-spacing:0.08em;font-size:10px;">${i.status}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    ` : ""}

    ${footer("Generated for project tracking — Studio")}
  `);
  return exportNodeToPdf(node, `${slugify(project.title)}-summary.pdf`);
}

function stat(label: string, value: string) {
  return `
    <div style="border:1px solid #e5e5e5;border-radius:10px;padding:14px;">
      <div style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#6b6b6b;">${label}</div>
      <div style="font-family:'Sora',sans-serif;font-size:22px;font-weight:800;margin-top:4px;">${value}</div>
    </div>
  `;
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
