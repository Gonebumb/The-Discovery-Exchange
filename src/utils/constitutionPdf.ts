// Pure TypeScript PDF 1.4 generator for The Discovery Exchange Constitution v10.0
// Renders literal plain currency characters (e.g., $250k / $500k / $1M) with zero LaTeX/math-mode parsing.

export interface ConstitutionPdfArticle {
  number: string;
  title: string;
  tier: string;
  sections: string[];
}

function toPdfAsciiText(input: string): string {
  return input
    .replace(/\u2014/g, ' -- ')
    .replace(/\u2013/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2794|\u2192/g, ' -> ')
    .replace(/\u2022/g, '*')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function escapePdfLiteral(text: string): string {
  return toPdfAsciiText(text)
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapLine(text: string, maxChars: number): string[] {
  const normalized = toPdfAsciiText(text);
  const words = normalized.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxChars) {
      current += ` ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [''];
}

interface TextOp {
  font: 'F1' | 'F2'; // F1 = Helvetica, F2 = Helvetica-Bold
  size: number;
  x: number;
  y: number;
  text: string;
}

export function buildConstitutionV10PdfBytes(articles: ConstitutionPdfArticle[]): Uint8Array {
  const PAGE_WIDTH = 612; // US Letter 8.5in
  const PAGE_HEIGHT = 792; // US Letter 11in
  const MARGIN_LEFT = 54;
  const TOP_Y = 736;
  const BOTTOM_Y = 64;

  const pages: TextOp[][] = [];
  let currentOps: TextOp[] = [];
  let y = TOP_Y;

  const startNewPage = () => {
    if (currentOps.length > 0) {
      pages.push(currentOps);
    }
    currentOps = [];
    y = TOP_Y;
  };

  const ensureSpace = (neededHeight: number) => {
    if (y - neededHeight < BOTTOM_Y) {
      startNewPage();
    }
  };

  // Document Cover Header
  currentOps.push({
    font: 'F2',
    size: 16,
    x: MARGIN_LEFT,
    y,
    text: 'The Discovery Exchange Constitution -- Version 10.0',
  });
  y -= 20;

  currentOps.push({
    font: 'F1',
    size: 10,
    x: MARGIN_LEFT,
    y,
    text: 'Open Working Draft | NationalDiscoveryAwards.com & TheDiscoveryExchange.com',
  });
  y -= 15;

  currentOps.push({
    font: 'F1',
    size: 9.5,
    x: MARGIN_LEFT,
    y,
    text: '"Let us sit crooked, but let us talk straight -- upholding honor alongside full compliance with the law."',
  });
  y -= 22;

  for (const article of articles) {
    // Keep article heading + at least first line together
    ensureSpace(48);

    currentOps.push({
      font: 'F2',
      size: 11.5,
      x: MARGIN_LEFT,
      y,
      text: `${article.number}: ${article.title}`,
    });
    y -= 14;

    currentOps.push({
      font: 'F1',
      size: 8.5,
      x: MARGIN_LEFT,
      y,
      text: `[${article.tier}]`,
    });
    y -= 14;

    for (const sec of article.sections) {
      const wrapped = wrapLine(sec, 88);
      for (const line of wrapped) {
        ensureSpace(15);
        currentOps.push({
          font: 'F1',
          size: 9.8,
          x: MARGIN_LEFT,
          y,
          text: line,
        });
        y -= 13.5;
      }
      y -= 4;
    }
    y -= 8;
  }

  if (currentOps.length > 0) {
    pages.push(currentOps);
  }

  const totalPages = pages.length;
  const objects: string[] = [];

  // 1: Catalog, 2: Pages, 3: Helvetica, 4: Helvetica-Bold
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  const firstPageObjNum = 5;
  const pageObjNums: number[] = [];
  for (let i = 0; i < totalPages; i++) {
    pageObjNums.push(firstPageObjNum + i * 2);
  }

  objects.push(
    `2 0 obj\n<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(' ')}] /Count ${totalPages} >>\nendobj\n`
  );
  objects.push(
    '3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n'
  );
  objects.push(
    '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n'
  );

  for (let i = 0; i < totalPages; i++) {
    const pageObjNum = firstPageObjNum + i * 2;
    const contentObjNum = pageObjNum + 1;
    const ops = pages[i];

    const streamLines: string[] = [
      'BT',
      // Header rule text on subsequent pages
      ...(i > 0
        ? [
            `/F1 8.5 Tf`,
            `1 0 0 1 ${MARGIN_LEFT} 762 Tm`,
            `(${escapePdfLiteral('The Discovery Exchange Constitution -- Version 10.0')}) Tj`,
          ]
        : []),
    ];

    for (const op of ops) {
      streamLines.push(`/${op.font} ${op.size} Tf`);
      streamLines.push(`1 0 0 1 ${op.x.toFixed(1)} ${op.y.toFixed(1)} Tm`);
      streamLines.push(`(${escapePdfLiteral(op.text)}) Tj`);
    }

    // Page footer
    streamLines.push('/F1 8.5 Tf');
    streamLines.push(`1 0 0 1 ${MARGIN_LEFT} 34 Tm`);
    streamLines.push(
      `(${escapePdfLiteral(`Page ${i + 1} of ${totalPages} | Charter v10.0 Open Working Draft | Currency rendered in plain literal USD`)}) Tj`
    );
    streamLines.push('ET');

    const streamContent = streamLines.join('\n') + '\n';
    const streamLen = new TextEncoder().encode(streamContent).length;

    objects.push(
      `${pageObjNum} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjNum} 0 R >>\nendobj\n`
    );
    objects.push(
      `${contentObjNum} 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamContent}endstream\nendobj\n`
    );
  }

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  const encoder = new TextEncoder();

  for (const obj of objects) {
    offsets.push(encoder.encode(pdf).length);
    pdf += obj;
  }

  const xrefStart = encoder.encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return encoder.encode(pdf);
}

export function downloadConstitutionV10Pdf(articles: ConstitutionPdfArticle[]): void {
  const bytes = buildConstitutionV10PdfBytes(articles);
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy.buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'The_Discovery_Exchange_Constitution_v10.0.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
