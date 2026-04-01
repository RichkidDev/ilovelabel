const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// Icons from react-icons
const { FaExclamationTriangle, FaCheckCircle, FaCloudDownloadAlt, FaMousePointer, FaUpload, FaMagic, FaPrint, FaLightbulb, FaWrench, FaRocket } = require("react-icons/fa");

function renderIconSvg(IconComponent, color = "#000000", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// Brand Colors
const COLORS = {
  primary: "1E3A5F",
  primaryLight: "2C5282",
  accent: "FF6B35",
  accentDark: "E55A2B",
  green: "0D9F6E",
  flipkart: "2874F0",
  meesho: "E73C7E",
  white: "FFFFFF",
  offWhite: "F5F6FA",
  lightGray: "E8ECF1",
  darkText: "1A1A2E",
  bodyText: "4A5568",
  mutedText: "718096",
};

const makeShadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.12 });

async function createPresentation() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "ILoveLables";
  pres.title = "How to Crop Shipping Labels - ILoveLables Tutorial";

  // Pre-render icons
  const icons = {
    warning: await iconToBase64Png(FaExclamationTriangle, "#FF6B35", 256),
    check: await iconToBase64Png(FaCheckCircle, "#0D9F6E", 256),
    download: await iconToBase64Png(FaCloudDownloadAlt, "#FFFFFF", 256),
    mouse: await iconToBase64Png(FaMousePointer, "#FFFFFF", 256),
    upload: await iconToBase64Png(FaUpload, "#FFFFFF", 256),
    magic: await iconToBase64Png(FaMagic, "#FFFFFF", 256),
    print: await iconToBase64Png(FaPrint, "#FFFFFF", 256),
    lightbulb: await iconToBase64Png(FaLightbulb, "#FF6B35", 256),
    wrench: await iconToBase64Png(FaWrench, "#FF6B35", 256),
    rocket: await iconToBase64Png(FaRocket, "#FFFFFF", 256),
    checkWhite: await iconToBase64Png(FaCheckCircle, "#FFFFFF", 256),
  };

  // ========== SLIDE 1: TITLE ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.primary };
    // Dark overlay stripe at top
    slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.6, fill: { color: "000000", transparency: 30 } });
    // Accent bar at bottom
    slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.125, w: 10, h: 0.5, fill: { color: COLORS.accent } });
    // Heart icon area
    slide.addText([
      { text: "I", options: { fontSize: 28, fontFace: "Arial Black", color: COLORS.white, bold: true } },
      { text: " \u2764 ", options: { fontSize: 24, color: "FF3B5C" } },
      { text: "Lables", options: { fontSize: 28, fontFace: "Arial Black", color: COLORS.white, bold: true } },
    ], { x: 0.5, y: 0.08, w: 3, h: 0.5, margin: 0 });

    slide.addText("How to Crop Shipping\nLabels in Seconds", {
      x: 0.8, y: 1.2, w: 8.4, h: 2.2,
      fontSize: 42, fontFace: "Arial Black", color: COLORS.white, bold: true,
      align: "center", lineSpacingMultiple: 1.1,
    });

    slide.addText("Free Tool for Flipkart & Meesho Sellers", {
      x: 1, y: 3.3, w: 8, h: 0.6,
      fontSize: 18, fontFace: "Calibri", color: COLORS.lightGray,
      align: "center",
    });

    slide.addText("ilovelables.com", {
      x: 2.5, y: 4.1, w: 5, h: 0.7,
      fontSize: 26, fontFace: "Arial Black", color: COLORS.accent, bold: true,
      align: "center",
    });

    slide.addText("100% FREE  |  No Signup  |  Works in Browser", {
      x: 1, y: 5.15, w: 8, h: 0.4,
      fontSize: 13, fontFace: "Calibri", color: COLORS.white, bold: true,
      align: "center",
    });
  }

  // ========== SLIDE 2: THE PROBLEM ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.offWhite };

    slide.addImage({ data: icons.warning, x: 0.7, y: 0.4, w: 0.45, h: 0.45 });
    slide.addText("The Problem Every Seller Faces", {
      x: 1.25, y: 0.35, w: 8, h: 0.55,
      fontSize: 30, fontFace: "Arial Black", color: COLORS.darkText, bold: true, margin: 0,
    });

    const problems = [
      { text: "Labels come with invoices attached", desc: "Flipkart & Meesho PDFs contain both shipping label + tax invoice on same page" },
      { text: "Hours wasted cutting labels manually", desc: "Scissors, rulers, guessing where to cut \u2014 for every single order" },
      { text: "Bulk orders = nightmare", desc: "50 orders means 50 manual cuts. That's your entire evening gone." },
      { text: "Wrong cuts damage barcodes", desc: "Courier rejects the package. Customer gets delayed. You get a bad rating." },
    ];

    problems.forEach((p, i) => {
      const y = 1.2 + i * 1.05;
      slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 8.6, h: 0.9, fill: { color: COLORS.white }, shadow: makeShadow() });
      slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y, w: 0.07, h: 0.9, fill: { color: "DC3545" } });
      slide.addText(`${i + 1}`, { x: 1.0, y, w: 0.35, h: 0.9, fontSize: 16, fontFace: "Arial Black", color: "DC3545", align: "center", valign: "middle" });
      slide.addText(p.text, { x: 1.5, y, w: 7.5, h: 0.5, fontSize: 16, fontFace: "Calibri", color: COLORS.darkText, bold: true, valign: "bottom", margin: 0 });
      slide.addText(p.desc, { x: 1.5, y: y + 0.42, w: 7.5, h: 0.4, fontSize: 12, fontFace: "Calibri", color: COLORS.mutedText, valign: "top", margin: 0 });
    });
  }

  // ========== SLIDE 3: THE SOLUTION ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.primary };

    slide.addText([
      { text: "I", options: { fontSize: 22, fontFace: "Arial Black", color: COLORS.white } },
      { text: " \u2764 ", options: { fontSize: 18, color: "FF3B5C" } },
      { text: "Lables", options: { fontSize: 22, fontFace: "Arial Black", color: COLORS.white } },
      { text: "  \u2014  Your Free Label Cropper", options: { fontSize: 22, fontFace: "Calibri", color: COLORS.lightGray } },
    ], { x: 0.7, y: 0.35, w: 9, h: 0.5, margin: 0 });

    const features = [
      { text: "One-click auto crop", desc: "Invoice removed instantly, whitespace trimmed" },
      { text: "Flipkart + Meesho support", desc: "Platform-specific detection for accurate cropping" },
      { text: "Bulk processing", desc: "Upload 100+ labels, get one merged PDF" },
      { text: "SKU-wise sorting", desc: "Labels grouped by product for faster packing" },
      { text: "100% free, no signup", desc: "No hidden charges, no account needed" },
      { text: "Privacy first", desc: "Your PDFs never leave your device" },
    ];

    features.forEach((f, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.7 + col * 4.5;
      const y = 1.15 + row * 1.4;

      slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.1, h: 1.15, fill: { color: COLORS.primaryLight, transparency: 40 } });
      slide.addImage({ data: icons.check, x: x + 0.15, y: y + 0.15, w: 0.35, h: 0.35 });
      slide.addText(f.text, { x: x + 0.6, y: y + 0.08, w: 3.3, h: 0.42, fontSize: 15, fontFace: "Calibri", color: COLORS.white, bold: true, margin: 0 });
      slide.addText(f.desc, { x: x + 0.6, y: y + 0.5, w: 3.3, h: 0.5, fontSize: 11, fontFace: "Calibri", color: COLORS.lightGray, margin: 0 });
    });

    slide.addText("ilovelables.com", {
      x: 3, y: 5.0, w: 4, h: 0.45,
      fontSize: 18, fontFace: "Arial Black", color: COLORS.accent, align: "center", bold: true,
    });
  }

  // ========== SLIDE 4: STEP 1 - DOWNLOAD LABELS ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.offWhite };

    slide.addShape(pres.shapes.OVAL, { x: 0.6, y: 0.3, w: 0.55, h: 0.55, fill: { color: COLORS.primary } });
    slide.addText("1", { x: 0.6, y: 0.3, w: 0.55, h: 0.55, fontSize: 22, fontFace: "Arial Black", color: COLORS.white, align: "center", valign: "middle" });
    slide.addText("Download Your Labels", { x: 1.3, y: 0.3, w: 8, h: 0.55, fontSize: 28, fontFace: "Arial Black", color: COLORS.darkText, margin: 0, valign: "middle" });

    // Flipkart column
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.2, w: 4.2, h: 3.8, fill: { color: COLORS.white }, shadow: makeShadow() });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.2, w: 4.2, h: 0.5, fill: { color: COLORS.flipkart } });
    slide.addText("Flipkart", { x: 0.6, y: 1.2, w: 4.2, h: 0.5, fontSize: 16, fontFace: "Arial Black", color: COLORS.white, align: "center", valign: "middle" });

    const fkSteps = [
      "Open Flipkart Seller Hub",
      "Go to Orders \u2192 Ready to Ship",
      "Select your orders",
      "Click \"Download Labels\"",
      "Save the PDF file",
    ];
    slide.addText(fkSteps.map((s, i) => ({
      text: `${i + 1}. ${s}`,
      options: { breakLine: true, fontSize: 13, fontFace: "Calibri", color: COLORS.bodyText, paraSpaceAfter: 8 },
    })), { x: 1.0, y: 1.9, w: 3.5, h: 2.8 });

    // Meesho column
    slide.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.2, w: 4.2, h: 3.8, fill: { color: COLORS.white }, shadow: makeShadow() });
    slide.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.2, w: 4.2, h: 0.5, fill: { color: COLORS.meesho } });
    slide.addText("Meesho", { x: 5.2, y: 1.2, w: 4.2, h: 0.5, fontSize: 16, fontFace: "Arial Black", color: COLORS.white, align: "center", valign: "middle" });

    const mhSteps = [
      "Open Meesho Supplier Panel",
      "Go to Orders \u2192 Ready to Ship",
      "Select your orders",
      "Click \"Generate Label\"",
      "Download the PDF file",
    ];
    slide.addText(mhSteps.map((s, i) => ({
      text: `${i + 1}. ${s}`,
      options: { breakLine: true, fontSize: 13, fontFace: "Calibri", color: COLORS.bodyText, paraSpaceAfter: 8 },
    })), { x: 5.6, y: 1.9, w: 3.5, h: 2.8 });
  }

  // ========== SLIDE 5: STEP 2 - OPEN ILOVELABLES ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.offWhite };

    slide.addShape(pres.shapes.OVAL, { x: 0.6, y: 0.3, w: 0.55, h: 0.55, fill: { color: COLORS.primary } });
    slide.addText("2", { x: 0.6, y: 0.3, w: 0.55, h: 0.55, fontSize: 22, fontFace: "Arial Black", color: COLORS.white, align: "center", valign: "middle" });
    slide.addText("Open ilovelables.com", { x: 1.3, y: 0.3, w: 8, h: 0.55, fontSize: 28, fontFace: "Arial Black", color: COLORS.darkText, margin: 0, valign: "middle" });

    // Browser mockup
    slide.addShape(pres.shapes.RECTANGLE, { x: 1.2, y: 1.2, w: 7.6, h: 3.6, fill: { color: COLORS.white }, shadow: makeShadow() });
    // Browser bar
    slide.addShape(pres.shapes.RECTANGLE, { x: 1.2, y: 1.2, w: 7.6, h: 0.45, fill: { color: COLORS.lightGray } });
    slide.addText("ilovelables.com", { x: 2.5, y: 1.22, w: 5, h: 0.4, fontSize: 11, fontFace: "Calibri", color: COLORS.bodyText, align: "center" });
    // Tab mockup
    slide.addShape(pres.shapes.RECTANGLE, { x: 2.5, y: 2.0, w: 2.2, h: 0.55, fill: { color: COLORS.flipkart } });
    slide.addText("Flipkart", { x: 2.5, y: 2.0, w: 2.2, h: 0.55, fontSize: 14, fontFace: "Calibri", color: COLORS.white, bold: true, align: "center", valign: "middle" });
    slide.addShape(pres.shapes.RECTANGLE, { x: 4.8, y: 2.0, w: 2.2, h: 0.55, fill: { color: COLORS.lightGray } });
    slide.addText("Meesho", { x: 4.8, y: 2.0, w: 2.2, h: 0.55, fontSize: 14, fontFace: "Calibri", color: COLORS.meesho, bold: true, align: "center", valign: "middle" });
    // Upload area mockup
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 2.2, y: 2.8, w: 5.6, h: 1.5,
      fill: { color: "F8FAFC" },
      line: { color: "B0C4DE", width: 1.5, dashType: "dash" },
    });
    slide.addText("Drag & drop PDFs here", { x: 2.2, y: 3.2, w: 5.6, h: 0.6, fontSize: 13, fontFace: "Calibri", color: COLORS.mutedText, align: "center" });

    // Bullet points below
    const bullets = [
      "Go to ilovelables.com in any browser (Chrome, Edge, Firefox)",
      "Select your platform: Flipkart (blue tab) or Meesho (pink tab)",
      "No app download needed \u2014 everything runs in your browser",
    ];
    slide.addText(bullets.map((b, i) => ({
      text: b,
      options: { bullet: true, breakLine: i < bullets.length - 1, fontSize: 13, fontFace: "Calibri", color: COLORS.bodyText, paraSpaceAfter: 6 },
    })), { x: 1.2, y: 4.85, w: 7.6, h: 0.7 });
  }

  // ========== SLIDE 6: STEP 3 - UPLOAD PDF ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.primary };

    slide.addShape(pres.shapes.OVAL, { x: 0.6, y: 0.3, w: 0.55, h: 0.55, fill: { color: COLORS.accent } });
    slide.addText("3", { x: 0.6, y: 0.3, w: 0.55, h: 0.55, fontSize: 22, fontFace: "Arial Black", color: COLORS.white, align: "center", valign: "middle" });
    slide.addText("Upload Your Label PDF", { x: 1.3, y: 0.3, w: 8, h: 0.55, fontSize: 28, fontFace: "Arial Black", color: COLORS.white, margin: 0, valign: "middle" });

    // Large upload area mockup
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 1.5, y: 1.2, w: 7, h: 2.5,
      fill: { color: COLORS.primaryLight, transparency: 50 },
      line: { color: COLORS.lightGray, width: 2, dashType: "dash" },
    });
    slide.addImage({ data: icons.upload, x: 4.5, y: 1.5, w: 0.8, h: 0.8 });
    slide.addText("Drag & drop your PDFs here", { x: 1.5, y: 2.4, w: 7, h: 0.5, fontSize: 18, fontFace: "Calibri", color: COLORS.white, align: "center" });
    slide.addText("or click to browse", { x: 1.5, y: 2.85, w: 7, h: 0.4, fontSize: 14, fontFace: "Calibri", color: COLORS.lightGray, align: "center" });

    const tips = [
      "Drag & drop single or multiple PDF files into the upload area",
      "Or click the area to open file browser and select files",
      "Upload all your label PDFs at once for bulk processing",
      "Supports any number of labels \u2014 process 100+ in one go",
    ];
    tips.forEach((t, i) => {
      const y = 4.05 + i * 0.38;
      slide.addImage({ data: icons.checkWhite, x: 1.5, y: y + 0.02, w: 0.25, h: 0.25 });
      slide.addText(t, { x: 1.9, y, w: 7, h: 0.35, fontSize: 13, fontFace: "Calibri", color: COLORS.lightGray, margin: 0 });
    });
  }

  // ========== SLIDE 7: STEP 4 - PREPARE & DOWNLOAD ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.offWhite };

    slide.addShape(pres.shapes.OVAL, { x: 0.6, y: 0.3, w: 0.55, h: 0.55, fill: { color: COLORS.primary } });
    slide.addText("4", { x: 0.6, y: 0.3, w: 0.55, h: 0.55, fontSize: 22, fontFace: "Arial Black", color: COLORS.white, align: "center", valign: "middle" });
    slide.addText("Click Prepare & Download", { x: 1.3, y: 0.3, w: 8, h: 0.55, fontSize: 28, fontFace: "Arial Black", color: COLORS.darkText, margin: 0, valign: "middle" });

    // Process flow: Button -> Processing -> Results
    // Button
    slide.addShape(pres.shapes.RECTANGLE, { x: 1.0, y: 1.2, w: 2.5, h: 1.6, fill: { color: COLORS.white }, shadow: makeShadow() });
    slide.addShape(pres.shapes.RECTANGLE, { x: 1.4, y: 1.5, w: 1.7, h: 0.45, fill: { color: COLORS.primary } });
    slide.addText("Prepare Labels", { x: 1.4, y: 1.5, w: 1.7, h: 0.45, fontSize: 10, fontFace: "Calibri", color: COLORS.white, bold: true, align: "center", valign: "middle" });
    slide.addText("Click the button", { x: 1.0, y: 2.2, w: 2.5, h: 0.4, fontSize: 11, fontFace: "Calibri", color: COLORS.mutedText, align: "center" });

    // Arrow 1
    slide.addText("\u2192", { x: 3.5, y: 1.6, w: 0.6, h: 0.6, fontSize: 28, color: COLORS.accent, align: "center", valign: "middle" });

    // Processing
    slide.addShape(pres.shapes.RECTANGLE, { x: 4.0, y: 1.2, w: 2.5, h: 1.6, fill: { color: COLORS.white }, shadow: makeShadow() });
    slide.addText("\u2699\uFE0F", { x: 4.0, y: 1.35, w: 2.5, h: 0.5, fontSize: 22, align: "center" });
    slide.addText("Auto-processing", { x: 4.0, y: 1.85, w: 2.5, h: 0.3, fontSize: 10, fontFace: "Calibri", color: COLORS.bodyText, align: "center" });
    slide.addText("Detect \u2192 Crop \u2192 Sort", { x: 4.0, y: 2.15, w: 2.5, h: 0.3, fontSize: 9, fontFace: "Calibri", color: COLORS.mutedText, align: "center" });

    // Arrow 2
    slide.addText("\u2192", { x: 6.5, y: 1.6, w: 0.6, h: 0.6, fontSize: 28, color: COLORS.accent, align: "center", valign: "middle" });

    // Results
    slide.addShape(pres.shapes.RECTANGLE, { x: 7.0, y: 1.2, w: 2.5, h: 1.6, fill: { color: COLORS.white }, shadow: makeShadow() });
    slide.addShape(pres.shapes.RECTANGLE, { x: 7.4, y: 1.5, w: 1.7, h: 0.45, fill: { color: COLORS.green } });
    slide.addText("Download", { x: 7.4, y: 1.5, w: 1.7, h: 0.45, fontSize: 10, fontFace: "Calibri", color: COLORS.white, bold: true, align: "center", valign: "middle" });
    slide.addText("Print-ready labels!", { x: 7.0, y: 2.2, w: 2.5, h: 0.4, fontSize: 11, fontFace: "Calibri", color: COLORS.mutedText, align: "center" });

    // Details below
    const details = [
      "Tool automatically detects labels and removes invoice portions",
      "Whitespace is trimmed \u2014 clean 4\u00D76 inch labels ready to print",
      "Labels sorted by SKU in the results table",
      "Download all as single merged PDF or individual label files",
      "Print directly on your thermal printer \u2014 just stick and ship!",
    ];
    details.forEach((d, i) => {
      const y = 3.2 + i * 0.42;
      slide.addImage({ data: icons.check, x: 0.8, y: y + 0.04, w: 0.25, h: 0.25 });
      slide.addText(d, { x: 1.2, y, w: 8, h: 0.35, fontSize: 13, fontFace: "Calibri", color: COLORS.bodyText, margin: 0 });
    });
  }

  // ========== SLIDE 8: PRO TIPS ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.offWhite };

    slide.addImage({ data: icons.lightbulb, x: 0.65, y: 0.35, w: 0.42, h: 0.42 });
    slide.addText("Pro Tips for Sellers", { x: 1.2, y: 0.3, w: 8, h: 0.55, fontSize: 28, fontFace: "Arial Black", color: COLORS.darkText, margin: 0, valign: "middle" });

    const tips = [
      { title: "Thermal Printer", items: ["TSC TE244, Xprinter XP-460B, TVS LP46", "Set paper to 4\u00D76 inch (100\u00D7150mm)", "Print at 203 DPI for best quality"] },
      { title: "Bulk Processing", items: ["Upload all PDFs at once via drag & drop", "Use \"Download All\" for merged output", "Process 100+ labels in seconds"] },
      { title: "SKU Sorting", items: ["Labels auto-grouped by product SKU", "Pack same products together", "Reduces errors, speeds up dispatch"] },
      { title: "Offline Mode", items: ["Works offline once page is loaded", "No data sent to any server", "Use Chrome or Edge for best results"] },
    ];

    tips.forEach((tip, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.6 + col * 4.6;
      const y = 1.15 + row * 2.1;

      slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 4.2, h: 1.85, fill: { color: COLORS.white }, shadow: makeShadow() });
      slide.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.07, h: 1.85, fill: { color: COLORS.accent } });
      slide.addText(tip.title, { x: x + 0.25, y: y + 0.1, w: 3.7, h: 0.38, fontSize: 15, fontFace: "Calibri", color: COLORS.darkText, bold: true, margin: 0 });
      slide.addText(tip.items.map((item, j) => ({
        text: item,
        options: { bullet: true, breakLine: j < tip.items.length - 1, fontSize: 11, fontFace: "Calibri", color: COLORS.bodyText, paraSpaceAfter: 4 },
      })), { x: x + 0.25, y: y + 0.55, w: 3.7, h: 1.2 });
    });
  }

  // ========== SLIDE 9: TROUBLESHOOTING ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.offWhite };

    slide.addImage({ data: icons.wrench, x: 0.65, y: 0.35, w: 0.42, h: 0.42 });
    slide.addText("Common Issues & Fixes", { x: 1.2, y: 0.3, w: 8, h: 0.55, fontSize: 28, fontFace: "Arial Black", color: COLORS.darkText, margin: 0, valign: "middle" });

    const issues = [
      { problem: "Labels cut off?", fix: "Check your PDF is not rotated or from a scanned image" },
      { problem: "Slow processing?", fix: "Try smaller batches of 20-30 labels at a time" },
      { problem: "Blank labels?", fix: "Make sure your PDF has embedded text, not scanned images" },
      { problem: "Wrong label count?", fix: "Verify you selected the correct platform tab (Flipkart/Meesho)" },
      { problem: "Browser crashes?", fix: "Use Google Chrome or Microsoft Edge for best performance" },
    ];

    issues.forEach((issue, i) => {
      const y = 1.1 + i * 0.85;
      slide.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 8.8, h: 0.72, fill: { color: COLORS.white }, shadow: makeShadow() });
      slide.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.07, h: 0.72, fill: { color: COLORS.accent } });
      slide.addText(issue.problem, { x: 0.9, y, w: 2.5, h: 0.72, fontSize: 14, fontFace: "Calibri", color: COLORS.accent, bold: true, valign: "middle", margin: 0 });
      slide.addText("\u2192  " + issue.fix, { x: 3.4, y, w: 5.8, h: 0.72, fontSize: 13, fontFace: "Calibri", color: COLORS.bodyText, valign: "middle", margin: 0 });
    });
  }

  // ========== SLIDE 10: CTA/OUTRO ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: COLORS.primary };

    slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 4.9, w: 10, h: 0.725, fill: { color: COLORS.accent } });

    slide.addImage({ data: icons.rocket, x: 4.5, y: 0.6, w: 0.7, h: 0.7 });

    slide.addText("Start Shipping Faster Today!", {
      x: 1, y: 1.4, w: 8, h: 1,
      fontSize: 38, fontFace: "Arial Black", color: COLORS.white, bold: true,
      align: "center",
    });

    slide.addText("ilovelables.com", {
      x: 2.5, y: 2.5, w: 5, h: 0.7,
      fontSize: 28, fontFace: "Arial Black", color: COLORS.accent, bold: true,
      align: "center",
    });

    slide.addText("100% Free  \u2022  No Signup  \u2022  Works in Browser", {
      x: 1.5, y: 3.2, w: 7, h: 0.5,
      fontSize: 16, fontFace: "Calibri", color: COLORS.lightGray,
      align: "center",
    });

    const ctaItems = [
      "Trusted by 1000+ Indian e-commerce sellers",
      "Save hours every week on label preparation",
      "Like & Subscribe for more seller tips!",
    ];
    ctaItems.forEach((item, i) => {
      const y = 3.9 + i * 0.35;
      slide.addImage({ data: icons.checkWhite, x: 2.8, y: y + 0.02, w: 0.22, h: 0.22 });
      slide.addText(item, { x: 3.15, y, w: 5, h: 0.3, fontSize: 13, fontFace: "Calibri", color: COLORS.white, margin: 0 });
    });

    slide.addText("Visit ilovelables.com \u2014 Start cropping labels in seconds!", {
      x: 1, y: 5.0, w: 8, h: 0.5,
      fontSize: 14, fontFace: "Calibri", color: COLORS.white, bold: true,
      align: "center",
    });
  }

  await pres.writeFile({ fileName: "D:/Rahul/My Lable Crop/ILoveLables-Tutorial.pptx" });
  console.log("Presentation saved to D:/Rahul/My Lable Crop/ILoveLables-Tutorial.pptx");
}

createPresentation().catch(console.error);
