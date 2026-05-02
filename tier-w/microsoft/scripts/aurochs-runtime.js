// node_modules/aurochs/dist/_shared/ast-DZHUWiB8.js
function isXmlElement(node) {
  if (typeof node !== "object") {
    return false;
  }
  if (node === null) {
    return false;
  }
  if (!("type" in node)) {
    return false;
  }
  return node.type === "element";
}
function isXmlDocument(value) {
  if (typeof value !== "object") {
    return false;
  }
  if (value === null) {
    return false;
  }
  if (!("children" in value)) {
    return false;
  }
  return Array.isArray(value.children);
}
function isXmlText(node) {
  if (typeof node !== "object") {
    return false;
  }
  if (node === null) {
    return false;
  }
  if (!("type" in node)) {
    return false;
  }
  return node.type === "text";
}
function getChild(parent, name) {
  const match = createElementNameMatcher(name);
  for (const child of parent.children) {
    if (isXmlElement(child) && match(child.name)) {
      return child;
    }
  }
  return void 0;
}
function getChildren(parent, name) {
  const match = createElementNameMatcher(name);
  const result = [];
  for (const child of parent.children) {
    if (isXmlElement(child) && match(child.name)) {
      result.push(child);
    }
  }
  return result;
}
function createElementNameMatcher(name) {
  if (name.includes(":")) {
    return (childName) => childName === name;
  }
  return (childName) => childName === name || childName.endsWith(`:${name}`);
}
function getTextContent(element) {
  return element.children.filter(isXmlText).map((child) => child.value).join("");
}
function getAttr(element, name) {
  return element.attrs[name];
}
function getByPath(element, path) {
  if (element === null || element === void 0) {
    return void 0;
  }
  if ("children" in element && !("type" in element)) {
    const doc = element;
    if (path.length === 0) {
      return void 0;
    }
    const firstChild = doc.children.find((c) => {
      if (!isXmlElement(c)) {
        return false;
      }
      return c.name === path[0];
    });
    if (!firstChild) {
      return void 0;
    }
    return getByPath(firstChild, path.slice(1));
  }
  if (!isXmlElement(element)) {
    return void 0;
  }
  return path.reduce(
    (current, name) => current ? getChild(current, name) : void 0,
    element
  );
}
function getTextByPath(element, path) {
  const target = getByPath(element, path);
  if (!target) {
    return void 0;
  }
  return getTextContent(target);
}
function findChild(element, predicate) {
  if (!element) {
    return void 0;
  }
  for (const child of element.children) {
    if (isXmlElement(child) && predicate(child)) {
      return child;
    }
  }
  return void 0;
}
function createElement(name, attrs = {}, children2 = []) {
  return {
    type: "element",
    name,
    attrs,
    children: children2
  };
}
function createText(value) {
  return {
    type: "text",
    value
  };
}

// node_modules/aurochs/dist/_shared/ooxml-content-types-Dc8d1YEr.js
var PRESENTATIONML_CONTENT_TYPES = {
  /** Main presentation */
  presentation: "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml",
  /** Slide */
  slide: "application/vnd.openxmlformats-officedocument.presentationml.slide+xml",
  /** Slide layout */
  slideLayout: "application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml",
  /** Slide master */
  slideMaster: "application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml",
  /** Notes slide */
  notesSlide: "application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml",
  /** Comments */
  comments: "application/vnd.openxmlformats-officedocument.presentationml.comments+xml",
  /** Comment authors */
  commentAuthors: "application/vnd.openxmlformats-officedocument.presentationml.commentAuthors+xml"
};
var WORDPROCESSINGML_CONTENT_TYPES = {
  /** Main document */
  document: "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
  /** Macro-enabled document (docm) */
  documentMacroEnabled: "application/vnd.ms-word.document.macroEnabled.main+xml",
  /** Styles */
  styles: "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml",
  /** Numbering */
  numbering: "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml",
  /** Font table */
  fontTable: "application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml",
  /** Settings */
  settings: "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml",
  /** Web settings */
  webSettings: "application/vnd.openxmlformats-officedocument.wordprocessingml.webSettings+xml",
  /** Header */
  header: "application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml",
  /** Footer */
  footer: "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml",
  /** Footnotes */
  footnotes: "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml",
  /** Endnotes */
  endnotes: "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml",
  /** Comments */
  comments: "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml"
};
var DRAWINGML_CONTENT_TYPES = {
  /** Theme */
  theme: "application/vnd.openxmlformats-officedocument.theme+xml",
  /** Chart */
  chart: "application/vnd.openxmlformats-officedocument.drawingml.chart+xml",
  /** Drawing (SpreadsheetML / WordprocessingML) */
  drawing: "application/vnd.openxmlformats-officedocument.drawing+xml"
};
var OLE_CONTENT_TYPES = {
  /** Embedded Excel workbook */
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  /** Embedded Word document */
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  /** Embedded PowerPoint presentation */
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
};
var MEDIA_CONTENT_TYPE_TO_EXTENSION = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/gif": "gif",
  "image/bmp": "bmp",
  "image/tiff": "tiff",
  "image/x-emf": "emf",
  "image/x-wmf": "wmf",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/mp4": "m4a",
  "audio/ogg": "ogg"
};
function inferExtensionFromMediaContentType(contentType) {
  return MEDIA_CONTENT_TYPE_TO_EXTENSION[contentType] ?? "bin";
}

// node_modules/aurochs/dist/_shared/ooxml-namespaces-o0hSZzll.js
var OPC_NAMESPACES = {
  /** Content Types namespace */
  contentTypes: "http://schemas.openxmlformats.org/package/2006/content-types",
  /** Relationships namespace */
  relationships: "http://schemas.openxmlformats.org/package/2006/relationships"
};
var OFFICE_NAMESPACES = {
  /** Relationships (r:) */
  relationships: "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
  /** Office Math (m:) */
  math: "http://schemas.openxmlformats.org/officeDocument/2006/math"
};
var DRAWINGML_NAMESPACES = {
  /** Main DrawingML (a:) */
  main: "http://schemas.openxmlformats.org/drawingml/2006/main",
  /** Picture (pic:) */
  picture: "http://schemas.openxmlformats.org/drawingml/2006/picture",
  /** WordprocessingML Drawing (wp:) */
  wordprocessingDrawing: "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
};
var WORDPROCESSINGML_NAMESPACES = {
  /** Main WordprocessingML (w:) */
  main: "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
};
var SPREADSHEETML_NAMESPACES = {
  /** Main SpreadsheetML */
  main: "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
};
var VML_NAMESPACES = {
  /** VML (v:) */
  vml: "urn:schemas-microsoft-com:vml",
  /** Office VML (o:) */
  office: "urn:schemas-microsoft-com:office:office",
  /** Word VML (w10:) */
  word: "urn:schemas-microsoft-com:office:word"
};

// node_modules/aurochs/dist/_shared/ooxml-relationship-types-sJPF249X.js
var OFFICE_RELATIONSHIP_TYPES = {
  /** Main office document (workbook, document, presentation) */
  officeDocument: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
  /** Theme relationship */
  theme: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme",
  /** Theme override relationship */
  themeOverride: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/themeOverride",
  /** Image relationship */
  image: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image",
  /** Chart relationship */
  chart: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart",
  /** Hyperlink relationship */
  hyperlink: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink",
  /** OLE object relationship */
  oleObject: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/oleObject",
  /** Embedded package relationship */
  package: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/package",
  /** VML drawing relationship */
  vmlDrawing: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/vmlDrawing",
  /** Video relationship */
  video: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/video",
  /** Audio relationship */
  audio: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/audio",
  /** Styles relationship */
  styles: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles",
  /** Font relationship */
  font: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/font",
  /** Drawing relationship (worksheet/slide → drawing part) */
  drawing: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing"
};
var PRESENTATIONML_RELATIONSHIP_TYPES = {
  /** Slide relationship (presentation.xml -> slideN.xml) */
  slide: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide",
  /** Slide layout relationship */
  slideLayout: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout",
  /** Slide master relationship */
  slideMaster: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster",
  /** Notes slide relationship */
  notesSlide: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide",
  /** Comments relationship */
  comments: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments",
  /** Comment authors relationship */
  commentAuthors: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/commentAuthors",
  /** Diagram drawing relationship (DrawingML diagrams) */
  diagramDrawing: "http://schemas.microsoft.com/office/2007/relationships/diagramDrawing"
};
var WORDPROCESSINGML_RELATIONSHIP_TYPES = {
  /** Numbering definitions part */
  numbering: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering",
  /** Font table part */
  fontTable: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable",
  /** Settings part */
  settings: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings",
  /** Web settings part */
  webSettings: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings",
  /** Header part */
  header: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/header",
  /** Footer part */
  footer: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer",
  /** Footnotes part */
  footnotes: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes",
  /** Endnotes part */
  endnotes: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/endnotes",
  /** Comments part */
  comments: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments"
};
var SPREADSHEETML_RELATIONSHIP_TYPES = {
  /** Worksheet relationship */
  worksheet: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet",
  /** Shared strings relationship */
  sharedStrings: "http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings"
};

// node_modules/aurochs/dist/_shared/units-BcSb2Y1_.js
var px = (value) => value;
var deg = (value) => value;
var pct = (value) => value;
var pt = (value) => value;
var emu = (value) => value;

// node_modules/aurochs/dist/_shared/types-MMsvqwHv.js
var docxStyleId = (v) => v;
var docxAbstractNumId = (v) => v;
var docxNumId = (v) => v;
var docxIlvl = (v) => v;
var docxRelId = (v) => v;
var twips = (v) => v;
var halfPoints = (v) => v;

// node_modules/aurochs/dist/_shared/table-Dnyy3aVr.js
var eighthPt = (value) => value;
var gridSpan = (value) => value;

// node_modules/aurochs/dist/_shared/primitive-BgiqQ7kU.js
var EMU_PER_INCH = 914400;
var STANDARD_DPI = 96;
var EMU_TO_PX = STANDARD_DPI / EMU_PER_INCH;
var ANGLE_UNITS_PER_DEGREE = 6e4;
var PERCENT_1000 = 1e3;
var PERCENT_100000 = 1e5;
function parseInt32(value) {
  if (value === void 0) {
    return void 0;
  }
  const num = parseInt(value, 10);
  return Number.isNaN(num) ? void 0 : num;
}
function parseInt64(value) {
  if (value === void 0) {
    return void 0;
  }
  const num = parseInt(value, 10);
  if (Number.isNaN(num)) {
    return void 0;
  }
  if (!Number.isSafeInteger(num)) {
    return void 0;
  }
  return num;
}
function parseUnsignedInt(value) {
  const num = parseInt64(value);
  if (num === void 0) {
    return void 0;
  }
  if (num < 0 || num > 4294967295) {
    return void 0;
  }
  return num;
}
function parseIndex(value) {
  return parseUnsignedInt(value);
}
function parseInt32Or(value, defaultValue) {
  return parseInt32(value) ?? defaultValue;
}
function parseBoolean(value) {
  if (value === void 0) {
    return void 0;
  }
  const lower = value.toLowerCase();
  if (lower === "1" || lower === "true" || lower === "on" || lower === "") {
    return true;
  }
  if (lower === "0" || lower === "false" || lower === "off") {
    return false;
  }
  return void 0;
}
function parseBooleanOr(value, defaultValue) {
  return parseBoolean(value) ?? defaultValue;
}
function parseEmu(value) {
  const num = parseInt32(value);
  if (num === void 0) {
    return void 0;
  }
  return px(num * EMU_TO_PX);
}
function parseLineWidth(value) {
  const num = parseInt32(value);
  if (num === void 0) {
    return void 0;
  }
  if (num < 0 || num > 20116800) {
    return void 0;
  }
  return px(num * EMU_TO_PX);
}
function parseAngle(value) {
  const num = parseInt32(value);
  if (num === void 0) {
    return void 0;
  }
  return deg(num / ANGLE_UNITS_PER_DEGREE);
}
function parsePercentage(value) {
  const num = parseInt32(value);
  if (num === void 0) {
    return void 0;
  }
  return pct(num / PERCENT_1000);
}
function parsePercentage100k(value) {
  const num = parseInt32(value);
  if (num === void 0) {
    return void 0;
  }
  return pct(num / PERCENT_100000 * 100);
}
function parsePositivePercentage(value) {
  const p = parsePercentage(value);
  if (p === void 0 || p < 0) {
    return void 0;
  }
  return p;
}
function parseFixedPercentage(value) {
  const p = parsePercentage100k(value);
  if (p === void 0 || p < 0 || p > 100) {
    return void 0;
  }
  return p;
}
function parseSchemeColorValue(value) {
  switch (value) {
    case "dk1":
    case "lt1":
    case "dk2":
    case "lt2":
    case "accent1":
    case "accent2":
    case "accent3":
    case "accent4":
    case "accent5":
    case "accent6":
    case "hlink":
    case "folHlink":
    case "bg1":
    case "bg2":
    case "tx1":
    case "tx2":
    case "phClr":
      return value;
    default:
      return void 0;
  }
}
function getEmuAttr(element, name) {
  return parseEmu(getAttr(element, name));
}
function getAngleAttr(element, name) {
  return parseAngle(getAttr(element, name));
}
function getBoolAttrOr(element, name, defaultValue) {
  return parseBooleanOr(getAttr(element, name), defaultValue);
}
function getPercent100kAttr(element, name) {
  return parsePercentage100k(getAttr(element, name));
}

// node_modules/aurochs/dist/_shared/drawing-primitive-B2kpyGx5.js
function parseAlignH(value) {
  switch (value) {
    case "left":
    case "right":
    case "center":
    case "inside":
    case "outside":
      return value;
    default:
      return void 0;
  }
}
function parseAlignV(value) {
  switch (value) {
    case "top":
    case "bottom":
    case "center":
    case "inside":
    case "outside":
      return value;
    default:
      return void 0;
  }
}
function parseRelFromH(value) {
  switch (value) {
    case "character":
    case "column":
    case "insideMargin":
    case "leftMargin":
    case "margin":
    case "outsideMargin":
    case "page":
    case "rightMargin":
      return value;
    default:
      return void 0;
  }
}
function parseRelFromV(value) {
  switch (value) {
    case "bottomMargin":
    case "insideMargin":
    case "line":
    case "margin":
    case "outsideMargin":
    case "page":
    case "paragraph":
    case "topMargin":
      return value;
    default:
      return void 0;
  }
}
function parseWrapText(value) {
  switch (value) {
    case "bothSides":
    case "left":
    case "right":
    case "largest":
      return value;
    default:
      return void 0;
  }
}

// node_modules/aurochs/dist/_shared/document-D8AbKS4A.js
var NS_WORDPROCESSINGML = WORDPROCESSINGML_NAMESPACES.main;
var NS_DRAWINGML = DRAWINGML_NAMESPACES.main;
var NS_DRAWINGML_PICTURE = DRAWINGML_NAMESPACES.picture;
var NS_DRAWINGML_WORDPROCESSING = DRAWINGML_NAMESPACES.wordprocessingDrawing;
var NS_RELATIONSHIPS = OFFICE_NAMESPACES.relationships;
var NS_CONTENT_TYPES = OPC_NAMESPACES.contentTypes;
var NS_PACKAGE_RELATIONSHIPS = OPC_NAMESPACES.relationships;
var NS_VML = VML_NAMESPACES.vml;
var NS_VML_OFFICE = VML_NAMESPACES.office;
var NS_VML_WORD = VML_NAMESPACES.word;
var NS_MATH = OFFICE_NAMESPACES.math;
var RELATIONSHIP_TYPES = {
  /** Main document part */
  officeDocument: OFFICE_RELATIONSHIP_TYPES.officeDocument,
  /** Styles part */
  styles: OFFICE_RELATIONSHIP_TYPES.styles,
  /** Numbering definitions part */
  numbering: WORDPROCESSINGML_RELATIONSHIP_TYPES.numbering,
  /** Font table part */
  fontTable: WORDPROCESSINGML_RELATIONSHIP_TYPES.fontTable,
  /** Settings part */
  settings: WORDPROCESSINGML_RELATIONSHIP_TYPES.settings,
  /** Web settings part */
  webSettings: WORDPROCESSINGML_RELATIONSHIP_TYPES.webSettings,
  /** Theme part */
  theme: OFFICE_RELATIONSHIP_TYPES.theme,
  /** Header part */
  header: WORDPROCESSINGML_RELATIONSHIP_TYPES.header,
  /** Footer part */
  footer: WORDPROCESSINGML_RELATIONSHIP_TYPES.footer,
  /** Footnotes part */
  footnotes: WORDPROCESSINGML_RELATIONSHIP_TYPES.footnotes,
  /** Endnotes part */
  endnotes: WORDPROCESSINGML_RELATIONSHIP_TYPES.endnotes,
  /** Comments part */
  comments: WORDPROCESSINGML_RELATIONSHIP_TYPES.comments,
  /** Image relationship */
  image: OFFICE_RELATIONSHIP_TYPES.image,
  /** Hyperlink relationship */
  hyperlink: OFFICE_RELATIONSHIP_TYPES.hyperlink,
  /** Embedded package (OLE object) */
  oleObject: OFFICE_RELATIONSHIP_TYPES.oleObject,
  /** Package relationship */
  package: OFFICE_RELATIONSHIP_TYPES.package
};
var CONTENT_TYPES = {
  ...WORDPROCESSINGML_CONTENT_TYPES,
  /** Theme content type (from DrawingML) */
  theme: DRAWINGML_CONTENT_TYPES.theme,
  /** Relationships content type */
  relationships: "application/vnd.openxmlformats-package.relationships+xml",
  /** Core properties content type */
  coreProperties: "application/vnd.openxmlformats-package.core-properties+xml"
};
var DEFAULT_PART_PATHS = {
  document: "word/document.xml",
  styles: "word/styles.xml",
  numbering: "word/numbering.xml",
  fontTable: "word/fontTable.xml",
  settings: "word/settings.xml",
  webSettings: "word/webSettings.xml",
  theme: "word/theme/theme1.xml",
  documentRels: "word/_rels/document.xml.rels",
  rootRels: "_rels/.rels",
  contentTypes: "[Content_Types].xml"
};
var TWIPS_PER_INCH = 1440;
var STANDARD_DPI2 = 96;
var TWIPS_TO_PX$1 = STANDARD_DPI2 / TWIPS_PER_INCH;
var POINTS_PER_INCH = 72;
var PT_TO_PX = STANDARD_DPI2 / POINTS_PER_INCH;
function parseInt322(value) {
  if (value === void 0) {
    return void 0;
  }
  const num = parseInt(value, 10);
  return isNaN(num) ? void 0 : num;
}
function parseBoolean2(value) {
  if (value === void 0) {
    return void 0;
  }
  const lower = value.toLowerCase();
  if (lower === "1" || lower === "true" || lower === "on" || lower === "") {
    return true;
  }
  if (lower === "0" || lower === "false" || lower === "off") {
    return false;
  }
  return void 0;
}
function parseOnOff(element) {
  if (!element) {
    return void 0;
  }
  const val = getAttr(element, "val");
  if (val === void 0) {
    return true;
  }
  return parseBoolean2(val);
}
function parseTwips(value) {
  const num = parseInt322(value);
  if (num === void 0) {
    return void 0;
  }
  return twips(num);
}
function parseHalfPoints(value) {
  const num = parseInt322(value);
  if (num === void 0) {
    return void 0;
  }
  return halfPoints(num);
}
function parseEighthPoints(value) {
  const num = parseInt322(value);
  if (num === void 0) {
    return void 0;
  }
  return eighthPt(num);
}
function parseStyleId(value) {
  if (value === void 0 || value === "") {
    return void 0;
  }
  return docxStyleId(value);
}
function parseNumId(value) {
  const num = parseInt322(value);
  if (num === void 0) {
    return void 0;
  }
  return docxNumId(num);
}
function parseAbstractNumId(value) {
  const num = parseInt322(value);
  if (num === void 0) {
    return void 0;
  }
  return docxAbstractNumId(num);
}
function parseIlvl(value) {
  const num = parseInt322(value);
  if (num === void 0 || num < 0 || num > 8) {
    return void 0;
  }
  return docxIlvl(num);
}
function parseRelId(value) {
  if (value === void 0 || value === "") {
    return void 0;
  }
  return docxRelId(value);
}
function getChildAttr(parent, childName, attrName) {
  const child = getChild(parent, childName);
  if (!child) {
    return void 0;
  }
  return getAttr(child, attrName);
}
function getChildVal(parent, childName) {
  return getChildAttr(parent, childName, "val");
}
function getChildIntVal(parent, childName) {
  const val = getChildVal(parent, childName);
  return parseInt322(val);
}
function parseToggleChild(parent, childName) {
  const child = getChild(parent, childName);
  return parseOnOff(child);
}
function localName(element) {
  return element.name.split(":").pop() ?? element.name;
}
function getValAttr(element) {
  if (!element) {
    return void 0;
  }
  return getAttr(element, "m:val") ?? getAttr(element, "val");
}
function parseMathStyle(value) {
  switch (value) {
    case "p":
    case "b":
    case "i":
    case "bi":
      return value;
    default:
      return void 0;
  }
}
function parseMathScript(value) {
  switch (value) {
    case "roman":
    case "script":
    case "fraktur":
    case "double-struck":
    case "sans-serif":
    case "monospace":
      return value;
    default:
      return void 0;
  }
}
function parseMathRunProperties(element) {
  if (!element) {
    return void 0;
  }
  const styEl = getChild(element, "sty");
  const scrEl = getChild(element, "scr");
  const norEl = getChild(element, "nor");
  const brkEl = getChild(element, "brk");
  const alnEl = getChild(element, "aln");
  const litEl = getChild(element, "lit");
  return {
    sty: parseMathStyle(getValAttr(styEl)),
    scr: parseMathScript(getValAttr(scrEl)),
    nor: norEl ? parseBoolean2(getValAttr(norEl)) ?? true : void 0,
    brk: brkEl ? parseInt322(getAttr(brkEl, "alnAt")) : void 0,
    aln: alnEl ? parseBoolean2(getValAttr(alnEl)) ?? true : void 0,
    lit: litEl ? parseBoolean2(getValAttr(litEl)) ?? true : void 0
  };
}
function parseFractionType(value) {
  switch (value) {
    case "bar":
    case "skw":
    case "lin":
    case "noBar":
      return value;
    default:
      return void 0;
  }
}
function parseLimitLocation(value) {
  switch (value) {
    case "subSup":
    case "undOvr":
      return value;
    default:
      return void 0;
  }
}
function parseBarPosition(value) {
  switch (value) {
    case "top":
    case "bot":
      return value;
    default:
      return void 0;
  }
}
function parseMathJustification(value) {
  switch (value) {
    case "left":
    case "right":
    case "center":
    case "centerGroup":
      return value;
    default:
      return void 0;
  }
}
function parseMathContentChildren(element, context) {
  const content = [];
  for (const child of element.children) {
    if (!isXmlElement(child)) {
      continue;
    }
    const parsed = parseMathElement(child);
    if (parsed) {
      content.push(parsed);
    }
  }
  return content;
}
function parseArgument(parent, name, context) {
  const argEl = getChild(parent, name);
  if (!argEl) {
    return [];
  }
  return parseMathContentChildren(argEl);
}
function parseMathRun(element, context) {
  const rPrEl = getChild(element, "rPr");
  const tEl = getChild(element, "t");
  return {
    type: "mathRun",
    properties: parseMathRunProperties(rPrEl),
    rPr: parseRunProperties(rPrEl ? getChild(rPrEl, "rPr") : void 0),
    text: tEl ? getTextContent(tEl) : ""
  };
}
function parseFraction(element, context) {
  const fPrEl = getChild(element, "fPr");
  const typeEl = fPrEl ? getChild(fPrEl, "type") : void 0;
  return {
    type: "mathFraction",
    fracType: parseFractionType(getValAttr(typeEl)),
    numerator: parseArgument(element, "num"),
    denominator: parseArgument(element, "den")
  };
}
function parseRadical(element, context) {
  const radPrEl = getChild(element, "radPr");
  const degHideEl = radPrEl ? getChild(radPrEl, "degHide") : void 0;
  return {
    type: "mathRadical",
    hideDeg: degHideEl ? parseBoolean2(getValAttr(degHideEl)) ?? true : void 0,
    degree: parseArgument(element, "deg"),
    base: parseArgument(element, "e")
  };
}
function parseNary(element, context) {
  const naryPrEl = getChild(element, "naryPr");
  const chrEl = naryPrEl ? getChild(naryPrEl, "chr") : void 0;
  const limLocEl = naryPrEl ? getChild(naryPrEl, "limLoc") : void 0;
  const growEl = naryPrEl ? getChild(naryPrEl, "grow") : void 0;
  const subHideEl = naryPrEl ? getChild(naryPrEl, "subHide") : void 0;
  const supHideEl = naryPrEl ? getChild(naryPrEl, "supHide") : void 0;
  return {
    type: "mathNary",
    char: getValAttr(chrEl),
    limLoc: parseLimitLocation(getValAttr(limLocEl)),
    grow: growEl ? parseBoolean2(getValAttr(growEl)) ?? true : void 0,
    subHide: subHideEl ? parseBoolean2(getValAttr(subHideEl)) ?? true : void 0,
    supHide: supHideEl ? parseBoolean2(getValAttr(supHideEl)) ?? true : void 0,
    subscript: parseArgument(element, "sub"),
    superscript: parseArgument(element, "sup"),
    base: parseArgument(element, "e")
  };
}
function parseSuperscript(element, context) {
  return {
    type: "mathSuperscript",
    base: parseArgument(element, "e"),
    superscript: parseArgument(element, "sup")
  };
}
function parseSubscript(element, context) {
  return {
    type: "mathSubscript",
    base: parseArgument(element, "e"),
    subscript: parseArgument(element, "sub")
  };
}
function parseSubSup(element, context) {
  return {
    type: "mathSubSup",
    base: parseArgument(element, "e"),
    subscript: parseArgument(element, "sub"),
    superscript: parseArgument(element, "sup")
  };
}
function parsePreSubSup(element, context) {
  return {
    type: "mathPreSubSup",
    subscript: parseArgument(element, "sub"),
    superscript: parseArgument(element, "sup"),
    base: parseArgument(element, "e")
  };
}
function parseDelimiter(element, context) {
  const dPrEl = getChild(element, "dPr");
  const begChrEl = dPrEl ? getChild(dPrEl, "begChr") : void 0;
  const endChrEl = dPrEl ? getChild(dPrEl, "endChr") : void 0;
  const sepChrEl = dPrEl ? getChild(dPrEl, "sepChr") : void 0;
  const growEl = dPrEl ? getChild(dPrEl, "grow") : void 0;
  const shpEl = dPrEl ? getChild(dPrEl, "shp") : void 0;
  const elements = [];
  for (const eEl of getChildren(element, "e")) {
    elements.push(parseMathContentChildren(eEl));
  }
  return {
    type: "mathDelimiter",
    begChr: getValAttr(begChrEl),
    endChr: getValAttr(endChrEl),
    sepChr: getValAttr(sepChrEl),
    grow: growEl ? parseBoolean2(getValAttr(growEl)) ?? true : void 0,
    shp: shpEl ? getValAttr(shpEl) : void 0,
    elements
  };
}
function parseMatrix(element, context) {
  const mPrEl = getChild(element, "mPr");
  const baseJcEl = mPrEl ? getChild(mPrEl, "baseJc") : void 0;
  const rSpEl = mPrEl ? getChild(mPrEl, "rSp") : void 0;
  const rSpRuleEl = mPrEl ? getChild(mPrEl, "rSpRule") : void 0;
  const cGpEl = mPrEl ? getChild(mPrEl, "cGp") : void 0;
  const cGpRuleEl = mPrEl ? getChild(mPrEl, "cGpRule") : void 0;
  const rows = [];
  for (const mrEl of getChildren(element, "mr")) {
    const cells = [];
    for (const eEl of getChildren(mrEl, "e")) {
      cells.push(parseMathContentChildren(eEl));
    }
    rows.push({ cells });
  }
  return {
    type: "mathMatrix",
    rows,
    baseJc: baseJcEl ? getValAttr(baseJcEl) : void 0,
    rSp: rSpEl ? parseInt322(getValAttr(rSpEl)) : void 0,
    rSpRule: rSpRuleEl ? parseInt322(getValAttr(rSpRuleEl)) : void 0,
    cGp: cGpEl ? parseInt322(getValAttr(cGpEl)) : void 0,
    cGpRule: cGpRuleEl ? parseInt322(getValAttr(cGpRuleEl)) : void 0
  };
}
function parseLimitLower(element, context) {
  return {
    type: "mathLimitLower",
    base: parseArgument(element, "e"),
    limit: parseArgument(element, "lim")
  };
}
function parseLimitUpper(element, context) {
  return {
    type: "mathLimitUpper",
    base: parseArgument(element, "e"),
    limit: parseArgument(element, "lim")
  };
}
function parseAccent(element, context) {
  const accPrEl = getChild(element, "accPr");
  const chrEl = accPrEl ? getChild(accPrEl, "chr") : void 0;
  return {
    type: "mathAccent",
    char: getValAttr(chrEl),
    base: parseArgument(element, "e")
  };
}
function parseBar(element, context) {
  const barPrEl = getChild(element, "barPr");
  const posEl = barPrEl ? getChild(barPrEl, "pos") : void 0;
  return {
    type: "mathBar",
    pos: parseBarPosition(getValAttr(posEl)),
    base: parseArgument(element, "e")
  };
}
function parseBox(element, context) {
  const boxPrEl = getChild(element, "boxPr");
  const opEmuEl = boxPrEl ? getChild(boxPrEl, "opEmu") : void 0;
  const noBreakEl = boxPrEl ? getChild(boxPrEl, "noBreak") : void 0;
  const diffEl = boxPrEl ? getChild(boxPrEl, "diff") : void 0;
  const brkEl = boxPrEl ? getChild(boxPrEl, "brk") : void 0;
  const alnEl = boxPrEl ? getChild(boxPrEl, "aln") : void 0;
  return {
    type: "mathBox",
    base: parseArgument(element, "e"),
    opEmu: opEmuEl ? parseBoolean2(getValAttr(opEmuEl)) ?? true : void 0,
    noBreak: noBreakEl ? parseBoolean2(getValAttr(noBreakEl)) ?? true : void 0,
    diff: diffEl ? parseBoolean2(getValAttr(diffEl)) ?? true : void 0,
    brk: brkEl ? parseInt322(getAttr(brkEl, "alnAt")) : void 0,
    aln: alnEl ? parseBoolean2(getValAttr(alnEl)) ?? true : void 0
  };
}
function parseBorderBox(element, context) {
  const borderBoxPrEl = getChild(element, "borderBoxPr");
  const hideTopEl = borderBoxPrEl ? getChild(borderBoxPrEl, "hideTop") : void 0;
  const hideBotEl = borderBoxPrEl ? getChild(borderBoxPrEl, "hideBot") : void 0;
  const hideLeftEl = borderBoxPrEl ? getChild(borderBoxPrEl, "hideLeft") : void 0;
  const hideRightEl = borderBoxPrEl ? getChild(borderBoxPrEl, "hideRight") : void 0;
  const strikeHEl = borderBoxPrEl ? getChild(borderBoxPrEl, "strikeH") : void 0;
  const strikeVEl = borderBoxPrEl ? getChild(borderBoxPrEl, "strikeV") : void 0;
  const strikeBLTREl = borderBoxPrEl ? getChild(borderBoxPrEl, "strikeBLTR") : void 0;
  const strikeTLBREl = borderBoxPrEl ? getChild(borderBoxPrEl, "strikeTLBR") : void 0;
  return {
    type: "mathBorderBox",
    hideTop: hideTopEl ? parseBoolean2(getValAttr(hideTopEl)) ?? true : void 0,
    hideBot: hideBotEl ? parseBoolean2(getValAttr(hideBotEl)) ?? true : void 0,
    hideLeft: hideLeftEl ? parseBoolean2(getValAttr(hideLeftEl)) ?? true : void 0,
    hideRight: hideRightEl ? parseBoolean2(getValAttr(hideRightEl)) ?? true : void 0,
    strikeH: strikeHEl ? parseBoolean2(getValAttr(strikeHEl)) ?? true : void 0,
    strikeV: strikeVEl ? parseBoolean2(getValAttr(strikeVEl)) ?? true : void 0,
    strikeBLTR: strikeBLTREl ? parseBoolean2(getValAttr(strikeBLTREl)) ?? true : void 0,
    strikeTLBR: strikeTLBREl ? parseBoolean2(getValAttr(strikeTLBREl)) ?? true : void 0,
    base: parseArgument(element, "e")
  };
}
function parseFunction(element, context) {
  return {
    type: "mathFunction",
    functionName: parseArgument(element, "fName"),
    base: parseArgument(element, "e")
  };
}
function parseEquationArray(element, context) {
  const eqArrPrEl = getChild(element, "eqArrPr");
  const baseJcEl = eqArrPrEl ? getChild(eqArrPrEl, "baseJc") : void 0;
  const maxDistEl = eqArrPrEl ? getChild(eqArrPrEl, "maxDist") : void 0;
  const objDistEl = eqArrPrEl ? getChild(eqArrPrEl, "objDist") : void 0;
  const rSpEl = eqArrPrEl ? getChild(eqArrPrEl, "rSp") : void 0;
  const rSpRuleEl = eqArrPrEl ? getChild(eqArrPrEl, "rSpRule") : void 0;
  const equations = [];
  for (const eEl of getChildren(element, "e")) {
    equations.push(parseMathContentChildren(eEl));
  }
  return {
    type: "mathEquationArray",
    baseJc: baseJcEl ? getValAttr(baseJcEl) : void 0,
    maxDist: maxDistEl ? parseBoolean2(getValAttr(maxDistEl)) ?? true : void 0,
    objDist: objDistEl ? parseBoolean2(getValAttr(objDistEl)) ?? true : void 0,
    rSp: rSpEl ? parseInt322(getValAttr(rSpEl)) : void 0,
    rSpRule: rSpRuleEl ? parseInt322(getValAttr(rSpRuleEl)) : void 0,
    equations
  };
}
function parseGroupChar(element, context) {
  const groupChrPrEl = getChild(element, "groupChrPr");
  const chrEl = groupChrPrEl ? getChild(groupChrPrEl, "chr") : void 0;
  const posEl = groupChrPrEl ? getChild(groupChrPrEl, "pos") : void 0;
  const vertJcEl = groupChrPrEl ? getChild(groupChrPrEl, "vertJc") : void 0;
  return {
    type: "mathGroupChar",
    char: getValAttr(chrEl),
    pos: parseBarPosition(getValAttr(posEl)),
    vertJc: vertJcEl ? getValAttr(vertJcEl) : void 0,
    base: parseArgument(element, "e")
  };
}
function parsePhantom(element, context) {
  const phantPrEl = getChild(element, "phantPr");
  const showEl = phantPrEl ? getChild(phantPrEl, "show") : void 0;
  const zeroWidEl = phantPrEl ? getChild(phantPrEl, "zeroWid") : void 0;
  const zeroAscEl = phantPrEl ? getChild(phantPrEl, "zeroAsc") : void 0;
  const zeroDescEl = phantPrEl ? getChild(phantPrEl, "zeroDesc") : void 0;
  const transpEl = phantPrEl ? getChild(phantPrEl, "transp") : void 0;
  return {
    type: "mathPhantom",
    show: showEl ? parseBoolean2(getValAttr(showEl)) ?? true : void 0,
    zeroWid: zeroWidEl ? parseBoolean2(getValAttr(zeroWidEl)) ?? true : void 0,
    zeroAsc: zeroAscEl ? parseBoolean2(getValAttr(zeroAscEl)) ?? true : void 0,
    zeroDesc: zeroDescEl ? parseBoolean2(getValAttr(zeroDescEl)) ?? true : void 0,
    transp: transpEl ? parseBoolean2(getValAttr(transpEl)) ?? true : void 0,
    base: parseArgument(element, "e")
  };
}
function parseMathElement(element, context) {
  const name = localName(element);
  switch (name) {
    case "r":
      return parseMathRun(element);
    case "f":
      return parseFraction(element);
    case "rad":
      return parseRadical(element);
    case "nary":
      return parseNary(element);
    case "sSup":
      return parseSuperscript(element);
    case "sSub":
      return parseSubscript(element);
    case "sSubSup":
      return parseSubSup(element);
    case "sPre":
      return parsePreSubSup(element);
    case "d":
      return parseDelimiter(element);
    case "m":
      return parseMatrix(element);
    case "limLow":
      return parseLimitLower(element);
    case "limUpp":
      return parseLimitUpper(element);
    case "acc":
      return parseAccent(element);
    case "bar":
      return parseBar(element);
    case "box":
      return parseBox(element);
    case "borderBox":
      return parseBorderBox(element);
    case "func":
      return parseFunction(element);
    case "eqArr":
      return parseEquationArray(element);
    case "groupChr":
      return parseGroupChar(element);
    case "phant":
      return parsePhantom(element);
    default:
      return void 0;
  }
}
function parseOfficeMath(element, context) {
  return {
    type: "oMath",
    content: parseMathContentChildren(element)
  };
}
function parseOfficeMathPara(element, context) {
  const oMathParaPrEl = getChild(element, "oMathParaPr");
  const jcEl = oMathParaPrEl ? getChild(oMathParaPrEl, "jc") : void 0;
  const content = [];
  for (const oMathEl of getChildren(element, "oMath")) {
    content.push(parseOfficeMath(oMathEl));
  }
  return {
    type: "oMathPara",
    justification: parseMathJustification(getValAttr(jcEl)),
    content
  };
}
function parsePageSize(element) {
  if (!element) {
    return void 0;
  }
  const w = parseTwips(getAttr(element, "w"));
  const h = parseTwips(getAttr(element, "h"));
  if (w === void 0 || h === void 0) {
    return void 0;
  }
  return {
    w,
    h,
    orient: parseOrientation(getAttr(element, "orient")),
    code: parseInt322(getAttr(element, "code"))
  };
}
function parseOrientation(value) {
  switch (value) {
    case "portrait":
    case "landscape":
      return value;
    default:
      return void 0;
  }
}
function parsePageMargins(element) {
  if (!element) {
    return void 0;
  }
  const top = parseTwips(getAttr(element, "top"));
  const right = parseTwips(getAttr(element, "right"));
  const bottom = parseTwips(getAttr(element, "bottom"));
  const left = parseTwips(getAttr(element, "left"));
  if (top === void 0 || right === void 0 || bottom === void 0 || left === void 0) {
    return void 0;
  }
  return {
    top,
    right,
    bottom,
    left,
    header: parseTwips(getAttr(element, "header")),
    footer: parseTwips(getAttr(element, "footer")),
    gutter: parseTwips(getAttr(element, "gutter"))
  };
}
function parsePageBorderEdge(element) {
  if (!element) {
    return void 0;
  }
  const val = getAttr(element, "val");
  if (!val) {
    return void 0;
  }
  return {
    val,
    sz: parseInt322(getAttr(element, "sz")),
    space: parseInt322(getAttr(element, "space")),
    color: getAttr(element, "color") ?? void 0,
    themeColor: getAttr(element, "themeColor") ?? void 0,
    shadow: parseBoolean2(getAttr(element, "shadow")),
    frame: parseBoolean2(getAttr(element, "frame"))
  };
}
function parsePageBorders(element) {
  if (!element) {
    return void 0;
  }
  return {
    display: parseDisplayOption(getAttr(element, "display")),
    offsetFrom: parseOffsetFrom(getAttr(element, "offsetFrom")),
    zOrder: parseZOrder(getAttr(element, "zOrder")),
    top: parsePageBorderEdge(getChild(element, "top")),
    left: parsePageBorderEdge(getChild(element, "left")),
    bottom: parsePageBorderEdge(getChild(element, "bottom")),
    right: parsePageBorderEdge(getChild(element, "right"))
  };
}
function parseDisplayOption(value) {
  switch (value) {
    case "allPages":
    case "firstPage":
    case "notFirstPage":
      return value;
    default:
      return void 0;
  }
}
function parseOffsetFrom(value) {
  switch (value) {
    case "page":
    case "text":
      return value;
    default:
      return void 0;
  }
}
function parseZOrder(value) {
  switch (value) {
    case "front":
    case "back":
      return value;
    default:
      return void 0;
  }
}
function parseColumn(element) {
  return {
    w: parseTwips(getAttr(element, "w")),
    space: parseTwips(getAttr(element, "space"))
  };
}
function parseColumns(element) {
  if (!element) {
    return void 0;
  }
  const col = [];
  for (const c of getChildren(element, "col")) {
    col.push(parseColumn(c));
  }
  return {
    num: parseInt322(getAttr(element, "num")),
    equalWidth: parseBoolean2(getAttr(element, "equalWidth")),
    space: parseTwips(getAttr(element, "space")),
    sep: parseBoolean2(getAttr(element, "sep")),
    col: col.length > 0 ? col : void 0
  };
}
function parseHeaderFooterType(value) {
  switch (value) {
    case "default":
    case "first":
    case "even":
      return value;
    default:
      return void 0;
  }
}
function parseHeaderFooterRef(element) {
  const type = parseHeaderFooterType(getAttr(element, "type"));
  const rId = parseRelId(getAttr(element, "r:id"));
  if (!type || !rId) {
    return void 0;
  }
  return { type, rId };
}
function parseHeaderReferences(element) {
  const refs = [];
  for (const ref of getChildren(element, "headerReference")) {
    const parsed = parseHeaderFooterRef(ref);
    if (parsed) {
      refs.push(parsed);
    }
  }
  return refs.length > 0 ? refs : void 0;
}
function parseFooterReferences(element) {
  const refs = [];
  for (const ref of getChildren(element, "footerReference")) {
    const parsed = parseHeaderFooterRef(ref);
    if (parsed) {
      refs.push(parsed);
    }
  }
  return refs.length > 0 ? refs : void 0;
}
function parseLineNumbering(element) {
  if (!element) {
    return void 0;
  }
  return {
    countBy: parseInt322(getAttr(element, "countBy")),
    start: parseInt322(getAttr(element, "start")),
    restart: parseLineNumberRestart(getAttr(element, "restart")),
    distance: parseTwips(getAttr(element, "distance"))
  };
}
function parseLineNumberRestart(value) {
  switch (value) {
    case "continuous":
    case "newPage":
    case "newSection":
      return value;
    default:
      return void 0;
  }
}
function parsePageNumberFormat(value) {
  switch (value) {
    case "decimal":
    case "upperRoman":
    case "lowerRoman":
    case "upperLetter":
    case "lowerLetter":
    case "ordinal":
    case "cardinalText":
    case "ordinalText":
    case "none":
      return value;
    default:
      return void 0;
  }
}
function parseChapSep(value) {
  switch (value) {
    case "colon":
    case "period":
    case "hyphen":
    case "emDash":
    case "enDash":
      return value;
    default:
      return void 0;
  }
}
function parsePageNumberType(element) {
  if (!element) {
    return void 0;
  }
  return {
    fmt: parsePageNumberFormat(getAttr(element, "fmt")),
    start: parseInt322(getAttr(element, "start")),
    chapStyle: parseInt322(getAttr(element, "chapStyle")),
    chapSep: parseChapSep(getAttr(element, "chapSep"))
  };
}
function parseDocGridType(value) {
  switch (value) {
    case "default":
    case "lines":
    case "linesAndChars":
    case "snapToChars":
      return value;
    default:
      return void 0;
  }
}
function parseDocGrid(element) {
  if (!element) {
    return void 0;
  }
  return {
    type: parseDocGridType(getAttr(element, "type")),
    linePitch: parseTwips(getAttr(element, "linePitch")),
    charSpace: parseInt322(getAttr(element, "charSpace"))
  };
}
function parseSectionBreakType(value) {
  switch (value) {
    case "continuous":
    case "evenPage":
    case "nextColumn":
    case "nextPage":
    case "oddPage":
      return value;
    default:
      return void 0;
  }
}
function parseVerticalJc(value) {
  switch (value) {
    case "top":
    case "center":
    case "both":
    case "bottom":
      return value;
    default:
      return void 0;
  }
}
function parseSectionTextDirection(value) {
  switch (value) {
    case "lrTb":
    case "tbRl":
    case "btLr":
    case "lrTbV":
    case "tbRlV":
    case "tbLrV":
      return value;
    default:
      return void 0;
  }
}
function parseNotePos(value) {
  switch (value) {
    case "pageBottom":
    case "beneathText":
    case "sectEnd":
    case "docEnd":
      return value;
    default:
      return void 0;
  }
}
function parseNumRestart(value) {
  switch (value) {
    case "continuous":
    case "eachSect":
    case "eachPage":
      return value;
    default:
      return void 0;
  }
}
function parseNotePr(element) {
  if (!element) {
    return void 0;
  }
  return {
    pos: parseNotePos(getChildVal(element, "pos")),
    numFmt: parsePageNumberFormat(getChildVal(element, "numFmt")),
    numStart: getChildIntVal(element, "numStart"),
    numRestart: parseNumRestart(getChildVal(element, "numRestart"))
  };
}
function parseSectionProperties(element) {
  if (!element) {
    return void 0;
  }
  return {
    type: parseSectionBreakType(getChildVal(element, "type")),
    pgSz: parsePageSize(getChild(element, "pgSz")),
    pgMar: parsePageMargins(getChild(element, "pgMar")),
    pgBorders: parsePageBorders(getChild(element, "pgBorders")),
    cols: parseColumns(getChild(element, "cols")),
    headerReference: parseHeaderReferences(element),
    footerReference: parseFooterReferences(element),
    titlePg: getChild(element, "titlePg") !== void 0,
    lnNumType: parseLineNumbering(getChild(element, "lnNumType")),
    pgNumType: parsePageNumberType(getChild(element, "pgNumType")),
    docGrid: parseDocGrid(getChild(element, "docGrid")),
    bidi: getChild(element, "bidi") !== void 0,
    rtlGutter: getChild(element, "rtlGutter") !== void 0,
    textDirection: parseSectionTextDirection(getChildVal(element, "textDirection")),
    vAlign: parseVerticalJc(getChildVal(element, "vAlign")),
    footnotePr: parseNotePr(getChild(element, "footnotePr")),
    endnotePr: parseNotePr(getChild(element, "endnotePr")),
    noEndnote: getChild(element, "noEndnote") !== void 0
  };
}
function parseSpacing(element) {
  if (!element) {
    return void 0;
  }
  return {
    before: parseTwips(getAttr(element, "before")),
    beforeAutospacing: parseBoolean2(getAttr(element, "beforeAutospacing")),
    after: parseTwips(getAttr(element, "after")),
    afterAutospacing: parseBoolean2(getAttr(element, "afterAutospacing")),
    line: parseInt322(getAttr(element, "line")),
    lineRule: parseLineRule(getAttr(element, "lineRule")),
    beforeLines: parseInt322(getAttr(element, "beforeLines")),
    afterLines: parseInt322(getAttr(element, "afterLines"))
  };
}
function parseLineRule(value) {
  switch (value) {
    case "auto":
    case "exact":
    case "atLeast":
      return value;
    default:
      return void 0;
  }
}
function parseIndent(element) {
  if (!element) {
    return void 0;
  }
  return {
    left: parseTwips(getAttr(element, "left")),
    leftChars: parseInt322(getAttr(element, "leftChars")),
    right: parseTwips(getAttr(element, "right")),
    rightChars: parseInt322(getAttr(element, "rightChars")),
    firstLine: parseTwips(getAttr(element, "firstLine")),
    firstLineChars: parseInt322(getAttr(element, "firstLineChars")),
    hanging: parseTwips(getAttr(element, "hanging")),
    hangingChars: parseInt322(getAttr(element, "hangingChars")),
    start: parseTwips(getAttr(element, "start")),
    startChars: parseInt322(getAttr(element, "startChars")),
    end: parseTwips(getAttr(element, "end")),
    endChars: parseInt322(getAttr(element, "endChars"))
  };
}
function parseParagraphBorderEdge(element) {
  if (!element) {
    return void 0;
  }
  const val = parseBorderStyle$2(getAttr(element, "val"));
  if (!val) {
    return void 0;
  }
  return {
    val,
    sz: parseEighthPoints(getAttr(element, "sz")),
    space: parseInt322(getAttr(element, "space")),
    color: getAttr(element, "color") ?? void 0,
    themeColor: parseThemeColor$2(getAttr(element, "themeColor")),
    shadow: parseBoolean2(getAttr(element, "shadow")),
    frame: parseBoolean2(getAttr(element, "frame"))
  };
}
function parseBorderStyle$2(value) {
  switch (value) {
    case "nil":
    case "none":
    case "single":
    case "thick":
    case "double":
    case "dotted":
    case "dashed":
    case "dotDash":
    case "dotDotDash":
    case "triple":
    case "thinThickSmallGap":
    case "thickThinSmallGap":
    case "thinThickThinSmallGap":
    case "thinThickMediumGap":
    case "thickThinMediumGap":
    case "thinThickThinMediumGap":
    case "thinThickLargeGap":
    case "thickThinLargeGap":
    case "thinThickThinLargeGap":
    case "wave":
    case "doubleWave":
    case "dashSmallGap":
    case "dashDotStroked":
    case "threeDEmboss":
    case "threeDEngrave":
    case "outset":
    case "inset":
      return value;
    default:
      return void 0;
  }
}
function parseThemeColor$2(value) {
  switch (value) {
    case "dark1":
    case "light1":
    case "dark2":
    case "light2":
    case "accent1":
    case "accent2":
    case "accent3":
    case "accent4":
    case "accent5":
    case "accent6":
    case "hyperlink":
    case "followedHyperlink":
    case "background1":
    case "background2":
    case "text1":
    case "text2":
      return value;
    default:
      return void 0;
  }
}
function parseParagraphBorders(element) {
  if (!element) {
    return void 0;
  }
  return {
    top: parseParagraphBorderEdge(getChild(element, "top")),
    left: parseParagraphBorderEdge(getChild(element, "left")),
    bottom: parseParagraphBorderEdge(getChild(element, "bottom")),
    right: parseParagraphBorderEdge(getChild(element, "right")),
    between: parseParagraphBorderEdge(getChild(element, "between")),
    bar: parseParagraphBorderEdge(getChild(element, "bar"))
  };
}
function parseTabStop(element) {
  const val = parseTabAlignment(getAttr(element, "val"));
  const pos = parseTwips(getAttr(element, "pos"));
  if (!val || pos === void 0) {
    return void 0;
  }
  return {
    val,
    pos,
    leader: parseTabLeader(getAttr(element, "leader"))
  };
}
function parseTabAlignment(value) {
  switch (value) {
    case "left":
    case "center":
    case "right":
    case "decimal":
    case "bar":
    case "clear":
    case "num":
    case "start":
    case "end":
      return value;
    default:
      return void 0;
  }
}
function parseTabLeader(value) {
  switch (value) {
    case "none":
    case "dot":
    case "hyphen":
    case "underscore":
    case "heavy":
    case "middleDot":
      return value;
    default:
      return void 0;
  }
}
function parseTabStops(element) {
  if (!element) {
    return void 0;
  }
  const tabs = [];
  for (const child of getChildren(element, "tab")) {
    const tab = parseTabStop(child);
    if (tab) {
      tabs.push(tab);
    }
  }
  if (tabs.length === 0) {
    return void 0;
  }
  return { tabs };
}
function parseNumberingProperties(element) {
  if (!element) {
    return void 0;
  }
  return {
    numId: parseNumId(getChildVal(element, "numId")),
    ilvl: parseIlvl(getChildVal(element, "ilvl"))
  };
}
function parseFrameProperties(element) {
  if (!element) {
    return void 0;
  }
  return {
    w: parseTwips(getAttr(element, "w")),
    h: parseTwips(getAttr(element, "h")),
    hRule: parseHeightRule$1(getAttr(element, "hRule")),
    hAnchor: parseAnchor$1(getAttr(element, "hAnchor")),
    vAnchor: parseAnchor$1(getAttr(element, "vAnchor")),
    x: parseTwips(getAttr(element, "x")),
    xAlign: parseHAlign(getAttr(element, "xAlign")),
    y: parseTwips(getAttr(element, "y")),
    yAlign: parseVAlign(getAttr(element, "yAlign")),
    hSpace: parseTwips(getAttr(element, "hSpace")),
    vSpace: parseTwips(getAttr(element, "vSpace")),
    wrap: parseWrap$1(getAttr(element, "wrap")),
    dropCap: parseDropCap(getAttr(element, "dropCap")),
    lines: parseInt322(getAttr(element, "lines")),
    anchorLock: parseBoolean2(getAttr(element, "anchorLock"))
  };
}
function parseHeightRule$1(value) {
  switch (value) {
    case "auto":
    case "atLeast":
    case "exact":
      return value;
    default:
      return void 0;
  }
}
function parseAnchor$1(value) {
  switch (value) {
    case "page":
    case "margin":
    case "text":
      return value;
    default:
      return void 0;
  }
}
function parseHAlign(value) {
  switch (value) {
    case "left":
    case "center":
    case "right":
    case "inside":
    case "outside":
      return value;
    default:
      return void 0;
  }
}
function parseVAlign(value) {
  switch (value) {
    case "top":
    case "center":
    case "bottom":
    case "inside":
    case "outside":
    case "inline":
      return value;
    default:
      return void 0;
  }
}
function parseWrap$1(value) {
  switch (value) {
    case "around":
    case "auto":
    case "none":
    case "notBeside":
    case "through":
    case "tight":
      return value;
    default:
      return void 0;
  }
}
function parseDropCap(value) {
  switch (value) {
    case "none":
    case "drop":
    case "margin":
      return value;
    default:
      return void 0;
  }
}
function parseParagraphAlignment(value) {
  switch (value) {
    case "left":
    case "center":
    case "right":
    case "both":
    case "justify":
    case "distribute":
    case "start":
    case "end":
    case "numTab":
    case "highKashida":
    case "mediumKashida":
    case "lowKashida":
    case "thaiDistribute":
      return value;
    default:
      return void 0;
  }
}
function parseTextDirection$1(value) {
  switch (value) {
    case "lrTb":
    case "tbRl":
    case "btLr":
    case "lrTbV":
    case "tbRlV":
    case "tbLrV":
      return value;
    default:
      return void 0;
  }
}
function parseTextAlignment(value) {
  switch (value) {
    case "auto":
    case "baseline":
    case "bottom":
    case "center":
    case "top":
      return value;
    default:
      return void 0;
  }
}
function parseOutlineLevel(value) {
  const num = parseInt322(value);
  if (num === void 0 || num < 0 || num > 9) {
    return void 0;
  }
  return num;
}
function parseParagraphProperties(element, context) {
  if (!element) {
    return void 0;
  }
  return {
    // Style reference
    pStyle: parseStyleId(getChildVal(element, "pStyle")),
    // Alignment
    jc: parseParagraphAlignment(getChildVal(element, "jc")),
    textDirection: parseTextDirection$1(getChildVal(element, "textDirection")),
    // Spacing and indentation
    spacing: parseSpacing(getChild(element, "spacing")),
    ind: parseIndent(getChild(element, "ind")),
    // Borders and shading
    pBdr: parseParagraphBorders(getChild(element, "pBdr")),
    shd: parseShading(getChild(element, "shd")),
    // Tab stops
    tabs: parseTabStops(getChild(element, "tabs")),
    // Numbering
    numPr: parseNumberingProperties(getChild(element, "numPr")),
    // Page/column break control
    keepNext: parseToggleChild(element, "keepNext"),
    keepLines: parseToggleChild(element, "keepLines"),
    pageBreakBefore: parseToggleChild(element, "pageBreakBefore"),
    widowControl: parseToggleChild(element, "widowControl"),
    suppressLineNumbers: parseToggleChild(element, "suppressLineNumbers"),
    suppressAutoHyphens: parseToggleChild(element, "suppressAutoHyphens"),
    // Frame properties
    framePr: parseFrameProperties(getChild(element, "framePr")),
    // Outline level
    outlineLvl: parseOutlineLevel(getChildVal(element, "outlineLvl")),
    // East Asian text handling
    kinsoku: parseToggleChild(element, "kinsoku"),
    wordWrap: parseToggleChild(element, "wordWrap"),
    overflowPunct: parseToggleChild(element, "overflowPunct"),
    topLinePunct: parseToggleChild(element, "topLinePunct"),
    autoSpaceDE: parseToggleChild(element, "autoSpaceDE"),
    autoSpaceDN: parseToggleChild(element, "autoSpaceDN"),
    // Bidirectional
    bidi: parseToggleChild(element, "bidi"),
    // Text alignment
    textAlignment: parseTextAlignment(getChildVal(element, "textAlignment")),
    // Contextual spacing
    contextualSpacing: parseToggleChild(element, "contextualSpacing"),
    // Mirror indents
    mirrorIndents: parseToggleChild(element, "mirrorIndents"),
    // Default run properties
    rPr: parseRunProperties(getChild(element, "rPr")),
    // Section properties (for last paragraph in section)
    sectPr: parseSectionProperties(getChild(element, "sectPr"))
  };
}
function parseHyperlink(element, context) {
  const content = [];
  for (const child of getChildren(element, "r")) {
    content.push(parseRun(child));
  }
  return {
    type: "hyperlink",
    rId: parseRelId(getAttr(element, "r:id")),
    anchor: getAttr(element, "anchor") ?? void 0,
    tooltip: getAttr(element, "tooltip") ?? void 0,
    tgtFrame: getAttr(element, "tgtFrame") ?? void 0,
    history: parseBoolean2(getAttr(element, "history")),
    content
  };
}
function parseBookmarkStart(element) {
  const id = parseInt322(getAttr(element, "id"));
  const name = getAttr(element, "name");
  if (id === void 0 || name === void 0) {
    return void 0;
  }
  return {
    type: "bookmarkStart",
    id,
    name
  };
}
function parseBookmarkEnd(element) {
  const id = parseInt322(getAttr(element, "id"));
  if (id === void 0) {
    return void 0;
  }
  return {
    type: "bookmarkEnd",
    id
  };
}
function parseSimpleField(element, context) {
  const instr = getAttr(element, "instr") ?? "";
  const dirty = parseBoolean2(getAttr(element, "dirty"));
  const content = [];
  for (const child of getChildren(element, "r")) {
    content.push(parseRun(child));
  }
  return {
    type: "simpleField",
    instr,
    ...dirty !== void 0 && { dirty },
    content
  };
}
function parseRevisionInfo(element) {
  return {
    id: getAttr(element, "id") ?? "",
    author: getAttr(element, "author") ?? void 0,
    date: getAttr(element, "date") ?? void 0
  };
}
function parseRevisionRuns(element, context) {
  const runs = [];
  for (const child of getChildren(element, "r")) {
    runs.push(parseRun(child));
  }
  return runs;
}
function parseInsertedContent(element, context) {
  return {
    type: "ins",
    revision: parseRevisionInfo(element),
    content: parseRevisionRuns(element)
  };
}
function parseDeletedContent(element, context) {
  return {
    type: "del",
    revision: parseRevisionInfo(element),
    content: parseRevisionRuns(element)
  };
}
function parseMoveFromContent(element, context) {
  return {
    type: "moveFrom",
    revision: parseRevisionInfo(element),
    content: parseRevisionRuns(element)
  };
}
function parseMoveToContent(element, context) {
  return {
    type: "moveTo",
    revision: parseRevisionInfo(element),
    content: parseRevisionRuns(element)
  };
}
function parseMoveFromRangeStart(element) {
  const id = parseInt322(getAttr(element, "id"));
  if (id === void 0) {
    return void 0;
  }
  return {
    type: "moveFromRangeStart",
    id,
    name: getAttr(element, "name") ?? void 0
  };
}
function parseMoveFromRangeEnd(element) {
  const id = parseInt322(getAttr(element, "id"));
  if (id === void 0) {
    return void 0;
  }
  return {
    type: "moveFromRangeEnd",
    id
  };
}
function parseMoveToRangeStart(element) {
  const id = parseInt322(getAttr(element, "id"));
  if (id === void 0) {
    return void 0;
  }
  return {
    type: "moveToRangeStart",
    id,
    name: getAttr(element, "name") ?? void 0
  };
}
function parseMoveToRangeEnd(element) {
  const id = parseInt322(getAttr(element, "id"));
  if (id === void 0) {
    return void 0;
  }
  return {
    type: "moveToRangeEnd",
    id
  };
}
function parseSdtLock(value) {
  switch (value) {
    case "sdtLocked":
    case "contentLocked":
    case "sdtContentLocked":
    case "unlocked":
      return value;
    default:
      return void 0;
  }
}
function parseSdtListItem(element) {
  return {
    displayText: getAttr(element, "displayText") ?? void 0,
    value: getAttr(element, "value") ?? ""
  };
}
function parseSdtProperties(element) {
  if (!element) {
    return void 0;
  }
  const dropDownListEl = getChild(element, "dropDownList");
  const comboBoxEl = getChild(element, "comboBox");
  return {
    alias: getChildVal(element, "alias") ?? void 0,
    tag: getChildVal(element, "tag") ?? void 0,
    id: parseInt322(getChildVal(element, "id")),
    lock: parseSdtLock(getChildVal(element, "lock")),
    showingPlcHdr: parseBoolean2(getChildVal(element, "showingPlcHdr")),
    temporary: parseBoolean2(getChildVal(element, "temporary")),
    checked: parseBoolean2(getChildVal(element, "checked")),
    dropDownList: dropDownListEl ? getChildren(dropDownListEl, "listItem").map(parseSdtListItem) : void 0,
    comboBox: comboBoxEl ? getChildren(comboBoxEl, "listItem").map(parseSdtListItem) : void 0
  };
}
function parseInlineSdt(element, context) {
  const sdtPr = getChild(element, "sdtPr");
  const sdtContent = getChild(element, "sdtContent");
  const content = [];
  if (sdtContent) {
    for (const child of getChildren(sdtContent, "r")) {
      content.push(parseRun(child));
    }
  }
  return {
    type: "sdt",
    properties: parseSdtProperties(sdtPr),
    content
  };
}
function parseParagraphContent(element, context) {
  const localName2 = element.name.split(":").pop() ?? element.name;
  switch (localName2) {
    case "r":
      return parseRun(element);
    case "hyperlink":
      return parseHyperlink(element);
    case "bookmarkStart":
      return parseBookmarkStart(element);
    case "bookmarkEnd":
      return parseBookmarkEnd(element);
    case "fldSimple":
      return parseSimpleField(element);
    // Revision content
    case "ins":
      return parseInsertedContent(element);
    case "del":
      return parseDeletedContent(element);
    case "moveFrom":
      return parseMoveFromContent(element);
    case "moveTo":
      return parseMoveToContent(element);
    // Revision range markers
    case "moveFromRangeStart":
      return parseMoveFromRangeStart(element);
    case "moveFromRangeEnd":
      return parseMoveFromRangeEnd(element);
    case "moveToRangeStart":
      return parseMoveToRangeStart(element);
    case "moveToRangeEnd":
      return parseMoveToRangeEnd(element);
    // SDT
    case "sdt":
      return parseInlineSdt(element);
    // Office Math
    case "oMath":
      return parseOfficeMath(element);
    case "oMathPara":
      return parseOfficeMathPara(element);
    default:
      return void 0;
  }
}
function parseParagraph(element, context) {
  const properties = parseParagraphProperties(getChild(element, "pPr"));
  const content = [];
  for (const node of element.children) {
    if (!isXmlElement(node)) {
      continue;
    }
    const parsed = parseParagraphContent(node);
    if (parsed) {
      content.push(parsed);
    }
  }
  return {
    type: "paragraph",
    properties,
    content
  };
}
function getLocalName(name) {
  return name.split(":").pop() ?? name;
}
function getChildByLocalName(element, localName2) {
  for (const child of element.children) {
    if (isXmlElement(child) && getLocalName(child.name) === localName2) {
      return child;
    }
  }
  return void 0;
}
function parseIntAttr(element, attrName) {
  return parseInt32(element.attrs[attrName]);
}
function parseBoolAttr(element, attrName) {
  return parseBoolean(element.attrs[attrName]);
}
function parseExtent(element) {
  if (element === void 0) {
    return { cx: emu(0), cy: emu(0) };
  }
  return {
    cx: emu(parseIntAttr(element, "cx") ?? 0),
    cy: emu(parseIntAttr(element, "cy") ?? 0)
  };
}
function parseEffectExtent(element) {
  if (element === void 0) {
    return void 0;
  }
  return {
    l: emu(parseIntAttr(element, "l") ?? 0),
    t: emu(parseIntAttr(element, "t") ?? 0),
    r: emu(parseIntAttr(element, "r") ?? 0),
    b: emu(parseIntAttr(element, "b") ?? 0)
  };
}
function parseDocPr(element) {
  if (element === void 0) {
    return { id: 0, name: "" };
  }
  return {
    id: parseIntAttr(element, "id") ?? 0,
    name: element.attrs.name ?? "",
    descr: element.attrs.descr,
    title: element.attrs.title,
    hidden: parseBoolAttr(element, "hidden")
  };
}
function parseBlip(element) {
  if (element === void 0) {
    return void 0;
  }
  const rEmbed = element.attrs["r:embed"] ?? element.attrs.embed;
  const rLink = element.attrs["r:link"] ?? element.attrs.link;
  return {
    rEmbed: rEmbed !== void 0 ? docxRelId(rEmbed) : void 0,
    rLink: rLink !== void 0 ? docxRelId(rLink) : void 0,
    cstate: element.attrs.cstate
  };
}
function parseBlipFill(element) {
  if (element === void 0) {
    return void 0;
  }
  const blipEl = getChildByLocalName(element, "blip");
  const stretchEl = getChildByLocalName(element, "stretch");
  const srcRectEl = getChildByLocalName(element, "srcRect");
  function parseSrcRect(el) {
    if (!el) {
      return void 0;
    }
    return {
      l: parseIntAttr(el, "l"),
      t: parseIntAttr(el, "t"),
      r: parseIntAttr(el, "r"),
      b: parseIntAttr(el, "b")
    };
  }
  return {
    blip: parseBlip(blipEl),
    stretch: stretchEl !== void 0,
    srcRect: parseSrcRect(srcRectEl)
  };
}
function parseSpPr(element) {
  if (element === void 0) {
    return void 0;
  }
  const xfrmEl = getChildByLocalName(element, "xfrm");
  const prstGeomEl = getChildByLocalName(element, "prstGeom");
  function parseXfrm(el) {
    if (!el) {
      return void 0;
    }
    return {
      rot: parseIntAttr(el, "rot"),
      flipH: parseBoolAttr(el, "flipH"),
      flipV: parseBoolAttr(el, "flipV")
    };
  }
  return {
    xfrm: parseXfrm(xfrmEl),
    prstGeom: prstGeomEl?.attrs.prst
  };
}
function parsePicture(element) {
  if (element === void 0) {
    return void 0;
  }
  const nvPicPrEl = getChildByLocalName(element, "nvPicPr");
  const cNvPrEl = nvPicPrEl !== void 0 ? getChildByLocalName(nvPicPrEl, "cNvPr") : void 0;
  const blipFillEl = getChildByLocalName(element, "blipFill");
  const spPrEl = getChildByLocalName(element, "spPr");
  function parseNvPicPr(args) {
    const { nvPicPrEl: nvPicPrEl2, cNvPrEl: cNvPrEl2 } = args;
    if (!nvPicPrEl2) {
      return void 0;
    }
    return {
      cNvPr: cNvPrEl2 !== void 0 ? parseDocPr(cNvPrEl2) : void 0
    };
  }
  return {
    nvPicPr: parseNvPicPr({ nvPicPrEl, cNvPrEl }),
    blipFill: parseBlipFill(blipFillEl),
    spPr: parseSpPr(spPrEl)
  };
}
function parsePositionH(element) {
  if (element === void 0) {
    return void 0;
  }
  const relativeFrom = parseRelFromH(element.attrs.relativeFrom);
  const posOffsetEl = getChildByLocalName(element, "posOffset");
  const alignEl = getChildByLocalName(element, "align");
  return {
    relativeFrom: relativeFrom ?? "column",
    posOffset: posOffsetEl !== void 0 ? parseInt32(getTextContent(posOffsetEl)) : void 0,
    align: alignEl !== void 0 ? parseAlignH(getTextContent(alignEl).trim()) : void 0
  };
}
function parsePositionV(element) {
  if (element === void 0) {
    return void 0;
  }
  const relativeFrom = parseRelFromV(element.attrs.relativeFrom);
  const posOffsetEl = getChildByLocalName(element, "posOffset");
  const alignEl = getChildByLocalName(element, "align");
  return {
    relativeFrom: relativeFrom ?? "paragraph",
    posOffset: posOffsetEl !== void 0 ? parseInt32(getTextContent(posOffsetEl)) : void 0,
    align: alignEl !== void 0 ? parseAlignV(getTextContent(alignEl).trim()) : void 0
  };
}
function parseWrap(inlineEl) {
  for (const child of inlineEl.children) {
    if (!isXmlElement(child)) {
      continue;
    }
    const localName2 = getLocalName(child.name);
    switch (localName2) {
      case "wrapNone":
        return { type: "none" };
      case "wrapTopAndBottom":
        return { type: "topAndBottom" };
      case "wrapSquare":
        return { type: "square", wrapText: parseWrapText(child.attrs.wrapText) };
      case "wrapTight":
        return { type: "tight", wrapText: parseWrapText(child.attrs.wrapText) };
      case "wrapThrough":
        return { type: "through", wrapText: parseWrapText(child.attrs.wrapText) };
    }
  }
  return void 0;
}
function parseBodyPr(element) {
  if (element === void 0) {
    return void 0;
  }
  return {
    rot: parseIntAttr(element, "rot"),
    wrap: element.attrs.wrap,
    lIns: parseIntAttr(element, "lIns"),
    tIns: parseIntAttr(element, "tIns"),
    rIns: parseIntAttr(element, "rIns"),
    bIns: parseIntAttr(element, "bIns"),
    anchor: element.attrs.anchor,
    anchorCtr: parseBoolAttr(element, "anchorCtr"),
    vert: element.attrs.vert,
    upright: parseBoolAttr(element, "upright")
  };
}
function parseShapeStyle(element) {
  if (element === void 0) {
    return void 0;
  }
  const lnRefEl = getChildByLocalName(element, "lnRef");
  const fillRefEl = getChildByLocalName(element, "fillRef");
  const effectRefEl = getChildByLocalName(element, "effectRef");
  const fontRefEl = getChildByLocalName(element, "fontRef");
  return {
    lnRef: lnRefEl !== void 0 ? parseIntAttr(lnRefEl, "idx") : void 0,
    fillRef: fillRefEl !== void 0 ? parseIntAttr(fillRefEl, "idx") : void 0,
    effectRef: effectRefEl !== void 0 ? parseIntAttr(effectRefEl, "idx") : void 0,
    fontRef: fontRefEl !== void 0 ? parseIntAttr(fontRefEl, "idx") : void 0
  };
}
function parseTextBoxContent(element, context) {
  if (element === void 0) {
    return void 0;
  }
  const txbxContentEl = getChildByLocalName(element, "txbxContent");
  if (txbxContentEl === void 0) {
    return void 0;
  }
  const paragraphs = [];
  for (const child of txbxContentEl.children) {
    if (isXmlElement(child) && getLocalName(child.name) === "p") {
      paragraphs.push(parseParagraph(child));
    }
  }
  return { content: paragraphs };
}
function parseWordprocessingShape(element, context) {
  if (element === void 0) {
    return void 0;
  }
  const cNvPrEl = getChildByLocalName(element, "cNvPr");
  const spPrEl = getChildByLocalName(element, "spPr");
  const styleEl = getChildByLocalName(element, "style");
  const txbxEl = getChildByLocalName(element, "txbx");
  const bodyPrEl = getChildByLocalName(element, "bodyPr");
  return {
    cNvPr: cNvPrEl !== void 0 ? parseDocPr(cNvPrEl) : void 0,
    spPr: parseSpPr(spPrEl),
    style: parseShapeStyle(styleEl),
    txbx: parseTextBoxContent(txbxEl),
    bodyPr: parseBodyPr(bodyPrEl)
  };
}
function parseChart(element) {
  if (element === void 0) {
    return void 0;
  }
  const rId = element.attrs["r:id"] ?? element.attrs.id;
  if (rId === void 0) {
    return void 0;
  }
  return {
    type: "chart",
    rId
  };
}
function parseInlineDrawing(element, context) {
  const extentEl = getChildByLocalName(element, "extent");
  const effectExtentEl = getChildByLocalName(element, "effectExtent");
  const docPrEl = getChildByLocalName(element, "docPr");
  const graphicEl = getChildByLocalName(element, "graphic");
  const graphicDataEl = graphicEl !== void 0 ? getChildByLocalName(graphicEl, "graphicData") : void 0;
  const picEl = graphicDataEl !== void 0 ? getChildByLocalName(graphicDataEl, "pic") : void 0;
  const wspEl = graphicDataEl !== void 0 ? getChildByLocalName(graphicDataEl, "wsp") : void 0;
  const chartEl = graphicDataEl !== void 0 ? getChildByLocalName(graphicDataEl, "chart") : void 0;
  return {
    type: "inline",
    distT: parseIntAttr(element, "distT"),
    distB: parseIntAttr(element, "distB"),
    distL: parseIntAttr(element, "distL"),
    distR: parseIntAttr(element, "distR"),
    extent: parseExtent(extentEl),
    effectExtent: parseEffectExtent(effectExtentEl),
    docPr: parseDocPr(docPrEl),
    pic: parsePicture(picEl),
    wsp: parseWordprocessingShape(wspEl),
    chart: parseChart(chartEl)
  };
}
function parseAnchorDrawing(element, context) {
  const extentEl = getChildByLocalName(element, "extent");
  const effectExtentEl = getChildByLocalName(element, "effectExtent");
  const docPrEl = getChildByLocalName(element, "docPr");
  const positionHEl = getChildByLocalName(element, "positionH");
  const positionVEl = getChildByLocalName(element, "positionV");
  const graphicEl = getChildByLocalName(element, "graphic");
  const graphicDataEl = graphicEl !== void 0 ? getChildByLocalName(graphicEl, "graphicData") : void 0;
  const picEl = graphicDataEl !== void 0 ? getChildByLocalName(graphicDataEl, "pic") : void 0;
  const wspEl = graphicDataEl !== void 0 ? getChildByLocalName(graphicDataEl, "wsp") : void 0;
  const chartEl = graphicDataEl !== void 0 ? getChildByLocalName(graphicDataEl, "chart") : void 0;
  return {
    type: "anchor",
    distT: parseIntAttr(element, "distT"),
    distB: parseIntAttr(element, "distB"),
    distL: parseIntAttr(element, "distL"),
    distR: parseIntAttr(element, "distR"),
    simplePos: parseBoolAttr(element, "simplePos"),
    allowOverlap: parseBoolAttr(element, "allowOverlap"),
    behindDoc: parseBoolAttr(element, "behindDoc"),
    locked: parseBoolAttr(element, "locked"),
    layoutInCell: parseBoolAttr(element, "layoutInCell"),
    relativeHeight: parseIntAttr(element, "relativeHeight"),
    positionH: parsePositionH(positionHEl),
    positionV: parsePositionV(positionVEl),
    extent: parseExtent(extentEl),
    effectExtent: parseEffectExtent(effectExtentEl),
    wrap: parseWrap(element),
    docPr: parseDocPr(docPrEl),
    pic: parsePicture(picEl),
    wsp: parseWordprocessingShape(wspEl),
    chart: parseChart(chartEl)
  };
}
function parseDrawing(element, context) {
  for (const child of element.children) {
    if (!isXmlElement(child)) {
      continue;
    }
    const localName2 = getLocalName(child.name);
    if (localName2 === "inline") {
      return parseInlineDrawing(child);
    }
    if (localName2 === "anchor") {
      return parseAnchorDrawing(child);
    }
  }
  return void 0;
}
function parseRunFonts(element) {
  if (!element) {
    return void 0;
  }
  const fonts = {
    ascii: getAttr(element, "ascii") ?? void 0,
    hAnsi: getAttr(element, "hAnsi") ?? void 0,
    eastAsia: getAttr(element, "eastAsia") ?? void 0,
    cs: getAttr(element, "cs") ?? void 0,
    asciiTheme: parseThemeFont(getAttr(element, "asciiTheme")),
    hAnsiTheme: parseThemeFont(getAttr(element, "hAnsiTheme")),
    eastAsiaTheme: parseThemeFont(getAttr(element, "eastAsiaTheme")),
    csTheme: parseThemeFont(getAttr(element, "csTheme"))
  };
  if (fonts.ascii === void 0 && fonts.hAnsi === void 0 && fonts.eastAsia === void 0 && fonts.cs === void 0 && fonts.asciiTheme === void 0 && fonts.hAnsiTheme === void 0 && fonts.eastAsiaTheme === void 0 && fonts.csTheme === void 0) {
    return void 0;
  }
  return fonts;
}
function parseThemeFont(value) {
  switch (value) {
    case "majorAscii":
    case "majorHAnsi":
    case "majorEastAsia":
    case "majorBidi":
    case "minorAscii":
    case "minorHAnsi":
    case "minorEastAsia":
    case "minorBidi":
      return value;
    default:
      return void 0;
  }
}
function parseColor(element) {
  if (!element) {
    return void 0;
  }
  const val = getAttr(element, "val");
  const themeColor = parseThemeColor$1(getAttr(element, "themeColor"));
  const themeTint = parseInt322(getAttr(element, "themeTint"));
  const themeShade = parseInt322(getAttr(element, "themeShade"));
  if (val === void 0 && themeColor === void 0) {
    return void 0;
  }
  return {
    val: val === "auto" ? void 0 : val,
    themeColor,
    themeTint,
    themeShade
  };
}
function parseThemeColor$1(value) {
  switch (value) {
    case "dark1":
    case "light1":
    case "dark2":
    case "light2":
    case "accent1":
    case "accent2":
    case "accent3":
    case "accent4":
    case "accent5":
    case "accent6":
    case "hyperlink":
    case "followedHyperlink":
    case "background1":
    case "background2":
    case "text1":
    case "text2":
      return value;
    default:
      return void 0;
  }
}
function parseShading(element) {
  if (!element) {
    return void 0;
  }
  const val = parseShadingPattern(getAttr(element, "val"));
  const color = getAttr(element, "color") ?? void 0;
  const fill = getAttr(element, "fill") ?? void 0;
  const themeColor = parseThemeColor$1(getAttr(element, "themeColor"));
  const themeFill = parseThemeColor$1(getAttr(element, "themeFill"));
  if (val === void 0 && color === void 0 && fill === void 0) {
    return void 0;
  }
  return { val, color, fill, themeColor, themeFill };
}
function parseShadingPattern(value) {
  switch (value) {
    case "nil":
    case "clear":
    case "solid":
    case "horzStripe":
    case "vertStripe":
    case "reverseDiagStripe":
    case "diagStripe":
    case "horzCross":
    case "diagCross":
    case "thinHorzStripe":
    case "thinVertStripe":
    case "thinReverseDiagStripe":
    case "thinDiagStripe":
    case "thinHorzCross":
    case "thinDiagCross":
    case "pct5":
    case "pct10":
    case "pct12":
    case "pct15":
    case "pct20":
    case "pct25":
    case "pct30":
    case "pct35":
    case "pct37":
    case "pct40":
    case "pct45":
    case "pct50":
    case "pct55":
    case "pct60":
    case "pct62":
    case "pct65":
    case "pct70":
    case "pct75":
    case "pct80":
    case "pct85":
    case "pct87":
    case "pct90":
    case "pct95":
      return value;
    default:
      return void 0;
  }
}
function parseRunBorder(element) {
  if (!element) {
    return void 0;
  }
  const val = parseBorderStyle$1(getAttr(element, "val"));
  if (!val) {
    return void 0;
  }
  return {
    val,
    sz: parseEighthPoints(getAttr(element, "sz")),
    space: parseInt322(getAttr(element, "space")),
    color: getAttr(element, "color") ?? void 0,
    themeColor: parseThemeColor$1(getAttr(element, "themeColor")),
    frame: parseBoolean2(getAttr(element, "frame")),
    shadow: parseBoolean2(getAttr(element, "shadow"))
  };
}
function parseBorderStyle$1(value) {
  switch (value) {
    case "nil":
    case "none":
    case "single":
    case "thick":
    case "double":
    case "dotted":
    case "dashed":
    case "dotDash":
    case "dotDotDash":
    case "triple":
    case "thinThickSmallGap":
    case "thickThinSmallGap":
    case "thinThickThinSmallGap":
    case "thinThickMediumGap":
    case "thickThinMediumGap":
    case "thinThickThinMediumGap":
    case "thinThickLargeGap":
    case "thickThinLargeGap":
    case "thinThickThinLargeGap":
    case "wave":
    case "doubleWave":
    case "dashSmallGap":
    case "dashDotStroked":
    case "threeDEmboss":
    case "threeDEngrave":
    case "outset":
    case "inset":
      return value;
    default:
      return void 0;
  }
}
function parseUnderline(element) {
  if (!element) {
    return void 0;
  }
  const val = parseUnderlineStyle(getAttr(element, "val"));
  if (!val) {
    return void 0;
  }
  return {
    val,
    color: getAttr(element, "color") ?? void 0,
    themeColor: parseThemeColor$1(getAttr(element, "themeColor"))
  };
}
function parseUnderlineStyle(value) {
  switch (value) {
    case "none":
    case "single":
    case "words":
    case "double":
    case "thick":
    case "dotted":
    case "dottedHeavy":
    case "dash":
    case "dashedHeavy":
    case "dashLong":
    case "dashLongHeavy":
    case "dotDash":
    case "dashDotHeavy":
    case "dotDotDash":
    case "dashDotDotHeavy":
    case "wave":
    case "wavyHeavy":
    case "wavyDouble":
      return value;
    default:
      return void 0;
  }
}
function parseHighlightColor(value) {
  switch (value) {
    case "black":
    case "blue":
    case "cyan":
    case "green":
    case "magenta":
    case "red":
    case "yellow":
    case "white":
    case "darkBlue":
    case "darkCyan":
    case "darkGreen":
    case "darkMagenta":
    case "darkRed":
    case "darkYellow":
    case "darkGray":
    case "lightGray":
    case "none":
      return value;
    default:
      return void 0;
  }
}
function parseVerticalAlignRun(value) {
  switch (value) {
    case "baseline":
    case "superscript":
    case "subscript":
      return value;
    default:
      return void 0;
  }
}
function parseEmphasisMark(value) {
  switch (value) {
    case "none":
    case "dot":
    case "comma":
    case "circle":
    case "underDot":
      return value;
    default:
      return void 0;
  }
}
function parseEastAsianLayout(element) {
  if (!element) {
    return void 0;
  }
  return {
    combine: parseBoolean2(getAttr(element, "combine")),
    combineBrackets: parseCombineBrackets(getAttr(element, "combineBrackets")),
    vert: parseBoolean2(getAttr(element, "vert")),
    vertCompress: parseBoolean2(getAttr(element, "vertCompress"))
  };
}
function parseCombineBrackets(value) {
  switch (value) {
    case "none":
    case "round":
    case "square":
    case "angle":
    case "curly":
      return value;
    default:
      return void 0;
  }
}
function parseRunProperties(element, _context) {
  if (!element) {
    return void 0;
  }
  const props = {
    // Style reference
    rStyle: parseStyleId(getChildVal(element, "rStyle")),
    // Font properties
    rFonts: parseRunFonts(getChild(element, "rFonts")),
    sz: parseHalfPoints(getChildVal(element, "sz")),
    szCs: parseHalfPoints(getChildVal(element, "szCs")),
    // Basic formatting
    b: parseToggleChild(element, "b"),
    bCs: parseToggleChild(element, "bCs"),
    i: parseToggleChild(element, "i"),
    iCs: parseToggleChild(element, "iCs"),
    caps: parseToggleChild(element, "caps"),
    smallCaps: parseToggleChild(element, "smallCaps"),
    strike: parseToggleChild(element, "strike"),
    dstrike: parseToggleChild(element, "dstrike"),
    outline: parseToggleChild(element, "outline"),
    shadow: parseToggleChild(element, "shadow"),
    emboss: parseToggleChild(element, "emboss"),
    imprint: parseToggleChild(element, "imprint"),
    vanish: parseToggleChild(element, "vanish"),
    webHidden: parseToggleChild(element, "webHidden"),
    // Color and shading
    color: parseColor(getChild(element, "color")),
    highlight: parseHighlightColor(getChildVal(element, "highlight")),
    shd: parseShading(getChild(element, "shd")),
    // Underline
    u: parseUnderline(getChild(element, "u")),
    // Spacing and position
    spacing: parseTwips(getChildVal(element, "spacing")),
    w: getChildIntVal(element, "w"),
    kern: parseHalfPoints(getChildVal(element, "kern")),
    position: parseHalfPoints(getChildVal(element, "position")),
    // Vertical alignment
    vertAlign: parseVerticalAlignRun(getChildVal(element, "vertAlign")),
    // Border
    bdr: parseRunBorder(getChild(element, "bdr")),
    // East Asian
    em: parseEmphasisMark(getChildVal(element, "em")),
    eastAsianLayout: parseEastAsianLayout(getChild(element, "eastAsianLayout")),
    // Complex script
    rtl: parseToggleChild(element, "rtl"),
    cs: parseToggleChild(element, "cs")
  };
  return props;
}
function parseText(element) {
  const space = getAttr(element, "xml:space");
  return {
    type: "text",
    value: getTextContent(element) ?? "",
    space: space === "preserve" ? "preserve" : "default"
  };
}
function parseTab(_element) {
  return { type: "tab" };
}
function parseBreakType(value) {
  if (value === "page" || value === "column" || value === "textWrapping") {
    return value;
  }
  return void 0;
}
function parseBreakClear(value) {
  if (value === "none" || value === "left" || value === "right" || value === "all") {
    return value;
  }
  return void 0;
}
function parseBreak(element) {
  return {
    type: "break",
    breakType: parseBreakType(getAttr(element, "type")),
    clear: parseBreakClear(getAttr(element, "clear"))
  };
}
function parseSymbol(element) {
  return {
    type: "symbol",
    font: getAttr(element, "font") ?? "",
    char: getAttr(element, "char") ?? ""
  };
}
function parseDrawingContent(element) {
  const drawing = parseDrawing(element);
  if (drawing === void 0) {
    return void 0;
  }
  return {
    type: "drawing",
    drawing
  };
}
function parseFieldCharType(value) {
  switch (value) {
    case "begin":
    case "separate":
    case "end":
      return value;
    default:
      return void 0;
  }
}
function parseFieldCharContent(element) {
  const fldCharType = parseFieldCharType(getAttr(element, "fldCharType"));
  if (!fldCharType) {
    return void 0;
  }
  const dirty = parseBoolean2(getAttr(element, "dirty"));
  const fldLock = parseBoolean2(getAttr(element, "fldLock"));
  return {
    type: "fieldChar",
    fldCharType,
    ...dirty !== void 0 && { dirty },
    ...fldLock !== void 0 && { fldLock }
  };
}
function parseInstrText(element) {
  const space = getAttr(element, "xml:space");
  return {
    type: "instrText",
    value: getTextContent(element) ?? "",
    space: space === "preserve" ? "preserve" : "default"
  };
}
function parseRunContent(element) {
  const localName2 = element.name.split(":").pop() ?? element.name;
  switch (localName2) {
    case "t":
      return parseText(element);
    case "tab":
      return parseTab();
    case "br":
      return parseBreak(element);
    case "sym":
      return parseSymbol(element);
    case "drawing":
      return parseDrawingContent(element);
    case "fldChar":
      return parseFieldCharContent(element);
    case "instrText":
      return parseInstrText(element);
    default:
      return void 0;
  }
}
function parseRun(element, context) {
  const properties = parseRunProperties(getChild(element, "rPr"));
  const content = [];
  for (const node of element.children) {
    if (!isXmlElement(node)) {
      continue;
    }
    const parsed = parseRunContent(node);
    if (parsed) {
      content.push(parsed);
    }
  }
  return {
    type: "run",
    properties,
    content
  };
}
var TWIPS_TO_PX = 96 / 1440;
function parseTableWidth(element) {
  if (!element) {
    return void 0;
  }
  const w = parseInt322(getAttr(element, "w"));
  const type = parseWidthType(getAttr(element, "type"));
  if (w === void 0) {
    return void 0;
  }
  return {
    value: w,
    type: type ?? "dxa"
  };
}
function parseWidthType(value) {
  switch (value) {
    case "auto":
    case "dxa":
    case "nil":
    case "pct":
      return value;
    default:
      return void 0;
  }
}
function parseBorderStyle(value) {
  switch (value) {
    case "nil":
    case "none":
    case "single":
    case "thick":
    case "double":
    case "dotted":
    case "dashed":
    case "dotDash":
    case "dotDotDash":
    case "triple":
    case "thinThickSmallGap":
    case "thickThinSmallGap":
    case "thinThickThinSmallGap":
    case "thinThickMediumGap":
    case "thickThinMediumGap":
    case "thinThickThinMediumGap":
    case "thinThickLargeGap":
    case "thickThinLargeGap":
    case "thinThickThinLargeGap":
    case "wave":
    case "doubleWave":
    case "dashSmallGap":
    case "dashDotStroked":
    case "threeDEmboss":
    case "threeDEngrave":
    case "outset":
    case "inset":
      return value;
    default:
      return void 0;
  }
}
function parseThemeColor(value) {
  switch (value) {
    case "dark1":
    case "light1":
    case "dark2":
    case "light2":
    case "accent1":
    case "accent2":
    case "accent3":
    case "accent4":
    case "accent5":
    case "accent6":
    case "hyperlink":
    case "followedHyperlink":
    case "background1":
    case "background2":
    case "text1":
    case "text2":
      return value;
    default:
      return void 0;
  }
}
function parseTableBorderEdge(element) {
  if (!element) {
    return void 0;
  }
  const val = parseBorderStyle(getAttr(element, "val"));
  if (!val) {
    return void 0;
  }
  return {
    val,
    sz: parseEighthPoints(getAttr(element, "sz")),
    space: parseInt322(getAttr(element, "space")),
    color: getAttr(element, "color") ?? void 0,
    themeColor: parseThemeColor(getAttr(element, "themeColor")),
    shadow: parseBoolean2(getAttr(element, "shadow")),
    frame: parseBoolean2(getAttr(element, "frame"))
  };
}
function parseTableBorders(element) {
  if (!element) {
    return void 0;
  }
  return {
    top: parseTableBorderEdge(getChild(element, "top")),
    left: parseTableBorderEdge(getChild(element, "left")),
    bottom: parseTableBorderEdge(getChild(element, "bottom")),
    right: parseTableBorderEdge(getChild(element, "right")),
    insideH: parseTableBorderEdge(getChild(element, "insideH")),
    insideV: parseTableBorderEdge(getChild(element, "insideV"))
  };
}
function parseCellBorders(element) {
  if (!element) {
    return void 0;
  }
  return {
    top: parseTableBorderEdge(getChild(element, "top")),
    left: parseTableBorderEdge(getChild(element, "left")),
    bottom: parseTableBorderEdge(getChild(element, "bottom")),
    right: parseTableBorderEdge(getChild(element, "right")),
    insideH: parseTableBorderEdge(getChild(element, "insideH")),
    insideV: parseTableBorderEdge(getChild(element, "insideV")),
    tl2br: parseTableBorderEdge(getChild(element, "tl2br")),
    tr2bl: parseTableBorderEdge(getChild(element, "tr2bl"))
  };
}
function parseCellMargins(element) {
  if (!element) {
    return void 0;
  }
  const top = parseTableWidth(getChild(element, "top"));
  const left = parseTableWidth(getChild(element, "left") ?? getChild(element, "start"));
  const bottom = parseTableWidth(getChild(element, "bottom"));
  const right = parseTableWidth(getChild(element, "right") ?? getChild(element, "end"));
  return {
    top: top ? px(top.value * TWIPS_TO_PX) : void 0,
    left: left ? px(left.value * TWIPS_TO_PX) : void 0,
    bottom: bottom ? px(bottom.value * TWIPS_TO_PX) : void 0,
    right: right ? px(right.value * TWIPS_TO_PX) : void 0
  };
}
function parseTableAlignment(value) {
  switch (value) {
    case "start":
    case "center":
    case "end":
    case "left":
    case "right":
      return value;
    default:
      return void 0;
  }
}
function parseCellVerticalAlignment(value) {
  switch (value) {
    case "top":
    case "center":
    case "bottom":
    case "both":
      return value;
    default:
      return void 0;
  }
}
function parseTableLayout(value) {
  switch (value) {
    case "fixed":
    case "autofit":
      return value;
    default:
      return void 0;
  }
}
function parseTextDirection(value) {
  switch (value) {
    case "lrTb":
    case "tbRl":
    case "btLr":
    case "lrTbV":
    case "tbRlV":
    case "tbLrV":
      return value;
    default:
      return void 0;
  }
}
function parseTablePositioning(element) {
  if (!element) {
    return void 0;
  }
  return {
    horzAnchor: parseAnchor(getAttr(element, "horzAnchor")),
    vertAnchor: parseAnchor(getAttr(element, "vertAnchor")),
    tblpX: parseTwips(getAttr(element, "tblpX")),
    tblpXSpec: parseHorizontalAlign(getAttr(element, "tblpXSpec")),
    tblpY: parseTwips(getAttr(element, "tblpY")),
    tblpYSpec: parseVerticalAlign(getAttr(element, "tblpYSpec")),
    leftFromText: parseTwips(getAttr(element, "leftFromText")),
    rightFromText: parseTwips(getAttr(element, "rightFromText")),
    topFromText: parseTwips(getAttr(element, "topFromText")),
    bottomFromText: parseTwips(getAttr(element, "bottomFromText"))
  };
}
function parseAnchor(value) {
  switch (value) {
    case "margin":
    case "page":
    case "text":
      return value;
    default:
      return void 0;
  }
}
function parseHorizontalAlign(value) {
  switch (value) {
    case "left":
    case "center":
    case "right":
    case "inside":
    case "outside":
      return value;
    default:
      return void 0;
  }
}
function parseVerticalAlign(value) {
  switch (value) {
    case "top":
    case "center":
    case "bottom":
    case "inside":
    case "outside":
      return value;
    default:
      return void 0;
  }
}
function parseTableLook(element) {
  if (!element) {
    return void 0;
  }
  return {
    firstRow: parseBoolean2(getAttr(element, "firstRow")),
    lastRow: parseBoolean2(getAttr(element, "lastRow")),
    firstColumn: parseBoolean2(getAttr(element, "firstColumn")),
    lastColumn: parseBoolean2(getAttr(element, "lastColumn")),
    noHBand: parseBoolean2(getAttr(element, "noHBand")),
    noVBand: parseBoolean2(getAttr(element, "noVBand"))
  };
}
function parseTableProperties(element) {
  if (!element) {
    return void 0;
  }
  return {
    tblStyle: parseStyleId(getChildVal(element, "tblStyle")),
    tblW: parseTableWidth(getChild(element, "tblW")),
    jc: parseTableAlignment(getChildVal(element, "jc")),
    tblInd: parseTableWidth(getChild(element, "tblInd")),
    tblBorders: parseTableBorders(getChild(element, "tblBorders")),
    shd: parseShading(getChild(element, "shd")),
    tblCellMar: parseCellMargins(getChild(element, "tblCellMar")),
    tblCellSpacing: parseTableCellSpacing(getChild(element, "tblCellSpacing")),
    tblLayout: parseTableLayout(getChildVal(element, "tblLayout")),
    tblpPr: parseTablePositioning(getChild(element, "tblpPr")),
    tblLook: parseTableLook(getChild(element, "tblLook")),
    tblCaption: getChildVal(element, "tblCaption"),
    tblDescription: getChildVal(element, "tblDescription"),
    tblOverlap: parseTableOverlap(getChildVal(element, "tblOverlap")),
    bidiVisual: parseToggleChild(element, "bidiVisual")
  };
}
function parseTableCellSpacing(element) {
  if (!element) {
    return void 0;
  }
  return {
    w: parseInt322(getAttr(element, "w")),
    type: parseWidthType(getAttr(element, "type"))
  };
}
function parseTableOverlap(value) {
  switch (value) {
    case "never":
    case "overlap":
      return value;
    default:
      return void 0;
  }
}
function parseTableGrid(element) {
  if (!element) {
    return void 0;
  }
  const columns = [];
  for (const gridCol of getChildren(element, "gridCol")) {
    const w = parseTwips(getAttr(gridCol, "w"));
    if (w !== void 0) {
      columns.push({ width: px(w * TWIPS_TO_PX) });
    }
  }
  if (columns.length === 0) {
    return void 0;
  }
  return { columns };
}
function parseRowHeight(element) {
  if (!element) {
    return void 0;
  }
  const val = parseTwips(getAttr(element, "val"));
  if (val === void 0) {
    return void 0;
  }
  return {
    val,
    hRule: parseHeightRule(getAttr(element, "hRule"))
  };
}
function parseHeightRule(value) {
  switch (value) {
    case "auto":
    case "atLeast":
    case "exact":
      return value;
    default:
      return void 0;
  }
}
function parseRowProperties(element) {
  if (!element) {
    return void 0;
  }
  return {
    trHeight: parseRowHeight(getChild(element, "trHeight")),
    tblHeader: parseToggleChild(element, "tblHeader"),
    cantSplit: parseToggleChild(element, "cantSplit"),
    jc: parseTableAlignment(getChildVal(element, "jc")),
    hidden: parseToggleChild(element, "hidden"),
    gridBefore: parseInt322(getChildVal(element, "gridBefore")),
    wBefore: parseTableWidth(getChild(element, "wBefore")),
    gridAfter: parseInt322(getChildVal(element, "gridAfter")),
    wAfter: parseTableWidth(getChild(element, "wAfter"))
  };
}
function parseGridSpan(value) {
  const num = parseInt322(value);
  if (num === void 0 || num < 1) {
    return void 0;
  }
  return gridSpan(num);
}
function parseVerticalMerge(value) {
  if (value === void 0 || value === "") {
    return "continue";
  }
  switch (value) {
    case "restart":
    case "continue":
      return value;
    default:
      return void 0;
  }
}
function parseHorizontalMerge(value) {
  switch (value) {
    case "restart":
    case "continue":
      return value;
    default:
      return void 0;
  }
}
function parseCellProperties(element) {
  if (!element) {
    return void 0;
  }
  return {
    tcW: parseTableWidth(getChild(element, "tcW")),
    gridSpan: parseGridSpan(getChildVal(element, "gridSpan")),
    hMerge: parseHorizontalMerge(getChildVal(element, "hMerge")),
    vMerge: getChild(element, "vMerge") ? parseVerticalMerge(getChildVal(element, "vMerge")) : void 0,
    tcBorders: parseCellBorders(getChild(element, "tcBorders")),
    shd: parseShading(getChild(element, "shd")),
    tcMar: parseCellMargins(getChild(element, "tcMar")),
    textDirection: parseTextDirection(getChildVal(element, "textDirection")),
    vAlign: parseCellVerticalAlignment(getChildVal(element, "vAlign")),
    noWrap: parseToggleChild(element, "noWrap"),
    tcFitText: parseToggleChild(element, "tcFitText"),
    hideMark: parseToggleChild(element, "hideMark")
  };
}
function parseTableCell(element, context) {
  const properties = parseCellProperties(getChild(element, "tcPr"));
  const content = [];
  for (const node of element.children) {
    if (!isXmlElement(node)) {
      continue;
    }
    const localName2 = node.name.split(":").pop() ?? node.name;
    if (localName2 === "p") {
      content.push(parseParagraph(node));
    } else if (localName2 === "tbl") {
      content.push(parseTable(node));
    }
  }
  return {
    type: "tableCell",
    properties,
    content
  };
}
function parseTableRow(element, context) {
  const properties = parseRowProperties(getChild(element, "trPr"));
  const cells = [];
  for (const tc of getChildren(element, "tc")) {
    cells.push(parseTableCell(tc));
  }
  return {
    type: "tableRow",
    properties,
    cells
  };
}
function parseTable(element, context) {
  const properties = parseTableProperties(getChild(element, "tblPr"));
  const grid = parseTableGrid(getChild(element, "tblGrid"));
  const rows = [];
  for (const tr of getChildren(element, "tr")) {
    rows.push(parseTableRow(tr));
  }
  return {
    type: "table",
    properties,
    grid,
    rows
  };
}
function parseNameProperty(element, childName) {
  const child = getChild(element, childName);
  if (!child) {
    return void 0;
  }
  return { val: getChildVal(element, childName) ?? "" };
}
function parseStyleIdProperty(element, childName) {
  const styleId2 = parseStyleId(getChildVal(element, childName));
  if (!styleId2) {
    return void 0;
  }
  return { val: styleId2 };
}
function parseUiPriorityProperty(element) {
  const value = parseInt322(getChildVal(element, "uiPriority"));
  if (value === void 0) {
    return void 0;
  }
  return { val: value };
}
function parseStyleType(value) {
  switch (value) {
    case "paragraph":
    case "character":
    case "table":
    case "numbering":
      return value;
    default:
      return void 0;
  }
}
function parseTableStyleType(value) {
  switch (value) {
    case "wholeTable":
    case "firstRow":
    case "lastRow":
    case "firstCol":
    case "lastCol":
    case "band1Vert":
    case "band2Vert":
    case "band1Horz":
    case "band2Horz":
    case "neCell":
    case "nwCell":
    case "seCell":
    case "swCell":
      return value;
    default:
      return void 0;
  }
}
function parseTableStylePr(element) {
  const type = parseTableStyleType(getAttr(element, "type"));
  if (!type) {
    return void 0;
  }
  return {
    type,
    rPr: parseRunProperties(getChild(element, "rPr")),
    pPr: parseParagraphProperties(getChild(element, "pPr")),
    tcPr: void 0
    // Table cell properties would need table parser import
  };
}
function parseStyle(element) {
  const type = parseStyleType(getAttr(element, "type"));
  const styleId2 = parseStyleId(getAttr(element, "styleId"));
  if (!type || !styleId2) {
    return void 0;
  }
  const tblStylePr = [];
  for (const tsp of getChildren(element, "tblStylePr")) {
    const parsed = parseTableStylePr(tsp);
    if (parsed) {
      tblStylePr.push(parsed);
    }
  }
  return {
    type,
    styleId: styleId2,
    name: parseNameProperty(element, "name"),
    aliases: parseNameProperty(element, "aliases"),
    basedOn: parseStyleIdProperty(element, "basedOn"),
    next: parseStyleIdProperty(element, "next"),
    link: parseStyleIdProperty(element, "link"),
    uiPriority: parseUiPriorityProperty(element),
    default: parseBoolean2(getAttr(element, "default")),
    customStyle: parseBoolean2(getAttr(element, "customStyle")),
    semiHidden: getChild(element, "semiHidden") !== void 0,
    unhideWhenUsed: getChild(element, "unhideWhenUsed") !== void 0,
    qFormat: getChild(element, "qFormat") !== void 0,
    locked: getChild(element, "locked") !== void 0,
    personal: getChild(element, "personal") !== void 0,
    personalReply: getChild(element, "personalReply") !== void 0,
    personalCompose: getChild(element, "personalCompose") !== void 0,
    rPr: parseRunProperties(getChild(element, "rPr")),
    pPr: parseParagraphProperties(getChild(element, "pPr")),
    tblPr: void 0,
    // Would need table parser import
    trPr: void 0,
    // Would need table parser import
    tcPr: void 0,
    // Would need table parser import
    tblStylePr: tblStylePr.length > 0 ? tblStylePr : void 0
  };
}
function parseDocDefaults(element) {
  if (!element) {
    return void 0;
  }
  return {
    rPrDefault: parseRPrDefault(getChild(element, "rPrDefault")),
    pPrDefault: parsePPrDefault(getChild(element, "pPrDefault"))
  };
}
function parseRPrDefault(element) {
  if (!element) {
    return void 0;
  }
  return { rPr: parseRunProperties(getChild(element, "rPr")) };
}
function parsePPrDefault(element) {
  if (!element) {
    return void 0;
  }
  return { pPr: parseParagraphProperties(getChild(element, "pPr")) };
}
function parseLatentStyleException(element) {
  const name = getAttr(element, "name");
  if (!name) {
    return void 0;
  }
  return {
    name,
    locked: parseBoolean2(getAttr(element, "locked")),
    uiPriority: parseInt322(getAttr(element, "uiPriority")),
    semiHidden: parseBoolean2(getAttr(element, "semiHidden")),
    unhideWhenUsed: parseBoolean2(getAttr(element, "unhideWhenUsed")),
    qFormat: parseBoolean2(getAttr(element, "qFormat"))
  };
}
function parseLatentStyles(element) {
  if (!element) {
    return void 0;
  }
  const lsdException = [];
  for (const exc of getChildren(element, "lsdException")) {
    const parsed = parseLatentStyleException(exc);
    if (parsed) {
      lsdException.push(parsed);
    }
  }
  return {
    defLockedState: parseBoolean2(getAttr(element, "defLockedState")),
    defUIPriority: parseInt322(getAttr(element, "defUIPriority")),
    defSemiHidden: parseBoolean2(getAttr(element, "defSemiHidden")),
    defUnhideWhenUsed: parseBoolean2(getAttr(element, "defUnhideWhenUsed")),
    defQFormat: parseBoolean2(getAttr(element, "defQFormat")),
    count: parseInt322(getAttr(element, "count")),
    lsdException: lsdException.length > 0 ? lsdException : void 0
  };
}
function parseStyles(element) {
  const styles = [];
  for (const style of getChildren(element, "style")) {
    const parsed = parseStyle(style);
    if (parsed) {
      styles.push(parsed);
    }
  }
  return {
    docDefaults: parseDocDefaults(getChild(element, "docDefaults")),
    latentStyles: parseLatentStyles(getChild(element, "latentStyles")),
    style: styles
  };
}
function parseLevelPicBulletId(element) {
  const id = parseInt322(getChildVal(element, "lvlPicBulletId"));
  if (id === void 0) {
    return void 0;
  }
  return { numPicBulletId: id };
}
function parseNumberFormat(value) {
  switch (value) {
    case "decimal":
    case "upperRoman":
    case "lowerRoman":
    case "upperLetter":
    case "lowerLetter":
    case "ordinal":
    case "cardinalText":
    case "ordinalText":
    case "hex":
    case "chicago":
    case "ideographDigital":
    case "japaneseCounting":
    case "aiueo":
    case "iroha":
    case "decimalFullWidth":
    case "decimalHalfWidth":
    case "japaneseLegal":
    case "japaneseDigitalTenThousand":
    case "decimalEnclosedCircle":
    case "decimalFullWidth2":
    case "aiueoFullWidth":
    case "irohaFullWidth":
    case "decimalZero":
    case "bullet":
    case "ganada":
    case "chosung":
    case "decimalEnclosedFullstop":
    case "decimalEnclosedParen":
    case "decimalEnclosedCircleChinese":
    case "ideographEnclosedCircle":
    case "ideographTraditional":
    case "ideographZodiac":
    case "ideographZodiacTraditional":
    case "taiwaneseCounting":
    case "ideographLegalTraditional":
    case "taiwaneseCountingThousand":
    case "taiwaneseDigital":
    case "chineseCounting":
    case "chineseLegalSimplified":
    case "chineseCountingThousand":
    case "koreanDigital":
    case "koreanCounting":
    case "koreanLegal":
    case "koreanDigital2":
    case "vietnameseCounting":
    case "russianLower":
    case "russianUpper":
    case "none":
    case "numberInDash":
    case "hebrew1":
    case "hebrew2":
    case "arabicAlpha":
    case "arabicAbjad":
    case "hindiVowels":
    case "hindiConsonants":
    case "hindiNumbers":
    case "hindiCounting":
    case "thaiLetters":
    case "thaiNumbers":
    case "thaiCounting":
    case "bahtText":
    case "dollarText":
    case "custom":
      return value;
    default:
      return void 0;
  }
}
function parseLevelSuffix(value) {
  switch (value) {
    case "tab":
    case "space":
    case "nothing":
      return value;
    default:
      return void 0;
  }
}
function parseMultiLevelType(value) {
  switch (value) {
    case "singleLevel":
    case "multilevel":
    case "hybridMultilevel":
      return value;
    default:
      return void 0;
  }
}
function parseLevelJustification(value) {
  switch (value) {
    case "left":
    case "center":
    case "right":
      return value;
    default:
      return void 0;
  }
}
function parseLevelText(element) {
  if (!element) {
    return void 0;
  }
  return {
    val: getAttr(element, "val") ?? "",
    null: parseBoolean2(getAttr(element, "null"))
  };
}
function parseLegacy(element) {
  if (!element) {
    return void 0;
  }
  return {
    legacy: parseBoolean2(getAttr(element, "legacy")),
    legacySpace: parseTwips(getAttr(element, "legacySpace")),
    legacyIndent: parseTwips(getAttr(element, "legacyIndent"))
  };
}
function parseLevel(element) {
  const ilvl = parseIlvl(getAttr(element, "ilvl"));
  if (ilvl === void 0) {
    return void 0;
  }
  return {
    ilvl,
    start: parseInt322(getChildVal(element, "start")),
    numFmt: parseNumberFormat(getChildVal(element, "numFmt")),
    lvlRestart: parseInt322(getChildVal(element, "lvlRestart")),
    pStyle: parseStyleId(getChildVal(element, "pStyle")),
    isLgl: getChild(element, "isLgl") !== void 0,
    suff: parseLevelSuffix(getChildVal(element, "suff")),
    lvlText: parseLevelText(getChild(element, "lvlText")),
    lvlJc: parseLevelJustification(getChildVal(element, "lvlJc")),
    lvlPicBulletId: parseLevelPicBulletId(element),
    legacy: parseLegacy(getChild(element, "legacy")),
    pPr: parseParagraphProperties(getChild(element, "pPr")),
    rPr: parseRunProperties(getChild(element, "rPr"))
  };
}
function parseAbstractNum(element) {
  const abstractNumId = parseAbstractNumId(getAttr(element, "abstractNumId"));
  if (abstractNumId === void 0) {
    return void 0;
  }
  const lvl = [];
  for (const level of getChildren(element, "lvl")) {
    const parsed = parseLevel(level);
    if (parsed) {
      lvl.push(parsed);
    }
  }
  return {
    abstractNumId,
    nsid: getChildVal(element, "nsid"),
    multiLevelType: parseMultiLevelType(getChildVal(element, "multiLevelType")),
    tmpl: getChildVal(element, "tmpl"),
    styleLink: parseStyleId(getChildVal(element, "styleLink")),
    numStyleLink: parseStyleId(getChildVal(element, "numStyleLink")),
    lvl
  };
}
function parseLevelOverride(element) {
  const ilvl = parseIlvl(getAttr(element, "ilvl"));
  if (ilvl === void 0) {
    return void 0;
  }
  const lvlElement = getChild(element, "lvl");
  return {
    ilvl,
    startOverride: parseInt322(getChildVal(element, "startOverride")),
    lvl: lvlElement ? parseLevel(lvlElement) : void 0
  };
}
function parseNum(element) {
  const numId = parseNumId(getAttr(element, "numId"));
  const abstractNumId = parseAbstractNumId(getChildVal(element, "abstractNumId"));
  if (numId === void 0 || abstractNumId === void 0) {
    return void 0;
  }
  const lvlOverride = [];
  for (const override of getChildren(element, "lvlOverride")) {
    const parsed = parseLevelOverride(override);
    if (parsed) {
      lvlOverride.push(parsed);
    }
  }
  return {
    numId,
    abstractNumId,
    lvlOverride: lvlOverride.length > 0 ? lvlOverride : void 0
  };
}
function parseNumbering(element) {
  const abstractNum = [];
  for (const an of getChildren(element, "abstractNum")) {
    const parsed = parseAbstractNum(an);
    if (parsed) {
      abstractNum.push(parsed);
    }
  }
  const num = [];
  for (const n of getChildren(element, "num")) {
    const parsed = parseNum(n);
    if (parsed) {
      num.push(parsed);
    }
  }
  return {
    numPicBullet: void 0,
    // Picture bullets not yet implemented
    abstractNum,
    num
  };
}
function parseBlockContent(element, context) {
  const localName2 = element.name.split(":").pop() ?? element.name;
  switch (localName2) {
    case "p":
      return parseParagraph(element);
    case "tbl":
      return parseTable(element);
    default:
      return void 0;
  }
}
function parseBody(element, context) {
  if (!element) {
    return { content: [] };
  }
  const content = [];
  for (const node of element.children) {
    if (!isXmlElement(node)) {
      continue;
    }
    const localName2 = node.name.split(":").pop() ?? node.name;
    if (localName2 === "sectPr") {
      continue;
    }
    const parsed = parseBlockContent(node);
    if (parsed) {
      content.push(parsed);
    }
  }
  const sectPr = parseSectionProperties(getChild(element, "sectPr"));
  return {
    content,
    sectPr
  };
}
function parseDocument(element, context) {
  const body = parseBody(getChild(element, "body"));
  return {
    body
    // Other parts (styles, numbering, etc.) are parsed separately and combined in the loader
  };
}

// node_modules/aurochs/dist/_shared/browser-C29uNnRN.js
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i = 0; i < 31; ++i) {
    b[i] = start += 1 << eb[i - 1];
  }
  var r = new i32(b[30]);
  for (var i = 1; i < 30; ++i) {
    for (var j = b[i]; j < b[i + 1]; ++j) {
      r[j] = j - b[i] << 5 | i;
    }
  }
  return { b, r };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = (function(cd, mb, r) {
  var s = cd.length;
  var i = 0;
  var l = new u16(mb);
  for (; i < s; ++i) {
    if (cd[i])
      ++l[cd[i] - 1];
  }
  var le = new u16(mb);
  for (i = 1; i < mb; ++i) {
    le[i] = le[i - 1] + l[i - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        var sv = i << 4 | cd[i];
        var r_1 = mb - cd[i];
        var v = le[cd[i] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
      }
    }
  }
  return co;
});
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flm = /* @__PURE__ */ hMap(flt, 9, 0);
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a) {
  var m = a[0];
  for (var i = 1; i < a.length; ++i) {
    if (a[i] > m)
      m = a[i];
  }
  return m;
};
var bits = function(d, p, m) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
};
var bits16 = function(d, p) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u8(v.subarray(s, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var inflt = function(dat, st, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st.f && !st.l)
    return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st.i != 2;
  var noSt = st.i;
  if (noBuf)
    buf = new u8(sl * 3);
  var cbuf = function(l2) {
    var bl = buf.length;
    if (l2 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l2));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
        if (t > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + l);
        buf.set(dat.subarray(s, t), bt);
        st.b = bt += l, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i = 0; i < hcLen; ++i) {
          clt[clim[i]] = bits(dat, pos + i * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i = 0; i < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >> 4;
          if (s < 16) {
            ldt[i++] = s;
          } else {
            var c = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i++] = c;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
      pos += c & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c)
        err(2);
      if (sym < 256)
        buf[bt++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i = sym - 257, b = fleb[i];
          add = bits(dat, pos, (1 << b) - 1) + fl[i];
          pos += b;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
        if (!d)
          err(3);
        pos += d & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + 131072);
        var end = bt + add;
        if (bt < dt) {
          var shift = dl - dt, dend = Math.min(dt, end);
          if (shift + bt < 0)
            err(3);
          for (; bt < dend; ++bt)
            buf[bt] = dict[shift + bt];
        }
        for (; bt < end; ++bt)
          buf[bt] = buf[bt - dt];
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
var wbits = function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
};
var wbits16 = function(d, p, v) {
  v <<= p & 7;
  var o = p / 8 | 0;
  d[o] |= v;
  d[o + 1] |= v >> 8;
  d[o + 2] |= v >> 16;
};
var hTree = function(d, mb) {
  var t = [];
  for (var i = 0; i < d.length; ++i) {
    if (d[i])
      t.push({ s: i, f: d[i] });
  }
  var s = t.length;
  var t2 = t.slice();
  if (!s)
    return { t: et, l: 0 };
  if (s == 1) {
    var v = new u8(t[0].s + 1);
    v[t[0].s] = 1;
    return { t: v, l: 1 };
  }
  t.sort(function(a, b) {
    return a.f - b.f;
  });
  t.push({ s: -1, f: 25001 });
  var l = t[0], r = t[1], i0 = 0, i1 = 1, i2 = 2;
  t[0] = { s: -1, f: l.f + r.f, l, r };
  while (i1 != s - 1) {
    l = t[t[i0].f < t[i2].f ? i0++ : i2++];
    r = t[i0 != i1 && t[i0].f < t[i2].f ? i0++ : i2++];
    t[i1++] = { s: -1, f: l.f + r.f, l, r };
  }
  var maxSym = t2[0].s;
  for (var i = 1; i < s; ++i) {
    if (t2[i].s > maxSym)
      maxSym = t2[i].s;
  }
  var tr = new u16(maxSym + 1);
  var mbt = ln(t[i1 - 1], tr, 0);
  if (mbt > mb) {
    var i = 0, dt = 0;
    var lft = mbt - mb, cst = 1 << lft;
    t2.sort(function(a, b) {
      return tr[b.s] - tr[a.s] || a.f - b.f;
    });
    for (; i < s; ++i) {
      var i2_1 = t2[i].s;
      if (tr[i2_1] > mb) {
        dt += cst - (1 << mbt - tr[i2_1]);
        tr[i2_1] = mb;
      } else
        break;
    }
    dt >>= lft;
    while (dt > 0) {
      var i2_2 = t2[i].s;
      if (tr[i2_2] < mb)
        dt -= 1 << mb - tr[i2_2]++ - 1;
      else
        ++i;
    }
    for (; i >= 0 && dt; --i) {
      var i2_3 = t2[i].s;
      if (tr[i2_3] == mb) {
        --tr[i2_3];
        ++dt;
      }
    }
    mbt = mb;
  }
  return { t: new u8(tr), l: mbt };
};
var ln = function(n, l, d) {
  return n.s == -1 ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1)) : l[n.s] = d;
};
var lc = function(c) {
  var s = c.length;
  while (s && !c[--s])
    ;
  var cl = new u16(++s);
  var cli = 0, cln = c[0], cls = 1;
  var w = function(v) {
    cl[cli++] = v;
  };
  for (var i = 1; i <= s; ++i) {
    if (c[i] == cln && i != s)
      ++cls;
    else {
      if (!cln && cls > 2) {
        for (; cls > 138; cls -= 138)
          w(32754);
        if (cls > 2) {
          w(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
          cls = 0;
        }
      } else if (cls > 3) {
        w(cln), --cls;
        for (; cls > 6; cls -= 6)
          w(8304);
        if (cls > 2)
          w(cls - 3 << 5 | 8208), cls = 0;
      }
      while (cls--)
        w(cln);
      cls = 1;
      cln = c[i];
    }
  }
  return { c: cl.subarray(0, cli), n: s };
};
var clen = function(cf, cl) {
  var l = 0;
  for (var i = 0; i < cl.length; ++i)
    l += cf[i] * cl[i];
  return l;
};
var wfblk = function(out, pos, dat) {
  var s = dat.length;
  var o = shft(pos + 2);
  out[o] = s & 255;
  out[o + 1] = s >> 8;
  out[o + 2] = out[o] ^ 255;
  out[o + 3] = out[o + 1] ^ 255;
  for (var i = 0; i < s; ++i)
    out[o + i + 4] = dat[i];
  return (o + 4 + s) * 8;
};
var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
  wbits(out, p++, final);
  ++lf[256];
  var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
  var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
  var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
  var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
  var lcfreq = new u16(19);
  for (var i = 0; i < lclt.length; ++i)
    ++lcfreq[lclt[i] & 31];
  for (var i = 0; i < lcdt.length; ++i)
    ++lcfreq[lcdt[i] & 31];
  var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
  var nlcc = 19;
  for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
    ;
  var flen = bl + 5 << 3;
  var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
  var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
  if (bs >= 0 && flen <= ftlen && flen <= dtlen)
    return wfblk(out, p, dat.subarray(bs, bs + bl));
  var lm, ll, dm, dl;
  wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
  if (dtlen < ftlen) {
    lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
    var llm = hMap(lct, mlcb, 0);
    wbits(out, p, nlc - 257);
    wbits(out, p + 5, ndc - 1);
    wbits(out, p + 10, nlcc - 4);
    p += 14;
    for (var i = 0; i < nlcc; ++i)
      wbits(out, p + 3 * i, lct[clim[i]]);
    p += 3 * nlcc;
    var lcts = [lclt, lcdt];
    for (var it = 0; it < 2; ++it) {
      var clct = lcts[it];
      for (var i = 0; i < clct.length; ++i) {
        var len = clct[i] & 31;
        wbits(out, p, llm[len]), p += lct[len];
        if (len > 15)
          wbits(out, p, clct[i] >> 5 & 127), p += clct[i] >> 12;
      }
    }
  } else {
    lm = flm, ll = flt, dm = fdm, dl = fdt;
  }
  for (var i = 0; i < li; ++i) {
    var sym = syms[i];
    if (sym > 255) {
      var len = sym >> 18 & 31;
      wbits16(out, p, lm[len + 257]), p += ll[len + 257];
      if (len > 7)
        wbits(out, p, sym >> 23 & 31), p += fleb[len];
      var dst = sym & 31;
      wbits16(out, p, dm[dst]), p += dl[dst];
      if (dst > 3)
        wbits16(out, p, sym >> 5 & 8191), p += fdeb[dst];
    } else {
      wbits16(out, p, lm[sym]), p += ll[sym];
    }
  }
  wbits16(out, p, lm[256]);
  return p + ll[256];
};
var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
var et = /* @__PURE__ */ new u8(0);
var dflt = function(dat, lvl, plvl, pre, post, st) {
  var s = st.z || dat.length;
  var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7e3)) + post);
  var w = o.subarray(pre, o.length - post);
  var lst = st.l;
  var pos = (st.r || 0) & 7;
  if (lvl) {
    if (pos)
      w[0] = st.r >> 3;
    var opt = deo[lvl - 1];
    var n = opt >> 13, c = opt & 8191;
    var msk_1 = (1 << plvl) - 1;
    var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
    var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
    var hsh = function(i2) {
      return (dat[i2] ^ dat[i2 + 1] << bs1_1 ^ dat[i2 + 2] << bs2_1) & msk_1;
    };
    var syms = new i32(25e3);
    var lf = new u16(288), df = new u16(32);
    var lc_1 = 0, eb = 0, i = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
    for (; i + 2 < s; ++i) {
      var hv = hsh(i);
      var imod = i & 32767, pimod = head[hv];
      prev[imod] = pimod;
      head[hv] = imod;
      if (wi <= i) {
        var rem = s - i;
        if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
          pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i - bs, pos);
          li = lc_1 = eb = 0, bs = i;
          for (var j = 0; j < 286; ++j)
            lf[j] = 0;
          for (var j = 0; j < 30; ++j)
            df[j] = 0;
        }
        var l = 2, d = 0, ch_1 = c, dif = imod - pimod & 32767;
        if (rem > 2 && hv == hsh(i - dif)) {
          var maxn = Math.min(n, rem) - 1;
          var maxd = Math.min(32767, i);
          var ml = Math.min(258, rem);
          while (dif <= maxd && --ch_1 && imod != pimod) {
            if (dat[i + l] == dat[i + l - dif]) {
              var nl = 0;
              for (; nl < ml && dat[i + nl] == dat[i + nl - dif]; ++nl)
                ;
              if (nl > l) {
                l = nl, d = dif;
                if (nl > maxn)
                  break;
                var mmd = Math.min(dif, nl - 2);
                var md = 0;
                for (var j = 0; j < mmd; ++j) {
                  var ti = i - dif + j & 32767;
                  var pti = prev[ti];
                  var cd = ti - pti & 32767;
                  if (cd > md)
                    md = cd, pimod = ti;
                }
              }
            }
            imod = pimod, pimod = prev[imod];
            dif += imod - pimod & 32767;
          }
        }
        if (d) {
          syms[li++] = 268435456 | revfl[l] << 18 | revfd[d];
          var lin = revfl[l] & 31, din = revfd[d] & 31;
          eb += fleb[lin] + fdeb[din];
          ++lf[257 + lin];
          ++df[din];
          wi = i + l;
          ++lc_1;
        } else {
          syms[li++] = dat[i];
          ++lf[dat[i]];
        }
      }
    }
    for (i = Math.max(i, wi); i < s; ++i) {
      syms[li++] = dat[i];
      ++lf[dat[i]];
    }
    pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i - bs, pos);
    if (!lst) {
      st.r = pos & 7 | w[pos / 8 | 0] << 3;
      pos -= 7;
      st.h = head, st.p = prev, st.i = i, st.w = wi;
    }
  } else {
    for (var i = st.w || 0; i < s + lst; i += 65535) {
      var e = i + 65535;
      if (e >= s) {
        w[pos / 8 | 0] = lst;
        e = s;
      }
      pos = wfblk(w, pos + 1, dat.subarray(i, e));
    }
    st.i = s;
  }
  return slc(o, 0, pre + shft(pos) + post);
};
var crct = /* @__PURE__ */ (function() {
  var t = new Int32Array(256);
  for (var i = 0; i < 256; ++i) {
    var c = i, k = 9;
    while (--k)
      c = (c & 1 && -306674912) ^ c >>> 1;
    t[i] = c;
  }
  return t;
})();
var crc = function() {
  var c = -1;
  return {
    p: function(d) {
      var cr = c;
      for (var i = 0; i < d.length; ++i)
        cr = crct[cr & 255 ^ d[i]] ^ cr >>> 8;
      c = cr;
    },
    d: function() {
      return ~c;
    }
  };
};
var dopt = function(dat, opt, pre, post, st) {
  if (!st) {
    st = { l: 1 };
    if (opt.dictionary) {
      var dict = opt.dictionary.subarray(-32768);
      var newDat = new u8(dict.length + dat.length);
      newDat.set(dict);
      newDat.set(dat, dict.length);
      dat = newDat;
      st.w = dict.length;
    }
  }
  return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st);
};
var mrg = function(a, b) {
  var o = {};
  for (var k in a)
    o[k] = a[k];
  for (var k in b)
    o[k] = b[k];
  return o;
};
var b2 = function(d, b) {
  return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
  return b4(d, b) + b4(d, b + 4) * 4294967296;
};
var wbytes = function(d, b, v) {
  for (; v; ++b)
    d[b] = v, v >>>= 8;
};
function deflateSync(data, opts) {
  return dopt(data, opts || {}, 0, 0);
}
function inflateSync(data, opts) {
  return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
var fltn = function(d, p, t, o) {
  for (var k in d) {
    var val = d[k], n = p + k, op = o;
    if (Array.isArray(val))
      op = mrg(o, val[1]), val = val[0];
    if (val instanceof u8)
      t[n] = [val, op];
    else {
      t[n += "/"] = [new u8(0), op];
      fltn(val, n, t, o);
    }
  }
};
var te = typeof TextEncoder != "undefined" && /* @__PURE__ */ new TextEncoder();
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}
var dutf8 = function(d) {
  for (var r = "", i = 0; ; ) {
    var c = d[i++];
    var eb = (c > 127) + (c > 223) + (c > 239);
    if (i + eb > d.length)
      return { s: r, r: slc(d, i - 1) };
    if (!eb)
      r += String.fromCharCode(c);
    else if (eb == 3) {
      c = ((c & 15) << 18 | (d[i++] & 63) << 12 | (d[i++] & 63) << 6 | d[i++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
    } else if (eb & 1)
      r += String.fromCharCode((c & 31) << 6 | d[i++] & 63);
    else
      r += String.fromCharCode((c & 15) << 12 | (d[i++] & 63) << 6 | d[i++] & 63);
  }
};
function strToU8(str, latin1) {
  var i;
  if (te)
    return te.encode(str);
  var l = str.length;
  var ar = new u8(str.length + (str.length >> 1));
  var ai = 0;
  var w = function(v) {
    ar[ai++] = v;
  };
  for (var i = 0; i < l; ++i) {
    if (ai + 5 > ar.length) {
      var n = new u8(ai + 8 + (l - i << 1));
      n.set(ar);
      ar = n;
    }
    var c = str.charCodeAt(i);
    if (c < 128 || latin1)
      w(c);
    else if (c < 2048)
      w(192 | c >> 6), w(128 | c & 63);
    else if (c > 55295 && c < 57344)
      c = 65536 + (c & 1023 << 10) | str.charCodeAt(++i) & 1023, w(240 | c >> 18), w(128 | c >> 12 & 63), w(128 | c >> 6 & 63), w(128 | c & 63);
    else
      w(224 | c >> 12), w(128 | c >> 6 & 63), w(128 | c & 63);
  }
  return slc(ar, 0, ai);
}
function strFromU8(dat, latin1) {
  if (latin1) {
    var r = "";
    for (var i = 0; i < dat.length; i += 16384)
      r += String.fromCharCode.apply(null, dat.subarray(i, i + 16384));
    return r;
  } else if (td) {
    return td.decode(dat);
  } else {
    var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
    if (r.length)
      err(8);
    return s;
  }
}
var slzh = function(d, b) {
  return b + 30 + b2(d, b + 26) + b2(d, b + 28);
};
var zh = function(d, b, z) {
  var fnl = b2(d, b + 28), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl, bs = b4(d, b + 20);
  var _a2 = z && bs == 4294967295 ? z64e(d, es) : [bs, b4(d, b + 24), b4(d, b + 42)], sc = _a2[0], su = _a2[1], off = _a2[2];
  return [b2(d, b + 10), sc, su, fn, es + b2(d, b + 30) + b2(d, b + 32), off];
};
var z64e = function(d, b) {
  for (; b2(d, b) != 1; b += 4 + b2(d, b + 2))
    ;
  return [b8(d, b + 12), b8(d, b + 4), b8(d, b + 20)];
};
var exfl = function(ex) {
  var le = 0;
  if (ex) {
    for (var k in ex) {
      var l = ex[k].length;
      if (l > 65535)
        err(9);
      le += l + 4;
    }
  }
  return le;
};
var wzh = function(d, b, f, fn, u, c, ce, co) {
  var fl2 = fn.length, ex = f.extra, col = co && co.length;
  var exl = exfl(ex);
  wbytes(d, b, ce != null ? 33639248 : 67324752), b += 4;
  if (ce != null)
    d[b++] = 20, d[b++] = f.os;
  d[b] = 20, b += 2;
  d[b++] = f.flag << 1 | (c < 0 && 8), d[b++] = u && 8;
  d[b++] = f.compression & 255, d[b++] = f.compression >> 8;
  var dt = new Date(f.mtime == null ? Date.now() : f.mtime), y = dt.getFullYear() - 1980;
  if (y < 0 || y > 119)
    err(10);
  wbytes(d, b, y << 25 | dt.getMonth() + 1 << 21 | dt.getDate() << 16 | dt.getHours() << 11 | dt.getMinutes() << 5 | dt.getSeconds() >> 1), b += 4;
  if (c != -1) {
    wbytes(d, b, f.crc);
    wbytes(d, b + 4, c < 0 ? -c - 2 : c);
    wbytes(d, b + 8, f.size);
  }
  wbytes(d, b + 12, fl2);
  wbytes(d, b + 14, exl), b += 16;
  if (ce != null) {
    wbytes(d, b, col);
    wbytes(d, b + 6, f.attrs);
    wbytes(d, b + 10, ce), b += 14;
  }
  d.set(fn, b);
  b += fl2;
  if (exl) {
    for (var k in ex) {
      var exf = ex[k], l = exf.length;
      wbytes(d, b, +k);
      wbytes(d, b + 2, l);
      d.set(exf, b + 4), b += 4 + l;
    }
  }
  if (col)
    d.set(co, b), b += col;
  return b;
};
var wzf = function(o, b, c, d, e) {
  wbytes(o, b, 101010256);
  wbytes(o, b + 8, c);
  wbytes(o, b + 10, c);
  wbytes(o, b + 12, d);
  wbytes(o, b + 16, e);
};
function zipSync(data, opts) {
  if (!opts)
    opts = {};
  var r = {};
  var files = [];
  fltn(data, "", r, opts);
  var o = 0;
  var tot = 0;
  for (var fn in r) {
    var _a2 = r[fn], file = _a2[0], p = _a2[1];
    var compression = p.level == 0 ? 0 : 8;
    var f = strToU8(fn), s = f.length;
    var com = p.comment, m = com && strToU8(com), ms = m && m.length;
    var exl = exfl(p.extra);
    if (s > 65535)
      err(11);
    var d = compression ? deflateSync(file, p) : file, l = d.length;
    var c = crc();
    c.p(file);
    files.push(mrg(p, {
      size: file.length,
      crc: c.d(),
      c: d,
      f,
      m,
      u: s != fn.length || m && com.length != ms,
      o,
      compression
    }));
    o += 30 + s + exl + l;
    tot += 76 + 2 * (s + exl) + (ms || 0) + l;
  }
  var out = new u8(tot + 22), oe = o, cdl = tot - o;
  for (var i = 0; i < files.length; ++i) {
    var f = files[i];
    wzh(out, f.o, f, f.f, f.u, f.c.length);
    var badd = 30 + f.f.length + exfl(f.extra);
    out.set(f.c, f.o + badd);
    wzh(out, o, f, f.f, f.u, f.c.length, f.o, f.m), o += 16 + badd + (f.m ? f.m.length : 0);
  }
  wzf(out, o, files.length, cdl, oe);
  return out;
}
function unzipSync(data, opts) {
  var files = {};
  var e = data.length - 22;
  for (; b4(data, e) != 101010256; --e) {
    if (!e || data.length - e > 65558)
      err(13);
  }
  var c = b2(data, e + 8);
  if (!c)
    return {};
  var o = b4(data, e + 16);
  var z = o == 4294967295 || c == 65535;
  if (z) {
    var ze = b4(data, e - 12);
    z = b4(data, ze) == 101075792;
    if (z) {
      c = b4(data, ze + 32);
      o = b4(data, ze + 48);
    }
  }
  for (var i = 0; i < c; ++i) {
    var _a2 = zh(data, o, z), c_2 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b = slzh(data, off);
    o = no;
    {
      if (!c_2)
        files[fn] = slc(data, b, b + sc);
      else if (c_2 == 8)
        files[fn] = inflateSync(data.subarray(b, b + sc), { out: new u8(su) });
      else
        err(14, "unknown compression type " + c_2);
    }
  }
  return files;
}

// node_modules/aurochs/dist/zip/index.js
function toUint8Array$1(buffer) {
  return buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
}
function readZipEntries(buffer) {
  const files = unzipSync(toUint8Array$1(buffer));
  const entries = /* @__PURE__ */ new Map();
  for (const [path, bytes] of Object.entries(files)) {
    if (!path) {
      continue;
    }
    entries.set(path, bytes);
  }
  return entries;
}
function normalizeCompressionLevel(level) {
  if (!Number.isInteger(level) || level < 0 || level > 9) {
    throw new Error(`compressionLevel must be an integer 0-9 (got: ${level})`);
  }
  return level;
}
function writeZipEntries(entries, options = {}) {
  const compressionLevel = normalizeCompressionLevel(options.compressionLevel ?? 6);
  const files = {};
  for (const [path, bytes] of entries) {
    files[path] = bytes;
  }
  return zipSync(files, { level: compressionLevel });
}
var PPTX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
var textDecoder = new TextDecoder();
var textEncoder = new TextEncoder();
function u8ToArrayBuffer(bytes) {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  );
}
function toUint8Array(content) {
  if (content instanceof Uint8Array) {
    const isWholeBuffer = content.byteOffset === 0 && content.byteLength === content.buffer.byteLength;
    if (isWholeBuffer) {
      return content;
    }
    return content.slice();
  }
  return new Uint8Array(content);
}
async function loadZipPackage(buffer) {
  const entries = readZipEntries(buffer);
  return Promise.resolve(createZipPackageFromEntries(entries));
}
function createZipPackageFromEntries(initialEntries) {
  const entries = new Map(initialEntries);
  const textCache = /* @__PURE__ */ new Map();
  const pkg = {
    // Read operations
    readText(path) {
      const cached = textCache.get(path);
      if (cached !== void 0) {
        return cached;
      }
      const bytes = entries.get(path);
      if (!bytes) {
        return null;
      }
      const text = textDecoder.decode(bytes);
      textCache.set(path, text);
      return text;
    },
    readBinary(path) {
      const bytes = entries.get(path);
      if (!bytes) {
        return null;
      }
      return u8ToArrayBuffer(bytes);
    },
    exists(path) {
      return entries.has(path);
    },
    listFiles() {
      return Array.from(entries.keys());
    },
    // Write operations
    writeText(path, content) {
      const bytes = textEncoder.encode(content);
      entries.set(path, bytes);
      textCache.set(path, content);
    },
    writeBinary(path, content) {
      entries.set(path, toUint8Array(content));
      textCache.delete(path);
    },
    remove(path) {
      entries.delete(path);
      textCache.delete(path);
    },
    // Export operations
    async toBlob(options = {}) {
      const compressionLevel = options.compressionLevel ?? 6;
      const mimeType = options.mimeType ?? PPTX_MIME_TYPE;
      const bytes = writeZipEntries(entries, { compressionLevel });
      return new Blob([bytes], { type: mimeType });
    },
    async toArrayBuffer(options = {}) {
      const compressionLevel = options.compressionLevel ?? 6;
      const bytes = writeZipEntries(entries, { compressionLevel });
      return u8ToArrayBuffer(bytes);
    },
    // Conversion
    asPresentationFile() {
      return {
        readText: (path) => pkg.readText(path),
        readBinary: (path) => pkg.readBinary(path),
        exists: (path) => pkg.exists(path),
        listFiles: () => pkg.listFiles()
      };
    }
  };
  return pkg;
}

// node_modules/aurochs/dist/_shared/escape-DdgivqKd.js
var ENCODE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;"
};
function escapeXml(text) {
  return text.replace(/[&<>"']/g, (char) => ENCODE_MAP[char]);
}

// node_modules/aurochs/dist/_shared/serializer-vYQVZRRx.js
var DEFAULT_OPTIONS = {
  declaration: false,
  encoding: "UTF-8",
  standalone: void 0,
  indent: false,
  indentString: "  ",
  selfClosing: true
};
function serializeElement(element, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  return serializeElementInternal(element, opts, 0);
}
function serializeDocument(document, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const parts = [];
  if (opts.declaration) {
    parts.push(buildDeclaration(opts));
    if (opts.indent) {
      parts.push("\n");
    }
  }
  for (const child of document.children) {
    parts.push(serializeNode(child, opts, 0));
  }
  return parts.join("");
}
function serializeNode(node, options = {}, depth = 0) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  if (isXmlText(node)) {
    return serializeText(node);
  }
  if (isXmlElement(node)) {
    return serializeElementInternal(node, opts, depth);
  }
  return "";
}
function serializeElementInternal(element, opts, depth) {
  const indent = opts.indent ? opts.indentString.repeat(depth) : "";
  const newline = opts.indent ? "\n" : "";
  const attrs = serializeAttributes(element.attrs);
  const attrStr = attrs.length > 0 ? " " + attrs : "";
  if (element.children.length === 0) {
    if (opts.selfClosing) {
      return `${indent}<${element.name}${attrStr}/>`;
    }
    return `${indent}<${element.name}${attrStr}></${element.name}>`;
  }
  const hasOnlyText = element.children.every((child) => isXmlText(child));
  if (hasOnlyText) {
    const textContent = element.children.filter(isXmlText).map((t) => escapeXml(t.value)).join("");
    return `${indent}<${element.name}${attrStr}>${textContent}</${element.name}>`;
  }
  const parts = [];
  parts.push(`${indent}<${element.name}${attrStr}>`);
  for (const child of element.children) {
    if (isXmlText(child)) {
      parts.push(escapeXml(child.value));
    } else if (isXmlElement(child)) {
      if (opts.indent) {
        parts.push(newline);
      }
      parts.push(serializeElementInternal(child, opts, depth + 1));
    }
  }
  if (opts.indent) {
    parts.push(newline);
    parts.push(indent);
  }
  parts.push(`</${element.name}>`);
  return parts.join("");
}
function serializeText(text) {
  return escapeXml(text.value);
}
function serializeAttributes(attrs) {
  const parts = [];
  for (const [key, value] of Object.entries(attrs)) {
    parts.push(`${key}="${escapeXml(value)}"`);
  }
  return parts.join(" ");
}
function buildDeclaration(opts) {
  const parts = ['<?xml version="1.0"'];
  if (opts.encoding) {
    parts.push(` encoding="${opts.encoding}"`);
  }
  if (opts.standalone !== void 0) {
    parts.push(` standalone="${opts.standalone ? "yes" : "no"}"`);
  }
  parts.push("?>");
  return parts.join("");
}

// node_modules/aurochs/dist/_shared/export-BGmrQEO_.js
var XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
var CONTENT_TYPES_NAMESPACE = "http://schemas.openxmlformats.org/package/2006/content-types";
var RELATIONSHIPS_NAMESPACE = "http://schemas.openxmlformats.org/package/2006/relationships";
var OPC_CONTENT_TYPES = {
  /** Content type for relationship parts */
  relationships: "application/vnd.openxmlformats-package.relationships+xml",
  /** Content type for generic XML files */
  xml: "application/xml"
};
function serializeWithDeclaration(element) {
  return XML_DECLARATION + serializeElement(element);
}
function serializeRelationships(relationships) {
  const children2 = relationships.map((rel) => {
    const attrs = {
      Id: rel.id,
      Type: rel.type,
      Target: rel.target
    };
    if (rel.targetMode) {
      attrs.TargetMode = rel.targetMode;
    }
    return createElement("Relationship", attrs);
  });
  return createElement("Relationships", { xmlns: RELATIONSHIPS_NAMESPACE }, children2);
}
function serializeContentTypes(entries) {
  const children2 = entries.map((entry) => {
    if (entry.kind === "default") {
      return createElement("Default", {
        Extension: entry.extension,
        ContentType: entry.contentType
      });
    }
    return createElement("Override", {
      PartName: entry.partName,
      ContentType: entry.contentType
    });
  });
  return createElement("Types", { xmlns: CONTENT_TYPES_NAMESPACE }, children2);
}
var STANDARD_CONTENT_TYPE_DEFAULTS = [
  { kind: "default", extension: "rels", contentType: OPC_CONTENT_TYPES.relationships },
  { kind: "default", extension: "xml", contentType: OPC_CONTENT_TYPES.xml }
];

// node_modules/aurochs/dist/_shared/parser-BqX8sdix.js
var TokenType = {
  TAG_OPEN: "TAG_OPEN",
  // <
  TAG_OPEN_END: "TAG_OPEN_END",
  // </
  TAG_CLOSE: "TAG_CLOSE",
  // >
  TAG_SELF_CLOSE: "TAG_SELF_CLOSE",
  // />
  TAG_NAME: "TAG_NAME",
  // element name
  ATTR_NAME: "ATTR_NAME",
  // attribute name
  ATTR_EQ: "ATTR_EQ",
  // =
  ATTR_VALUE: "ATTR_VALUE",
  // quoted attribute value
  TEXT: "TEXT",
  // text content
  COMMENT: "COMMENT",
  // <!-- ... -->
  DECLARATION: "DECLARATION",
  // <?xml ... ?>
  DOCTYPE: "DOCTYPE",
  // <!DOCTYPE ...>
  CDATA: "CDATA",
  // <![CDATA[ ... ]]>
  EOF: "EOF"
  // end of input
};
function decodeEntities(text) {
  return text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10))).replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}
function isNameChar(char) {
  const code = char.charCodeAt(0);
  return code >= 65 && code <= 90 || // A-Z
  code >= 97 && code <= 122 || // a-z
  code >= 48 && code <= 57 || // 0-9
  code === 45 || // -
  code === 95 || // _
  code === 58 || // : (namespace separator)
  code === 46;
}
function isWhitespace(char) {
  return char === " " || char === "	" || char === "\n" || char === "\r";
}
var CONTENT = 0;
var INSIDE_TAG = 1;
function createXmlLexer(input) {
  const pos = { value: 0 };
  const state = { value: CONTENT };
  function skipWhitespace() {
    while (pos.value < input.length && isWhitespace(input[pos.value])) {
      pos.value++;
    }
  }
  function peekNextNonWhitespace() {
    const remaining = input.slice(pos.value);
    const match = remaining.match(/^\s*/);
    const skipCount = match?.[0].length ?? 0;
    return input[pos.value + skipCount] ?? "";
  }
  function readAttributeValue(quote) {
    const startPos = pos.value;
    pos.value++;
    const endPos = input.indexOf(quote, pos.value);
    const value = endPos === -1 ? input.slice(pos.value) : input.slice(pos.value, endPos);
    pos.value = endPos === -1 ? input.length : endPos + 1;
    return { type: TokenType.ATTR_VALUE, value: decodeEntities(value), pos: startPos };
  }
  function readName() {
    const startPos = pos.value;
    while (pos.value < input.length && isNameChar(input[pos.value])) {
      pos.value++;
    }
    const name = input.slice(startPos, pos.value);
    const nextNonWs = peekNextNonWhitespace();
    if (nextNonWs === "=") {
      return { type: TokenType.ATTR_NAME, value: name, pos: startPos };
    }
    return { type: TokenType.TAG_NAME, value: name, pos: startPos };
  }
  function readText() {
    const startPos = pos.value;
    const endPos = input.indexOf("<", pos.value);
    const text = endPos === -1 ? input.slice(pos.value) : input.slice(pos.value, endPos);
    pos.value = endPos === -1 ? input.length : endPos;
    return { type: TokenType.TEXT, value: decodeEntities(text), pos: startPos };
  }
  function readComment() {
    const startPos = pos.value;
    pos.value += 4;
    const endIndex = input.indexOf("-->", pos.value);
    if (endIndex === -1) {
      const content2 = input.slice(pos.value);
      pos.value = input.length;
      return { type: TokenType.COMMENT, value: content2, pos: startPos };
    }
    const content = input.slice(pos.value, endIndex);
    pos.value = endIndex + 3;
    return { type: TokenType.COMMENT, value: content, pos: startPos };
  }
  function readCData() {
    const startPos = pos.value;
    pos.value += 9;
    const endIndex = input.indexOf("]]>", pos.value);
    if (endIndex === -1) {
      const content2 = input.slice(pos.value);
      pos.value = input.length;
      return { type: TokenType.CDATA, value: content2, pos: startPos };
    }
    const content = input.slice(pos.value, endIndex);
    pos.value = endIndex + 3;
    return { type: TokenType.CDATA, value: content, pos: startPos };
  }
  function readDocType() {
    const startPos = pos.value;
    pos.value += 2;
    const endIndex = input.indexOf(">", pos.value);
    if (endIndex === -1) {
      const content2 = input.slice(pos.value);
      pos.value = input.length;
      return { type: TokenType.DOCTYPE, value: content2, pos: startPos };
    }
    const content = input.slice(pos.value, endIndex);
    pos.value = endIndex + 1;
    return { type: TokenType.DOCTYPE, value: content, pos: startPos };
  }
  function readDeclaration() {
    const startPos = pos.value;
    pos.value += 2;
    const endIndex = input.indexOf("?>", pos.value);
    if (endIndex === -1) {
      const content2 = input.slice(pos.value);
      pos.value = input.length;
      return { type: TokenType.DECLARATION, value: content2.trim(), pos: startPos };
    }
    const content = input.slice(pos.value, endIndex);
    pos.value = endIndex + 2;
    return { type: TokenType.DECLARATION, value: content.trim(), pos: startPos };
  }
  function readTagStart() {
    const startPos = pos.value;
    if (input[pos.value + 1] === "/") {
      pos.value += 2;
      state.value = INSIDE_TAG;
      return { type: TokenType.TAG_OPEN_END, value: "</", pos: startPos };
    }
    if (input[pos.value + 1] === "!" && input[pos.value + 2] === "-" && input[pos.value + 3] === "-") {
      return readComment();
    }
    if (input.slice(pos.value + 1, pos.value + 9) === "![CDATA[") {
      return readCData();
    }
    if (input[pos.value + 1] === "!") {
      return readDocType();
    }
    if (input[pos.value + 1] === "?") {
      return readDeclaration();
    }
    pos.value++;
    state.value = INSIDE_TAG;
    return { type: TokenType.TAG_OPEN, value: "<", pos: startPos };
  }
  function readContent() {
    const char = input[pos.value];
    if (char === "<") {
      return readTagStart();
    }
    return readText();
  }
  function readInsideTag() {
    skipWhitespace();
    if (pos.value >= input.length) {
      return { type: TokenType.EOF, value: "", pos: pos.value };
    }
    const char = input[pos.value];
    if (char === "/" && input[pos.value + 1] === ">") {
      const startPos = pos.value;
      pos.value += 2;
      state.value = CONTENT;
      return { type: TokenType.TAG_SELF_CLOSE, value: "/>", pos: startPos };
    }
    if (char === ">") {
      const startPos = pos.value;
      pos.value++;
      state.value = CONTENT;
      return { type: TokenType.TAG_CLOSE, value: ">", pos: startPos };
    }
    if (char === "=") {
      const startPos = pos.value;
      pos.value++;
      return { type: TokenType.ATTR_EQ, value: "=", pos: startPos };
    }
    if (char === '"' || char === "'") {
      return readAttributeValue(char);
    }
    if (isNameChar(char)) {
      return readName();
    }
    pos.value++;
    return readInsideTag();
  }
  function nextToken() {
    if (pos.value >= input.length) {
      return { type: TokenType.EOF, value: "", pos: pos.value };
    }
    if (state.value === INSIDE_TAG) {
      return readInsideTag();
    }
    return readContent();
  }
  return { nextToken };
}
function parseXml(input) {
  const lexer = createXmlLexer(input);
  const currentToken = { value: lexer.nextToken() };
  function advance() {
    currentToken.value = lexer.nextToken();
    return currentToken.value;
  }
  function isAtElementEnd() {
    return currentToken.value.type === TokenType.TAG_CLOSE || currentToken.value.type === TokenType.TAG_SELF_CLOSE || currentToken.value.type === TokenType.EOF;
  }
  function parseText2() {
    const value = currentToken.value.value;
    advance();
    return {
      type: "text",
      value
    };
  }
  function parseElement() {
    const tagNameToken = advance();
    if (tagNameToken.type !== TokenType.TAG_NAME) {
      return null;
    }
    const name = tagNameToken.value;
    advance();
    const attrs = {};
    while (!isAtElementEnd()) {
      if (currentToken.value.type === TokenType.ATTR_NAME) {
        const attrName = currentToken.value.value;
        const tokenAfterName = advance();
        const valueToken = tokenAfterName.type === TokenType.ATTR_EQ ? advance() : tokenAfterName;
        if (valueToken.type === TokenType.ATTR_VALUE) {
          attrs[attrName] = valueToken.value;
          advance();
        } else {
          attrs[attrName] = "";
        }
      } else {
        advance();
      }
    }
    if (currentToken.value.type === TokenType.TAG_SELF_CLOSE) {
      advance();
      return {
        type: "element",
        name,
        attrs,
        children: []
      };
    }
    if (currentToken.value.type === TokenType.TAG_CLOSE) {
      advance();
    }
    const children22 = parseChildren(name);
    return {
      type: "element",
      name,
      attrs,
      children: children22
    };
  }
  function parseChildren(parentTagName) {
    const children22 = [];
    while (currentToken.value.type !== TokenType.EOF) {
      if (currentToken.value.type === TokenType.TAG_OPEN_END) {
        const nextToken = advance();
        if (nextToken.type === TokenType.TAG_NAME) {
          const tagName = nextToken.value;
          const afterName = advance();
          if (afterName.type === TokenType.TAG_CLOSE) {
            advance();
          }
          if (tagName === parentTagName) {
            return children22;
          }
          continue;
        }
        continue;
      }
      if (currentToken.value.type === TokenType.DECLARATION || currentToken.value.type === TokenType.COMMENT || currentToken.value.type === TokenType.DOCTYPE) {
        advance();
        continue;
      }
      if (currentToken.value.type === TokenType.TAG_OPEN) {
        const element = parseElement();
        if (element) {
          children22.push(element);
        }
        continue;
      }
      if (currentToken.value.type === TokenType.TEXT) {
        const textNode = parseText2();
        if (textNode) {
          children22.push(textNode);
        }
        continue;
      }
      if (currentToken.value.type === TokenType.CDATA) {
        const textNode = {
          type: "text",
          value: currentToken.value.value
        };
        children22.push(textNode);
        advance();
        continue;
      }
      advance();
    }
    return children22;
  }
  const children2 = parseChildren(null);
  return { children: children2 };
}

// node_modules/aurochs/dist/_shared/content-types-cWoGLHFT.js
function parseContentTypes(contentTypesXml) {
  const defaults = /* @__PURE__ */ new Map();
  const overrides = /* @__PURE__ */ new Map();
  const root = contentTypesXml.children.find(isXmlElement);
  if (!root || root.name !== "Types") {
    return { defaults, overrides };
  }
  for (const child of root.children) {
    if (!isXmlElement(child)) {
      continue;
    }
    switch (child.name) {
      case "Default": {
        const extension = child.attrs.Extension;
        const contentType = child.attrs.ContentType;
        if (extension && contentType) {
          defaults.set(extension.toLowerCase(), contentType);
        }
        break;
      }
      case "Override": {
        const partName = child.attrs.PartName;
        const contentType = child.attrs.ContentType;
        if (partName && contentType) {
          overrides.set(partName, contentType);
        }
        break;
      }
    }
  }
  return { defaults, overrides };
}
function contentTypesToEntries(parsed) {
  const entries = [];
  for (const [extension, contentType] of parsed.defaults) {
    entries.push({ kind: "default", extension, contentType });
  }
  for (const [partName, contentType] of parsed.overrides) {
    entries.push({ kind: "override", partName, contentType });
  }
  return entries;
}

// node_modules/aurochs/dist/_shared/relationships-D-jbUYMg.js
function listRelationships(relsXml) {
  const root = relsXml.children.find(isXmlElement);
  if (!root || root.name !== "Relationships") {
    return [];
  }
  const relationships = [];
  for (const child of root.children) {
    if (!isXmlElement(child) || child.name !== "Relationship") {
      continue;
    }
    const id = child.attrs.Id;
    const target = child.attrs.Target;
    if (!id || !target) {
      continue;
    }
    relationships.push({
      id,
      type: child.attrs.Type ?? "",
      target,
      targetMode: child.attrs.TargetMode
    });
  }
  return relationships;
}
function createEmptyResourceMap() {
  return {
    getTarget: () => void 0,
    getType: () => void 0,
    getTargetByType: () => void 0,
    getAllTargetsByType: () => []
  };
}
function createResourceMap(entries) {
  return {
    getTarget(rId) {
      return entries[rId]?.target;
    },
    getType(rId) {
      return entries[rId]?.type;
    },
    getTargetByType(relType) {
      for (const entry of Object.values(entries)) {
        if (entry.type === relType) {
          return entry.target;
        }
      }
      return void 0;
    },
    getAllTargetsByType(relType) {
      const targets = [];
      for (const entry of Object.values(entries)) {
        if (entry.type === relType) {
          targets.push(entry.target);
        }
      }
      return targets;
    }
  };
}

// node_modules/aurochs/dist/docx/builder/index.js
function convertUnderlineSpec(underline) {
  if (typeof underline === "boolean") {
    return { val: underline ? "single" : "none" };
  }
  return { val: underline };
}
function createDrawingContext(startRId = 1) {
  return {
    mediaRIds: /* @__PURE__ */ new Map(),
    nextRId: startRId
  };
}
function getMediaRId(ctx, mediaFile) {
  const existing = ctx.mediaRIds.get(mediaFile);
  if (existing) {
    return existing;
  }
  const newRId = `rId${ctx.nextRId++}`;
  ctx.mediaRIds.set(mediaFile, newRId);
  return newRId;
}
function convertDrawingExtent(spec) {
  return { cx: spec.cx, cy: spec.cy };
}
function convertDocPr(spec) {
  return {
    id: spec.id,
    name: spec.name,
    ...spec.descr !== void 0 ? { descr: spec.descr } : {}
  };
}
function createPicture(rId, extent, docPr) {
  return {
    nvPicPr: {
      cNvPr: docPr,
      cNvPicPr: {}
    },
    blipFill: {
      blip: { rEmbed: rId },
      stretch: true
    },
    spPr: {
      xfrm: {
        off: { x: 0, y: 0 },
        ext: extent
      }
    }
  };
}
function convertInlineDrawing(spec, ctx) {
  const rId = getMediaRId(ctx, spec.mediaFile);
  const extent = convertDrawingExtent(spec.extent);
  const docPr = convertDocPr(spec.docPr);
  return {
    type: "inline",
    extent,
    docPr,
    pic: createPicture(rId, extent, docPr)
  };
}
function convertAnchorDrawing(spec, ctx) {
  const rId = getMediaRId(ctx, spec.mediaFile);
  const extent = convertDrawingExtent(spec.extent);
  const docPr = convertDocPr(spec.docPr);
  return {
    type: "anchor",
    extent,
    docPr,
    positionH: spec.positionH,
    positionV: spec.positionV,
    ...spec.behindDoc !== void 0 ? { behindDoc: spec.behindDoc } : {},
    ...spec.locked !== void 0 ? { locked: spec.locked } : {},
    ...spec.wrap !== void 0 ? { wrap: spec.wrap } : {},
    pic: createPicture(rId, extent, docPr)
  };
}
function convertDrawingSpec(spec, ctx) {
  if (spec.type === "inline") {
    return convertInlineDrawing(spec, ctx);
  }
  return convertAnchorDrawing(spec, ctx);
}
function convertRunContentSpec(spec, ctx) {
  if (spec.type === "text") {
    return { type: "text", value: spec.text };
  }
  return {
    type: "drawing",
    drawing: convertDrawingSpec(spec.drawing, ctx)
  };
}
function buildRunContent(spec, ctx) {
  if (spec.contents) {
    return spec.contents.map((c) => convertRunContentSpec(c, ctx));
  }
  if (spec.text !== void 0) {
    return [{ type: "text", value: spec.text }];
  }
  return [];
}
function hasFontProperties(spec) {
  return spec.fontFamily !== void 0 || spec.fontFamilyEastAsian !== void 0 || spec.fontFamilyComplexScript !== void 0 || spec.asciiTheme !== void 0;
}
function buildRFonts(spec) {
  if (!hasFontProperties(spec)) {
    return void 0;
  }
  return {
    ...spec.fontFamily !== void 0 ? { ascii: spec.fontFamily, hAnsi: spec.fontFamily } : {},
    ...spec.fontFamilyEastAsian !== void 0 ? { eastAsia: spec.fontFamilyEastAsian } : {},
    ...spec.fontFamilyComplexScript !== void 0 ? { cs: spec.fontFamilyComplexScript } : {},
    ...spec.asciiTheme !== void 0 ? { asciiTheme: spec.asciiTheme } : {}
  };
}
function convertRunSpec(spec, ctx) {
  const drawingCtx = ctx ?? createDrawingContext();
  const content = buildRunContent(spec, drawingCtx);
  const rFonts = buildRFonts(spec);
  const properties = {
    ...spec.bold !== void 0 ? { b: spec.bold } : {},
    ...spec.boldCs !== void 0 ? { bCs: spec.boldCs } : {},
    ...spec.italic !== void 0 ? { i: spec.italic } : {},
    ...spec.italicCs !== void 0 ? { iCs: spec.italicCs } : {},
    ...spec.strikethrough !== void 0 ? { strike: spec.strikethrough } : {},
    ...spec.doubleStrikethrough !== void 0 ? { dstrike: spec.doubleStrikethrough } : {},
    ...spec.smallCaps !== void 0 ? { smallCaps: spec.smallCaps } : {},
    ...spec.allCaps !== void 0 ? { caps: spec.allCaps } : {},
    ...spec.emboss !== void 0 ? { emboss: spec.emboss } : {},
    ...spec.imprint !== void 0 ? { imprint: spec.imprint } : {},
    ...spec.outline !== void 0 ? { outline: spec.outline } : {},
    ...spec.shadow !== void 0 ? { shadow: spec.shadow } : {},
    ...spec.fontSize !== void 0 ? { sz: halfPoints(spec.fontSize) } : {},
    ...spec.fontSizeCs !== void 0 ? { szCs: halfPoints(spec.fontSizeCs) } : {},
    ...rFonts !== void 0 ? { rFonts } : {},
    ...spec.shading !== void 0 ? { shd: { val: spec.shading.val, fill: spec.shading.fill } } : {},
    ...spec.color !== void 0 ? { color: { val: spec.color } } : {},
    ...spec.highlight !== void 0 ? { highlight: spec.highlight } : {},
    ...spec.vertAlign !== void 0 ? { vertAlign: spec.vertAlign } : {},
    ...spec.underline !== void 0 ? { u: convertUnderlineSpec(spec.underline) } : {},
    ...spec.letterSpacing !== void 0 ? { spacing: twips(spec.letterSpacing) } : {},
    ...spec.kerning !== void 0 ? { kern: halfPoints(spec.kerning) } : {},
    ...spec.position !== void 0 ? { position: halfPoints(spec.position) } : {},
    ...spec.rtl !== void 0 ? { rtl: spec.rtl } : {}
  };
  const hasProperties = Object.keys(properties).length > 0;
  return {
    type: "run",
    ...hasProperties ? { properties } : {},
    content
  };
}
function convertParagraphSpec(spec, ctx) {
  const drawingCtx = ctx ?? createDrawingContext();
  const properties = {
    ...spec.style !== void 0 ? { pStyle: docxStyleId(spec.style) } : {},
    ...spec.alignment !== void 0 ? { jc: spec.alignment } : {},
    ...spec.keepNext !== void 0 ? { keepNext: spec.keepNext } : {},
    ...spec.keepLines !== void 0 ? { keepLines: spec.keepLines } : {},
    ...spec.pageBreakBefore !== void 0 ? { pageBreakBefore: spec.pageBreakBefore } : {},
    ...spec.spacing !== void 0 ? { spacing: convertSpacing(spec.spacing) } : {},
    ...spec.indent !== void 0 ? { ind: convertIndent(spec.indent) } : {},
    ...spec.numbering !== void 0 ? { numPr: convertNumberingProperties(spec.numbering) } : {},
    ...spec.tabs !== void 0 ? { tabs: convertTabStops(spec.tabs) } : {},
    ...spec.shading !== void 0 ? { shd: { val: "clear", fill: spec.shading } } : {},
    ...spec.borders !== void 0 ? { pBdr: convertParagraphBorders(spec.borders) } : {},
    ...spec.bidi !== void 0 ? { bidi: spec.bidi } : {},
    ...spec.textDirection !== void 0 ? { textDirection: spec.textDirection } : {},
    ...spec.widowControl !== void 0 ? { widowControl: spec.widowControl } : {},
    ...spec.outlineLvl !== void 0 ? { outlineLvl: spec.outlineLvl } : {}
  };
  const hasProperties = Object.keys(properties).length > 0;
  return {
    type: "paragraph",
    ...hasProperties ? { properties } : {},
    content: spec.runs.map((r) => convertRunSpec(r, drawingCtx))
  };
}
function convertSpacing(spacing) {
  return {
    ...spacing.before !== void 0 ? { before: twips(spacing.before) } : {},
    ...spacing.after !== void 0 ? { after: twips(spacing.after) } : {},
    ...spacing.line !== void 0 ? { line: spacing.line } : {},
    ...spacing.lineRule !== void 0 ? { lineRule: spacing.lineRule } : {},
    ...spacing.beforeAutospacing !== void 0 ? { beforeAutospacing: spacing.beforeAutospacing } : {},
    ...spacing.afterAutospacing !== void 0 ? { afterAutospacing: spacing.afterAutospacing } : {}
  };
}
function convertIndent(indent) {
  return {
    ...indent.left !== void 0 ? { left: twips(indent.left) } : {},
    ...indent.right !== void 0 ? { right: twips(indent.right) } : {},
    ...indent.firstLine !== void 0 ? { firstLine: twips(indent.firstLine) } : {},
    ...indent.hanging !== void 0 ? { hanging: twips(indent.hanging) } : {},
    ...indent.start !== void 0 ? { start: twips(indent.start) } : {},
    ...indent.end !== void 0 ? { end: twips(indent.end) } : {}
  };
}
function convertParagraphBorderEdge(edge) {
  return {
    val: edge.style,
    ...edge.size !== void 0 ? { sz: edge.size } : {},
    ...edge.color !== void 0 ? { color: edge.color } : {},
    ...edge.space !== void 0 ? { space: edge.space } : {}
  };
}
function convertParagraphBorders(borders) {
  return {
    ...borders.top !== void 0 ? { top: convertParagraphBorderEdge(borders.top) } : {},
    ...borders.bottom !== void 0 ? { bottom: convertParagraphBorderEdge(borders.bottom) } : {},
    ...borders.left !== void 0 ? { left: convertParagraphBorderEdge(borders.left) } : {},
    ...borders.right !== void 0 ? { right: convertParagraphBorderEdge(borders.right) } : {},
    ...borders.between !== void 0 ? { between: convertParagraphBorderEdge(borders.between) } : {}
  };
}
function convertTabStops(tabs) {
  return {
    tabs: tabs.map((tab) => ({
      pos: twips(tab.pos),
      val: tab.val ?? "left"
    }))
  };
}
function convertNumberingProperties(numbering) {
  return {
    numId: docxNumId(numbering.numId),
    ilvl: docxIlvl(numbering.ilvl)
  };
}
function convertGridSpec(grid) {
  if (!grid) {
    return void 0;
  }
  return { columns: grid.map((w) => ({ width: px(w) })) };
}
function convertCellMargins(margins) {
  return {
    ...margins.top !== void 0 ? { top: margins.top } : {},
    ...margins.right !== void 0 ? { right: margins.right } : {},
    ...margins.bottom !== void 0 ? { bottom: margins.bottom } : {},
    ...margins.left !== void 0 ? { left: margins.left } : {}
  };
}
function convertTableSpec(spec, ctx) {
  const drawingCtx = ctx ?? createDrawingContext();
  const properties = {
    ...spec.style !== void 0 ? { tblStyle: docxStyleId(spec.style) } : {},
    ...spec.width !== void 0 ? { tblW: convertTableWidth(spec.width) } : {},
    ...spec.alignment !== void 0 ? { jc: spec.alignment } : {},
    ...spec.borders !== void 0 ? { tblBorders: convertTableBorders(spec.borders) } : {},
    ...spec.indent !== void 0 ? { tblInd: convertTableWidth(spec.indent) } : {},
    ...spec.shading !== void 0 ? { shd: { val: "clear", fill: spec.shading } } : {},
    ...spec.cellMargins !== void 0 ? { tblCellMar: convertCellMargins(spec.cellMargins) } : {},
    ...spec.layout !== void 0 ? { tblLayout: spec.layout } : {},
    ...spec.bidiVisual !== void 0 ? { bidiVisual: spec.bidiVisual } : {}
  };
  const hasProperties = Object.keys(properties).length > 0;
  const grid = convertGridSpec(spec.grid);
  return {
    type: "table",
    ...hasProperties ? { properties } : {},
    ...grid ? { grid } : {},
    rows: spec.rows.map((r) => convertTableRow(r, drawingCtx))
  };
}
function convertTableWidth(width) {
  return { value: width.value, type: width.type };
}
function convertTableBorderEdge(edge) {
  return {
    val: edge.style,
    ...edge.size !== void 0 ? { sz: edge.size } : {},
    ...edge.color !== void 0 ? { color: edge.color } : {}
  };
}
function convertTableBorders(borders) {
  return {
    ...borders.top ? { top: convertTableBorderEdge(borders.top) } : {},
    ...borders.left ? { left: convertTableBorderEdge(borders.left) } : {},
    ...borders.bottom ? { bottom: convertTableBorderEdge(borders.bottom) } : {},
    ...borders.right ? { right: convertTableBorderEdge(borders.right) } : {},
    ...borders.insideH ? { insideH: convertTableBorderEdge(borders.insideH) } : {},
    ...borders.insideV ? { insideV: convertTableBorderEdge(borders.insideV) } : {}
  };
}
function convertTableRow(spec, ctx) {
  const drawingCtx = ctx ?? createDrawingContext();
  const properties = {
    ...spec.height !== void 0 ? { trHeight: convertRowHeight(spec.height) } : {},
    ...spec.header !== void 0 ? { tblHeader: spec.header } : {},
    ...spec.cantSplit !== void 0 ? { cantSplit: spec.cantSplit } : {}
  };
  const hasProperties = Object.keys(properties).length > 0;
  return {
    type: "tableRow",
    ...hasProperties ? { properties } : {},
    cells: spec.cells.map((c) => convertTableCell(c, drawingCtx))
  };
}
function convertRowHeight(height) {
  return {
    val: twips(height.value),
    ...height.rule !== void 0 ? { hRule: height.rule } : {}
  };
}
function convertTableCell(spec, ctx) {
  const drawingCtx = ctx ?? createDrawingContext();
  const properties = {
    ...spec.width !== void 0 ? { tcW: convertTableWidth(spec.width) } : {},
    ...spec.gridSpan !== void 0 ? { gridSpan: gridSpan(spec.gridSpan) } : {},
    ...spec.vMerge !== void 0 ? { vMerge: spec.vMerge } : {},
    ...spec.shading !== void 0 ? { shd: { val: "clear", fill: spec.shading } } : {},
    ...spec.vAlign !== void 0 ? { vAlign: spec.vAlign } : {},
    ...spec.borders !== void 0 ? { tcBorders: convertCellBorders(spec.borders) } : {},
    ...spec.textDirection !== void 0 ? { textDirection: spec.textDirection } : {},
    ...spec.noWrap !== void 0 ? { noWrap: spec.noWrap } : {}
  };
  const hasProperties = Object.keys(properties).length > 0;
  return {
    type: "tableCell",
    ...hasProperties ? { properties } : {},
    content: spec.content.map((p) => convertParagraphSpec(p, drawingCtx))
  };
}
function convertCellBorders(borders) {
  return {
    ...borders.top ? { top: convertTableBorderEdge(borders.top) } : {},
    ...borders.left ? { left: convertTableBorderEdge(borders.left) } : {},
    ...borders.bottom ? { bottom: convertTableBorderEdge(borders.bottom) } : {},
    ...borders.right ? { right: convertTableBorderEdge(borders.right) } : {}
  };
}
function convertBlockContent(spec, ctx) {
  const drawingCtx = ctx ?? createDrawingContext();
  switch (spec.type) {
    case "paragraph":
      return convertParagraphSpec(spec, drawingCtx);
    case "table":
      return convertTableSpec(spec, drawingCtx);
  }
}
function convertLevelIndent(indent) {
  return {
    ...indent.left !== void 0 ? { left: twips(indent.left) } : {},
    ...indent.hanging !== void 0 ? { hanging: twips(indent.hanging) } : {}
  };
}
function convertNumberingLevel(spec) {
  return {
    ilvl: docxIlvl(spec.ilvl),
    numFmt: spec.numFmt,
    lvlText: { val: spec.lvlText },
    ...spec.start !== void 0 ? { start: spec.start } : {},
    ...spec.lvlJc !== void 0 ? { lvlJc: spec.lvlJc } : {},
    ...spec.indent !== void 0 ? { pPr: { ind: convertLevelIndent(spec.indent) } } : {},
    ...spec.font !== void 0 ? { rPr: { rFonts: { ascii: spec.font, hAnsi: spec.font } } } : {}
  };
}
function convertNumberingSpec(specs) {
  const abstractNum = specs.map((spec) => ({
    abstractNumId: docxAbstractNumId(spec.abstractNumId),
    lvl: spec.levels.map(convertNumberingLevel)
  }));
  const num = specs.map((spec) => ({
    numId: docxNumId(spec.numId),
    abstractNumId: docxAbstractNumId(spec.abstractNumId)
  }));
  return { abstractNum, num };
}
function convertStyleParagraphProperties(para) {
  return {
    ...para.alignment !== void 0 ? { jc: para.alignment } : {},
    ...para.spacing !== void 0 ? { spacing: convertSpacing(para.spacing) } : {},
    ...para.indent !== void 0 ? { ind: convertIndent(para.indent) } : {},
    ...para.keepNext !== void 0 ? { keepNext: para.keepNext } : {},
    ...para.keepLines !== void 0 ? { keepLines: para.keepLines } : {},
    ...para.pageBreakBefore !== void 0 ? { pageBreakBefore: para.pageBreakBefore } : {}
  };
}
function buildStyleRFonts(run) {
  const hasFonts = run.fontFamily !== void 0 || run.fontFamilyEastAsian !== void 0 || run.fontFamilyComplexScript !== void 0 || run.asciiTheme !== void 0;
  if (!hasFonts) {
    return void 0;
  }
  return {
    ...run.fontFamily !== void 0 ? { ascii: run.fontFamily, hAnsi: run.fontFamily } : {},
    ...run.fontFamilyEastAsian !== void 0 ? { eastAsia: run.fontFamilyEastAsian } : {},
    ...run.fontFamilyComplexScript !== void 0 ? { cs: run.fontFamilyComplexScript } : {},
    ...run.asciiTheme !== void 0 ? { asciiTheme: run.asciiTheme } : {}
  };
}
function convertStyleRunProperties(run) {
  const rFonts = buildStyleRFonts(run);
  return {
    ...run.bold !== void 0 ? { b: run.bold } : {},
    ...run.boldCs !== void 0 ? { bCs: run.boldCs } : {},
    ...run.italic !== void 0 ? { i: run.italic } : {},
    ...run.italicCs !== void 0 ? { iCs: run.italicCs } : {},
    ...run.strikethrough !== void 0 ? { strike: run.strikethrough } : {},
    ...run.doubleStrikethrough !== void 0 ? { dstrike: run.doubleStrikethrough } : {},
    ...run.smallCaps !== void 0 ? { smallCaps: run.smallCaps } : {},
    ...run.allCaps !== void 0 ? { caps: run.allCaps } : {},
    ...run.emboss !== void 0 ? { emboss: run.emboss } : {},
    ...run.imprint !== void 0 ? { imprint: run.imprint } : {},
    ...run.outline !== void 0 ? { outline: run.outline } : {},
    ...run.shadow !== void 0 ? { shadow: run.shadow } : {},
    ...run.fontSize !== void 0 ? { sz: halfPoints(run.fontSize) } : {},
    ...run.fontSizeCs !== void 0 ? { szCs: halfPoints(run.fontSizeCs) } : {},
    ...rFonts !== void 0 ? { rFonts } : {},
    ...run.shading !== void 0 ? { shd: { val: run.shading.val, fill: run.shading.fill } } : {},
    ...run.color !== void 0 ? { color: { val: run.color } } : {},
    ...run.highlight !== void 0 ? { highlight: run.highlight } : {},
    ...run.vertAlign !== void 0 ? { vertAlign: run.vertAlign } : {},
    ...run.underline !== void 0 ? { u: convertUnderlineSpec(run.underline) } : {},
    ...run.letterSpacing !== void 0 ? { spacing: twips(run.letterSpacing) } : {},
    ...run.kerning !== void 0 ? { kern: halfPoints(run.kerning) } : {},
    ...run.position !== void 0 ? { position: halfPoints(run.position) } : {},
    ...run.rtl !== void 0 ? { rtl: run.rtl } : {}
  };
}
function convertStylesSpec(specs) {
  const style = specs.map((spec) => ({
    type: spec.type,
    styleId: docxStyleId(spec.styleId),
    name: { val: spec.name },
    ...spec.basedOn !== void 0 ? { basedOn: { val: docxStyleId(spec.basedOn) } } : {},
    ...spec.next !== void 0 ? { next: { val: docxStyleId(spec.next) } } : {},
    ...spec.paragraph !== void 0 ? { pPr: convertStyleParagraphProperties(spec.paragraph) } : {},
    ...spec.run !== void 0 ? { rPr: convertStyleRunProperties(spec.run) } : {}
  }));
  return { style };
}
function convertHeaderContent(spec) {
  return {
    content: spec.content.map(convertBlockContent)
  };
}
function convertFooterContent(spec) {
  return {
    content: spec.content.map(convertBlockContent)
  };
}
function processHeaderFooterSpecs(specs, converter, startRId) {
  if (!specs) {
    return { refs: [], map: /* @__PURE__ */ new Map(), nextRId: startRId };
  }
  const types = ["default", "first", "even"];
  const refs = [];
  const map = /* @__PURE__ */ new Map();
  const count = types.reduce((acc, type) => {
    const content = specs[type];
    if (content) {
      const rId = docxRelId(`rId${startRId + acc}`);
      refs.push({ type, rId });
      map.set(rId, converter(content));
      return acc + 1;
    }
    return acc;
  }, 0);
  return { refs, map, nextRId: startRId + count };
}
function convertSectionSpec(spec, startRId = 1) {
  const headerResult = processHeaderFooterSpecs(spec.headers, convertHeaderContent, startRId);
  const footerResult = processHeaderFooterSpecs(spec.footers, convertFooterContent, headerResult.nextRId);
  const headers = headerResult.map;
  const footers = footerResult.map;
  const sectPr = {
    ...spec.type !== void 0 ? { type: spec.type } : {},
    ...spec.pageSize !== void 0 ? { pgSz: convertPageSize(spec.pageSize) } : {},
    ...spec.margins !== void 0 ? { pgMar: convertPageMargins(spec.margins) } : {},
    ...spec.columns !== void 0 ? { cols: convertColumns(spec.columns) } : {},
    ...spec.pageNumbering !== void 0 ? { pgNumType: convertPageNumberType(spec.pageNumbering) } : {},
    ...spec.titlePage !== void 0 ? { titlePg: spec.titlePage } : {},
    ...headerResult.refs.length > 0 ? { headerReference: headerResult.refs } : {},
    ...footerResult.refs.length > 0 ? { footerReference: footerResult.refs } : {}
  };
  return { sectPr, headers, footers };
}
function convertPageNumberType(pgNum) {
  return {
    ...pgNum.format !== void 0 ? { fmt: pgNum.format } : {},
    ...pgNum.start !== void 0 ? { start: pgNum.start } : {}
  };
}
function convertPageSize(size) {
  return {
    w: twips(size.w),
    h: twips(size.h),
    ...size.orient !== void 0 ? { orient: size.orient } : {}
  };
}
function convertPageMargins(margins) {
  return {
    top: twips(margins.top),
    right: twips(margins.right),
    bottom: twips(margins.bottom),
    left: twips(margins.left),
    ...margins.header !== void 0 ? { header: twips(margins.header) } : {},
    ...margins.footer !== void 0 ? { footer: twips(margins.footer) } : {},
    ...margins.gutter !== void 0 ? { gutter: twips(margins.gutter) } : {}
  };
}
function convertColumns(cols) {
  return {
    ...cols.num !== void 0 ? { num: cols.num } : {},
    ...cols.space !== void 0 ? { space: twips(cols.space) } : {},
    ...cols.equalWidth !== void 0 ? { equalWidth: cols.equalWidth } : {}
  };
}
function wEl(localName2, attrs = {}, children2 = []) {
  return createElement(`w:${localName2}`, attrs, children2);
}
function valEl(localName2, val) {
  return wEl(localName2, { val });
}
function toggleEl(localName2, value) {
  if (value === void 0) {
    return void 0;
  }
  return value ? wEl(localName2) : wEl(localName2, { val: "0" });
}
function optValEl(localName2, val) {
  if (val === void 0) {
    return void 0;
  }
  return valEl(localName2, String(val));
}
function optAttr(attrs, name, value) {
  if (value === void 0) {
    return;
  }
  if (typeof value === "boolean") {
    attrs[name] = value ? "1" : "0";
  } else {
    attrs[name] = String(value);
  }
}
function children(...items) {
  return items.filter((item) => item !== void 0);
}
function serializeRunFonts(fonts) {
  if (!fonts) {
    return void 0;
  }
  const attrs = {};
  optAttr(attrs, "ascii", fonts.ascii);
  optAttr(attrs, "hAnsi", fonts.hAnsi);
  optAttr(attrs, "eastAsia", fonts.eastAsia);
  optAttr(attrs, "cs", fonts.cs);
  optAttr(attrs, "asciiTheme", fonts.asciiTheme);
  optAttr(attrs, "hAnsiTheme", fonts.hAnsiTheme);
  optAttr(attrs, "eastAsiaTheme", fonts.eastAsiaTheme);
  optAttr(attrs, "csTheme", fonts.csTheme);
  if (Object.keys(attrs).length === 0) {
    return void 0;
  }
  return wEl("rFonts", attrs);
}
function serializeColor(color) {
  if (!color) {
    return void 0;
  }
  const attrs = {};
  optAttr(attrs, "val", color.val ?? "auto");
  optAttr(attrs, "themeColor", color.themeColor);
  optAttr(attrs, "themeTint", color.themeTint);
  optAttr(attrs, "themeShade", color.themeShade);
  return wEl("color", attrs);
}
function serializeShading(shd) {
  if (!shd) {
    return void 0;
  }
  const attrs = {};
  optAttr(attrs, "val", shd.val);
  optAttr(attrs, "color", shd.color);
  optAttr(attrs, "fill", shd.fill);
  optAttr(attrs, "themeColor", shd.themeColor);
  optAttr(attrs, "themeFill", shd.themeFill);
  return wEl("shd", attrs);
}
function serializeRunBorder(bdr) {
  if (!bdr) {
    return void 0;
  }
  const attrs = { val: bdr.val };
  optAttr(attrs, "sz", bdr.sz);
  optAttr(attrs, "space", bdr.space);
  optAttr(attrs, "color", bdr.color);
  optAttr(attrs, "themeColor", bdr.themeColor);
  optAttr(attrs, "frame", bdr.frame);
  optAttr(attrs, "shadow", bdr.shadow);
  return wEl("bdr", attrs);
}
function serializeUnderline(u) {
  if (!u) {
    return void 0;
  }
  const attrs = { val: u.val };
  optAttr(attrs, "color", u.color);
  optAttr(attrs, "themeColor", u.themeColor);
  return wEl("u", attrs);
}
function serializeEastAsianLayout(layout) {
  if (!layout) {
    return void 0;
  }
  const attrs = {};
  optAttr(attrs, "combine", layout.combine);
  optAttr(attrs, "combineBrackets", layout.combineBrackets);
  optAttr(attrs, "vert", layout.vert);
  optAttr(attrs, "vertCompress", layout.vertCompress);
  return wEl("eastAsianLayout", attrs);
}
function serializeRunProperties(props) {
  if (!props) {
    return void 0;
  }
  const ch = children(
    // Style reference
    optValEl("rStyle", props.rStyle),
    // Font properties
    serializeRunFonts(props.rFonts),
    optValEl("sz", props.sz),
    optValEl("szCs", props.szCs),
    // Basic formatting
    toggleEl("b", props.b),
    toggleEl("bCs", props.bCs),
    toggleEl("i", props.i),
    toggleEl("iCs", props.iCs),
    toggleEl("caps", props.caps),
    toggleEl("smallCaps", props.smallCaps),
    toggleEl("strike", props.strike),
    toggleEl("dstrike", props.dstrike),
    toggleEl("outline", props.outline),
    toggleEl("shadow", props.shadow),
    toggleEl("emboss", props.emboss),
    toggleEl("imprint", props.imprint),
    toggleEl("vanish", props.vanish),
    toggleEl("webHidden", props.webHidden),
    // Color and shading
    serializeColor(props.color),
    optValEl("highlight", props.highlight),
    serializeShading(props.shd),
    // Underline
    serializeUnderline(props.u),
    // Spacing and position
    optValEl("spacing", props.spacing),
    optValEl("w", props.w),
    optValEl("kern", props.kern),
    optValEl("position", props.position),
    // Vertical alignment
    optValEl("vertAlign", props.vertAlign),
    // Border
    serializeRunBorder(props.bdr),
    // East Asian
    optValEl("em", props.em),
    serializeEastAsianLayout(props.eastAsianLayout),
    // Complex script
    toggleEl("rtl", props.rtl),
    toggleEl("cs", props.cs)
  );
  if (ch.length === 0) {
    return void 0;
  }
  return wEl("rPr", {}, ch);
}
function serializeRunContent(content) {
  switch (content.type) {
    case "text": {
      const attrs = {};
      if (content.space === "preserve") {
        attrs["xml:space"] = "preserve";
      }
      return wEl("t", attrs, [createText(content.value)]);
    }
    case "tab":
      return wEl("tab");
    case "break": {
      const attrs = {};
      optAttr(attrs, "type", content.breakType);
      optAttr(attrs, "clear", content.clear);
      return wEl("br", attrs);
    }
    case "symbol":
      return wEl("sym", { font: content.font, char: content.char });
    case "fieldChar": {
      const attrs = { fldCharType: content.fldCharType };
      optAttr(attrs, "dirty", content.dirty);
      optAttr(attrs, "fldLock", content.fldLock);
      return wEl("fldChar", attrs);
    }
    case "instrText": {
      const attrs = {};
      if (content.space === "preserve") {
        attrs["xml:space"] = "preserve";
      }
      return wEl("instrText", attrs, [createText(content.value)]);
    }
    case "drawing":
      return void 0;
    default:
      return void 0;
  }
}
function serializeRun(run) {
  const ch = [];
  const rPr = serializeRunProperties(run.properties);
  if (rPr) {
    ch.push(rPr);
  }
  for (const item of run.content) {
    const node = serializeRunContent(item);
    if (node) {
      ch.push(node);
    }
  }
  return wEl("r", {}, ch);
}
function serializePageSize(pgSz) {
  if (!pgSz) {
    return void 0;
  }
  const attrs = {
    w: String(pgSz.w),
    h: String(pgSz.h)
  };
  optAttr(attrs, "orient", pgSz.orient);
  optAttr(attrs, "code", pgSz.code);
  return wEl("pgSz", attrs);
}
function serializePageMargins(pgMar) {
  if (!pgMar) {
    return void 0;
  }
  const attrs = {
    top: String(pgMar.top),
    right: String(pgMar.right),
    bottom: String(pgMar.bottom),
    left: String(pgMar.left)
  };
  optAttr(attrs, "header", pgMar.header);
  optAttr(attrs, "footer", pgMar.footer);
  optAttr(attrs, "gutter", pgMar.gutter);
  return wEl("pgMar", attrs);
}
function serializePageBorderEdge(localName2, edge) {
  if (!edge) {
    return void 0;
  }
  const attrs = { val: edge.val };
  optAttr(attrs, "sz", edge.sz);
  optAttr(attrs, "space", edge.space);
  optAttr(attrs, "color", edge.color);
  optAttr(attrs, "themeColor", edge.themeColor);
  optAttr(attrs, "shadow", edge.shadow);
  optAttr(attrs, "frame", edge.frame);
  return wEl(localName2, attrs);
}
function serializePageBorders(pgBorders) {
  if (!pgBorders) {
    return void 0;
  }
  const attrs = {};
  optAttr(attrs, "display", pgBorders.display);
  optAttr(attrs, "offsetFrom", pgBorders.offsetFrom);
  optAttr(attrs, "zOrder", pgBorders.zOrder);
  const ch = children(
    serializePageBorderEdge("top", pgBorders.top),
    serializePageBorderEdge("left", pgBorders.left),
    serializePageBorderEdge("bottom", pgBorders.bottom),
    serializePageBorderEdge("right", pgBorders.right)
  );
  return wEl("pgBorders", attrs, ch);
}
function serializeColumns(cols) {
  if (!cols) {
    return void 0;
  }
  const attrs = {};
  optAttr(attrs, "num", cols.num);
  optAttr(attrs, "equalWidth", cols.equalWidth);
  optAttr(attrs, "space", cols.space);
  optAttr(attrs, "sep", cols.sep);
  const ch = [];
  if (cols.col) {
    for (const col of cols.col) {
      const colAttrs = {};
      optAttr(colAttrs, "w", col.w);
      optAttr(colAttrs, "space", col.space);
      ch.push(wEl("col", colAttrs));
    }
  }
  return wEl("cols", attrs, ch);
}
function serializeHeaderFooterRefs(tagName, refs) {
  if (!refs) {
    return [];
  }
  return refs.map((ref) => wEl(tagName, { type: ref.type, "r:id": String(ref.rId) }));
}
function serializeLineNumbering(lnNumType) {
  if (!lnNumType) {
    return void 0;
  }
  const attrs = {};
  optAttr(attrs, "countBy", lnNumType.countBy);
  optAttr(attrs, "start", lnNumType.start);
  optAttr(attrs, "restart", lnNumType.restart);
  optAttr(attrs, "distance", lnNumType.distance);
  return wEl("lnNumType", attrs);
}
function serializePageNumberType(pgNumType) {
  if (!pgNumType) {
    return void 0;
  }
  const attrs = {};
  optAttr(attrs, "fmt", pgNumType.fmt);
  optAttr(attrs, "start", pgNumType.start);
  optAttr(attrs, "chapStyle", pgNumType.chapStyle);
  optAttr(attrs, "chapSep", pgNumType.chapSep);
  return wEl("pgNumType", attrs);
}
function serializeDocGrid(docGrid) {
  if (!docGrid) {
    return void 0;
  }
  const attrs = {};
  optAttr(attrs, "type", docGrid.type);
  optAttr(attrs, "linePitch", docGrid.linePitch);
  optAttr(attrs, "charSpace", docGrid.charSpace);
  return wEl("docGrid", attrs);
}
function serializeNotePr(localName2, notePr) {
  if (!notePr) {
    return void 0;
  }
  const ch = children(
    notePr.pos ? valEl("pos", notePr.pos) : void 0,
    notePr.numFmt ? valEl("numFmt", notePr.numFmt) : void 0,
    notePr.numStart !== void 0 ? valEl("numStart", String(notePr.numStart)) : void 0,
    notePr.numRestart ? valEl("numRestart", notePr.numRestart) : void 0
  );
  return wEl(localName2, {}, ch);
}
function serializeSectionProperties(sectPr) {
  if (!sectPr) {
    return void 0;
  }
  const ch = [
    ...serializeHeaderFooterRefs("headerReference", sectPr.headerReference),
    ...serializeHeaderFooterRefs("footerReference", sectPr.footerReference),
    ...children(
      sectPr.type ? valEl("type", sectPr.type) : void 0,
      serializePageSize(sectPr.pgSz),
      serializePageMargins(sectPr.pgMar),
      serializePageBorders(sectPr.pgBorders),
      serializeColumns(sectPr.cols),
      sectPr.titlePg ? wEl("titlePg") : void 0,
      serializeLineNumbering(sectPr.lnNumType),
      serializePageNumberType(sectPr.pgNumType),
      serializeDocGrid(sectPr.docGrid),
      sectPr.bidi ? wEl("bidi") : void 0,
      sectPr.rtlGutter ? wEl("rtlGutter") : void 0,
      sectPr.textDirection ? valEl("textDirection", sectPr.textDirection) : void 0,
      sectPr.vAlign ? valEl("vAlign", sectPr.vAlign) : void 0,
      serializeNotePr("footnotePr", sectPr.footnotePr),
      serializeNotePr("endnotePr", sectPr.endnotePr),
      sectPr.noEndnote ? wEl("noEndnote") : void 0
    )
  ];
  return wEl("sectPr", {}, ch);
}
function serializeSpacing(spacing) {
  if (!spacing) {
    return void 0;
  }
  const attrs = {};
  optAttr(attrs, "before", spacing.before);
  optAttr(attrs, "beforeAutospacing", spacing.beforeAutospacing);
  optAttr(attrs, "after", spacing.after);
  optAttr(attrs, "afterAutospacing", spacing.afterAutospacing);
  optAttr(attrs, "line", spacing.line);
  optAttr(attrs, "lineRule", spacing.lineRule);
  optAttr(attrs, "beforeLines", spacing.beforeLines);
  optAttr(attrs, "afterLines", spacing.afterLines);
  if (Object.keys(attrs).length === 0) {
    return void 0;
  }
  return wEl("spacing", attrs);
}
function serializeIndent(ind) {
  if (!ind) {
    return void 0;
  }
  const attrs = {};
  optAttr(attrs, "left", ind.left);
  optAttr(attrs, "leftChars", ind.leftChars);
  optAttr(attrs, "right", ind.right);
  optAttr(attrs, "rightChars", ind.rightChars);
  optAttr(attrs, "firstLine", ind.firstLine);
  optAttr(attrs, "firstLineChars", ind.firstLineChars);
  optAttr(attrs, "hanging", ind.hanging);
  optAttr(attrs, "hangingChars", ind.hangingChars);
  optAttr(attrs, "start", ind.start);
  optAttr(attrs, "startChars", ind.startChars);
  optAttr(attrs, "end", ind.end);
  optAttr(attrs, "endChars", ind.endChars);
  if (Object.keys(attrs).length === 0) {
    return void 0;
  }
  return wEl("ind", attrs);
}
function serializeParagraphBorderEdge(localName2, edge) {
  if (!edge) {
    return void 0;
  }
  const attrs = { val: edge.val };
  optAttr(attrs, "sz", edge.sz);
  optAttr(attrs, "space", edge.space);
  optAttr(attrs, "color", edge.color);
  optAttr(attrs, "themeColor", edge.themeColor);
  optAttr(attrs, "shadow", edge.shadow);
  optAttr(attrs, "frame", edge.frame);
  return wEl(localName2, attrs);
}
function serializeParagraphBorders(pBdr) {
  if (!pBdr) {
    return void 0;
  }
  const ch = children(
    serializeParagraphBorderEdge("top", pBdr.top),
    serializeParagraphBorderEdge("left", pBdr.left),
    serializeParagraphBorderEdge("bottom", pBdr.bottom),
    serializeParagraphBorderEdge("right", pBdr.right),
    serializeParagraphBorderEdge("between", pBdr.between),
    serializeParagraphBorderEdge("bar", pBdr.bar)
  );
  if (ch.length === 0) {
    return void 0;
  }
  return wEl("pBdr", {}, ch);
}
function serializeTabStops(tabs) {
  if (!tabs || tabs.tabs.length === 0) {
    return void 0;
  }
  const ch = tabs.tabs.map((tab) => {
    const attrs = {
      val: tab.val,
      pos: String(tab.pos)
    };
    optAttr(attrs, "leader", tab.leader);
    return wEl("tab", attrs);
  });
  return wEl("tabs", {}, ch);
}
function serializeNumberingProperties(numPr) {
  if (!numPr) {
    return void 0;
  }
  const ch = children(optValEl("ilvl", numPr.ilvl), optValEl("numId", numPr.numId));
  if (ch.length === 0) {
    return void 0;
  }
  return wEl("numPr", {}, ch);
}
function serializeFrameProperties(framePr) {
  if (!framePr) {
    return void 0;
  }
  const attrs = {};
  optAttr(attrs, "w", framePr.w);
  optAttr(attrs, "h", framePr.h);
  optAttr(attrs, "hRule", framePr.hRule);
  optAttr(attrs, "hAnchor", framePr.hAnchor);
  optAttr(attrs, "vAnchor", framePr.vAnchor);
  optAttr(attrs, "x", framePr.x);
  optAttr(attrs, "xAlign", framePr.xAlign);
  optAttr(attrs, "y", framePr.y);
  optAttr(attrs, "yAlign", framePr.yAlign);
  optAttr(attrs, "hSpace", framePr.hSpace);
  optAttr(attrs, "vSpace", framePr.vSpace);
  optAttr(attrs, "wrap", framePr.wrap);
  optAttr(attrs, "dropCap", framePr.dropCap);
  optAttr(attrs, "lines", framePr.lines);
  optAttr(attrs, "anchorLock", framePr.anchorLock);
  return wEl("framePr", attrs);
}
function serializeParagraphProperties(props) {
  if (!props) {
    return void 0;
  }
  const ch = children(
    // Style reference
    optValEl("pStyle", props.pStyle),
    // Page/column break control
    toggleEl("keepNext", props.keepNext),
    toggleEl("keepLines", props.keepLines),
    toggleEl("pageBreakBefore", props.pageBreakBefore),
    // Frame properties
    serializeFrameProperties(props.framePr),
    // Widow control
    toggleEl("widowControl", props.widowControl),
    // Numbering
    serializeNumberingProperties(props.numPr),
    // Suppress
    toggleEl("suppressLineNumbers", props.suppressLineNumbers),
    toggleEl("suppressAutoHyphens", props.suppressAutoHyphens),
    // Borders and shading
    serializeParagraphBorders(props.pBdr),
    serializeShading(props.shd),
    // Tab stops
    serializeTabStops(props.tabs),
    // Spacing and indentation
    serializeSpacing(props.spacing),
    serializeIndent(props.ind),
    // East Asian text handling
    toggleEl("kinsoku", props.kinsoku),
    toggleEl("wordWrap", props.wordWrap),
    toggleEl("overflowPunct", props.overflowPunct),
    toggleEl("topLinePunct", props.topLinePunct),
    toggleEl("autoSpaceDE", props.autoSpaceDE),
    toggleEl("autoSpaceDN", props.autoSpaceDN),
    // Bidirectional
    toggleEl("bidi", props.bidi),
    // Alignment
    optValEl("jc", props.jc),
    optValEl("textDirection", props.textDirection),
    optValEl("textAlignment", props.textAlignment),
    // Contextual spacing
    toggleEl("contextualSpacing", props.contextualSpacing),
    // Mirror indents
    toggleEl("mirrorIndents", props.mirrorIndents),
    // Outline level
    optValEl("outlineLvl", props.outlineLvl),
    // Default run properties
    serializeRunProperties(props.rPr),
    // Section properties
    serializeSectionProperties(props.sectPr)
  );
  if (ch.length === 0) {
    return void 0;
  }
  return wEl("pPr", {}, ch);
}
function serializeHyperlink(hyperlink) {
  const attrs = {};
  if (hyperlink.rId) {
    attrs["r:id"] = String(hyperlink.rId);
  }
  optAttr(attrs, "anchor", hyperlink.anchor);
  optAttr(attrs, "tooltip", hyperlink.tooltip);
  optAttr(attrs, "tgtFrame", hyperlink.tgtFrame);
  optAttr(attrs, "history", hyperlink.history);
  const ch = hyperlink.content.map(serializeRun);
  return wEl("hyperlink", attrs, ch);
}
function serializeBookmarkStart(bm) {
  return wEl("bookmarkStart", { id: String(bm.id), name: bm.name });
}
function serializeBookmarkEnd(bm) {
  return wEl("bookmarkEnd", { id: String(bm.id) });
}
function serializeSimpleField(field) {
  const attrs = { instr: field.instr };
  optAttr(attrs, "dirty", field.dirty);
  const ch = field.content.map(serializeRun);
  return wEl("fldSimple", attrs, ch);
}
function serializeParagraphContent(content) {
  switch (content.type) {
    case "run":
      return serializeRun(content);
    case "hyperlink":
      return serializeHyperlink(content);
    case "bookmarkStart":
      return serializeBookmarkStart(content);
    case "bookmarkEnd":
      return serializeBookmarkEnd(content);
    case "simpleField":
      return serializeSimpleField(content);
    case "ins":
    case "del":
    case "moveFrom":
    case "moveTo": {
      const tagName = content.type;
      const attrs = { id: content.revision.id };
      optAttr(attrs, "author", content.revision.author);
      optAttr(attrs, "date", content.revision.date);
      const ch = content.content.map(serializeRun);
      return wEl(tagName, attrs, ch);
    }
    case "moveFromRangeStart":
    case "moveToRangeStart": {
      const tagName = content.type === "moveFromRangeStart" ? "moveFromRangeStart" : "moveToRangeStart";
      const attrs = { id: String(content.id) };
      optAttr(attrs, "name", content.name);
      return wEl(tagName, attrs);
    }
    case "moveFromRangeEnd":
    case "moveToRangeEnd": {
      const tagName = content.type === "moveFromRangeEnd" ? "moveFromRangeEnd" : "moveToRangeEnd";
      return wEl(tagName, { id: String(content.id) });
    }
    case "sdt": {
      const ch = [];
      if (content.properties) {
        const prCh = children(
          optValEl("alias", content.properties.alias),
          optValEl("tag", content.properties.tag),
          optValEl("id", content.properties.id),
          optValEl("lock", content.properties.lock)
        );
        if (prCh.length > 0) {
          ch.push(wEl("sdtPr", {}, prCh));
        }
      }
      if (content.content.length > 0) {
        ch.push(wEl("sdtContent", {}, content.content.map(serializeRun)));
      }
      return wEl("sdt", {}, ch);
    }
    default:
      return void 0;
  }
}
function serializeParagraph(paragraph) {
  const ch = [];
  const pPr = serializeParagraphProperties(paragraph.properties);
  if (pPr) {
    ch.push(pPr);
  }
  for (const item of paragraph.content) {
    const node = serializeParagraphContent(item);
    if (node) {
      ch.push(node);
    }
  }
  return wEl("p", {}, ch);
}
function serializeTableWidth(width, elementName) {
  const attrs = {};
  optAttr(attrs, "w", width.value);
  optAttr(attrs, "type", width.type);
  return wEl(elementName, attrs);
}
function serializeBorderEdge(border, name) {
  const attrs = {};
  optAttr(attrs, "val", border.val);
  optAttr(attrs, "sz", border.sz);
  optAttr(attrs, "space", border.space);
  optAttr(attrs, "color", border.color);
  optAttr(attrs, "themeColor", border.themeColor);
  optAttr(attrs, "shadow", border.shadow);
  optAttr(attrs, "frame", border.frame);
  return wEl(name, attrs);
}
function serializeTableBorders(borders) {
  return wEl(
    "tblBorders",
    {},
    children(
      borders.top ? serializeBorderEdge(borders.top, "top") : void 0,
      borders.left ? serializeBorderEdge(borders.left, "left") : void 0,
      borders.bottom ? serializeBorderEdge(borders.bottom, "bottom") : void 0,
      borders.right ? serializeBorderEdge(borders.right, "right") : void 0,
      borders.insideH ? serializeBorderEdge(borders.insideH, "insideH") : void 0,
      borders.insideV ? serializeBorderEdge(borders.insideV, "insideV") : void 0
    )
  );
}
function serializeCellBorders(borders) {
  return wEl(
    "tcBorders",
    {},
    children(
      borders.top ? serializeBorderEdge(borders.top, "top") : void 0,
      borders.left ? serializeBorderEdge(borders.left, "left") : void 0,
      borders.bottom ? serializeBorderEdge(borders.bottom, "bottom") : void 0,
      borders.right ? serializeBorderEdge(borders.right, "right") : void 0,
      borders.insideH ? serializeBorderEdge(borders.insideH, "insideH") : void 0,
      borders.insideV ? serializeBorderEdge(borders.insideV, "insideV") : void 0,
      borders.tl2br ? serializeBorderEdge(borders.tl2br, "tl2br") : void 0,
      borders.tr2bl ? serializeBorderEdge(borders.tr2bl, "tr2bl") : void 0
    )
  );
}
function serializeCellMargins(margins, elementName) {
  return wEl(
    elementName,
    {},
    children(
      margins.top !== void 0 ? wEl("top", { w: String(margins.top), type: "dxa" }) : void 0,
      margins.left !== void 0 ? wEl("left", { w: String(margins.left), type: "dxa" }) : void 0,
      margins.bottom !== void 0 ? wEl("bottom", { w: String(margins.bottom), type: "dxa" }) : void 0,
      margins.right !== void 0 ? wEl("right", { w: String(margins.right), type: "dxa" }) : void 0
    )
  );
}
function serializeTableProperties(props) {
  if (!props) {
    return void 0;
  }
  const ch = [];
  if (props.tblStyle) {
    ch.push(wEl("tblStyle", { val: String(props.tblStyle) }));
  }
  if (props.tblpPr) {
    const attrs = {};
    optAttr(attrs, "leftFromText", props.tblpPr.leftFromText);
    optAttr(attrs, "rightFromText", props.tblpPr.rightFromText);
    optAttr(attrs, "topFromText", props.tblpPr.topFromText);
    optAttr(attrs, "bottomFromText", props.tblpPr.bottomFromText);
    optAttr(attrs, "vertAnchor", props.tblpPr.vertAnchor);
    optAttr(attrs, "horzAnchor", props.tblpPr.horzAnchor);
    optAttr(attrs, "tblpX", props.tblpPr.tblpX);
    optAttr(attrs, "tblpXSpec", props.tblpPr.tblpXSpec);
    optAttr(attrs, "tblpY", props.tblpPr.tblpY);
    optAttr(attrs, "tblpYSpec", props.tblpPr.tblpYSpec);
    ch.push(wEl("tblpPr", attrs));
  }
  const bidiVisual = toggleEl("bidiVisual", props.bidiVisual);
  if (bidiVisual) {
    ch.push(bidiVisual);
  }
  const tblOverlap = optValEl("tblOverlap", props.tblOverlap);
  if (tblOverlap) {
    ch.push(tblOverlap);
  }
  if (props.tblW) {
    ch.push(serializeTableWidth(props.tblW, "tblW"));
  }
  const jc = optValEl("jc", props.jc);
  if (jc) {
    ch.push(jc);
  }
  if (props.tblCellSpacing) {
    ch.push(serializeCellSpacing(props.tblCellSpacing, "tblCellSpacing"));
  }
  if (props.tblInd) {
    ch.push(serializeTableWidth(props.tblInd, "tblInd"));
  }
  if (props.tblBorders) {
    ch.push(serializeTableBorders(props.tblBorders));
  }
  const shd = serializeShading(props.shd);
  if (shd) {
    ch.push(shd);
  }
  if (props.tblLayout) {
    ch.push(wEl("tblLayout", { type: props.tblLayout }));
  }
  if (props.tblCellMar) {
    ch.push(serializeCellMargins(props.tblCellMar, "tblCellMar"));
  }
  if (props.tblLook) {
    const lookAttrs = {};
    optAttr(lookAttrs, "firstRow", props.tblLook.firstRow);
    optAttr(lookAttrs, "lastRow", props.tblLook.lastRow);
    optAttr(lookAttrs, "firstColumn", props.tblLook.firstColumn);
    optAttr(lookAttrs, "lastColumn", props.tblLook.lastColumn);
    optAttr(lookAttrs, "noHBand", props.tblLook.noHBand);
    optAttr(lookAttrs, "noVBand", props.tblLook.noVBand);
    ch.push(wEl("tblLook", lookAttrs));
  }
  const tblCaption = optValEl("tblCaption", props.tblCaption);
  if (tblCaption) {
    ch.push(tblCaption);
  }
  const tblDescription = optValEl("tblDescription", props.tblDescription);
  if (tblDescription) {
    ch.push(tblDescription);
  }
  return ch.length > 0 ? wEl("tblPr", {}, ch) : void 0;
}
function serializeCellSpacing(spacing, elementName) {
  const attrs = {};
  optAttr(attrs, "w", spacing.w);
  optAttr(attrs, "type", spacing.type);
  return wEl(elementName, attrs);
}
function serializeTableGrid(grid) {
  const cols = grid.columns.map((col) => wEl("gridCol", { w: String(col.width) }));
  return wEl("tblGrid", {}, cols);
}
function serializeTableRowProperties(props) {
  if (!props) {
    return void 0;
  }
  const ch = [];
  if (props.gridBefore !== void 0) {
    ch.push(wEl("gridBefore", { val: String(props.gridBefore) }));
  }
  if (props.gridAfter !== void 0) {
    ch.push(wEl("gridAfter", { val: String(props.gridAfter) }));
  }
  if (props.wBefore) {
    ch.push(serializeTableWidth(props.wBefore, "wBefore"));
  }
  if (props.wAfter) {
    ch.push(serializeTableWidth(props.wAfter, "wAfter"));
  }
  if (props.trHeight) {
    const attrs = {};
    optAttr(attrs, "val", props.trHeight.val);
    optAttr(attrs, "hRule", props.trHeight.hRule);
    ch.push(wEl("trHeight", attrs));
  }
  const tblHeader = toggleEl("tblHeader", props.tblHeader);
  if (tblHeader) {
    ch.push(tblHeader);
  }
  const jc = optValEl("jc", props.jc);
  if (jc) {
    ch.push(jc);
  }
  const hidden = toggleEl("hidden", props.hidden);
  if (hidden) {
    ch.push(hidden);
  }
  const cantSplit = toggleEl("cantSplit", props.cantSplit);
  if (cantSplit) {
    ch.push(cantSplit);
  }
  return ch.length > 0 ? wEl("trPr", {}, ch) : void 0;
}
function serializeTableCellProperties(props) {
  if (!props) {
    return void 0;
  }
  const ch = [];
  if (props.tcW) {
    const attrs = {};
    optAttr(attrs, "w", props.tcW.value);
    optAttr(attrs, "type", props.tcW.type);
    ch.push(wEl("tcW", attrs));
  }
  if (props.gridSpan !== void 0) {
    ch.push(wEl("gridSpan", { val: String(props.gridSpan) }));
  }
  const hMerge = optValEl("hMerge", props.hMerge);
  if (hMerge) {
    ch.push(hMerge);
  }
  const vMerge = optValEl("vMerge", props.vMerge);
  if (vMerge) {
    ch.push(vMerge);
  }
  if (props.tcBorders) {
    ch.push(serializeCellBorders(props.tcBorders));
  }
  const shd = serializeShading(props.shd);
  if (shd) {
    ch.push(shd);
  }
  const noWrap = toggleEl("noWrap", props.noWrap);
  if (noWrap) {
    ch.push(noWrap);
  }
  if (props.tcMar) {
    ch.push(serializeCellMargins(props.tcMar, "tcMar"));
  }
  const textDirection = optValEl("textDirection", props.textDirection);
  if (textDirection) {
    ch.push(textDirection);
  }
  const tcFitText = toggleEl("tcFitText", props.tcFitText);
  if (tcFitText) {
    ch.push(tcFitText);
  }
  const vAlign = optValEl("vAlign", props.vAlign);
  if (vAlign) {
    ch.push(vAlign);
  }
  const hideMark = toggleEl("hideMark", props.hideMark);
  if (hideMark) {
    ch.push(hideMark);
  }
  return ch.length > 0 ? wEl("tcPr", {}, ch) : void 0;
}
function serializeTableCell(cell) {
  const ch = [];
  const tcPr = serializeTableCellProperties(cell.properties);
  if (tcPr) {
    ch.push(tcPr);
  }
  for (const content of cell.content) {
    switch (content.type) {
      case "paragraph":
        ch.push(serializeParagraph(content));
        break;
      case "table":
        ch.push(serializeTable(content));
        break;
    }
  }
  return wEl("tc", {}, ch);
}
function serializeTableRow(row) {
  const ch = [];
  const trPr = serializeTableRowProperties(row.properties);
  if (trPr) {
    ch.push(trPr);
  }
  for (const cell of row.cells) {
    ch.push(serializeTableCell(cell));
  }
  return wEl("tr", {}, ch);
}
function serializeTable(table) {
  const ch = [];
  const tblPr = serializeTableProperties(table.properties);
  if (tblPr) {
    ch.push(tblPr);
  }
  if (table.grid) {
    ch.push(serializeTableGrid(table.grid));
  }
  for (const row of table.rows) {
    ch.push(serializeTableRow(row));
  }
  return wEl("tbl", {}, ch);
}
function serializeBlockContent$1(content) {
  switch (content.type) {
    case "paragraph":
      return serializeParagraph(content);
    case "table":
      return serializeTable(content);
    case "sectionBreak":
      return void 0;
  }
}
function serializeBody(body) {
  const ch = [];
  for (const content of body.content) {
    const node = serializeBlockContent$1(content);
    if (node) {
      ch.push(node);
    }
  }
  const sectPr = serializeSectionProperties(body.sectPr);
  if (sectPr) {
    ch.push(sectPr);
  }
  return wEl("body", {}, ch);
}
function serializeDocument2(document) {
  return createElement(
    "w:document",
    {
      "xmlns:w": NS_WORDPROCESSINGML,
      "xmlns:r": NS_RELATIONSHIPS
    },
    [serializeBody(document.body)]
  );
}
function serializeDocDefaults(docDefaults) {
  if (!docDefaults) {
    return void 0;
  }
  const ch = [];
  if (docDefaults.rPrDefault) {
    const rPr = serializeRunProperties(docDefaults.rPrDefault.rPr);
    ch.push(wEl("rPrDefault", {}, rPr ? [rPr] : []));
  }
  if (docDefaults.pPrDefault) {
    const pPr = serializeParagraphProperties(docDefaults.pPrDefault.pPr);
    ch.push(wEl("pPrDefault", {}, pPr ? [pPr] : []));
  }
  if (ch.length === 0) {
    return void 0;
  }
  return wEl("docDefaults", {}, ch);
}
function serializeLatentStyleException(exc) {
  const attrs = { name: exc.name };
  optAttr(attrs, "locked", exc.locked);
  optAttr(attrs, "uiPriority", exc.uiPriority);
  optAttr(attrs, "semiHidden", exc.semiHidden);
  optAttr(attrs, "unhideWhenUsed", exc.unhideWhenUsed);
  optAttr(attrs, "qFormat", exc.qFormat);
  return wEl("lsdException", attrs);
}
function serializeLatentStyles(latentStyles) {
  if (!latentStyles) {
    return void 0;
  }
  const attrs = {};
  optAttr(attrs, "defLockedState", latentStyles.defLockedState);
  optAttr(attrs, "defUIPriority", latentStyles.defUIPriority);
  optAttr(attrs, "defSemiHidden", latentStyles.defSemiHidden);
  optAttr(attrs, "defUnhideWhenUsed", latentStyles.defUnhideWhenUsed);
  optAttr(attrs, "defQFormat", latentStyles.defQFormat);
  optAttr(attrs, "count", latentStyles.count);
  const ch = [];
  if (latentStyles.lsdException) {
    for (const exc of latentStyles.lsdException) {
      ch.push(serializeLatentStyleException(exc));
    }
  }
  return wEl("latentStyles", attrs, ch);
}
function serializeTableStylePr(tblStylePr) {
  const ch = children(
    serializeRunProperties(tblStylePr.rPr),
    serializeParagraphProperties(tblStylePr.pPr)
    // tcPr not yet implemented
  );
  return wEl("tblStylePr", { type: tblStylePr.type }, ch);
}
function serializeStyle(style) {
  const attrs = {
    type: style.type,
    styleId: String(style.styleId)
  };
  optAttr(attrs, "default", style.default);
  optAttr(attrs, "customStyle", style.customStyle);
  const ch = children(
    style.name ? valEl("name", style.name.val) : void 0,
    style.aliases ? valEl("aliases", style.aliases.val) : void 0,
    style.basedOn ? valEl("basedOn", String(style.basedOn.val)) : void 0,
    style.next ? valEl("next", String(style.next.val)) : void 0,
    style.link ? valEl("link", String(style.link.val)) : void 0,
    style.uiPriority ? valEl("uiPriority", String(style.uiPriority.val)) : void 0,
    style.semiHidden ? wEl("semiHidden") : void 0,
    style.unhideWhenUsed ? wEl("unhideWhenUsed") : void 0,
    style.qFormat ? wEl("qFormat") : void 0,
    style.locked ? wEl("locked") : void 0,
    style.personal ? wEl("personal") : void 0,
    style.personalReply ? wEl("personalReply") : void 0,
    style.personalCompose ? wEl("personalCompose") : void 0,
    serializeParagraphProperties(style.pPr),
    serializeRunProperties(style.rPr)
    // tblPr, trPr, tcPr not yet implemented
  );
  if (style.tblStylePr) {
    for (const tsp of style.tblStylePr) {
      ch.push(serializeTableStylePr(tsp));
    }
  }
  return wEl("style", attrs, ch);
}
function serializeStyles(styles) {
  const ch = [];
  const docDefaults = serializeDocDefaults(styles.docDefaults);
  if (docDefaults) {
    ch.push(docDefaults);
  }
  const latentStyles = serializeLatentStyles(styles.latentStyles);
  if (latentStyles) {
    ch.push(latentStyles);
  }
  for (const style of styles.style) {
    ch.push(serializeStyle(style));
  }
  return createElement(
    "w:styles",
    {
      "xmlns:w": NS_WORDPROCESSINGML,
      "xmlns:r": NS_RELATIONSHIPS
    },
    ch
  );
}
function serializeLegacy(legacy) {
  if (!legacy) {
    return void 0;
  }
  const attrs = {};
  optAttr(attrs, "legacy", legacy.legacy);
  optAttr(attrs, "legacySpace", legacy.legacySpace);
  optAttr(attrs, "legacyIndent", legacy.legacyIndent);
  return wEl("legacy", attrs);
}
function serializeLvlText(lvlText) {
  if (!lvlText) {
    return void 0;
  }
  const attrs = { val: lvlText.val };
  optAttr(attrs, "null", lvlText.null);
  return wEl("lvlText", attrs);
}
function serializeLevel(lvl) {
  const ch = children(
    optValEl("start", lvl.start),
    optValEl("numFmt", lvl.numFmt),
    optValEl("lvlRestart", lvl.lvlRestart),
    optValEl("pStyle", lvl.pStyle),
    lvl.isLgl ? wEl("isLgl") : void 0,
    optValEl("suff", lvl.suff),
    serializeLvlText(lvl.lvlText),
    optValEl("lvlJc", lvl.lvlJc),
    lvl.lvlPicBulletId ? valEl("lvlPicBulletId", String(lvl.lvlPicBulletId.numPicBulletId)) : void 0,
    serializeLegacy(lvl.legacy),
    serializeParagraphProperties(lvl.pPr),
    serializeRunProperties(lvl.rPr)
  );
  return wEl("lvl", { ilvl: String(lvl.ilvl) }, ch);
}
function serializeAbstractNum(abstractNum) {
  const ch = children(
    optValEl("nsid", abstractNum.nsid),
    optValEl("multiLevelType", abstractNum.multiLevelType),
    optValEl("tmpl", abstractNum.tmpl),
    optValEl("styleLink", abstractNum.styleLink),
    optValEl("numStyleLink", abstractNum.numStyleLink)
  );
  for (const lvl of abstractNum.lvl) {
    ch.push(serializeLevel(lvl));
  }
  return wEl("abstractNum", { abstractNumId: String(abstractNum.abstractNumId) }, ch);
}
function serializeLevelOverride(override) {
  const ch = children(
    optValEl("startOverride", override.startOverride),
    override.lvl ? serializeLevel(override.lvl) : void 0
  );
  return wEl("lvlOverride", { ilvl: String(override.ilvl) }, ch);
}
function serializeNum(num) {
  const ch = [valEl("abstractNumId", String(num.abstractNumId))];
  if (num.lvlOverride) {
    for (const override of num.lvlOverride) {
      ch.push(serializeLevelOverride(override));
    }
  }
  return wEl("num", { numId: String(num.numId) }, ch);
}
function serializeNumbering(numbering) {
  const ch = [];
  for (const abstractNum of numbering.abstractNum) {
    ch.push(serializeAbstractNum(abstractNum));
  }
  for (const num of numbering.num) {
    ch.push(serializeNum(num));
  }
  return createElement(
    "w:numbering",
    {
      "xmlns:w": NS_WORDPROCESSINGML,
      "xmlns:r": NS_RELATIONSHIPS
    },
    ch
  );
}
function getRootElement(content) {
  const doc = parseXml(content);
  for (const child of doc.children) {
    if (isXmlElement(child)) {
      return child;
    }
  }
  throw new Error("No root element found in XML");
}
function resolveDocumentPath(pkg) {
  const relsContent = pkg.readText(DEFAULT_PART_PATHS.rootRels);
  if (!relsContent) {
    throw new Error("Cannot find root relationships file");
  }
  const relsRoot = getRootElement(relsContent);
  for (const node of relsRoot.children) {
    if (!isXmlElement(node)) {
      continue;
    }
    if (node.attrs.Type === RELATIONSHIP_TYPES.officeDocument) {
      const target = node.attrs.Target;
      if (target) {
        return target.startsWith("/") ? target.slice(1) : target;
      }
    }
  }
  throw new Error("Cannot find main document relationship");
}
function getDocumentRelsPath(documentPath) {
  const dir = documentPath.substring(0, documentPath.lastIndexOf("/"));
  const fileName = documentPath.split("/").pop();
  return `${dir}/_rels/${fileName}.rels`;
}
function resolvePartPath(documentPath, relTarget) {
  if (relTarget.startsWith("/")) {
    return relTarget.slice(1);
  }
  const dir = documentPath.substring(0, documentPath.lastIndexOf("/"));
  return `${dir}/${relTarget}`;
}
function findRelTarget(pkg, relsPath, relType) {
  const content = pkg.readText(relsPath);
  if (!content) {
    return void 0;
  }
  const root = getRootElement(content);
  for (const node of root.children) {
    if (!isXmlElement(node)) {
      continue;
    }
    if (node.attrs.Type === relType) {
      return node.attrs.Target;
    }
  }
  return void 0;
}
function resolvePartPathWithDefault(documentPath, relTarget, defaultName) {
  if (relTarget) {
    return resolvePartPath(documentPath, relTarget);
  }
  return `${documentPath.substring(0, documentPath.lastIndexOf("/"))}/${defaultName}`;
}
function classifyPatches(patches) {
  const contentPatches = [];
  const textReplacePatches = [];
  const stylesPatches = [];
  const numberingPatches = [];
  const sectionPatches = [];
  for (const patch of patches) {
    switch (patch.type) {
      case "content.append":
      case "content.insert":
      case "content.delete":
      case "content.replace":
        contentPatches.push(patch);
        break;
      case "text.replace":
        textReplacePatches.push(patch);
        break;
      case "styles.append":
        stylesPatches.push(patch);
        break;
      case "numbering.append":
        numberingPatches.push(patch);
        break;
      case "section.update":
        sectionPatches.push(patch);
        break;
      default: {
        const _exhaustive = patch;
        throw new Error(`Unknown patch type: ${_exhaustive.type}`);
      }
    }
  }
  return { contentPatches, textReplacePatches, stylesPatches, numberingPatches, sectionPatches };
}
function applyContentPatches(content, patches) {
  const result = [...content];
  for (const patch of patches) {
    switch (patch.type) {
      case "content.append": {
        const newContent = patch.content.map(convertBlockContent);
        result.push(...newContent);
        break;
      }
      case "content.insert": {
        if (patch.index < 0 || patch.index > result.length) {
          throw new Error(`content.insert: index ${patch.index} is out of range [0, ${result.length}]`);
        }
        const newContent = patch.content.map(convertBlockContent);
        result.splice(patch.index, 0, ...newContent);
        break;
      }
      case "content.delete": {
        const count = patch.count ?? 1;
        if (patch.index < 0 || patch.index >= result.length) {
          throw new Error(`content.delete: index ${patch.index} is out of range [0, ${result.length - 1}]`);
        }
        if (patch.index + count > result.length) {
          throw new Error(`content.delete: index ${patch.index} + count ${count} exceeds content length ${result.length}`);
        }
        result.splice(patch.index, count);
        break;
      }
      case "content.replace": {
        const count = patch.count ?? 1;
        if (patch.index < 0 || patch.index >= result.length) {
          throw new Error(`content.replace: index ${patch.index} is out of range [0, ${result.length - 1}]`);
        }
        if (patch.index + count > result.length) {
          throw new Error(`content.replace: index ${patch.index} + count ${count} exceeds content length ${result.length}`);
        }
        const newContent = patch.content.map(convertBlockContent);
        result.splice(patch.index, count, ...newContent);
        break;
      }
      default: {
        const _exhaustive = patch;
        throw new Error(`Unknown content patch type: ${_exhaustive.type}`);
      }
    }
  }
  return result;
}
function replaceTextContent(opts, value) {
  if (opts.replaceAll) {
    return value.includes(opts.search) ? value.split(opts.search).join(opts.replace) : void 0;
  }
  const idx = value.indexOf(opts.search);
  return idx !== -1 ? value.slice(0, idx) + opts.replace + value.slice(idx + opts.search.length) : void 0;
}
function replaceTextInRun(opts, run) {
  const newContent = run.content.map((c) => {
    if (c.type !== "text") {
      return c;
    }
    const replaced = replaceTextContent(opts, c.value);
    return replaced !== void 0 ? { ...c, value: replaced } : c;
  });
  const changed = newContent.some((c, i) => c !== run.content[i]);
  return changed ? { ...run, content: newContent } : run;
}
function replaceTextInRunContainer(opts, container) {
  const newContent = container.content.map((run) => replaceTextInRun(opts, run));
  const changed = newContent.some((r, i) => r !== container.content[i]);
  return changed ? { ...container, content: newContent } : container;
}
function replaceTextInParagraphContent(opts, c) {
  switch (c.type) {
    case "run":
      return replaceTextInRun(opts, c);
    case "hyperlink":
    case "simpleField":
    case "sdt":
    case "ins":
    case "del":
    case "moveFrom":
    case "moveTo":
      return replaceTextInRunContainer(opts, c);
    case "bookmarkStart":
    case "bookmarkEnd":
    case "commentRangeStart":
    case "commentRangeEnd":
    case "moveFromRangeStart":
    case "moveFromRangeEnd":
    case "moveToRangeStart":
    case "moveToRangeEnd":
    case "oMath":
    case "oMathPara":
      return c;
    default: {
      const _exhaustive = c;
      throw new Error(`Unknown paragraph content type: ${_exhaustive.type}`);
    }
  }
}
function replaceTextInParagraph(opts, para) {
  const newContent = para.content.map((c) => replaceTextInParagraphContent(opts, c));
  const changed = newContent.some((c, i) => c !== para.content[i]);
  return changed ? { ...para, content: newContent } : para;
}
function replaceTextInCellContent(opts, block) {
  switch (block.type) {
    case "paragraph":
      return replaceTextInParagraph(opts, block);
    case "table":
      return replaceTextInTable(opts, block);
    default: {
      const _exhaustive = block;
      throw new Error(`Unknown cell content type: ${_exhaustive.type}`);
    }
  }
}
function replaceTextInTable(opts, block) {
  const newRows = block.rows.map((row) => {
    const newCells = row.cells.map((cell) => {
      const newCellContent = cell.content.map((cellBlock) => replaceTextInCellContent(opts, cellBlock));
      const cellChanged = newCellContent.some((c, i) => c !== cell.content[i]);
      return cellChanged ? { ...cell, content: newCellContent } : cell;
    });
    const rowChanged = newCells.some((c, i) => c !== row.cells[i]);
    return rowChanged ? { ...row, cells: newCells } : row;
  });
  const tableChanged = newRows.some((r, i) => r !== block.rows[i]);
  return tableChanged ? { ...block, rows: newRows } : block;
}
function replaceTextInBlock(opts, block) {
  switch (block.type) {
    case "paragraph":
      return replaceTextInParagraph(opts, block);
    case "table":
      return replaceTextInTable(opts, block);
    case "sectionBreak":
      return block;
    default: {
      const _exhaustive = block;
      throw new Error(`Unknown block content type: ${_exhaustive.type}`);
    }
  }
}
function applyTextReplacePatches(content, patches) {
  return patches.reduce(
    (acc, patch) => {
      const opts = {
        search: patch.search,
        replace: patch.replace,
        replaceAll: patch.replaceAll !== false
      };
      return acc.map((block) => replaceTextInBlock(opts, block));
    },
    [...content]
  );
}
function applyStylesPatches(existing, patches) {
  const allNewStyles = [];
  for (const patch of patches) {
    const converted = convertStylesSpec(patch.styles);
    allNewStyles.push(...converted.style);
  }
  if (allNewStyles.length === 0) {
    return existing;
  }
  if (!existing) {
    return { style: allNewStyles };
  }
  return {
    ...existing,
    style: [...existing.style, ...allNewStyles]
  };
}
function applyNumberingPatches(existing, patches) {
  const allNewAbstractNum = [];
  const allNewNum = [];
  for (const patch of patches) {
    const converted = convertNumberingSpec(patch.numbering);
    allNewAbstractNum.push(...converted.abstractNum);
    allNewNum.push(...converted.num);
  }
  if (allNewAbstractNum.length === 0 && allNewNum.length === 0) {
    return existing;
  }
  if (!existing) {
    return { abstractNum: allNewAbstractNum, num: allNewNum };
  }
  return {
    ...existing,
    abstractNum: [...existing.abstractNum, ...allNewAbstractNum],
    num: [...existing.num, ...allNewNum]
  };
}
function applySectionPatches(existing, patches) {
  return patches.reduce(
    (acc, patch) => {
      const result = convertSectionSpec(patch.section);
      return acc ? { ...acc, ...result.sectPr } : result.sectPr;
    },
    existing
  );
}
function ensureContentTypeOverride(pkg, partName, contentType) {
  const ctContent = pkg.readText(DEFAULT_PART_PATHS.contentTypes);
  if (!ctContent) {
    return;
  }
  if (ctContent.includes(`PartName="${partName}"`)) {
    return;
  }
  const root = getRootElement(ctContent);
  const existingEntries = [];
  for (const node of root.children) {
    if (!isXmlElement(node)) {
      continue;
    }
    if (node.name === "Default" || node.name.endsWith(":Default")) {
      existingEntries.push({
        kind: "default",
        extension: node.attrs.Extension ?? "",
        contentType: node.attrs.ContentType ?? ""
      });
    } else if (node.name === "Override" || node.name.endsWith(":Override")) {
      existingEntries.push({
        kind: "override",
        partName: node.attrs.PartName ?? "",
        contentType: node.attrs.ContentType ?? ""
      });
    }
  }
  existingEntries.push({ kind: "override", partName, contentType });
  const newXml = serializeContentTypes(existingEntries);
  pkg.writeText(DEFAULT_PART_PATHS.contentTypes, serializeWithDeclaration(newXml));
}
function parseExistingRelationships(content) {
  const root = getRootElement(content);
  const rels = [];
  for (const node of root.children) {
    if (!isXmlElement(node)) {
      continue;
    }
    const id = node.attrs.Id ?? "";
    const type = node.attrs.Type ?? "";
    const t = node.attrs.Target ?? "";
    const targetMode = node.attrs.TargetMode === "External" ? "External" : void 0;
    rels.push({ id, type, target: t, targetMode });
  }
  return rels;
}
function computeNextRelId(rels) {
  const maxId = rels.reduce((max2, rel) => {
    const match = rel.id.match(/^rId(\d+)$/);
    return match ? Math.max(max2, parseInt(match[1], 10)) : max2;
  }, 0);
  return `rId${maxId + 1}`;
}
function ensureDocumentRelationship(opts) {
  const content = opts.pkg.readText(opts.relsPath);
  if (content && content.includes(`Type="${opts.relType}"`)) {
    return;
  }
  const existingRels = content ? parseExistingRelationships(content) : [];
  const newId = computeNextRelId(existingRels);
  existingRels.push({ id: newId, type: opts.relType, target: opts.target });
  const newXml = serializeRelationships(existingRels);
  opts.pkg.writeText(opts.relsPath, serializeWithDeclaration(newXml));
}
function parseExistingStyles(content) {
  if (!content) {
    return void 0;
  }
  return parseStyles(getRootElement(content));
}
function parseExistingNumbering(content) {
  if (!content) {
    return void 0;
  }
  return parseNumbering(getRootElement(content));
}
function applyContentPatchesIfNeeded(classified, bodyContent) {
  if (classified.contentPatches.length > 0) {
    return applyContentPatches(bodyContent, classified.contentPatches);
  }
  return [...bodyContent];
}
function patchDocumentContent(classified, bodyContent) {
  const afterContent = applyContentPatchesIfNeeded(classified, bodyContent);
  if (classified.textReplacePatches.length > 0) {
    return applyTextReplacePatches(afterContent, classified.textReplacePatches);
  }
  return afterContent;
}
function patchDocumentSection(classified, sectPr) {
  if (classified.sectionPatches.length > 0) {
    return applySectionPatches(sectPr, classified.sectionPatches);
  }
  return sectPr;
}
async function patchDocx(spec, sourceData) {
  const pkg = await loadZipPackage(sourceData);
  const documentPath = resolveDocumentPath(pkg);
  const relsPath = getDocumentRelsPath(documentPath);
  const classified = classifyPatches(spec.patches);
  const needsDocumentPatch = classified.contentPatches.length > 0 || classified.textReplacePatches.length > 0 || classified.sectionPatches.length > 0;
  const needsStylesPatch = classified.stylesPatches.length > 0;
  const needsNumberingPatch = classified.numberingPatches.length > 0;
  if (needsDocumentPatch) {
    const docContent = pkg.readText(documentPath);
    if (!docContent) {
      throw new Error(`Cannot read document at ${documentPath}`);
    }
    const docRoot = getRootElement(docContent);
    const parsed = parseDocument(docRoot);
    const bodyContent = patchDocumentContent(classified, parsed.body.content);
    const sectPr = patchDocumentSection(classified, parsed.body.sectPr);
    const newBody = { content: bodyContent, sectPr };
    const newDoc = { body: newBody };
    const serialized = serializeDocument2(newDoc);
    pkg.writeText(documentPath, serializeWithDeclaration(serialized));
  }
  if (needsStylesPatch) {
    const stylesTarget = findRelTarget(pkg, relsPath, RELATIONSHIP_TYPES.styles);
    const stylesPath = resolvePartPathWithDefault(documentPath, stylesTarget, "styles.xml");
    const stylesContent = pkg.readText(stylesPath);
    const existingStyles = parseExistingStyles(stylesContent);
    const patched = applyStylesPatches(existingStyles, classified.stylesPatches);
    if (patched) {
      const serialized = serializeStyles(patched);
      pkg.writeText(stylesPath, serializeWithDeclaration(serialized));
      if (!stylesContent) {
        ensureDocumentRelationship({ pkg, relsPath, relType: RELATIONSHIP_TYPES.styles, target: "styles.xml" });
        ensureContentTypeOverride(pkg, `/${stylesPath}`, CONTENT_TYPES.styles);
      }
    }
  }
  if (needsNumberingPatch) {
    const numTarget = findRelTarget(pkg, relsPath, RELATIONSHIP_TYPES.numbering);
    const numPath = resolvePartPathWithDefault(documentPath, numTarget, "numbering.xml");
    const numContent = pkg.readText(numPath);
    const existingNumbering = parseExistingNumbering(numContent);
    const patched = applyNumberingPatches(existingNumbering, classified.numberingPatches);
    if (patched) {
      const serialized = serializeNumbering(patched);
      pkg.writeText(numPath, serializeWithDeclaration(serialized));
      if (!numContent) {
        ensureDocumentRelationship({ pkg, relsPath, relType: RELATIONSHIP_TYPES.numbering, target: "numbering.xml" });
        ensureContentTypeOverride(pkg, `/${numPath}`, CONTENT_TYPES.numbering);
      }
    }
  }
  const buffer = await pkg.toArrayBuffer({ compressionLevel: 6 });
  return new Uint8Array(buffer);
}

// node_modules/aurochs/dist/_shared/defaults-Cx9lAUnw.js
var EMU_PER_INCH2 = 914400;
var STANDARD_DPI3 = 96;
var EMU_PER_PIXEL = EMU_PER_INCH2 / STANDARD_DPI3;
var POINTS_PER_INCH2 = 72;
var DEFAULT_SLIDE_WIDTH_EMU = 12192e3;
var DEFAULT_SLIDE_HEIGHT_EMU = 6858e3;
var DEFAULT_SLIDE_WIDTH_PX = DEFAULT_SLIDE_WIDTH_EMU / EMU_PER_PIXEL;
var DEFAULT_SLIDE_HEIGHT_PX = DEFAULT_SLIDE_HEIGHT_EMU / EMU_PER_PIXEL;
function ooxmlBool(value) {
  return value ? "1" : "0";
}
function ooxmlAngleUnits(degrees) {
  return String(Math.round(degrees * 6e4));
}
function ooxmlPercent100k(percent) {
  return String(Math.round(percent / 100 * 1e5));
}
function ooxmlPercent1000(percent) {
  return String(Math.round(percent * 1e3));
}
function ooxmlEmu(pixels) {
  return String(Math.round(pixels * EMU_PER_PIXEL));
}
var DEFAULT_FONT_SIZE_PT = 18;
var FONT_SIZE_CENTIPOINTS_TO_PT = 100;

// node_modules/aurochs/dist/_shared/unit-conversion-DI3GSFe9.js
var SLIDE_FACTOR = STANDARD_DPI3 / EMU_PER_INCH2;
var FONT_SIZE_FACTOR = 4 / 3.2;
var PT_TO_PX2 = STANDARD_DPI3 / POINTS_PER_INCH2;

// node_modules/aurochs/dist/_shared/line-DYJU94VD.js
function getXmlText(value) {
  if (value === void 0 || value === null) {
    return void 0;
  }
  if (typeof value === "string") {
    return value;
  }
  if (isXmlText(value)) {
    return value.value;
  }
  if (isXmlElement(value)) {
    const text = getTextContent(value);
    if (text.length > 0) {
      return text;
    }
    return void 0;
  }
  return void 0;
}
var COLOR_ELEMENT_NAMES = ["a:srgbClr", "a:schemeClr", "a:sysClr", "a:prstClr", "a:hslClr", "a:scrgbClr"];
function findColorElement(parent) {
  return findChild(parent, (child) => COLOR_ELEMENT_NAMES.includes(child.name));
}
function parseSrgbColor(element) {
  const val = getAttr(element, "val");
  if (!val) {
    return void 0;
  }
  return { type: "srgb", value: val.toUpperCase() };
}
function parseSchemeColor(element) {
  const val = parseSchemeColorValue(getAttr(element, "val"));
  if (!val) {
    return void 0;
  }
  return { type: "scheme", value: val };
}
function parseSystemColor(element) {
  const val = getAttr(element, "val");
  if (!val) {
    return void 0;
  }
  const lastClr = getAttr(element, "lastClr");
  return {
    type: "system",
    value: val,
    lastColor: lastClr
  };
}
function parsePresetColor(element) {
  const val = getAttr(element, "val");
  if (!val) {
    return void 0;
  }
  return { type: "preset", value: val };
}
function parseHslColor(element) {
  const hue = getAngleAttr(element, "hue");
  const sat = getPercent100kAttr(element, "sat");
  const lum = getPercent100kAttr(element, "lum");
  if (hue === void 0 || sat === void 0 || lum === void 0) {
    return void 0;
  }
  return { type: "hsl", hue, saturation: sat, luminance: lum };
}
function parseScrgbColor(element) {
  const r = getPercent100kAttr(element, "r");
  const g = getPercent100kAttr(element, "g");
  const b = getPercent100kAttr(element, "b");
  if (r === void 0 || g === void 0 || b === void 0) {
    return void 0;
  }
  return { type: "scrgb", red: r, green: g, blue: b };
}
function parseColorSpec(element) {
  switch (element.name) {
    case "a:srgbClr":
      return parseSrgbColor(element);
    case "a:schemeClr":
      return parseSchemeColor(element);
    case "a:sysClr":
      return parseSystemColor(element);
    case "a:prstClr":
      return parsePresetColor(element);
    case "a:hslClr":
      return parseHslColor(element);
    case "a:scrgbClr":
      return parseScrgbColor(element);
    default:
      return void 0;
  }
}
function parseColorTransforms(element) {
  const state = {
    transform: {},
    hasTransform: false
  };
  for (const child of element.children) {
    if (!isXmlElement(child)) {
      continue;
    }
    switch (child.name) {
      case "a:alpha":
        state.transform.alpha = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:alphaMod":
        state.transform.alphaMod = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:alphaOff":
        state.transform.alphaOff = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:hue":
        state.transform.hue = getAngleAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:hueMod":
        state.transform.hueMod = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:hueOff":
        state.transform.hueOff = getAngleAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:sat":
        state.transform.sat = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:satMod":
        state.transform.satMod = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:satOff":
        state.transform.satOff = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:lum":
        state.transform.lum = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:lumMod":
        state.transform.lumMod = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:lumOff":
        state.transform.lumOff = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:red":
        state.transform.red = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:redMod":
        state.transform.redMod = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:redOff":
        state.transform.redOff = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:green":
        state.transform.green = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:greenMod":
        state.transform.greenMod = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:greenOff":
        state.transform.greenOff = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:blue":
        state.transform.blue = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:blueMod":
        state.transform.blueMod = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:blueOff":
        state.transform.blueOff = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:gamma":
        state.transform.gamma = true;
        state.hasTransform = true;
        break;
      case "a:inv":
        state.transform.inv = true;
        state.hasTransform = true;
        break;
      case "a:invGamma":
        state.transform.invGamma = true;
        state.hasTransform = true;
        break;
      case "a:shade":
        state.transform.shade = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:tint":
        state.transform.tint = getPercent100kAttr(child, "val");
        state.hasTransform = true;
        break;
      case "a:comp":
        state.transform.comp = true;
        state.hasTransform = true;
        break;
      case "a:gray":
        state.transform.gray = true;
        state.hasTransform = true;
        break;
    }
  }
  return state.hasTransform ? state.transform : void 0;
}
function parseColor2(element) {
  if (!element) {
    return void 0;
  }
  const spec = parseColorSpec(element);
  if (!spec) {
    return void 0;
  }
  const transform = parseColorTransforms(element);
  return { spec, transform };
}
function parseColorFromParent(parent) {
  if (!parent) {
    return void 0;
  }
  const colorEl = findColorElement(parent);
  return parseColor2(colorEl);
}
var FILL_ELEMENT_NAMES = ["a:noFill", "a:solidFill", "a:gradFill", "a:blipFill", "a:pattFill", "a:grpFill"];
function findFillElement(parent) {
  return findChild(parent, (child) => FILL_ELEMENT_NAMES.includes(child.name));
}
function parseNoFill() {
  return { type: "noFill" };
}
function parseSolidFill(element) {
  const color = parseColorFromParent(element);
  if (!color) {
    return void 0;
  }
  return { type: "solidFill", color };
}
function parseGradientStop(element) {
  const pos = getPercent100kAttr(element, "pos");
  if (pos === void 0) {
    return void 0;
  }
  const color = parseColorFromParent(element);
  if (!color) {
    return void 0;
  }
  return { position: pos, color };
}
function parseLinearGradient(element) {
  const lin = getChild(element, "a:lin");
  if (!lin) {
    return void 0;
  }
  return {
    angle: getAngleAttr(lin, "ang") ?? deg(0),
    scaled: getBoolAttrOr(lin, "scaled", true)
  };
}
function parseFillToRect(fillToRect) {
  return {
    left: getPercent100kAttr(fillToRect, "l") ?? pct(0),
    top: getPercent100kAttr(fillToRect, "t") ?? pct(0),
    right: getPercent100kAttr(fillToRect, "r") ?? pct(0),
    bottom: getPercent100kAttr(fillToRect, "b") ?? pct(0)
  };
}
function parsePathGradient(element) {
  const path = getChild(element, "a:path");
  if (!path) {
    return void 0;
  }
  const pathType = getAttr(path, "path");
  if (!pathType) {
    return void 0;
  }
  const fillToRect = getChild(path, "a:fillToRect");
  const fillRect = fillToRect ? parseFillToRect(fillToRect) : void 0;
  return { path: pathType, fillToRect: fillRect };
}
function parseTileRect(element) {
  const tileRect = getChild(element, "a:tileRect");
  if (!tileRect) {
    return void 0;
  }
  return {
    left: getPercent100kAttr(tileRect, "l") ?? pct(0),
    top: getPercent100kAttr(tileRect, "t") ?? pct(0),
    right: getPercent100kAttr(tileRect, "r") ?? pct(0),
    bottom: getPercent100kAttr(tileRect, "b") ?? pct(0)
  };
}
function parseGradientFill(element) {
  const gsLst = getChild(element, "a:gsLst");
  if (!gsLst) {
    return void 0;
  }
  const stops = [];
  for (const gs of getChildren(gsLst, "a:gs")) {
    const stop = parseGradientStop(gs);
    if (stop) {
      stops.push(stop);
    }
  }
  if (stops.length === 0) {
    return void 0;
  }
  stops.sort((a, b) => a.position - b.position);
  return {
    type: "gradientFill",
    stops,
    linear: parseLinearGradient(element),
    path: parsePathGradient(element),
    tileRect: parseTileRect(element),
    rotWithShape: getBoolAttrOr(element, "rotWithShape", true)
  };
}
function parsePatternFill(element) {
  const preset = getAttr(element, "prst");
  if (!preset) {
    return void 0;
  }
  const fgClr = getChild(element, "a:fgClr");
  const bgClr = getChild(element, "a:bgClr");
  const foregroundColor = parseColorFromParent(fgClr);
  const backgroundColor = parseColorFromParent(bgClr);
  if (!foregroundColor || !backgroundColor) {
    return void 0;
  }
  return {
    type: "patternFill",
    preset,
    foregroundColor,
    backgroundColor
  };
}
function parseGroupFill() {
  return { type: "groupFill" };
}
function parseBaseFill(element) {
  if (!element) {
    return void 0;
  }
  switch (element.name) {
    case "a:noFill":
      return parseNoFill();
    case "a:solidFill":
      return parseSolidFill(element);
    case "a:gradFill":
      return parseGradientFill(element);
    case "a:pattFill":
      return parsePatternFill(element);
    case "a:grpFill":
      return parseGroupFill();
    case "a:blipFill":
      return void 0;
    default:
      return void 0;
  }
}
function parseBaseFillFromParent(parent) {
  if (!parent) {
    return void 0;
  }
  const fillEl = findFillElement(parent);
  return parseBaseFill(fillEl);
}
function parseLineEnd(element) {
  if (!element) {
    return void 0;
  }
  const type = mapLineEndType(getAttr(element, "type"));
  if (!type || type === "none") {
    return void 0;
  }
  return {
    type,
    width: mapLineEndWidth(getAttr(element, "w")),
    length: mapLineEndLength(getAttr(element, "len"))
  };
}
function parseCustomDash(element) {
  const custDash = getChild(element, "a:custDash");
  if (!custDash) {
    return void 0;
  }
  const dashes = [];
  for (const ds of getChildren(custDash, "a:ds")) {
    const dashLength = getPercent100kAttr(ds, "d");
    const spaceLength = getPercent100kAttr(ds, "sp");
    if (dashLength !== void 0 && spaceLength !== void 0) {
      dashes.push({ dashLength, spaceLength });
    }
  }
  if (dashes.length === 0) {
    return void 0;
  }
  return { dashes };
}
function getDashStyle(element) {
  const prstDash = getChild(element, "a:prstDash");
  if (prstDash) {
    return getAttr(prstDash, "val") ?? "solid";
  }
  const customDash = parseCustomDash(element);
  if (customDash) {
    return customDash;
  }
  return "solid";
}
function mapLineEndType(type) {
  switch (type) {
    case "none":
      return "none";
    case "triangle":
      return "triangle";
    case "stealth":
      return "stealth";
    case "diamond":
      return "diamond";
    case "oval":
      return "oval";
    case "arrow":
      return "arrow";
    default:
      return void 0;
  }
}
function mapLineEndWidth(w) {
  switch (w) {
    case "sm":
      return "sm";
    case "med":
      return "med";
    case "lg":
      return "lg";
    default:
      return "med";
  }
}
function mapLineEndLength(len) {
  switch (len) {
    case "sm":
      return "sm";
    case "med":
      return "med";
    case "lg":
      return "lg";
    default:
      return "med";
  }
}
function mapLineCap(cap) {
  switch (cap) {
    case "flat":
      return "flat";
    case "rnd":
      return "round";
    case "sq":
      return "square";
    default:
      return "flat";
  }
}
function mapCompound(cmpd) {
  switch (cmpd) {
    case "sng":
      return "sng";
    case "dbl":
      return "dbl";
    case "thickThin":
      return "thickThin";
    case "thinThick":
      return "thinThick";
    case "tri":
      return "tri";
    default:
      return "sng";
  }
}
function mapPenAlignment(algn) {
  switch (algn) {
    case "ctr":
      return "ctr";
    case "in":
      return "in";
    default:
      return "ctr";
  }
}
function resolveLineJoin(element) {
  if (getChild(element, "a:bevel")) {
    return "bevel";
  }
  if (getChild(element, "a:miter")) {
    return "miter";
  }
  return "round";
}
function parseLine(element) {
  if (!element) {
    return void 0;
  }
  const fill = parseBaseFillFromParent(element);
  const width = parseLineWidth(getAttr(element, "w"));
  if (!fill && width === void 0) {
    return void 0;
  }
  const join = resolveLineJoin(element);
  const miterEl = getChild(element, "a:miter");
  const miterLimit = miterEl ? getPercent100kAttr(miterEl, "lim") : void 0;
  return {
    width: width ?? px(1),
    cap: mapLineCap(getAttr(element, "cap")),
    compound: mapCompound(getAttr(element, "cmpd")),
    alignment: mapPenAlignment(getAttr(element, "algn")),
    fill: fill ?? { type: "noFill" },
    dash: getDashStyle(element),
    headEnd: parseLineEnd(getChild(element, "a:headEnd")),
    tailEnd: parseLineEnd(getChild(element, "a:tailEnd")),
    join,
    miterLimit
  };
}
function getLineFromProperties(spPr) {
  if (!spPr) {
    return void 0;
  }
  return parseLine(getChild(spPr, "a:ln"));
}

// node_modules/aurochs/dist/_shared/text-style-BzTSDZjt.js
var TEXT_STYLE_LEVEL_KEYS = [
  "defaultStyle",
  "level1",
  "level2",
  "level3",
  "level4",
  "level5",
  "level6",
  "level7",
  "level8",
  "level9"
];
function getTextLevelByNumber(levels, lvlKey) {
  return levels[TEXT_STYLE_LEVEL_KEYS[lvlKey]];
}

// node_modules/aurochs/dist/_shared/slide-parser-BT02pIR2.js
function getEffectColor(element, overrideColor) {
  const color = parseColorFromParent(element);
  if (!color) {
    return overrideColor;
  }
  if (color.spec.type === "scheme" && color.spec.value === "phClr" && overrideColor) ;
  return color;
}
function parseOuterShadowEffect(element, overrideColor) {
  const color = getEffectColor(element, overrideColor);
  if (!color) {
    return void 0;
  }
  return {
    type: "outer",
    color,
    blurRadius: getEmuAttr(element, "blurRad") ?? px(0),
    distance: getEmuAttr(element, "dist") ?? px(0),
    direction: getAngleAttr(element, "dir") ?? deg(0),
    scaleX: getPercent100kAttr(element, "sx"),
    scaleY: getPercent100kAttr(element, "sy"),
    skewX: getAngleAttr(element, "kx"),
    skewY: getAngleAttr(element, "ky"),
    alignment: getAttr(element, "algn"),
    rotateWithShape: getBoolAttrOr(element, "rotWithShape", true)
  };
}
function parseInnerShadowEffect(element, overrideColor) {
  const color = getEffectColor(element, overrideColor);
  if (!color) {
    return void 0;
  }
  return {
    type: "inner",
    color,
    blurRadius: getEmuAttr(element, "blurRad") ?? px(0),
    distance: getEmuAttr(element, "dist") ?? px(0),
    direction: getAngleAttr(element, "dir") ?? deg(0)
  };
}
function parseGlowEffect(element, overrideColor) {
  const color = getEffectColor(element, overrideColor);
  if (!color) {
    return void 0;
  }
  return {
    color,
    radius: getEmuAttr(element, "rad") ?? px(0)
  };
}
function parseReflectionEffect(element) {
  return {
    blurRadius: getEmuAttr(element, "blurRad") ?? px(0),
    startOpacity: getPercent100kAttr(element, "stA") ?? pct(100),
    startPosition: getPercent100kAttr(element, "stPos") ?? pct(0),
    endOpacity: getPercent100kAttr(element, "endA") ?? pct(0),
    endPosition: getPercent100kAttr(element, "endPos") ?? pct(100),
    distance: getEmuAttr(element, "dist") ?? px(0),
    direction: getAngleAttr(element, "dir") ?? deg(0),
    fadeDirection: getAngleAttr(element, "fadeDir") ?? deg(90),
    scaleX: getPercent100kAttr(element, "sx") ?? pct(100),
    scaleY: getPercent100kAttr(element, "sy") ?? pct(100),
    skewX: getAngleAttr(element, "kx"),
    skewY: getAngleAttr(element, "ky"),
    alignment: getAttr(element, "algn"),
    rotateWithShape: getBoolAttrOr(element, "rotWithShape", true)
  };
}
function parseSoftEdgeEffect(element) {
  const radius = getEmuAttr(element, "rad");
  if (radius === void 0) {
    return void 0;
  }
  return { radius };
}
var EMU_TO_PX2 = STANDARD_DPI3 / EMU_PER_INCH2;
var PT_TO_PX3 = STANDARD_DPI3 / POINTS_PER_INCH2;
var PERCENT_10002 = 1e3;
function parseBoolean3(value) {
  if (value === void 0) {
    return void 0;
  }
  const lower = value.toLowerCase();
  if (lower === "1" || lower === "true" || lower === "on") {
    return true;
  }
  if (lower === "0" || lower === "false" || lower === "off") {
    return false;
  }
  return void 0;
}
function parseBooleanOr2(value, defaultValue) {
  const bool = parseBoolean3(value);
  return bool ?? defaultValue;
}
function parseEmuOr(value, defaultValue) {
  return parseEmu(value) ?? defaultValue;
}
function parsePositiveFixedPercentage(value) {
  if (!value) {
    return void 0;
  }
  if (!value.endsWith("%")) {
    return void 0;
  }
  const numeric = value.slice(0, -1);
  if (!numeric) {
    return void 0;
  }
  const num = parseFloat(numeric);
  if (Number.isNaN(num)) {
    return void 0;
  }
  if (num < 0 || num > 100) {
    return void 0;
  }
  return pct(num);
}
function parseBlackWhiteMode(value) {
  switch (value) {
    case "auto":
    case "black":
    case "blackGray":
    case "blackWhite":
    case "clr":
    case "gray":
    case "grayWhite":
    case "hidden":
    case "invGray":
    case "ltGray":
    case "white":
      return value;
    default:
      return void 0;
  }
}
function parseBlipCompression(value) {
  switch (value) {
    case "email":
    case "hqprint":
    case "none":
    case "print":
    case "screen":
      return value;
    default:
      return void 0;
  }
}
function parseFontCollectionIndex(value) {
  switch (value) {
    case "major":
    case "minor":
    case "none":
      return value;
    default:
      return void 0;
  }
}
function parseRectAlignment(value) {
  switch (value) {
    case "b":
    case "bl":
    case "br":
    case "ctr":
    case "l":
    case "r":
    case "t":
    case "tl":
    case "tr":
      return value;
    default:
      return void 0;
  }
}
function parseShapeId(value) {
  if (value === void 0) {
    return void 0;
  }
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return void 0;
  }
  return normalized;
}
function parseTextBulletSizePercent(value) {
  if (value === void 0) {
    return void 0;
  }
  if (value.endsWith("%")) {
    const numeric = value.slice(0, -1);
    if (!numeric) {
      return void 0;
    }
    const num2 = parseFloat(numeric);
    if (Number.isNaN(num2)) {
      return void 0;
    }
    if (num2 < 25 || num2 > 400) {
      return void 0;
    }
    return pct(num2);
  }
  const num = parseInt32(value);
  if (num === void 0) {
    return void 0;
  }
  const percentValue = num / PERCENT_10002;
  if (percentValue < 25 || percentValue > 400) {
    return void 0;
  }
  return pct(percentValue);
}
function parseTextBulletSize(value) {
  return parseTextBulletSizePercent(value);
}
function parseTextBulletStartAt(value) {
  const num = parseInt32(value);
  if (num === void 0) {
    return void 0;
  }
  if (num < 1 || num > 32767) {
    return void 0;
  }
  return num;
}
function parseTextColumnCount(value) {
  const num = parseInt32(value);
  if (num === void 0) {
    return void 0;
  }
  if (num < 1 || num > 16) {
    return void 0;
  }
  return num;
}
function parseTextFontScalePercent(value) {
  return value?.endsWith("%") ? parsePositiveFixedPercentage(value) : parsePercentage(value);
}
function parseTextIndent(value) {
  const num = parseInt32(value);
  if (num === void 0) {
    return void 0;
  }
  if (num < -51206400 || num > 51206400) {
    return void 0;
  }
  return px(num * EMU_TO_PX2);
}
function parseTextIndentLevel(value) {
  const num = parseInt32(value);
  if (num === void 0) {
    return void 0;
  }
  if (num < 0 || num > 8) {
    return void 0;
  }
  return num;
}
function parseTextMargin(value) {
  const num = parseInt32(value);
  if (num === void 0) {
    return void 0;
  }
  if (num < 0 || num > 51206400) {
    return void 0;
  }
  return px(num * EMU_TO_PX2);
}
function parseTextNonNegativePoint(value) {
  const num = parseInt32(value);
  if (num === void 0) {
    return void 0;
  }
  if (num < 0 || num > 4e5) {
    return void 0;
  }
  return pt(num / 100);
}
function parseUniversalMeasureToPixels(value) {
  if (value === void 0) {
    return void 0;
  }
  const match = /^(-?\d+(?:\.\d+)?)(mm|cm|in|pt|pc|pi)$/.exec(value);
  if (!match) {
    return void 0;
  }
  const raw = parseFloat(match[1]);
  if (Number.isNaN(raw)) {
    return void 0;
  }
  const unit = match[2];
  switch (unit) {
    case "in":
      return px(raw * STANDARD_DPI3);
    case "cm":
      return px(raw / 2.54 * STANDARD_DPI3);
    case "mm":
      return px(raw / 25.4 * STANDARD_DPI3);
    case "pt":
      return px(raw * PT_TO_PX3);
    case "pc":
    case "pi":
      return px(raw * 12 * PT_TO_PX3);
    default:
      return void 0;
  }
}
function parseTextPointUnqualified(value) {
  const num = parseInt32(value);
  if (num === void 0) {
    return void 0;
  }
  if (num < -4e5 || num > 4e5) {
    return void 0;
  }
  return px(num / 100 * PT_TO_PX3);
}
function parseTextPoint(value) {
  if (value === void 0) {
    return void 0;
  }
  if (/^-?\d+$/.test(value)) {
    return parseTextPointUnqualified(value);
  }
  return parseUniversalMeasureToPixels(value);
}
function parseTextShapeType(value) {
  switch (value) {
    case "textNoShape":
    case "textPlain":
    case "textStop":
    case "textTriangle":
    case "textTriangleInverted":
    case "textChevron":
    case "textChevronInverted":
    case "textRingInside":
    case "textRingOutside":
    case "textArchUp":
    case "textArchDown":
    case "textCircle":
    case "textButton":
    case "textArchUpPour":
    case "textArchDownPour":
    case "textCirclePour":
    case "textButtonPour":
    case "textCurveUp":
    case "textCurveDown":
    case "textCanUp":
    case "textCanDown":
    case "textWave1":
    case "textWave2":
    case "textDoubleWave1":
    case "textWave4":
    case "textInflate":
    case "textDeflate":
    case "textInflateBottom":
    case "textDeflateBottom":
    case "textInflateTop":
    case "textDeflateTop":
    case "textDeflateInflate":
    case "textDeflateInflateDeflate":
    case "textFadeRight":
    case "textFadeLeft":
    case "textFadeUp":
    case "textFadeDown":
    case "textSlantUp":
    case "textSlantDown":
    case "textCascadeUp":
    case "textCascadeDown":
      return value;
    default:
      return void 0;
  }
}
function parseTextSpacingPoint(value) {
  const num = parseInt32(value);
  if (num === void 0) {
    return void 0;
  }
  if (num < 0 || num > 158400) {
    return void 0;
  }
  return pt(num / 100);
}
function parseFontSize$1(value) {
  const num = parseInt32(value);
  if (num === void 0) {
    return void 0;
  }
  return pt(num / 100);
}
function parseCharacterSpacing(value) {
  return parseTextPoint(value);
}
function getEmuAttr2(element, name) {
  return parseEmu(getAttr(element, name));
}
function getEmuAttrOr(element, name, defaultValue) {
  return parseEmuOr(getAttr(element, name), defaultValue);
}
function getAngleAttr2(element, name) {
  return parseAngle(getAttr(element, name));
}
function getBoolAttr(element, name) {
  if (!element) {
    return void 0;
  }
  return parseBoolean3(getAttr(element, name));
}
function getBoolAttrOr2(element, name, defaultValue) {
  return parseBooleanOr2(getAttr(element, name), defaultValue);
}
function getIntAttr(element, name) {
  if (!element) {
    return void 0;
  }
  return parseInt32(getAttr(element, name));
}
function getIndexAttr(element, name) {
  if (!element) {
    return void 0;
  }
  return parseIndex(getAttr(element, name));
}
function getIntAttrOr(element, name, defaultValue) {
  return parseInt32Or(getAttr(element, name), defaultValue);
}
function getFontSizeAttr(element, name) {
  return parseFontSize$1(getAttr(element, name));
}
function getCharacterSpacingAttr(element, name) {
  return parseCharacterSpacing(getAttr(element, name));
}
function getPercentAttr(element, name) {
  return parsePercentage(getAttr(element, name));
}
function getPercent100kAttr2(element, name) {
  return parsePercentage100k(getAttr(element, name));
}
function parseColor3(...args) {
  return parseColor2(...args);
}
function parseColorFromParent2(...args) {
  return parseColorFromParent(...args);
}
function toSolidFill(color) {
  if (!color) {
    return void 0;
  }
  return { type: "solidFill", color };
}
function parseRotation(element) {
  if (!element) {
    return void 0;
  }
  const latitude = getAngleAttr2(element, "lat");
  const longitude = getAngleAttr2(element, "lon");
  const revolution = getAngleAttr2(element, "rev");
  if (latitude === void 0 || longitude === void 0 || revolution === void 0) {
    return void 0;
  }
  return { latitude, longitude, revolution };
}
function isBevelPresetType$1(value) {
  switch (value) {
    case "angle":
    case "artDeco":
    case "circle":
    case "convex":
    case "coolSlant":
    case "cross":
    case "divot":
    case "hardEdge":
    case "relaxedInset":
    case "riblet":
    case "slope":
    case "softRound":
      return true;
    default:
      return false;
  }
}
var DEFAULT_BEVEL_SIZE_EMU = 76200;
var DEFAULT_BEVEL_SIZE_PX = DEFAULT_BEVEL_SIZE_EMU / 914400 * 96;
function parseBevel$1(element) {
  if (!element) {
    return void 0;
  }
  const width = getEmuAttr2(element, "w") ?? px(DEFAULT_BEVEL_SIZE_PX);
  const height = getEmuAttr2(element, "h") ?? px(DEFAULT_BEVEL_SIZE_PX);
  const presetAttr = getAttr(element, "prst");
  const preset = isBevelPresetType$1(presetAttr) ? presetAttr : "circle";
  return { width, height, preset };
}
function isPresetMaterialType$1(value) {
  switch (value) {
    case "clear":
    case "dkEdge":
    case "flat":
    case "legacyMatte":
    case "legacyMetal":
    case "legacyPlastic":
    case "legacyWireframe":
    case "matte":
    case "metal":
    case "plastic":
    case "powder":
    case "softEdge":
    case "softmetal":
    case "translucentPowder":
    case "warmMatte":
      return true;
    default:
      return false;
  }
}
function parsePresetCameraType(value) {
  return isPresetCameraType(value) ? value : void 0;
}
function parseLightRigType(value) {
  return isLightRigType$1(value) ? value : void 0;
}
function parseLightRigDirection(value) {
  return isLightRigDirection$1(value) ? value : void 0;
}
function isPresetCameraType(value) {
  switch (value) {
    case "isometricBottomDown":
    case "isometricBottomUp":
    case "isometricLeftDown":
    case "isometricLeftUp":
    case "isometricOffAxis1Left":
    case "isometricOffAxis1Right":
    case "isometricOffAxis1Top":
    case "isometricOffAxis2Left":
    case "isometricOffAxis2Right":
    case "isometricOffAxis2Top":
    case "isometricOffAxis3Bottom":
    case "isometricOffAxis3Left":
    case "isometricOffAxis3Right":
    case "isometricOffAxis4Bottom":
    case "isometricOffAxis4Left":
    case "isometricOffAxis4Right":
    case "isometricRightDown":
    case "isometricRightUp":
    case "isometricTopDown":
    case "isometricTopUp":
    case "legacyObliqueBottom":
    case "legacyObliqueBottomLeft":
    case "legacyObliqueBottomRight":
    case "legacyObliqueFront":
    case "legacyObliqueLeft":
    case "legacyObliqueRight":
    case "legacyObliqueTop":
    case "legacyObliqueTopLeft":
    case "legacyObliqueTopRight":
    case "legacyPerspectiveBottom":
    case "legacyPerspectiveBottomLeft":
    case "legacyPerspectiveBottomRight":
    case "legacyPerspectiveFront":
    case "legacyPerspectiveLeft":
    case "legacyPerspectiveRight":
    case "legacyPerspectiveTop":
    case "legacyPerspectiveTopLeft":
    case "legacyPerspectiveTopRight":
    case "obliqueBottom":
    case "obliqueBottomLeft":
    case "obliqueBottomRight":
    case "obliqueLeft":
    case "obliqueRight":
    case "obliqueTop":
    case "obliqueTopLeft":
    case "obliqueTopRight":
    case "orthographicFront":
    case "perspectiveAbove":
    case "perspectiveAboveLeftFacing":
    case "perspectiveAboveRightFacing":
    case "perspectiveBelow":
    case "perspectiveContrastingLeftFacing":
    case "perspectiveContrastingRightFacing":
    case "perspectiveFront":
    case "perspectiveHeroicExtremeLeftFacing":
    case "perspectiveHeroicExtremeRightFacing":
    case "perspectiveHeroicLeftFacing":
    case "perspectiveHeroicRightFacing":
    case "perspectiveLeft":
    case "perspectiveRelaxed":
    case "perspectiveRelaxedModerately":
    case "perspectiveRight":
      return true;
    default:
      return false;
  }
}
function isLightRigType$1(value) {
  switch (value) {
    case "balanced":
    case "brightRoom":
    case "chilly":
    case "contrasting":
    case "flat":
    case "flood":
    case "freezing":
    case "glow":
    case "harsh":
    case "legacyFlat1":
    case "legacyFlat2":
    case "legacyFlat3":
    case "legacyFlat4":
    case "legacyHarsh1":
    case "legacyHarsh2":
    case "legacyHarsh3":
    case "legacyHarsh4":
    case "legacyNormal1":
    case "legacyNormal2":
    case "legacyNormal3":
    case "legacyNormal4":
    case "morning":
    case "soft":
    case "sunrise":
    case "sunset":
    case "threePt":
    case "twoPt":
      return true;
    default:
      return false;
  }
}
function isLightRigDirection$1(value) {
  switch (value) {
    case "b":
    case "bl":
    case "br":
    case "l":
    case "r":
    case "t":
    case "tl":
    case "tr":
      return true;
    default:
      return false;
  }
}
function parseScene3d(spPr) {
  if (!spPr) {
    return void 0;
  }
  const scene3d = getChild(spPr, "a:scene3d");
  if (!scene3d) {
    return void 0;
  }
  const cameraEl = getChild(scene3d, "a:camera");
  const lightRigEl = getChild(scene3d, "a:lightRig");
  if (!cameraEl || !lightRigEl) {
    return void 0;
  }
  const cameraPreset = parsePresetCameraType(getAttr(cameraEl, "prst"));
  const lightRig = parseLightRigType(getAttr(lightRigEl, "rig"));
  const lightDir = parseLightRigDirection(getAttr(lightRigEl, "dir"));
  if (!cameraPreset || !lightRig || !lightDir) {
    return void 0;
  }
  const cameraRotation = parseRotation(getChild(cameraEl, "a:rot"));
  const lightRotation = parseRotation(getChild(lightRigEl, "a:rot"));
  const flatTx = getChild(scene3d, "a:flatTx");
  const flatTextZ = flatTx ? getEmuAttr2(flatTx, "z") : void 0;
  return {
    camera: {
      preset: cameraPreset,
      fov: getAngleAttr2(cameraEl, "fov"),
      zoom: getPercent100kAttr2(cameraEl, "zoom"),
      rotation: cameraRotation
    },
    lightRig: {
      rig: lightRig,
      direction: lightDir,
      rotation: lightRotation
    },
    flatTextZ
  };
}
function parseShape3d(spPr) {
  if (!spPr) {
    return void 0;
  }
  const sp3d = getChild(spPr, "a:sp3d");
  if (!sp3d) {
    return void 0;
  }
  const extrusionColor = toSolidFill(parseColorFromParent2(getChild(sp3d, "a:extrusionClr")));
  const contourColor = toSolidFill(parseColorFromParent2(getChild(sp3d, "a:contourClr")));
  const bevelTop = parseBevel$1(getChild(sp3d, "a:bevelT"));
  const bevelBottom = parseBevel$1(getChild(sp3d, "a:bevelB"));
  const materialAttr = getAttr(sp3d, "prstMaterial");
  const material = isPresetMaterialType$1(materialAttr) ? materialAttr : "warmMatte";
  return {
    z: getEmuAttr2(sp3d, "z"),
    extrusionHeight: getEmuAttr2(sp3d, "extrusionH"),
    contourWidth: getEmuAttr2(sp3d, "contourW"),
    preset: material,
    extrusionColor,
    contourColor,
    bevelTop,
    bevelBottom
  };
}
function parseStretchFill(element) {
  const stretch = getChild(element, "a:stretch");
  if (!stretch) {
    return void 0;
  }
  const fillRect = getChild(stretch, "a:fillRect");
  if (!fillRect) {
    return {};
  }
  return {
    fillRect: {
      left: getPercent100kAttr(fillRect, "l") ?? pct(0),
      top: getPercent100kAttr(fillRect, "t") ?? pct(0),
      right: getPercent100kAttr(fillRect, "r") ?? pct(0),
      bottom: getPercent100kAttr(fillRect, "b") ?? pct(0)
    }
  };
}
function parseTileFillMode(element) {
  const tile = getChild(element, "a:tile");
  if (!tile) {
    return void 0;
  }
  const flip = getAttr(tile, "flip");
  return {
    tx: getEmuAttr(tile, "tx") ?? px(0),
    ty: getEmuAttr(tile, "ty") ?? px(0),
    sx: getPercent100kAttr(tile, "sx") ?? pct(100),
    sy: getPercent100kAttr(tile, "sy") ?? pct(100),
    flip: flip ?? "none",
    alignment: parseRectAlignment(getAttr(tile, "algn")) ?? "tl"
  };
}
function parseSourceRect$1(element) {
  const srcRect = getChild(element, "a:srcRect");
  if (!srcRect) {
    return void 0;
  }
  return {
    left: getPercent100kAttr(srcRect, "l") ?? pct(0),
    top: getPercent100kAttr(srcRect, "t") ?? pct(0),
    right: getPercent100kAttr(srcRect, "r") ?? pct(0),
    bottom: getPercent100kAttr(srcRect, "b") ?? pct(0)
  };
}
function parseBlipEffects(blip) {
  const effects = {};
  let hasEffect = false;
  for (const child of blip.children) {
    if (!isXmlElement(child)) {
      continue;
    }
    switch (child.name) {
      case "a:alphaBiLevel": {
        const threshold = parseFixedPercentage(getAttr(child, "thresh"));
        if (threshold !== void 0) {
          effects.alphaBiLevel = { threshold };
          hasEffect = true;
        }
        break;
      }
      case "a:alphaCeiling":
        effects.alphaCeiling = true;
        hasEffect = true;
        break;
      case "a:alphaFloor":
        effects.alphaFloor = true;
        hasEffect = true;
        break;
      case "a:alphaInv":
        effects.alphaInv = true;
        hasEffect = true;
        break;
      case "a:alphaMod":
        effects.alphaMod = true;
        hasEffect = true;
        break;
      case "a:alphaModFix": {
        const amount = parsePositivePercentage(getAttr(child, "amt")) ?? pct(100);
        effects.alphaModFix = { amount };
        hasEffect = true;
        break;
      }
      case "a:alphaRepl": {
        const alpha = parseFixedPercentage(getAttr(child, "a"));
        if (alpha !== void 0) {
          effects.alphaRepl = { alpha };
          hasEffect = true;
        }
        break;
      }
      case "a:biLevel": {
        const threshold = parseFixedPercentage(getAttr(child, "thresh"));
        if (threshold !== void 0) {
          effects.biLevel = { threshold };
          hasEffect = true;
        }
        break;
      }
      case "a:blur": {
        const radius = getEmuAttr(child, "rad") ?? px(0);
        const grow = getBoolAttrOr(child, "grow", true);
        effects.blur = { radius, grow };
        hasEffect = true;
        break;
      }
      case "a:clrChange": {
        const clrFrom = getChild(child, "a:clrFrom");
        const clrTo = getChild(child, "a:clrTo");
        if (clrFrom && clrTo) {
          const from = parseColorFromParent2(clrFrom);
          const to = parseColorFromParent2(clrTo);
          if (from && to) {
            effects.colorChange = {
              from,
              to,
              useAlpha: getBoolAttrOr(child, "useA", true)
            };
            hasEffect = true;
          }
        }
        break;
      }
      case "a:clrRepl": {
        const color = parseColorFromParent2(child);
        if (color) {
          effects.colorReplace = { color };
          hasEffect = true;
        }
        break;
      }
      case "a:duotone": {
        const colors = [];
        for (const colorChild of child.children) {
          if (isXmlElement(colorChild)) {
            const parsed = parseColor3(colorChild);
            if (parsed) {
              colors.push(parsed);
            }
          }
        }
        if (colors.length === 2) {
          effects.duotone = { colors: [colors[0], colors[1]] };
          hasEffect = true;
        }
        break;
      }
      case "a:grayscl":
        effects.grayscale = true;
        hasEffect = true;
        break;
      case "a:hsl": {
        const hue = getAngleAttr(child, "hue") ?? deg(0);
        const sat = getPercent100kAttr(child, "sat") ?? pct(0);
        const lum = getPercent100kAttr(child, "lum") ?? pct(0);
        effects.hsl = { hue, saturation: sat, luminance: lum };
        hasEffect = true;
        break;
      }
      case "a:lum": {
        const bright = getPercent100kAttr(child, "bright") ?? pct(0);
        const contrast = getPercent100kAttr(child, "contrast") ?? pct(0);
        effects.luminance = { brightness: bright, contrast };
        hasEffect = true;
        break;
      }
      case "a:tint": {
        const hue = getAngleAttr(child, "hue") ?? deg(0);
        const amt = parseFixedPercentage(getAttr(child, "amt")) ?? pct(0);
        effects.tint = { hue, amount: amt };
        hasEffect = true;
        break;
      }
    }
  }
  return hasEffect ? effects : void 0;
}
function parseBlipFill2(element) {
  const blip = getChild(element, "a:blip");
  if (!blip) {
    return void 0;
  }
  const embedId = getAttr(blip, "r:embed");
  const linkId = getAttr(blip, "r:link");
  const resourceId = embedId ?? linkId;
  if (!resourceId) {
    return void 0;
  }
  const dpiAttr = getAttr(element, "dpi");
  const dpi = dpiAttr ? parseInt(dpiAttr, 10) : void 0;
  const blipEffects = parseBlipEffects(blip);
  return {
    type: "blipFill",
    resourceId,
    relationshipType: embedId ? "embed" : "link",
    compressionState: parseBlipCompression(getAttr(blip, "cstate")),
    dpi: dpi !== void 0 && !Number.isNaN(dpi) ? dpi : void 0,
    blipEffects,
    stretch: parseStretchFill(element),
    tile: parseTileFillMode(element),
    sourceRect: parseSourceRect$1(element),
    rotWithShape: getBoolAttrOr(element, "rotWithShape", true)
  };
}
function parseFill(element) {
  if (!element) {
    return void 0;
  }
  if (element.name === "a:blipFill") {
    return parseBlipFill2(element);
  }
  const baseFill = parseBaseFill(element);
  if (!baseFill || baseFill.type === "blipFill") {
    return void 0;
  }
  return baseFill;
}
function parseFillFromParent(parent) {
  if (!parent) {
    return void 0;
  }
  const fillEl = findFillElement(parent);
  return parseFill(fillEl);
}
function resolveFillFromStyleReference(fillRef, fillStyles) {
  if (!fillRef || fillRef.index === 0) {
    return void 0;
  }
  const styleIndex = resolveFillStyleIndex(fillRef.index);
  if (styleIndex < 0 || styleIndex >= fillStyles.length) {
    return void 0;
  }
  const fill = fillStyles[styleIndex];
  if (fillRef.color) {
    return applyColorOverride(fill, fillRef.color);
  }
  return fill;
}
function resolveFillStyleIndex(index) {
  if (index >= 1001) {
    return index - 1001;
  }
  return index - 1;
}
function applyColorOverride(fill, overrideColor) {
  if (fill.type === "solidFill" && overrideColor.type === "solidFill") {
    return {
      type: "solidFill",
      color: overrideColor.color
    };
  }
  if (fill.type === "gradientFill" && overrideColor.type === "solidFill") {
    return {
      ...fill,
      stops: fill.stops.map((stop) => {
        if (stop.color.spec.type === "scheme" && stop.color.spec.value === "phClr") {
          return {
            ...stop,
            color: overrideColor.color
          };
        }
        return stop;
      })
    };
  }
  return fill;
}
function parseOuterShadow(element, overrideColor) {
  return parseOuterShadowEffect(element, overrideColor);
}
function parseInnerShadow(element, overrideColor) {
  return parseInnerShadowEffect(element, overrideColor);
}
function parseGlow(element, overrideColor) {
  return parseGlowEffect(element, overrideColor);
}
function parseReflection(element) {
  return parseReflectionEffect(element);
}
function parseSoftEdge(element) {
  return parseSoftEdgeEffect(element);
}
function parseAlphaBiLevel(element) {
  const threshold = parseFixedPercentage(getAttr(element, "thresh"));
  if (threshold === void 0) {
    return void 0;
  }
  return { threshold };
}
function parseAlphaCeiling(element) {
  return { type: "alphaCeiling" };
}
function parseAlphaFloor(element) {
  return { type: "alphaFloor" };
}
function parseAlphaInverse(element) {
  return { type: "alphaInv" };
}
function parseAlphaModulate(element) {
  const cont = getChild(element, "a:cont");
  if (!cont) {
    return void 0;
  }
  const container = parseEffectContainer(cont);
  return {
    type: "alphaMod",
    containerType: resolveContainerType(container),
    name: getAttr(cont, "name"),
    container
  };
}
function parseAlphaModulateFixed(element) {
  const amount = parsePositivePercentage(getAttr(element, "amt")) ?? pct(100);
  return { amount };
}
function parseAlphaOutset(element) {
  const radius = getEmuAttr2(element, "rad");
  if (radius === void 0) {
    return void 0;
  }
  return { radius };
}
function parseAlphaReplace(element) {
  const alpha = parseFixedPercentage(getAttr(element, "a"));
  if (alpha === void 0) {
    return void 0;
  }
  return { alpha };
}
function parseBiLevel(element) {
  const threshold = parseFixedPercentage(getAttr(element, "thresh"));
  if (threshold === void 0) {
    return void 0;
  }
  return { threshold };
}
function parseBlend(element) {
  const cont = getChild(element, "a:cont");
  if (!cont) {
    return void 0;
  }
  const blendAttr = getAttr(element, "blend");
  if (blendAttr === void 0) {
    return void 0;
  }
  if (blendAttr !== "over" && blendAttr !== "mult" && blendAttr !== "screen" && blendAttr !== "darken" && blendAttr !== "lighten") {
    return void 0;
  }
  const container = parseEffectContainer(cont);
  return {
    type: "blend",
    blend: blendAttr,
    containerType: resolveContainerType(container),
    name: getAttr(cont, "name"),
    container
  };
}
function resolveContainerType(container) {
  if (container?.type === "sib" || container?.type === "tree") {
    return container.type;
  }
  return void 0;
}
function parseColorChange(element) {
  const clrFrom = getChild(element, "a:clrFrom");
  const clrTo = getChild(element, "a:clrTo");
  if (!clrFrom || !clrTo) {
    return void 0;
  }
  const from = parseColorFromParent2(clrFrom);
  const to = parseColorFromParent2(clrTo);
  if (!from || !to) {
    return void 0;
  }
  return {
    from,
    to,
    useAlpha: getBoolAttrOr2(element, "useA", true)
  };
}
function parseColorReplace(element) {
  const color = parseColorFromParent2(element);
  if (!color) {
    return void 0;
  }
  return { color };
}
function parseDuotone(element) {
  const colors = [];
  for (const child of element.children) {
    if (typeof child !== "object" || !("name" in child)) {
      continue;
    }
    const parsed = parseColor3(child);
    if (parsed) {
      colors.push(parsed);
    }
  }
  if (colors.length !== 2) {
    return void 0;
  }
  return { colors: [colors[0], colors[1]] };
}
function parseFillOverlay(element) {
  const blendAttr = getAttr(element, "blend");
  if (blendAttr === void 0) {
    return void 0;
  }
  if (blendAttr !== "over" && blendAttr !== "mult" && blendAttr !== "screen" && blendAttr !== "darken" && blendAttr !== "lighten") {
    return void 0;
  }
  const fillElement = findFillOverlayElement(element);
  if (!fillElement) {
    return void 0;
  }
  const fillType = mapFillOverlayType(fillElement.name);
  if (!fillType) {
    return void 0;
  }
  const fill = parseFill(fillElement);
  return {
    blend: blendAttr,
    fillType,
    fill
  };
}
function findFillOverlayElement(element) {
  for (const child of element.children) {
    if (typeof child !== "object" || !("name" in child)) {
      continue;
    }
    const name = child.name;
    if (mapFillOverlayType(name) !== void 0) {
      return child;
    }
  }
  return void 0;
}
function mapFillOverlayType(name) {
  switch (name) {
    case "a:solidFill":
      return "solidFill";
    case "a:gradFill":
      return "gradFill";
    case "a:blipFill":
      return "blipFill";
    case "a:pattFill":
      return "pattFill";
    case "a:grpFill":
      return "grpFill";
    default:
      return void 0;
  }
}
function parseGrayscale(element) {
  return { type: "grayscl" };
}
function parsePresetShadow(element) {
  const prst = getAttr(element, "prst");
  if (!isPresetShadowValue(prst)) {
    return void 0;
  }
  const color = parseColorFromParent2(element);
  if (!color) {
    return void 0;
  }
  return {
    type: "preset",
    preset: prst,
    color,
    direction: getAngleAttr2(element, "dir") ?? deg(0),
    distance: getEmuAttr2(element, "dist") ?? px(0)
  };
}
function isPresetShadowValue(value) {
  return value === "shdw1" || value === "shdw2" || value === "shdw3" || value === "shdw4" || value === "shdw5" || value === "shdw6" || value === "shdw7" || value === "shdw8" || value === "shdw9" || value === "shdw10" || value === "shdw11" || value === "shdw12" || value === "shdw13" || value === "shdw14" || value === "shdw15" || value === "shdw16" || value === "shdw17" || value === "shdw18" || value === "shdw19" || value === "shdw20";
}
function parseRelativeOffset(element) {
  const offsetX = getPercentAttr(element, "tx");
  const offsetY = getPercentAttr(element, "ty");
  if (offsetX === void 0 || offsetY === void 0) {
    return void 0;
  }
  return { offsetX, offsetY };
}
function parseEffectContainer(element) {
  const typeAttr = getAttr(element, "type");
  const type = typeAttr === "sib" || typeAttr === "tree" ? typeAttr : void 0;
  return {
    name: getAttr(element, "name"),
    type
  };
}
function parseEffects(spPr) {
  if (!spPr) {
    return void 0;
  }
  const effectLst = getChild(spPr, "a:effectLst");
  if (effectLst) {
    return parseEffectList(effectLst, void 0, "effectLst");
  }
  const effectDag = getChild(spPr, "a:effectDag");
  if (effectDag) {
    return parseEffectList(effectDag, void 0, "effectDag");
  }
  return void 0;
}
function parseEffectList(effectLst, overrideColor, containerKind) {
  const effects = {};
  if (containerKind) {
    effects.containerKind = containerKind;
  }
  const outerShdw = getChild(effectLst, "a:outerShdw");
  if (outerShdw) {
    effects.shadow = parseOuterShadow(outerShdw, overrideColor);
  }
  const innerShdw = getChild(effectLst, "a:innerShdw");
  if (innerShdw && !effects.shadow) {
    effects.shadow = parseInnerShadow(innerShdw, overrideColor);
  }
  const glow = getChild(effectLst, "a:glow");
  if (glow) {
    effects.glow = parseGlow(glow, overrideColor);
  }
  const reflection = getChild(effectLst, "a:reflection");
  if (reflection) {
    effects.reflection = parseReflection(reflection);
  }
  const softEdge = getChild(effectLst, "a:softEdge");
  if (softEdge) {
    effects.softEdge = parseSoftEdge(softEdge);
  }
  const alphaBiLevel = getChild(effectLst, "a:alphaBiLevel");
  if (alphaBiLevel) {
    effects.alphaBiLevel = parseAlphaBiLevel(alphaBiLevel);
  }
  const alphaCeiling = getChild(effectLst, "a:alphaCeiling");
  if (alphaCeiling) {
    effects.alphaCeiling = parseAlphaCeiling();
  }
  const alphaFloor = getChild(effectLst, "a:alphaFloor");
  if (alphaFloor) {
    effects.alphaFloor = parseAlphaFloor();
  }
  const alphaInv = getChild(effectLst, "a:alphaInv");
  if (alphaInv) {
    effects.alphaInv = parseAlphaInverse();
  }
  const alphaMod = getChild(effectLst, "a:alphaMod");
  if (alphaMod) {
    effects.alphaMod = parseAlphaModulate(alphaMod);
  }
  const alphaModFix = getChild(effectLst, "a:alphaModFix");
  if (alphaModFix) {
    effects.alphaModFix = parseAlphaModulateFixed(alphaModFix);
  }
  const alphaOutset = getChild(effectLst, "a:alphaOutset");
  if (alphaOutset) {
    effects.alphaOutset = parseAlphaOutset(alphaOutset);
  }
  const alphaRepl = getChild(effectLst, "a:alphaRepl");
  if (alphaRepl) {
    effects.alphaRepl = parseAlphaReplace(alphaRepl);
  }
  const biLevel = getChild(effectLst, "a:biLevel");
  if (biLevel) {
    effects.biLevel = parseBiLevel(biLevel);
  }
  const blend = getChild(effectLst, "a:blend");
  if (blend) {
    effects.blend = parseBlend(blend);
  }
  const clrChange = getChild(effectLst, "a:clrChange");
  if (clrChange) {
    effects.colorChange = parseColorChange(clrChange);
  }
  const clrRepl = getChild(effectLst, "a:clrRepl");
  if (clrRepl) {
    effects.colorReplace = parseColorReplace(clrRepl);
  }
  const duotone = getChild(effectLst, "a:duotone");
  if (duotone) {
    effects.duotone = parseDuotone(duotone);
  }
  const fillOverlay = getChild(effectLst, "a:fillOverlay");
  if (fillOverlay) {
    effects.fillOverlay = parseFillOverlay(fillOverlay);
  }
  const grayscl = getChild(effectLst, "a:grayscl");
  if (grayscl) {
    effects.grayscale = parseGrayscale();
  }
  const prstShdw = getChild(effectLst, "a:prstShdw");
  if (prstShdw) {
    effects.presetShadow = parsePresetShadow(prstShdw);
  }
  const relOff = getChild(effectLst, "a:relOff");
  if (relOff) {
    effects.relativeOffset = parseRelativeOffset(relOff);
  }
  const hasEffect = Object.entries(effects).some(([key, value]) => key !== "containerKind" && value !== void 0);
  return hasEffect ? effects : void 0;
}
function resolveEffectsFromStyleReference(effectRef, effectStyles) {
  if (!effectRef || effectRef.index === 0) {
    return void 0;
  }
  const styleIndex = effectRef.index - 1;
  if (styleIndex < 0 || styleIndex >= effectStyles.length) {
    return void 0;
  }
  const effects = effectStyles[styleIndex];
  if (!effects) {
    return void 0;
  }
  const overrideColor = effectRef.color?.type === "solidFill" ? effectRef.color.color : void 0;
  if (!overrideColor) {
    return effects;
  }
  return applyEffectColorOverride(effects, overrideColor);
}
function applyEffectColorOverride(effects, overrideColor) {
  const result = { ...effects };
  if (result.shadow?.color?.spec.type === "scheme" && result.shadow.color.spec.value === "phClr") {
    result.shadow = { ...result.shadow, color: overrideColor };
  }
  if (result.glow?.color?.spec.type === "scheme" && result.glow.color.spec.value === "phClr") {
    result.glow = { ...result.glow, color: overrideColor };
  }
  return result;
}
function convertBaseLineToPptxLine(line) {
  if (line.fill.type === "blipFill") {
    return void 0;
  }
  return line;
}
function parseLine2(element) {
  const parsed = parseLine(element);
  if (!parsed) {
    return void 0;
  }
  return convertBaseLineToPptxLine(parsed);
}
function getLineFromProperties2(spPr) {
  const parsed = getLineFromProperties(spPr);
  if (!parsed) {
    return void 0;
  }
  return convertBaseLineToPptxLine(parsed);
}
var TYPE_TO_MASTER_STYLE = {
  // Title placeholders → titleStyle
  ctrTitle: "titleStyle",
  title: "titleStyle",
  // Content placeholders → bodyStyle
  subTitle: "bodyStyle",
  body: "bodyStyle",
  obj: "bodyStyle",
  chart: "bodyStyle",
  tbl: "bodyStyle",
  clipArt: "bodyStyle",
  dgm: "bodyStyle",
  media: "bodyStyle",
  pic: "bodyStyle",
  sldImg: "bodyStyle",
  // Slide image (for Notes)
  // Metadata placeholders → otherStyle
  dt: "otherStyle",
  ftr: "otherStyle",
  sldNum: "otherStyle",
  hdr: "otherStyle"
};
function lookupPlaceholder(tables, type, idx) {
  if (type !== void 0 && tables.byType[type] !== void 0) {
    return tables.byType[type];
  }
  if (idx !== void 0) {
    const byIdx = tables.byIdx.get(idx);
    if (byIdx !== void 0) {
      return byIdx;
    }
  }
  return void 0;
}
function parseFontSize(sz) {
  if (sz === void 0) {
    return void 0;
  }
  const parsed = parseInt(sz, 10) / FONT_SIZE_CENTIPOINTS_TO_PT;
  return isNaN(parsed) ? void 0 : pt(parsed);
}
function getFontSizeFromRPr(rPr) {
  if (rPr === void 0) {
    return void 0;
  }
  return parseFontSize(rPr.attrs?.sz);
}
function getFontSizeFromLstStyle(lstStyle, lvl) {
  if (lstStyle === void 0) {
    return void 0;
  }
  const lvlpPr = `a:lvl${lvl}pPr`;
  const defRPr = getByPath(lstStyle, [lvlpPr, "a:defRPr"]);
  return getFontSizeFromRPr(defRPr);
}
function getFontSizeFromPlaceholder(placeholder, lvl) {
  if (placeholder === void 0) {
    return void 0;
  }
  const txBody = getChild(placeholder, "p:txBody");
  const lstStyle = txBody ? getChild(txBody, "a:lstStyle") : void 0;
  return getFontSizeFromLstStyle(lstStyle, lvl);
}
function getFontSizeFromMasterTextStyles(masterTextStyles, placeholderType, lvl) {
  if (masterTextStyles === void 0 || placeholderType === void 0) {
    return void 0;
  }
  const styleKey = TYPE_TO_MASTER_STYLE[placeholderType];
  if (styleKey === void 0) {
    return void 0;
  }
  const levels = masterTextStyles[styleKey];
  if (levels === void 0) {
    return void 0;
  }
  const levelKey = TEXT_STYLE_LEVEL_KEYS[lvl];
  const level = levels[levelKey];
  return level?.defaultRunProperties?.fontSize;
}
function resolveFontSize(directRPr, ...rest) {
  const [localLstStyle, lvl, ctx] = rest;
  const lvlKey = lvl + 1;
  const directSz = getFontSizeFromRPr(directRPr);
  if (directSz !== void 0) {
    return directSz;
  }
  const localSz = getFontSizeFromLstStyle(localLstStyle, lvlKey);
  if (localSz !== void 0) {
    return localSz;
  }
  if (ctx === void 0) {
    return pt(DEFAULT_FONT_SIZE_PT);
  }
  const layoutPh = lookupPlaceholder(ctx.layoutPlaceholders, ctx.placeholderType, ctx.placeholderIdx);
  const layoutSz = getFontSizeFromPlaceholder(layoutPh, lvlKey);
  if (layoutSz !== void 0) {
    return layoutSz;
  }
  const masterPh = lookupPlaceholder(ctx.masterPlaceholders, ctx.placeholderType, ctx.placeholderIdx);
  const masterPhSz = getFontSizeFromPlaceholder(masterPh, lvlKey);
  if (masterPhSz !== void 0) {
    return masterPhSz;
  }
  const masterStyleSz = getFontSizeFromMasterTextStyles(ctx.masterTextStyles, ctx.placeholderType, lvlKey);
  if (masterStyleSz !== void 0) {
    return masterStyleSz;
  }
  if (ctx.defaultTextStyle !== void 0) {
    const levelStyle = getTextLevelByNumber(ctx.defaultTextStyle, lvlKey);
    const defaultSz = levelStyle?.defaultRunProperties?.fontSize;
    if (defaultSz !== void 0) {
      return defaultSz;
    }
  }
  return pt(DEFAULT_FONT_SIZE_PT);
}
function getAlignmentFromPPr(pPr) {
  if (pPr === void 0) {
    return void 0;
  }
  const algn = pPr.attrs?.algn;
  if (algn === void 0) {
    return void 0;
  }
  switch (algn) {
    case "l":
      return "left";
    case "ctr":
      return "center";
    case "r":
      return "right";
    case "just":
      return "justify";
    case "justLow":
      return "justifyLow";
    case "dist":
      return "distributed";
    case "thaiDist":
      return "thaiDistributed";
    default:
      return void 0;
  }
}
function getAlignmentFromLstStyle(lstStyle, lvl) {
  if (lstStyle === void 0) {
    return void 0;
  }
  const lvlpPr = `a:lvl${lvl}pPr`;
  const pPr = getChild(lstStyle, lvlpPr);
  return getAlignmentFromPPr(pPr);
}
function getAlignmentFromPlaceholder(placeholder, lvl) {
  if (placeholder === void 0) {
    return void 0;
  }
  const txBody = getChild(placeholder, "p:txBody");
  const lstStyle = txBody ? getChild(txBody, "a:lstStyle") : void 0;
  return getAlignmentFromLstStyle(lstStyle, lvl);
}
function getAlignmentFromMasterTextStyles(masterTextStyles, placeholderType, lvl) {
  if (masterTextStyles === void 0 || placeholderType === void 0) {
    return void 0;
  }
  const styleKey = TYPE_TO_MASTER_STYLE[placeholderType];
  if (styleKey === void 0) {
    return void 0;
  }
  const levels = masterTextStyles[styleKey];
  if (levels === void 0) {
    return void 0;
  }
  const levelKey = TEXT_STYLE_LEVEL_KEYS[lvl];
  const level = levels[levelKey];
  return level?.paragraphProperties?.alignment;
}
function resolveAlignment(directAlgn, ...rest) {
  const [localLstStyle, lvl, ctx] = rest;
  const lvlKey = lvl + 1;
  if (directAlgn !== void 0) {
    switch (directAlgn) {
      case "l":
        return "left";
      case "ctr":
        return "center";
      case "r":
        return "right";
      case "just":
        return "justify";
      case "justLow":
        return "justifyLow";
      case "dist":
        return "distributed";
      case "thaiDist":
        return "thaiDistributed";
    }
  }
  const localAlgn = getAlignmentFromLstStyle(localLstStyle, lvlKey);
  if (localAlgn !== void 0) {
    return localAlgn;
  }
  if (ctx === void 0) {
    return "left";
  }
  const layoutPh = lookupPlaceholder(ctx.layoutPlaceholders, ctx.placeholderType, ctx.placeholderIdx);
  const layoutAlgn = getAlignmentFromPlaceholder(layoutPh, lvlKey);
  if (layoutAlgn !== void 0) {
    return layoutAlgn;
  }
  const masterPh = lookupPlaceholder(ctx.masterPlaceholders, ctx.placeholderType, ctx.placeholderIdx);
  const masterPhAlgn = getAlignmentFromPlaceholder(masterPh, lvlKey);
  if (masterPhAlgn !== void 0) {
    return masterPhAlgn;
  }
  const masterStyleAlgn = getAlignmentFromMasterTextStyles(ctx.masterTextStyles, ctx.placeholderType, lvlKey);
  if (masterStyleAlgn !== void 0) {
    return masterStyleAlgn;
  }
  if (ctx.defaultTextStyle !== void 0) {
    const levelStyle = getTextLevelByNumber(ctx.defaultTextStyle, lvlKey);
    const defaultAlgn = levelStyle?.paragraphProperties?.alignment;
    if (defaultAlgn !== void 0) {
      return defaultAlgn;
    }
  }
  return "left";
}
function getColorFromRPr(rPr) {
  if (rPr === void 0) {
    return void 0;
  }
  const solidFill = getChild(rPr, "a:solidFill");
  if (solidFill === void 0) {
    return void 0;
  }
  return parseColorFromParent2(solidFill);
}
function getColorFromLstStyle(lstStyle, lvl) {
  if (lstStyle === void 0) {
    return void 0;
  }
  const lvlpPr = `a:lvl${lvl}pPr`;
  const defRPr = getByPath(lstStyle, [lvlpPr, "a:defRPr"]);
  return getColorFromRPr(defRPr);
}
function getColorFromPlaceholder(placeholder, lvl) {
  if (placeholder === void 0) {
    return void 0;
  }
  const txBody = getChild(placeholder, "p:txBody");
  const lstStyle = txBody ? getChild(txBody, "a:lstStyle") : void 0;
  return getColorFromLstStyle(lstStyle, lvl);
}
function getColorFromMasterTextStyles(masterTextStyles, placeholderType, lvl) {
  if (masterTextStyles === void 0 || placeholderType === void 0) {
    return void 0;
  }
  const styleKey = TYPE_TO_MASTER_STYLE[placeholderType];
  if (styleKey === void 0) {
    return void 0;
  }
  const levels = masterTextStyles[styleKey];
  if (levels === void 0) {
    return void 0;
  }
  const levelKey = TEXT_STYLE_LEVEL_KEYS[lvl];
  const level = levels[levelKey];
  return level?.defaultRunProperties?.color;
}
function resolveTextColor(directRPr, ...rest) {
  const [localLstStyle, lvl, ctx] = rest;
  const lvlKey = lvl + 1;
  const directColor = getColorFromRPr(directRPr);
  if (directColor !== void 0) {
    return directColor;
  }
  const localColor = getColorFromLstStyle(localLstStyle, lvlKey);
  if (localColor !== void 0) {
    return localColor;
  }
  if (ctx === void 0) {
    return void 0;
  }
  const layoutPh = lookupPlaceholder(ctx.layoutPlaceholders, ctx.placeholderType, ctx.placeholderIdx);
  const layoutColor = getColorFromPlaceholder(layoutPh, lvlKey);
  if (layoutColor !== void 0) {
    return layoutColor;
  }
  const masterPh = lookupPlaceholder(ctx.masterPlaceholders, ctx.placeholderType, ctx.placeholderIdx);
  const masterPhColor = getColorFromPlaceholder(masterPh, lvlKey);
  if (masterPhColor !== void 0) {
    return masterPhColor;
  }
  if (ctx.shapeFontReferenceColor !== void 0) {
    return ctx.shapeFontReferenceColor;
  }
  const masterStyleColor = getColorFromMasterTextStyles(ctx.masterTextStyles, ctx.placeholderType, lvlKey);
  if (masterStyleColor !== void 0) {
    return masterStyleColor;
  }
  if (ctx.defaultTextStyle !== void 0) {
    const levelStyle = getTextLevelByNumber(ctx.defaultTextStyle, lvlKey);
    const defaultColor = levelStyle?.defaultRunProperties?.color;
    if (defaultColor !== void 0) {
      return defaultColor;
    }
  }
  return void 0;
}
function getBulletPropertiesFromPPr(pPr) {
  if (pPr === void 0) {
    return void 0;
  }
  const result = {};
  const propertyState = { hasProperty: false };
  const buNone = getChild(pPr, "a:buNone");
  if (buNone !== void 0) {
    result.none = true;
    propertyState.hasProperty = true;
  }
  const buChar = getChild(pPr, "a:buChar");
  if (buChar !== void 0) {
    result.char = buChar.attrs?.char;
    propertyState.hasProperty = true;
  }
  const buAutoNum = getChild(pPr, "a:buAutoNum");
  if (buAutoNum !== void 0) {
    result.autoNumType = buAutoNum.attrs?.type;
    const startAt = buAutoNum.attrs?.startAt;
    if (startAt !== void 0) {
      result.autoNumStartAt = parseTextBulletStartAt(startAt);
    }
    propertyState.hasProperty = true;
  }
  const buBlip = getChild(pPr, "a:buBlip");
  if (buBlip !== void 0) {
    const blip = getChild(buBlip, "a:blip");
    if (blip !== void 0) {
      result.blipResourceId = blip.attrs?.["r:embed"] ?? blip.attrs?.["r:link"];
    }
    propertyState.hasProperty = true;
  }
  const buFont = getChild(pPr, "a:buFont");
  if (buFont !== void 0) {
    result.font = buFont.attrs?.typeface;
    propertyState.hasProperty = true;
  }
  const buFontTx = getChild(pPr, "a:buFontTx");
  if (buFontTx !== void 0) {
    result.fontFollowText = true;
    propertyState.hasProperty = true;
  }
  const buClr = getChild(pPr, "a:buClr");
  if (buClr !== void 0) {
    result.color = parseColorFromParent2(buClr);
    propertyState.hasProperty = true;
  }
  const buClrTx = getChild(pPr, "a:buClrTx");
  if (buClrTx !== void 0) {
    result.colorFollowText = true;
    propertyState.hasProperty = true;
  }
  const buSzPct = getChild(pPr, "a:buSzPct");
  if (buSzPct !== void 0) {
    const val = parseTextBulletSize(buSzPct.attrs?.val);
    if (val !== void 0) {
      result.sizePercent = val;
    }
    propertyState.hasProperty = true;
  }
  const buSzPts = getChild(pPr, "a:buSzPts");
  if (buSzPts !== void 0) {
    const val = buSzPts.attrs?.val;
    if (val !== void 0) {
      result.sizePoints = pt(parseInt(val, 10) / 100);
    }
    propertyState.hasProperty = true;
  }
  const buSzTx = getChild(pPr, "a:buSzTx");
  if (buSzTx !== void 0) {
    result.sizeFollowText = true;
    propertyState.hasProperty = true;
  }
  return propertyState.hasProperty ? result : void 0;
}
function getBulletPropertiesFromLstStyle(lstStyle, lvl) {
  if (lstStyle === void 0) {
    return void 0;
  }
  const lvlpPr = `a:lvl${lvl}pPr`;
  const pPr = getChild(lstStyle, lvlpPr);
  return getBulletPropertiesFromPPr(pPr);
}
function getBulletPropertiesFromPlaceholder(placeholder, lvl) {
  if (placeholder === void 0) {
    return void 0;
  }
  const txBody = getChild(placeholder, "p:txBody");
  const lstStyle = txBody ? getChild(txBody, "a:lstStyle") : void 0;
  return getBulletPropertiesFromLstStyle(lstStyle, lvl);
}
function bulletStyleToBulletProperties(bulletStyle) {
  const result = {};
  switch (bulletStyle.bullet.type) {
    case "none":
      result.none = true;
      break;
    case "char":
      result.char = bulletStyle.bullet.char;
      break;
    case "auto":
      result.autoNumType = bulletStyle.bullet.scheme;
      result.autoNumStartAt = bulletStyle.bullet.startAt;
      break;
    case "blip":
      result.blipResourceId = bulletStyle.bullet.resourceId;
      break;
  }
  if (bulletStyle.fontFollowText) {
    result.fontFollowText = true;
  } else if (bulletStyle.font !== void 0) {
    result.font = bulletStyle.font;
  }
  if (bulletStyle.colorFollowText) {
    result.colorFollowText = true;
  } else if (bulletStyle.color !== void 0) {
    result.color = bulletStyle.color;
  }
  if (bulletStyle.sizeFollowText) {
    result.sizeFollowText = true;
  } else if (bulletStyle.sizePercent !== void 0) {
    result.sizePercent = bulletStyle.sizePercent;
  } else if (bulletStyle.sizePoints !== void 0) {
    result.sizePoints = bulletStyle.sizePoints;
  }
  return result;
}
function getBulletPropertiesFromMasterTextStyles(masterTextStyles, placeholderType, lvl) {
  if (masterTextStyles === void 0 || placeholderType === void 0) {
    return void 0;
  }
  const styleKey = TYPE_TO_MASTER_STYLE[placeholderType];
  if (styleKey === void 0) {
    return void 0;
  }
  const levels = masterTextStyles[styleKey];
  if (levels === void 0) {
    return void 0;
  }
  const levelKey = TEXT_STYLE_LEVEL_KEYS[lvl];
  const level = levels[levelKey];
  const bulletStyle = level?.paragraphProperties?.bulletStyle;
  if (bulletStyle === void 0) {
    return void 0;
  }
  return bulletStyleToBulletProperties(bulletStyle);
}
function mergeBulletProperties(...sources) {
  const result = {};
  for (const source of sources) {
    if (source === void 0) {
      continue;
    }
    if (result.none === void 0 && result.char === void 0 && result.autoNumType === void 0 && result.blipResourceId === void 0) {
      if (source.none !== void 0) {
        result.none = source.none;
      } else if (source.char !== void 0) {
        result.char = source.char;
      } else if (source.autoNumType !== void 0) {
        result.autoNumType = source.autoNumType;
        result.autoNumStartAt = source.autoNumStartAt;
      } else if (source.blipResourceId !== void 0) {
        result.blipResourceId = source.blipResourceId;
      }
    }
    if (result.font === void 0 && result.fontFollowText === void 0) {
      if (source.fontFollowText !== void 0) {
        result.fontFollowText = source.fontFollowText;
      } else if (source.font !== void 0) {
        result.font = source.font;
      }
    }
    if (result.color === void 0 && result.colorFollowText === void 0) {
      if (source.colorFollowText !== void 0) {
        result.colorFollowText = source.colorFollowText;
      } else if (source.color !== void 0) {
        result.color = source.color;
      }
    }
    if (result.sizePercent === void 0 && result.sizePoints === void 0 && result.sizeFollowText === void 0) {
      if (source.sizeFollowText !== void 0) {
        result.sizeFollowText = source.sizeFollowText;
      } else if (source.sizePercent !== void 0) {
        result.sizePercent = source.sizePercent;
      } else if (source.sizePoints !== void 0) {
        result.sizePoints = source.sizePoints;
      }
    }
  }
  return result;
}
function resolveBulletStyle(directPPr, ...rest) {
  const [localLstStyle, lvl, ctx] = rest;
  const lvlKey = lvl + 1;
  const directProps = getBulletPropertiesFromPPr(directPPr);
  const localProps = getBulletPropertiesFromLstStyle(localLstStyle, lvlKey);
  const contextProps = resolveContextBulletProps(ctx, lvlKey);
  const layoutProps = contextProps.layoutProps;
  const masterPhProps = contextProps.masterPhProps;
  const masterStyleProps = contextProps.masterStyleProps;
  const defaultProps = contextProps.defaultProps;
  const merged = mergeBulletProperties(
    directProps,
    localProps,
    layoutProps,
    masterPhProps,
    masterStyleProps,
    defaultProps
  );
  if (merged.none === void 0 && merged.char === void 0 && merged.autoNumType === void 0 && merged.blipResourceId === void 0) {
    return void 0;
  }
  const bullet = resolveBullet(merged);
  if (!bullet) {
    return void 0;
  }
  return {
    bullet,
    color: merged.color,
    colorFollowText: merged.colorFollowText ?? false,
    sizePercent: merged.sizePercent,
    sizePoints: merged.sizePoints,
    sizeFollowText: merged.sizeFollowText ?? false,
    font: merged.font,
    fontFollowText: merged.fontFollowText ?? false
  };
}
function resolveContextBulletProps(ctx, lvlKey) {
  if (ctx === void 0) {
    return {
      layoutProps: void 0,
      masterPhProps: void 0,
      masterStyleProps: void 0,
      defaultProps: void 0
    };
  }
  const layoutPh = lookupPlaceholder(ctx.layoutPlaceholders, ctx.placeholderType, ctx.placeholderIdx);
  const layoutProps = getBulletPropertiesFromPlaceholder(layoutPh, lvlKey);
  const masterPh = lookupPlaceholder(ctx.masterPlaceholders, ctx.placeholderType, ctx.placeholderIdx);
  const masterPhProps = getBulletPropertiesFromPlaceholder(masterPh, lvlKey);
  const masterStyleProps = getBulletPropertiesFromMasterTextStyles(ctx.masterTextStyles, ctx.placeholderType, lvlKey);
  const defaultProps = resolveDefaultBulletProps(ctx.defaultTextStyle, lvlKey);
  return { layoutProps, masterPhProps, masterStyleProps, defaultProps };
}
function resolveDefaultBulletProps(defaultTextStyle, lvlKey) {
  if (defaultTextStyle === void 0) {
    return void 0;
  }
  const levelStyle = getTextLevelByNumber(defaultTextStyle, lvlKey);
  const bulletStyle = levelStyle?.paragraphProperties?.bulletStyle;
  if (bulletStyle === void 0) {
    return void 0;
  }
  return bulletStyleToBulletProperties(bulletStyle);
}
function resolveBullet(merged) {
  if (merged.none === true) {
    return { type: "none" };
  }
  if (merged.char !== void 0) {
    return { type: "char", char: merged.char };
  }
  if (merged.autoNumType !== void 0) {
    return {
      type: "auto",
      scheme: merged.autoNumType,
      startAt: merged.autoNumStartAt
    };
  }
  if (merged.blipResourceId !== void 0) {
    return { type: "blip", resourceId: merged.blipResourceId };
  }
  return void 0;
}
function parseSpacingElement(element) {
  if (element === void 0) {
    return void 0;
  }
  const spcPct = getChild(element, "a:spcPct");
  if (spcPct !== void 0) {
    const val = parsePercentage100k(spcPct.attrs?.val);
    if (val !== void 0) {
      return { type: "percent", value: val };
    }
  }
  const spcPts = getChild(element, "a:spcPts");
  if (spcPts !== void 0) {
    const val = parseTextSpacingPoint(spcPts.attrs?.val);
    if (val !== void 0) {
      return { type: "points", value: val };
    }
  }
  return void 0;
}
function getSpacingFromPPr(pPr, spacingType) {
  if (pPr === void 0) {
    return void 0;
  }
  const spacingElement = getChild(pPr, spacingType);
  return parseSpacingElement(spacingElement);
}
function getSpacingFromLstStyle(lstStyle, lvl, spacingType) {
  if (lstStyle === void 0) {
    return void 0;
  }
  const lvlpPr = `a:lvl${lvl}pPr`;
  const pPr = getChild(lstStyle, lvlpPr);
  return getSpacingFromPPr(pPr, spacingType);
}
function getSpacingFromPlaceholder(placeholder, lvl, spacingType) {
  if (placeholder === void 0) {
    return void 0;
  }
  const txBody = getChild(placeholder, "p:txBody");
  const lstStyle = txBody ? getChild(txBody, "a:lstStyle") : void 0;
  return getSpacingFromLstStyle(lstStyle, lvl, spacingType);
}
function spacingTypeToPropertyKey(spacingType) {
  switch (spacingType) {
    case "a:spcBef":
      return "spaceBefore";
    case "a:spcAft":
      return "spaceAfter";
    case "a:lnSpc":
      return "lineSpacing";
  }
}
function getSpacingFromMasterTextStyles({
  masterTextStyles,
  placeholderType,
  lvl,
  spacingType
}) {
  if (masterTextStyles === void 0 || placeholderType === void 0) {
    return void 0;
  }
  const styleKey = TYPE_TO_MASTER_STYLE[placeholderType];
  if (styleKey === void 0) {
    return void 0;
  }
  const levels = masterTextStyles[styleKey];
  if (levels === void 0) {
    return void 0;
  }
  const levelKey = TEXT_STYLE_LEVEL_KEYS[lvl];
  const level = levels[levelKey];
  const propKey = spacingTypeToPropertyKey(spacingType);
  return level?.paragraphProperties?.[propKey];
}
function resolveSpacing({
  directPPr,
  localLstStyle,
  lvl,
  ctx,
  spacingType
}) {
  const lvlKey = lvl + 1;
  const directSpacing = getSpacingFromPPr(directPPr, spacingType);
  if (directSpacing !== void 0) {
    return directSpacing;
  }
  const localSpacing = getSpacingFromLstStyle(localLstStyle, lvlKey, spacingType);
  if (localSpacing !== void 0) {
    return localSpacing;
  }
  if (ctx === void 0) {
    return void 0;
  }
  const layoutPh = lookupPlaceholder(ctx.layoutPlaceholders, ctx.placeholderType, ctx.placeholderIdx);
  const layoutSpacing = getSpacingFromPlaceholder(layoutPh, lvlKey, spacingType);
  if (layoutSpacing !== void 0) {
    return layoutSpacing;
  }
  const masterPh = lookupPlaceholder(ctx.masterPlaceholders, ctx.placeholderType, ctx.placeholderIdx);
  const masterPhSpacing = getSpacingFromPlaceholder(masterPh, lvlKey, spacingType);
  if (masterPhSpacing !== void 0) {
    return masterPhSpacing;
  }
  const masterStyleSpacing = getSpacingFromMasterTextStyles({
    masterTextStyles: ctx.masterTextStyles,
    placeholderType: ctx.placeholderType,
    lvl: lvlKey,
    spacingType
  });
  if (masterStyleSpacing !== void 0) {
    return masterStyleSpacing;
  }
  if (ctx.defaultTextStyle !== void 0) {
    const levelStyle = getTextLevelByNumber(ctx.defaultTextStyle, lvlKey);
    if (levelStyle?.paragraphProperties) {
      const pp = levelStyle.paragraphProperties;
      const propKey = spacingTypeToPropertyKey(spacingType);
      const defaultSpacing = pp[propKey];
      if (defaultSpacing !== void 0) {
        return defaultSpacing;
      }
    }
  }
  return void 0;
}
function resolveSpaceBefore({
  directPPr,
  localLstStyle,
  lvl,
  ctx
}) {
  return resolveSpacing({ directPPr, localLstStyle, lvl, ctx, spacingType: "a:spcBef" });
}
function resolveSpaceAfter({
  directPPr,
  localLstStyle,
  lvl,
  ctx
}) {
  return resolveSpacing({ directPPr, localLstStyle, lvl, ctx, spacingType: "a:spcAft" });
}
function resolveLineSpacing({
  directPPr,
  localLstStyle,
  lvl,
  ctx
}) {
  return resolveSpacing({ directPPr, localLstStyle, lvl, ctx, spacingType: "a:lnSpc" });
}
function getMarginFromPPr(pPr, attrName) {
  if (pPr === void 0) {
    return void 0;
  }
  if (attrName === "indent") {
    return parseTextIndent(pPr.attrs?.indent);
  }
  return parseTextMargin(pPr.attrs?.[attrName]);
}
function getMarginFromLstStyle(lstStyle, lvl, attrName) {
  if (lstStyle === void 0) {
    return void 0;
  }
  const lvlpPr = `a:lvl${lvl}pPr`;
  const pPr = getChild(lstStyle, lvlpPr);
  return getMarginFromPPr(pPr, attrName);
}
function getMarginFromPlaceholder(placeholder, lvl, attrName) {
  if (placeholder === void 0) {
    return void 0;
  }
  const txBody = getChild(placeholder, "p:txBody");
  const lstStyle = txBody ? getChild(txBody, "a:lstStyle") : void 0;
  return getMarginFromLstStyle(lstStyle, lvl, attrName);
}
function marginAttrToPropertyKey(attrName) {
  switch (attrName) {
    case "marL":
      return "marginLeft";
    case "marR":
      return "marginRight";
    case "indent":
      return "indent";
  }
}
function getMarginFromMasterTextStyles({
  masterTextStyles,
  placeholderType,
  lvl,
  attrName
}) {
  if (masterTextStyles === void 0 || placeholderType === void 0) {
    return void 0;
  }
  const styleKey = TYPE_TO_MASTER_STYLE[placeholderType];
  if (styleKey === void 0) {
    return void 0;
  }
  const levels = masterTextStyles[styleKey];
  if (levels === void 0) {
    return void 0;
  }
  const levelKey = TEXT_STYLE_LEVEL_KEYS[lvl];
  const level = levels[levelKey];
  const propKey = marginAttrToPropertyKey(attrName);
  return level?.paragraphProperties?.[propKey];
}
function resolveMargin({ directPPr, localLstStyle, lvl, ctx, attrName }) {
  const lvlKey = lvl + 1;
  const directMargin = getMarginFromPPr(directPPr, attrName);
  if (directMargin !== void 0) {
    return directMargin;
  }
  const localMargin = getMarginFromLstStyle(localLstStyle, lvlKey, attrName);
  if (localMargin !== void 0) {
    return localMargin;
  }
  if (ctx === void 0) {
    return void 0;
  }
  const layoutPh = lookupPlaceholder(ctx.layoutPlaceholders, ctx.placeholderType, ctx.placeholderIdx);
  const layoutMargin = getMarginFromPlaceholder(layoutPh, lvlKey, attrName);
  if (layoutMargin !== void 0) {
    return layoutMargin;
  }
  const masterPh = lookupPlaceholder(ctx.masterPlaceholders, ctx.placeholderType, ctx.placeholderIdx);
  const masterPhMargin = getMarginFromPlaceholder(masterPh, lvlKey, attrName);
  if (masterPhMargin !== void 0) {
    return masterPhMargin;
  }
  const masterStyleMargin = getMarginFromMasterTextStyles({
    masterTextStyles: ctx.masterTextStyles,
    placeholderType: ctx.placeholderType,
    lvl: lvlKey,
    attrName
  });
  if (masterStyleMargin !== void 0) {
    return masterStyleMargin;
  }
  if (ctx.defaultTextStyle !== void 0) {
    const levelStyle = getTextLevelByNumber(ctx.defaultTextStyle, lvlKey);
    if (levelStyle?.paragraphProperties) {
      const pp = levelStyle.paragraphProperties;
      const propKey = marginAttrToPropertyKey(attrName);
      const defaultMargin = pp[propKey];
      if (defaultMargin !== void 0) {
        return defaultMargin;
      }
    }
  }
  return void 0;
}
function resolveMarginLeft({ directPPr, localLstStyle, lvl, ctx }) {
  return resolveMargin({ directPPr, localLstStyle, lvl, ctx, attrName: "marL" });
}
function resolveMarginRight({
  directPPr,
  localLstStyle,
  lvl,
  ctx
}) {
  return resolveMargin({ directPPr, localLstStyle, lvl, ctx, attrName: "marR" });
}
function resolveIndent({ directPPr, localLstStyle, lvl, ctx }) {
  return resolveMargin({ directPPr, localLstStyle, lvl, ctx, attrName: "indent" });
}
function parseAutoFit(bodyPr) {
  if (getChild(bodyPr, "a:spAutoFit")) {
    return { type: "shape" };
  }
  const normAutofit = getChild(bodyPr, "a:normAutofit");
  if (normAutofit) {
    return {
      type: "normal",
      fontScale: parseTextFontScalePercent(getAttr(normAutofit, "fontScale")),
      lineSpaceReduction: getPercentAttr(normAutofit, "lnSpcReduction")
    };
  }
  return { type: "none" };
}
function parseTextWarp(bodyPr) {
  const prstTxWarp = getChild(bodyPr, "a:prstTxWarp");
  if (!prstTxWarp) {
    return void 0;
  }
  const preset = parseTextShapeType(getAttr(prstTxWarp, "prst"));
  if (!preset) {
    return void 0;
  }
  const adjustValues = [];
  const avLst = getChild(prstTxWarp, "a:avLst");
  if (avLst) {
    for (const gd of getChildren(avLst, "a:gd")) {
      const name = getAttr(gd, "name");
      const fmla = getAttr(gd, "fmla");
      if (name && fmla) {
        const match = fmla.match(/^val\s+(\d+)$/);
        if (match) {
          adjustValues.push({
            name,
            value: parseInt(match[1], 10)
          });
        }
      }
    }
  }
  return {
    preset,
    adjustValues
  };
}
function mapVerticalOverflow(overflow) {
  switch (overflow) {
    case "overflow":
      return "overflow";
    case "ellipsis":
      return "ellipsis";
    case "clip":
      return "clip";
    default:
      return void 0;
  }
}
function parseBodyProperties(bodyPr) {
  if (!bodyPr) {
    return {
      verticalType: "horz",
      wrapping: "square",
      anchor: "top",
      anchorCenter: false,
      overflow: "overflow",
      autoFit: { type: "none" },
      insets: { left: px(0), top: px(0), right: px(0), bottom: px(0) }
    };
  }
  return {
    rotation: getAngleAttr2(bodyPr, "rot"),
    verticalType: mapVerticalType(getAttr(bodyPr, "vert")),
    wrapping: mapWrapping(getAttr(bodyPr, "wrap")),
    anchor: mapAnchor(getAttr(bodyPr, "anchor")),
    anchorCenter: getBoolAttrOr2(bodyPr, "anchorCtr", false),
    overflow: mapOverflow(getAttr(bodyPr, "horzOverflow")),
    verticalOverflow: mapVerticalOverflow(getAttr(bodyPr, "vertOverflow")),
    autoFit: parseAutoFit(bodyPr),
    insets: {
      left: getEmuAttrOr(bodyPr, "lIns", px(91440 * 96 / 914400)),
      // ~0.1 inch default
      top: getEmuAttrOr(bodyPr, "tIns", px(45720 * 96 / 914400)),
      // ~0.05 inch default
      right: getEmuAttrOr(bodyPr, "rIns", px(91440 * 96 / 914400)),
      bottom: getEmuAttrOr(bodyPr, "bIns", px(45720 * 96 / 914400))
    },
    columns: parseTextColumnCount(getAttr(bodyPr, "numCol")),
    columnSpacing: getEmuAttr2(bodyPr, "spcCol"),
    upright: getBoolAttr(bodyPr, "upright"),
    compatibleLineSpacing: getBoolAttr(bodyPr, "compatLnSpc"),
    rtlColumns: getBoolAttr(bodyPr, "rtlCol"),
    spaceFirstLastPara: getBoolAttr(bodyPr, "spcFirstLastPara"),
    forceAntiAlias: getBoolAttr(bodyPr, "forceAA"),
    fromWordArt: getBoolAttr(bodyPr, "fromWordArt"),
    textWarp: parseTextWarp(bodyPr),
    // 3D text properties
    // @see ECMA-376 Part 1, Section 20.1.5.8 (a:scene3d)
    // @see ECMA-376 Part 1, Section 20.1.5.9 (a:sp3d)
    scene3d: parseScene3d(bodyPr),
    shape3d: parseShape3d(bodyPr)
  };
}
function parseLineSpacing(element) {
  if (!element) {
    return void 0;
  }
  const spcPct = getChild(element, "a:spcPct");
  if (spcPct) {
    const val = getPercentAttr(spcPct, "val");
    if (val !== void 0) {
      return { type: "percent", value: val };
    }
  }
  const spcPts = getChild(element, "a:spcPts");
  if (spcPts) {
    const val = parseTextSpacingPoint(getAttr(spcPts, "val"));
    if (val !== void 0) {
      return { type: "points", value: val };
    }
  }
  return void 0;
}
function parseBullet(pPr) {
  if (getChild(pPr, "a:buNone")) {
    return { type: "none" };
  }
  const buAutoNum = getChild(pPr, "a:buAutoNum");
  if (buAutoNum) {
    return {
      type: "auto",
      scheme: getAttr(buAutoNum, "type") ?? "arabicPeriod",
      startAt: parseTextBulletStartAt(getAttr(buAutoNum, "startAt"))
    };
  }
  const buChar = getChild(pPr, "a:buChar");
  if (buChar) {
    return {
      type: "char",
      char: getAttr(buChar, "char") ?? "\u2022"
    };
  }
  const buBlip = getChild(pPr, "a:buBlip");
  if (buBlip) {
    const blip = getChild(buBlip, "a:blip");
    const resourceId = blip ? getAttr(blip, "r:embed") ?? getAttr(blip, "r:link") : void 0;
    if (resourceId) {
      return { type: "blip", resourceId };
    }
  }
  return { type: "none" };
}
function parseBulletStyle(pPr) {
  const bullet = parseBullet(pPr);
  if (bullet.type === "none" && !getChild(pPr, "a:buNone")) {
    return void 0;
  }
  const buClr = getChild(pPr, "a:buClr");
  const color = buClr ? parseColorFromParent2(buClr) : void 0;
  const colorFollowText = getChild(pPr, "a:buClrTx") !== void 0;
  const buSzPct = getChild(pPr, "a:buSzPct");
  const buSzPts = getChild(pPr, "a:buSzPts");
  const sizePercent = buSzPct ? parseTextBulletSize(getAttr(buSzPct, "val")) : void 0;
  const sizePoints = buSzPts ? pt((getIntAttr(buSzPts, "val") ?? 0) / 100) : void 0;
  const sizeFollowText = getChild(pPr, "a:buSzTx") !== void 0;
  const buFont = getChild(pPr, "a:buFont");
  const font = buFont ? getAttr(buFont, "typeface") : void 0;
  const fontFollowText = getChild(pPr, "a:buFontTx") !== void 0;
  return {
    bullet,
    color,
    colorFollowText,
    sizePercent,
    sizePoints,
    sizeFollowText,
    font,
    fontFollowText
  };
}
function mapVerticalType(vert) {
  switch (vert) {
    case "horz":
      return "horz";
    case "vert":
      return "vert";
    case "vert270":
      return "vert270";
    case "wordArtVert":
      return "wordArtVert";
    case "eaVert":
      return "eaVert";
    case "mongolianVert":
      return "mongolianVert";
    case "wordArtVertRtl":
      return "wordArtVertRtl";
    default:
      return "horz";
  }
}
function mapAnchor(anchor) {
  switch (anchor) {
    case "t":
      return "top";
    case "ctr":
      return "center";
    case "b":
      return "bottom";
    default:
      return "top";
  }
}
function mapWrapping(wrap) {
  switch (wrap) {
    case "none":
      return "none";
    case "square":
      return "square";
    default:
      return "square";
  }
}
function mapOverflow(overflow) {
  switch (overflow) {
    case "overflow":
      return "overflow";
    case "ellipsis":
      return "ellipsis";
    case "clip":
      return "clip";
    default:
      return "overflow";
  }
}
function mapCaps(cap) {
  switch (cap) {
    case "none":
      return "none";
    case "small":
      return "small";
    case "all":
      return "all";
    default:
      return void 0;
  }
}
function mapStrike(strike) {
  switch (strike) {
    case "noStrike":
      return "noStrike";
    case "sngStrike":
      return "sngStrike";
    case "dblStrike":
      return "dblStrike";
    default:
      return void 0;
  }
}
function mapUnderline(u) {
  switch (u) {
    case "none":
      return "none";
    case "words":
      return "words";
    case "sng":
      return "sng";
    case "dbl":
      return "dbl";
    case "heavy":
      return "heavy";
    case "dotted":
      return "dotted";
    case "dottedHeavy":
      return "dottedHeavy";
    case "dash":
      return "dash";
    case "dashHeavy":
      return "dashHeavy";
    case "dashLong":
      return "dashLong";
    case "dashLongHeavy":
      return "dashLongHeavy";
    case "dotDash":
      return "dotDash";
    case "dotDashHeavy":
      return "dotDashHeavy";
    case "dotDotDash":
      return "dotDotDash";
    case "dotDotDashHeavy":
      return "dotDotDashHeavy";
    case "wavy":
      return "wavy";
    case "wavyHeavy":
      return "wavyHeavy";
    case "wavyDbl":
      return "wavyDbl";
    default:
      return void 0;
  }
}
function mapParagraphAlignment(algn) {
  switch (algn) {
    case "l":
      return "left";
    case "ctr":
      return "center";
    case "r":
      return "right";
    case "just":
      return "justify";
    case "justLow":
      return "justifyLow";
    case "dist":
      return "distributed";
    case "thaiDist":
      return "thaiDistributed";
    default:
      return "left";
  }
}
function mapTabStopAlignment(algn) {
  switch (algn) {
    case "l":
      return "left";
    case "ctr":
      return "center";
    case "r":
      return "right";
    case "dec":
      return "decimal";
    default:
      return "left";
  }
}
function mapFontAlignment(fontAlgn) {
  switch (fontAlgn) {
    case "auto":
      return "auto";
    case "base":
      return "base";
    case "t":
      return "top";
    case "ctr":
      return "center";
    case "b":
      return "bottom";
    default:
      return void 0;
  }
}
function parseTabStops2(pPr) {
  const tabLst = getChild(pPr, "a:tabLst");
  if (!tabLst) {
    return void 0;
  }
  const tabs = [];
  for (const tab of getChildren(tabLst, "a:tab")) {
    const pos = getEmuAttr2(tab, "pos");
    if (pos !== void 0) {
      tabs.push({
        position: pos,
        alignment: mapTabStopAlignment(getAttr(tab, "algn"))
      });
    }
  }
  return tabs.length > 0 ? tabs : void 0;
}
function parseParagraphProperties2(pPr) {
  if (!pPr) {
    return {};
  }
  const defRPr = getChild(pPr, "a:defRPr");
  return {
    // ECMA-376 21.1.2.2.7: lvl and algn have no explicit defaults, inherited from styles
    level: parseTextIndentLevel(getAttr(pPr, "lvl")),
    alignment: mapParagraphAlignment(getAttr(pPr, "algn")),
    defaultTabSize: getEmuAttr2(pPr, "defTabSz"),
    marginLeft: parseTextMargin(getAttr(pPr, "marL")),
    marginRight: parseTextMargin(getAttr(pPr, "marR")),
    indent: parseTextIndent(getAttr(pPr, "indent")),
    lineSpacing: parseLineSpacing(getChild(pPr, "a:lnSpc")),
    spaceBefore: parseLineSpacing(getChild(pPr, "a:spcBef")),
    spaceAfter: parseLineSpacing(getChild(pPr, "a:spcAft")),
    bulletStyle: parseBulletStyle(pPr),
    tabStops: parseTabStops2(pPr),
    rtl: getBoolAttr(pPr, "rtl"),
    fontAlignment: mapFontAlignment(getAttr(pPr, "fontAlgn")),
    eaLineBreak: getBoolAttr(pPr, "eaLnBrk"),
    latinLineBreak: getBoolAttr(pPr, "latinLnBrk"),
    hangingPunctuation: getBoolAttr(pPr, "hangingPunct"),
    defaultRunProperties: parseRunProperties2(defRPr)
  };
}
function parseHyperlinkSound$1(hlink) {
  const snd = getChild(hlink, "a:snd");
  if (!snd) {
    return void 0;
  }
  const embed = getAttr(snd, "r:embed");
  if (!embed) {
    return void 0;
  }
  return {
    embed,
    name: getAttr(snd, "name")
  };
}
function parseHyperlink2(rPr) {
  const hlinkClick = getChild(rPr, "a:hlinkClick");
  if (!hlinkClick) {
    return void 0;
  }
  const id = getAttr(hlinkClick, "r:id");
  if (!id) {
    return void 0;
  }
  return {
    id,
    tooltip: getAttr(hlinkClick, "tooltip"),
    action: getAttr(hlinkClick, "action"),
    sound: parseHyperlinkSound$1(hlinkClick)
  };
}
function parseHyperlinkMouseOver(rPr) {
  const hlinkMouseOver = getChild(rPr, "a:hlinkMouseOver");
  if (!hlinkMouseOver) {
    return void 0;
  }
  return {
    id: getAttr(hlinkMouseOver, "r:id"),
    tooltip: getAttr(hlinkMouseOver, "tooltip"),
    action: getAttr(hlinkMouseOver, "action"),
    highlightClick: getBoolAttr(hlinkMouseOver, "highlightClick"),
    endSound: getBoolAttr(hlinkMouseOver, "endSnd"),
    sound: parseHyperlinkSound$1(hlinkMouseOver)
  };
}
function resolveUnderlineLine(uLn, uLnTx, textOutline) {
  if (uLn) {
    return parseLine2(uLn);
  }
  if (uLnTx) {
    return textOutline;
  }
  return void 0;
}
function resolveUnderlineFill(uFill, fillFollowText, fillFromText) {
  if (uFill) {
    return parseFillFromParent(uFill);
  }
  if (fillFollowText) {
    return fillFromText;
  }
  return void 0;
}
function resolveUnderlineColor({
  underlineColor,
  underlineLineFollowText,
  underlineFillFollowText,
  textColor,
  underlineFillFromText
}) {
  if (underlineColor) {
    return underlineColor;
  }
  const followText = underlineLineFollowText ? true : underlineFillFollowText;
  if (!followText) {
    return void 0;
  }
  if (textColor) {
    return textColor;
  }
  if (underlineFillFromText?.type === "solidFill") {
    return underlineFillFromText.color;
  }
  return void 0;
}
function resolveRunProperties(runProps, fontSize, color) {
  if (runProps !== void 0) {
    return { ...runProps, fontSize, color };
  }
  return { fontSize, color };
}
function parseRunProperties2(rPr) {
  if (!rPr) {
    return void 0;
  }
  const latin = getChild(rPr, "a:latin");
  const ea = getChild(rPr, "a:ea");
  const cs = getChild(rPr, "a:cs");
  const sym = getChild(rPr, "a:sym");
  const solidFill = getChild(rPr, "a:solidFill");
  const color = parseColorFromParent2(solidFill);
  const fill = parseFillFromParent(rPr);
  const highlight = getChild(rPr, "a:highlight");
  const highlightColor = highlight ? parseColorFromParent2(highlight) : void 0;
  const uLn = getChild(rPr, "a:uLn");
  const uLnTx = getChild(rPr, "a:uLnTx");
  const uFill = getChild(rPr, "a:uFill");
  const uFillTx = getChild(rPr, "a:uFillTx");
  const ln2 = getChild(rPr, "a:ln");
  const textOutline = ln2 ? parseLine2(ln2) : void 0;
  const effects = parseEffects(rPr);
  const underlineLine = resolveUnderlineLine(uLn, uLnTx, textOutline);
  const underlineFillFollowText = uFillTx !== void 0;
  const underlineLineFollowText = uLnTx !== void 0;
  const underlineFillFromText = fill ?? (color ? { type: "solidFill", color } : void 0);
  const underlineFill = resolveUnderlineFill(uFill, underlineFillFollowText, underlineFillFromText);
  const underlineColor = resolveUnderlineColor({
    underlineColor: uLn ? parseColorFromParent2(uLn) : void 0,
    underlineLineFollowText,
    underlineFillFollowText,
    textColor: color,
    underlineFillFromText
  });
  return {
    fontSize: getFontSizeAttr(rPr, "sz"),
    fontFamily: latin ? getAttr(latin, "typeface") : void 0,
    fontFamilyPitchFamily: latin ? getIntAttr(latin, "pitchFamily") : void 0,
    fontFamilyEastAsian: ea ? getAttr(ea, "typeface") : void 0,
    fontFamilyEastAsianPitchFamily: ea ? getIntAttr(ea, "pitchFamily") : void 0,
    fontFamilyComplexScript: cs ? getAttr(cs, "typeface") : void 0,
    fontFamilyComplexScriptPitchFamily: cs ? getIntAttr(cs, "pitchFamily") : void 0,
    fontFamilySymbol: sym ? getAttr(sym, "typeface") : void 0,
    fontFamilySymbolPitchFamily: sym ? getIntAttr(sym, "pitchFamily") : void 0,
    bold: getBoolAttr(rPr, "b"),
    italic: getBoolAttr(rPr, "i"),
    underline: mapUnderline(getAttr(rPr, "u")),
    underlineColor,
    underlineFill,
    underlineLine,
    underlineLineFollowText,
    underlineFillFollowText,
    strike: mapStrike(getAttr(rPr, "strike")),
    caps: mapCaps(getAttr(rPr, "cap")),
    baseline: getIntAttr(rPr, "baseline"),
    spacing: getCharacterSpacingAttr(rPr, "spc"),
    kerning: parseTextNonNegativePoint(getAttr(rPr, "kern")),
    color,
    fill,
    highlightColor,
    textOutline,
    effects,
    outline: getBoolAttr(rPr, "outline"),
    shadow: getBoolAttr(rPr, "shadow"),
    emboss: getBoolAttr(rPr, "emboss"),
    hyperlink: parseHyperlink2(rPr),
    hyperlinkMouseOver: parseHyperlinkMouseOver(rPr),
    language: getAttr(rPr, "lang"),
    altLanguage: getAttr(rPr, "altLang"),
    noProof: getBoolAttr(rPr, "noProof"),
    dirty: getBoolAttr(rPr, "dirty"),
    smartTagClean: getBoolAttr(rPr, "smtClean"),
    bookmark: getAttr(rPr, "bmk"),
    error: getBoolAttr(rPr, "err"),
    kumimoji: getBoolAttr(rPr, "kumimoji"),
    normalizeHeights: getBoolAttr(rPr, "normalizeH"),
    smartTagId: getIntAttr(rPr, "smtId"),
    rtl: getChild(rPr, "a:rtl") !== void 0
  };
}
function parseTextBody(txBody, ctx) {
  if (!txBody) {
    return void 0;
  }
  const bodyPr = getChild(txBody, "a:bodyPr");
  const lstStyle = getChild(txBody, "a:lstStyle");
  const paragraphs = [];
  for (const p of getChildren(txBody, "a:p")) {
    paragraphs.push(parseTextParagraph(p, lstStyle, ctx));
  }
  if (paragraphs.length === 0) {
    paragraphs.push({
      properties: {},
      runs: []
    });
  }
  return {
    bodyProperties: parseBodyProperties(bodyPr),
    paragraphs
  };
}
function parseTextRun({
  runElement,
  rPr,
  localLstStyle,
  lvl,
  ctx
}) {
  const runProps = parseRunProperties2(rPr);
  const resolvedFontSize = runProps?.fontSize ?? resolveFontSize(rPr, localLstStyle, lvl, ctx);
  const resolvedColor = runProps?.color ?? resolveTextColor(rPr, localLstStyle, lvl, ctx);
  const resolvedProps = resolveRunProperties(runProps, resolvedFontSize, resolvedColor);
  if (runElement.name === "a:br") {
    return {
      type: "break",
      properties: resolvedProps
    };
  }
  if (runElement.name === "a:fld") {
    const t2 = getChild(runElement, "a:t");
    return {
      type: "field",
      fieldType: getAttr(runElement, "type") ?? "",
      id: getAttr(runElement, "id") ?? "",
      text: t2 ? getTextContent(t2) ?? "" : "",
      properties: resolvedProps
    };
  }
  const t = getChild(runElement, "a:t");
  return {
    type: "text",
    text: t ? getTextContent(t) ?? "" : "",
    properties: resolvedProps
  };
}
function parseTextRunsFromParagraph({
  paragraph,
  localLstStyle,
  lvl,
  ctx
}) {
  const runs = [];
  for (const child of paragraph.children) {
    if (!isXmlElement(child)) {
      continue;
    }
    if (child.name === "a:r" || child.name === "a:br" || child.name === "a:fld") {
      const rPr = getChild(child, "a:rPr");
      runs.push(parseTextRun({ runElement: child, rPr, localLstStyle, lvl, ctx }));
    }
  }
  return runs;
}
function parseTextParagraph(element, localLstStyle, ctx) {
  const pPr = getChild(element, "a:pPr");
  const endParaRPr = getChild(element, "a:endParaRPr");
  const props = parseParagraphProperties2(pPr);
  const lvl = props.level ?? 0;
  const directAlgn = pPr ? getAttr(pPr, "algn") : void 0;
  const resolvedAlignment = resolveAlignment(directAlgn, localLstStyle, lvl, ctx);
  const resolvedBulletStyle = resolveBulletStyle(pPr, localLstStyle, lvl, ctx);
  const resolvedSpaceBefore = props.spaceBefore ?? resolveSpaceBefore({ directPPr: pPr, localLstStyle, lvl, ctx });
  const resolvedSpaceAfter = props.spaceAfter ?? resolveSpaceAfter({ directPPr: pPr, localLstStyle, lvl, ctx });
  const resolvedLineSpacing = props.lineSpacing ?? resolveLineSpacing({ directPPr: pPr, localLstStyle, lvl, ctx });
  const resolvedMarginLeft = props.marginLeft ?? resolveMarginLeft({ directPPr: pPr, localLstStyle, lvl, ctx });
  const resolvedMarginRight = props.marginRight ?? resolveMarginRight({ directPPr: pPr, localLstStyle, lvl, ctx });
  const resolvedIndent = props.indent ?? resolveIndent({ directPPr: pPr, localLstStyle, lvl, ctx });
  return {
    properties: {
      ...props,
      alignment: resolvedAlignment,
      bulletStyle: resolvedBulletStyle,
      spaceBefore: resolvedSpaceBefore,
      spaceAfter: resolvedSpaceAfter,
      lineSpacing: resolvedLineSpacing,
      marginLeft: resolvedMarginLeft,
      marginRight: resolvedMarginRight,
      indent: resolvedIndent
    },
    runs: parseTextRunsFromParagraph({ paragraph: element, localLstStyle, lvl, ctx }),
    endProperties: parseRunProperties2(endParaRPr)
  };
}
function parseTextLevelStyle(level) {
  if (!level) {
    return void 0;
  }
  return {
    paragraphProperties: parseParagraphProperties2(level),
    defaultRunProperties: parseRunProperties2(getChild(level, "a:defRPr"))
  };
}
function parseTextStyleLevels(element) {
  if (!element) {
    return void 0;
  }
  const defaultStyle = parseTextLevelStyle(getChild(element, "a:defPPr"));
  const level1 = parseTextLevelStyle(getChild(element, "a:lvl1pPr"));
  const level2 = parseTextLevelStyle(getChild(element, "a:lvl2pPr"));
  const level3 = parseTextLevelStyle(getChild(element, "a:lvl3pPr"));
  const level4 = parseTextLevelStyle(getChild(element, "a:lvl4pPr"));
  const level5 = parseTextLevelStyle(getChild(element, "a:lvl5pPr"));
  const level6 = parseTextLevelStyle(getChild(element, "a:lvl6pPr"));
  const level7 = parseTextLevelStyle(getChild(element, "a:lvl7pPr"));
  const level8 = parseTextLevelStyle(getChild(element, "a:lvl8pPr"));
  const level9 = parseTextLevelStyle(getChild(element, "a:lvl9pPr"));
  const hasAnyLevel = [defaultStyle, level1, level2, level3, level4, level5, level6, level7, level8, level9].some(
    (level) => level !== void 0
  );
  if (!hasAnyLevel) {
    return void 0;
  }
  return {
    defaultStyle,
    level1,
    level2,
    level3,
    level4,
    level5,
    level6,
    level7,
    level8,
    level9
  };
}
function parseStyleReference(element) {
  if (!element) {
    return void 0;
  }
  const idx = parseUnsignedInt(getAttr(element, "idx"));
  if (idx === void 0) {
    return void 0;
  }
  const parsedColor = parseColorFromParent2(element);
  const color = parsedColor ? { type: "solidFill", color: parsedColor } : void 0;
  return { index: idx, color };
}
function parseFontReference(element) {
  if (!element) {
    return void 0;
  }
  const idx = parseFontCollectionIndex(getAttr(element, "idx"));
  if (!idx || idx === "none") {
    return void 0;
  }
  const parsedColor = parseColorFromParent2(element);
  const color = parsedColor ? { type: "solidFill", color: parsedColor } : void 0;
  return { index: idx, color };
}
function parseShapeStyle2(style) {
  if (!style) {
    return void 0;
  }
  return {
    lineReference: parseStyleReference(getChild(style, "a:lnRef")),
    fillReference: parseStyleReference(getChild(style, "a:fillRef")),
    effectReference: parseStyleReference(getChild(style, "a:effectRef")),
    fontReference: parseFontReference(getChild(style, "a:fontRef"))
  };
}
function isBevelPresetType(value) {
  switch (value) {
    case "angle":
    case "artDeco":
    case "circle":
    case "convex":
    case "coolSlant":
    case "cross":
    case "divot":
    case "hardEdge":
    case "relaxedInset":
    case "riblet":
    case "slope":
    case "softRound":
      return true;
    default:
      return false;
  }
}
function parseBevel(element) {
  if (!element) {
    return void 0;
  }
  const width = getEmuAttr2(element, "w");
  const height = getEmuAttr2(element, "h");
  const preset = getAttr(element, "prst");
  if (width === void 0 || height === void 0) {
    return void 0;
  }
  if (!isBevelPresetType(preset)) {
    return void 0;
  }
  return { width, height, preset };
}
function isPresetMaterialType(value) {
  switch (value) {
    case "clear":
    case "dkEdge":
    case "flat":
    case "legacyMatte":
    case "legacyMetal":
    case "legacyPlastic":
    case "legacyWireframe":
    case "matte":
    case "metal":
    case "plastic":
    case "powder":
    case "softEdge":
    case "softmetal":
    case "translucentPowder":
    case "warmMatte":
      return true;
    default:
      return false;
  }
}
function parsePresetMaterialType(value) {
  return isPresetMaterialType(value) ? value : void 0;
}
function isLightRigType(value) {
  switch (value) {
    case "legacyFlat1":
    case "legacyFlat2":
    case "legacyFlat3":
    case "legacyFlat4":
    case "legacyNormal1":
    case "legacyNormal2":
    case "legacyNormal3":
    case "legacyNormal4":
    case "legacyHarsh1":
    case "legacyHarsh2":
    case "legacyHarsh3":
    case "legacyHarsh4":
    case "threePt":
    case "balanced":
    case "soft":
    case "harsh":
    case "flood":
    case "contrasting":
    case "morning":
    case "sunrise":
    case "sunset":
    case "chilly":
    case "freezing":
    case "flat":
    case "twoPt":
    case "glow":
    case "brightRoom":
      return true;
    default:
      return false;
  }
}
function isLightRigDirection(value) {
  switch (value) {
    case "tl":
    case "t":
    case "tr":
    case "l":
    case "r":
    case "bl":
    case "b":
    case "br":
      return true;
    default:
      return false;
  }
}
function parseLightRig(element) {
  if (!element) {
    return void 0;
  }
  const rig = getAttr(element, "rig");
  const direction = getAttr(element, "dir");
  if (!isLightRigType(rig) || !isLightRigDirection(direction)) {
    return void 0;
  }
  return { rig, direction };
}
function parseCell3d(element) {
  if (!element) {
    return void 0;
  }
  const bevel = parseBevel(getChild(element, "a:bevel"));
  const lightRig = parseLightRig(getChild(element, "a:lightRig"));
  const preset = parsePresetMaterialType(getAttr(element, "prstMaterial"));
  if (!bevel && !lightRig && !preset) {
    return void 0;
  }
  return {
    bevel,
    lightRig,
    preset
  };
}
function parseHyperlinkSound(hlink) {
  const snd = getChild(hlink, "a:snd");
  if (!snd) {
    return void 0;
  }
  const embed = getAttr(snd, "r:embed");
  if (!embed) {
    return void 0;
  }
  return {
    embed,
    name: getAttr(snd, "name")
  };
}
function parseNonVisualHyperlink(cNvPr, childName) {
  const hlink = getChild(cNvPr, childName);
  if (!hlink) {
    return void 0;
  }
  const id = getAttr(hlink, "r:id");
  if (!id) {
    return void 0;
  }
  const sound = parseHyperlinkSound(hlink);
  return {
    id,
    tooltip: getAttr(hlink, "tooltip"),
    action: getAttr(hlink, "action"),
    sound
  };
}
function parseNonVisualProperties(cNvPr) {
  if (!cNvPr) {
    return { id: "", name: "" };
  }
  return {
    id: getAttr(cNvPr, "id") ?? "",
    name: getAttr(cNvPr, "name") ?? "",
    description: getAttr(cNvPr, "descr"),
    title: getAttr(cNvPr, "title"),
    hidden: getBoolAttr(cNvPr, "hidden"),
    hyperlink: parseNonVisualHyperlink(cNvPr, "a:hlinkClick"),
    hyperlinkHover: parseNonVisualHyperlink(cNvPr, "a:hlinkHover")
  };
}
function parseNonVisualMedia(nvPr) {
  if (!nvPr) {
    return void 0;
  }
  const audioCd = getChild(nvPr, "a:audioCd");
  const audioFile = parseLinkedMediaFile(getChild(nvPr, "a:audioFile"));
  const quickTimeFile = parseQuickTimeFile(getChild(nvPr, "a:quickTimeFile"));
  const videoFile = parseLinkedMediaFile(getChild(nvPr, "a:videoFile"));
  const wavAudioFile = parseEmbeddedWavAudioFile(getChild(nvPr, "a:wavAudioFile"));
  const audioCdValue = audioCd ? parseAudioCd(audioCd) : void 0;
  const hasMedia = [audioCdValue, audioFile, quickTimeFile, videoFile, wavAudioFile].some(
    (value) => value !== void 0
  );
  if (hasMedia) {
    return {
      audioCd: audioCdValue,
      audioFile,
      quickTimeFile,
      videoFile,
      wavAudioFile
    };
  }
  return void 0;
}
function parseAudioCd(audioCd) {
  const parseAudioCdTime = (el) => {
    if (!el) {
      return void 0;
    }
    const track = getIntAttr(el, "track");
    if (track === void 0) {
      return void 0;
    }
    const time = getIntAttr(el, "time");
    return { track, time: time ?? void 0 };
  };
  const start = parseAudioCdTime(getChild(audioCd, "a:st"));
  const end = parseAudioCdTime(getChild(audioCd, "a:end"));
  return { start, end };
}
function parseLinkedMediaFile(element) {
  if (!element) {
    return void 0;
  }
  return {
    link: getAttr(element, "r:link"),
    contentType: getAttr(element, "contentType")
  };
}
function parseQuickTimeFile(element) {
  if (!element) {
    return void 0;
  }
  return {
    link: getAttr(element, "r:link")
  };
}
function parseEmbeddedWavAudioFile(element) {
  if (!element) {
    return void 0;
  }
  return {
    embed: getAttr(element, "r:embed"),
    name: getAttr(element, "name")
  };
}
function parsePlaceholder(nvSpPr) {
  if (!nvSpPr) {
    return void 0;
  }
  const nvPr = getChild(nvSpPr, "p:nvPr");
  if (!nvPr) {
    return void 0;
  }
  const ph = getChild(nvPr, "p:ph");
  if (!ph) {
    return void 0;
  }
  return {
    type: getAttr(ph, "type"),
    idx: getIndexAttr(ph, "idx"),
    size: getAttr(ph, "sz"),
    hasCustomPrompt: getBoolAttr(ph, "hasCustomPrompt")
  };
}
function getPlaceholderTypeFromNode(node) {
  if (!node) {
    return void 0;
  }
  const nvSpPr = getChild(node, "p:nvSpPr");
  if (!nvSpPr) {
    return void 0;
  }
  const nvPr = getChild(nvSpPr, "p:nvPr");
  if (!nvPr) {
    return void 0;
  }
  const ph = getChild(nvPr, "p:ph");
  if (!ph) {
    return void 0;
  }
  return getAttr(ph, "type");
}
function resolvePlaceholderType(directType, layoutNode, masterNode) {
  if (directType !== void 0) {
    return directType;
  }
  const layoutType = getPlaceholderTypeFromNode(layoutNode);
  if (layoutType !== void 0) {
    return layoutType;
  }
  const masterType = getPlaceholderTypeFromNode(masterNode);
  if (masterType !== void 0) {
    return masterType;
  }
  return void 0;
}
function resolveLayoutAndMasterNodes(ctx, idx, type) {
  if (ctx === void 0) {
    return { layout: void 0, master: void 0 };
  }
  if (idx !== void 0) {
    return {
      layout: ctx.layout.byIdx.get(idx),
      master: resolveMasterForIdx(ctx, idx, type)
    };
  }
  if (type !== void 0) {
    return {
      layout: ctx.layout.byType[type],
      master: ctx.master.byType[type]
    };
  }
  return { layout: void 0, master: void 0 };
}
function resolveMasterForIdx(ctx, idx, type) {
  if (type !== void 0) {
    return ctx.master.byType[type];
  }
  return ctx.master.byIdx.get(idx);
}
function parseTransform(xfrm) {
  if (!xfrm) {
    return void 0;
  }
  const off = getChild(xfrm, "a:off");
  const ext = getChild(xfrm, "a:ext");
  if (!off || !ext) {
    return void 0;
  }
  return {
    x: getEmuAttrOr(off, "x", px(0)),
    y: getEmuAttrOr(off, "y", px(0)),
    width: getEmuAttrOr(ext, "cx", px(0)),
    height: getEmuAttrOr(ext, "cy", px(0)),
    rotation: getAngleAttr2(xfrm, "rot") ?? deg(0),
    flipH: getBoolAttrOr2(xfrm, "flipH", false),
    flipV: getBoolAttrOr2(xfrm, "flipV", false)
  };
}
function parseGroupTransform(xfrm) {
  if (!xfrm) {
    return void 0;
  }
  const off = getChild(xfrm, "a:off");
  const ext = getChild(xfrm, "a:ext");
  const chOff = getChild(xfrm, "a:chOff");
  const chExt = getChild(xfrm, "a:chExt");
  if (!off || !ext || !chOff || !chExt) {
    return void 0;
  }
  return {
    x: getEmuAttrOr(off, "x", px(0)),
    y: getEmuAttrOr(off, "y", px(0)),
    width: getEmuAttrOr(ext, "cx", px(0)),
    height: getEmuAttrOr(ext, "cy", px(0)),
    rotation: getAngleAttr2(xfrm, "rot") ?? deg(0),
    flipH: getBoolAttrOr2(xfrm, "flipH", false),
    flipV: getBoolAttrOr2(xfrm, "flipV", false),
    childOffsetX: getEmuAttrOr(chOff, "x", px(0)),
    childOffsetY: getEmuAttrOr(chOff, "y", px(0)),
    childExtentWidth: getEmuAttrOr(chExt, "cx", px(0)),
    childExtentHeight: getEmuAttrOr(chExt, "cy", px(0))
  };
}
function getTransformFromProperties(spPr) {
  if (!spPr) {
    return void 0;
  }
  return parseTransform(getChild(spPr, "a:xfrm"));
}
function getGroupTransformFromProperties(grpSpPr) {
  if (!grpSpPr) {
    return void 0;
  }
  return parseGroupTransform(getChild(grpSpPr, "a:xfrm"));
}
function mapPathFillMode(fill) {
  switch (fill) {
    case "none":
      return "none";
    case "norm":
      return "norm";
    case "lighten":
      return "lighten";
    case "lightenLess":
      return "lightenLess";
    case "darken":
      return "darken";
    case "darkenLess":
      return "darkenLess";
    default:
      return "norm";
  }
}
function parseAdjustValues(element) {
  if (!element) return [];
  const avLst = getChild(element, "a:avLst");
  if (!avLst) return [];
  const values = [];
  for (const gd of getChildren(avLst, "a:gd")) {
    const name = getAttr(gd, "name");
    const fmla = getAttr(gd, "fmla");
    if (name && fmla) {
      const match = fmla.match(/^val\s+(\d+)$/);
      if (match) {
        values.push({ name, value: parseInt(match[1], 10) });
      }
    }
  }
  return values;
}
function parseAdjustHandles(element) {
  if (!element) return [];
  const ahLst = getChild(element, "a:ahLst");
  if (!ahLst) return [];
  const handles = [];
  for (const child of ahLst.children) {
    if (!isXmlElement(child)) continue;
    if (child.name === "a:ahXY") {
      const handle = parseAdjustHandleXY(child);
      if (handle) handles.push(handle);
    }
    if (child.name === "a:ahPolar") {
      const handle = parseAdjustHandlePolar(child);
      if (handle) handles.push(handle);
    }
  }
  return handles;
}
function parseAdjCoordinate(value) {
  if (!value) return void 0;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? void 0 : parsed;
}
function parseAdjAngleValue(element, attr) {
  const raw = getAttr(element, attr);
  if (!raw) return void 0;
  const parsed = getAngleAttr2(element, attr);
  if (parsed !== void 0) return parsed;
  return raw;
}
function parseAdjustHandleXY(element) {
  const pos = getChild(element, "a:pos");
  if (!pos) return void 0;
  return {
    type: "xy",
    position: parsePoint(pos),
    guideX: getAttr(element, "gdRefX"),
    guideY: getAttr(element, "gdRefY"),
    minX: parseAdjCoordinate(getAttr(element, "minX")),
    maxX: parseAdjCoordinate(getAttr(element, "maxX")),
    minY: parseAdjCoordinate(getAttr(element, "minY")),
    maxY: parseAdjCoordinate(getAttr(element, "maxY"))
  };
}
function parseAdjustHandlePolar(element) {
  const pos = getChild(element, "a:pos");
  if (!pos) return void 0;
  return {
    type: "polar",
    position: parsePoint(pos),
    guideAngle: getAttr(element, "gdRefAng"),
    guideRadius: getAttr(element, "gdRefR"),
    minAngle: parseAdjAngleValue(element, "minAng"),
    maxAngle: parseAdjAngleValue(element, "maxAng"),
    minRadius: parseAdjCoordinate(getAttr(element, "minR")),
    maxRadius: parseAdjCoordinate(getAttr(element, "maxR"))
  };
}
function parsePresetGeometry(prstGeom) {
  const preset = getAttr(prstGeom, "prst");
  if (!preset) return void 0;
  return {
    type: "preset",
    preset,
    adjustValues: parseAdjustValues(prstGeom)
  };
}
function parsePoint(element) {
  const x = getEmuAttr2(element, "x") ?? px(0);
  const y = getEmuAttr2(element, "y") ?? px(0);
  return { x, y };
}
function parseMoveToCommand(element) {
  const pt2 = getChild(element, "a:pt");
  if (!pt2) return void 0;
  return { type: "moveTo", point: parsePoint(pt2) };
}
function parseLineToCommand(element) {
  const pt2 = getChild(element, "a:pt");
  if (!pt2) return void 0;
  return { type: "lineTo", point: parsePoint(pt2) };
}
function parseArcToCommand(element) {
  return {
    type: "arcTo",
    widthRadius: getEmuAttr2(element, "wR") ?? px(0),
    heightRadius: getEmuAttr2(element, "hR") ?? px(0),
    startAngle: getAngleAttr2(element, "stAng") ?? deg(0),
    swingAngle: getAngleAttr2(element, "swAng") ?? deg(0)
  };
}
function parseQuadBezierCommand(element) {
  const pts = getChildren(element, "a:pt");
  if (pts.length < 2) return void 0;
  return {
    type: "quadBezierTo",
    control: parsePoint(pts[0]),
    end: parsePoint(pts[1])
  };
}
function parseCubicBezierCommand(element) {
  const pts = getChildren(element, "a:pt");
  if (pts.length < 3) return void 0;
  return {
    type: "cubicBezierTo",
    control1: parsePoint(pts[0]),
    control2: parsePoint(pts[1]),
    end: parsePoint(pts[2])
  };
}
function parsePathCommands(path) {
  const commands = [];
  for (const child of path.children) {
    if (!isXmlElement(child)) continue;
    switch (child.name) {
      case "a:moveTo": {
        const cmd = parseMoveToCommand(child);
        if (cmd) commands.push(cmd);
        break;
      }
      case "a:lnTo": {
        const cmd = parseLineToCommand(child);
        if (cmd) commands.push(cmd);
        break;
      }
      case "a:arcTo": {
        const cmd = parseArcToCommand(child);
        if (cmd) commands.push(cmd);
        break;
      }
      case "a:quadBezTo": {
        const cmd = parseQuadBezierCommand(child);
        if (cmd) commands.push(cmd);
        break;
      }
      case "a:cubicBezTo": {
        const cmd = parseCubicBezierCommand(child);
        if (cmd) commands.push(cmd);
        break;
      }
      case "a:close":
        commands.push({ type: "close" });
        break;
    }
  }
  return commands;
}
function parseGeometryPath(path) {
  return {
    width: getEmuAttr2(path, "w") ?? px(0),
    height: getEmuAttr2(path, "h") ?? px(0),
    fill: mapPathFillMode(getAttr(path, "fill")),
    stroke: getBoolAttrOr2(path, "stroke", true),
    extrusionOk: getBoolAttrOr2(path, "extrusionOk", true),
    commands: parsePathCommands(path)
  };
}
function parseGuides(element) {
  if (!element) return [];
  const gdLst = getChild(element, "a:gdLst");
  if (!gdLst) return [];
  const guides = [];
  for (const gd of getChildren(gdLst, "a:gd")) {
    const name = getAttr(gd, "name");
    const fmla = getAttr(gd, "fmla");
    if (name && fmla) {
      guides.push({ name, formula: fmla });
    }
  }
  return guides;
}
function parseConnectionSites(element) {
  if (!element) return [];
  const cxnLst = getChild(element, "a:cxnLst");
  if (!cxnLst) return [];
  const sites = [];
  for (const cxn of getChildren(cxnLst, "a:cxn")) {
    const ang = getAngleAttr2(cxn, "ang");
    const pos = getChild(cxn, "a:pos");
    if (ang !== void 0 && pos) {
      sites.push({
        angle: ang,
        position: parsePoint(pos)
      });
    }
  }
  return sites;
}
function parseTextRect(element) {
  if (!element) return void 0;
  const rect = getChild(element, "a:rect");
  if (!rect) return void 0;
  return {
    left: getAttr(rect, "l") ?? "0",
    top: getAttr(rect, "t") ?? "0",
    right: getAttr(rect, "r") ?? "0",
    bottom: getAttr(rect, "b") ?? "0"
  };
}
function parseCustomGeometry(custGeom) {
  const pathLst = getChild(custGeom, "a:pathLst");
  if (!pathLst) return void 0;
  const paths = [];
  for (const path of getChildren(pathLst, "a:path")) {
    paths.push(parseGeometryPath(path));
  }
  if (paths.length === 0) return void 0;
  return {
    type: "custom",
    paths,
    adjustValues: parseAdjustValues(custGeom),
    adjustHandles: parseAdjustHandles(custGeom),
    guides: parseGuides(custGeom),
    connectionSites: parseConnectionSites(custGeom),
    textRect: parseTextRect(custGeom)
  };
}
function parseGeometry(spPr) {
  if (!spPr) return void 0;
  const prstGeom = getChild(spPr, "a:prstGeom");
  if (prstGeom) {
    return parsePresetGeometry(prstGeom);
  }
  const custGeom = getChild(spPr, "a:custGeom");
  if (custGeom) {
    return parseCustomGeometry(custGeom);
  }
  return void 0;
}
function findFirstDefined(getter, ...sources) {
  for (const source of sources) {
    const value = getter(source);
    if (value !== void 0) {
      return value;
    }
  }
  return void 0;
}
function parseShapePropertiesWithInheritance(spPr, layoutNode, masterNode) {
  const layoutSpPr = getSpPrChild(layoutNode);
  const masterSpPr = getSpPrChild(masterNode);
  const transform = findFirstDefined(getTransformFromProperties, spPr, layoutSpPr, masterSpPr);
  const geometry = findFirstDefined(parseGeometry, spPr, layoutSpPr, masterSpPr);
  const fill = findFirstDefined(parseFillFromParent, spPr, layoutSpPr, masterSpPr);
  const line = findFirstDefined(getLineFromProperties2, spPr, layoutSpPr, masterSpPr);
  const effects = findFirstDefined(parseEffects, spPr, layoutSpPr, masterSpPr);
  return {
    transform,
    geometry,
    fill,
    line,
    effects,
    scene3d: findFirstDefined(parseScene3d, spPr, layoutSpPr, masterSpPr),
    shape3d: findFirstDefined(parseShape3d, spPr, layoutSpPr, masterSpPr)
  };
}
function parseShapeProperties(spPr) {
  if (!spPr) {
    return {};
  }
  return {
    transform: getTransformFromProperties(spPr),
    geometry: parseGeometry(spPr),
    fill: parseFillFromParent(spPr),
    line: getLineFromProperties2(spPr),
    effects: parseEffects(spPr),
    scene3d: parseScene3d(spPr),
    shape3d: parseShape3d(spPr)
  };
}
function parseGroupShapeProperties(grpSpPr) {
  if (!grpSpPr) {
    return {};
  }
  return {
    transform: getGroupTransformFromProperties(grpSpPr),
    fill: parseFillFromParent(grpSpPr),
    effects: parseEffects(grpSpPr)
  };
}
function getSpPrChild(node) {
  if (!node) {
    return void 0;
  }
  return getChild(node, "p:spPr");
}
function parseShapeLocksElement(element) {
  if (!element) {
    return void 0;
  }
  const noGrp = getBoolAttr(element, "noGrp");
  const noSelect = getBoolAttr(element, "noSelect");
  const noRot = getBoolAttr(element, "noRot");
  const noChangeAspect = getBoolAttr(element, "noChangeAspect");
  const noMove = getBoolAttr(element, "noMove");
  const noResize = getBoolAttr(element, "noResize");
  const noEditPoints = getBoolAttr(element, "noEditPoints");
  const noAdjustHandles = getBoolAttr(element, "noAdjustHandles");
  const noChangeArrowheads = getBoolAttr(element, "noChangeArrowheads");
  const noChangeShapeType = getBoolAttr(element, "noChangeShapeType");
  const noTextEdit = getBoolAttr(element, "noTextEdit");
  if (noGrp === void 0 && noSelect === void 0 && noRot === void 0 && noChangeAspect === void 0 && noMove === void 0 && noResize === void 0 && noEditPoints === void 0 && noAdjustHandles === void 0 && noChangeArrowheads === void 0 && noChangeShapeType === void 0 && noTextEdit === void 0) {
    return void 0;
  }
  return {
    noGrp,
    noSelect,
    noRot,
    noChangeAspect,
    noMove,
    noResize,
    noEditPoints,
    noAdjustHandles,
    noChangeArrowheads,
    noChangeShapeType,
    noTextEdit
  };
}
function parseShapeLocksFromParent(parent) {
  if (!parent) {
    return void 0;
  }
  return parseShapeLocksElement(getChild(parent, "a:spLocks"));
}
function resolveShapePropertiesWithFill(properties, shapeStyle, formatScheme) {
  if (!properties.fill) {
    if (shapeStyle?.fillReference && formatScheme) {
      const resolvedFill = resolveFillFromStyleReference(shapeStyle.fillReference, formatScheme.fillStyles);
      if (resolvedFill) {
        return { ...properties, fill: resolvedFill };
      }
    }
  }
  return properties;
}
function resolveShapePropertiesWithEffects(properties, shapeStyle, formatScheme) {
  if (!properties.effects) {
    if (shapeStyle?.effectReference && formatScheme) {
      const resolvedEffects = resolveEffectsFromStyleReference(shapeStyle.effectReference, formatScheme.effectStyles);
      if (resolvedEffects) {
        return { ...properties, effects: resolvedEffects };
      }
    }
  }
  return properties;
}
function resolveShapePropertiesWithStyle(properties, shapeStyle, formatScheme) {
  const withFill = resolveShapePropertiesWithFill(properties, shapeStyle, formatScheme);
  return resolveShapePropertiesWithEffects(withFill, shapeStyle, formatScheme);
}
function buildTextStyleContext({
  ctx,
  resolvedPlaceholderType,
  placeholderIdx,
  masterStylesInfo,
  shapeStyle
}) {
  const shapeFontReferenceColor = getShapeFontReferenceColor(shapeStyle);
  if (ctx !== void 0) {
    return {
      placeholderType: resolvedPlaceholderType,
      placeholderIdx,
      layoutPlaceholders: ctx.layout,
      masterPlaceholders: ctx.master,
      masterTextStyles: masterStylesInfo?.masterTextStyles,
      defaultTextStyle: masterStylesInfo?.defaultTextStyle,
      shapeFontReferenceColor
    };
  }
  if (shapeFontReferenceColor !== void 0) {
    return {
      // Minimal context with just the shape font reference color
      placeholderType: void 0,
      placeholderIdx: void 0,
      layoutPlaceholders: { byType: {}, byIdx: /* @__PURE__ */ new Map() },
      masterPlaceholders: { byType: {}, byIdx: /* @__PURE__ */ new Map() },
      masterTextStyles: void 0,
      defaultTextStyle: void 0,
      shapeFontReferenceColor
    };
  }
  return void 0;
}
function getShapeFontReferenceColor(shapeStyle) {
  const fill = shapeStyle?.fontReference?.color;
  if (fill?.type === "solidFill") {
    return fill.color;
  }
  return void 0;
}
function parseSpShape({
  element,
  ctx,
  masterStylesInfo,
  formatScheme
}) {
  const nvSpPr = getChild(element, "p:nvSpPr");
  const cNvPr = nvSpPr ? getChild(nvSpPr, "p:cNvPr") : void 0;
  const cNvSpPr = nvSpPr ? getChild(nvSpPr, "p:cNvSpPr") : void 0;
  const textBox = getBoolAttr(cNvSpPr, "txBox");
  const spPr = getChild(element, "p:spPr");
  const txBody = getChild(element, "p:txBody");
  const style = getChild(element, "p:style");
  const placeholder = parsePlaceholder(nvSpPr);
  const { layout, master } = resolveLayoutAndMasterNodes(ctx, placeholder?.idx, placeholder?.type);
  const baseProperties = getShapePropertiesWithOptionalInheritance({ ctx, spPr, layout, master });
  const shapeStyle = parseShapeStyle2(style);
  const properties = resolveShapePropertiesWithStyle(baseProperties, shapeStyle, formatScheme);
  const resolvedPlaceholderType = resolvePlaceholderType(placeholder?.type, layout, master);
  const textStyleCtx = buildTextStyleContext({
    ctx,
    resolvedPlaceholderType,
    placeholderIdx: placeholder?.idx,
    masterStylesInfo,
    shapeStyle
  });
  return {
    type: "sp",
    nonVisual: {
      ...parseNonVisualProperties(cNvPr),
      textBox,
      shapeLocks: parseShapeLocksFromParent(cNvSpPr)
    },
    placeholder,
    properties,
    textBody: parseTextBody(txBody, textStyleCtx),
    style: shapeStyle
  };
}
function getShapePropertiesWithOptionalInheritance({
  ctx,
  spPr,
  layout,
  master
}) {
  if (ctx !== void 0) {
    return parseShapePropertiesWithInheritance(spPr, layout, master);
  }
  return parseShapeProperties(spPr);
}
var SUPPORTED_NAMESPACES = /* @__PURE__ */ new Set([
  // We don't support any extended namespaces
  // Standard DrawingML/PresentationML elements don't require Requires attribute
]);
function isChoiceSupported(requires) {
  if (requires === void 0 || requires === "") {
    return true;
  }
  const prefixes = requires.split(/\s+/).filter((p) => p.length > 0);
  return prefixes.every((prefix) => SUPPORTED_NAMESPACES.has(prefix));
}
function processAlternateContent(mcElement, childName) {
  const choices = getChildren(mcElement, "mc:Choice");
  for (const choice of choices) {
    const requires = getAttr(choice, "Requires");
    if (isChoiceSupported(requires)) {
      const child = getChild(choice, childName);
      if (child !== void 0) {
        return child;
      }
    }
  }
  const fallback = getChild(mcElement, "mc:Fallback");
  if (fallback !== void 0) {
    return getChild(fallback, childName);
  }
  return void 0;
}
function getBlipFillElement(element) {
  const directBlipFill = getChild(element, "p:blipFill");
  if (directBlipFill !== void 0) {
    return directBlipFill;
  }
  const mcElement = getChild(element, "mc:AlternateContent");
  if (mcElement !== void 0) {
    return processAlternateContent(mcElement, "p:blipFill");
  }
  return void 0;
}
function getOleObjElement(graphicData) {
  const directOleObj = getChild(graphicData, "p:oleObj");
  if (directOleObj !== void 0) {
    return directOleObj;
  }
  const mcElement = getChild(graphicData, "mc:AlternateContent");
  if (mcElement !== void 0) {
    return processAlternateContent(mcElement, "p:oleObj");
  }
  return void 0;
}
function parseBlipFillProperties(blipFill) {
  if (!blipFill) {
    return void 0;
  }
  const blip = getChild(blipFill, "a:blip");
  if (!blip) {
    return void 0;
  }
  const resourceId = getAttr(blip, "r:embed") ?? getAttr(blip, "r:link");
  if (!resourceId) {
    return void 0;
  }
  const sourceRect = parseSourceRect(getChild(blipFill, "a:srcRect"));
  const stretch = getChild(blipFill, "a:stretch");
  const tileProps = parseTileProperties(getChild(blipFill, "a:tile"));
  return {
    resourceId,
    compressionState: parseBlipCompression(getAttr(blip, "cstate")),
    sourceRect,
    stretch: stretch !== void 0,
    tile: tileProps,
    rotateWithShape: getBoolAttr(blipFill, "rotWithShape"),
    dpi: getIntAttr(blipFill, "dpi")
  };
}
function parsePictureLocksElement(element) {
  if (!element) {
    return void 0;
  }
  const noGrp = getBoolAttr(element, "noGrp");
  const noSelect = getBoolAttr(element, "noSelect");
  const noRot = getBoolAttr(element, "noRot");
  const noChangeAspect = getBoolAttr(element, "noChangeAspect");
  const noMove = getBoolAttr(element, "noMove");
  const noResize = getBoolAttr(element, "noResize");
  const noEditPoints = getBoolAttr(element, "noEditPoints");
  const noAdjustHandles = getBoolAttr(element, "noAdjustHandles");
  const noChangeArrowheads = getBoolAttr(element, "noChangeArrowheads");
  const noChangeShapeType = getBoolAttr(element, "noChangeShapeType");
  const noCrop = getBoolAttr(element, "noCrop");
  if (noGrp === void 0 && noSelect === void 0 && noRot === void 0 && noChangeAspect === void 0 && noMove === void 0 && noResize === void 0 && noEditPoints === void 0 && noAdjustHandles === void 0 && noChangeArrowheads === void 0 && noChangeShapeType === void 0 && noCrop === void 0) {
    return void 0;
  }
  return {
    noGrp,
    noSelect,
    noRot,
    noChangeAspect,
    noMove,
    noResize,
    noEditPoints,
    noAdjustHandles,
    noChangeArrowheads,
    noChangeShapeType,
    noCrop
  };
}
function detectMediaType(nvPicPr) {
  if (!nvPicPr) {
    return void 0;
  }
  const nvPr = getChild(nvPicPr, "p:nvPr");
  if (!nvPr) {
    return void 0;
  }
  if (hasAnyChild(nvPr, ["a:videoFile", "a:quickTimeFile"])) {
    return "video";
  }
  if (hasAnyChild(nvPr, ["a:audioFile", "a:audioCd", "a:wavAudioFile"])) {
    return "audio";
  }
  if (getChild(nvPr, "p:extLst")) ;
  return void 0;
}
function parsePicShape(element, formatScheme) {
  const nvPicPr = getChild(element, "p:nvPicPr");
  const cNvPr = nvPicPr ? getChild(nvPicPr, "p:cNvPr") : void 0;
  const cNvPicPr = nvPicPr ? getChild(nvPicPr, "p:cNvPicPr") : void 0;
  const nvPr = nvPicPr ? getChild(nvPicPr, "p:nvPr") : void 0;
  const blipFill = getBlipFillElement(element);
  const blipFillProps = parseBlipFillProperties(blipFill);
  if (!blipFillProps) {
    return void 0;
  }
  const spPr = getChild(element, "p:spPr");
  const style = getChild(element, "p:style");
  const nonVisual = parseNonVisualProperties(cNvPr);
  const preferRelativeResize = parsePreferRelativeResize(cNvPicPr);
  const pictureLocks = parsePictureLocksFromParent(cNvPicPr);
  const baseProperties = parseShapeProperties(spPr);
  const shapeStyle = parseShapeStyle2(style);
  const properties = resolvePropertiesWithEffects$1(baseProperties, shapeStyle, formatScheme);
  return {
    type: "pic",
    nonVisual: { ...nonVisual, preferRelativeResize, pictureLocks },
    blipFill: blipFillProps,
    properties,
    style: shapeStyle,
    mediaType: detectMediaType(nvPicPr),
    media: parseNonVisualMedia(nvPr)
  };
}
function parseSourceRect(srcRect) {
  if (!srcRect) {
    return void 0;
  }
  return {
    left: pct((getIntAttr(srcRect, "l") ?? 0) / 1e5 * 100),
    top: pct((getIntAttr(srcRect, "t") ?? 0) / 1e5 * 100),
    right: pct((getIntAttr(srcRect, "r") ?? 0) / 1e5 * 100),
    bottom: pct((getIntAttr(srcRect, "b") ?? 0) / 1e5 * 100)
  };
}
function parseTileProperties(tile) {
  if (!tile) {
    return void 0;
  }
  const flip = getAttr(tile, "flip") ?? "none";
  const alignment = parseRectAlignment(getAttr(tile, "algn")) ?? "tl";
  return {
    tx: px((getIntAttr(tile, "tx") ?? 0) * 96 / 914400),
    ty: px((getIntAttr(tile, "ty") ?? 0) * 96 / 914400),
    sx: pct((getIntAttr(tile, "sx") ?? 1e5) / 1e5 * 100),
    sy: pct((getIntAttr(tile, "sy") ?? 1e5) / 1e5 * 100),
    flip,
    alignment
  };
}
function parsePreferRelativeResize(cNvPicPr) {
  if (!cNvPicPr) {
    return void 0;
  }
  return getBoolAttr(cNvPicPr, "preferRelativeResize");
}
function parsePictureLocksFromParent(cNvPicPr) {
  if (!cNvPicPr) {
    return void 0;
  }
  return parsePictureLocksElement(getChild(cNvPicPr, "a:picLocks"));
}
function resolvePropertiesWithEffects$1(properties, shapeStyle, formatScheme) {
  if (!properties.effects) {
    if (shapeStyle?.effectReference && formatScheme) {
      const resolvedEffects = resolveEffectsFromStyleReference(shapeStyle.effectReference, formatScheme.effectStyles);
      if (resolvedEffects) {
        return { ...properties, effects: resolvedEffects };
      }
    }
  }
  return properties;
}
function hasAnyChild(parent, names) {
  for (const name of names) {
    if (getChild(parent, name)) {
      return true;
    }
  }
  return false;
}
function parseGroupLocksElement(element) {
  if (!element) {
    return void 0;
  }
  const noGrp = getBoolAttr(element, "noGrp");
  const noUngrp = getBoolAttr(element, "noUngrp");
  const noSelect = getBoolAttr(element, "noSelect");
  const noRot = getBoolAttr(element, "noRot");
  const noChangeAspect = getBoolAttr(element, "noChangeAspect");
  const noMove = getBoolAttr(element, "noMove");
  const noResize = getBoolAttr(element, "noResize");
  if (noGrp === void 0 && noUngrp === void 0 && noSelect === void 0 && noRot === void 0 && noChangeAspect === void 0 && noMove === void 0 && noResize === void 0) {
    return void 0;
  }
  return {
    noGrp,
    noUngrp,
    noSelect,
    noRot,
    noChangeAspect,
    noMove,
    noResize
  };
}
function parseGroupLocksFromParent(parent) {
  if (!parent) {
    return void 0;
  }
  return parseGroupLocksElement(getChild(parent, "a:grpSpLocks"));
}
function parseGrpShape({
  element,
  ctx,
  masterStylesInfo,
  formatScheme,
  parseShapeElement: parseShapeElement2
}) {
  const nvGrpSpPr = getChild(element, "p:nvGrpSpPr");
  const cNvPr = nvGrpSpPr ? getChild(nvGrpSpPr, "p:cNvPr") : void 0;
  const cNvGrpSpPr = nvGrpSpPr ? getChild(nvGrpSpPr, "p:cNvGrpSpPr") : void 0;
  const groupLocks = parseGroupLocksFromParent(cNvGrpSpPr);
  const grpSpPr = getChild(element, "p:grpSpPr");
  const children2 = [];
  for (const child of element.children) {
    if (!isXmlElement(child)) {
      continue;
    }
    const shape = parseShapeElement2({ element: child, ctx, masterStylesInfo, formatScheme });
    if (shape) {
      children2.push(shape);
    }
  }
  return {
    type: "grpSp",
    nonVisual: {
      ...parseNonVisualProperties(cNvPr),
      groupLocks
    },
    properties: parseGroupShapeProperties(grpSpPr),
    children: children2
  };
}
function parseConnectionTarget(element) {
  if (!element) {
    return void 0;
  }
  const id = getAttr(element, "id");
  const idx = getIntAttr(element, "idx");
  if (!id || idx === void 0) {
    return void 0;
  }
  return { shapeId: id, siteIndex: idx };
}
function parseConnectionTargetFromParent(parent, childName) {
  if (!parent) {
    return void 0;
  }
  return parseConnectionTarget(getChild(parent, childName));
}
function resolvePropertiesWithFill(properties, shapeStyle, formatScheme) {
  if (!properties.fill) {
    if (shapeStyle?.fillReference && formatScheme) {
      const resolvedFill = resolveFillFromStyleReference(shapeStyle.fillReference, formatScheme.fillStyles);
      if (resolvedFill) {
        return { ...properties, fill: resolvedFill };
      }
    }
  }
  return properties;
}
function resolvePropertiesWithEffects(properties, shapeStyle, formatScheme) {
  if (!properties.effects) {
    if (shapeStyle?.effectReference && formatScheme) {
      const resolvedEffects = resolveEffectsFromStyleReference(shapeStyle.effectReference, formatScheme.effectStyles);
      if (resolvedEffects) {
        return { ...properties, effects: resolvedEffects };
      }
    }
  }
  return properties;
}
function parseCxnShape(element, formatScheme) {
  const nvCxnSpPr = getChild(element, "p:nvCxnSpPr");
  const cNvPr = nvCxnSpPr ? getChild(nvCxnSpPr, "p:cNvPr") : void 0;
  const cNvCxnSpPr = nvCxnSpPr ? getChild(nvCxnSpPr, "p:cNvCxnSpPr") : void 0;
  const spPr = getChild(element, "p:spPr");
  const style = getChild(element, "p:style");
  const nonVisual = parseNonVisualProperties(cNvPr);
  const startConnection = parseConnectionTargetFromParent(cNvCxnSpPr, "a:stCxn");
  const endConnection = parseConnectionTargetFromParent(cNvCxnSpPr, "a:endCxn");
  const baseProperties = parseShapeProperties(spPr);
  const shapeStyle = parseShapeStyle2(style);
  const propertiesWithFill = resolvePropertiesWithFill(baseProperties, shapeStyle, formatScheme);
  const properties = resolvePropertiesWithEffects(propertiesWithFill, shapeStyle, formatScheme);
  return {
    type: "cxnSp",
    nonVisual: { ...nonVisual, startConnection, endConnection },
    properties,
    style: shapeStyle
  };
}
function parseTableProperties2(tblPr) {
  if (!tblPr) {
    return {};
  }
  const tableStyleIdEl = getChild(tblPr, "a:tableStyleId");
  const tableStyleId = tableStyleIdEl ? getXmlText(tableStyleIdEl) : void 0;
  return {
    rtl: getBoolAttr(tblPr, "rtl"),
    firstRow: getBoolAttr(tblPr, "firstRow"),
    firstCol: getBoolAttr(tblPr, "firstCol"),
    lastRow: getBoolAttr(tblPr, "lastRow"),
    lastCol: getBoolAttr(tblPr, "lastCol"),
    bandRow: getBoolAttr(tblPr, "bandRow"),
    bandCol: getBoolAttr(tblPr, "bandCol"),
    fill: parseFillFromParent(tblPr),
    effects: parseEffects(tblPr),
    tableStyleId
  };
}
function parseTableColumn(gridCol) {
  return {
    width: getEmuAttr2(gridCol, "w") ?? px(0)
  };
}
function parseTableGrid2(tblGrid) {
  if (!tblGrid) {
    return { columns: [] };
  }
  const columns = [];
  for (const gridCol of getChildren(tblGrid, "a:gridCol")) {
    columns.push(parseTableColumn(gridCol));
  }
  return { columns };
}
function parseCellMargins2(tcPr) {
  const left = getEmuAttr2(tcPr, "marL");
  const right = getEmuAttr2(tcPr, "marR");
  const top = getEmuAttr2(tcPr, "marT");
  const bottom = getEmuAttr2(tcPr, "marB");
  if (left === void 0 && right === void 0 && top === void 0 && bottom === void 0) {
    return void 0;
  }
  const defaultMargin = px(9.6);
  return {
    left: left ?? defaultMargin,
    right: right ?? defaultMargin,
    top: top ?? defaultMargin,
    bottom: bottom ?? defaultMargin
  };
}
function parseCellBorders2(tcPr) {
  const lnL = getChild(tcPr, "a:lnL");
  const lnR = getChild(tcPr, "a:lnR");
  const lnT = getChild(tcPr, "a:lnT");
  const lnB = getChild(tcPr, "a:lnB");
  const lnTlToBr = getChild(tcPr, "a:lnTlToBr");
  const lnBlToTr = getChild(tcPr, "a:lnBlToTr");
  if (!lnL && !lnR && !lnT && !lnB && !lnTlToBr && !lnBlToTr) {
    return void 0;
  }
  return {
    left: parseLine2(lnL),
    right: parseLine2(lnR),
    top: parseLine2(lnT),
    bottom: parseLine2(lnB),
    tlToBr: parseLine2(lnTlToBr),
    blToTr: parseLine2(lnBlToTr)
  };
}
function parseCellHeaders(tcPr) {
  const headersEl = getChild(tcPr, "a:headers");
  if (!headersEl) {
    return void 0;
  }
  const headers = [];
  for (const header of getChildren(headersEl, "a:header")) {
    const valAttr = getAttr(header, "val");
    if (valAttr) {
      headers.push(valAttr);
      continue;
    }
    const textValue = getXmlText(header);
    if (textValue !== void 0 && textValue.length > 0) {
      headers.push(textValue);
    }
  }
  return headers.length > 0 ? headers : void 0;
}
function parseTableCellProperties(tcPr) {
  if (!tcPr) {
    return {};
  }
  const anchor = resolveCellAnchor(getAttr(tcPr, "anchor"));
  const verticalType = resolveCellVerticalType(getAttr(tcPr, "vert"));
  const horzOverflow = resolveCellHorzOverflow(getAttr(tcPr, "horzOverflow"));
  return {
    margins: parseCellMargins2(tcPr),
    anchor,
    anchorCenter: getBoolAttr(tcPr, "anchorCtr"),
    horzOverflow,
    verticalType,
    fill: parseFillFromParent(tcPr),
    borders: parseCellBorders2(tcPr),
    cell3d: parseCell3d(getChild(tcPr, "a:cell3D")),
    headers: parseCellHeaders(tcPr),
    rowSpan: getIntAttr(tcPr, "rowSpan"),
    colSpan: getIntAttr(tcPr, "gridSpan"),
    // Note: OOXML uses gridSpan for columns
    horizontalMerge: getBoolAttr(tcPr, "hMerge"),
    verticalMerge: getBoolAttr(tcPr, "vMerge")
  };
}
function resolveCellAnchor(value) {
  if (value === "t") {
    return "top";
  }
  if (value === "ctr") {
    return "center";
  }
  if (value === "b") {
    return "bottom";
  }
  return void 0;
}
function resolveCellVerticalType(value) {
  if (!value) {
    return void 0;
  }
  return value;
}
function resolveCellHorzOverflow(value) {
  if (value === "clip") {
    return "clip";
  }
  if (value === "overflow") {
    return "overflow";
  }
  return void 0;
}
function parseTableCell2(tc) {
  const txBody = getChild(tc, "a:txBody");
  const tcPr = getChild(tc, "a:tcPr");
  return {
    id: getAttr(tc, "id"),
    properties: parseTableCellProperties(tcPr),
    textBody: parseTextBody(txBody)
  };
}
function parseTableRow2(tr) {
  const cells = [];
  for (const tc of getChildren(tr, "a:tc")) {
    cells.push(parseTableCell2(tc));
  }
  return {
    height: getEmuAttr2(tr, "h") ?? px(0),
    cells
  };
}
function parseTable2(tbl) {
  if (!tbl) {
    return void 0;
  }
  const tblPr = getChild(tbl, "a:tblPr");
  const tblGrid = getChild(tbl, "a:tblGrid");
  const rows = [];
  for (const tr of getChildren(tbl, "a:tr")) {
    rows.push(parseTableRow2(tr));
  }
  return {
    properties: parseTableProperties2(tblPr),
    grid: parseTableGrid2(tblGrid),
    rows
  };
}
function parseGraphicFrameLocks(element) {
  if (!element) {
    return void 0;
  }
  const noGrp = getBoolAttr(element, "noGrp");
  const noDrilldown = getBoolAttr(element, "noDrilldown");
  const noSelect = getBoolAttr(element, "noSelect");
  const noChangeAspect = getBoolAttr(element, "noChangeAspect");
  const noMove = getBoolAttr(element, "noMove");
  const noResize = getBoolAttr(element, "noResize");
  if (noGrp === void 0 && noDrilldown === void 0 && noSelect === void 0 && noChangeAspect === void 0 && noMove === void 0 && noResize === void 0) {
    return void 0;
  }
  return {
    noGrp,
    noDrilldown,
    noSelect,
    noChangeAspect,
    noMove,
    noResize
  };
}
function parseOleObjectFollowColorScheme(value) {
  switch (value) {
    case "full":
    case "none":
    case "textAndBackground":
      return value;
    default:
      return void 0;
  }
}
function parseGraphicContent(graphicData) {
  if (!graphicData) {
    return void 0;
  }
  const uri = getAttr(graphicData, "uri") ?? "";
  const tbl = getChild(graphicData, "a:tbl");
  if (tbl) {
    const table = parseTable2(tbl);
    if (table) {
      return { type: "table", data: { table } };
    }
  }
  const chart = getChild(graphicData, "c:chart");
  if (chart) {
    const resourceId = getAttr(chart, "r:id");
    if (resourceId) {
      return { type: "chart", data: { resourceId } };
    }
  }
  const relIds = getChild(graphicData, "dgm:relIds");
  if (relIds) {
    return {
      type: "diagram",
      data: {
        dataResourceId: getAttr(relIds, "r:dm"),
        layoutResourceId: getAttr(relIds, "r:lo"),
        styleResourceId: getAttr(relIds, "r:qs"),
        colorResourceId: getAttr(relIds, "r:cs")
      }
    };
  }
  const oleObj = getOleObjElement(graphicData);
  if (oleObj) {
    const embed = getChild(oleObj, "p:embed");
    const followColorScheme = parseFollowColorScheme(embed);
    const picProps = parseOleObjectPreview(oleObj);
    return {
      type: "oleObject",
      data: {
        resourceId: getAttr(oleObj, "r:id"),
        progId: getAttr(oleObj, "progId"),
        name: getAttr(oleObj, "name"),
        spid: parseShapeId(getAttr(oleObj, "spid")),
        imgW: getIntAttr(oleObj, "imgW"),
        imgH: getIntAttr(oleObj, "imgH"),
        showAsIcon: getBoolAttr(oleObj, "showAsIcon"),
        followColorScheme,
        pic: picProps
      }
    };
  }
  return { type: "unknown", uri };
}
function parseGraphicFrame(element) {
  const nvGraphicFramePr = getChild(element, "p:nvGraphicFramePr");
  const cNvPr = nvGraphicFramePr ? getChild(nvGraphicFramePr, "p:cNvPr") : void 0;
  const cNvGraphicFramePr = nvGraphicFramePr ? getChild(nvGraphicFramePr, "p:cNvGraphicFramePr") : void 0;
  const graphicFrameLocks = parseGraphicFrameLocksFromParent(cNvGraphicFramePr);
  const xfrm = getChild(element, "p:xfrm");
  const transform = parseTransform(xfrm);
  if (!transform) {
    return void 0;
  }
  const graphic = getChild(element, "a:graphic");
  const graphicData = graphic ? getChild(graphic, "a:graphicData") : void 0;
  const content = parseGraphicContent(graphicData);
  if (!content) {
    return void 0;
  }
  return {
    type: "graphicFrame",
    nonVisual: {
      ...parseNonVisualProperties(cNvPr),
      graphicFrameLocks
    },
    transform,
    content
  };
}
function parseOleObjectPreview(oleObj) {
  const pic = getChild(oleObj, "p:pic");
  if (!pic) {
    return void 0;
  }
  const blipFill = getChild(pic, "p:blipFill");
  return parseBlipFillProperties(blipFill);
}
function parseFollowColorScheme(embed) {
  if (!embed) {
    return void 0;
  }
  return parseOleObjectFollowColorScheme(getAttr(embed, "followColorScheme"));
}
function parseGraphicFrameLocksFromParent(parent) {
  if (!parent) {
    return void 0;
  }
  return parseGraphicFrameLocks(getChild(parent, "a:graphicFrameLocks"));
}
function parseContentPartShape(element) {
  const id = getAttr(element, "r:id");
  if (!id) {
    return void 0;
  }
  const bwMode = parseBlackWhiteMode(getAttr(element, "bwMode"));
  return {
    type: "contentPart",
    contentPart: {
      id,
      bwMode
    }
  };
}
var LOCKED_CANVAS_NAME_MAP = /* @__PURE__ */ new Map([
  ["a:nvGrpSpPr", "p:nvGrpSpPr"],
  ["a:grpSpPr", "p:grpSpPr"],
  ["a:grpSp", "p:grpSp"],
  ["a:txSp", "p:sp"],
  ["a:sp", "p:sp"],
  ["a:pic", "p:pic"],
  ["a:cxnSp", "p:cxnSp"],
  ["a:graphicFrame", "p:graphicFrame"],
  ["a:nvSpPr", "p:nvSpPr"],
  ["a:cNvPr", "p:cNvPr"],
  ["a:cNvSpPr", "p:cNvSpPr"],
  ["a:nvPicPr", "p:nvPicPr"],
  ["a:cNvPicPr", "p:cNvPicPr"],
  ["a:nvCxnSpPr", "p:nvCxnSpPr"],
  ["a:cNvCxnSpPr", "p:cNvCxnSpPr"],
  ["a:nvGraphicFramePr", "p:nvGraphicFramePr"],
  ["a:cNvGraphicFramePr", "p:cNvGraphicFramePr"],
  ["a:spPr", "p:spPr"],
  ["a:txBody", "p:txBody"],
  ["a:style", "p:style"],
  ["a:blipFill", "p:blipFill"],
  ["a:oleObj", "p:oleObj"]
]);
function remapLockedCanvasName(name) {
  return LOCKED_CANVAS_NAME_MAP.get(name) ?? name;
}
function mapLockedCanvasElement(newName, source) {
  return {
    type: "element",
    name: newName,
    attrs: source.attrs,
    children: source.children.map((child) => {
      if (isXmlElement(child)) {
        const remapped = remapLockedCanvasName(child.name);
        if (remapped !== child.name) {
          return mapLockedCanvasElement(remapped, child);
        }
      }
      return child;
    })
  };
}
function parseShapeElement({
  element,
  ctx,
  masterStylesInfo,
  formatScheme
}) {
  switch (element.name) {
    case "p:sp":
      return parseSpShape({ element, ctx, masterStylesInfo, formatScheme });
    case "a:txSp": {
      const mapped = mapLockedCanvasElement("p:sp", element);
      const parsed = parseSpShape({ element: mapped, ctx, masterStylesInfo, formatScheme });
      if (parsed?.type !== "sp") {
        return parsed;
      }
      const useShapeTextRect = getChild(element, "a:useSpRect") !== void 0;
      return useShapeTextRect ? { ...parsed, useShapeTextRect } : parsed;
    }
    case "p:pic":
      return parsePicShape(element, formatScheme);
    case "p:grpSp":
      return parseGrpShape({
        element,
        ctx,
        masterStylesInfo,
        formatScheme,
        parseShapeElement: ({ element: el, ctx: c, masterStylesInfo: m, formatScheme: f }) => parseShapeElement({ element: el, ctx: c, masterStylesInfo: m, formatScheme: f })
      });
    case "p:cxnSp":
      return parseCxnShape(element, formatScheme);
    case "p:graphicFrame":
      return parseGraphicFrame(element);
    case "p:contentPart":
      return parseContentPartShape(element);
    case "lc:lockedCanvas": {
      const mapped = mapLockedCanvasElement("p:grpSp", element);
      return parseGrpShape({
        element: mapped,
        ctx,
        masterStylesInfo,
        formatScheme,
        parseShapeElement: ({ element: el, ctx: c, masterStylesInfo: m, formatScheme: f }) => parseShapeElement({ element: el, ctx: c, masterStylesInfo: m, formatScheme: f })
      });
    }
    case "mc:AlternateContent": {
      const choices = getChildren(element, "mc:Choice");
      for (const choice of choices) {
        const requires = getAttr(choice, "Requires");
        if (isChoiceSupported(requires)) {
          for (const child of choice.children) {
            if (isXmlElement(child)) {
              const shape = parseShapeElement({ element: child, ctx, masterStylesInfo, formatScheme });
              if (shape) {
                return shape;
              }
            }
          }
        }
      }
      const fallback = getChild(element, "mc:Fallback");
      if (fallback) {
        for (const child of fallback.children) {
          if (isXmlElement(child)) {
            const shape = parseShapeElement({ element: child, ctx, masterStylesInfo, formatScheme });
            if (shape) {
              return shape;
            }
          }
        }
      }
      return void 0;
    }
    default:
      return void 0;
  }
}
function parseShapeTree({
  spTree,
  ctx,
  masterStylesInfo,
  formatScheme
}) {
  if (!spTree) {
    return [];
  }
  const shapes = [];
  for (const child of spTree.children) {
    if (!isXmlElement(child)) {
      continue;
    }
    if (child.name === "p:nvGrpSpPr" || child.name === "p:grpSpPr") {
      continue;
    }
    const shape = parseShapeElement({ element: child, ctx, masterStylesInfo, formatScheme });
    if (shape) {
      shapes.push(shape);
    }
  }
  return shapes;
}
function resolveBgRef(bgRef, formatScheme) {
  const idxStr = bgRef.attrs?.idx;
  if (idxStr === void 0) {
    return void 0;
  }
  const idx = parseInt(idxStr, 10);
  if (Number.isNaN(idx) || idx < 1) {
    return void 0;
  }
  const styles = idx >= 1001 ? formatScheme.bgFillStyles : formatScheme.fillStyles;
  const styleIndex = idx >= 1001 ? idx - 1001 : idx - 1;
  if (styleIndex < 0 || styleIndex >= styles.length) {
    return void 0;
  }
  const styleFill = styles[styleIndex];
  const phClrFill = parseFillFromParent(bgRef);
  if (phClrFill && phClrFill.type === "solidFill" && styleFill.type === "gradientFill") {
    return {
      fill: {
        ...styleFill,
        stops: styleFill.stops.map((stop) => {
          if (stop.color.spec.type === "scheme" && stop.color.spec.value === "phClr") {
            return { ...stop, color: phClrFill.color };
          }
          return stop;
        })
      }
    };
  }
  if (phClrFill && phClrFill.type === "solidFill" && styleFill.type === "solidFill") {
    return { fill: phClrFill };
  }
  return { fill: styleFill };
}
function parseBackground(element, formatScheme) {
  if (!element) {
    return void 0;
  }
  const bgPr = getChild(element, "p:bgPr");
  if (bgPr) {
    const fill = parseFillFromParent(bgPr);
    if (fill) {
      return {
        fill,
        shadeToTitle: getBoolAttr(bgPr, "shadeToTitle")
      };
    }
  }
  const bgRef = getChild(element, "p:bgRef");
  if (bgRef && formatScheme) {
    return resolveBgRef(bgRef, formatScheme);
  }
  return void 0;
}
function parseTransition(element) {
  if (!element) {
    return void 0;
  }
  const { type, element: typeElement } = findTransitionType(element);
  const spd = getAttr(element, "spd");
  const duration = spd === "slow" ? 2e3 : spd === "med" ? 1e3 : 500;
  const { direction, orientation, spokes, inOutDirection } = parseTransitionAttributes(type, typeElement);
  return {
    type,
    duration,
    advanceOnClick: getBoolAttrOr2(element, "advClick", true),
    advanceAfter: getAdvanceAfter(element),
    sound: parseTransitionSound(element),
    direction,
    orientation,
    spokes,
    inOutDirection
  };
}
function parseTransitionAttributes(type, element) {
  if (!element) {
    return { direction: void 0, orientation: void 0, spokes: void 0, inOutDirection: void 0 };
  }
  if (type === "wipe" || type === "push" || type === "cover" || type === "pull" || type === "strips") {
    const dir = getAttr(element, "dir");
    const validDirs = ["l", "r", "u", "d", "ld", "lu", "rd", "ru"];
    if (dir && validDirs.includes(dir)) {
      return {
        direction: dir,
        orientation: void 0,
        spokes: void 0,
        inOutDirection: void 0
      };
    }
  }
  if (type === "blinds" || type === "checker" || type === "comb" || type === "randomBar") {
    const dir = getAttr(element, "dir");
    if (dir === "horz" || dir === "vert") {
      return {
        direction: void 0,
        orientation: dir,
        spokes: void 0,
        inOutDirection: void 0
      };
    }
  }
  if (type === "wheel") {
    const spkCnt = getAttr(element, "spkCnt");
    const count = spkCnt ? parseInt(spkCnt, 10) : 1;
    const validSpokes = [1, 2, 3, 4, 8];
    const spokesVal = validSpokes.includes(count) ? count : 1;
    return {
      direction: void 0,
      orientation: void 0,
      spokes: spokesVal,
      inOutDirection: void 0
    };
  }
  if (type === "split" || type === "zoom") {
    const dir = getAttr(element, "dir");
    if (dir === "in" || dir === "out") {
      return {
        direction: void 0,
        orientation: void 0,
        spokes: void 0,
        inOutDirection: dir
      };
    }
  }
  return { direction: void 0, orientation: void 0, spokes: void 0, inOutDirection: void 0 };
}
function getTransitionElement(parent) {
  if (!parent) {
    return void 0;
  }
  const transition = getChild(parent, "p:transition");
  if (transition) {
    return transition;
  }
  const alternateContent = getChild(parent, "mc:AlternateContent");
  if (!alternateContent) {
    return void 0;
  }
  return processAlternateContent(alternateContent, "p:transition");
}
function parseTransitionSound(element) {
  const sndAc = getChild(element, "p:sndAc");
  if (!sndAc) {
    return void 0;
  }
  const stSnd = getChild(sndAc, "p:stSnd");
  if (!stSnd) {
    return void 0;
  }
  const snd = getChild(stSnd, "p:snd");
  if (!snd) {
    return void 0;
  }
  const resourceId = getAttr(snd, "r:embed");
  if (!resourceId) {
    return void 0;
  }
  return {
    resourceId,
    name: getAttr(snd, "name"),
    loop: getBoolAttr(stSnd, "loop")
  };
}
function isTransitionType(value) {
  const types = [
    "blinds",
    "checker",
    "circle",
    "comb",
    "cover",
    "cut",
    "diamond",
    "dissolve",
    "fade",
    "newsflash",
    "plus",
    "pull",
    "push",
    "random",
    "randomBar",
    "split",
    "strips",
    "wedge",
    "wheel",
    "wipe",
    "zoom",
    "none"
  ];
  return types.includes(value);
}
function findTransitionType(element) {
  for (const child of element.children) {
    if (typeof child !== "object" || !("type" in child)) {
      continue;
    }
    const el = child;
    if (el.type !== "element") {
      continue;
    }
    if (!el.name.startsWith("p:")) {
      continue;
    }
    const transType = el.name.substring(2);
    if (isTransitionType(transType)) {
      return { type: transType, element: el };
    }
  }
  return { type: "none", element: void 0 };
}
function getAdvanceAfter(element) {
  const advTm = getAttr(element, "advTm");
  if (!advTm) {
    return void 0;
  }
  return parseInt(advTm, 10);
}
function parseColorMapping(element) {
  const map = {};
  for (const [key, value] of Object.entries(element.attrs)) {
    if (value !== void 0) {
      map[key] = value;
    }
  }
  return map;
}
function parseColorMapOverride(element) {
  if (!element) {
    return void 0;
  }
  if (getChild(element, "a:masterClrMapping")) {
    return { type: "none" };
  }
  const overrideClrMapping = getChild(element, "a:overrideClrMapping");
  if (overrideClrMapping) {
    return {
      type: "override",
      mappings: parseColorMapping(overrideClrMapping)
    };
  }
  return void 0;
}
function parseCustomerDataList(element) {
  if (!element) {
    return void 0;
  }
  const entries = getChildren(element, "p:custData").map((custData) => custData.attrs["r:id"]).filter((id) => typeof id === "string" && id.length > 0).map((rId) => ({ rId }));
  return entries.length > 0 ? entries : void 0;
}
function parseSlide(content, context) {
  if (!content) {
    return void 0;
  }
  const sld = getByPath(content, ["p:sld"]);
  if (!sld) {
    return void 0;
  }
  const cSld = getChild(sld, "p:cSld");
  if (!cSld) {
    return void 0;
  }
  const spTree = getChild(cSld, "p:spTree");
  const bg = getChild(cSld, "p:bg");
  const custDataLst = getChild(cSld, "p:custDataLst");
  const clrMapOvr = getChild(sld, "p:clrMapOvr");
  const transition = getTransitionElement(sld);
  const placeholderCtx = context?.placeholderContext;
  const masterStylesInfo = context?.masterStylesInfo;
  const formatScheme = context?.formatScheme;
  return {
    background: parseBackground(bg),
    shapes: parseShapeTree({ spTree, ctx: placeholderCtx, masterStylesInfo, formatScheme }),
    colorMapOverride: parseColorMapOverride(clrMapOvr),
    customerData: parseCustomerDataList(custDataLst),
    transition: parseTransition(transition),
    showMasterShapes: getBoolAttr(sld, "showMasterSp"),
    showMasterPhAnim: getBoolAttr(sld, "showMasterPhAnim")
  };
}

// node_modules/aurochs/dist/_shared/zip-adapter-BaUV2FHK.js
var CDATA_REGEX = /<!\[CDATA\[(.*?)\]\]>/g;
function stripCdata(content) {
  return content.replace(CDATA_REGEX, "$1");
}
function getBasename(path) {
  const filename = path.split("/").pop() ?? "";
  const dotIndex = filename.lastIndexOf(".");
  return dotIndex > 0 ? filename.substring(0, dotIndex) : filename;
}
function replaceDspNamespace(content) {
  return content.replace(/dsp:/g, "p:");
}
function createZipAdapter(file) {
  return {
    file(filePath) {
      if (!file.exists(filePath)) {
        return null;
      }
      return {
        asText() {
          const text = file.readText(filePath);
          if (text === null) {
            return "";
          }
          return text;
        },
        asArrayBuffer() {
          const binary = file.readBinary(filePath);
          if (binary === null) {
            return new ArrayBuffer(0);
          }
          return binary;
        }
      };
    },
    load() {
      throw new Error("ZipFile.load() is not supported in PackageFile adapter");
    }
  };
}

// node_modules/aurochs/dist/_shared/relationships-FMVMa5qS.js
var RELATIONSHIP_TYPES2 = {
  /** Slide relationship (presentation.xml -> slideN.xml) */
  SLIDE: PRESENTATIONML_RELATIONSHIP_TYPES.slide,
  /** Slide layout relationship */
  SLIDE_LAYOUT: PRESENTATIONML_RELATIONSHIP_TYPES.slideLayout,
  /** Slide master relationship */
  SLIDE_MASTER: PRESENTATIONML_RELATIONSHIP_TYPES.slideMaster,
  /** Theme relationship */
  THEME: OFFICE_RELATIONSHIP_TYPES.theme,
  /** Theme override relationship */
  THEME_OVERRIDE: OFFICE_RELATIONSHIP_TYPES.themeOverride,
  /** Image relationship */
  IMAGE: OFFICE_RELATIONSHIP_TYPES.image,
  /** Chart relationship */
  CHART: OFFICE_RELATIONSHIP_TYPES.chart,
  /** Hyperlink relationship */
  HYPERLINK: OFFICE_RELATIONSHIP_TYPES.hyperlink,
  /** Notes slide relationship */
  NOTES: PRESENTATIONML_RELATIONSHIP_TYPES.notesSlide,
  /** Diagram drawing relationship (DrawingML diagrams) */
  DIAGRAM_DRAWING: PRESENTATIONML_RELATIONSHIP_TYPES.diagramDrawing,
  /** VML drawing relationship */
  VML_DRAWING: OFFICE_RELATIONSHIP_TYPES.vmlDrawing,
  /** OLE object relationship */
  OLE_OBJECT: OFFICE_RELATIONSHIP_TYPES.oleObject,
  /** Video relationship */
  VIDEO: OFFICE_RELATIONSHIP_TYPES.video,
  /** Audio relationship */
  AUDIO: OFFICE_RELATIONSHIP_TYPES.audio
};
function createEmptyResourceMap2() {
  return {
    getTarget: () => void 0,
    getType: () => void 0,
    getTargetByType: () => void 0,
    getAllTargetsByType: () => []
  };
}

// node_modules/aurochs/dist/_shared/path-D69nMoL8.js
function assertPackagePath(value, label) {
  if (value.length === 0) {
    throw new Error(`${label} must not be empty`);
  }
  if (value.includes("\\")) {
    throw new Error(`${label} must not contain backslashes: ${value}`);
  }
  if (value.includes("\0")) {
    throw new Error(`${label} must not contain null bytes`);
  }
}
function isAbsoluteIri(value) {
  return /^[A-Za-z][A-Za-z0-9+.-]*:/.test(value);
}
function dirnamePosixPath(p) {
  const trimmed = p.replace(/\/+$/gu, "");
  const index = trimmed.lastIndexOf("/");
  if (index === -1) {
    return ".";
  }
  if (index === 0) {
    return "/";
  }
  return trimmed.slice(0, index);
}
function basenamePosixPath(p) {
  const trimmed = p.replace(/\/+$/gu, "");
  const index = trimmed.lastIndexOf("/");
  return index === -1 ? trimmed : trimmed.slice(index + 1);
}
function normalizePosixPath(p) {
  const absolute = p.startsWith("/");
  const parts = p.split("/").filter((part) => part.length > 0);
  const stack = parts.reduce((acc, part) => {
    if (part === ".") {
      return acc;
    }
    if (part === "..") {
      if (acc.length > 0 && acc[acc.length - 1] !== "..") {
        acc.pop();
        return acc;
      }
      if (!absolute) {
        acc.push("..");
      }
      return acc;
    }
    acc.push(part);
    return acc;
  }, []);
  const joined = stack.join("/");
  if (absolute) {
    return `/${joined}`;
  }
  return joined.length === 0 ? "." : joined;
}
function buildRelativeTarget(sourcePart, targetPart) {
  assertPackagePath(sourcePart, "sourcePart");
  assertPackagePath(targetPart, "targetPart");
  const sourceDir = dirnamePosixPath(sourcePart);
  const targetDir = dirnamePosixPath(targetPart);
  const targetFile = basenamePosixPath(targetPart);
  if (sourceDir === targetDir) {
    return targetFile;
  }
  const sourceParts = sourceDir === "." ? [] : sourceDir.split("/");
  const targetParts = targetDir === "." ? [] : targetDir.split("/");
  let common = 0;
  while (common < sourceParts.length && common < targetParts.length && sourceParts[common] === targetParts[common]) {
    common++;
  }
  const ups = sourceParts.length - common;
  const downs = targetParts.slice(common);
  return [...Array(ups).fill(".."), ...downs, targetFile].join("/");
}
function getRelationshipPartPath(partPath) {
  assertPackagePath(partPath, "partPath");
  const dir = dirnamePosixPath(partPath);
  const filename = basenamePosixPath(partPath);
  if (dir === ".") {
    return `_rels/${filename}.rels`;
  }
  return `${dir}/_rels/${filename}.rels`;
}

// node_modules/aurochs/dist/_shared/parse-chart-CQIWhPR9.js
function extractFontSpec(fontElement) {
  if (fontElement === void 0) {
    return { latin: void 0, eastAsian: void 0, complexScript: void 0 };
  }
  const latin = getChild(fontElement, "a:latin");
  const ea = getChild(fontElement, "a:ea");
  const cs = getChild(fontElement, "a:cs");
  const supplementalFonts = collectSupplementalFonts(fontElement);
  return {
    latin: latin?.attrs?.typeface,
    eastAsian: ea?.attrs?.typeface,
    complexScript: cs?.attrs?.typeface,
    supplementalFonts: Object.keys(supplementalFonts).length > 0 ? supplementalFonts : void 0
  };
}
function collectSupplementalFonts(fontElement) {
  const fonts = {};
  for (const child of getChildren(fontElement, "a:font")) {
    const script = getAttr(child, "script");
    const typeface = getAttr(child, "typeface");
    if (script !== void 0 && typeface !== void 0 && typeface !== "") {
      fonts[script] = typeface;
    }
  }
  return fonts;
}
var EMPTY_FONT_SPEC = {
  latin: void 0,
  eastAsian: void 0,
  complexScript: void 0
};
function parseFontSchemeFromElements(majorFontElement, minorFontElement) {
  return {
    majorFont: majorFontElement ? extractFontSpec(majorFontElement) : EMPTY_FONT_SPEC,
    minorFont: minorFontElement ? extractFontSpec(minorFontElement) : EMPTY_FONT_SPEC
  };
}

// node_modules/aurochs/dist/_shared/theme-parser-CbNAQ21c.js
function resolveRelationshipTargetPath(sourcePartPath, target) {
  if (!sourcePartPath) {
    throw new Error("sourcePartPath is required");
  }
  if (!target) {
    throw new Error("target is required");
  }
  if (isAbsoluteIri(target)) {
    throw new Error(`External/absolute target is not supported here: ${target}`);
  }
  if (target.startsWith("/")) {
    return normalizePosixPath(target.substring(1));
  }
  const dir = dirnamePosixPath(sourcePartPath);
  const baseDir = dir === "." ? "" : `${dir}/`;
  return normalizePosixPath(baseDir + target);
}
function resolvePartPath2(basePath, reference) {
  if (isAbsoluteIri(reference)) {
    return reference;
  }
  return resolveRelationshipTargetPath(basePath, reference);
}
function parseRelationships(relsXml, sourcePath) {
  if (relsXml === null) {
    return createEmptyResourceMap();
  }
  const relationshipsElement = getByPath(relsXml, ["Relationships"]);
  if (!relationshipsElement) {
    return createEmptyResourceMap();
  }
  const relationships = getChildren(relationshipsElement, "Relationship");
  const entries = {};
  for (const rel of relationships) {
    const id = rel.attrs["Id"];
    const type = rel.attrs["Type"];
    const target = rel.attrs["Target"];
    const targetMode = rel.attrs["TargetMode"];
    if (id !== void 0 && target !== void 0) {
      const resolvedTarget = targetMode === "External" ? target : resolvePartPath2(sourcePath, target);
      entries[id] = { type: type ?? "", target: resolvedTarget };
    }
  }
  return createResourceMap(entries);
}
function parseRelationshipsFromText(relsText, sourcePath) {
  if (relsText === null || relsText === void 0) {
    return createEmptyResourceMap();
  }
  return parseRelationships(parseXml(relsText), sourcePath);
}
function parseFontScheme(themeContent) {
  if (themeContent === null) {
    return {
      majorFont: { latin: void 0, eastAsian: void 0, complexScript: void 0 },
      minorFont: { latin: void 0, eastAsian: void 0, complexScript: void 0 }
    };
  }
  const fontSchemeEl = getByPath(themeContent, ["a:theme", "a:themeElements", "a:fontScheme"]);
  const majorFont = fontSchemeEl !== void 0 ? getChild(fontSchemeEl, "a:majorFont") : void 0;
  const minorFont = fontSchemeEl !== void 0 ? getChild(fontSchemeEl, "a:minorFont") : void 0;
  return parseFontSchemeFromElements(majorFont, minorFont);
}

// node_modules/aurochs/dist/pptx/renderer/render-options/index.js
var DEFAULT_RENDER_OPTIONS = {
  dialect: "ecma376",
  lineSpacingMode: "fontSizeMultiplier",
  baselineMode: "svgBaseline",
  libreofficeLineSpacingFactor: 0.75,
  tableScalingMode: "natural"
  // ECMA-376: no scaling, use natural dimensions
};

// node_modules/aurochs/dist/_shared/pptx-loader-Dt2zo0OU.js
var EMPTY_SCOPE = {
  ignorablePrefixes: /* @__PURE__ */ new Set(),
  processContentElements: /* @__PURE__ */ new Set()
};
function parseSpaceSeparatedList(value) {
  if (!value) {
    return [];
  }
  return value.split(/\s+/).filter((item) => item.length > 0);
}
function parseElementPrefix(name) {
  const idx = name.indexOf(":");
  if (idx === -1) {
    return void 0;
  }
  return name.slice(0, idx);
}
function extendScope(element, scope) {
  const ignorable = new Set(scope.ignorablePrefixes);
  const processContent2 = new Set(scope.processContentElements);
  for (const prefix of parseSpaceSeparatedList(getAttr(element, "mc:Ignorable"))) {
    ignorable.add(prefix);
  }
  for (const name of parseSpaceSeparatedList(getAttr(element, "mc:ProcessContent"))) {
    processContent2.add(name);
  }
  return { ignorablePrefixes: ignorable, processContentElements: processContent2 };
}
function assertMustUnderstand(element, supportedPrefixes) {
  const requiredPrefixes = parseSpaceSeparatedList(getAttr(element, "mc:MustUnderstand"));
  if (requiredPrefixes.length === 0) {
    return;
  }
  const unsupported = requiredPrefixes.filter((prefix) => !supportedPrefixes.has(prefix));
  if (unsupported.length === 0) {
    return;
  }
  throw new Error(
    `Unsupported mc:MustUnderstand prefixes: ${unsupported.join(", ")} (element: ${element.name})`
  );
}
function processNodes(nodes, scope, supportedPrefixes) {
  const result = [];
  for (const node of nodes) {
    if (!isXmlElement(node)) {
      result.push(node);
      continue;
    }
    const processed = processElement(node, scope, supportedPrefixes);
    result.push(...processed);
  }
  return result;
}
function processElement(element, scope, supportedPrefixes) {
  const nextScope = extendScope(element, scope);
  assertMustUnderstand(element, supportedPrefixes);
  const prefix = parseElementPrefix(element.name);
  const isIgnorable = prefix === void 0 ? false : nextScope.ignorablePrefixes.has(prefix);
  const shouldProcessContent = nextScope.processContentElements.has(element.name);
  const children2 = processNodes(element.children, nextScope, supportedPrefixes);
  if (isIgnorable) {
    return shouldProcessContent ? children2 : [];
  }
  return [
    {
      ...element,
      children: children2
    }
  ];
}
function applyMarkupCompatibility(document, options) {
  if (!options?.supportedPrefixes) {
    throw new Error("MarkupCompatibilityOptions.supportedPrefixes is required.");
  }
  const supportedPrefixes = new Set(options.supportedPrefixes);
  const children2 = processNodes(document.children, EMPTY_SCOPE, supportedPrefixes);
  return { children: children2 };
}
var DEFAULT_SLIDE_SIZE = {
  width: px(DEFAULT_SLIDE_WIDTH_PX),
  height: px(DEFAULT_SLIDE_HEIGHT_PX)
};
function parseSlideSizeFromXml(presentationXml) {
  if (presentationXml === null) {
    return DEFAULT_SLIDE_SIZE;
  }
  const sldSz = getByPath(presentationXml, ["p:presentation", "p:sldSz"]);
  if (sldSz === void 0) {
    return DEFAULT_SLIDE_SIZE;
  }
  const cx = parseInt(sldSz.attrs["cx"] ?? "0", 10);
  const cy = parseInt(sldSz.attrs["cy"] ?? "0", 10);
  return {
    width: px(cx * SLIDE_FACTOR | 0),
    height: px(cy * SLIDE_FACTOR | 0)
  };
}
function parseDefaultTextStyle(presentationXml) {
  if (presentationXml === null) {
    return null;
  }
  const node = getByPath(presentationXml, ["p:presentation", "p:defaultTextStyle"]);
  if (node === void 0) {
    return null;
  }
  return parseTextStyleLevels(node) ?? null;
}
function parseAppVersion(appXml) {
  if (appXml === null) {
    return null;
  }
  const versionStr = getTextByPath(appXml, ["Properties", "AppVersion"]);
  if (versionStr === void 0) {
    return null;
  }
  return parseInt(versionStr, 10);
}
function parseTableCellBorders(tcBdr) {
  if (!tcBdr) {
    return void 0;
  }
  const left = parseLine2(getChild(tcBdr, "a:left"));
  const right = parseLine2(getChild(tcBdr, "a:right"));
  const top = parseLine2(getChild(tcBdr, "a:top"));
  const bottom = parseLine2(getChild(tcBdr, "a:bottom"));
  const insideH = parseLine2(getChild(tcBdr, "a:insideH"));
  const insideV = parseLine2(getChild(tcBdr, "a:insideV"));
  const tlToBr = parseLine2(getChild(tcBdr, "a:tl2br"));
  const blToTr = parseLine2(getChild(tcBdr, "a:tr2bl"));
  if (!left && !right && !top && !bottom && !insideH && !insideV && !tlToBr && !blToTr) {
    return void 0;
  }
  return {
    left: left ?? void 0,
    right: right ?? void 0,
    top: top ?? void 0,
    bottom: bottom ?? void 0,
    insideH: insideH ?? void 0,
    insideV: insideV ?? void 0,
    tlToBr: tlToBr ?? void 0,
    blToTr: blToTr ?? void 0
  };
}
function parseTableCellStyle(tcStyle) {
  if (!tcStyle) {
    return void 0;
  }
  const fillContainer = getChild(tcStyle, "a:fill");
  const fill = fillContainer ? parseFillFromParent(fillContainer) : void 0;
  const fillRef = parseStyleReference(getChild(tcStyle, "a:fillRef"));
  const borders = parseTableCellBorders(getChild(tcStyle, "a:tcBdr"));
  const cell3d = parseCell3d(getChild(tcStyle, "a:cell3D"));
  if (!fill && !fillRef && !borders && !cell3d) {
    return void 0;
  }
  return {
    fill,
    fillReference: fillRef ? { index: fillRef.index, color: fillRef.color } : void 0,
    borders,
    cell3d
  };
}
function parseTableCellTextStyle(tcTxStyle) {
  if (!tcTxStyle) {
    return void 0;
  }
  const fontReference = parseFontReference(getChild(tcTxStyle, "a:fontRef"));
  if (!fontReference) {
    return void 0;
  }
  return { fontReference };
}
function parseTablePartStyle(part) {
  if (!part) {
    return void 0;
  }
  const tcStyle = parseTableCellStyle(getChild(part, "a:tcStyle"));
  const textProperties = parseTableCellTextStyle(getChild(part, "a:tcTxStyle"));
  if (!tcStyle && !textProperties) {
    return void 0;
  }
  return {
    ...tcStyle,
    textProperties
  };
}
function parseTableStyle(element) {
  const styleId2 = getAttr(element, "styleId");
  if (!styleId2) {
    return void 0;
  }
  return {
    id: styleId2,
    name: getAttr(element, "styleName"),
    tblBg: parseFillFromParent(getChild(element, "a:tblBg")),
    wholeTbl: parseTablePartStyle(getChild(element, "a:wholeTbl")),
    band1H: parseTablePartStyle(getChild(element, "a:band1H")),
    band2H: parseTablePartStyle(getChild(element, "a:band2H")),
    band1V: parseTablePartStyle(getChild(element, "a:band1V")),
    band2V: parseTablePartStyle(getChild(element, "a:band2V")),
    firstCol: parseTablePartStyle(getChild(element, "a:firstCol")),
    lastCol: parseTablePartStyle(getChild(element, "a:lastCol")),
    firstRow: parseTablePartStyle(getChild(element, "a:firstRow")),
    lastRow: parseTablePartStyle(getChild(element, "a:lastRow")),
    seCell: parseTablePartStyle(getChild(element, "a:seCell")),
    swCell: parseTablePartStyle(getChild(element, "a:swCell")),
    neCell: parseTablePartStyle(getChild(element, "a:neCell")),
    nwCell: parseTablePartStyle(getChild(element, "a:nwCell"))
  };
}
function parseTableStyleList(tblStyleLst) {
  if (!tblStyleLst) {
    return void 0;
  }
  const styles = [];
  for (const tblStyle of getChildren(tblStyleLst, "a:tblStyle")) {
    const parsed = parseTableStyle(tblStyle);
    if (parsed) {
      styles.push(parsed);
    }
  }
  return {
    defaultStyleId: getAttr(tblStyleLst, "def"),
    styles
  };
}
var MARKUP_COMPATIBILITY_OPTIONS = {
  supportedPrefixes: ["a", "c", "dgm", "dsp", "mc", "o", "p", "r", "v", "wp", "wpc", "wpg", "wsp", "wgp", "xdr"]
};
function processContent(text, appVersion, isSlideContent) {
  if (isSlideContent && appVersion <= 12) {
    return stripCdata(text);
  }
  return text;
}
function readPart(file, path, options) {
  const appVersion = options?.appVersion ?? 16;
  const isSlideContent = options?.isSlideContent ?? false;
  const text = file.readText(path);
  if (text === null) {
    return null;
  }
  const content = processContent(text, appVersion, isSlideContent);
  const document = parseXml(content);
  return applyMarkupCompatibility(document, MARKUP_COMPATIBILITY_OPTIONS);
}
function loadRelationships(file, partPath) {
  const relsPath = getRelationshipPartPath(partPath);
  const relsText = file.readText(relsPath);
  if (relsText === null) {
    return createEmptyResourceMap2();
  }
  return parseRelationshipsFromText(relsText, partPath);
}
function findLayoutPath(resources) {
  return resources.getTargetByType(RELATIONSHIP_TYPES2.SLIDE_LAYOUT);
}
function findMasterPath(resources) {
  return resources.getTargetByType(RELATIONSHIP_TYPES2.SLIDE_MASTER);
}
function findThemePath(resources) {
  return resources.getTargetByType(RELATIONSHIP_TYPES2.THEME);
}
function findDiagramDrawingPath(resources) {
  return resources.getTargetByType(RELATIONSHIP_TYPES2.DIAGRAM_DRAWING);
}
function parseDuration(dur) {
  if (!dur) {
    return void 0;
  }
  if (dur === "indefinite") {
    return "indefinite";
  }
  return parseInt(dur, 10);
}
function parseRepeatCount(val) {
  if (!val) {
    return void 0;
  }
  if (val === "indefinite") {
    return "indefinite";
  }
  return parseInt(val, 10) / 1e3;
}
function mapFillBehavior(val) {
  switch (val) {
    case "hold":
      return "hold";
    case "transition":
      return "transition";
    case "freeze":
      return "freeze";
    case "remove":
      return "remove";
    default:
      return void 0;
  }
}
function mapRestartBehavior(val) {
  switch (val) {
    case "always":
      return "always";
    case "whenNotActive":
      return "whenNotActive";
    case "never":
      return "never";
    default:
      return void 0;
  }
}
function mapTimeNodeSyncType(val) {
  switch (val) {
    case "canSlip":
      return "canSlip";
    case "locked":
      return "locked";
    default:
      return void 0;
  }
}
function mapTimeNodeMasterRelation(val) {
  switch (val) {
    case "lastClick":
      return "lastClick";
    case "nextClick":
      return "nextClick";
    case "sameClick":
      return "sameClick";
    default:
      return void 0;
  }
}
function mapTimeNodeType(val) {
  switch (val) {
    case "tmRoot":
      return "tmRoot";
    case "mainSeq":
      return "mainSeq";
    case "interactiveSeq":
      return "interactiveSeq";
    case "clickEffect":
      return "clickEffect";
    case "withEffect":
      return "withEffect";
    case "afterEffect":
      return "afterEffect";
    case "clickPar":
      return "clickPar";
    case "withGroup":
      return "withGroup";
    case "afterGroup":
      return "afterGroup";
    default:
      return void 0;
  }
}
function mapPresetClass(val) {
  switch (val) {
    case "entr":
      return "entrance";
    case "exit":
      return "exit";
    case "emph":
      return "emphasis";
    case "path":
      return "motion";
    case "verb":
      return "verb";
    case "mediacall":
      return "mediaCall";
    default:
      return void 0;
  }
}
function mapConditionEvent(val) {
  switch (val) {
    case "begin":
      return "begin";
    case "end":
      return "end";
    case "onBegin":
      return "onBegin";
    case "onEnd":
      return "onEnd";
    case "onClick":
      return "onClick";
    case "onDblClick":
      return "onDoubleClick";
    case "onMouseOver":
      return "onMouseOver";
    case "onMouseOut":
      return "onMouseOut";
    case "onNext":
      return "onNext";
    case "onPrev":
      return "onPrev";
    case "onStopAudio":
      return "onStopAudio";
    default:
      return void 0;
  }
}
function mapTriggerRuntimeNode(val) {
  switch (val) {
    case "all":
      return "all";
    case "first":
      return "first";
    case "last":
      return "last";
    default:
      return void 0;
  }
}
function mapIterateType(val) {
  switch (val) {
    case "el":
      return "element";
    case "wd":
      return "word";
    case "lt":
      return "letter";
    default:
      return void 0;
  }
}
function mapNextAction(val) {
  switch (val) {
    case "none":
      return "none";
    case "seek":
      return "seek";
    default:
      return void 0;
  }
}
function mapPrevAction(val) {
  switch (val) {
    case "none":
      return "none";
    case "skip":
      return "skip";
    default:
      return void 0;
  }
}
function mapCalcMode(val) {
  switch (val) {
    case "discrete":
      return "discrete";
    case "lin":
      return "linear";
    case "fmla":
      return "formula";
    default:
      return void 0;
  }
}
function mapValueType(val) {
  switch (val) {
    case "str":
      return "string";
    case "num":
      return "number";
    case "clr":
      return "color";
    default:
      return void 0;
  }
}
function mapAdditiveMode(val) {
  switch (val) {
    case "base":
      return "base";
    case "sum":
      return "sum";
    case "repl":
      return "replace";
    case "mult":
      return "multiply";
    case "none":
      return "none";
    default:
      return void 0;
  }
}
function mapAccumulateMode(val) {
  switch (val) {
    case "always":
      return "always";
    case "none":
      return "none";
    default:
      return void 0;
  }
}
function mapOverrideMode(val) {
  switch (val) {
    case "normal":
      return "normal";
    case "childStyle":
      return "childStyle";
    default:
      return void 0;
  }
}
function mapTransformType(val) {
  switch (val) {
    case "pt":
      return "pt";
    case "img":
      return "img";
    default:
      return void 0;
  }
}
function mapBuildType(val) {
  switch (val) {
    case "allAtOnce":
      return "allAtOnce";
    case "p":
      return "paragraph";
    case "wd":
      return "word";
    case "char":
      return "character";
    default:
      return void 0;
  }
}
function mapParaBuildType(val) {
  switch (val) {
    case "allAtOnce":
      return "allAtOnce";
    case "p":
      return "paragraph";
    case "cust":
      return "custom";
    case "whole":
      return "whole";
    default:
      return void 0;
  }
}
function mapChartOnlyBuildType(val) {
  switch (val) {
    case "category":
      return "category";
    case "categoryEl":
      return "categoryEl";
    case "series":
      return "series";
    case "seriesEl":
      return "seriesEl";
    default:
      return void 0;
  }
}
function mapChartBuildType(val) {
  return mapBuildType(val) ?? mapChartOnlyBuildType(val);
}
function mapChartSubelementType(val) {
  switch (val) {
    case "category":
      return "category";
    case "gridLegend":
      return "gridLegend";
    case "ptInCategory":
      return "ptInCategory";
    case "ptInSeries":
      return "ptInSeries";
    case "series":
      return "series";
    default:
      return void 0;
  }
}
function mapCommandType(val) {
  switch (val) {
    case "call":
      return "call";
    case "evt":
      return "event";
    case "verb":
      return "verb";
    default:
      return void 0;
  }
}
function mapDgmOnlyBuildType(val) {
  switch (val) {
    case "whole":
      return "whole";
    case "depthByNode":
      return "depthByNode";
    case "depthByBranch":
      return "depthByBranch";
    case "breadthByNode":
      return "breadthByNode";
    case "breadthByLvl":
      return "breadthByLvl";
    case "cw":
      return "cw";
    case "cwIn":
      return "cwIn";
    case "cwOut":
      return "cwOut";
    case "ccw":
      return "ccw";
    case "ccwIn":
      return "ccwIn";
    case "ccwOut":
      return "ccwOut";
    case "inByRing":
      return "inByRing";
    case "outByRing":
      return "outByRing";
    case "up":
      return "up";
    case "down":
      return "down";
    case "allAtOnce":
      return "allAtOnce";
    case "cust":
      return "cust";
    default:
      return void 0;
  }
}
function mapDgmBuildType(val) {
  return mapDgmOnlyBuildType(val);
}
function mapOleChartBuildType(val) {
  if (val === "allAtOnce") {
    return "allAtOnce";
  }
  return mapChartOnlyBuildType(val);
}
function parseTextElementTarget(txEl) {
  const pRg = getChild(txEl, "p:pRg");
  if (pRg) {
    return {
      type: "paragraph",
      start: parseInt(getAttr(pRg, "st") ?? "0", 10),
      end: parseInt(getAttr(pRg, "end") ?? "0", 10)
    };
  }
  const charRg = getChild(txEl, "p:charRg");
  if (charRg) {
    return {
      type: "character",
      start: parseInt(getAttr(charRg, "st") ?? "0", 10),
      end: parseInt(getAttr(charRg, "end") ?? "0", 10)
    };
  }
  return void 0;
}
function parseGraphicElementTarget(graphicEl) {
  for (const child of graphicEl.children) {
    if (!isXmlElement(child)) {
      continue;
    }
    const id = getAttr(child, "id") ?? getAttr(child, "r:id");
    switch (child.name) {
      case "a:dgm":
        return { type: "diagram", id };
      case "c:chart":
        return { type: "chart", id };
      case "a:tbl":
        return { type: "table", id };
      case "a:graphic":
        return { type: "graphic", id };
      default:
        return { type: "unknown", name: child.name, id };
    }
  }
  return void 0;
}
function parseShapeTarget(spTgt) {
  const shapeId = parseShapeId(getAttr(spTgt, "spid")) ?? "";
  const txEl = getChild(spTgt, "p:txEl");
  const textElement = txEl ? parseTextElementTarget(txEl) : void 0;
  const bg = getChild(spTgt, "p:bg");
  const targetBackground = bg !== void 0;
  const graphicEl = getChild(spTgt, "p:graphicEl");
  const graphicElement = graphicEl ? parseGraphicElementTarget(graphicEl) : void 0;
  const oleChartEl = getChild(spTgt, "p:oleChartEl");
  const oleChartElement = oleChartEl ? parseOleChartElement(oleChartEl) : void 0;
  const subSp = getChild(spTgt, "p:subSp");
  const subShapeId = subSp ? parseShapeId(getAttr(subSp, "spid")) : void 0;
  return {
    type: "shape",
    shapeId,
    textElement,
    subShapeId,
    targetBackground,
    graphicElement,
    oleChartElement
  };
}
function parseOleChartElement(oleChartEl) {
  const levelValue = getAttr(oleChartEl, "lvl");
  return {
    type: mapChartSubelementType(getAttr(oleChartEl, "type")),
    level: levelValue ? parseInt(levelValue, 10) : void 0
  };
}
function parseTargetElement(tgtEl) {
  const spTgt = getChild(tgtEl, "p:spTgt");
  if (spTgt) {
    return parseShapeTarget(spTgt);
  }
  const sldTgt = getChild(tgtEl, "p:sldTgt");
  if (sldTgt) {
    return { type: "slide" };
  }
  const sndTgt = getChild(tgtEl, "p:sndTgt");
  if (sndTgt) {
    return {
      type: "sound",
      resourceId: getAttr(sndTgt, "r:embed") ?? "",
      name: getAttr(sndTgt, "name")
    };
  }
  const inkTgt = getChild(tgtEl, "p:inkTgt");
  if (inkTgt) {
    return {
      type: "ink",
      shapeId: parseShapeId(getAttr(inkTgt, "spid")) ?? ""
    };
  }
  return void 0;
}
function parseDelayValue(delayStr) {
  if (!delayStr) {
    return void 0;
  }
  if (delayStr === "indefinite") {
    return "indefinite";
  }
  return parseInt(delayStr, 10);
}
function parseTimeCondition(condition) {
  const delay = parseDelayValue(getAttr(condition, "delay"));
  const event = mapConditionEvent(getAttr(condition, "evt"));
  const tgtEl = getChild(condition, "p:tgtEl");
  const target = tgtEl ? parseTargetElement(tgtEl) : void 0;
  const tn = getChild(condition, "p:tn");
  const timeNodeRef = tn ? parseInt(getAttr(tn, "val") ?? "0", 10) : void 0;
  const rtn = getChild(condition, "p:rtn");
  const runtimeNode = rtn ? mapTriggerRuntimeNode(getAttr(rtn, "val")) : void 0;
  return { delay, event, target, timeNodeRef, runtimeNode };
}
function parseCondition(cond) {
  return parseTimeCondition(cond);
}
function parseConditionList(condLst) {
  const conditions = [];
  for (const cond of getChildren(condLst, "p:cond")) {
    const condition = parseCondition(cond);
    if (condition) {
      conditions.push(condition);
    }
  }
  return conditions;
}
function parsePresetInfo(cTn) {
  const presetID = getAttr(cTn, "presetID");
  const presetClass = getAttr(cTn, "presetClass");
  if (!presetID || !presetClass) {
    return void 0;
  }
  const mappedClass = mapPresetClass(presetClass);
  if (!mappedClass) {
    return void 0;
  }
  const presetSubtype = getAttr(cTn, "presetSubtype");
  return {
    id: parseInt(presetID, 10),
    class: mappedClass,
    subtype: presetSubtype ? parseInt(presetSubtype, 10) : void 0
  };
}
function parseCommonTimeNode(cTn) {
  const id = parseInt(getAttr(cTn, "id") ?? "0", 10);
  const duration = parseDuration(getAttr(cTn, "dur"));
  const fill = mapFillBehavior(getAttr(cTn, "fill"));
  const restart = mapRestartBehavior(getAttr(cTn, "restart"));
  const syncBehavior = mapTimeNodeSyncType(getAttr(cTn, "syncBehavior"));
  const masterRelation = mapTimeNodeMasterRelation(getAttr(cTn, "masterRel"));
  const nodeType = mapTimeNodeType(getAttr(cTn, "nodeType"));
  const preset = parsePresetInfo(cTn);
  const stCondLst = getChild(cTn, "p:stCondLst");
  const endCondLst = getChild(cTn, "p:endCondLst");
  const endSync = getChild(cTn, "p:endSync");
  const startConditions = stCondLst ? parseConditionList(stCondLst) : void 0;
  const endConditions = endCondLst ? parseConditionList(endCondLst) : void 0;
  const endSyncCondition = endSync ? parseTimeCondition(endSync) : void 0;
  const iterate = parseIterateData(cTn);
  const accel = getAttr(cTn, "accel");
  const decel = getAttr(cTn, "decel");
  const autoRev = getAttr(cTn, "autoRev");
  const repeatCount = parseRepeatCount(getAttr(cTn, "repeatCount"));
  const spd = getAttr(cTn, "spd");
  return {
    id,
    duration,
    fill,
    restart,
    syncBehavior,
    masterRelation,
    nodeType,
    preset,
    startConditions,
    endConditions,
    endSync: endSyncCondition,
    iterate,
    acceleration: accel ? parseInt(accel, 10) / 1e3 : void 0,
    deceleration: decel ? parseInt(decel, 10) / 1e3 : void 0,
    autoReverse: autoRev === "1",
    repeatCount,
    speed: spd ? parseInt(spd, 10) / 1e3 : void 0
  };
}
function parseIterateInterval(iterate) {
  const tmAbs = getChild(iterate, "p:tmAbs");
  if (tmAbs) {
    const val = getAttr(tmAbs, "val");
    if (val !== void 0) {
      const parsed = parseInt(val, 10);
      if (!Number.isNaN(parsed)) {
        return { type: "absolute", value: parsed };
      }
    }
  }
  const tmPct = getChild(iterate, "p:tmPct");
  if (tmPct) {
    const raw = getAttr(tmPct, "val");
    const pct2 = parseIteratePercentage(raw);
    if (pct2 !== void 0) {
      return { type: "percentage", value: pct2 };
    }
  }
  return void 0;
}
function parseIterateData(cTn) {
  const iterate = getChild(cTn, "p:iterate");
  if (!iterate) {
    return void 0;
  }
  const type = mapIterateType(getAttr(iterate, "type")) ?? "element";
  const backwards = getBoolAttr(iterate, "backwards");
  const interval = parseIterateInterval(iterate);
  return {
    type,
    backwards,
    interval
  };
}
function parseIteratePercentage(raw) {
  if (!raw) {
    return void 0;
  }
  if (raw.endsWith("%")) {
    return parsePositiveFixedPercentage(raw);
  }
  return parsePositivePercentage(raw);
}
function extractFirstAttributeName(attrNameLst) {
  if (!attrNameLst) {
    return void 0;
  }
  const attrNames = getChildren(attrNameLst, "p:attrName");
  if (attrNames.length === 0) {
    return void 0;
  }
  return getTextContent(attrNames[0]);
}
function parseCommonBehavior(cBhvr) {
  const cTn = getChild(cBhvr, "p:cTn");
  const tgtEl = getChild(cBhvr, "p:tgtEl");
  const attrNameLst = getChild(cBhvr, "p:attrNameLst");
  const target = tgtEl ? parseTargetElement(tgtEl) : void 0;
  const attribute = extractFirstAttributeName(attrNameLst);
  const accumulate = mapAccumulateMode(getAttr(cBhvr, "accumulate"));
  const override = mapOverrideMode(getAttr(cBhvr, "override"));
  const transformType = mapTransformType(getAttr(cBhvr, "xfrmType"));
  return { target, attribute, cTn, accumulate, override, transformType };
}
function parseColorValue(element) {
  const srgbClr = getChild(element, "a:srgbClr");
  if (srgbClr) {
    return getAttr(srgbClr, "val");
  }
  const schemeClr = getChild(element, "a:schemeClr");
  if (schemeClr) {
    return getAttr(schemeClr, "val");
  }
  const hsl = getChild(element, "p:hsl");
  if (hsl) {
    const h = getAttr(hsl, "h") ?? "0";
    const s = getAttr(hsl, "s") ?? "0";
    const l = getAttr(hsl, "l") ?? "0";
    return `hsl(${h},${s},${l})`;
  }
  const rgb = getChild(element, "p:rgb");
  if (rgb) {
    const r = getAttr(rgb, "r") ?? "0";
    const g = getAttr(rgb, "g") ?? "0";
    const b = getAttr(rgb, "b") ?? "0";
    return `rgb(${r},${g},${b})`;
  }
  return void 0;
}
function parseAnimateValue(element) {
  const strVal = getChild(element, "p:strVal");
  if (strVal) {
    return getAttr(strVal, "val") ?? "";
  }
  const boolVal = getChild(element, "p:boolVal");
  if (boolVal) {
    return getAttr(boolVal, "val") === "1";
  }
  const intVal = getChild(element, "p:intVal");
  if (intVal) {
    return parseInt(getAttr(intVal, "val") ?? "0", 10);
  }
  const fltVal = getChild(element, "p:fltVal");
  if (fltVal) {
    return parseFloat(getAttr(fltVal, "val") ?? "0");
  }
  const clrVal = getChild(element, "p:clrVal");
  if (clrVal) {
    return parseColorValue(clrVal) ?? "";
  }
  return "";
}
function parseKeyframe(tav) {
  const tm = getAttr(tav, "tm");
  if (tm === void 0) {
    return void 0;
  }
  if (tm === "indefinite") {
    return void 0;
  }
  const time = parseInt(tm, 10) / 1e3;
  const valElement = getChild(tav, "p:val");
  const value = valElement ? parseAnimateValue(valElement) : "";
  const formula = getAttr(tav, "fmla");
  return {
    time,
    value,
    formula
  };
}
function parseKeyframes(tavLst) {
  const keyframes = [];
  for (const tav of getChildren(tavLst, "p:tav")) {
    const keyframe = parseKeyframe(tav);
    if (keyframe) {
      keyframes.push(keyframe);
    }
  }
  return keyframes;
}
function parseAnimateBehavior(element) {
  const cBhvr = getChild(element, "p:cBhvr");
  if (!cBhvr) {
    return void 0;
  }
  const { target, attribute, cTn, accumulate, override, transformType } = parseCommonBehavior(cBhvr);
  if (!target) {
    return void 0;
  }
  const base = cTn ? parseCommonTimeNode(cTn) : { id: 0 };
  const tavLst = getChild(element, "p:tavLst");
  const keyframes = tavLst ? parseKeyframes(tavLst) : void 0;
  return {
    type: "animate",
    ...base,
    target,
    attribute: attribute ?? "",
    keyframes,
    from: getAttr(element, "from"),
    to: getAttr(element, "to"),
    by: getAttr(element, "by"),
    calcMode: mapCalcMode(getAttr(element, "calcmode")),
    valueType: mapValueType(getAttr(element, "valueType")),
    additive: mapAdditiveMode(getAttr(cBhvr, "additive")),
    accumulate,
    override,
    transformType
  };
}
function parseSetBehavior(element) {
  const cBhvr = getChild(element, "p:cBhvr");
  if (!cBhvr) {
    return void 0;
  }
  const { target, attribute, cTn, accumulate, override, transformType } = parseCommonBehavior(cBhvr);
  if (!target) {
    return void 0;
  }
  const base = cTn ? parseCommonTimeNode(cTn) : { id: 0 };
  const toElement = getChild(element, "p:to");
  const value = toElement ? parseAnimateValue(toElement) : void 0;
  return {
    type: "set",
    ...base,
    target,
    attribute: attribute ?? "style.visibility",
    value: value ?? "visible",
    accumulate,
    override,
    transformType
  };
}
function parseAnimateEffectBehavior(element) {
  const cBhvr = getChild(element, "p:cBhvr");
  if (!cBhvr) {
    return void 0;
  }
  const { target, cTn, accumulate, override, transformType } = parseCommonBehavior(cBhvr);
  if (!target) {
    return void 0;
  }
  const base = cTn ? parseCommonTimeNode(cTn) : { id: 0 };
  const transition = getAttr(element, "transition");
  const filter = getAttr(element, "filter");
  const progress = getChild(element, "p:progress");
  return {
    type: "animateEffect",
    ...base,
    target,
    transition: transition ?? "in",
    filter: filter ?? "",
    progress: progress ? parseAnimateValue(progress) : void 0,
    accumulate,
    override,
    transformType
  };
}
function parseAnimateMotionBehavior(element) {
  const cBhvr = getChild(element, "p:cBhvr");
  if (!cBhvr) {
    return void 0;
  }
  const { target, cTn, accumulate, override, transformType } = parseCommonBehavior(cBhvr);
  if (!target) {
    return void 0;
  }
  const base = cTn ? parseCommonTimeNode(cTn) : { id: 0 };
  const path = getAttr(element, "path");
  const origin = getAttr(element, "origin");
  const pathEditMode = getAttr(element, "pathEditMode");
  const rotationCenter = parseRotationCenter(getChild(element, "p:rCtr"));
  return {
    type: "animateMotion",
    ...base,
    target,
    path,
    origin,
    pathEditMode,
    rotationCenter,
    accumulate,
    override,
    transformType
  };
}
function parseAnimateRotationBehavior(element) {
  const cBhvr = getChild(element, "p:cBhvr");
  if (!cBhvr) {
    return void 0;
  }
  const { target, cTn, accumulate, override, transformType } = parseCommonBehavior(cBhvr);
  if (!target) {
    return void 0;
  }
  const base = cTn ? parseCommonTimeNode(cTn) : { id: 0 };
  const by = getAttr(element, "by");
  const from = getAttr(element, "from");
  const to = getAttr(element, "to");
  return {
    type: "animateRotation",
    ...base,
    target,
    from: from ? parseInt(from, 10) / 6e4 : void 0,
    to: to ? parseInt(to, 10) / 6e4 : void 0,
    by: by ? parseInt(by, 10) / 6e4 : void 0,
    accumulate,
    override,
    transformType
  };
}
function parseScaleValue(val) {
  if (!val) {
    return void 0;
  }
  return parseInt(val, 10) / 1e3;
}
function parsePercentageValue(value) {
  if (!value) {
    return void 0;
  }
  if (value.endsWith("%")) {
    return parsePositiveFixedPercentage(value);
  }
  return parsePercentage(value);
}
function parseRotationCenter(element) {
  if (!element) {
    return void 0;
  }
  const x = parsePercentageValue(getAttr(element, "x"));
  const y = parsePercentageValue(getAttr(element, "y"));
  if (x === void 0 || y === void 0) {
    return void 0;
  }
  return { x, y };
}
function parseAnimateScaleBehavior(element) {
  const cBhvr = getChild(element, "p:cBhvr");
  if (!cBhvr) {
    return void 0;
  }
  const { target, cTn, accumulate, override, transformType } = parseCommonBehavior(cBhvr);
  if (!target) {
    return void 0;
  }
  const base = cTn ? parseCommonTimeNode(cTn) : { id: 0 };
  const by = getChild(element, "p:by");
  const from = getChild(element, "p:from");
  const to = getChild(element, "p:to");
  return {
    type: "animateScale",
    ...base,
    target,
    fromX: from ? parseScaleValue(getAttr(from, "x")) : void 0,
    fromY: from ? parseScaleValue(getAttr(from, "y")) : void 0,
    toX: to ? parseScaleValue(getAttr(to, "x")) : void 0,
    toY: to ? parseScaleValue(getAttr(to, "y")) : void 0,
    byX: by ? parseScaleValue(getAttr(by, "x")) : void 0,
    byY: by ? parseScaleValue(getAttr(by, "y")) : void 0,
    accumulate,
    override,
    transformType
  };
}
function parseAnimateColorBehavior(element) {
  const cBhvr = getChild(element, "p:cBhvr");
  if (!cBhvr) {
    return void 0;
  }
  const { target, attribute, cTn, accumulate, override, transformType } = parseCommonBehavior(cBhvr);
  if (!target) {
    return void 0;
  }
  const base = cTn ? parseCommonTimeNode(cTn) : { id: 0 };
  const clrSpc = getAttr(element, "clrSpc");
  const direction = getAttr(element, "dir");
  const by = getChild(element, "p:by");
  const from = getChild(element, "p:from");
  const to = getChild(element, "p:to");
  return {
    type: "animateColor",
    ...base,
    target,
    attribute: attribute ?? "",
    colorSpace: clrSpc ?? "rgb",
    direction,
    from: from ? parseColorValue(from) : void 0,
    to: to ? parseColorValue(to) : void 0,
    by: by ? parseColorValue(by) : void 0,
    accumulate,
    override,
    transformType
  };
}
function parseAudioBehavior(element) {
  const cMediaNode = getChild(element, "p:cMediaNode");
  if (!cMediaNode) {
    return void 0;
  }
  const cTn = getChild(cMediaNode, "p:cTn");
  const tgtEl = getChild(cMediaNode, "p:tgtEl");
  const target = tgtEl ? parseTargetElement(tgtEl) : void 0;
  if (!target) {
    return void 0;
  }
  const base = cTn ? parseCommonTimeNode(cTn) : { id: 0 };
  return {
    type: "audio",
    ...base,
    target,
    isNarration: getAttr(element, "isNarration") === "1"
  };
}
function parseVideoBehavior(element) {
  const cMediaNode = getChild(element, "p:cMediaNode");
  if (!cMediaNode) {
    return void 0;
  }
  const cTn = getChild(cMediaNode, "p:cTn");
  const tgtEl = getChild(cMediaNode, "p:tgtEl");
  const target = tgtEl ? parseTargetElement(tgtEl) : void 0;
  if (!target) {
    return void 0;
  }
  const base = cTn ? parseCommonTimeNode(cTn) : { id: 0 };
  return {
    type: "video",
    ...base,
    target,
    fullscreen: getAttr(element, "fullScrn") === "1"
  };
}
function parseCommandBehavior(element) {
  const cBhvr = getChild(element, "p:cBhvr");
  if (!cBhvr) {
    return void 0;
  }
  const { target, cTn, accumulate, override, transformType } = parseCommonBehavior(cBhvr);
  if (!target) {
    return void 0;
  }
  const base = cTn ? parseCommonTimeNode(cTn) : { id: 0 };
  const cmdType = mapCommandType(getAttr(element, "type"));
  const cmd = getAttr(element, "cmd");
  return {
    type: "command",
    ...base,
    target,
    commandType: cmdType ?? "call",
    command: cmd ?? "",
    accumulate,
    override,
    transformType
  };
}
function parseTimeNodeElement(element) {
  switch (element.name) {
    case "p:par":
      return parseParallelTimeNode(element);
    case "p:seq":
      return parseSequenceTimeNode(element);
    case "p:excl":
      return parseExclusiveTimeNode(element);
    case "p:anim":
      return parseAnimateBehavior(element);
    case "p:set":
      return parseSetBehavior(element);
    case "p:animEffect":
      return parseAnimateEffectBehavior(element);
    case "p:animMotion":
      return parseAnimateMotionBehavior(element);
    case "p:animRot":
      return parseAnimateRotationBehavior(element);
    case "p:animScale":
      return parseAnimateScaleBehavior(element);
    case "p:animClr":
      return parseAnimateColorBehavior(element);
    case "p:audio":
      return parseAudioBehavior(element);
    case "p:video":
      return parseVideoBehavior(element);
    case "p:cmd":
      return parseCommandBehavior(element);
    default:
      return void 0;
  }
}
function parseChildTimeNodes(cTn) {
  const childTnLst = getChild(cTn, "p:childTnLst");
  if (!childTnLst) {
    return [];
  }
  const nodes = [];
  for (const child of childTnLst.children) {
    if (!isXmlElement(child)) {
      continue;
    }
    const node = parseTimeNodeElement(child);
    if (node) {
      nodes.push(node);
    }
  }
  return nodes;
}
function parseSubTimeNodes(cTn) {
  const subTnLst = getChild(cTn, "p:subTnLst");
  if (!subTnLst) {
    return [];
  }
  const nodes = [];
  for (const child of subTnLst.children) {
    if (!isXmlElement(child)) {
      continue;
    }
    const node = parseTimeNodeElement(child);
    if (node) {
      nodes.push(node);
    }
  }
  return nodes;
}
function parseParallelTimeNode(element) {
  const cTn = getChild(element, "p:cTn");
  if (!cTn) {
    return void 0;
  }
  const base = parseCommonTimeNode(cTn);
  const children2 = parseChildTimeNodes(cTn);
  const subTimeNodes = parseSubTimeNodes(cTn);
  return {
    type: "parallel",
    ...base,
    children: children2,
    subTimeNodes: subTimeNodes.length > 0 ? subTimeNodes : void 0
  };
}
function parseSequenceTimeNode(element) {
  const cTn = getChild(element, "p:cTn");
  if (!cTn) {
    return void 0;
  }
  const base = parseCommonTimeNode(cTn);
  const children2 = parseChildTimeNodes(cTn);
  const subTimeNodes = parseSubTimeNodes(cTn);
  const prevCondLst = getChild(element, "p:prevCondLst");
  const nextCondLst = getChild(element, "p:nextCondLst");
  const prevConditions = prevCondLst ? parseConditionList(prevCondLst) : void 0;
  const nextConditions = nextCondLst ? parseConditionList(nextCondLst) : void 0;
  return {
    type: "sequence",
    ...base,
    children: children2,
    subTimeNodes: subTimeNodes.length > 0 ? subTimeNodes : void 0,
    concurrent: getAttr(element, "concurrent") === "1",
    nextAction: mapNextAction(getAttr(element, "nextAc")),
    prevAction: mapPrevAction(getAttr(element, "prevAc")),
    prevConditions,
    nextConditions
  };
}
function parseExclusiveTimeNode(element) {
  const cTn = getChild(element, "p:cTn");
  if (!cTn) {
    return void 0;
  }
  const base = parseCommonTimeNode(cTn);
  const children2 = parseChildTimeNodes(cTn);
  const subTimeNodes = parseSubTimeNodes(cTn);
  return {
    type: "exclusive",
    ...base,
    children: children2,
    subTimeNodes: subTimeNodes.length > 0 ? subTimeNodes : void 0
  };
}
function parseRootTimeNode(tnLst) {
  if (!tnLst) {
    return void 0;
  }
  const parElements = getChildren(tnLst, "p:par");
  if (parElements.length === 0) {
    return void 0;
  }
  return parseParallelTimeNode(parElements[0]);
}
function parseTimeNodeList(tnLst) {
  if (!tnLst) {
    return [];
  }
  const nodes = [];
  for (const child of tnLst.children) {
    if (!isXmlElement(child)) {
      continue;
    }
    const node = parseTimeNodeElement(child);
    if (node) {
      nodes.push(node);
    }
  }
  return nodes;
}
function parseBuildChartElement(element) {
  if (!element) {
    return void 0;
  }
  const build = mapChartBuildType(getAttr(element, "bld"));
  const animBg = getAttr(element, "animBg");
  if (!build && animBg === void 0) {
    return void 0;
  }
  return {
    build,
    animateBackground: animBg === "1"
  };
}
function parseBuildDgmElement(element) {
  if (!element) {
    return void 0;
  }
  const build = mapDgmBuildType(getAttr(element, "bld"));
  if (!build) {
    return void 0;
  }
  return { build };
}
function parseBuildParagraph(bldP) {
  const spid = parseShapeId(getAttr(bldP, "spid"));
  if (!spid) {
    return void 0;
  }
  const grpId = getAttr(bldP, "grpId");
  const build = getAttr(bldP, "build");
  const animBg = getAttr(bldP, "animBg");
  const rev2 = getAttr(bldP, "rev");
  const advAuto = getAttr(bldP, "advAuto");
  const tmplLst = getChild(bldP, "p:tmplLst");
  return {
    shapeId: spid,
    groupId: grpId ? parseInt(grpId, 10) : void 0,
    buildType: mapParaBuildType(build),
    advanceAfter: parseDuration(advAuto),
    animateBackground: animBg === "1",
    reverse: rev2 === "1",
    templateEffects: tmplLst ? parseTemplateList(tmplLst) : void 0
  };
}
function parseTemplateList(tmplLst) {
  const templates = [];
  for (const tmpl of getChildren(tmplLst, "p:tmpl")) {
    const levelAttr = getAttr(tmpl, "lvl");
    const level = levelAttr ? parseInt(levelAttr, 10) : void 0;
    const tnLst = getChild(tmpl, "p:tnLst");
    if (!tnLst) {
      continue;
    }
    const timeNodes = parseTimeNodeList(tnLst);
    templates.push({ level, timeNodes });
  }
  return templates;
}
function parseGraphicBuildElement(bldGraphic) {
  const bldAsOne = getChild(bldGraphic, "p:bldAsOne");
  if (bldAsOne) {
    return { type: "asOne" };
  }
  const bldSub = getChild(bldGraphic, "p:bldSub");
  if (!bldSub) {
    return void 0;
  }
  const chartBuild = parseBuildChartElement(getChild(bldSub, "a:bldChart"));
  const diagramBuild = parseBuildDgmElement(getChild(bldSub, "a:bldDgm"));
  if (!chartBuild && !diagramBuild) {
    return void 0;
  }
  return {
    type: "sub",
    chartBuild,
    diagramBuild
  };
}
function parseBuildGraphic(bldGraphic) {
  const spid = parseShapeId(getAttr(bldGraphic, "spid"));
  if (!spid) {
    return void 0;
  }
  const grpId = getAttr(bldGraphic, "grpId");
  const graphicBuild = parseGraphicBuildElement(bldGraphic);
  return {
    shapeId: spid,
    groupId: grpId ? parseInt(grpId, 10) : void 0,
    uiExpand: getBoolAttr(bldGraphic, "uiExpand"),
    graphicBuild
  };
}
function parseBuildOleChart(bldOleChart) {
  const spid = parseShapeId(getAttr(bldOleChart, "spid"));
  if (!spid) {
    return void 0;
  }
  const grpId = getAttr(bldOleChart, "grpId");
  const build = mapOleChartBuildType(getAttr(bldOleChart, "bld"));
  const animBg = getBoolAttr(bldOleChart, "animBg");
  const oleChartBuild = resolveOleChartBuild(build, animBg);
  return {
    shapeId: spid,
    groupId: grpId ? parseInt(grpId, 10) : void 0,
    uiExpand: getBoolAttr(bldOleChart, "uiExpand"),
    oleChartBuild
  };
}
function resolveOleChartBuild(build, animateBackground) {
  if (build !== void 0 || animateBackground !== void 0) {
    return { build, animateBackground };
  }
  return void 0;
}
function parseBuildList(bldLst) {
  const entries = [];
  for (const bldP of getChildren(bldLst, "p:bldP")) {
    const entry = parseBuildParagraph(bldP);
    if (entry) {
      entries.push(entry);
    }
  }
  for (const bldGraphic of getChildren(bldLst, "p:bldGraphic")) {
    const entry = parseBuildGraphic(bldGraphic);
    if (entry) {
      entries.push(entry);
    }
  }
  for (const bldOleChart of getChildren(bldLst, "p:bldOleChart")) {
    const entry = parseBuildOleChart(bldOleChart);
    if (entry) {
      entries.push(entry);
    }
  }
  return entries;
}
function parseTiming(timingElement) {
  if (!timingElement) {
    return void 0;
  }
  const tnLst = getChild(timingElement, "p:tnLst");
  const bldLst = getChild(timingElement, "p:bldLst");
  const rootTimeNode = parseRootTimeNode(tnLst);
  const buildList = bldLst ? parseBuildList(bldLst) : void 0;
  if (!rootTimeNode && !buildList) {
    return void 0;
  }
  return {
    rootTimeNode,
    buildList
  };
}
function findTimingElement(slideContent) {
  for (const child of slideContent.children) {
    if (!isXmlElement(child)) {
      continue;
    }
    const timing = getChild(child, "p:timing");
    if (timing) {
      return timing;
    }
  }
  return void 0;
}
function parseSlideTimingData(slideContent) {
  const timingEl = findTimingElement(slideContent);
  return parseTiming(timingEl);
}
function parseSlideTransitionData(content) {
  if (!content) {
    return void 0;
  }
  const sld = getByPath(content, ["p:sld"]);
  if (!sld) {
    return void 0;
  }
  const transitionElement = getTransitionElement(sld);
  return parseTransition(transitionElement);
}
function createSlide({
  data,
  zip,
  defaultTextStyle,
  tableStyles,
  slideSize,
  renderOptions
}) {
  const timing = parseSlideTimingData(data.content);
  const transition = parseSlideTransitionData(data.content);
  return {
    number: data.number,
    filename: data.filename,
    content: data.content,
    layout: data.layout,
    layoutTables: data.layoutTables,
    master: data.master,
    masterTables: data.masterTables,
    theme: data.theme,
    relationships: data.relationships,
    layoutRelationships: data.layoutRelationships,
    masterRelationships: data.masterRelationships,
    themeRelationships: data.themeRelationships,
    diagram: data.diagram,
    diagramRelationships: data.diagramRelationships,
    timing,
    transition,
    // New properties for standalone rendering
    themeOverrides: data.themeOverrides,
    zip,
    defaultTextStyle,
    tableStyles,
    slideSize,
    renderOptions: renderOptions ?? DEFAULT_RENDER_OPTIONS
  };
}
function getSlideShapeTree(content) {
  const root = content.children.find((c) => isXmlElement(c));
  if (!root) {
    return void 0;
  }
  const cSld = getChild(root, "p:cSld");
  if (!cSld) {
    return void 0;
  }
  return getChild(cSld, "p:spTree");
}
function indexShapeTreeNodes(content) {
  const result = {
    idTable: {},
    idxTable: /* @__PURE__ */ new Map(),
    typeTable: {}
  };
  if (content === null) {
    return result;
  }
  const spTree = getSlideShapeTree(content);
  if (spTree === void 0) {
    return result;
  }
  const elementTypes = ["p:sp", "p:cxnSp", "p:pic", "p:graphicFrame", "p:grpSp", "mc:AlternateContent"];
  for (const elementType of elementTypes) {
    const elements = getChildren(spTree, elementType);
    for (const element of elements) {
      indexShapeTreeNode(element, result);
    }
  }
  return result;
}
function indexShapeTreeNode(node, tables) {
  let nvSpPr = getChild(node, "p:nvSpPr");
  if (!nvSpPr) {
    nvSpPr = getChild(node, "p:nvPicPr");
  }
  if (!nvSpPr) {
    nvSpPr = getChild(node, "p:nvCxnSpPr");
  }
  if (!nvSpPr) {
    nvSpPr = getChild(node, "p:nvGraphicFramePr");
  }
  if (!nvSpPr) {
    nvSpPr = getChild(node, "p:nvGrpSpPr");
  }
  if (!nvSpPr) {
    return;
  }
  const cNvPr = getChild(nvSpPr, "p:cNvPr");
  const nvPr = getChild(nvSpPr, "p:nvPr");
  const ph = nvPr ? getChild(nvPr, "p:ph") : void 0;
  const id = cNvPr?.attrs.id;
  const idx = ph?.attrs.idx;
  const type = ph?.attrs.type;
  if (id !== void 0) {
    tables.idTable[id] = node;
  }
  if (idx !== void 0) {
    const idxNum = Number(idx);
    if (!Number.isNaN(idxNum)) {
      tables.idxTable.set(idxNum, node);
    }
  }
  if (type !== void 0) {
    tables.typeTable[type] = node;
  }
}
function transformDiagramNamespace(diagram) {
  const serialized = JSON.stringify(diagram);
  const transformed = replaceDspNamespace(serialized);
  const parsed = JSON.parse(transformed);
  if (!isXmlDocument(parsed)) {
    return null;
  }
  return parsed;
}
function loadLayoutData(file, relationships) {
  const layoutPath = findLayoutPath(relationships);
  if (layoutPath === void 0) {
    return {
      layout: null,
      layoutTables: indexShapeTreeNodes(null),
      layoutRelationships: createEmptyResourceMap2()
    };
  }
  const layout = readPart(file, layoutPath);
  return {
    layout,
    layoutTables: indexShapeTreeNodes(layout),
    layoutRelationships: loadRelationships(file, layoutPath)
  };
}
function loadMasterData(file, layoutRelationships) {
  const masterPath = findMasterPath(layoutRelationships);
  if (masterPath === void 0) {
    return {
      master: null,
      masterTables: indexShapeTreeNodes(null),
      masterRelationships: createEmptyResourceMap2()
    };
  }
  const master = readPart(file, masterPath);
  return {
    master,
    masterTables: indexShapeTreeNodes(master),
    masterRelationships: loadRelationships(file, masterPath)
  };
}
function loadThemeData(file, masterRelationships) {
  const themePath = findThemePath(masterRelationships);
  if (themePath === void 0) {
    return {
      theme: null,
      themeRelationships: createEmptyResourceMap2(),
      themeOverrides: []
    };
  }
  const theme = readPart(file, themePath);
  const themeOverridePaths = masterRelationships.getAllTargetsByType(RELATIONSHIP_TYPES2.THEME_OVERRIDE);
  const themeOverrides = themeOverridePaths.map((path) => readPart(file, path)).filter((doc) => doc !== null);
  return {
    theme,
    themeRelationships: loadRelationships(file, themePath),
    themeOverrides
  };
}
function loadDiagramData(file, relationships) {
  const diagramPath = findDiagramDrawingPath(relationships);
  if (diagramPath === void 0) {
    return { diagram: null, diagramRelationships: createEmptyResourceMap2() };
  }
  const rawDiagram = readPart(file, diagramPath);
  if (rawDiagram === null) {
    return { diagram: null, diagramRelationships: createEmptyResourceMap2() };
  }
  const diagram = transformDiagramNamespace(rawDiagram);
  if (diagram === null) {
    return { diagram: null, diagramRelationships: createEmptyResourceMap2() };
  }
  return {
    diagram,
    diagramRelationships: loadRelationships(file, diagramPath)
  };
}
function parseSlide2({
  file,
  slideInfo,
  appVersion,
  zipAdapter,
  defaultTextStyle,
  tableStyles,
  slideSize,
  renderOptions
}) {
  const content = readPart(file, slideInfo.path, { appVersion, isSlideContent: true });
  if (content === null) {
    throw new Error(`Failed to read slide: ${slideInfo.path}`);
  }
  const relationships = loadRelationships(file, slideInfo.path);
  const layoutData = loadLayoutData(file, relationships);
  const masterData = loadMasterData(file, layoutData.layoutRelationships);
  const themeData = loadThemeData(file, masterData.masterRelationships);
  const diagramData = loadDiagramData(file, relationships);
  const data = {
    number: slideInfo.number,
    filename: slideInfo.filename,
    content,
    layout: layoutData.layout,
    layoutTables: layoutData.layoutTables,
    master: masterData.master,
    masterTables: masterData.masterTables,
    theme: themeData.theme,
    relationships,
    layoutRelationships: layoutData.layoutRelationships,
    masterRelationships: masterData.masterRelationships,
    themeRelationships: themeData.themeRelationships,
    themeOverrides: themeData.themeOverrides,
    diagram: diagramData.diagram,
    diagramRelationships: diagramData.diagramRelationships
  };
  return createSlide({ data, zip: zipAdapter, defaultTextStyle, tableStyles, slideSize, renderOptions });
}
function buildSlideFileInfoListFromPresentation(file, presentationXml) {
  const sldIdLst = getByPath(presentationXml, ["p:presentation", "p:sldIdLst"]);
  if (!sldIdLst) {
    throw new Error("ppt/presentation.xml is missing p:sldIdLst (required for slide order)");
  }
  const sldIds = getChildren(sldIdLst, "p:sldId");
  if (sldIds.length === 0) {
    throw new Error("ppt/presentation.xml: p:sldIdLst has no p:sldId entries");
  }
  const presentationRels = loadRelationships(file, "ppt/presentation.xml");
  return sldIds.map((sldId, index) => {
    const rId = sldId.attrs["r:id"];
    if (!rId) {
      throw new Error("ppt/presentation.xml: p:sldId is missing r:id");
    }
    const target = presentationRels.getTarget(rId);
    if (!target) {
      throw new Error(`ppt/_rels/presentation.xml.rels: missing Target for ${rId}`);
    }
    const type = presentationRels.getType(rId);
    if (type !== RELATIONSHIP_TYPES2.SLIDE) {
      throw new Error(
        `ppt/_rels/presentation.xml.rels: ${rId} is not a slide relationship (Type=${type ?? "undefined"})`
      );
    }
    return {
      path: target,
      number: index + 1,
      filename: getBasename(target)
    };
  });
}
function openPresentation(file, options) {
  const renderOptions = options?.renderOptions;
  const zipAdapter = createZipAdapter(file);
  if (readPart(file, "[Content_Types].xml") === null) {
    throw new Error("Failed to read [Content_Types].xml");
  }
  const appXml = readPart(file, "docProps/app.xml");
  const appVersion = parseAppVersion(appXml);
  const presentationXml = readPart(file, "ppt/presentation.xml");
  if (presentationXml === null) {
    throw new Error("Failed to read ppt/presentation.xml");
  }
  const size = parseSlideSizeFromXml(presentationXml);
  const defaultTextStyle = parseDefaultTextStyle(presentationXml);
  const slideFiles = buildSlideFileInfoListFromPresentation(file, presentationXml);
  const tableStylesXml = readPart(file, "ppt/tableStyles.xml");
  const tableStylesRoot = tableStylesXml ? getByPath(tableStylesXml, ["a:tblStyleLst"]) : void 0;
  const tableStyles = tableStylesRoot ? parseTableStyleList(tableStylesRoot) ?? null : null;
  const thumbnail = file.readBinary("docProps/thumbnail.jpeg");
  const list = (options2) => {
    const offset = options2?.offset ?? 0;
    const limit = options2?.limit ?? slideFiles.length;
    return slideFiles.slice(offset, offset + limit).map((info) => ({
      number: info.number,
      filename: info.filename
    }));
  };
  const getSlide = (slideNumber) => {
    const slideInfo = slideFiles.find((s) => s.number === slideNumber);
    if (slideInfo === void 0) {
      throw new Error(`Slide ${slideNumber} not found`);
    }
    return parseSlide2({
      file,
      slideInfo,
      appVersion: appVersion ?? 16,
      zipAdapter,
      defaultTextStyle,
      tableStyles,
      slideSize: size,
      renderOptions
    });
  };
  function* slidesGenerator() {
    for (const slideInfo of slideFiles) {
      yield parseSlide2({
        file,
        slideInfo,
        appVersion: appVersion ?? 16,
        zipAdapter,
        defaultTextStyle,
        tableStyles,
        slideSize: size,
        renderOptions
      });
    }
  }
  return {
    size,
    count: slideFiles.length,
    thumbnail,
    appVersion,
    defaultTextStyle,
    tableStyles,
    list,
    getSlide,
    slides: slidesGenerator
  };
}
async function loadPptxBundleFromBuffer(buffer) {
  if (!buffer) {
    throw new Error("buffer is required");
  }
  const zipPackage = await loadZipPackage(buffer);
  return {
    zipPackage,
    presentationFile: zipPackage.asPresentationFile()
  };
}

// node_modules/aurochs/dist/_shared/color-aUUsdyzk.js
var SCHEME_COLOR_NAMES = [
  "dk1",
  "lt1",
  "dk2",
  "lt2",
  "accent1",
  "accent2",
  "accent3",
  "accent4",
  "accent5",
  "accent6",
  "hlink",
  "folHlink"
];
var SCHEME_COLOR_NAME_LABELS = {
  dk1: "Dark 1",
  lt1: "Light 1",
  dk2: "Dark 2",
  lt2: "Light 2",
  accent1: "Accent 1",
  accent2: "Accent 2",
  accent3: "Accent 3",
  accent4: "Accent 4",
  accent5: "Accent 5",
  accent6: "Accent 6",
  hlink: "Hyperlink",
  folHlink: "Followed Link"
};
var SCHEME_COLOR_VALUE_LABELS = {
  ...SCHEME_COLOR_NAME_LABELS,
  bg1: "Background 1",
  bg2: "Background 2",
  tx1: "Text 1",
  tx2: "Text 2",
  phClr: "Placeholder"
};

// node_modules/aurochs/dist/_shared/spec-CvUhol4h.js
function isThemeColorInput(color) {
  return typeof color === "object" && "theme" in color;
}

// node_modules/aurochs/dist/xlsx/domain/index.js
var rowIdx = (v) => v;
var colIdx = (v) => v;
var styleId = (v) => v;
var fontId = (v) => v;
var fillId = (v) => v;
var borderId = (v) => v;
var numFmtId = (v) => v;
function sheetId(v) {
  if (!Number.isInteger(v) || v < 1) {
    throw new Error(
      `sheetId: expected positive integer, got ${String(v)} (ECMA-376 Part 4, Section 18.2.19)`
    );
  }
  return v;
}

// node_modules/aurochs/dist/_shared/shift-C1A-3U_N.js
function columnLetterToIndex(col) {
  if (!col || col.length === 0) {
    throw new Error("Column letter cannot be empty");
  }
  const upper = col.toUpperCase();
  for (const char of upper) {
    const charCode = char.charCodeAt(0);
    if (charCode < 65 || charCode > 90) {
      throw new Error(`Invalid column letter: ${col}`);
    }
  }
  const index = [...upper].reduce(
    (acc, char) => acc * 26 + (char.charCodeAt(0) - 64),
    0
  );
  return colIdx(index);
}
function indexToColumnLetterRecursive(n, acc) {
  if (n <= 0) {
    return acc;
  }
  const adjusted = n - 1;
  const char = String.fromCharCode(adjusted % 26 + 65);
  return indexToColumnLetterRecursive(Math.floor(adjusted / 26), char + acc);
}
function indexToColumnLetter(idx) {
  if (idx < 1) {
    throw new Error(`Column index must be >= 1, got ${idx}`);
  }
  return indexToColumnLetterRecursive(idx, "");
}
var CELL_REF_REGEX = /^(\$)?([A-Za-z]+)(\$)?(\d+)$/;
function parseCellRef(ref) {
  const match = ref.match(CELL_REF_REGEX);
  if (!match) {
    throw new Error(`Invalid cell reference: ${ref}`);
  }
  const [, colDollar, colLetters, rowDollar, rowDigits] = match;
  return {
    col: columnLetterToIndex(colLetters),
    row: rowIdx(parseInt(rowDigits, 10)),
    colAbsolute: colDollar === "$",
    rowAbsolute: rowDollar === "$"
  };
}
var RANGE_REGEX = /^(?:(?:'([^']+)'|([^!]+))!)?(\$?[A-Za-z]+\$?\d+)(?::(\$?[A-Za-z]+\$?\d+))?$/;
function parseRange(range) {
  const match = range.match(RANGE_REGEX);
  if (!match) {
    throw new Error(`Invalid range reference: ${range}`);
  }
  const [, quotedSheet, unquotedSheet, startRef, endRef] = match;
  const sheetName = quotedSheet ?? unquotedSheet;
  const start = parseCellRef(startRef);
  const end = endRef ? parseCellRef(endRef) : start;
  return {
    start,
    end,
    ...sheetName ? { sheetName } : {}
  };
}
function formatCellRef(addr) {
  const colPrefix = addr.colAbsolute ? "$" : "";
  const rowPrefix = addr.rowAbsolute ? "$" : "";
  return `${colPrefix}${indexToColumnLetter(addr.col)}${rowPrefix}${addr.row}`;
}
function formatRange(range) {
  const startStr = formatCellRef(range.start);
  const endStr = formatCellRef(range.end);
  const isSingleCell = range.start.col === range.end.col && range.start.row === range.end.row && range.start.colAbsolute === range.end.colAbsolute && range.start.rowAbsolute === range.end.rowAbsolute;
  const rangeStr = isSingleCell ? startStr : `${startStr}:${endStr}`;
  if (range.sheetName) {
    const needsQuotes = /[\s!']/.test(range.sheetName);
    const quotedName = needsQuotes ? `'${range.sheetName}'` : range.sheetName;
    return `${quotedName}!${rangeStr}`;
  }
  return rangeStr;
}
var EXCEL_MAX_ROWS = 1048576;
var EXCEL_MAX_COLS = 16384;
function isFormulaError(value) {
  return typeof value === "object" && value !== null && "type" in value && value.type === "error";
}
function formatSheetName(sheetName) {
  const needsQuotes = /[\s!']/u.test(sheetName);
  if (!needsQuotes) {
    return sheetName;
  }
  const escaped = sheetName.replaceAll("'", "''");
  return `'${escaped}'`;
}
function formatReferenceWithSheet(sheetName, address) {
  const ref = formatCellRef(address);
  if (!sheetName) {
    return ref;
  }
  return `${formatSheetName(sheetName)}!${ref}`;
}
function formatRangeWithSheet(range) {
  const start = formatReferenceWithSheet(range.sheetName, range.start);
  const end = formatCellRef(range.end);
  const isSingleCell = range.start.col === range.end.col && range.start.row === range.end.row && range.start.colAbsolute === range.end.colAbsolute && range.start.rowAbsolute === range.end.rowAbsolute;
  if (isSingleCell) {
    return start;
  }
  if (range.sheetName) {
    return `${formatSheetName(range.sheetName)}!${formatCellRef(range.start)}:${end}`;
  }
  return `${start}:${end}`;
}
function escapeStringLiteral(value) {
  return value.replaceAll('"', '""');
}
function formatScalar(value) {
  if (value === null) {
    return "0";
  }
  if (typeof value === "string") {
    return `"${escapeStringLiteral(value)}"`;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "0";
  }
  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }
  if (isFormulaError(value)) {
    return value.value;
  }
  return "0";
}
function precedence(node) {
  switch (node.type) {
    case "Compare":
      return 0;
    case "Binary":
      switch (node.operator) {
        case "&":
          return 1;
        case "+":
        case "-":
          return 2;
        case "*":
        case "/":
          return 3;
        case "^":
          return 4;
      }
      return 2;
    case "Unary":
      return 5;
    case "Literal":
    case "Reference":
    case "Range":
    case "Name":
    case "StructuredTableReference":
    case "Function":
    case "Array":
      return 6;
  }
}
function needsParens(params) {
  const childPrec = precedence(params.child);
  if (childPrec < params.parentPrec) {
    return true;
  }
  if (childPrec > params.parentPrec) {
    return false;
  }
  if (params.position === "right" && (params.parentOperator === "-" || params.parentOperator === "/" || params.parentOperator === "^")) {
    return params.child.type === "Binary";
  }
  return false;
}
function formatNode(params) {
  const { node, parentPrec, position, parentOperator } = params;
  const selfPrec = precedence(node);
  const wrapIfNeeded = (wrapParams) => {
    const { text, child, childPosition, operator } = wrapParams;
    if (needsParens({ child, parentPrec: selfPrec, position: childPosition, parentOperator: operator })) {
      return `(${text})`;
    }
    return text;
  };
  const formatNodeBody = () => {
    switch (node.type) {
      case "Literal":
        return formatScalar(node.value);
      case "Reference":
        return formatReferenceWithSheet(node.sheetName, node.reference);
      case "Range":
        return formatRangeWithSheet(node.range);
      case "Name":
        return node.name;
      case "StructuredTableReference": {
        const item = node.item;
        const start = node.startColumnName;
        const end = node.endColumnName;
        if (item && !start && !end) {
          return `${node.tableName}[${item}]`;
        }
        if (item && start && end) {
          const itemToken = `[${item}]`;
          const left2 = `[${start}]`;
          const right2 = `[${end}]`;
          const colToken = start === end ? left2 : `${left2}:${right2}`;
          return `${node.tableName}[${itemToken},${colToken}]`;
        }
        if (!start || !end) {
          return `${node.tableName}[#REF!]`;
        }
        if (start === end) {
          return `${node.tableName}[${start}]`;
        }
        const left = `[${start}]`;
        const right = `[${end}]`;
        return `${node.tableName}[${left}:${right}]`;
      }
      case "Function":
        return `${node.name}(${node.args.map((arg) => formatNode({ node: arg, parentPrec: 0, position: "left" })).join(",")})`;
      case "Array": {
        const isEmpty = node.elements.length === 1 && (node.elements[0]?.length ?? 0) === 0;
        if (isEmpty) {
          return "{}";
        }
        const rows = node.elements.map((row) => row.map((el) => formatNode({ node: el, parentPrec: 0, position: "left" })).join(",")).join(";");
        return `{${rows}}`;
      }
      case "Unary": {
        const arg = formatNode({ node: node.argument, parentPrec: selfPrec, position: "right", parentOperator: node.operator });
        const wrapped = wrapIfNeeded({ text: arg, child: node.argument, childPosition: "right", operator: node.operator });
        return `${node.operator}${wrapped}`;
      }
      case "Binary": {
        const left = formatNode({ node: node.left, parentPrec: selfPrec, position: "left", parentOperator: node.operator });
        const right = formatNode({ node: node.right, parentPrec: selfPrec, position: "right", parentOperator: node.operator });
        const leftWrapped = wrapIfNeeded({ text: left, child: node.left, childPosition: "left", operator: node.operator });
        const rightWrapped = wrapIfNeeded({ text: right, child: node.right, childPosition: "right", operator: node.operator });
        return `${leftWrapped}${node.operator}${rightWrapped}`;
      }
      case "Compare": {
        const left = formatNode({ node: node.left, parentPrec: selfPrec, position: "left", parentOperator: node.operator });
        const right = formatNode({ node: node.right, parentPrec: selfPrec, position: "right", parentOperator: node.operator });
        const leftWrapped = wrapIfNeeded({ text: left, child: node.left, childPosition: "left", operator: node.operator });
        const rightWrapped = wrapIfNeeded({ text: right, child: node.right, childPosition: "right", operator: node.operator });
        return `${leftWrapped}${node.operator}${rightWrapped}`;
      }
    }
  };
  const body = formatNodeBody();
  if (needsParens({ child: node, parentPrec, position, parentOperator })) {
    return `(${body})`;
  }
  return body;
}
function formatFormula(ast) {
  return formatNode({ node: ast, parentPrec: 0, position: "left" });
}
var NUMBER_PATTERN = /^[0-9]+(\.[0-9]+)?$/u;
var COLUMN_REF_PATTERN = /^(\$)?([A-Za-z]+)$/u;
var ROW_REF_PATTERN = /^(\$)?(\d+)$/u;
function isDigit(character) {
  return /[0-9]/u.test(character);
}
function isLetter(character) {
  return /[A-Za-z]/u.test(character);
}
function isIdentifierStart(character) {
  return isLetter(character) || character === "_";
}
function isIdentifierBodyStandard(character) {
  return isLetter(character) || isDigit(character) || character === "_";
}
function isIdentifierBodyNamespaced(character) {
  return isIdentifierBodyStandard(character) || character === ".";
}
function isWhitespace2(character) {
  return /\s/u.test(character);
}
function normalizeSheetNameToken(sheetRaw) {
  if (!sheetRaw) {
    return void 0;
  }
  if (sheetRaw.startsWith("'") && sheetRaw.endsWith("'")) {
    return sheetRaw.slice(1, -1).replace(/''/gu, "'");
  }
  return sheetRaw;
}
function parseErrorValue(text) {
  switch (text) {
    case "#NULL!":
    case "#DIV/0!":
    case "#VALUE!":
    case "#REF!":
    case "#NAME?":
    case "#NUM!":
    case "#N/A":
    case "#GETTING_DATA":
      return text;
  }
  return void 0;
}
function readWhile(input, start, condition) {
  const cursor = { index: start, result: "" };
  while (cursor.index < input.length && condition(input[cursor.index] ?? "")) {
    cursor.result += input[cursor.index];
    cursor.index += 1;
  }
  return {
    value: cursor.result,
    next: cursor.index
  };
}
function readNumberToken(input, start) {
  const { value, next } = readWhile(input, start, (char) => isDigit(char) || char === ".");
  if (!NUMBER_PATTERN.test(value)) {
    throw new Error(`Invalid number literal "${value}"`);
  }
  return { token: { type: "number", value: Number.parseFloat(value) }, next };
}
function readStringToken(input, start) {
  const cursor = { index: start + 1, value: "" };
  while (cursor.index < input.length) {
    const char = input[cursor.index] ?? "";
    if (char === '"') {
      if (input[cursor.index + 1] === '"') {
        cursor.value += '"';
        cursor.index += 2;
        continue;
      }
      return { token: { type: "string", value: cursor.value }, next: cursor.index + 1 };
    }
    cursor.value += char;
    cursor.index += 1;
  }
  throw new Error("Unterminated string literal");
}
function isErrorBodyChar(char) {
  return isLetter(char) || isDigit(char) || char === "/" || char === "!" || char === "?" || char === "_";
}
function readErrorToken(input, start) {
  const { value, next } = readWhile(input, start, (char) => isErrorBodyChar(char) || char === "#");
  if (!value.startsWith("#")) {
    throw new Error("Error token must start with '#'");
  }
  const parsed = parseErrorValue(value);
  if (!parsed) {
    throw new Error(`Unknown error literal "${value}"`);
  }
  return { token: { type: "error", value: parsed }, next };
}
function readColumnReferenceLabel(input, start) {
  const cursor = { index: start, label: "" };
  const maybeDollar = input[cursor.index] ?? "";
  if (maybeDollar === "$") {
    cursor.label += "$";
    cursor.index += 1;
  }
  const { value: letters, next } = readWhile(input, cursor.index, (char) => isLetter(char));
  if (letters.length === 0) {
    throw new Error("Missing column in column reference");
  }
  cursor.label += letters.toUpperCase();
  cursor.index = next;
  return { label: cursor.label, next: cursor.index };
}
function readRowReferenceLabel(input, start) {
  const cursor = { index: start, label: "" };
  const maybeDollar = input[cursor.index] ?? "";
  if (maybeDollar === "$") {
    cursor.label += "$";
    cursor.index += 1;
  }
  const { value: digits, next } = readWhile(input, cursor.index, (char) => isDigit(char));
  if (digits.length === 0) {
    throw new Error("Missing row in row reference");
  }
  cursor.label += digits;
  cursor.index = next;
  return { label: cursor.label, next: cursor.index };
}
function readCellLabel(input, start) {
  const cursor = { index: start, label: "" };
  const maybeDollar1 = input[cursor.index] ?? "";
  if (maybeDollar1 === "$") {
    cursor.label += "$";
    cursor.index += 1;
  }
  const { value: columnPart, next: afterColumn } = readWhile(input, cursor.index, (char) => isLetter(char));
  if (columnPart.length === 0) {
    throw new Error("Missing column in cell reference");
  }
  cursor.label += columnPart.toUpperCase();
  cursor.index = afterColumn;
  const maybeDollar2 = input[cursor.index] ?? "";
  if (maybeDollar2 === "$") {
    cursor.label += "$";
    cursor.index += 1;
  }
  const { value: rowPart, next } = readWhile(input, cursor.index, (char) => isDigit(char));
  if (rowPart.length === 0) {
    throw new Error("Missing row in cell reference");
  }
  cursor.label += rowPart;
  return { label: cursor.label, next };
}
function readReferenceLabel(input, start) {
  const first = input[start] ?? "";
  if (first === "$") {
    const next = input[start + 1] ?? "";
    if (isDigit(next)) {
      return readRowReferenceLabel(input, start);
    }
    try {
      return readCellLabel(input, start);
    } catch (error) {
      if (error instanceof Error && error.message === "Missing row in cell reference") {
        return readColumnReferenceLabel(input, start);
      }
      throw error;
    }
  }
  if (isLetter(first)) {
    try {
      return readCellLabel(input, start);
    } catch (error) {
      if (error instanceof Error && error.message === "Missing row in cell reference") {
        return readColumnReferenceLabel(input, start);
      }
      throw error;
    }
  }
  if (isDigit(first)) {
    return readRowReferenceLabel(input, start);
  }
  throw new Error(`Unexpected reference label start "${first}"`);
}
function escapeSheetNameForFormula(sheetName) {
  return sheetName.replace(/'/gu, "''");
}
function readQuotedSheetReference(input, start) {
  const cursor = { index: start + 1, sheetName: "" };
  while (cursor.index < input.length) {
    const char = input[cursor.index] ?? "";
    if (char === "'") {
      if (input[cursor.index + 1] === "'") {
        cursor.sheetName += "'";
        cursor.index += 2;
        continue;
      }
      cursor.index += 1;
      if (input[cursor.index] !== "!") {
        throw new Error("Quoted sheet reference must be followed by '!'");
      }
      cursor.index += 1;
      const { label, next } = readReferenceLabel(input, cursor.index);
      return { reference: `'${escapeSheetNameForFormula(cursor.sheetName)}'!${label}`, next };
    }
    cursor.sheetName += char;
    cursor.index += 1;
  }
  throw new Error("Unterminated quoted sheet reference");
}
function tryReadSheetSpanReferenceToken(input, start) {
  const first = input[start] ?? "";
  if (!isLetter(first)) {
    return void 0;
  }
  const { value: sheetStart, next: afterStart } = readWhile(input, start, (char) => isLetter(char) || isDigit(char) || char === "_");
  if (sheetStart.length === 0 || (input[afterStart] ?? "") !== ":") {
    return void 0;
  }
  const sheetEndStart = afterStart + 1;
  const { value: sheetEnd, next: afterEnd } = readWhile(input, sheetEndStart, (char) => isLetter(char) || isDigit(char) || char === "_");
  if (sheetEnd.length === 0 || (input[afterEnd] ?? "") !== "!") {
    return void 0;
  }
  const refStart = afterEnd + 1;
  const { label, next } = readReferenceLabel(input, refStart);
  return {
    token: { type: "reference", value: `${sheetStart}:${sheetEnd}!${label}` },
    next
  };
}
function readIdentifierOrReferenceToken(input, start) {
  const allowNamespaceSeparator = (input[start] ?? "") === "_";
  const { value: head, next } = readWhile(
    input,
    start,
    (char) => allowNamespaceSeparator ? isIdentifierBodyNamespaced(char) : isIdentifierBodyStandard(char)
  );
  const upcoming = input[next] ?? "";
  if (upcoming === "[") {
    const cursor = { index: next, depth: 0, value: "" };
    while (cursor.index < input.length) {
      const c = input[cursor.index] ?? "";
      cursor.value += c;
      if (c === "[") {
        cursor.depth += 1;
      } else if (c === "]") {
        cursor.depth -= 1;
        if (cursor.depth === 0) {
          return { token: { type: "reference", value: `${head}${cursor.value}` }, next: cursor.index + 1 };
        }
      }
      cursor.index += 1;
    }
    throw new Error("Unterminated structured reference");
  }
  if (upcoming === "!") {
    const sheetName = head;
    const { label, next: afterLabel } = readReferenceLabel(input, next + 1);
    return { token: { type: "reference", value: `${sheetName}!${label}` }, next: afterLabel };
  }
  if (upcoming === "$") {
    const { label, next: afterLabel } = readReferenceLabel(input, start);
    return { token: { type: "reference", value: label }, next: afterLabel };
  }
  if (/^[A-Za-z]+\d+$/u.test(head) && upcoming !== "(") {
    return { token: { type: "reference", value: head.toUpperCase() }, next };
  }
  if (/^[A-Za-z]+$/u.test(head) && upcoming === ":") {
    return { token: { type: "reference", value: head.toUpperCase() }, next };
  }
  return { token: { type: "identifier", value: head }, next };
}
function tokenize(formula) {
  const tokens = [];
  const cursor = { index: 0 };
  while (cursor.index < formula.length) {
    const char = formula[cursor.index] ?? "";
    if (isWhitespace2(char)) {
      cursor.index += 1;
      continue;
    }
    if (char === "#") {
      const { token, next } = readErrorToken(formula, cursor.index);
      tokens.push(token);
      cursor.index = next;
      continue;
    }
    if (isDigit(char)) {
      const { value: digits, next } = readWhile(formula, cursor.index, (c) => isDigit(c));
      if ((formula[next] ?? "") === ":") {
        tokens.push({ type: "reference", value: digits });
        cursor.index = next;
        continue;
      }
      const { token, next: afterNumber } = readNumberToken(formula, cursor.index);
      tokens.push(token);
      cursor.index = afterNumber;
      continue;
    }
    if (char === '"') {
      const { token, next } = readStringToken(formula, cursor.index);
      tokens.push(token);
      cursor.index = next;
      continue;
    }
    if (char === "'") {
      const { reference, next } = readQuotedSheetReference(formula, cursor.index);
      tokens.push({ type: "reference", value: reference });
      cursor.index = next;
      continue;
    }
    if (char === "$") {
      const { label, next } = readReferenceLabel(formula, cursor.index);
      tokens.push({ type: "reference", value: label });
      cursor.index = next;
      continue;
    }
    if (isIdentifierStart(char)) {
      if (isLetter(char)) {
        const sheetSpan = tryReadSheetSpanReferenceToken(formula, cursor.index);
        if (sheetSpan) {
          tokens.push(sheetSpan.token);
          cursor.index = sheetSpan.next;
          continue;
        }
      }
      const { token, next } = readIdentifierOrReferenceToken(formula, cursor.index);
      tokens.push(token);
      cursor.index = next;
      continue;
    }
    if (char === "(" || char === ")") {
      tokens.push({ type: "paren", value: char });
      cursor.index += 1;
      continue;
    }
    if (char === "{" || char === "}") {
      tokens.push({ type: "bracket", value: char });
      cursor.index += 1;
      continue;
    }
    if (char === ",") {
      tokens.push({ type: "comma" });
      cursor.index += 1;
      continue;
    }
    if (char === ";") {
      tokens.push({ type: "semicolon" });
      cursor.index += 1;
      continue;
    }
    if (char === ":") {
      tokens.push({ type: "colon" });
      cursor.index += 1;
      continue;
    }
    if (char === "+" || char === "-" || char === "*" || char === "/" || char === "^" || char === "&") {
      tokens.push({ type: "operator", value: char });
      cursor.index += 1;
      continue;
    }
    if (char === "<" || char === ">" || char === "=") {
      const nextChar = formula[cursor.index + 1] ?? "";
      if (char === "<" && nextChar === ">") {
        tokens.push({ type: "comparator", value: "<>" });
        cursor.index += 2;
        continue;
      }
      if ((char === "<" || char === ">") && nextChar === "=") {
        tokens.push({ type: "comparator", value: char + "=" });
        cursor.index += 2;
        continue;
      }
      tokens.push({ type: "comparator", value: char });
      cursor.index += 1;
      continue;
    }
    throw new Error(`Unexpected character "${char}"`);
  }
  tokens.push({ type: "end" });
  return tokens;
}
function peek(state) {
  return state.tokens[state.index] ?? { type: "end" };
}
function consume(state) {
  const token = peek(state);
  state.index += 1;
  return token;
}
function expectToken(state, type) {
  const token = consume(state);
  if (token.type !== type) {
    throw new Error(`Expected token "${type}", got "${token.type}"`);
  }
  return token;
}
function parsePrimary(state) {
  const token = peek(state);
  if (token.type === "number") {
    consume(state);
    return { type: "Literal", value: token.value };
  }
  if (token.type === "string") {
    consume(state);
    return { type: "Literal", value: token.value };
  }
  if (token.type === "error") {
    consume(state);
    const error = { type: "error", value: token.value };
    return { type: "Literal", value: error };
  }
  if (token.type === "reference") {
    consume(state);
    if (token.value.includes("[") === true) {
      const bracket = token.value.indexOf("[");
      const tableName = token.value.slice(0, bracket);
      const remainder = token.value.slice(bracket);
      if (!remainder.startsWith("[") || !remainder.endsWith("]")) {
        throw new Error(`Unsupported structured reference token "${token.value}"`);
      }
      const inner = remainder.slice(1, -1);
      if (inner.startsWith("#")) {
        return { type: "StructuredTableReference", tableName, item: inner };
      }
      if (!inner.startsWith("[")) {
        return { type: "StructuredTableReference", tableName, startColumnName: inner, endColumnName: inner };
      }
      const parseBracketedName = (text, start) => {
        if ((text[start] ?? "") !== "[") {
          throw new Error("Expected '[' in structured reference");
        }
        const end = text.indexOf("]", start + 1);
        if (end === -1) {
          throw new Error("Unterminated column name in structured reference");
        }
        const name = text.slice(start + 1, end);
        return { name, next: end + 1 };
      };
      const first = parseBracketedName(inner, 0);
      const afterFirst = inner[first.next] ?? "";
      if (afterFirst === "") {
        if (first.name.trim().startsWith("#")) {
          return { type: "StructuredTableReference", tableName, item: first.name };
        }
        return { type: "StructuredTableReference", tableName, startColumnName: first.name, endColumnName: first.name };
      }
      if (afterFirst === ":") {
        const second = parseBracketedName(inner, first.next + 1);
        if (inner[second.next] !== void 0) {
          throw new Error(`Unsupported structured reference token "${token.value}"`);
        }
        return { type: "StructuredTableReference", tableName, startColumnName: first.name, endColumnName: second.name };
      }
      if (afterFirst === ",") {
        const item = first.name;
        const second = parseBracketedName(inner, first.next + 1);
        const afterSecond = inner[second.next] ?? "";
        if (afterSecond === "") {
          return { type: "StructuredTableReference", tableName, item, startColumnName: second.name, endColumnName: second.name };
        }
        if (afterSecond !== ":") {
          throw new Error(`Unsupported structured reference token "${token.value}"`);
        }
        const third = parseBracketedName(inner, second.next + 1);
        if (inner[third.next] !== void 0) {
          throw new Error(`Unsupported structured reference token "${token.value}"`);
        }
        return { type: "StructuredTableReference", tableName, item, startColumnName: second.name, endColumnName: third.name };
      }
      throw new Error(`Unsupported structured reference token "${token.value}"`);
    }
    const parseReferenceToken = (value) => {
      const bang = value.lastIndexOf("!");
      const sheetRaw = bang === -1 ? void 0 : value.slice(0, bang);
      const ref = bang === -1 ? value : value.slice(bang + 1);
      const sheetName = normalizeSheetNameToken(sheetRaw);
      try {
        const address = parseCellRef(ref);
        return { kind: "cell", start: address, end: address, ...sheetName ? { sheetName } : {} };
      } catch (error) {
        if (!(error instanceof Error)) {
          throw error;
        }
      }
      const colMatch = ref.match(COLUMN_REF_PATTERN);
      if (colMatch) {
        const [, dollar, letters] = colMatch;
        const col = columnLetterToIndex(letters);
        const colAbsolute = dollar === "$";
        return {
          kind: "column",
          ...sheetName ? { sheetName } : {},
          start: { col, row: rowIdx(1), colAbsolute, rowAbsolute: true },
          end: { col, row: rowIdx(EXCEL_MAX_ROWS), colAbsolute, rowAbsolute: true }
        };
      }
      const rowMatch = ref.match(ROW_REF_PATTERN);
      if (rowMatch) {
        const [, dollar, digits] = rowMatch;
        const rowNumber = Number.parseInt(digits, 10);
        const rowAbsolute = dollar === "$";
        return {
          kind: "row",
          ...sheetName ? { sheetName } : {},
          start: { col: colIdx(1), row: rowIdx(rowNumber), colAbsolute: true, rowAbsolute },
          end: { col: colIdx(EXCEL_MAX_COLS), row: rowIdx(rowNumber), colAbsolute: true, rowAbsolute }
        };
      }
      throw new Error(`Unsupported reference token "${value}"`);
    };
    const left = parseReferenceToken(token.value);
    if (peek(state).type === "colon") {
      consume(state);
      const endToken = expectToken(state, "reference");
      const right = parseReferenceToken(endToken.value);
      if (left.kind !== right.kind) {
        throw new Error("Mixed row/column/cell reference kinds are not supported");
      }
      if (left.sheetName && right.sheetName && left.sheetName !== right.sheetName) {
        throw new Error("Cross-sheet ranges are not supported");
      }
      const sheetName = left.sheetName ?? right.sheetName;
      const range = {
        start: left.start,
        end: right.end,
        ...sheetName ? { sheetName } : {}
      };
      return { type: "Range", range };
    }
    if (left.kind !== "cell") {
      throw new Error("Expected a cell reference");
    }
    if (left.sheetName?.includes(":") === true) {
      return {
        type: "Range",
        range: { start: left.start, end: left.end, sheetName: left.sheetName }
      };
    }
    return { type: "Reference", reference: left.start, ...left.sheetName ? { sheetName: left.sheetName } : {} };
  }
  if (token.type === "bracket" && token.value === "{") {
    consume(state);
    const rows = [];
    const rowState = { currentRow: [] };
    const closingToken = peek(state);
    if (closingToken.type === "bracket" && closingToken.value === "}") {
      consume(state);
      return { type: "Array", elements: [[]] };
    }
    while (true) {
      rowState.currentRow.push(parseExpression(state));
      const separator = peek(state);
      if (separator.type === "comma") {
        consume(state);
        continue;
      }
      if (separator.type === "semicolon") {
        consume(state);
        rows.push(rowState.currentRow);
        rowState.currentRow = [];
        continue;
      }
      if (separator.type === "bracket" && separator.value === "}") {
        consume(state);
        rows.push(rowState.currentRow);
        return { type: "Array", elements: rows };
      }
      throw new Error(`Unexpected token in array literal: ${separator.type}`);
    }
  }
  if (token.type === "identifier") {
    consume(state);
    const upper = token.value.toUpperCase();
    if (peek(state).type === "paren" && peek(state).value === "(") {
      consume(state);
      const args = [];
      if (peek(state).type !== "paren" || peek(state).value !== ")") {
        while (true) {
          args.push(parseExpression(state));
          const next = peek(state);
          if (next.type === "comma") {
            consume(state);
            continue;
          }
          break;
        }
      }
      expectToken(state, "paren");
      return { type: "Function", name: upper, args };
    }
    if (upper === "TRUE" || upper === "FALSE") {
      return { type: "Literal", value: upper === "TRUE" };
    }
    if (upper === "NULL" || upper === "NIL") {
      return { type: "Literal", value: null };
    }
    return { type: "Name", name: token.value };
  }
  if (token.type === "paren" && token.value === "(") {
    consume(state);
    const expr = parseExpression(state);
    const close = expectToken(state, "paren");
    if (close.value !== ")") {
      throw new Error("Expected ')'");
    }
    return expr;
  }
  throw new Error(`Unexpected token "${token.type}"`);
}
function parseUnary(state) {
  const token = peek(state);
  if (token.type === "operator" && (token.value === "+" || token.value === "-")) {
    consume(state);
    const argument = parseUnary(state);
    return { type: "Unary", operator: token.value, argument };
  }
  return parsePrimary(state);
}
function parsePower(state) {
  const node = parseUnary(state);
  return parsePowerTail(state, node);
}
function parsePowerTail(state, left) {
  const token = peek(state);
  if (token.type === "operator" && token.value === "^") {
    consume(state);
    return parsePowerTail(state, { type: "Binary", operator: "^", left, right: parseUnary(state) });
  }
  return left;
}
function parseMultiplicative(state) {
  const node = parsePower(state);
  return parseMultiplicativeTail(state, node);
}
function parseMultiplicativeTail(state, left) {
  const token = peek(state);
  if (token.type === "operator" && (token.value === "*" || token.value === "/")) {
    consume(state);
    return parseMultiplicativeTail(state, { type: "Binary", operator: token.value, left, right: parsePower(state) });
  }
  return left;
}
function parseAdditive(state) {
  const node = parseMultiplicative(state);
  return parseAdditiveTail(state, node);
}
function parseAdditiveTail(state, left) {
  const token = peek(state);
  if (token.type === "operator" && (token.value === "+" || token.value === "-")) {
    consume(state);
    return parseAdditiveTail(state, { type: "Binary", operator: token.value, left, right: parseMultiplicative(state) });
  }
  return left;
}
function parseConcatenation(state) {
  const node = parseAdditive(state);
  return parseConcatenationTail(state, node);
}
function parseConcatenationTail(state, left) {
  const token = peek(state);
  if (token.type === "operator" && token.value === "&") {
    consume(state);
    return parseConcatenationTail(state, { type: "Binary", operator: "&", left, right: parseAdditive(state) });
  }
  return left;
}
function parseComparison(state) {
  const node = parseConcatenation(state);
  return parseComparisonTail(state, node);
}
function parseComparisonTail(state, left) {
  const token = peek(state);
  if (token.type === "comparator") {
    consume(state);
    return parseComparisonTail(state, { type: "Compare", operator: token.value, left, right: parseConcatenation(state) });
  }
  return left;
}
function parseExpression(state) {
  return parseComparison(state);
}
function parseFormula(formula) {
  const tokens = tokenize(formula);
  const state = { tokens, index: 0 };
  const expr = parseExpression(state);
  const end = consume(state);
  if (end.type !== "end") {
    throw new Error("Unexpected trailing tokens");
  }
  return expr;
}
var REF_ERROR = { type: "error", value: "#REF!" };
function shiftAddress(address, deltaCols, deltaRows) {
  const col = address.col;
  const row = address.row;
  const nextCol = address.colAbsolute ? col : col + deltaCols;
  const nextRow = address.rowAbsolute ? row : row + deltaRows;
  if (nextCol < 1 || nextCol > EXCEL_MAX_COLS) {
    return void 0;
  }
  if (nextRow < 1 || nextRow > EXCEL_MAX_ROWS) {
    return void 0;
  }
  return {
    col: colIdx(nextCol),
    row: rowIdx(nextRow),
    colAbsolute: address.colAbsolute,
    rowAbsolute: address.rowAbsolute
  };
}
function shiftRange(range, deltaCols, deltaRows) {
  const start = shiftAddress(range.start, deltaCols, deltaRows);
  const end = shiftAddress(range.end, deltaCols, deltaRows);
  if (!start || !end) {
    return void 0;
  }
  return {
    start,
    end,
    ...range.sheetName ? { sheetName: range.sheetName } : {}
  };
}
function shiftAst(node, deltaCols, deltaRows) {
  switch (node.type) {
    case "Literal":
      return node;
    case "Reference": {
      const shifted = shiftAddress(node.reference, deltaCols, deltaRows);
      if (!shifted) {
        return { type: "Literal", value: REF_ERROR };
      }
      return {
        type: "Reference",
        reference: shifted,
        ...node.sheetName ? { sheetName: node.sheetName } : {}
      };
    }
    case "Range": {
      const shifted = shiftRange(node.range, deltaCols, deltaRows);
      if (!shifted) {
        return { type: "Literal", value: REF_ERROR };
      }
      return { type: "Range", range: shifted };
    }
    case "Name":
      return node;
    case "StructuredTableReference":
      return node;
    case "Unary":
      return { type: "Unary", operator: node.operator, argument: shiftAst(node.argument, deltaCols, deltaRows) };
    case "Binary":
      return {
        type: "Binary",
        operator: node.operator,
        left: shiftAst(node.left, deltaCols, deltaRows),
        right: shiftAst(node.right, deltaCols, deltaRows)
      };
    case "Compare":
      return {
        type: "Compare",
        operator: node.operator,
        left: shiftAst(node.left, deltaCols, deltaRows),
        right: shiftAst(node.right, deltaCols, deltaRows)
      };
    case "Function":
      return { type: "Function", name: node.name, args: node.args.map((arg) => shiftAst(arg, deltaCols, deltaRows)) };
    case "Array":
      return { type: "Array", elements: node.elements.map((row) => row.map((el) => shiftAst(el, deltaCols, deltaRows))) };
  }
}
function tryParseFormulaAst(formula) {
  try {
    return parseFormula(formula);
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }
    return void 0;
  }
}
function shiftFormulaReferences(formula, deltaCols, deltaRows) {
  if (deltaCols === 0 && deltaRows === 0) {
    return formula;
  }
  const parsed = tryParseFormulaAst(formula);
  if (!parsed) {
    return formula;
  }
  const shifted = shiftAst(parsed, deltaCols, deltaRows);
  return formatFormula(shifted);
}

// node_modules/aurochs/dist/_shared/worksheet-DQDWQqQQ.js
function createDefaultStyleSheet() {
  const defaultFont = {
    name: "Calibri",
    size: 11,
    scheme: "minor"
  };
  const defaultFills = [
    { type: "none" },
    { type: "pattern", pattern: { patternType: "gray125" } }
  ];
  const defaultBorder = {
    // All edges are undefined = none
  };
  const defaultCellXf = {
    numFmtId: numFmtId(0),
    // General format
    fontId: fontId(0),
    fillId: fillId(0),
    borderId: borderId(0)
  };
  const defaultCellStyleXf = {
    numFmtId: numFmtId(0),
    fontId: fontId(0),
    fillId: fillId(0),
    borderId: borderId(0)
  };
  const defaultCellStyle = {
    name: "Normal",
    xfId: 0,
    builtinId: 0
  };
  return {
    fonts: [defaultFont],
    fills: defaultFills,
    borders: [defaultBorder],
    numberFormats: [],
    // No custom formats, using built-in only
    cellXfs: [defaultCellXf],
    cellStyleXfs: [defaultCellStyleXf],
    cellStyles: [defaultCellStyle]
  };
}
function createDefaultParseContext() {
  return {
    sharedStrings: [],
    styleSheet: createDefaultStyleSheet(),
    workbookInfo: { sheets: [], dateSystem: "1900" },
    relationships: /* @__PURE__ */ new Map()
  };
}
function parseIntAttr2(value) {
  if (value === void 0 || value === "") {
    return void 0;
  }
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    return void 0;
  }
  return num;
}
function parseFloatAttr(value) {
  if (value === void 0 || value === "") {
    return void 0;
  }
  const num = parseFloat(value);
  if (isNaN(num)) {
    return void 0;
  }
  return num;
}
function parseBooleanAttr(value) {
  if (value === void 0) {
    return void 0;
  }
  if (value === "1" || value === "true") {
    return true;
  }
  if (value === "0" || value === "false") {
    return false;
  }
  return void 0;
}
function parseFormula2(formulaElement) {
  const expression = getTextContent(formulaElement);
  const type = getAttr(formulaElement, "t") ?? "normal";
  const refAttr = getAttr(formulaElement, "ref");
  const siAttr = getAttr(formulaElement, "si");
  const caAttr = getAttr(formulaElement, "ca");
  return {
    expression,
    type,
    ref: refAttr ? parseRange(refAttr) : void 0,
    sharedIndex: siAttr ? parseInt(siAttr, 10) : void 0,
    calculateAlways: parseBooleanAttr(caAttr)
  };
}
function parseCellValue(cellElement, cellType, context) {
  const v = getChild(cellElement, "v");
  const vText = v ? getTextContent(v) : "";
  const t = cellType ?? "n";
  switch (t) {
    case "s": {
      const idx = parseInt(vText, 10);
      const str = context.sharedStrings[idx] ?? "";
      return { type: "string", value: str };
    }
    case "n": {
      if (vText === "") {
        return { type: "empty" };
      }
      return { type: "number", value: parseFloat(vText) };
    }
    case "b": {
      return { type: "boolean", value: vText === "1" };
    }
    case "e": {
      return { type: "error", value: vText };
    }
    case "str": {
      return { type: "string", value: vText };
    }
    case "inlineStr": {
      const is = getChild(cellElement, "is");
      const t2 = is ? getChild(is, "t") : void 0;
      return { type: "string", value: t2 ? getTextContent(t2) : "" };
    }
    case "d": {
      return { type: "date", value: new Date(vText) };
    }
    default:
      return { type: "string", value: vText };
  }
}
function parseCellWithAddress(cellElement, context, address) {
  const s = getAttr(cellElement, "s");
  const t = getAttr(cellElement, "t");
  const value = parseCellValue(cellElement, t, context);
  const f = getChild(cellElement, "f");
  const formula = f ? parseFormula2(f) : void 0;
  return {
    address,
    value,
    formula,
    styleId: s ? styleId(parseInt(s, 10)) : void 0
  };
}
function hasExpression(formula) {
  return formula.expression.trim().length > 0;
}
function collectSharedFormulaSeeds(rows) {
  const seeds = /* @__PURE__ */ new Map();
  for (const row of rows) {
    for (const cell of row.cells) {
      const formula = cell.formula;
      const sharedIndex = formula?.sharedIndex;
      if (!formula || formula.type !== "shared" || sharedIndex === void 0) {
        continue;
      }
      if (!hasExpression(formula)) {
        continue;
      }
      if (seeds.has(sharedIndex)) {
        continue;
      }
      seeds.set(sharedIndex, { baseAddress: cell.address, expression: formula.expression });
    }
  }
  return seeds;
}
function expandSharedFormulaCell(cell, seeds) {
  const formula = cell.formula;
  const sharedIndex = formula?.sharedIndex;
  if (!formula || formula.type !== "shared" || sharedIndex === void 0) {
    return cell;
  }
  if (hasExpression(formula)) {
    return cell;
  }
  const seed = seeds.get(sharedIndex);
  if (!seed) {
    return cell;
  }
  const deltaCols = cell.address.col - seed.baseAddress.col;
  const deltaRows = cell.address.row - seed.baseAddress.row;
  const shifted = shiftFormulaReferences(seed.expression, deltaCols, deltaRows);
  if (shifted === formula.expression) {
    return cell;
  }
  return { ...cell, formula: { ...formula, expression: shifted } };
}
function expandSharedFormulas(rows) {
  const seeds = collectSharedFormulaSeeds(rows);
  if (seeds.size === 0) {
    return rows;
  }
  const nextRows = rows.map((row) => {
    const nextCells = row.cells.map((cell) => expandSharedFormulaCell(cell, seeds));
    const changed = nextCells.some((cell, index) => cell !== row.cells[index]);
    return changed ? { ...row, cells: nextCells } : row;
  });
  const anyRowChanged = nextRows.some((row, index) => row !== rows[index]);
  return anyRowChanged ? nextRows : rows;
}
function parsePageSetup(pageSetupElement) {
  if (!pageSetupElement) {
    return void 0;
  }
  const paperSize = parseIntAttr2(getAttr(pageSetupElement, "paperSize"));
  const orientation = getAttr(pageSetupElement, "orientation");
  const scale = parseIntAttr2(getAttr(pageSetupElement, "scale"));
  const fitToWidth = parseIntAttr2(getAttr(pageSetupElement, "fitToWidth"));
  const fitToHeight = parseIntAttr2(getAttr(pageSetupElement, "fitToHeight"));
  const firstPageNumber = parseIntAttr2(getAttr(pageSetupElement, "firstPageNumber"));
  const useFirstPageNumber = parseBooleanAttr(getAttr(pageSetupElement, "useFirstPageNumber"));
  const blackAndWhite = parseBooleanAttr(getAttr(pageSetupElement, "blackAndWhite"));
  const draft = parseBooleanAttr(getAttr(pageSetupElement, "draft"));
  const cellComments = getAttr(pageSetupElement, "cellComments");
  const pageOrder = getAttr(pageSetupElement, "pageOrder");
  const horizontalDpi = parseIntAttr2(getAttr(pageSetupElement, "horizontalDpi"));
  const verticalDpi = parseIntAttr2(getAttr(pageSetupElement, "verticalDpi"));
  const copies = parseIntAttr2(getAttr(pageSetupElement, "copies"));
  return {
    ...paperSize !== void 0 && { paperSize },
    ...orientation && { orientation },
    ...scale !== void 0 && { scale },
    ...fitToWidth !== void 0 && { fitToWidth },
    ...fitToHeight !== void 0 && { fitToHeight },
    ...firstPageNumber !== void 0 && { firstPageNumber },
    ...useFirstPageNumber !== void 0 && { useFirstPageNumber },
    ...blackAndWhite !== void 0 && { blackAndWhite },
    ...draft !== void 0 && { draft },
    ...cellComments && { cellComments },
    ...pageOrder && { pageOrder },
    ...horizontalDpi !== void 0 && { horizontalDpi },
    ...verticalDpi !== void 0 && { verticalDpi },
    ...copies !== void 0 && { copies }
  };
}
function parsePageMargins2(pageMarginsElement) {
  if (!pageMarginsElement) {
    return void 0;
  }
  const left = parseFloatAttr(getAttr(pageMarginsElement, "left"));
  const right = parseFloatAttr(getAttr(pageMarginsElement, "right"));
  const top = parseFloatAttr(getAttr(pageMarginsElement, "top"));
  const bottom = parseFloatAttr(getAttr(pageMarginsElement, "bottom"));
  const header = parseFloatAttr(getAttr(pageMarginsElement, "header"));
  const footer = parseFloatAttr(getAttr(pageMarginsElement, "footer"));
  return {
    ...left !== void 0 && { left },
    ...right !== void 0 && { right },
    ...top !== void 0 && { top },
    ...bottom !== void 0 && { bottom },
    ...header !== void 0 && { header },
    ...footer !== void 0 && { footer }
  };
}
function parseHeaderFooter(headerFooterElement) {
  if (!headerFooterElement) {
    return void 0;
  }
  const differentOddEven = parseBooleanAttr(getAttr(headerFooterElement, "differentOddEven"));
  const differentFirst = parseBooleanAttr(getAttr(headerFooterElement, "differentFirst"));
  const scaleWithDoc = parseBooleanAttr(getAttr(headerFooterElement, "scaleWithDoc"));
  const alignWithMargins = parseBooleanAttr(getAttr(headerFooterElement, "alignWithMargins"));
  const oddHeaderEl = getChild(headerFooterElement, "oddHeader");
  const oddFooterEl = getChild(headerFooterElement, "oddFooter");
  const evenHeaderEl = getChild(headerFooterElement, "evenHeader");
  const evenFooterEl = getChild(headerFooterElement, "evenFooter");
  const firstHeaderEl = getChild(headerFooterElement, "firstHeader");
  const firstFooterEl = getChild(headerFooterElement, "firstFooter");
  const oddHeader = oddHeaderEl ? getTextContent(oddHeaderEl) : void 0;
  const oddFooter = oddFooterEl ? getTextContent(oddFooterEl) : void 0;
  const evenHeader = evenHeaderEl ? getTextContent(evenHeaderEl) : void 0;
  const evenFooter = evenFooterEl ? getTextContent(evenFooterEl) : void 0;
  const firstHeader = firstHeaderEl ? getTextContent(firstHeaderEl) : void 0;
  const firstFooter = firstFooterEl ? getTextContent(firstFooterEl) : void 0;
  return {
    ...oddHeader && { oddHeader },
    ...oddFooter && { oddFooter },
    ...evenHeader && { evenHeader },
    ...evenFooter && { evenFooter },
    ...firstHeader && { firstHeader },
    ...firstFooter && { firstFooter },
    ...differentOddEven !== void 0 && { differentOddEven },
    ...differentFirst !== void 0 && { differentFirst },
    ...scaleWithDoc !== void 0 && { scaleWithDoc },
    ...alignWithMargins !== void 0 && { alignWithMargins }
  };
}
function parsePrintOptions(printOptionsElement) {
  if (!printOptionsElement) {
    return void 0;
  }
  const gridLines = parseBooleanAttr(getAttr(printOptionsElement, "gridLines"));
  const headings = parseBooleanAttr(getAttr(printOptionsElement, "headings"));
  const gridLinesSet = parseBooleanAttr(getAttr(printOptionsElement, "gridLinesSet"));
  const horizontalCentered = parseBooleanAttr(getAttr(printOptionsElement, "horizontalCentered"));
  const verticalCentered = parseBooleanAttr(getAttr(printOptionsElement, "verticalCentered"));
  return {
    ...gridLines !== void 0 && { gridLines },
    ...headings !== void 0 && { headings },
    ...gridLinesSet !== void 0 && { gridLinesSet },
    ...horizontalCentered !== void 0 && { horizontalCentered },
    ...verticalCentered !== void 0 && { verticalCentered }
  };
}
function parseSheetProtection(sheetProtectionElement) {
  if (!sheetProtectionElement) {
    return void 0;
  }
  const sheet = parseBooleanAttr(getAttr(sheetProtectionElement, "sheet"));
  const objects = parseBooleanAttr(getAttr(sheetProtectionElement, "objects"));
  const scenarios = parseBooleanAttr(getAttr(sheetProtectionElement, "scenarios"));
  const formatCells = parseBooleanAttr(getAttr(sheetProtectionElement, "formatCells"));
  const formatColumns = parseBooleanAttr(getAttr(sheetProtectionElement, "formatColumns"));
  const formatRows = parseBooleanAttr(getAttr(sheetProtectionElement, "formatRows"));
  const insertColumns = parseBooleanAttr(getAttr(sheetProtectionElement, "insertColumns"));
  const insertRows = parseBooleanAttr(getAttr(sheetProtectionElement, "insertRows"));
  const insertHyperlinks = parseBooleanAttr(getAttr(sheetProtectionElement, "insertHyperlinks"));
  const deleteColumns = parseBooleanAttr(getAttr(sheetProtectionElement, "deleteColumns"));
  const deleteRows = parseBooleanAttr(getAttr(sheetProtectionElement, "deleteRows"));
  const selectLockedCells = parseBooleanAttr(getAttr(sheetProtectionElement, "selectLockedCells"));
  const sort = parseBooleanAttr(getAttr(sheetProtectionElement, "sort"));
  const autoFilter = parseBooleanAttr(getAttr(sheetProtectionElement, "autoFilter"));
  const pivotTables = parseBooleanAttr(getAttr(sheetProtectionElement, "pivotTables"));
  const selectUnlockedCells = parseBooleanAttr(getAttr(sheetProtectionElement, "selectUnlockedCells"));
  const password = getAttr(sheetProtectionElement, "password") ?? void 0;
  const algorithmName = getAttr(sheetProtectionElement, "algorithmName") ?? void 0;
  const hashValue = getAttr(sheetProtectionElement, "hashValue") ?? void 0;
  const saltValue = getAttr(sheetProtectionElement, "saltValue") ?? void 0;
  const spinCount = parseIntAttr2(getAttr(sheetProtectionElement, "spinCount"));
  return {
    ...sheet !== void 0 && { sheet },
    ...objects !== void 0 && { objects },
    ...scenarios !== void 0 && { scenarios },
    ...formatCells !== void 0 && { formatCells },
    ...formatColumns !== void 0 && { formatColumns },
    ...formatRows !== void 0 && { formatRows },
    ...insertColumns !== void 0 && { insertColumns },
    ...insertRows !== void 0 && { insertRows },
    ...insertHyperlinks !== void 0 && { insertHyperlinks },
    ...deleteColumns !== void 0 && { deleteColumns },
    ...deleteRows !== void 0 && { deleteRows },
    ...selectLockedCells !== void 0 && { selectLockedCells },
    ...sort !== void 0 && { sort },
    ...autoFilter !== void 0 && { autoFilter },
    ...pivotTables !== void 0 && { pivotTables },
    ...selectUnlockedCells !== void 0 && { selectUnlockedCells },
    ...password && { password },
    ...algorithmName && { algorithmName },
    ...hashValue && { hashValue },
    ...saltValue && { saltValue },
    ...spinCount !== void 0 && { spinCount }
  };
}
function parseBreak2(brkElement) {
  return {
    id: parseIntAttr2(getAttr(brkElement, "id")) ?? 0,
    max: parseIntAttr2(getAttr(brkElement, "max")),
    min: parseIntAttr2(getAttr(brkElement, "min")),
    manual: parseBooleanAttr(getAttr(brkElement, "man")),
    pt: parseBooleanAttr(getAttr(brkElement, "pt"))
  };
}
function parsePageBreaks(worksheetElement) {
  const rowBreaksEl = getChild(worksheetElement, "rowBreaks");
  const colBreaksEl = getChild(worksheetElement, "colBreaks");
  if (!rowBreaksEl && !colBreaksEl) {
    return void 0;
  }
  const rowBreaks = rowBreaksEl ? getChildren(rowBreaksEl, "brk").map(parseBreak2) : [];
  const colBreaks = colBreaksEl ? getChildren(colBreaksEl, "brk").map(parseBreak2) : [];
  if (rowBreaks.length === 0 && colBreaks.length === 0) {
    return void 0;
  }
  return { rowBreaks, colBreaks };
}
function parseSparklineGroups(worksheetElement) {
  const extLstEl = getChild(worksheetElement, "extLst");
  if (!extLstEl) {
    return void 0;
  }
  const extElements = getChildren(extLstEl, "ext");
  for (const extEl of extElements) {
    const sparklineGroupsEl = extEl.children.find(
      (child) => child.type === "element" && child.name.endsWith(":sparklineGroups")
    );
    if (!sparklineGroupsEl) {
      const altSparklineGroupsEl = getChild(extEl, "sparklineGroups");
      if (altSparklineGroupsEl) {
        return parseSparklineGroupsElement(altSparklineGroupsEl);
      }
      continue;
    }
    return parseSparklineGroupsElement(sparklineGroupsEl);
  }
  return void 0;
}
function parseSparklineGroupsElement(sparklineGroupsEl) {
  const groups = [];
  const groupElements = sparklineGroupsEl.children.filter(
    (child) => child.type === "element" && (child.name === "sparklineGroup" || child.name.endsWith(":sparklineGroup"))
  );
  for (const groupEl of groupElements) {
    const group = parseSparklineGroup(groupEl);
    if (group) {
      groups.push(group);
    }
  }
  return groups.length > 0 ? groups : [];
}
function parseSparklineGroup(groupEl) {
  const typeAttr = getAttr(groupEl, "type");
  const type = typeAttr === "column" ? "column" : typeAttr === "stacked" ? "stacked" : "line";
  const sparklinesEl = groupEl.children.find(
    (child) => child.type === "element" && (child.name === "sparklines" || child.name.endsWith(":sparklines"))
  );
  if (!sparklinesEl) {
    return void 0;
  }
  const sparklines = [];
  const sparklineElements = sparklinesEl.children.filter(
    (child) => child.type === "element" && (child.name === "sparkline" || child.name.endsWith(":sparkline"))
  );
  for (const sparklineEl of sparklineElements) {
    const fEl = sparklineEl.children.find(
      (child) => child.type === "element" && (child.name === "f" || child.name.endsWith(":f"))
    );
    const sqrefEl = sparklineEl.children.find(
      (child) => child.type === "element" && (child.name === "sqref" || child.name.endsWith(":sqref"))
    );
    const f = fEl ? getTextContent(fEl) : void 0;
    const sqref = sqrefEl ? getTextContent(sqrefEl) : void 0;
    if (f && sqref) {
      sparklines.push({ f, sqref });
    }
  }
  if (sparklines.length === 0) {
    return void 0;
  }
  const colorSeries = parseSparklineColor(groupEl, "colorSeries");
  const colorNegative = parseSparklineColor(groupEl, "colorNegative");
  const colorAxis = parseSparklineColor(groupEl, "colorAxis");
  const colorMarkers = parseSparklineColor(groupEl, "colorMarkers");
  const colorFirst = parseSparklineColor(groupEl, "colorFirst");
  const colorLast = parseSparklineColor(groupEl, "colorLast");
  const colorHigh = parseSparklineColor(groupEl, "colorHigh");
  const colorLow = parseSparklineColor(groupEl, "colorLow");
  return {
    type,
    sparklines,
    colorSeries,
    colorNegative,
    colorAxis,
    colorMarkers,
    colorFirst,
    colorLast,
    colorHigh,
    colorLow,
    first: parseBooleanAttr(getAttr(groupEl, "first")),
    last: parseBooleanAttr(getAttr(groupEl, "last")),
    high: parseBooleanAttr(getAttr(groupEl, "high")),
    low: parseBooleanAttr(getAttr(groupEl, "low")),
    negative: parseBooleanAttr(getAttr(groupEl, "negative")),
    markers: parseBooleanAttr(getAttr(groupEl, "markers")),
    lineWeight: parseFloatAttr(getAttr(groupEl, "lineWeight")),
    displayEmptyCellsAs: getAttr(groupEl, "displayEmptyCellsAs"),
    displayHidden: parseBooleanAttr(getAttr(groupEl, "displayHidden")),
    dateAxis: getAttr(groupEl, "dateAxis") ?? void 0
  };
}
function parseSparklineColor(groupEl, colorName) {
  const colorEl = groupEl.children.find(
    (child) => child.type === "element" && (child.name === colorName || child.name.endsWith(`:${colorName}`))
  );
  if (!colorEl) {
    return void 0;
  }
  return parseColorElement(colorEl);
}
function parseColumn2(colElement) {
  const styleAttr = parseIntAttr2(getAttr(colElement, "style"));
  return {
    min: colIdx(parseIntAttr2(getAttr(colElement, "min")) ?? 1),
    max: colIdx(parseIntAttr2(getAttr(colElement, "max")) ?? 1),
    width: parseFloatAttr(getAttr(colElement, "width")),
    hidden: parseBooleanAttr(getAttr(colElement, "hidden")),
    bestFit: parseBooleanAttr(getAttr(colElement, "bestFit")),
    customWidth: parseBooleanAttr(getAttr(colElement, "customWidth")),
    styleId: styleAttr !== void 0 ? styleId(styleAttr) : void 0,
    outlineLevel: parseIntAttr2(getAttr(colElement, "outlineLevel")),
    collapsed: parseBooleanAttr(getAttr(colElement, "collapsed"))
  };
}
function parseCols(colsElement) {
  if (!colsElement) {
    return [];
  }
  return getChildren(colsElement, "col").map(parseColumn2);
}
function parseRowAttrs(rowElement) {
  const rowNumberAttr = parseIntAttr2(getAttr(rowElement, "r"));
  const r = rowNumberAttr ?? 1;
  const styleAttr = parseIntAttr2(getAttr(rowElement, "s"));
  return {
    rowNumber: rowIdx(r),
    height: parseFloatAttr(getAttr(rowElement, "ht")),
    hidden: parseBooleanAttr(getAttr(rowElement, "hidden")),
    customHeight: parseBooleanAttr(getAttr(rowElement, "customHeight")),
    styleId: styleAttr !== void 0 ? styleId(styleAttr) : void 0,
    outlineLevel: parseIntAttr2(getAttr(rowElement, "outlineLevel")),
    collapsed: parseBooleanAttr(getAttr(rowElement, "collapsed"))
  };
}
function parseRow(params) {
  const { rowElement, context, options, fallbackRowNumber } = params;
  const rowNumberAttr = parseIntAttr2(getAttr(rowElement, "r"));
  const cellElements = getChildren(rowElement, "c");
  const firstCell = cellElements[0];
  const firstCellRef = firstCell ? getAttr(firstCell, "r") : void 0;
  const rowNumberFromCellRef = firstCellRef ? parseCellRef(firstCellRef).row : void 0;
  const r = rowNumberAttr ?? rowNumberFromCellRef ?? fallbackRowNumber ?? 1;
  const allowMissingCellRef = options?.compatibility?.allowMissingCellRef === true;
  const cells = [];
  for (let nextCol = 1, idx = 0; idx < cellElements.length; idx += 1) {
    const cellElement = cellElements[idx];
    if (!cellElement) {
      continue;
    }
    const explicitRef = getAttr(cellElement, "r");
    if (explicitRef) {
      const address2 = parseCellRef(explicitRef);
      cells.push(parseCellWithAddress(cellElement, context, address2));
      nextCol = address2.col + 1;
      continue;
    }
    if (!allowMissingCellRef) {
      throw new Error("Cell element missing 'r' attribute");
    }
    const address = { col: colIdx(nextCol), row: rowIdx(r), colAbsolute: false, rowAbsolute: false };
    cells.push(parseCellWithAddress(cellElement, context, address));
    nextCol += 1;
  }
  const attrs = parseRowAttrs(rowElement);
  return {
    ...attrs,
    rowNumber: rowIdx(r),
    cells
  };
}
function parseSheetData(sheetDataElement, context, options) {
  const rowElements = getChildren(sheetDataElement, "row");
  const rows = [];
  for (let idx = 0, nextRowNumber = 1; idx < rowElements.length; idx += 1) {
    const rowElement = rowElements[idx];
    if (!rowElement) {
      continue;
    }
    const explicitRowNumber = parseIntAttr2(getAttr(rowElement, "r"));
    const fallbackRowNumber = explicitRowNumber ?? nextRowNumber;
    const row = parseRow({ rowElement, context, options, fallbackRowNumber });
    rows.push(row);
    nextRowNumber = row.rowNumber + 1;
  }
  return rows;
}
function parseMergeCells(mergeCellsElement) {
  if (!mergeCellsElement) {
    return [];
  }
  return getChildren(mergeCellsElement, "mergeCell").map((mc) => getAttr(mc, "ref")).filter((ref) => ref !== void 0).map(parseRange);
}
function parseSqrefRanges(sqref) {
  const tokens = sqref.trim().split(/\s+/u).filter((token) => token.length > 0);
  return tokens.map(parseRange);
}
function parseCfvo(cfvoElement) {
  return {
    type: getAttr(cfvoElement, "type") ?? "num",
    val: getAttr(cfvoElement, "val") ?? void 0,
    gte: parseBooleanAttr(getAttr(cfvoElement, "gte"))
  };
}
function parseColorScaleRule(ruleElement) {
  const colorScaleEl = getChild(ruleElement, "colorScale");
  if (!colorScaleEl) {
    return void 0;
  }
  const cfvoElements = getChildren(colorScaleEl, "cfvo");
  const colorElements = getChildren(colorScaleEl, "color");
  if (cfvoElements.length < 2 || colorElements.length < 2) {
    return void 0;
  }
  return {
    type: "colorScale",
    priority: parseIntAttr2(getAttr(ruleElement, "priority")),
    stopIfTrue: parseBooleanAttr(getAttr(ruleElement, "stopIfTrue")),
    cfvo: cfvoElements.map(parseCfvo),
    colors: colorElements.map(parseColorElement).filter((c) => c !== void 0)
  };
}
function parseDataBarRule(ruleElement) {
  const dataBarEl = getChild(ruleElement, "dataBar");
  if (!dataBarEl) {
    return void 0;
  }
  const cfvoElements = getChildren(dataBarEl, "cfvo");
  const colorEl = getChild(dataBarEl, "color");
  const fillColorEl = getChild(dataBarEl, "fillColor");
  const borderColorEl = getChild(dataBarEl, "borderColor");
  const negativeFillColorEl = getChild(dataBarEl, "negativeFillColor");
  const negativeBorderColorEl = getChild(dataBarEl, "negativeBorderColor");
  const axisColorEl = getChild(dataBarEl, "axisColor");
  return {
    type: "dataBar",
    priority: parseIntAttr2(getAttr(ruleElement, "priority")),
    stopIfTrue: parseBooleanAttr(getAttr(ruleElement, "stopIfTrue")),
    cfvo: cfvoElements.map(parseCfvo),
    color: colorEl ? parseColorElement(colorEl) : fillColorEl ? parseColorElement(fillColorEl) : void 0,
    showValue: parseBooleanAttr(getAttr(dataBarEl, "showValue")) ?? true,
    minLength: parseIntAttr2(getAttr(dataBarEl, "minLength")),
    maxLength: parseIntAttr2(getAttr(dataBarEl, "maxLength")),
    gradient: parseBooleanAttr(getAttr(dataBarEl, "gradient")),
    borderColor: borderColorEl ? parseColorElement(borderColorEl) : void 0,
    negativeFillColor: negativeFillColorEl ? parseColorElement(negativeFillColorEl) : void 0,
    negativeBorderColor: negativeBorderColorEl ? parseColorElement(negativeBorderColorEl) : void 0,
    axisColor: axisColorEl ? parseColorElement(axisColorEl) : void 0,
    axisPosition: getAttr(dataBarEl, "axisPosition"),
    direction: getAttr(dataBarEl, "direction")
  };
}
function parseIconSetRule(ruleElement) {
  const iconSetEl = getChild(ruleElement, "iconSet");
  if (!iconSetEl) {
    return void 0;
  }
  const cfvoElements = getChildren(iconSetEl, "cfvo");
  const iconSetName = getAttr(iconSetEl, "iconSet") ?? "3TrafficLights1";
  const cfIconElements = getChildren(iconSetEl, "cfIcon");
  const customIcons = cfIconElements.map((iconEl) => ({
    iconSet: getAttr(iconEl, "iconSet") ?? iconSetName,
    iconId: parseIntAttr2(getAttr(iconEl, "iconId")) ?? 0
  }));
  return {
    type: "iconSet",
    priority: parseIntAttr2(getAttr(ruleElement, "priority")),
    stopIfTrue: parseBooleanAttr(getAttr(ruleElement, "stopIfTrue")),
    iconSet: iconSetName,
    cfvo: cfvoElements.map(parseCfvo),
    showValue: parseBooleanAttr(getAttr(iconSetEl, "showValue")),
    reverse: parseBooleanAttr(getAttr(iconSetEl, "reverse")),
    iconOnly: parseBooleanAttr(getAttr(iconSetEl, "iconOnly")),
    customIcons: customIcons.length > 0 ? customIcons : void 0
  };
}
function parseStandardRule(ruleElement) {
  return {
    type: getAttr(ruleElement, "type") ?? "expression",
    dxfId: parseIntAttr2(getAttr(ruleElement, "dxfId")),
    priority: parseIntAttr2(getAttr(ruleElement, "priority")),
    operator: getAttr(ruleElement, "operator") ?? void 0,
    stopIfTrue: parseBooleanAttr(getAttr(ruleElement, "stopIfTrue")),
    formulas: getChildren(ruleElement, "formula").map((el) => getTextContent(el)),
    text: getAttr(ruleElement, "text") ?? void 0,
    timePeriod: getAttr(ruleElement, "timePeriod") ?? void 0,
    rank: parseIntAttr2(getAttr(ruleElement, "rank")),
    percent: parseBooleanAttr(getAttr(ruleElement, "percent")),
    bottom: parseBooleanAttr(getAttr(ruleElement, "bottom")),
    stdDev: parseIntAttr2(getAttr(ruleElement, "stdDev")),
    equalAverage: parseBooleanAttr(getAttr(ruleElement, "equalAverage")),
    aboveAverage: parseBooleanAttr(getAttr(ruleElement, "aboveAverage"))
  };
}
function parseConditionalFormattingRule(ruleElement) {
  const type = getAttr(ruleElement, "type");
  if (type === "colorScale") {
    const colorScaleRule = parseColorScaleRule(ruleElement);
    if (colorScaleRule) {
      return colorScaleRule;
    }
  }
  if (type === "dataBar") {
    const dataBarRule = parseDataBarRule(ruleElement);
    if (dataBarRule) {
      return dataBarRule;
    }
  }
  if (type === "iconSet") {
    const iconSetRule = parseIconSetRule(ruleElement);
    if (iconSetRule) {
      return iconSetRule;
    }
  }
  return parseStandardRule(ruleElement);
}
function parseConditionalFormatting(element) {
  const sqref = getAttr(element, "sqref") ?? "";
  const ranges = sqref.length > 0 ? parseSqrefRanges(sqref) : [];
  const rules = getChildren(element, "cfRule").map(parseConditionalFormattingRule);
  return { sqref, ranges, rules };
}
function parseConditionalFormattings(worksheetElement) {
  return getChildren(worksheetElement, "conditionalFormatting").map(parseConditionalFormatting);
}
function parseDataValidation(dataValidationElement) {
  const sqref = getAttr(dataValidationElement, "sqref") ?? "";
  const ranges = sqref.length > 0 ? parseSqrefRanges(sqref) : [];
  const formula1El = getChild(dataValidationElement, "formula1");
  const formula2El = getChild(dataValidationElement, "formula2");
  const formula1 = formula1El ? getTextContent(formula1El) : void 0;
  const formula2 = formula2El ? getTextContent(formula2El) : void 0;
  return {
    type: getAttr(dataValidationElement, "type") ?? void 0,
    operator: getAttr(dataValidationElement, "operator") ?? void 0,
    allowBlank: parseBooleanAttr(getAttr(dataValidationElement, "allowBlank")),
    showInputMessage: parseBooleanAttr(getAttr(dataValidationElement, "showInputMessage")),
    showErrorMessage: parseBooleanAttr(getAttr(dataValidationElement, "showErrorMessage")),
    showDropDown: parseBooleanAttr(getAttr(dataValidationElement, "showDropDown")),
    errorStyle: getAttr(dataValidationElement, "errorStyle") ?? void 0,
    promptTitle: getAttr(dataValidationElement, "promptTitle") ?? void 0,
    prompt: getAttr(dataValidationElement, "prompt") ?? void 0,
    errorTitle: getAttr(dataValidationElement, "errorTitle") ?? void 0,
    error: getAttr(dataValidationElement, "error") ?? void 0,
    sqref,
    ranges,
    formula1: formula1 && formula1.length > 0 ? formula1 : void 0,
    formula2: formula2 && formula2.length > 0 ? formula2 : void 0
  };
}
function parseDataValidations(worksheetElement) {
  const dataValidationsEl = getChild(worksheetElement, "dataValidations");
  if (!dataValidationsEl) {
    return [];
  }
  return getChildren(dataValidationsEl, "dataValidation").map(parseDataValidation);
}
function parseHyperlink3(hyperlinkElement) {
  const ref = parseRange(getAttr(hyperlinkElement, "ref") ?? "A1");
  return {
    ref,
    relationshipId: getAttr(hyperlinkElement, "r:id") ?? getAttr(hyperlinkElement, "rId") ?? void 0,
    display: getAttr(hyperlinkElement, "display") ?? void 0,
    location: getAttr(hyperlinkElement, "location") ?? void 0,
    tooltip: getAttr(hyperlinkElement, "tooltip") ?? void 0
  };
}
function parseHyperlinks(worksheetElement) {
  const hyperlinksEl = getChild(worksheetElement, "hyperlinks");
  if (!hyperlinksEl) {
    return [];
  }
  return getChildren(hyperlinksEl, "hyperlink").map(parseHyperlink3);
}
function parsePane(paneElement) {
  if (!paneElement) {
    return void 0;
  }
  return {
    xSplit: parseIntAttr2(getAttr(paneElement, "xSplit")),
    ySplit: parseIntAttr2(getAttr(paneElement, "ySplit")),
    topLeftCell: getAttr(paneElement, "topLeftCell"),
    activePane: getAttr(paneElement, "activePane"),
    state: getAttr(paneElement, "state")
  };
}
function parseSelection(selectionElement) {
  if (!selectionElement) {
    return void 0;
  }
  return {
    pane: getAttr(selectionElement, "pane"),
    activeCell: getAttr(selectionElement, "activeCell"),
    sqref: getAttr(selectionElement, "sqref")
  };
}
function parseSheetView(sheetViewElement) {
  return {
    tabSelected: parseBooleanAttr(getAttr(sheetViewElement, "tabSelected")),
    showGridLines: parseBooleanAttr(getAttr(sheetViewElement, "showGridLines")),
    showRowColHeaders: parseBooleanAttr(getAttr(sheetViewElement, "showRowColHeaders")),
    zoomScale: parseIntAttr2(getAttr(sheetViewElement, "zoomScale")),
    pane: parsePane(getChild(sheetViewElement, "pane")),
    selection: parseSelection(getChild(sheetViewElement, "selection"))
  };
}
function parseDimension(dimensionEl) {
  if (!dimensionEl) {
    return void 0;
  }
  return parseRange(getAttr(dimensionEl, "ref") ?? "A1");
}
function getFirstSheetView(sheetViewsEl) {
  if (!sheetViewsEl) {
    return void 0;
  }
  return getChild(sheetViewsEl, "sheetView");
}
function parseOptionalSheetView(sheetViewEl) {
  if (!sheetViewEl) {
    return void 0;
  }
  return parseSheetView(sheetViewEl);
}
function parseOptionalSheetData(sheetDataEl, context, options) {
  if (!sheetDataEl) {
    return [];
  }
  return parseSheetData(sheetDataEl, context, options);
}
function parseColorElement(colorElement) {
  if (!colorElement) {
    return void 0;
  }
  const rgb = getAttr(colorElement, "rgb");
  if (rgb) {
    return { type: "rgb", value: rgb };
  }
  const theme = getAttr(colorElement, "theme");
  if (theme !== void 0) {
    return {
      type: "theme",
      theme: parseIntAttr2(theme) ?? 0,
      tint: parseFloatAttr(getAttr(colorElement, "tint"))
    };
  }
  const indexed = getAttr(colorElement, "indexed");
  if (indexed !== void 0) {
    return { type: "indexed", index: parseIntAttr2(indexed) ?? 0 };
  }
  const auto = getAttr(colorElement, "auto");
  if (auto !== void 0) {
    const parsed = parseBooleanAttr(auto);
    if (parsed !== false) {
      return { type: "auto" };
    }
  }
  return void 0;
}
function parseFilterOperator(value) {
  switch (value) {
    case "equal":
    case "lessThan":
    case "lessThanOrEqual":
    case "notEqual":
    case "greaterThanOrEqual":
    case "greaterThan":
      return value;
    default:
      return void 0;
  }
}
function parseDynamicFilterType(value) {
  const validTypes = [
    "null",
    "aboveAverage",
    "belowAverage",
    "tomorrow",
    "today",
    "yesterday",
    "nextWeek",
    "thisWeek",
    "lastWeek",
    "nextMonth",
    "thisMonth",
    "lastMonth",
    "nextQuarter",
    "thisQuarter",
    "lastQuarter",
    "nextYear",
    "thisYear",
    "lastYear",
    "yearToDate",
    "Q1",
    "Q2",
    "Q3",
    "Q4",
    "M1",
    "M2",
    "M3",
    "M4",
    "M5",
    "M6",
    "M7",
    "M8",
    "M9",
    "M10",
    "M11",
    "M12"
  ];
  if (value && validTypes.includes(value)) {
    return value;
  }
  return void 0;
}
function parseFilters(filtersElement) {
  const blank = parseBooleanAttr(getAttr(filtersElement, "blank"));
  const filterElements = getChildren(filtersElement, "filter");
  const values = filterElements.map((el) => getAttr(el, "val")).filter((val) => val !== void 0).map((val) => ({ val }));
  return {
    type: "filters",
    ...blank !== void 0 && { blank },
    ...values.length > 0 && { values }
  };
}
function parseCustomFilters(customFiltersElement) {
  const and = parseBooleanAttr(getAttr(customFiltersElement, "and"));
  const customFilterElements = getChildren(customFiltersElement, "customFilter");
  const conditions = customFilterElements.map((el) => ({
    operator: parseFilterOperator(getAttr(el, "operator")),
    val: getAttr(el, "val") ?? void 0
  }));
  return {
    type: "customFilters",
    ...and !== void 0 && { and },
    conditions
  };
}
function parseTop10Filter(top10Element) {
  return {
    type: "top10",
    top: parseBooleanAttr(getAttr(top10Element, "top")),
    percent: parseBooleanAttr(getAttr(top10Element, "percent")),
    val: parseFloatAttr(getAttr(top10Element, "val")),
    filterVal: parseFloatAttr(getAttr(top10Element, "filterVal"))
  };
}
function parseDynamicFilter(dynamicFilterElement) {
  const filterType = parseDynamicFilterType(getAttr(dynamicFilterElement, "type"));
  if (!filterType) {
    return void 0;
  }
  return {
    type: "dynamicFilter",
    filterType,
    val: parseFloatAttr(getAttr(dynamicFilterElement, "val")),
    maxVal: parseFloatAttr(getAttr(dynamicFilterElement, "maxVal"))
  };
}
function resolveFilterColumnFilter(filterColumnElement) {
  const filtersEl = getChild(filterColumnElement, "filters");
  if (filtersEl) {
    return parseFilters(filtersEl);
  }
  const customFiltersEl = getChild(filterColumnElement, "customFilters");
  if (customFiltersEl) {
    return parseCustomFilters(customFiltersEl);
  }
  const top10El = getChild(filterColumnElement, "top10");
  if (top10El) {
    return parseTop10Filter(top10El);
  }
  const dynamicFilterEl = getChild(filterColumnElement, "dynamicFilter");
  if (dynamicFilterEl) {
    return parseDynamicFilter(dynamicFilterEl);
  }
  return void 0;
}
function parseFilterColumn(filterColumnElement) {
  const colIdAttr = parseIntAttr2(getAttr(filterColumnElement, "colId"));
  const colId = colIdx(colIdAttr ?? 0);
  const hiddenButton = parseBooleanAttr(getAttr(filterColumnElement, "hiddenButton"));
  const showButton = parseBooleanAttr(getAttr(filterColumnElement, "showButton"));
  const filter = resolveFilterColumnFilter(filterColumnElement);
  return {
    colId,
    ...hiddenButton !== void 0 && { hiddenButton },
    ...showButton !== void 0 && { showButton },
    ...filter && { filter }
  };
}
function parseAutoFilter(autoFilterElement) {
  if (!autoFilterElement) {
    return void 0;
  }
  const refAttr = getAttr(autoFilterElement, "ref");
  if (!refAttr) {
    return void 0;
  }
  const ref = parseRange(refAttr);
  const filterColumnElements = getChildren(autoFilterElement, "filterColumn");
  const filterColumns = filterColumnElements.map(parseFilterColumn);
  const sortState = parseSortState(getChild(autoFilterElement, "sortState"));
  return {
    ref,
    ...filterColumns.length > 0 && { filterColumns },
    ...sortState && { sortState }
  };
}
function parseSortState(sortStateEl) {
  if (!sortStateEl) {
    return void 0;
  }
  const refAttr = getAttr(sortStateEl, "ref");
  if (!refAttr) {
    return void 0;
  }
  const caseSensitive = parseBooleanAttr(getAttr(sortStateEl, "caseSensitive"));
  const conditionElements = getChildren(sortStateEl, "sortCondition");
  const sortConditions = [];
  for (const el of conditionElements) {
    const condRef = getAttr(el, "ref");
    if (condRef) {
      sortConditions.push({
        ref: condRef,
        descending: parseBooleanAttr(getAttr(el, "descending"))
      });
    }
  }
  return {
    ref: refAttr,
    caseSensitive,
    ...sortConditions.length > 0 && { sortConditions }
  };
}
function parseSheetFormatPr(worksheetElement) {
  const el = getChild(worksheetElement, "sheetFormatPr");
  if (!el) {
    return void 0;
  }
  const defaultRowHeight = parseFloatAttr(getAttr(el, "defaultRowHeight"));
  const defaultColWidth = parseFloatAttr(getAttr(el, "defaultColWidth"));
  const zeroHeight = parseBooleanAttr(getAttr(el, "zeroHeight"));
  if (defaultRowHeight === void 0 && defaultColWidth === void 0 && zeroHeight === void 0) {
    return void 0;
  }
  return {
    defaultRowHeight,
    defaultColWidth,
    zeroHeight
  };
}
function parseWorksheet(params) {
  const { worksheetElement, context, options, sheetInfo } = params;
  const sheetPrEl = getChild(worksheetElement, "sheetPr");
  const tabColor = parseColorElement(sheetPrEl ? getChild(sheetPrEl, "tabColor") : void 0);
  const sheetFormatPr = parseSheetFormatPr(worksheetElement);
  const dimensionEl = getChild(worksheetElement, "dimension");
  const sheetViewsEl = getChild(worksheetElement, "sheetViews");
  const colsEl = getChild(worksheetElement, "cols");
  const sheetDataEl = getChild(worksheetElement, "sheetData");
  const mergeCellsEl = getChild(worksheetElement, "mergeCells");
  const sheetViewEl = getFirstSheetView(sheetViewsEl);
  const rows = expandSharedFormulas(parseOptionalSheetData(sheetDataEl, context, options));
  const conditionalFormattings = parseConditionalFormattings(worksheetElement);
  const dataValidations = parseDataValidations(worksheetElement);
  const hyperlinks = parseHyperlinks(worksheetElement);
  const autoFilterEl = getChild(worksheetElement, "autoFilter");
  const autoFilter = parseAutoFilter(autoFilterEl);
  const pageSetupEl = getChild(worksheetElement, "pageSetup");
  const pageMarginsEl = getChild(worksheetElement, "pageMargins");
  const headerFooterEl = getChild(worksheetElement, "headerFooter");
  const printOptionsEl = getChild(worksheetElement, "printOptions");
  const pageSetup = parsePageSetup(pageSetupEl);
  const pageMargins = parsePageMargins2(pageMarginsEl);
  const headerFooter = parseHeaderFooter(headerFooterEl);
  const printOptions = parsePrintOptions(printOptionsEl);
  const pageBreaks = parsePageBreaks(worksheetElement);
  const sparklineGroups = parseSparklineGroups(worksheetElement);
  const sheetProtectionEl = getChild(worksheetElement, "sheetProtection");
  const sheetProtection = parseSheetProtection(sheetProtectionEl);
  return {
    dateSystem: context.workbookInfo.dateSystem,
    name: sheetInfo.name,
    sheetId: sheetInfo.sheetId,
    state: sheetInfo.state,
    dimension: parseDimension(dimensionEl),
    sheetView: parseOptionalSheetView(sheetViewEl),
    sheetFormatPr,
    tabColor,
    columns: parseCols(colsEl),
    rows,
    mergeCells: parseMergeCells(mergeCellsEl),
    conditionalFormattings: conditionalFormattings.length > 0 ? conditionalFormattings : void 0,
    dataValidations: dataValidations.length > 0 ? dataValidations : void 0,
    hyperlinks: hyperlinks.length > 0 ? hyperlinks : void 0,
    autoFilter,
    pageSetup,
    pageMargins,
    headerFooter,
    printOptions,
    pageBreaks,
    sparklineGroups,
    sheetProtection,
    xmlPath: sheetInfo.xmlPath
  };
}

// node_modules/aurochs/dist/xlsx/parser/full/index.js
function parseSharedStrings(sstElement) {
  const result = [];
  const siElements = getChildren(sstElement, "si");
  for (const si of siElements) {
    const t = getChild(si, "t");
    if (t) {
      result.push(getTextContent(t));
      continue;
    }
    const runs = getChildren(si, "r");
    const text = runs.map((r) => {
      const rt = getChild(r, "t");
      return rt ? getTextContent(rt) : "";
    }).join("");
    result.push(text);
  }
  return result;
}
function parseRelationships2(relsElement) {
  const fakeDoc = { children: [relsElement] };
  const infos = listRelationships(fakeDoc);
  return new Map(infos.map((rel) => [rel.id, rel.target]));
}

// node_modules/aurochs/dist/_shared/exporter-CqWL_dSh.js
function serializeInt(value) {
  return String(Math.trunc(value));
}
function serializeFloat(value) {
  return String(value);
}
function serializeBoolean(value) {
  return value ? "1" : "0";
}
function serializeRowIndex(value) {
  return serializeInt(value);
}
function serializeColIndex(value) {
  return serializeInt(value);
}
function serializeCellRef(address) {
  const colPrefix = address.colAbsolute ? "$" : "";
  const rowPrefix = address.rowAbsolute ? "$" : "";
  return `${colPrefix}${indexToColumnLetter(address.col)}${rowPrefix}${address.row}`;
}
function serializeRef(range) {
  const startStr = serializeCellRef(range.start);
  const endStr = serializeCellRef(range.end);
  const isSingleCell = range.start.col === range.end.col && range.start.row === range.end.row && range.start.colAbsolute === range.end.colAbsolute && range.start.rowAbsolute === range.end.rowAbsolute;
  const rangeStr = isSingleCell ? startStr : `${startStr}:${endStr}`;
  if (range.sheetName) {
    const needsQuotes = /[\s!']/.test(range.sheetName);
    const quotedName = needsQuotes ? `'${range.sheetName}'` : range.sheetName;
    return `${quotedName}!${rangeStr}`;
  }
  return rangeStr;
}
function dateToSerial(date) {
  const EXCEL_EPOCH = new Date(1899, 11, 30);
  const MS_PER_DAY = 24 * 60 * 60 * 1e3;
  const diffMs = date.getTime() - EXCEL_EPOCH.getTime();
  return diffMs / MS_PER_DAY;
}
function buildFormulaChildren(expression) {
  if (!expression) {
    return [];
  }
  return [{ type: "text", value: expression }];
}
function getOrAddSharedString(table, value) {
  const existingIndex = table.getIndex(value);
  if (existingIndex !== void 0) {
    return existingIndex;
  }
  return table.addString(value);
}
function serializeFormula(formula) {
  const attrs = {};
  if (formula.type !== "normal") {
    attrs.t = formula.type;
  }
  if (formula.ref) {
    attrs.ref = serializeRef(formula.ref);
  }
  if (formula.sharedIndex !== void 0) {
    attrs.si = String(formula.sharedIndex);
  }
  if (formula.calculateAlways) {
    attrs.ca = serializeBoolean(formula.calculateAlways);
  }
  if (formula.type === "dataTable") {
    const dtFormula = formula;
    if (dtFormula.dt2D !== void 0) {
      attrs.dt2D = serializeBoolean(dtFormula.dt2D);
    }
    if (dtFormula.dtr !== void 0) {
      attrs.dtr = serializeBoolean(dtFormula.dtr);
    }
    if (dtFormula.r1 !== void 0) {
      attrs.r1 = dtFormula.r1;
    }
    if (dtFormula.r2 !== void 0) {
      attrs.r2 = dtFormula.r2;
    }
  }
  const children2 = buildFormulaChildren(formula.expression);
  return {
    type: "element",
    name: "f",
    attrs,
    children: children2
  };
}
function serializeCellValue(value, sharedStrings) {
  switch (value.type) {
    case "number":
      if (!Number.isFinite(value.value)) {
        return { t: "e", v: "#NUM!" };
      }
      return { v: String(value.value) };
    case "string": {
      const index = getOrAddSharedString(sharedStrings, value.value);
      return { t: "s", v: String(index) };
    }
    case "boolean":
      return { t: "b", v: serializeBoolean(value.value) };
    case "error":
      return { t: "e", v: value.value };
    case "date":
      return { v: String(dateToSerial(value.value)) };
    case "empty":
      return {};
  }
}
function serializeCell(cell, sharedStrings) {
  const attrs = {};
  attrs.r = serializeCellRef(cell.address);
  if (cell.styleId !== void 0 && cell.styleId !== 0) {
    attrs.s = String(cell.styleId);
  }
  const valueResult = serializeCellValue(cell.value, sharedStrings);
  if (valueResult.t !== void 0) {
    attrs.t = valueResult.t;
  }
  const children2 = [];
  if (cell.formula) {
    children2.push(serializeFormula(cell.formula));
  }
  if (valueResult.v !== void 0) {
    children2.push({
      type: "element",
      name: "v",
      attrs: {},
      children: [{ type: "text", value: valueResult.v }]
    });
  }
  if (valueResult.is !== void 0) {
    children2.push(valueResult.is);
  }
  return {
    type: "element",
    name: "c",
    attrs,
    children: children2
  };
}
var SPREADSHEETML_NS$2 = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
function calculateDimension(rows) {
  if (rows.length === 0) {
    return "A1";
  }
  const bounds = { minCol: Infinity, maxCol: 0, minRow: Infinity, maxRow: 0, hasAnyCells: false };
  for (const row of rows) {
    if (row.cells.length === 0) {
      continue;
    }
    bounds.hasAnyCells = true;
    const rowNum = row.rowNumber;
    bounds.minRow = Math.min(bounds.minRow, rowNum);
    bounds.maxRow = Math.max(bounds.maxRow, rowNum);
    for (const cell of row.cells) {
      const col = cell.address.col;
      bounds.minCol = Math.min(bounds.minCol, col);
      bounds.maxCol = Math.max(bounds.maxCol, col);
    }
  }
  if (!bounds.hasAnyCells) {
    return "A1";
  }
  const startRange = {
    start: {
      col: colIdx(bounds.minCol),
      row: rowIdx(bounds.minRow),
      colAbsolute: false,
      rowAbsolute: false
    },
    end: {
      col: colIdx(bounds.maxCol),
      row: rowIdx(bounds.maxRow),
      colAbsolute: false,
      rowAbsolute: false
    }
  };
  return serializeRef(startRange);
}
function serializeDimension(rows) {
  return {
    type: "element",
    name: "dimension",
    attrs: {
      ref: calculateDimension(rows)
    },
    children: []
  };
}
function serializeColAttrs(col) {
  const attrs = {
    min: serializeColIndex(col.min),
    max: serializeColIndex(col.max)
  };
  if (col.width !== void 0) {
    attrs.width = serializeFloat(col.width);
  }
  if (col.customWidth) {
    attrs.customWidth = serializeBoolean(col.customWidth);
  }
  if (col.hidden) {
    attrs.hidden = serializeBoolean(col.hidden);
  }
  if (col.bestFit) {
    attrs.bestFit = serializeBoolean(col.bestFit);
  }
  if (col.styleId !== void 0 && col.styleId !== 0) {
    attrs.style = String(col.styleId);
  }
  if (col.outlineLevel !== void 0 && col.outlineLevel !== 0) {
    attrs.outlineLevel = String(col.outlineLevel);
  }
  if (col.collapsed) {
    attrs.collapsed = serializeBoolean(col.collapsed);
  }
  return attrs;
}
function serializeCol(col) {
  return {
    type: "element",
    name: "col",
    attrs: serializeColAttrs(col),
    children: []
  };
}
function serializeCols(columns) {
  const children2 = columns.map(serializeCol);
  return {
    type: "element",
    name: "cols",
    attrs: {},
    children: children2
  };
}
function serializeRowAttrs(row) {
  const attrs = {
    r: serializeRowIndex(row.rowNumber)
  };
  if (row.height !== void 0) {
    attrs.ht = serializeFloat(row.height);
  }
  if (row.customHeight) {
    attrs.customHeight = serializeBoolean(row.customHeight);
  }
  if (row.hidden) {
    attrs.hidden = serializeBoolean(row.hidden);
  }
  if (row.styleId !== void 0 && row.styleId !== 0) {
    attrs.s = String(row.styleId);
  }
  if (row.outlineLevel !== void 0 && row.outlineLevel !== 0) {
    attrs.outlineLevel = String(row.outlineLevel);
  }
  if (row.collapsed) {
    attrs.collapsed = serializeBoolean(row.collapsed);
  }
  return attrs;
}
function serializeRow(row, sharedStrings) {
  const children2 = row.cells.map((cell) => serializeCell(cell, sharedStrings));
  return {
    type: "element",
    name: "row",
    attrs: serializeRowAttrs(row),
    children: children2
  };
}
function hasRowContent(row) {
  if (row.cells.length > 0) {
    return true;
  }
  return row.height !== void 0 || row.hidden !== void 0 || row.customHeight !== void 0 || row.styleId !== void 0 || row.outlineLevel !== void 0 || row.collapsed !== void 0;
}
function serializeSheetData(rows, sharedStrings) {
  const nonEmptyRows = rows.filter(hasRowContent);
  const children2 = nonEmptyRows.map((row) => serializeRow(row, sharedStrings));
  return {
    type: "element",
    name: "sheetData",
    attrs: {},
    children: children2
  };
}
function serializeMergeCell(range) {
  return {
    type: "element",
    name: "mergeCell",
    attrs: {
      ref: serializeRef(range)
    },
    children: []
  };
}
function serializeMergeCells(mergeCells) {
  const children2 = mergeCells.map(serializeMergeCell);
  return {
    type: "element",
    name: "mergeCells",
    attrs: {
      count: String(mergeCells.length)
    },
    children: children2
  };
}
function serializeSheetFormatPr(worksheet) {
  const pr = worksheet.sheetFormatPr;
  if (!pr) {
    return void 0;
  }
  if (pr.defaultRowHeight === void 0 && pr.defaultColWidth === void 0 && pr.zeroHeight === void 0) {
    return void 0;
  }
  const attrs = {};
  if (pr.defaultRowHeight !== void 0) {
    attrs.defaultRowHeight = serializeFloat(pr.defaultRowHeight);
  }
  if (pr.defaultColWidth !== void 0) {
    attrs.defaultColWidth = serializeFloat(pr.defaultColWidth);
  }
  if (pr.zeroHeight !== void 0) {
    attrs.zeroHeight = serializeBoolean(pr.zeroHeight);
  }
  return { type: "element", name: "sheetFormatPr", attrs, children: [] };
}
function serializeColorElement(elementName, color) {
  const attrs = {};
  switch (color.type) {
    case "rgb":
      attrs.rgb = color.value;
      break;
    case "theme":
      attrs.theme = String(color.theme);
      if (color.tint !== void 0) {
        attrs.tint = String(color.tint);
      }
      break;
    case "indexed":
      attrs.indexed = String(color.index);
      break;
    case "auto":
      attrs.auto = "1";
      break;
  }
  return { type: "element", name: elementName, attrs, children: [] };
}
function serializeSheetPr(worksheet) {
  if (!worksheet.tabColor) {
    return void 0;
  }
  const children2 = [serializeColorElement("tabColor", worksheet.tabColor)];
  return { type: "element", name: "sheetPr", attrs: {}, children: children2 };
}
function serializePane(pane) {
  const attrs = {};
  if (pane.xSplit !== void 0) {
    attrs.xSplit = String(pane.xSplit);
  }
  if (pane.ySplit !== void 0) {
    attrs.ySplit = String(pane.ySplit);
  }
  if (pane.topLeftCell) {
    attrs.topLeftCell = pane.topLeftCell;
  }
  if (pane.activePane) {
    attrs.activePane = pane.activePane;
  }
  if (pane.state) {
    attrs.state = pane.state;
  }
  return { type: "element", name: "pane", attrs, children: [] };
}
function serializeSelection(selection) {
  const attrs = {};
  if (selection.pane) {
    attrs.pane = selection.pane;
  }
  if (selection.activeCell) {
    attrs.activeCell = selection.activeCell;
  }
  if (selection.sqref) {
    attrs.sqref = selection.sqref;
  }
  return { type: "element", name: "selection", attrs, children: [] };
}
function serializeSheetViews(sheetView) {
  const attrs = {};
  if (sheetView.tabSelected) {
    attrs.tabSelected = serializeBoolean(sheetView.tabSelected);
  }
  if (sheetView.showGridLines !== void 0) {
    attrs.showGridLines = serializeBoolean(sheetView.showGridLines);
  }
  if (sheetView.showRowColHeaders !== void 0) {
    attrs.showRowColHeaders = serializeBoolean(sheetView.showRowColHeaders);
  }
  if (sheetView.zoomScale !== void 0) {
    attrs.zoomScale = String(sheetView.zoomScale);
  }
  attrs.workbookViewId = "0";
  const children2 = [];
  if (sheetView.pane) {
    children2.push(serializePane(sheetView.pane));
  }
  if (sheetView.selection) {
    children2.push(serializeSelection(sheetView.selection));
  }
  const sheetViewEl = { type: "element", name: "sheetView", attrs, children: children2 };
  return { type: "element", name: "sheetViews", attrs: {}, children: [sheetViewEl] };
}
function serializeSheetProtection(protection) {
  const attrs = {};
  const boolFields = [
    "sheet",
    "objects",
    "scenarios",
    "formatCells",
    "formatColumns",
    "formatRows",
    "insertColumns",
    "insertRows",
    "insertHyperlinks",
    "deleteColumns",
    "deleteRows",
    "selectLockedCells",
    "sort",
    "autoFilter",
    "pivotTables",
    "selectUnlockedCells"
  ];
  for (const field of boolFields) {
    const val = protection[field];
    if (typeof val === "boolean") {
      attrs[field] = serializeBoolean(val);
    }
  }
  if (protection.password) {
    attrs.password = protection.password;
  }
  if (protection.algorithmName) {
    attrs.algorithmName = protection.algorithmName;
  }
  if (protection.hashValue) {
    attrs.hashValue = protection.hashValue;
  }
  if (protection.saltValue) {
    attrs.saltValue = protection.saltValue;
  }
  if (protection.spinCount !== void 0) {
    attrs.spinCount = String(protection.spinCount);
  }
  return { type: "element", name: "sheetProtection", attrs, children: [] };
}
function serializeFilterType(filter) {
  switch (filter.type) {
    case "filters": {
      const children2 = [];
      if (filter.values) {
        for (const v of filter.values) {
          children2.push({ type: "element", name: "filter", attrs: { val: v.val }, children: [] });
        }
      }
      const attrs = {};
      if (filter.blank) {
        attrs.blank = serializeBoolean(filter.blank);
      }
      return { type: "element", name: "filters", attrs, children: children2 };
    }
    case "customFilters": {
      const children2 = filter.conditions.map((c) => {
        const a = {};
        if (c.operator) {
          a.operator = c.operator;
        }
        if (c.val !== void 0) {
          a.val = c.val;
        }
        return { type: "element", name: "customFilter", attrs: a, children: [] };
      });
      const attrs = {};
      if (filter.and) {
        attrs.and = serializeBoolean(filter.and);
      }
      return { type: "element", name: "customFilters", attrs, children: children2 };
    }
    case "top10": {
      const attrs = {};
      if (filter.top !== void 0) {
        attrs.top = serializeBoolean(filter.top);
      }
      if (filter.percent !== void 0) {
        attrs.percent = serializeBoolean(filter.percent);
      }
      if (filter.val !== void 0) {
        attrs.val = serializeFloat(filter.val);
      }
      if (filter.filterVal !== void 0) {
        attrs.filterVal = serializeFloat(filter.filterVal);
      }
      return { type: "element", name: "top10", attrs, children: [] };
    }
    case "dynamicFilter": {
      const attrs = { type: filter.filterType };
      if (filter.val !== void 0) {
        attrs.val = serializeFloat(filter.val);
      }
      if (filter.maxVal !== void 0) {
        attrs.maxVal = serializeFloat(filter.maxVal);
      }
      return { type: "element", name: "dynamicFilter", attrs, children: [] };
    }
    case "colorFilter": {
      const attrs = {};
      if (filter.cellColor !== void 0) {
        attrs.cellColor = serializeBoolean(filter.cellColor);
      }
      if (filter.dxfId !== void 0) {
        attrs.dxfId = String(filter.dxfId);
      }
      return { type: "element", name: "colorFilter", attrs, children: [] };
    }
    case "iconFilter": {
      const attrs = {};
      if (filter.iconSet) {
        attrs.iconSet = filter.iconSet;
      }
      if (filter.iconId !== void 0) {
        attrs.iconId = String(filter.iconId);
      }
      return { type: "element", name: "iconFilter", attrs, children: [] };
    }
  }
}
function serializeFilterColumn(col) {
  const attrs = { colId: String(col.colId) };
  if (col.hiddenButton !== void 0) {
    attrs.hiddenButton = serializeBoolean(col.hiddenButton);
  }
  if (col.showButton !== void 0) {
    attrs.showButton = serializeBoolean(col.showButton);
  }
  const children2 = [];
  if (col.filter) {
    children2.push(serializeFilterType(col.filter));
  }
  return { type: "element", name: "filterColumn", attrs, children: children2 };
}
function serializeSortState(sortState) {
  const attrs = { ref: sortState.ref };
  if (sortState.caseSensitive) {
    attrs.caseSensitive = serializeBoolean(sortState.caseSensitive);
  }
  const children2 = [];
  if (sortState.sortConditions) {
    for (const cond of sortState.sortConditions) {
      const a = { ref: cond.ref };
      if (cond.descending) {
        a.descending = serializeBoolean(cond.descending);
      }
      children2.push({ type: "element", name: "sortCondition", attrs: a, children: [] });
    }
  }
  return { type: "element", name: "sortState", attrs, children: children2 };
}
function serializeAutoFilter(autoFilter) {
  const attrs = { ref: serializeRef(autoFilter.ref) };
  const children2 = [];
  if (autoFilter.filterColumns) {
    for (const col of autoFilter.filterColumns) {
      children2.push(serializeFilterColumn(col));
    }
  }
  if (autoFilter.sortState) {
    children2.push(serializeSortState(autoFilter.sortState));
  }
  return { type: "element", name: "autoFilter", attrs, children: children2 };
}
function serializeCfvo(cfvo) {
  const attrs = { type: cfvo.type };
  if (cfvo.val !== void 0) {
    attrs.val = cfvo.val;
  }
  if (cfvo.gte !== void 0) {
    attrs.gte = serializeBoolean(cfvo.gte);
  }
  return { type: "element", name: "cfvo", attrs, children: [] };
}
function serializeStandardRule(rule) {
  const attrs = { type: rule.type };
  if (rule.dxfId !== void 0) {
    attrs.dxfId = String(rule.dxfId);
  }
  if (rule.priority !== void 0) {
    attrs.priority = String(rule.priority);
  }
  if (rule.operator) {
    attrs.operator = rule.operator;
  }
  if (rule.stopIfTrue) {
    attrs.stopIfTrue = serializeBoolean(rule.stopIfTrue);
  }
  if (rule.text) {
    attrs.text = rule.text;
  }
  if (rule.timePeriod) {
    attrs.timePeriod = rule.timePeriod;
  }
  if (rule.rank !== void 0) {
    attrs.rank = String(rule.rank);
  }
  if (rule.percent !== void 0) {
    attrs.percent = serializeBoolean(rule.percent);
  }
  if (rule.bottom !== void 0) {
    attrs.bottom = serializeBoolean(rule.bottom);
  }
  if (rule.stdDev !== void 0) {
    attrs.stdDev = String(rule.stdDev);
  }
  if (rule.equalAverage !== void 0) {
    attrs.equalAverage = serializeBoolean(rule.equalAverage);
  }
  if (rule.aboveAverage !== void 0) {
    attrs.aboveAverage = serializeBoolean(rule.aboveAverage);
  }
  const children2 = rule.formulas.map((f) => ({
    type: "element",
    name: "formula",
    attrs: {},
    children: [{ type: "text", value: f }]
  }));
  return { type: "element", name: "cfRule", attrs, children: children2 };
}
function serializeColorScaleRule(rule) {
  const attrs = { type: "colorScale" };
  if (rule.priority !== void 0) {
    attrs.priority = String(rule.priority);
  }
  if (rule.stopIfTrue) {
    attrs.stopIfTrue = serializeBoolean(rule.stopIfTrue);
  }
  const scaleChildren = [
    ...rule.cfvo.map(serializeCfvo),
    ...rule.colors.map((c) => serializeColorElement("color", c))
  ];
  const colorScale = { type: "element", name: "colorScale", attrs: {}, children: scaleChildren };
  return { type: "element", name: "cfRule", attrs, children: [colorScale] };
}
function serializeDataBarRule(rule) {
  const attrs = { type: "dataBar" };
  if (rule.priority !== void 0) {
    attrs.priority = String(rule.priority);
  }
  if (rule.stopIfTrue) {
    attrs.stopIfTrue = serializeBoolean(rule.stopIfTrue);
  }
  const barAttrs = {};
  if (rule.showValue !== void 0) {
    barAttrs.showValue = serializeBoolean(rule.showValue);
  }
  if (rule.minLength !== void 0) {
    barAttrs.minLength = String(rule.minLength);
  }
  if (rule.maxLength !== void 0) {
    barAttrs.maxLength = String(rule.maxLength);
  }
  if (rule.gradient !== void 0) {
    barAttrs.gradient = serializeBoolean(rule.gradient);
  }
  if (rule.axisPosition) {
    barAttrs.axisPosition = rule.axisPosition;
  }
  if (rule.direction) {
    barAttrs.direction = rule.direction;
  }
  const barChildren = rule.cfvo.map(serializeCfvo);
  if (rule.color) {
    barChildren.push(serializeColorElement("color", rule.color));
  }
  if (rule.negativeFillColor) {
    barChildren.push(serializeColorElement("negativeFillColor", rule.negativeFillColor));
  }
  if (rule.negativeBorderColor) {
    barChildren.push(serializeColorElement("negativeBorderColor", rule.negativeBorderColor));
  }
  if (rule.borderColor) {
    barChildren.push(serializeColorElement("borderColor", rule.borderColor));
  }
  if (rule.axisColor) {
    barChildren.push(serializeColorElement("axisColor", rule.axisColor));
  }
  const dataBar = { type: "element", name: "dataBar", attrs: barAttrs, children: barChildren };
  return { type: "element", name: "cfRule", attrs, children: [dataBar] };
}
function serializeIconSetRule(rule) {
  const attrs = { type: "iconSet" };
  if (rule.priority !== void 0) {
    attrs.priority = String(rule.priority);
  }
  if (rule.stopIfTrue) {
    attrs.stopIfTrue = serializeBoolean(rule.stopIfTrue);
  }
  const iconAttrs = { iconSet: rule.iconSet };
  if (rule.showValue !== void 0) {
    iconAttrs.showValue = serializeBoolean(rule.showValue);
  }
  if (rule.reverse !== void 0) {
    iconAttrs.reverse = serializeBoolean(rule.reverse);
  }
  if (rule.iconOnly !== void 0) {
    iconAttrs.iconOnly = serializeBoolean(rule.iconOnly);
  }
  const iconChildren = rule.cfvo.map(serializeCfvo);
  if (rule.customIcons) {
    for (const ci of rule.customIcons) {
      iconChildren.push({
        type: "element",
        name: "cfIcon",
        attrs: { iconSet: ci.iconSet, iconId: String(ci.iconId) },
        children: []
      });
    }
  }
  const iconSet = { type: "element", name: "iconSet", attrs: iconAttrs, children: iconChildren };
  return { type: "element", name: "cfRule", attrs, children: [iconSet] };
}
function serializeCfRule(rule) {
  switch (rule.type) {
    case "colorScale":
      return serializeColorScaleRule(rule);
    case "dataBar":
      return serializeDataBarRule(rule);
    case "iconSet":
      return serializeIconSetRule(rule);
    default:
      return serializeStandardRule(rule);
  }
}
function serializeConditionalFormatting(cf) {
  const children2 = cf.rules.map(serializeCfRule);
  return {
    type: "element",
    name: "conditionalFormatting",
    attrs: { sqref: cf.sqref },
    children: children2
  };
}
function serializeDataValidation(dv) {
  const attrs = {};
  if (dv.type) {
    attrs.type = dv.type;
  }
  if (dv.operator) {
    attrs.operator = dv.operator;
  }
  if (dv.allowBlank !== void 0) {
    attrs.allowBlank = serializeBoolean(dv.allowBlank);
  }
  if (dv.showInputMessage !== void 0) {
    attrs.showInputMessage = serializeBoolean(dv.showInputMessage);
  }
  if (dv.showErrorMessage !== void 0) {
    attrs.showErrorMessage = serializeBoolean(dv.showErrorMessage);
  }
  if (dv.showDropDown !== void 0) {
    attrs.showDropDown = serializeBoolean(dv.showDropDown);
  }
  if (dv.errorStyle) {
    attrs.errorStyle = dv.errorStyle;
  }
  if (dv.promptTitle) {
    attrs.promptTitle = dv.promptTitle;
  }
  if (dv.prompt) {
    attrs.prompt = dv.prompt;
  }
  if (dv.errorTitle) {
    attrs.errorTitle = dv.errorTitle;
  }
  if (dv.error) {
    attrs.error = dv.error;
  }
  attrs.sqref = dv.sqref;
  const children2 = [];
  if (dv.formula1 !== void 0) {
    children2.push({ type: "element", name: "formula1", attrs: {}, children: [{ type: "text", value: dv.formula1 }] });
  }
  if (dv.formula2 !== void 0) {
    children2.push({ type: "element", name: "formula2", attrs: {}, children: [{ type: "text", value: dv.formula2 }] });
  }
  return { type: "element", name: "dataValidation", attrs, children: children2 };
}
function serializeDataValidations(validations) {
  const children2 = validations.map(serializeDataValidation);
  return {
    type: "element",
    name: "dataValidations",
    attrs: { count: String(validations.length) },
    children: children2
  };
}
function serializeHyperlinks(hyperlinks) {
  const children2 = hyperlinks.map((h) => {
    const attrs = { ref: serializeRef(h.ref) };
    if (h.relationshipId) {
      attrs["r:id"] = h.relationshipId;
    }
    if (h.display) {
      attrs.display = h.display;
    }
    if (h.location) {
      attrs.location = h.location;
    }
    if (h.tooltip) {
      attrs.tooltip = h.tooltip;
    }
    return { type: "element", name: "hyperlink", attrs, children: [] };
  });
  return { type: "element", name: "hyperlinks", attrs: {}, children: children2 };
}
function serializePrintOptions(options) {
  const attrs = {};
  if (options.gridLines !== void 0) {
    attrs.gridLines = serializeBoolean(options.gridLines);
  }
  if (options.headings !== void 0) {
    attrs.headings = serializeBoolean(options.headings);
  }
  if (options.gridLinesSet !== void 0) {
    attrs.gridLinesSet = serializeBoolean(options.gridLinesSet);
  }
  if (options.horizontalCentered !== void 0) {
    attrs.horizontalCentered = serializeBoolean(options.horizontalCentered);
  }
  if (options.verticalCentered !== void 0) {
    attrs.verticalCentered = serializeBoolean(options.verticalCentered);
  }
  return { type: "element", name: "printOptions", attrs, children: [] };
}
function serializePageMargins2(margins) {
  const attrs = {
    left: serializeFloat(margins.left ?? 0.7),
    right: serializeFloat(margins.right ?? 0.7),
    top: serializeFloat(margins.top ?? 0.75),
    bottom: serializeFloat(margins.bottom ?? 0.75),
    header: serializeFloat(margins.header ?? 0.3),
    footer: serializeFloat(margins.footer ?? 0.3)
  };
  return { type: "element", name: "pageMargins", attrs, children: [] };
}
function serializePageSetup(setup) {
  const attrs = {};
  if (setup.paperSize !== void 0) {
    attrs.paperSize = String(setup.paperSize);
  }
  if (setup.orientation) {
    attrs.orientation = setup.orientation;
  }
  if (setup.scale !== void 0) {
    attrs.scale = String(setup.scale);
  }
  if (setup.fitToWidth !== void 0) {
    attrs.fitToWidth = String(setup.fitToWidth);
  }
  if (setup.fitToHeight !== void 0) {
    attrs.fitToHeight = String(setup.fitToHeight);
  }
  if (setup.firstPageNumber !== void 0) {
    attrs.firstPageNumber = String(setup.firstPageNumber);
  }
  if (setup.useFirstPageNumber !== void 0) {
    attrs.useFirstPageNumber = serializeBoolean(setup.useFirstPageNumber);
  }
  if (setup.blackAndWhite !== void 0) {
    attrs.blackAndWhite = serializeBoolean(setup.blackAndWhite);
  }
  if (setup.draft !== void 0) {
    attrs.draft = serializeBoolean(setup.draft);
  }
  if (setup.cellComments) {
    attrs.cellComments = setup.cellComments;
  }
  if (setup.pageOrder) {
    attrs.pageOrder = setup.pageOrder;
  }
  if (setup.horizontalDpi !== void 0) {
    attrs.horizontalDpi = String(setup.horizontalDpi);
  }
  if (setup.verticalDpi !== void 0) {
    attrs.verticalDpi = String(setup.verticalDpi);
  }
  if (setup.copies !== void 0) {
    attrs.copies = String(setup.copies);
  }
  return { type: "element", name: "pageSetup", attrs, children: [] };
}
function serializeHeaderFooter(hf) {
  const attrs = {};
  if (hf.differentOddEven !== void 0) {
    attrs.differentOddEven = serializeBoolean(hf.differentOddEven);
  }
  if (hf.differentFirst !== void 0) {
    attrs.differentFirst = serializeBoolean(hf.differentFirst);
  }
  if (hf.scaleWithDoc !== void 0) {
    attrs.scaleWithDoc = serializeBoolean(hf.scaleWithDoc);
  }
  if (hf.alignWithMargins !== void 0) {
    attrs.alignWithMargins = serializeBoolean(hf.alignWithMargins);
  }
  const children2 = [];
  const addTextEl = (name, text) => {
    if (text !== void 0) {
      children2.push({ type: "element", name, attrs: {}, children: [{ type: "text", value: text }] });
    }
  };
  addTextEl("oddHeader", hf.oddHeader);
  addTextEl("oddFooter", hf.oddFooter);
  addTextEl("evenHeader", hf.evenHeader);
  addTextEl("evenFooter", hf.evenFooter);
  addTextEl("firstHeader", hf.firstHeader);
  addTextEl("firstFooter", hf.firstFooter);
  return { type: "element", name: "headerFooter", attrs, children: children2 };
}
function serializeBreaks(elementName, breaks) {
  const children2 = breaks.map((brk) => {
    const attrs = { id: String(brk.id) };
    if (brk.max !== void 0) {
      attrs.max = String(brk.max);
    }
    if (brk.min !== void 0) {
      attrs.min = String(brk.min);
    }
    if (brk.manual !== void 0) {
      attrs.man = serializeBoolean(brk.manual);
    }
    if (brk.pt !== void 0) {
      attrs.pt = serializeBoolean(brk.pt);
    }
    return { type: "element", name: "brk", attrs, children: [] };
  });
  return {
    type: "element",
    name: elementName,
    attrs: { count: String(breaks.length), manualBreakCount: String(breaks.filter((b) => b.manual).length) },
    children: children2
  };
}
function serializeRowBreaks(breaks) {
  return serializeBreaks("rowBreaks", breaks);
}
function serializeColBreaks(breaks) {
  return serializeBreaks("colBreaks", breaks);
}
function serializeWorksheet(worksheet, sharedStrings, drawingRelId) {
  const children2 = [];
  const wsAttrs = {
    xmlns: SPREADSHEETML_NS$2
  };
  const hasRelHyperlinks = worksheet.hyperlinks?.some((h) => h.relationshipId);
  if (hasRelHyperlinks || drawingRelId) {
    wsAttrs["xmlns:r"] = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
  }
  const sheetPr = serializeSheetPr(worksheet);
  if (sheetPr) {
    children2.push(sheetPr);
  }
  children2.push(serializeDimension(worksheet.rows));
  if (worksheet.sheetView) {
    children2.push(serializeSheetViews(worksheet.sheetView));
  }
  const sheetFormatPr = serializeSheetFormatPr(worksheet);
  if (sheetFormatPr) {
    children2.push(sheetFormatPr);
  }
  if (worksheet.columns && worksheet.columns.length > 0) {
    children2.push(serializeCols(worksheet.columns));
  }
  children2.push(serializeSheetData(worksheet.rows, sharedStrings));
  if (worksheet.sheetProtection) {
    children2.push(serializeSheetProtection(worksheet.sheetProtection));
  }
  if (worksheet.autoFilter) {
    children2.push(serializeAutoFilter(worksheet.autoFilter));
  }
  if (worksheet.mergeCells && worksheet.mergeCells.length > 0) {
    children2.push(serializeMergeCells(worksheet.mergeCells));
  }
  if (worksheet.conditionalFormattings && worksheet.conditionalFormattings.length > 0) {
    for (const cf of worksheet.conditionalFormattings) {
      children2.push(serializeConditionalFormatting(cf));
    }
  }
  if (worksheet.dataValidations && worksheet.dataValidations.length > 0) {
    children2.push(serializeDataValidations(worksheet.dataValidations));
  }
  if (worksheet.hyperlinks && worksheet.hyperlinks.length > 0) {
    children2.push(serializeHyperlinks(worksheet.hyperlinks));
  }
  if (drawingRelId) {
    children2.push({ type: "element", name: "drawing", attrs: { "r:id": drawingRelId }, children: [] });
  }
  if (worksheet.printOptions) {
    children2.push(serializePrintOptions(worksheet.printOptions));
  }
  if (worksheet.pageMargins) {
    children2.push(serializePageMargins2(worksheet.pageMargins));
  } else {
    children2.push(serializePageMargins2({
      left: 0.7,
      right: 0.7,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3
    }));
  }
  if (worksheet.pageSetup) {
    children2.push(serializePageSetup(worksheet.pageSetup));
  }
  if (worksheet.headerFooter) {
    children2.push(serializeHeaderFooter(worksheet.headerFooter));
  }
  if (worksheet.pageBreaks) {
    if (worksheet.pageBreaks.rowBreaks.length > 0) {
      children2.push(serializeRowBreaks(worksheet.pageBreaks.rowBreaks));
    }
    if (worksheet.pageBreaks.colBreaks.length > 0) {
      children2.push(serializeColBreaks(worksheet.pageBreaks.colBreaks));
    }
  }
  return {
    type: "element",
    name: "worksheet",
    attrs: wsAttrs,
    children: children2
  };
}
var SPREADSHEETML_NS$1 = SPREADSHEETML_NAMESPACES.main;
var RELATIONSHIPS_NS$1 = OFFICE_NAMESPACES.relationships;
var DRAWING_NS = "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing";
var DRAWINGML_NS = "http://schemas.openxmlformats.org/drawingml/2006/main";
var RELATIONSHIPS_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
function serializeCellAnchorOffset(tagName, offset) {
  return createElement(tagName, {}, [
    createElement("xdr:col", {}, [{ type: "text", value: String(offset.col) }]),
    createElement("xdr:colOff", {}, [{ type: "text", value: String(offset.colOff) }]),
    createElement("xdr:row", {}, [{ type: "text", value: String(offset.row) }]),
    createElement("xdr:rowOff", {}, [{ type: "text", value: String(offset.rowOff) }])
  ]);
}
function serializeExtent(ext) {
  return createElement("xdr:ext", { cx: String(ext.cx), cy: String(ext.cy) }, []);
}
function serializePosition(pos) {
  return createElement("xdr:pos", { x: String(pos.x), y: String(pos.y) }, []);
}
function serializeNonVisualProperties(tagName, props) {
  const attrs = {
    id: String(props.id),
    name: props.name
  };
  if (props.descr) {
    attrs["descr"] = props.descr;
  }
  if (props.hidden) {
    attrs["hidden"] = "1";
  }
  return createElement(tagName, attrs, []);
}
function serializePicture(pic) {
  const nvPicPr = createElement("xdr:nvPicPr", {}, [
    serializeNonVisualProperties("xdr:cNvPr", pic.nvPicPr),
    createElement("xdr:cNvPicPr", {}, [
      createElement("a:picLocks", { noChangeAspect: "1" }, [])
    ])
  ]);
  const blipAttrs = {};
  if (pic.blipRelId) {
    blipAttrs["r:embed"] = pic.blipRelId;
  }
  const blipFill = createElement("xdr:blipFill", {}, [
    createElement("a:blip", blipAttrs, []),
    createElement("a:stretch", {}, [createElement("a:fillRect", {}, [])])
  ]);
  const spPr = createElement("xdr:spPr", {}, [
    createElement("a:prstGeom", { prst: "rect" }, [
      createElement("a:avLst", {}, [])
    ])
  ]);
  return createElement("xdr:pic", {}, [nvPicPr, blipFill, spPr]);
}
function serializeShape(shape) {
  const nvSpPr = createElement("xdr:nvSpPr", {}, [
    serializeNonVisualProperties("xdr:cNvPr", shape.nvSpPr),
    createElement("xdr:cNvSpPr", {}, [])
  ]);
  const spPrChildren = [];
  if (shape.prstGeom) {
    spPrChildren.push(
      createElement("a:prstGeom", { prst: shape.prstGeom }, [
        createElement("a:avLst", {}, [])
      ])
    );
  }
  const spPr = createElement("xdr:spPr", {}, spPrChildren);
  const children2 = [nvSpPr, spPr];
  if (shape.txBody) {
    children2.push(
      createElement("xdr:txBody", {}, [
        createElement("a:bodyPr", {}, []),
        createElement("a:p", {}, [
          createElement("a:r", {}, [
            createElement("a:t", {}, [{ type: "text", value: shape.txBody }])
          ])
        ])
      ])
    );
  }
  return createElement("xdr:sp", {}, children2);
}
function serializeChartFrame(chart) {
  const nvGraphicFramePr = createElement("xdr:nvGraphicFramePr", {}, [
    serializeNonVisualProperties("xdr:cNvPr", chart.nvGraphicFramePr),
    createElement("xdr:cNvGraphicFramePr", {}, [])
  ]);
  const graphicChildren = [];
  if (chart.chartRelId) {
    graphicChildren.push(
      createElement(
        "a:graphicData",
        { uri: "http://schemas.openxmlformats.org/drawingml/2006/chart" },
        [createElement("c:chart", { "r:id": chart.chartRelId }, [])]
      )
    );
  }
  const graphic = createElement("a:graphic", {}, graphicChildren);
  return createElement("xdr:graphicFrame", {}, [nvGraphicFramePr, graphic]);
}
function serializeConnectionShape(cxnSp) {
  const nvCxnSpPrChildren = [
    serializeNonVisualProperties("xdr:cNvPr", cxnSp.nvCxnSpPr)
  ];
  const cNvCxnSpPrChildren = [];
  if (cxnSp.connectorLocks) {
    const lockAttrs = {};
    if (cxnSp.connectorLocks.noGrp) {
      lockAttrs["noGrp"] = "1";
    }
    if (cxnSp.connectorLocks.noSelect) {
      lockAttrs["noSelect"] = "1";
    }
    if (cxnSp.connectorLocks.noRot) {
      lockAttrs["noRot"] = "1";
    }
    if (cxnSp.connectorLocks.noChangeAspect) {
      lockAttrs["noChangeAspect"] = "1";
    }
    if (cxnSp.connectorLocks.noMove) {
      lockAttrs["noMove"] = "1";
    }
    if (cxnSp.connectorLocks.noResize) {
      lockAttrs["noResize"] = "1";
    }
    if (cxnSp.connectorLocks.noEditPoints) {
      lockAttrs["noEditPoints"] = "1";
    }
    if (cxnSp.connectorLocks.noAdjustHandles) {
      lockAttrs["noAdjustHandles"] = "1";
    }
    if (cxnSp.connectorLocks.noChangeArrowheads) {
      lockAttrs["noChangeArrowheads"] = "1";
    }
    if (cxnSp.connectorLocks.noChangeShapeType) {
      lockAttrs["noChangeShapeType"] = "1";
    }
    cNvCxnSpPrChildren.push(createElement("a:cxnSpLocks", lockAttrs, []));
  }
  if (cxnSp.startConnection) {
    cNvCxnSpPrChildren.push(createElement("a:stCxn", {
      id: cxnSp.startConnection.shapeId,
      idx: String(cxnSp.startConnection.siteIndex)
    }, []));
  }
  if (cxnSp.endConnection) {
    cNvCxnSpPrChildren.push(createElement("a:endCxn", {
      id: cxnSp.endConnection.shapeId,
      idx: String(cxnSp.endConnection.siteIndex)
    }, []));
  }
  nvCxnSpPrChildren.push(createElement("xdr:cNvCxnSpPr", {}, cNvCxnSpPrChildren));
  const nvCxnSpPr = createElement("xdr:nvCxnSpPr", {}, nvCxnSpPrChildren);
  const spPrChildren = [];
  if (cxnSp.prstGeom) {
    spPrChildren.push(
      createElement("a:prstGeom", { prst: cxnSp.prstGeom }, [
        createElement("a:avLst", {}, [])
      ])
    );
  }
  const spPr = createElement("xdr:spPr", {}, spPrChildren);
  return createElement("xdr:cxnSp", {}, [nvCxnSpPr, spPr]);
}
function serializeGroupShape(grpSp) {
  const nvGrpSpPrChildren = [
    serializeNonVisualProperties("xdr:cNvPr", grpSp.nvGrpSpPr),
    createElement("xdr:cNvGrpSpPr", {}, [])
  ];
  const nvGrpSpPr = createElement("xdr:nvGrpSpPr", {}, nvGrpSpPrChildren);
  const grpSpPrChildren = [];
  if (grpSp.transform) {
    const t = grpSp.transform;
    const xfrmAttrs = {};
    if (t.rot !== void 0) {
      xfrmAttrs["rot"] = String(t.rot);
    }
    if (t.flipH) {
      xfrmAttrs["flipH"] = "1";
    }
    if (t.flipV) {
      xfrmAttrs["flipV"] = "1";
    }
    grpSpPrChildren.push(
      createElement("a:xfrm", xfrmAttrs, [
        createElement("a:off", { x: String(t.x), y: String(t.y) }, []),
        createElement("a:ext", { cx: String(t.cx), cy: String(t.cy) }, []),
        createElement("a:chOff", { x: String(t.chOffX), y: String(t.chOffY) }, []),
        createElement("a:chExt", { cx: String(t.chExtCx), cy: String(t.chExtCy) }, [])
      ])
    );
  }
  const grpSpPr = createElement("xdr:grpSpPr", {}, grpSpPrChildren);
  const children2 = [nvGrpSpPr, grpSpPr];
  for (const child of grpSp.children) {
    const childEl = serializeDrawingContent(child);
    if (childEl) {
      children2.push(childEl);
    }
  }
  return createElement("xdr:grpSp", {}, children2);
}
function serializeDrawingContent(content) {
  switch (content.type) {
    case "picture":
      return serializePicture(content);
    case "shape":
      return serializeShape(content);
    case "chartFrame":
      return serializeChartFrame(content);
    case "connectionShape":
      return serializeConnectionShape(content);
    case "groupShape":
      return serializeGroupShape(content);
  }
}
function serializeTwoCellAnchor(anchor) {
  const attrs = {};
  if (anchor.editAs) {
    attrs["editAs"] = anchor.editAs;
  }
  const children2 = [
    serializeCellAnchorOffset("xdr:from", anchor.from),
    serializeCellAnchorOffset("xdr:to", anchor.to)
  ];
  if (anchor.content) {
    const contentEl = serializeDrawingContent(anchor.content);
    if (contentEl) {
      children2.push(contentEl);
    }
  }
  children2.push(createElement("xdr:clientData", {}, []));
  return createElement("xdr:twoCellAnchor", attrs, children2);
}
function serializeOneCellAnchor(anchor) {
  const children2 = [
    serializeCellAnchorOffset("xdr:from", anchor.from),
    serializeExtent(anchor.ext)
  ];
  if (anchor.content) {
    const contentEl = serializeDrawingContent(anchor.content);
    if (contentEl) {
      children2.push(contentEl);
    }
  }
  children2.push(createElement("xdr:clientData", {}, []));
  return createElement("xdr:oneCellAnchor", {}, children2);
}
function serializeAbsoluteAnchor(anchor) {
  const children2 = [
    serializePosition(anchor.pos),
    serializeExtent(anchor.ext)
  ];
  if (anchor.content) {
    const contentEl = serializeDrawingContent(anchor.content);
    if (contentEl) {
      children2.push(contentEl);
    }
  }
  children2.push(createElement("xdr:clientData", {}, []));
  return createElement("xdr:absoluteAnchor", {}, children2);
}
function serializeAnchor(anchor) {
  switch (anchor.type) {
    case "twoCellAnchor":
      return serializeTwoCellAnchor(anchor);
    case "oneCellAnchor":
      return serializeOneCellAnchor(anchor);
    case "absoluteAnchor":
      return serializeAbsoluteAnchor(anchor);
  }
}
function serializeDrawing(drawing) {
  const children2 = drawing.anchors.map(serializeAnchor);
  return createElement(
    "xdr:wsDr",
    {
      "xmlns:xdr": DRAWING_NS,
      "xmlns:a": DRAWINGML_NS,
      "xmlns:r": RELATIONSHIPS_NS
    },
    children2
  );
}
var XLSX_RELATIONSHIP_TYPES = {
  officeDocument: OFFICE_RELATIONSHIP_TYPES.officeDocument,
  worksheet: SPREADSHEETML_RELATIONSHIP_TYPES.worksheet,
  styles: OFFICE_RELATIONSHIP_TYPES.styles,
  sharedStrings: SPREADSHEETML_RELATIONSHIP_TYPES.sharedStrings,
  hyperlink: OFFICE_RELATIONSHIP_TYPES.hyperlink
};
var SPREADSHEETML_NS = SPREADSHEETML_NAMESPACES.main;
function createSharedStringTableBuilder() {
  const stringToIndex = /* @__PURE__ */ new Map();
  const strings = [];
  return {
    getIndex(value) {
      return stringToIndex.get(value);
    },
    addString(value) {
      const existing = stringToIndex.get(value);
      if (existing !== void 0) {
        return existing;
      }
      const index = strings.length;
      strings.push(value);
      stringToIndex.set(value, index);
      return index;
    },
    getStrings() {
      return strings;
    }
  };
}
function generateSharedStrings(sharedStrings) {
  const children2 = sharedStrings.map(
    (str) => createElement("si", {}, [createElement("t", {}, [{ type: "text", value: str }])])
  );
  return createElement(
    "sst",
    {
      xmlns: SPREADSHEETML_NS,
      count: String(sharedStrings.length),
      uniqueCount: String(sharedStrings.length)
    },
    children2
  );
}

// node_modules/aurochs/dist/pptx/builder/index.js
function setAttribute(element, name, value) {
  return { ...element, attrs: { ...element.attrs, [name]: value } };
}
function removeAttribute(element, name) {
  const { [name]: _, ...rest } = element.attrs;
  return { ...element, attrs: rest };
}
function insertChildAt$1(parent, child, index) {
  const children2 = [...parent.children];
  children2.splice(index, 0, child);
  return { ...parent, children: children2 };
}
function removeChildren(parent, predicate) {
  return { ...parent, children: parent.children.filter((child, i) => !predicate(child, i)) };
}
function replaceChildAt(parent, index, newChild) {
  return { ...parent, children: parent.children.map((child, i) => i === index ? newChild : child) };
}
function replaceChild(parent, predicate, newChild) {
  const index = parent.children.findIndex(predicate);
  if (index === -1) {
    return parent;
  }
  return replaceChildAt(parent, index, newChild);
}
function replaceChildByName(parent, name, newChild) {
  return replaceChild(parent, (child) => isXmlElement(child) && child.name === name, newChild);
}
function setChildren(parent, children2) {
  return { ...parent, children: children2 };
}
function updateChildByName(parent, name, updater) {
  return {
    ...parent,
    children: parent.children.map((child) => {
      if (isXmlElement(child) && child.name === name) {
        return updater(child);
      }
      return child;
    })
  };
}
function findElements(root, predicate) {
  const results = [];
  if (predicate(root)) {
    results.push(root);
  }
  for (const child of root.children) {
    if (isXmlElement(child)) {
      results.push(...findElements(child, predicate));
    }
  }
  return results;
}
function updateAtPath(root, path, updater) {
  if (path.length === 0) {
    return updater(root);
  }
  const [first, ...rest] = path;
  const firstIndex = root.children.findIndex((child) => isXmlElement(child) && child.name === first);
  return {
    ...root,
    children: root.children.map((child, index) => {
      if (index !== firstIndex) {
        return child;
      }
      return updateAtPath(child, rest, updater);
    })
  };
}
function updateDocumentRoot(doc, updater) {
  const rootIndex = doc.children.findIndex(isXmlElement);
  if (rootIndex === -1) {
    return doc;
  }
  const root = doc.children[rootIndex];
  const updatedRoot = updater(root);
  return { ...doc, children: doc.children.map((child, i) => i === rootIndex ? updatedRoot : child) };
}
function getDocumentRoot(doc) {
  const root = doc.children.find(isXmlElement);
  return root ?? null;
}
function parseCommentPosition(element) {
  if (!element) {
    return void 0;
  }
  const x = getEmuAttr2(element, "x");
  const y = getEmuAttr2(element, "y");
  if (x === void 0 || y === void 0) {
    return void 0;
  }
  return { x, y };
}
function parseCommentAuthor(element) {
  return {
    id: getIntAttrOr(element, "id", 0),
    name: getAttr(element, "name"),
    initials: getAttr(element, "initials"),
    lastIdx: getIntAttr(element, "lastIdx"),
    colorIndex: getIntAttr(element, "clrIdx")
  };
}
function parseCommentAuthorList(element) {
  const authors = getChildren(element, "p:cmAuthor").map(parseCommentAuthor);
  return { authors };
}
function parseComment(element) {
  const pos = getChild(element, "p:pos");
  const text = getChild(element, "p:text");
  return {
    authorId: getIntAttr(element, "authorId"),
    dateTime: getAttr(element, "dt"),
    idx: getIntAttr(element, "idx"),
    position: parseCommentPosition(pos),
    text: text ? getTextContent(text) : void 0
  };
}
function parseCommentList(element) {
  const comments = getChildren(element, "p:cm").map(parseComment);
  return { comments };
}
function serializeColor2(color) {
  const children2 = serializeColorTransform(color.transform);
  switch (color.spec.type) {
    case "srgb":
      return createElement("a:srgbClr", { val: color.spec.value.toUpperCase() }, children2);
    case "scheme":
      return createElement("a:schemeClr", { val: color.spec.value }, children2);
    case "system": {
      const attrs = { val: color.spec.value };
      if (color.spec.lastColor) {
        attrs.lastClr = color.spec.lastColor.toUpperCase();
      }
      return createElement("a:sysClr", attrs, children2);
    }
    case "preset":
      return createElement("a:prstClr", { val: color.spec.value }, children2);
    case "hsl":
      return createElement(
        "a:hslClr",
        {
          hue: ooxmlAngleUnits(color.spec.hue),
          sat: ooxmlPercent100k(color.spec.saturation),
          lum: ooxmlPercent100k(color.spec.luminance)
        },
        children2
      );
    case "scrgb":
      return createElement(
        "a:scrgbClr",
        {
          r: ooxmlPercent100k(color.spec.red),
          g: ooxmlPercent100k(color.spec.green),
          b: ooxmlPercent100k(color.spec.blue)
        },
        children2
      );
  }
}
function serializeColorTransform(transform) {
  if (!transform) {
    return [];
  }
  const children2 = [];
  if (transform.alpha !== void 0) {
    children2.push(createElement("a:alpha", { val: ooxmlPercent100k(transform.alpha) }));
  }
  if (transform.alphaMod !== void 0) {
    children2.push(createElement("a:alphaMod", { val: ooxmlPercent100k(transform.alphaMod) }));
  }
  if (transform.alphaOff !== void 0) {
    children2.push(createElement("a:alphaOff", { val: ooxmlPercent100k(transform.alphaOff) }));
  }
  if (transform.hue !== void 0) {
    children2.push(createElement("a:hue", { val: ooxmlAngleUnits(transform.hue) }));
  }
  if (transform.hueMod !== void 0) {
    children2.push(createElement("a:hueMod", { val: ooxmlPercent100k(transform.hueMod) }));
  }
  if (transform.hueOff !== void 0) {
    children2.push(createElement("a:hueOff", { val: ooxmlAngleUnits(transform.hueOff) }));
  }
  if (transform.sat !== void 0) {
    children2.push(createElement("a:sat", { val: ooxmlPercent100k(transform.sat) }));
  }
  if (transform.satMod !== void 0) {
    children2.push(createElement("a:satMod", { val: ooxmlPercent100k(transform.satMod) }));
  }
  if (transform.satOff !== void 0) {
    children2.push(createElement("a:satOff", { val: ooxmlPercent100k(transform.satOff) }));
  }
  if (transform.lum !== void 0) {
    children2.push(createElement("a:lum", { val: ooxmlPercent100k(transform.lum) }));
  }
  if (transform.lumMod !== void 0) {
    children2.push(createElement("a:lumMod", { val: ooxmlPercent100k(transform.lumMod) }));
  }
  if (transform.lumOff !== void 0) {
    children2.push(createElement("a:lumOff", { val: ooxmlPercent100k(transform.lumOff) }));
  }
  if (transform.gamma) {
    children2.push(createElement("a:gamma"));
  }
  if (transform.invGamma) {
    children2.push(createElement("a:invGamma"));
  }
  if (transform.green !== void 0) {
    children2.push(createElement("a:green", { val: ooxmlPercent100k(transform.green) }));
  }
  if (transform.greenMod !== void 0) {
    children2.push(createElement("a:greenMod", { val: ooxmlPercent100k(transform.greenMod) }));
  }
  if (transform.greenOff !== void 0) {
    children2.push(createElement("a:greenOff", { val: ooxmlPercent100k(transform.greenOff) }));
  }
  if (transform.redMod !== void 0) {
    children2.push(createElement("a:redMod", { val: ooxmlPercent100k(transform.redMod) }));
  }
  if (transform.redOff !== void 0) {
    children2.push(createElement("a:redOff", { val: ooxmlPercent100k(transform.redOff) }));
  }
  if (transform.blueMod !== void 0) {
    children2.push(createElement("a:blueMod", { val: ooxmlPercent100k(transform.blueMod) }));
  }
  if (transform.blueOff !== void 0) {
    children2.push(createElement("a:blueOff", { val: ooxmlPercent100k(transform.blueOff) }));
  }
  if (transform.shade !== void 0) {
    children2.push(createElement("a:shade", { val: ooxmlPercent100k(transform.shade) }));
  }
  if (transform.tint !== void 0) {
    children2.push(createElement("a:tint", { val: ooxmlPercent100k(transform.tint) }));
  }
  if (transform.comp) {
    children2.push(createElement("a:comp"));
  }
  if (transform.inv) {
    children2.push(createElement("a:inv"));
  }
  if (transform.gray) {
    children2.push(createElement("a:gray"));
  }
  return children2;
}
function serializeFill(fill) {
  switch (fill.type) {
    case "noFill":
      return createElement("a:noFill");
    case "solidFill":
      return createElement("a:solidFill", {}, [serializeColor2(fill.color)]);
    case "gradientFill":
      return serializeGradientFill(fill);
    case "patternFill":
      return serializePatternFill(fill);
    case "blipFill":
      return serializeBlipFill(fill);
    case "groupFill":
      return createElement("a:grpFill");
  }
}
function serializeGradientFill(gradient) {
  const attrs = {
    rotWithShape: ooxmlBool(gradient.rotWithShape)
  };
  const children2 = [createElement("a:gsLst", {}, gradient.stops.map(serializeGradientStop))];
  if (gradient.linear) {
    children2.push(
      createElement("a:lin", {
        ang: ooxmlAngleUnits(gradient.linear.angle),
        scaled: ooxmlBool(gradient.linear.scaled)
      })
    );
  }
  if (gradient.path) {
    const pathChildren = [];
    if (gradient.path.fillToRect) {
      pathChildren.push(
        createElement("a:fillToRect", {
          l: ooxmlPercent100k(gradient.path.fillToRect.left),
          t: ooxmlPercent100k(gradient.path.fillToRect.top),
          r: ooxmlPercent100k(gradient.path.fillToRect.right),
          b: ooxmlPercent100k(gradient.path.fillToRect.bottom)
        })
      );
    }
    children2.push(createElement("a:path", { path: gradient.path.path }, pathChildren));
  }
  if (gradient.tileRect) {
    children2.push(
      createElement("a:tileRect", {
        l: ooxmlPercent100k(gradient.tileRect.left),
        t: ooxmlPercent100k(gradient.tileRect.top),
        r: ooxmlPercent100k(gradient.tileRect.right),
        b: ooxmlPercent100k(gradient.tileRect.bottom)
      })
    );
  }
  return createElement("a:gradFill", attrs, children2);
}
function serializeGradientStop(stop) {
  return createElement("a:gs", { pos: ooxmlPercent100k(stop.position) }, [serializeColor2(stop.color)]);
}
function serializePatternFill(pattern) {
  return createElement("a:pattFill", { prst: pattern.preset }, [
    createElement("a:fgClr", {}, [serializeColor2(pattern.foregroundColor)]),
    createElement("a:bgClr", {}, [serializeColor2(pattern.backgroundColor)])
  ]);
}
function serializeBlipFill(blip) {
  if (blip.resourceId.startsWith("data:")) {
    throw new Error("serializeBlipFill: data: resourceId requires Phase 7 media embedding");
  }
  const attrs = {
    rotWithShape: ooxmlBool(blip.rotWithShape ?? true)
  };
  if (blip.dpi !== void 0) {
    attrs.dpi = String(blip.dpi);
  }
  const blipAttrs = {};
  if (blip.relationshipType === "link") {
    blipAttrs["r:link"] = blip.resourceId;
  } else {
    blipAttrs["r:embed"] = blip.resourceId;
  }
  if (blip.compressionState) {
    blipAttrs.cstate = blip.compressionState;
  }
  const blipChildren = blip.blipEffects ? serializeBlipEffects(blip.blipEffects) : [];
  const children2 = [createElement("a:blip", blipAttrs, blipChildren)];
  if (blip.sourceRect) {
    children2.push(
      createElement("a:srcRect", {
        l: ooxmlPercent100k(blip.sourceRect.left),
        t: ooxmlPercent100k(blip.sourceRect.top),
        r: ooxmlPercent100k(blip.sourceRect.right),
        b: ooxmlPercent100k(blip.sourceRect.bottom)
      })
    );
  }
  if (blip.stretch) {
    children2.push(serializeStretchFill(blip.stretch));
  }
  if (blip.tile) {
    children2.push(serializeTileFill(blip.tile));
  }
  return createElement("a:blipFill", attrs, children2);
}
function serializeStretchFill(stretch) {
  if (!stretch.fillRect) {
    return createElement("a:stretch");
  }
  return createElement("a:stretch", {}, [
    createElement("a:fillRect", {
      l: ooxmlPercent100k(stretch.fillRect.left),
      t: ooxmlPercent100k(stretch.fillRect.top),
      r: ooxmlPercent100k(stretch.fillRect.right),
      b: ooxmlPercent100k(stretch.fillRect.bottom)
    })
  ]);
}
function serializeTileFill(tile) {
  return createElement("a:tile", {
    tx: ooxmlEmu(tile.tx),
    ty: ooxmlEmu(tile.ty),
    sx: ooxmlPercent100k(tile.sx),
    sy: ooxmlPercent100k(tile.sy),
    flip: tile.flip,
    algn: tile.alignment
  });
}
function serializeBlipEffects(effects) {
  const children2 = [];
  if (effects.alphaBiLevel) {
    children2.push(createElement("a:alphaBiLevel", { thresh: ooxmlPercent100k(effects.alphaBiLevel.threshold) }));
  }
  if (effects.alphaCeiling) {
    children2.push(createElement("a:alphaCeiling"));
  }
  if (effects.alphaFloor) {
    children2.push(createElement("a:alphaFloor"));
  }
  if (effects.alphaInv) {
    children2.push(createElement("a:alphaInv"));
  }
  if (effects.alphaMod) {
    children2.push(createElement("a:alphaMod"));
  }
  if (effects.alphaModFix) {
    children2.push(createElement("a:alphaModFix", { amt: ooxmlPercent100k(effects.alphaModFix.amount) }));
  }
  if (effects.alphaRepl) {
    children2.push(createElement("a:alphaRepl", { a: ooxmlPercent100k(effects.alphaRepl.alpha) }));
  }
  if (effects.biLevel) {
    children2.push(createElement("a:biLevel", { thresh: ooxmlPercent100k(effects.biLevel.threshold) }));
  }
  if (effects.blur) {
    children2.push(
      createElement("a:blur", {
        rad: ooxmlEmu(effects.blur.radius),
        grow: ooxmlBool(effects.blur.grow)
      })
    );
  }
  if (effects.colorChange) {
    children2.push(
      createElement("a:clrChange", { useA: ooxmlBool(effects.colorChange.useAlpha) }, [
        createElement("a:clrFrom", {}, [serializeColor2(effects.colorChange.from)]),
        createElement("a:clrTo", {}, [serializeColor2(effects.colorChange.to)])
      ])
    );
  }
  if (effects.colorReplace) {
    children2.push(createElement("a:clrRepl", {}, [serializeColor2(effects.colorReplace.color)]));
  }
  if (effects.duotone) {
    children2.push(
      createElement("a:duotone", {}, [
        serializeColor2(effects.duotone.colors[0]),
        serializeColor2(effects.duotone.colors[1])
      ])
    );
  }
  if (effects.grayscale) {
    children2.push(createElement("a:grayscl"));
  }
  if (effects.hsl) {
    children2.push(
      createElement("a:hsl", {
        hue: ooxmlAngleUnits(effects.hsl.hue),
        sat: ooxmlPercent100k(effects.hsl.saturation),
        lum: ooxmlPercent100k(effects.hsl.luminance)
      })
    );
  }
  if (effects.luminance) {
    children2.push(
      createElement("a:lum", {
        bright: ooxmlPercent100k(effects.luminance.brightness),
        contrast: ooxmlPercent100k(effects.luminance.contrast)
      })
    );
  }
  if (effects.tint) {
    children2.push(
      createElement("a:tint", {
        hue: ooxmlAngleUnits(effects.tint.hue),
        amt: ooxmlPercent100k(effects.tint.amount)
      })
    );
  }
  return children2;
}
function serializeLine(line) {
  const attrs = {
    w: ooxmlEmu(line.width),
    cap: serializeLineCap(line.cap),
    cmpd: line.compound,
    algn: line.alignment
  };
  const children2 = [serializeFill(line.fill), serializeDash(line.dash)];
  if (line.headEnd) {
    children2.push(serializeLineEnd("a:headEnd", line.headEnd));
  }
  if (line.tailEnd) {
    children2.push(serializeLineEnd("a:tailEnd", line.tailEnd));
  }
  children2.push(serializeLineJoin(line));
  return createElement("a:ln", attrs, children2);
}
function serializeLineCap(cap) {
  switch (cap) {
    case "flat":
      return "flat";
    case "round":
      return "rnd";
    case "square":
      return "sq";
  }
}
function serializeDash(dash) {
  if (typeof dash === "string") {
    return createElement("a:prstDash", { val: dash });
  }
  return createElement(
    "a:custDash",
    {},
    dash.dashes.map(
      (d) => createElement("a:ds", {
        d: ooxmlPercent100k(d.dashLength),
        sp: ooxmlPercent100k(d.spaceLength)
      })
    )
  );
}
function serializeLineEnd(name, end) {
  return createElement(name, {
    type: end.type,
    w: end.width,
    len: end.length
  });
}
function serializeLineJoin(line) {
  switch (line.join) {
    case "bevel":
      return createElement("a:bevel");
    case "round":
      return createElement("a:round");
    case "miter": {
      const attrs = {};
      if (line.miterLimit !== void 0) {
        attrs.lim = String(Math.round(line.miterLimit / 100 * 1e5));
      }
      return createElement("a:miter", attrs);
    }
  }
}
function serializeEffects(effects) {
  const children2 = [];
  if (effects.shadow) {
    children2.push(serializeShadow(effects.shadow));
  }
  if (effects.glow) {
    children2.push(serializeGlow(effects.glow));
  }
  if (effects.reflection) {
    children2.push(serializeReflection(effects.reflection));
  }
  if (effects.softEdge) {
    children2.push(serializeSoftEdge(effects.softEdge));
  }
  if (effects.alphaBiLevel) {
    children2.push(serializeAlphaBiLevel(effects.alphaBiLevel));
  }
  if (effects.alphaCeiling) {
    children2.push(serializeAlphaCeiling(effects.alphaCeiling));
  }
  if (effects.alphaFloor) {
    children2.push(serializeAlphaFloor(effects.alphaFloor));
  }
  if (effects.alphaInv) {
    children2.push(serializeAlphaInv(effects.alphaInv));
  }
  if (effects.alphaMod) {
    children2.push(serializeAlphaMod(effects.alphaMod));
  }
  if (effects.alphaModFix) {
    children2.push(serializeAlphaModFix(effects.alphaModFix));
  }
  if (effects.alphaOutset) {
    children2.push(serializeAlphaOutset(effects.alphaOutset));
  }
  if (effects.alphaRepl) {
    children2.push(serializeAlphaRepl(effects.alphaRepl));
  }
  if (effects.biLevel) {
    children2.push(serializeBiLevel(effects.biLevel));
  }
  if (effects.blend) {
    children2.push(serializeBlend(effects.blend));
  }
  if (effects.colorChange) {
    children2.push(serializeColorChange(effects.colorChange));
  }
  if (effects.colorReplace) {
    children2.push(serializeColorReplace(effects.colorReplace));
  }
  if (effects.duotone) {
    children2.push(serializeDuotone(effects.duotone));
  }
  if (effects.fillOverlay) {
    children2.push(serializeFillOverlay(effects.fillOverlay));
  }
  if (effects.grayscale) {
    children2.push(serializeGrayscale(effects.grayscale));
  }
  if (effects.presetShadow) {
    children2.push(serializePresetShadow(effects.presetShadow));
  }
  if (effects.relativeOffset) {
    children2.push(serializeRelativeOffset(effects.relativeOffset));
  }
  if (children2.length === 0) {
    return null;
  }
  const containerName = effects.containerKind === "effectDag" ? "a:effectDag" : "a:effectLst";
  return createElement(containerName, {}, children2);
}
function serializeShadow(shadow) {
  const name = shadow.type === "outer" ? "a:outerShdw" : "a:innerShdw";
  const attrs = {
    blurRad: ooxmlEmu(shadow.blurRadius),
    dist: ooxmlEmu(shadow.distance),
    dir: ooxmlAngleUnits(shadow.direction)
  };
  if (shadow.type === "outer") {
    if (shadow.scaleX !== void 0) {
      attrs.sx = ooxmlPercent100k(shadow.scaleX);
    }
    if (shadow.scaleY !== void 0) {
      attrs.sy = ooxmlPercent100k(shadow.scaleY);
    }
    if (shadow.skewX !== void 0) {
      attrs.kx = ooxmlAngleUnits(shadow.skewX);
    }
    if (shadow.skewY !== void 0) {
      attrs.ky = ooxmlAngleUnits(shadow.skewY);
    }
    if (shadow.alignment !== void 0) {
      attrs.algn = shadow.alignment;
    }
    if (shadow.rotateWithShape !== void 0) {
      attrs.rotWithShape = ooxmlBool(shadow.rotateWithShape);
    }
  }
  return createElement(name, attrs, [serializeColor2(shadow.color)]);
}
function serializeGlow(glow) {
  return createElement("a:glow", { rad: ooxmlEmu(glow.radius) }, [serializeColor2(glow.color)]);
}
function serializeReflection(reflection) {
  const attrs = {
    blurRad: ooxmlEmu(reflection.blurRadius),
    stA: ooxmlPercent100k(reflection.startOpacity),
    stPos: ooxmlPercent100k(reflection.startPosition),
    endA: ooxmlPercent100k(reflection.endOpacity),
    endPos: ooxmlPercent100k(reflection.endPosition),
    dist: ooxmlEmu(reflection.distance),
    dir: ooxmlAngleUnits(reflection.direction),
    fadeDir: ooxmlAngleUnits(reflection.fadeDirection),
    sx: ooxmlPercent100k(reflection.scaleX),
    sy: ooxmlPercent100k(reflection.scaleY)
  };
  if (reflection.skewX !== void 0) {
    attrs.kx = ooxmlAngleUnits(reflection.skewX);
  }
  if (reflection.skewY !== void 0) {
    attrs.ky = ooxmlAngleUnits(reflection.skewY);
  }
  if (reflection.alignment !== void 0) {
    attrs.algn = reflection.alignment;
  }
  if (reflection.rotateWithShape !== void 0) {
    attrs.rotWithShape = ooxmlBool(reflection.rotateWithShape);
  }
  return createElement("a:reflection", attrs);
}
function serializeSoftEdge(softEdge) {
  return createElement("a:softEdge", { rad: ooxmlEmu(softEdge.radius) });
}
function serializeAlphaBiLevel(effect) {
  return createElement("a:alphaBiLevel", { thresh: ooxmlPercent100k(effect.threshold) });
}
function serializeAlphaCeiling(effect) {
  return createElement("a:alphaCeiling");
}
function serializeAlphaFloor(effect) {
  return createElement("a:alphaFloor");
}
function serializeAlphaInv(effect) {
  return createElement("a:alphaInv");
}
function serializeAlphaMod(effect) {
  return createElement("a:alphaMod", {}, [serializeEffectContainer(effect.container, effect)]);
}
function serializeAlphaModFix(effect) {
  return createElement("a:alphaModFix", { amt: ooxmlPercent1000(effect.amount) });
}
function serializeAlphaOutset(effect) {
  return createElement("a:alphaOutset", { rad: ooxmlEmu(effect.radius) });
}
function serializeAlphaRepl(effect) {
  return createElement("a:alphaRepl", { a: ooxmlPercent100k(effect.alpha) });
}
function serializeBiLevel(effect) {
  return createElement("a:biLevel", { thresh: ooxmlPercent100k(effect.threshold) });
}
function serializeBlend(effect) {
  return createElement("a:blend", { blend: effect.blend }, [serializeEffectContainer(effect.container, effect)]);
}
function serializeColorChange(effect) {
  return createElement("a:clrChange", { useA: ooxmlBool(effect.useAlpha) }, [
    createElement("a:clrFrom", {}, [serializeColor2(effect.from)]),
    createElement("a:clrTo", {}, [serializeColor2(effect.to)])
  ]);
}
function serializeColorReplace(effect) {
  return createElement("a:clrRepl", {}, [serializeColor2(effect.color)]);
}
function serializeDuotone(effect) {
  return createElement("a:duotone", {}, [serializeColor2(effect.colors[0]), serializeColor2(effect.colors[1])]);
}
function serializeFillOverlay(effect) {
  const fillChild = effect.fill ? serializeFill(effect.fill) : serializeFillOverlayChild(effect);
  return createElement("a:fillOverlay", { blend: effect.blend }, [fillChild]);
}
function serializeGrayscale(effect) {
  return createElement("a:grayscl");
}
function serializePresetShadow(effect) {
  return createElement(
    "a:prstShdw",
    {
      prst: effect.preset,
      dir: ooxmlAngleUnits(effect.direction),
      dist: ooxmlEmu(effect.distance)
    },
    [serializeColor2(effect.color)]
  );
}
function serializeRelativeOffset(effect) {
  return createElement("a:relOff", {
    tx: ooxmlPercent1000(effect.offsetX),
    ty: ooxmlPercent1000(effect.offsetY)
  });
}
function serializeEffectContainer(container, fallback) {
  const attrs = {};
  const type = container?.type ?? fallback.containerType;
  const name = container?.name ?? fallback.name;
  if (type) {
    attrs.type = type;
  }
  if (name) {
    attrs.name = name;
  }
  return createElement("a:cont", attrs);
}
function serializeFillOverlayChild(effect) {
  switch (effect.fillType) {
    case "solidFill":
      return createElement("a:solidFill");
    case "gradFill":
      return createElement("a:gradFill");
    case "blipFill":
      return createElement("a:blipFill");
    case "pattFill":
      return createElement("a:pattFill");
    case "grpFill":
      return createElement("a:grpFill");
  }
}
var ANGLE_UNITS_PER_DEGREE2 = 6e4;
function pixelsToEmuString(valuePx) {
  return String(Math.round(valuePx * EMU_PER_PIXEL));
}
function degreesToAngleUnitsString(valueDeg) {
  return String(Math.round(valueDeg * ANGLE_UNITS_PER_DEGREE2));
}
function buildOffElement(transform) {
  return createElement("a:off", {
    x: pixelsToEmuString(Number(transform.x)),
    y: pixelsToEmuString(Number(transform.y))
  });
}
function buildExtElement(transform) {
  return createElement("a:ext", {
    cx: pixelsToEmuString(Number(transform.width)),
    cy: pixelsToEmuString(Number(transform.height))
  });
}
function buildTransformAttrs(transform) {
  const attrs = {};
  if (Number(transform.rotation) !== 0) {
    attrs.rot = degreesToAngleUnitsString(Number(transform.rotation));
  }
  if (transform.flipH) {
    attrs.flipH = "1";
  }
  if (transform.flipV) {
    attrs.flipV = "1";
  }
  return attrs;
}
function serializeTransform(transform) {
  return createElement("a:xfrm", buildTransformAttrs(transform), [
    buildOffElement(transform),
    buildExtElement(transform)
  ]);
}
function patchTransformElement(existingXfrm, transform) {
  const attrs = { ...existingXfrm.attrs };
  if (Number(transform.rotation) !== 0) {
    attrs.rot = degreesToAngleUnitsString(Number(transform.rotation));
  } else {
    delete attrs.rot;
  }
  if (transform.flipH) {
    attrs.flipH = "1";
  }
  if (transform.flipV) {
    attrs.flipV = "1";
  }
  const preservedChildren = existingXfrm.children.filter((child) => {
    if (!isXmlElement(child)) {
      return true;
    }
    return child.name !== "a:off" && child.name !== "a:ext";
  });
  return createElement(existingXfrm.name, attrs, [
    buildOffElement(transform),
    buildExtElement(transform),
    ...preservedChildren
  ]);
}
function serializeBevel(name, bevel) {
  const attrs = {
    w: ooxmlEmu(bevel.width),
    h: ooxmlEmu(bevel.height),
    prst: bevel.preset
  };
  return createElement(name, attrs);
}
function serializeShape3d(shape3d) {
  const children2 = [];
  const attrs = {};
  if (shape3d.extrusionHeight !== void 0 && shape3d.extrusionHeight > 0) {
    attrs.extrusionH = ooxmlEmu(shape3d.extrusionHeight);
  }
  if (shape3d.z !== void 0 && shape3d.z > 0) {
    attrs.z = ooxmlEmu(shape3d.z);
  }
  if (shape3d.contourWidth !== void 0 && shape3d.contourWidth > 0) {
    attrs.contourW = ooxmlEmu(shape3d.contourWidth);
  }
  if (shape3d.preset) {
    attrs.prstMaterial = shape3d.preset;
  }
  if (shape3d.bevelTop) {
    children2.push(serializeBevel("a:bevelT", shape3d.bevelTop));
  }
  if (shape3d.bevelBottom) {
    children2.push(serializeBevel("a:bevelB", shape3d.bevelBottom));
  }
  if (Object.keys(attrs).length === 0 && children2.length === 0) {
    return null;
  }
  return createElement("a:sp3d", attrs, children2);
}
var PT_PER_INCH = 72;
var PX_PER_INCH = 96;
function ooxmlCentipoints(points) {
  return String(Math.round(points * 100));
}
function ooxmlTextPointUnqualified(pixels) {
  return String(Math.round(pixels * (PT_PER_INCH / PX_PER_INCH) * 100));
}
function serializeLineSpacing(spacing, elementName) {
  switch (spacing.type) {
    case "percent":
      return createElement(elementName, {}, [createElement("a:spcPct", { val: ooxmlPercent1000(spacing.value) })]);
    case "points":
      return createElement(elementName, {}, [createElement("a:spcPts", { val: ooxmlCentipoints(spacing.value) })]);
  }
}
function serializeTabStops2(tabs) {
  return createElement(
    "a:tabLst",
    {},
    tabs.map(
      (tab) => createElement("a:tab", {
        pos: ooxmlEmu(tab.position),
        algn: serializeTabStopAlignment(tab.alignment)
      })
    )
  );
}
function serializeTabStopAlignment(alignment) {
  switch (alignment) {
    case "left":
      return "l";
    case "center":
      return "ctr";
    case "right":
      return "r";
    case "decimal":
      return "dec";
  }
}
function serializeParagraphAlignment(alignment) {
  switch (alignment) {
    case "left":
      return "l";
    case "center":
      return "ctr";
    case "right":
      return "r";
    case "justify":
      return "just";
    case "justifyLow":
      return "justLow";
    case "distributed":
      return "dist";
    case "thaiDistributed":
      return "thaiDist";
  }
}
function serializeFontAlignment(alignment) {
  switch (alignment) {
    case "auto":
      return "auto";
    case "top":
      return "t";
    case "center":
      return "ctr";
    case "base":
      return "base";
    case "bottom":
      return "b";
  }
}
function serializeBodyAnchor(anchor) {
  switch (anchor) {
    case "top":
      return "t";
    case "center":
      return "ctr";
    case "bottom":
      return "b";
  }
}
function serializeHyperlinkSound(sound) {
  const attrs = { "r:embed": sound.embed };
  if (sound.name) {
    attrs.name = sound.name;
  }
  return createElement("a:snd", attrs);
}
function serializeHyperlink2(hlink) {
  const attrs = { "r:id": hlink.id };
  if (hlink.tooltip !== void 0) {
    attrs.tooltip = hlink.tooltip;
  }
  if (hlink.action !== void 0) {
    attrs.action = hlink.action;
  }
  const children2 = [];
  if (hlink.sound) {
    children2.push(serializeHyperlinkSound(hlink.sound));
  }
  return createElement("a:hlinkClick", attrs, children2);
}
function serializeHyperlinkMouseOver(hlink) {
  const attrs = {};
  if (hlink.id !== void 0) {
    attrs["r:id"] = hlink.id;
  }
  if (hlink.tooltip !== void 0) {
    attrs.tooltip = hlink.tooltip;
  }
  if (hlink.action !== void 0) {
    attrs.action = hlink.action;
  }
  if (hlink.highlightClick !== void 0) {
    attrs.highlightClick = ooxmlBool(hlink.highlightClick);
  }
  if (hlink.endSound !== void 0) {
    attrs.endSnd = ooxmlBool(hlink.endSound);
  }
  const children2 = [];
  if (hlink.sound) {
    children2.push(serializeHyperlinkSound(hlink.sound));
  }
  return createElement("a:hlinkMouseOver", attrs, children2);
}
function serializeBullet(bullet) {
  switch (bullet.type) {
    case "none":
      return createElement("a:buNone");
    case "auto": {
      const attrs = { type: bullet.scheme };
      if (bullet.startAt !== void 0) {
        attrs.startAt = String(bullet.startAt);
      }
      return createElement("a:buAutoNum", attrs);
    }
    case "char":
      return createElement("a:buChar", { char: bullet.char });
    case "blip":
      return createElement("a:buBlip", {}, [createElement("a:blip", { "r:embed": bullet.resourceId })]);
  }
}
function serializeBulletStyle(style) {
  const elements = [];
  elements.push(serializeBullet(style.bullet));
  if (style.colorFollowText) {
    elements.push(createElement("a:buClrTx"));
  } else if (style.color) {
    elements.push(createElement("a:buClr", {}, [serializeColor2(style.color)]));
  }
  if (style.sizeFollowText) {
    elements.push(createElement("a:buSzTx"));
  } else if (style.sizePercent !== void 0) {
    elements.push(createElement("a:buSzPct", { val: ooxmlPercent1000(style.sizePercent) }));
  } else if (style.sizePoints !== void 0) {
    elements.push(createElement("a:buSzPts", { val: ooxmlCentipoints(style.sizePoints) }));
  }
  if (style.fontFollowText) {
    elements.push(createElement("a:buFontTx"));
  } else if (style.font !== void 0) {
    elements.push(createElement("a:buFont", { typeface: style.font }));
  }
  return elements;
}
function renameElement(element, name) {
  return { ...element, name };
}
function serializeRunPropertiesElement(props, elementName) {
  const attrs = {};
  if (props.language !== void 0) {
    attrs.lang = props.language;
  }
  if (props.altLanguage !== void 0) {
    attrs.altLang = props.altLanguage;
  }
  if (props.bookmark !== void 0) {
    attrs.bmk = props.bookmark;
  }
  if (props.fontSize !== void 0) {
    attrs.sz = ooxmlCentipoints(props.fontSize);
  }
  if (props.bold !== void 0) {
    attrs.b = ooxmlBool(props.bold);
  }
  if (props.italic !== void 0) {
    attrs.i = ooxmlBool(props.italic);
  }
  if (props.underline !== void 0) {
    attrs.u = props.underline;
  }
  if (props.strike !== void 0) {
    attrs.strike = props.strike;
  }
  if (props.caps !== void 0) {
    attrs.cap = props.caps;
  }
  if (props.baseline !== void 0) {
    attrs.baseline = String(Math.round(props.baseline));
  }
  if (props.spacing !== void 0) {
    attrs.spc = ooxmlTextPointUnqualified(props.spacing);
  }
  if (props.kerning !== void 0) {
    attrs.kern = ooxmlCentipoints(props.kerning);
  }
  if (props.noProof !== void 0) {
    attrs.noProof = ooxmlBool(props.noProof);
  }
  if (props.dirty !== void 0) {
    attrs.dirty = ooxmlBool(props.dirty);
  }
  if (props.smartTagClean !== void 0) {
    attrs.smtClean = ooxmlBool(props.smartTagClean);
  }
  if (props.error !== void 0) {
    attrs.err = ooxmlBool(props.error);
  }
  if (props.kumimoji !== void 0) {
    attrs.kumimoji = ooxmlBool(props.kumimoji);
  }
  if (props.normalizeHeights !== void 0) {
    attrs.normalizeH = ooxmlBool(props.normalizeHeights);
  }
  if (props.smartTagId !== void 0) {
    attrs.smtId = String(Math.round(props.smartTagId));
  }
  if (props.outline !== void 0) {
    attrs.outline = ooxmlBool(props.outline);
  }
  if (props.shadow !== void 0) {
    attrs.shadow = ooxmlBool(props.shadow);
  }
  if (props.emboss !== void 0) {
    attrs.emboss = ooxmlBool(props.emboss);
  }
  const children2 = [];
  if (props.fill !== void 0) {
    children2.push(serializeFill(props.fill));
  } else if (props.color !== void 0) {
    children2.push(createElement("a:solidFill", {}, [serializeColor2(props.color)]));
  }
  if (props.highlightColor !== void 0) {
    children2.push(createElement("a:highlight", {}, [serializeColor2(props.highlightColor)]));
  }
  if (props.underlineLineFollowText === true) {
    children2.push(createElement("a:uLnTx"));
  }
  if (props.underlineFillFollowText === true) {
    children2.push(createElement("a:uFillTx"));
  }
  if (props.underlineLine !== void 0) {
    children2.push(renameElement(serializeLine(props.underlineLine), "a:uLn"));
  }
  if (props.underlineFill !== void 0) {
    children2.push(createElement("a:uFill", {}, [serializeFill(props.underlineFill)]));
  }
  if (props.underlineColor !== void 0 && props.underlineLine === void 0) {
    children2.push(
      createElement("a:uLn", {}, [createElement("a:solidFill", {}, [serializeColor2(props.underlineColor)])])
    );
  }
  if (props.textOutline !== void 0) {
    children2.push(serializeLine(props.textOutline));
  }
  if (props.effects !== void 0) {
    const effectEl = serializeEffects(props.effects);
    if (effectEl) {
      children2.push(effectEl);
    }
  }
  if (props.fontFamily !== void 0) {
    const attrs2 = { typeface: props.fontFamily };
    if (props.fontFamilyPitchFamily !== void 0) {
      attrs2.pitchFamily = String(props.fontFamilyPitchFamily);
    }
    children2.push(createElement("a:latin", attrs2));
  }
  if (props.fontFamilyEastAsian !== void 0) {
    const attrs2 = { typeface: props.fontFamilyEastAsian };
    if (props.fontFamilyEastAsianPitchFamily !== void 0) {
      attrs2.pitchFamily = String(props.fontFamilyEastAsianPitchFamily);
    }
    children2.push(createElement("a:ea", attrs2));
  }
  if (props.fontFamilyComplexScript !== void 0) {
    const attrs2 = { typeface: props.fontFamilyComplexScript };
    if (props.fontFamilyComplexScriptPitchFamily !== void 0) {
      attrs2.pitchFamily = String(props.fontFamilyComplexScriptPitchFamily);
    }
    children2.push(createElement("a:cs", attrs2));
  }
  if (props.fontFamilySymbol !== void 0) {
    const attrs2 = { typeface: props.fontFamilySymbol };
    if (props.fontFamilySymbolPitchFamily !== void 0) {
      attrs2.pitchFamily = String(props.fontFamilySymbolPitchFamily);
    }
    children2.push(createElement("a:sym", attrs2));
  }
  if (props.hyperlink) {
    children2.push(serializeHyperlink2(props.hyperlink));
  }
  if (props.hyperlinkMouseOver) {
    children2.push(serializeHyperlinkMouseOver(props.hyperlinkMouseOver));
  }
  if (props.rtl === true) {
    children2.push(createElement("a:rtl"));
  }
  return createElement(elementName, attrs, children2);
}
function serializeRunProperties2(props) {
  return serializeRunPropertiesElement(props, "a:rPr");
}
function serializeBodyProperties(props) {
  if (props.textWarp !== void 0) {
    throw new Error("a:bodyPr serialization does not support textWarp yet");
  }
  if (props.scene3d !== void 0 || props.shape3d !== void 0) {
    throw new Error("a:bodyPr serialization does not support 3D text properties yet");
  }
  const attrs = {};
  if (props.rotation !== void 0) {
    attrs.rot = ooxmlAngleUnits(props.rotation);
  }
  if (props.verticalType !== void 0) {
    attrs.vert = props.verticalType;
  }
  if (props.wrapping !== void 0) {
    attrs.wrap = props.wrapping;
  }
  if (props.anchor !== void 0) {
    attrs.anchor = serializeBodyAnchor(props.anchor);
  }
  if (props.anchorCenter !== void 0) {
    attrs.anchorCtr = ooxmlBool(props.anchorCenter);
  }
  if (props.overflow !== void 0) {
    attrs.horzOverflow = props.overflow;
  }
  if (props.verticalOverflow !== void 0) {
    attrs.vertOverflow = props.verticalOverflow;
  }
  if (props.insets) {
    attrs.lIns = ooxmlEmu(props.insets.left);
    attrs.tIns = ooxmlEmu(props.insets.top);
    attrs.rIns = ooxmlEmu(props.insets.right);
    attrs.bIns = ooxmlEmu(props.insets.bottom);
  }
  if (props.columns !== void 0) {
    attrs.numCol = String(Math.round(props.columns));
  }
  if (props.columnSpacing !== void 0) {
    attrs.spcCol = ooxmlEmu(props.columnSpacing);
  }
  if (props.upright !== void 0) {
    attrs.upright = ooxmlBool(props.upright);
  }
  if (props.compatibleLineSpacing !== void 0) {
    attrs.compatLnSpc = ooxmlBool(props.compatibleLineSpacing);
  }
  if (props.rtlColumns !== void 0) {
    attrs.rtlCol = ooxmlBool(props.rtlColumns);
  }
  if (props.spaceFirstLastPara !== void 0) {
    attrs.spcFirstLastPara = ooxmlBool(props.spaceFirstLastPara);
  }
  if (props.forceAntiAlias !== void 0) {
    attrs.forceAA = ooxmlBool(props.forceAntiAlias);
  }
  if (props.fromWordArt !== void 0) {
    attrs.fromWordArt = ooxmlBool(props.fromWordArt);
  }
  const children2 = [];
  if (props.autoFit) {
    switch (props.autoFit.type) {
      case "none":
        break;
      case "shape":
        children2.push(createElement("a:spAutoFit"));
        break;
      case "normal": {
        const autoFitAttrs = {};
        if (props.autoFit.fontScale !== void 0) {
          autoFitAttrs.fontScale = ooxmlPercent1000(props.autoFit.fontScale);
        }
        if (props.autoFit.lineSpaceReduction !== void 0) {
          autoFitAttrs.lnSpcReduction = ooxmlPercent1000(props.autoFit.lineSpaceReduction);
        }
        children2.push(createElement("a:normAutofit", autoFitAttrs));
        break;
      }
    }
  }
  return createElement("a:bodyPr", attrs, children2);
}
function serializeParagraphProperties2(props) {
  const attrs = {};
  if (props.level !== void 0) {
    attrs.lvl = String(Math.round(props.level));
  }
  if (props.alignment !== void 0) {
    attrs.algn = serializeParagraphAlignment(props.alignment);
  }
  if (props.defaultTabSize !== void 0) {
    attrs.defTabSz = ooxmlEmu(props.defaultTabSize);
  }
  if (props.marginLeft !== void 0) {
    attrs.marL = ooxmlEmu(props.marginLeft);
  }
  if (props.marginRight !== void 0) {
    attrs.marR = ooxmlEmu(props.marginRight);
  }
  if (props.indent !== void 0) {
    attrs.indent = ooxmlEmu(props.indent);
  }
  if (props.rtl !== void 0) {
    attrs.rtl = ooxmlBool(props.rtl);
  }
  if (props.fontAlignment !== void 0) {
    attrs.fontAlgn = serializeFontAlignment(props.fontAlignment);
  }
  if (props.eaLineBreak !== void 0) {
    attrs.eaLnBrk = ooxmlBool(props.eaLineBreak);
  }
  if (props.latinLineBreak !== void 0) {
    attrs.latinLnBrk = ooxmlBool(props.latinLineBreak);
  }
  if (props.hangingPunctuation !== void 0) {
    attrs.hangingPunct = ooxmlBool(props.hangingPunctuation);
  }
  const children2 = [];
  if (props.lineSpacing) {
    children2.push(serializeLineSpacing(props.lineSpacing, "a:lnSpc"));
  }
  if (props.spaceBefore) {
    children2.push(serializeLineSpacing(props.spaceBefore, "a:spcBef"));
  }
  if (props.spaceAfter) {
    children2.push(serializeLineSpacing(props.spaceAfter, "a:spcAft"));
  }
  if (props.bulletStyle) {
    children2.push(...serializeBulletStyle(props.bulletStyle));
  }
  if (props.tabStops && props.tabStops.length > 0) {
    children2.push(serializeTabStops2(props.tabStops));
  }
  if (props.defaultRunProperties) {
    children2.push(serializeRunPropertiesElement(props.defaultRunProperties, "a:defRPr"));
  }
  return createElement("a:pPr", attrs, children2);
}
function serializeEndParaRunProperties(props) {
  return serializeRunPropertiesElement(props, "a:endParaRPr");
}
function serializeText2(text) {
  const needsPreserve = /(^\s|\s$|\s{2,}|\t)/.test(text);
  const attrs = needsPreserve ? { "xml:space": "preserve" } : {};
  return createElement("a:t", attrs, [createText(text)]);
}
function serializeTextRun(run) {
  const children2 = [];
  if (run.properties) {
    children2.push(serializeRunProperties2(run.properties));
  }
  children2.push(serializeText2(run.text));
  return createElement("a:r", {}, children2);
}
function serializeLineBreak(lineBreak) {
  const children2 = [];
  if (lineBreak.properties) {
    children2.push(serializeRunProperties2(lineBreak.properties));
  }
  return createElement("a:br", {}, children2);
}
function serializeTextField(field) {
  const children2 = [];
  if (field.properties) {
    children2.push(serializeRunProperties2(field.properties));
  }
  children2.push(serializeText2(field.text));
  return createElement("a:fld", { id: field.id, type: field.fieldType }, children2);
}
function serializeRun2(run) {
  switch (run.type) {
    case "text":
      return serializeTextRun(run);
    case "break":
      return serializeLineBreak(run);
    case "field":
      return serializeTextField(run);
  }
}
function serializeParagraph2(paragraph) {
  const children2 = [];
  if (Object.keys(paragraph.properties).length > 0) {
    children2.push(serializeParagraphProperties2(paragraph.properties));
  }
  for (const run of paragraph.runs) {
    children2.push(serializeRun2(run));
  }
  if (paragraph.endProperties) {
    children2.push(serializeEndParaRunProperties(paragraph.endProperties));
  }
  return createElement("a:p", {}, children2);
}
function createEmptyParagraph() {
  return createElement("a:p");
}
function serializeTextBody(textBody) {
  const paragraphs = [];
  if (textBody.paragraphs.length > 0) {
    paragraphs.push(...textBody.paragraphs.map(serializeParagraph2));
  } else {
    paragraphs.push(createEmptyParagraph());
  }
  return createElement("p:txBody", {}, [
    serializeBodyProperties(textBody.bodyProperties),
    createElement("a:lstStyle"),
    ...paragraphs
  ]);
}
function serializeDrawingTextBody(textBody) {
  const paragraphs = [];
  if (textBody.paragraphs.length > 0) {
    paragraphs.push(...textBody.paragraphs.map(serializeParagraph2));
  } else {
    paragraphs.push(createEmptyParagraph());
  }
  return createElement("a:txBody", {}, [
    serializeBodyProperties(textBody.bodyProperties),
    createElement("a:lstStyle"),
    ...paragraphs
  ]);
}
function patchTextBodyElement(existingTxBody, textBody) {
  const existingBodyPr = existingTxBody.children.find((c) => isXmlElement(c) && c.name === "a:bodyPr");
  const existingLstStyle = existingTxBody.children.find(
    (c) => isXmlElement(c) && c.name === "a:lstStyle"
  );
  const otherChildren = existingTxBody.children.filter((c) => {
    if (!isXmlElement(c)) {
      return true;
    }
    return c.name !== "a:bodyPr" && c.name !== "a:lstStyle" && c.name !== "a:p";
  });
  const paragraphs = [];
  if (textBody.paragraphs.length > 0) {
    paragraphs.push(...textBody.paragraphs.map(serializeParagraph2));
  } else {
    paragraphs.push(createEmptyParagraph());
  }
  return createElement(existingTxBody.name, { ...existingTxBody.attrs }, [
    existingBodyPr ?? serializeBodyProperties(textBody.bodyProperties),
    existingLstStyle ?? createElement("a:lstStyle"),
    ...paragraphs,
    ...otherChildren
  ]);
}
function serializeTableProperties2(props) {
  const attrs = {};
  if (props.rtl !== void 0) {
    attrs.rtl = ooxmlBool(props.rtl);
  }
  if (props.firstRow !== void 0) {
    attrs.firstRow = ooxmlBool(props.firstRow);
  }
  if (props.firstCol !== void 0) {
    attrs.firstCol = ooxmlBool(props.firstCol);
  }
  if (props.lastRow !== void 0) {
    attrs.lastRow = ooxmlBool(props.lastRow);
  }
  if (props.lastCol !== void 0) {
    attrs.lastCol = ooxmlBool(props.lastCol);
  }
  if (props.bandRow !== void 0) {
    attrs.bandRow = ooxmlBool(props.bandRow);
  }
  if (props.bandCol !== void 0) {
    attrs.bandCol = ooxmlBool(props.bandCol);
  }
  const children2 = [];
  if (props.fill) {
    children2.push(serializeFill(props.fill));
  }
  if (props.effects) {
    const eff = serializeEffects(props.effects);
    if (eff) {
      children2.push(eff);
    }
  }
  if (props.tableStyleId) {
    children2.push(createElement("a:tableStyleId", {}, [{ type: "text", value: props.tableStyleId }]));
  }
  return createElement("a:tblPr", attrs, children2);
}
function serializeCellAnchor(anchor) {
  if (!anchor) {
    return void 0;
  }
  if (anchor === "top") {
    return "t";
  }
  if (anchor === "center") {
    return "ctr";
  }
  return "b";
}
function serializeCellBorders2(borders) {
  const out = [];
  const withName = (name, line) => {
    const base = serializeLine(line);
    return createElement(name, base.attrs, base.children);
  };
  if (borders.left) {
    out.push(withName("a:lnL", borders.left));
  }
  if (borders.right) {
    out.push(withName("a:lnR", borders.right));
  }
  if (borders.top) {
    out.push(withName("a:lnT", borders.top));
  }
  if (borders.bottom) {
    out.push(withName("a:lnB", borders.bottom));
  }
  if (borders.tlToBr) {
    out.push(withName("a:lnTlToBr", borders.tlToBr));
  }
  if (borders.blToTr) {
    out.push(withName("a:lnBlToTr", borders.blToTr));
  }
  return out;
}
function serializeTableCellProperties2(props) {
  const attrs = {};
  if (props.margins) {
    attrs.marL = ooxmlEmu(props.margins.left);
    attrs.marR = ooxmlEmu(props.margins.right);
    attrs.marT = ooxmlEmu(props.margins.top);
    attrs.marB = ooxmlEmu(props.margins.bottom);
  }
  const anchor = serializeCellAnchor(props.anchor);
  if (anchor) {
    attrs.anchor = anchor;
  }
  if (props.anchorCenter !== void 0) {
    attrs.anchorCtr = ooxmlBool(props.anchorCenter);
  }
  if (props.horzOverflow) {
    attrs.horzOverflow = props.horzOverflow;
  }
  if (props.verticalType) {
    attrs.vert = props.verticalType;
  }
  if (props.rowSpan !== void 0) {
    attrs.rowSpan = String(props.rowSpan);
  }
  if (props.colSpan !== void 0) {
    attrs.gridSpan = String(props.colSpan);
  }
  if (props.horizontalMerge) {
    attrs.hMerge = "1";
  }
  if (props.verticalMerge) {
    attrs.vMerge = "1";
  }
  const children2 = [];
  if (props.borders) {
    children2.push(...serializeCellBorders2(props.borders));
  }
  if (props.fill) {
    children2.push(serializeFill(props.fill));
  }
  return createElement("a:tcPr", attrs, children2);
}
function createEmptyTxBody$1() {
  return createElement("a:txBody", {}, [createElement("a:bodyPr"), createElement("a:lstStyle"), createElement("a:p")]);
}
function serializeTableCell$1(cell) {
  const attrs = {};
  if (cell.id) {
    attrs.id = cell.id;
  }
  const txBody = cell.textBody ? serializeDrawingTextBody(cell.textBody) : createEmptyTxBody$1();
  const tcPr = serializeTableCellProperties2(cell.properties);
  return createElement("a:tc", attrs, [txBody, tcPr]);
}
function serializeDrawingTable(table) {
  const tblGrid = createElement(
    "a:tblGrid",
    {},
    table.grid.columns.map((c) => createElement("a:gridCol", { w: ooxmlEmu(c.width) }))
  );
  const rows = table.rows.map((r) => createElement("a:tr", { h: ooxmlEmu(r.height) }, r.cells.map(serializeTableCell$1)));
  return createElement("a:tbl", {}, [serializeTableProperties2(table.properties), tblGrid, ...rows]);
}
function booleanAttr(value) {
  return value ? "1" : "0";
}
function durationToSpeed(durationMs) {
  if (durationMs >= 1500) {
    return "slow";
  }
  if (durationMs >= 750) {
    return "med";
  }
  return "fast";
}
var DIRECTION_EIGHT_TYPES = ["wipe", "push", "cover", "pull", "strips"];
var ORIENTATION_TYPES = ["blinds", "checker", "comb", "randomBar"];
var SPOKES_TYPES = ["wheel"];
var IN_OUT_TYPES = ["split", "zoom"];
function serializeTransitionTypeElement(transition) {
  const { type, direction, orientation, spokes, inOutDirection } = transition;
  const attrs = {};
  const usesDir8 = DIRECTION_EIGHT_TYPES.includes(type);
  const usesOrientation = ORIENTATION_TYPES.includes(type);
  const usesSpokes = SPOKES_TYPES.includes(type);
  const usesInOut = IN_OUT_TYPES.includes(type);
  if (direction !== void 0 && !usesDir8) {
    throw new Error(`serializeTransitionTypeElement: direction is not supported for transition type "${type}"`);
  }
  if (orientation !== void 0 && !usesOrientation) {
    throw new Error(`serializeTransitionTypeElement: orientation is not supported for transition type "${type}"`);
  }
  if (spokes !== void 0 && !usesSpokes) {
    throw new Error(`serializeTransitionTypeElement: spokes is not supported for transition type "${type}"`);
  }
  if (inOutDirection !== void 0 && !usesInOut) {
    throw new Error(`serializeTransitionTypeElement: inOutDirection is not supported for transition type "${type}"`);
  }
  if (usesDir8 && direction !== void 0) {
    attrs.dir = direction;
  }
  if (usesOrientation && orientation !== void 0) {
    attrs.dir = orientation;
  }
  if (usesSpokes && spokes !== void 0) {
    attrs.spkCnt = `${spokes}`;
  }
  if (usesInOut && inOutDirection !== void 0) {
    attrs.dir = inOutDirection;
  }
  return createElement(`p:${type}`, attrs);
}
function serializeSlideTransition(transition) {
  if (transition.type === "none") {
    return null;
  }
  const attrs = {};
  if (transition.duration !== void 0) {
    attrs.spd = durationToSpeed(transition.duration);
  }
  if (transition.advanceOnClick !== void 0) {
    attrs.advClick = booleanAttr(transition.advanceOnClick);
  }
  if (transition.advanceAfter !== void 0) {
    attrs.advTm = `${transition.advanceAfter}`;
  }
  const typeEl = serializeTransitionTypeElement(transition);
  return createElement("p:transition", attrs, [typeEl]);
}
function boolAttr(value) {
  return value ? "1" : "0";
}
function timeValue(time) {
  return time === "indefinite" ? "indefinite" : String(time);
}
function serializeShapeTarget(target) {
  const children2 = [];
  if (target.textElement) {
    if (target.textElement.type === "paragraph") {
      children2.push(
        createElement("p:txEl", {}, [
          createElement("p:pRg", {
            st: String(target.textElement.start),
            end: String(target.textElement.end)
          })
        ])
      );
    } else {
      children2.push(
        createElement("p:txEl", {}, [
          createElement("p:charRg", {
            st: String(target.textElement.start),
            end: String(target.textElement.end)
          })
        ])
      );
    }
  }
  if (target.targetBackground) {
    children2.push(createElement("p:bg"));
  }
  return createElement("p:spTgt", { spid: String(target.shapeId) }, children2);
}
function serializeTarget(target) {
  switch (target.type) {
    case "shape":
      return createElement("p:tgtEl", {}, [serializeShapeTarget(target)]);
    case "slide":
      return createElement("p:tgtEl", {}, [createElement("p:sldTgt")]);
    case "sound":
      return createElement("p:tgtEl", {}, [
        createElement("p:sndTgt", { "r:embed": target.resourceId, name: target.name ?? "" })
      ]);
    case "ink":
      return createElement("p:tgtEl", {}, [createElement("p:inkTgt", { spid: String(target.shapeId) })]);
  }
}
function serializeCondition(cond) {
  const attrs = {};
  if (cond.delay !== void 0) {
    attrs.delay = timeValue(cond.delay);
  }
  if (cond.event !== void 0) {
    attrs.evt = cond.event;
  }
  const children2 = [];
  if (cond.target) {
    children2.push(serializeTarget(cond.target));
  }
  if (cond.timeNodeRef !== void 0) {
    children2.push(createElement("p:tn", { val: String(cond.timeNodeRef) }));
  }
  if (cond.runtimeNode !== void 0) {
    children2.push(createElement("p:rtn", { val: cond.runtimeNode }));
  }
  return createElement("p:cond", attrs, children2);
}
function serializeConditionList(conditions, wrapper) {
  return createElement(wrapper, {}, conditions.map(serializeCondition));
}
function serializeKeyframe(kf) {
  const attrs = {
    tm: kf.time === "indefinite" ? "indefinite" : String(kf.time)
  };
  if (kf.formula) {
    attrs.fmla = kf.formula;
  }
  const valEl2 = createElement("p:val", {}, [createElement("p:strVal", { val: String(kf.value) })]);
  return createElement("p:tav", attrs, [valEl2]);
}
function serializePreset(preset, attrs) {
  attrs.presetID = String(preset.id);
  attrs.presetClass = preset.class;
  if (preset.subtype !== void 0) {
    attrs.presetSubtype = String(preset.subtype);
  }
}
function serializeCommonTimeNode(node) {
  const attrs = {
    id: String(node.id)
  };
  if (node.duration !== void 0) {
    attrs.dur = timeValue(node.duration);
  }
  if (node.fill !== void 0) {
    attrs.fill = node.fill;
  }
  if (node.restart !== void 0) {
    attrs.restart = node.restart;
  }
  if (node.nodeType !== void 0) {
    attrs.nodeType = node.nodeType;
  }
  if (node.preset !== void 0) {
    serializePreset(node.preset, attrs);
  }
  if (node.acceleration !== void 0) {
    attrs.accel = String(node.acceleration * 1e3);
  }
  if (node.deceleration !== void 0) {
    attrs.decel = String(node.deceleration * 1e3);
  }
  if (node.autoReverse !== void 0) {
    attrs.autoRev = boolAttr(node.autoReverse);
  }
  if (node.repeatCount !== void 0) {
    attrs.repeatCount = node.repeatCount === "indefinite" ? "indefinite" : String(node.repeatCount);
  }
  if (node.speed !== void 0) {
    attrs.spd = String(node.speed * 1e3);
  }
  const children2 = [];
  if (node.startConditions && node.startConditions.length > 0) {
    children2.push(serializeConditionList(node.startConditions, "p:stCondLst"));
  }
  if (node.endConditions && node.endConditions.length > 0) {
    children2.push(serializeConditionList(node.endConditions, "p:endCondLst"));
  }
  if ("children" in node && node.children.length > 0) {
    children2.push(createElement("p:childTnLst", {}, node.children.map(serializeTimeNode)));
  }
  return createElement("p:cTn", attrs, children2);
}
function serializeCommonBehavior(node) {
  const attrs = {};
  if ("attribute" in node && node.attribute) {
    attrs.attrName = node.attribute;
  }
  if ("additive" in node && node.additive !== void 0) {
    attrs.additive = node.additive;
  }
  if (node.accumulate !== void 0) {
    attrs.accumulate = node.accumulate;
  }
  if (node.transformType !== void 0) {
    attrs.xfrmType = node.transformType;
  }
  const children2 = [serializeCommonTimeNode(node)];
  children2.push(serializeTarget(node.target));
  if ("attribute" in node && node.attribute) {
    children2.push(
      createElement("p:attrNameLst", {}, [createElement("p:attrName", {}, [{ type: "text", value: node.attribute }])])
    );
  }
  return createElement("p:cBhvr", attrs, children2);
}
function serializeAnimateBehavior(node) {
  const attrs = {};
  if (node.calcMode !== void 0) {
    attrs.calcmode = node.calcMode;
  }
  if (node.valueType !== void 0) {
    attrs.valueType = node.valueType;
  }
  const children2 = [serializeCommonBehavior(node)];
  if (node.keyframes && node.keyframes.length > 0) {
    children2.push(createElement("p:tavLst", {}, node.keyframes.map(serializeKeyframe)));
  }
  return createElement("p:anim", attrs, children2);
}
function serializeSetBehavior(node) {
  const children2 = [serializeCommonBehavior(node)];
  children2.push(createElement("p:to", {}, [createElement("p:strVal", { val: String(node.value) })]));
  return createElement("p:set", {}, children2);
}
function serializeAnimateEffectBehavior(node) {
  const attrs = {
    transition: node.transition,
    filter: node.filter
  };
  const children2 = [serializeCommonBehavior(node)];
  return createElement("p:animEffect", attrs, children2);
}
function serializeAnimateMotionBehavior(node) {
  const attrs = {};
  if (node.origin !== void 0) {
    attrs.origin = node.origin;
  }
  if (node.path !== void 0) {
    attrs.path = node.path;
  }
  if (node.pathEditMode !== void 0) {
    attrs.pathEditMode = node.pathEditMode;
  }
  const children2 = [serializeCommonBehavior(node)];
  if (node.from !== void 0) {
    children2.push(createElement("p:from", { x: String(node.from.x), y: String(node.from.y) }));
  }
  if (node.to !== void 0) {
    children2.push(createElement("p:to", { x: String(node.to.x), y: String(node.to.y) }));
  }
  if (node.by !== void 0) {
    children2.push(createElement("p:by", { x: String(node.by.x), y: String(node.by.y) }));
  }
  if (node.rotationCenter !== void 0) {
    children2.push(createElement("p:rCtr", { x: String(node.rotationCenter.x), y: String(node.rotationCenter.y) }));
  }
  return createElement("p:animMotion", attrs, children2);
}
function serializeAnimateColorBehavior(node) {
  const attrs = {};
  if (node.colorSpace !== void 0) {
    attrs.clrSpc = node.colorSpace;
  }
  if (node.direction !== void 0) {
    attrs.dir = node.direction;
  }
  const children2 = [serializeCommonBehavior(node)];
  if (node.from !== void 0) {
    children2.push(createElement("p:from", {}, [serializeColor2({ spec: { type: "srgb", value: node.from } })]));
  }
  if (node.to !== void 0) {
    children2.push(createElement("p:to", {}, [serializeColor2({ spec: { type: "srgb", value: node.to } })]));
  }
  if (node.by !== void 0) {
    children2.push(createElement("p:by", {}, [serializeColor2({ spec: { type: "srgb", value: node.by } })]));
  }
  return createElement("p:animClr", attrs, children2);
}
function serializeAnimateScaleBehavior(node) {
  const children2 = [serializeCommonBehavior(node)];
  if (node.fromX !== void 0 && node.fromY !== void 0) {
    children2.push(createElement("p:from", { x: String(node.fromX * 1e3), y: String(node.fromY * 1e3) }));
  }
  if (node.toX !== void 0 && node.toY !== void 0) {
    children2.push(createElement("p:to", { x: String(node.toX * 1e3), y: String(node.toY * 1e3) }));
  }
  if (node.byX !== void 0 && node.byY !== void 0) {
    children2.push(createElement("p:by", { x: String(node.byX * 1e3), y: String(node.byY * 1e3) }));
  }
  return createElement("p:animScale", {}, children2);
}
function serializeAnimateRotationBehavior(node) {
  const attrs = {};
  if (node.from !== void 0) {
    attrs.from = String(node.from * 6e4);
  }
  if (node.to !== void 0) {
    attrs.to = String(node.to * 6e4);
  }
  if (node.by !== void 0) {
    attrs.by = String(node.by * 6e4);
  }
  const children2 = [serializeCommonBehavior(node)];
  return createElement("p:animRot", attrs, children2);
}
function serializeTimeNode(node) {
  switch (node.type) {
    case "parallel":
      return serializeParallelNode(node);
    case "sequence":
      return serializeSequenceNode(node);
    case "exclusive":
      return createElement("p:excl", {}, [serializeCommonTimeNode(node)]);
    case "animate":
      return serializeAnimateBehavior(node);
    case "set":
      return serializeSetBehavior(node);
    case "animateEffect":
      return serializeAnimateEffectBehavior(node);
    case "animateMotion":
      return serializeAnimateMotionBehavior(node);
    case "animateColor":
      return serializeAnimateColorBehavior(node);
    case "animateScale":
      return serializeAnimateScaleBehavior(node);
    case "animateRotation":
      return serializeAnimateRotationBehavior(node);
    case "audio":
      return createElement("p:audio", {}, [serializeCommonTimeNode(node), serializeTarget(node.target)]);
    case "video":
      return createElement("p:video", { fullScrn: node.fullscreen ? "1" : "0" }, [
        serializeCommonTimeNode(node),
        serializeTarget(node.target)
      ]);
    case "command":
      return createElement("p:cmd", { type: node.commandType, cmd: node.command }, [
        serializeCommonTimeNode(node),
        serializeTarget(node.target)
      ]);
  }
}
function serializeParallelNode(node) {
  return createElement("p:par", {}, [serializeCommonTimeNode(node)]);
}
function serializeSequenceNode(node) {
  const attrs = {};
  if (node.concurrent !== void 0) {
    attrs.concurrent = boolAttr(node.concurrent);
  }
  if (node.nextAction !== void 0) {
    attrs.nextAc = node.nextAction;
  }
  if (node.prevAction !== void 0) {
    attrs.prevAc = node.prevAction;
  }
  const children2 = [serializeCommonTimeNode(node)];
  if (node.prevConditions && node.prevConditions.length > 0) {
    children2.push(serializeConditionList(node.prevConditions, "p:prevCondLst"));
  }
  if (node.nextConditions && node.nextConditions.length > 0) {
    children2.push(serializeConditionList(node.nextConditions, "p:nextCondLst"));
  }
  return createElement("p:seq", attrs, children2);
}
function serializeBuildEntry(entry) {
  const attrs = {
    spid: String(entry.shapeId)
  };
  if (entry.groupId !== void 0) {
    attrs.grpId = String(entry.groupId);
  }
  if (entry.buildType !== void 0) {
    attrs.build = entry.buildType;
  }
  if (entry.animateBackground !== void 0) {
    attrs.animBg = boolAttr(entry.animateBackground);
  }
  if (entry.reverse !== void 0) {
    attrs.rev = boolAttr(entry.reverse);
  }
  if (entry.advanceAfter !== void 0) {
    attrs.advAuto = timeValue(entry.advanceAfter);
  }
  if (entry.uiExpand !== void 0) {
    attrs.uiExpand = boolAttr(entry.uiExpand);
  }
  return createElement("p:bldP", attrs);
}
function serializeTiming(timing) {
  if (!timing.rootTimeNode && !timing.buildList) {
    return null;
  }
  const children2 = [];
  if (timing.rootTimeNode) {
    children2.push(createElement("p:tnLst", {}, [serializeTimeNode(timing.rootTimeNode)]));
  }
  if (timing.buildList && timing.buildList.length > 0) {
    children2.push(createElement("p:bldLst", {}, timing.buildList.map(serializeBuildEntry)));
  }
  return createElement("p:timing", {}, children2);
}
var P_NS$1 = "http://schemas.openxmlformats.org/presentationml/2006/main";
function serializeCommentPosition(position) {
  return createElement("p:pos", {
    x: String(Math.round(position.x * 914400)),
    // Convert pixels to EMUs
    y: String(Math.round(position.y * 914400))
  });
}
function serializeComment(comment) {
  const attrs = {};
  if (comment.authorId !== void 0) {
    attrs.authorId = String(comment.authorId);
  }
  if (comment.dateTime !== void 0) {
    attrs.dt = comment.dateTime;
  }
  if (comment.idx !== void 0) {
    attrs.idx = String(comment.idx);
  }
  const children2 = [];
  if (comment.position) {
    children2.push(serializeCommentPosition(comment.position));
  }
  if (comment.text) {
    children2.push(createElement("p:text", {}, [{ type: "text", value: comment.text }]));
  }
  return createElement("p:cm", attrs, children2);
}
function serializeCommentList(commentList) {
  return createElement("p:cmLst", { "xmlns:p": P_NS$1 }, commentList.comments.map(serializeComment));
}
function createCommentListDocument(comments) {
  return {
    children: [serializeCommentList({ comments })]
  };
}
function serializeCommentAuthor(author) {
  const attrs = {
    id: String(author.id)
  };
  if (author.name !== void 0) {
    attrs.name = author.name;
  }
  if (author.initials !== void 0) {
    attrs.initials = author.initials;
  }
  if (author.lastIdx !== void 0) {
    attrs.lastIdx = String(author.lastIdx);
  }
  if (author.colorIndex !== void 0) {
    attrs.clrIdx = String(author.colorIndex);
  }
  return createElement("p:cmAuthor", attrs);
}
function serializeCommentAuthorList(authorList) {
  return createElement("p:cmAuthorLst", { "xmlns:p": P_NS$1 }, authorList.authors.map(serializeCommentAuthor));
}
function createCommentAuthorListDocument(authors) {
  return {
    children: [serializeCommentAuthorList({ authors })]
  };
}
function resolveInsertIndex(spTree, afterId) {
  if (!afterId) {
    return spTree.children.length;
  }
  const index = findDirectChildShapeIndexById(spTree, afterId);
  if (index === -1) {
    return spTree.children.length;
  }
  return index + 1;
}
function addShapeToTree(spTree, shapeXml, afterId) {
  const shapeStartIndex = getShapesStartIndex(spTree);
  const insertIndex = resolveInsertIndex(spTree, afterId);
  return insertChildAt$1(spTree, shapeXml, Math.max(shapeStartIndex, insertIndex));
}
function getShapesStartIndex(container) {
  const first = container.children[0];
  const second = container.children[1];
  if (first && second && isXmlElement(first) && isXmlElement(second) && first.name === "p:nvGrpSpPr" && second.name === "p:grpSpPr") {
    return 2;
  }
  return 0;
}
function findDirectChildShapeIndexById(container, shapeId) {
  for (let i = 0; i < container.children.length; i++) {
    const child = container.children[i];
    if (!isXmlElement(child)) {
      continue;
    }
    if (!isDirectShapeElement(child)) {
      continue;
    }
    if (getNonVisualId(child) === shapeId) {
      return i;
    }
  }
  return -1;
}
function isDirectShapeElement(el) {
  return ["p:sp", "p:pic", "p:grpSp", "p:cxnSp", "p:graphicFrame"].includes(el.name);
}
function getNonVisualId(shapeEl) {
  const nvPrNames = ["p:nvSpPr", "p:nvPicPr", "p:nvGrpSpPr", "p:nvCxnSpPr", "p:nvGraphicFramePr"];
  for (const nvPrName of nvPrNames) {
    const nvPr = shapeEl.children.find((c) => isXmlElement(c) && c.name === nvPrName);
    if (!nvPr) {
      continue;
    }
    const cNvPr = nvPr.children.find((c) => isXmlElement(c) && c.name === "p:cNvPr");
    if (cNvPr?.attrs.id) {
      return cNvPr.attrs.id;
    }
    break;
  }
  return void 0;
}
function serializeShape2(shape) {
  switch (shape.type) {
    case "sp":
      return serializeSpShape(shape);
    case "grpSp":
      return serializeGroupShape2(shape);
    case "pic":
      return serializePicture2(shape);
    case "cxnSp":
      return serializeConnectionShape2(shape);
    case "graphicFrame":
      return serializeGraphicFrame(shape);
    case "contentPart":
      throw new Error("serializeShape: contentPart is not supported");
  }
}
function serializeGroupShape2(group) {
  const nvGrpSpPr = createElement("p:nvGrpSpPr", {}, [
    serializeCNvPr(group.nonVisual),
    serializeCNvGrpSpPr(group.nonVisual.groupLocks),
    createElement("p:nvPr")
  ]);
  const grpSpPrChildren = [serializeGroupTransformOrDefault(group.properties.transform)];
  if (group.properties.fill) {
    grpSpPrChildren.push(serializeFill(group.properties.fill));
  }
  const effects = group.properties.effects ? serializeEffects(group.properties.effects) : null;
  if (effects) {
    grpSpPrChildren.push(effects);
  }
  const grpSpPr = createElement("p:grpSpPr", {}, grpSpPrChildren);
  const children2 = group.children.map(serializeShape2);
  return createElement("p:grpSp", {}, [nvGrpSpPr, grpSpPr, ...children2]);
}
function serializePicture2(picture) {
  const nvPicPr = createElement("p:nvPicPr", {}, [
    serializeCNvPr(picture.nonVisual),
    serializeCNvPicPr(picture.nonVisual.preferRelativeResize, picture.nonVisual.pictureLocks),
    serializePictureNvPr(picture)
  ]);
  const blipFill = serializePictureBlipFill(picture.blipFill);
  const spPr = createElement("p:spPr", {}, [
    serializeTransformOrDefault(picture.properties.transform),
    createElement("a:prstGeom", { prst: "rect" }, [createElement("a:avLst")]),
    ...serializeShapeStyleElements(picture.properties)
  ]);
  const children2 = [nvPicPr, blipFill, spPr];
  const style = picture.style ? serializeShapeStyle(picture.style) : null;
  if (style) {
    children2.push(style);
  }
  return createElement("p:pic", {}, children2);
}
function serializePictureNvPr(picture) {
  const children2 = [];
  if (picture.mediaType === "video") {
    const video = picture.media?.videoFile;
    if (video?.link) {
      const attrs = { "r:link": video.link };
      if (video.contentType) {
        attrs.contentType = video.contentType;
      }
      children2.push(createElement("a:videoFile", attrs));
    }
    const qt = picture.media?.quickTimeFile;
    if (qt?.link) {
      children2.push(createElement("a:quickTimeFile", { "r:link": qt.link }));
    }
  }
  if (picture.mediaType === "audio") {
    const audio = picture.media?.audioFile;
    if (audio?.link) {
      const attrs = { "r:link": audio.link };
      if (audio.contentType) {
        attrs.contentType = audio.contentType;
      }
      children2.push(createElement("a:audioFile", attrs));
    }
    const wav = picture.media?.wavAudioFile;
    if (wav?.embed) {
      const attrs = { "r:embed": wav.embed };
      if (wav.name) {
        attrs.name = wav.name;
      }
      children2.push(createElement("a:wavAudioFile", attrs));
    }
  }
  return createElement("p:nvPr", {}, children2);
}
function serializeConnectionShape2(conn) {
  const cNvCxnSpPrChildren = [];
  if (conn.nonVisual.startConnection) {
    cNvCxnSpPrChildren.push(serializeConnectionTarget("a:stCxn", conn.nonVisual.startConnection));
  }
  if (conn.nonVisual.endConnection) {
    cNvCxnSpPrChildren.push(serializeConnectionTarget("a:endCxn", conn.nonVisual.endConnection));
  }
  const nvCxnSpPr = createElement("p:nvCxnSpPr", {}, [
    serializeCNvPr(conn.nonVisual),
    createElement("p:cNvCxnSpPr", {}, cNvCxnSpPrChildren),
    createElement("p:nvPr")
  ]);
  const geometryElement = serializeConnectionGeometryOrDefault(conn.properties.geometry);
  const spPr = createElement("p:spPr", {}, [
    serializeTransformOrDefault(conn.properties.transform),
    geometryElement,
    ...serializeShapeStyleElements(conn.properties)
  ]);
  const children2 = [nvCxnSpPr, spPr];
  const style = conn.style ? serializeShapeStyle(conn.style) : null;
  if (style) {
    children2.push(style);
  }
  return createElement("p:cxnSp", {}, children2);
}
function serializeConnectionGeometryOrDefault(geometry) {
  if (geometry) {
    return serializeGeometry(geometry);
  }
  return createElement("a:prstGeom", { prst: "line" }, [createElement("a:avLst")]);
}
function serializeSpShape(shape) {
  const nvSpPr = createElement("p:nvSpPr", {}, [
    serializeCNvPr(shape.nonVisual),
    serializeCNvSpPr(shape.nonVisual.textBox, shape.nonVisual.shapeLocks),
    serializeNvPr(shape.placeholder)
  ]);
  const spPrChildren = [];
  if (shape.properties.transform) {
    spPrChildren.push(serializeTransform(shape.properties.transform));
  }
  if (shape.properties.geometry) {
    spPrChildren.push(serializeGeometry(shape.properties.geometry));
  } else {
    spPrChildren.push(createElement("a:prstGeom", { prst: "rect" }, [createElement("a:avLst")]));
  }
  spPrChildren.push(...serializeShapeStyleElements(shape.properties));
  const spPr = createElement("p:spPr", {}, spPrChildren);
  const children2 = [nvSpPr, spPr];
  const style = shape.style ? serializeShapeStyle(shape.style) : null;
  if (style) {
    children2.push(style);
  }
  if (shape.textBody) {
    children2.push(serializeTextBody(shape.textBody));
  }
  return createElement("p:sp", {}, children2);
}
function serializeCNvPr(nonVisual) {
  const attrs = {
    id: nonVisual.id,
    name: nonVisual.name
  };
  if (nonVisual.description) {
    attrs.descr = nonVisual.description;
  }
  if (nonVisual.title) {
    attrs.title = nonVisual.title;
  }
  if (nonVisual.hidden !== void 0) {
    attrs.hidden = nonVisual.hidden ? "1" : "0";
  }
  const children2 = [];
  const hlinkClick = serializeNonVisualHyperlink("a:hlinkClick", nonVisual.hyperlink);
  if (hlinkClick) {
    children2.push(hlinkClick);
  }
  const hlinkHover = serializeNonVisualHyperlink("a:hlinkHover", nonVisual.hyperlinkHover);
  if (hlinkHover) {
    children2.push(hlinkHover);
  }
  return createElement("p:cNvPr", attrs, children2);
}
function serializeNonVisualHyperlink(name, hyperlink) {
  if (!hyperlink) {
    return null;
  }
  const attrs = { "r:id": hyperlink.id };
  if (hyperlink.tooltip !== void 0) {
    attrs.tooltip = hyperlink.tooltip;
  }
  if (hyperlink.action !== void 0) {
    attrs.action = hyperlink.action;
  }
  const children2 = [];
  if (hyperlink.sound) {
    const soundAttrs = { "r:embed": hyperlink.sound.embed };
    if (hyperlink.sound.name) {
      soundAttrs.name = hyperlink.sound.name;
    }
    children2.push(createElement("a:snd", soundAttrs));
  }
  return createElement(name, attrs, children2);
}
function serializeCNvSpPr(textBox, shapeLocks) {
  const attrs = {};
  if (textBox !== void 0) {
    attrs.txBox = ooxmlBool(textBox);
  }
  const children2 = [];
  const locks = serializeLocksElement("a:spLocks", shapeLocks);
  if (locks) {
    children2.push(locks);
  }
  return createElement("p:cNvSpPr", attrs, children2);
}
function serializeCNvGrpSpPr(groupLocks) {
  const children2 = [];
  const locks = serializeLocksElement("a:grpSpLocks", groupLocks);
  if (locks) {
    children2.push(locks);
  }
  return createElement("p:cNvGrpSpPr", {}, children2);
}
function serializeCNvPicPr(preferRelativeResize, pictureLocks) {
  const attrs = {};
  if (preferRelativeResize !== void 0) {
    attrs.preferRelativeResize = ooxmlBool(preferRelativeResize);
  }
  const children2 = [];
  const locks = serializeLocksElement("a:picLocks", pictureLocks);
  if (locks) {
    children2.push(locks);
  }
  return createElement("p:cNvPicPr", attrs, children2);
}
function serializeLocksElement(name, locks) {
  if (!locks) {
    return null;
  }
  const attrs = {};
  for (const [key, value] of Object.entries(locks)) {
    if (value === void 0) {
      continue;
    }
    attrs[key] = ooxmlBool(value);
  }
  if (Object.keys(attrs).length === 0) {
    return null;
  }
  return createElement(name, attrs);
}
function serializePictureBlipFill(blipFill) {
  if (!blipFill.resourceId) {
    throw new Error("serializePictureBlipFill: blipFill.resourceId is required");
  }
  if (blipFill.resourceId.startsWith("data:")) {
    throw new Error("serializePictureBlipFill: data: resourceId requires Phase 7 media embedding");
  }
  const attrs = {};
  if (blipFill.rotateWithShape !== void 0) {
    attrs.rotWithShape = ooxmlBool(blipFill.rotateWithShape);
  }
  if (blipFill.dpi !== void 0) {
    attrs.dpi = String(blipFill.dpi);
  }
  const blipAttrs = { "r:embed": blipFill.resourceId };
  if (blipFill.compressionState) {
    blipAttrs.cstate = blipFill.compressionState;
  }
  const blipChildren = blipFill.blipEffects ? serializeBlipEffects(blipFill.blipEffects) : [];
  const children2 = [createElement("a:blip", blipAttrs, blipChildren)];
  if (blipFill.sourceRect) {
    children2.push(
      createElement("a:srcRect", {
        l: ooxmlPercent100k(blipFill.sourceRect.left),
        t: ooxmlPercent100k(blipFill.sourceRect.top),
        r: ooxmlPercent100k(blipFill.sourceRect.right),
        b: ooxmlPercent100k(blipFill.sourceRect.bottom)
      })
    );
  }
  if (blipFill.tile) {
    children2.push(
      createElement("a:tile", {
        tx: ooxmlEmu(blipFill.tile.tx),
        ty: ooxmlEmu(blipFill.tile.ty),
        sx: ooxmlPercent100k(blipFill.tile.sx),
        sy: ooxmlPercent100k(blipFill.tile.sy),
        flip: blipFill.tile.flip,
        algn: blipFill.tile.alignment
      })
    );
  } else if (blipFill.stretch) {
    children2.push(createElement("a:stretch", {}, [createElement("a:fillRect")]));
  } else {
    throw new Error("serializePictureBlipFill: blipFill requires tile or stretch");
  }
  return createElement("p:blipFill", attrs, children2);
}
function serializeShapeStyleElements(properties) {
  const children2 = [];
  if (properties.fill) {
    children2.push(serializeFill(properties.fill));
  }
  if (properties.line) {
    children2.push(serializeLine(properties.line));
  }
  const effects = properties.effects ? serializeEffects(properties.effects) : null;
  if (effects) {
    children2.push(effects);
  }
  const sp3d = properties.shape3d ? serializeShape3d(properties.shape3d) : null;
  if (sp3d) {
    children2.push(sp3d);
  }
  return children2;
}
function serializeShapeStyle(style) {
  const children2 = [];
  const lnRef = style.lineReference ? serializeStyleReference("a:lnRef", style.lineReference) : null;
  if (lnRef) {
    children2.push(lnRef);
  }
  const fillRef = style.fillReference ? serializeStyleReference("a:fillRef", style.fillReference) : null;
  if (fillRef) {
    children2.push(fillRef);
  }
  const effectRef = style.effectReference ? serializeStyleReference("a:effectRef", style.effectReference) : null;
  if (effectRef) {
    children2.push(effectRef);
  }
  const fontRef = style.fontReference ? serializeFontReference(style.fontReference) : null;
  if (fontRef) {
    children2.push(fontRef);
  }
  if (children2.length === 0) {
    return null;
  }
  return createElement("p:style", {}, children2);
}
function serializeStyleReference(name, ref) {
  const attrs = { idx: String(ref.index) };
  const children2 = [];
  if (ref.color) {
    if (ref.color.type !== "solidFill") {
      throw new Error(`serializeShapeStyle: only solidFill is supported for ${name} color`);
    }
    children2.push(serializeColor2(ref.color.color));
  }
  return createElement(name, attrs, children2);
}
function serializeFontReference(ref) {
  const attrs = { idx: String(ref.index) };
  const children2 = [];
  if (ref.color) {
    if (ref.color.type !== "solidFill") {
      throw new Error("serializeShapeStyle: only solidFill is supported for a:fontRef color");
    }
    children2.push(serializeColor2(ref.color.color));
  }
  return createElement("a:fontRef", attrs, children2);
}
function serializeNvPr(placeholder) {
  const children2 = [];
  if (placeholder) {
    const attrs = {};
    if (placeholder.type) {
      attrs.type = placeholder.type;
    }
    if (placeholder.idx !== void 0) {
      attrs.idx = String(placeholder.idx);
    }
    if (placeholder.size) {
      attrs.sz = placeholder.size;
    }
    if (placeholder.hasCustomPrompt !== void 0) {
      attrs.hasCustomPrompt = placeholder.hasCustomPrompt ? "1" : "0";
    }
    children2.push(createElement("p:ph", attrs));
  }
  return createElement("p:nvPr", {}, children2);
}
function serializeGroupTransform(transform) {
  const attrs = {};
  if (Number(transform.rotation) !== 0) {
    attrs.rot = ooxmlAngleUnits(transform.rotation);
  }
  if (transform.flipH) {
    attrs.flipH = "1";
  }
  if (transform.flipV) {
    attrs.flipV = "1";
  }
  return createElement("a:xfrm", attrs, [
    createElement("a:off", { x: ooxmlEmu(transform.x), y: ooxmlEmu(transform.y) }),
    createElement("a:ext", { cx: ooxmlEmu(transform.width), cy: ooxmlEmu(transform.height) }),
    createElement("a:chOff", { x: ooxmlEmu(transform.childOffsetX), y: ooxmlEmu(transform.childOffsetY) }),
    createElement("a:chExt", { cx: ooxmlEmu(transform.childExtentWidth), cy: ooxmlEmu(transform.childExtentHeight) })
  ]);
}
function serializeGeometry(geometry) {
  switch (geometry.type) {
    case "preset":
      return serializePresetGeometry(geometry);
    case "custom":
      return serializeCustomGeometry(geometry);
  }
}
function serializePresetGeometry(geometry) {
  const avLstChildren = geometry.adjustValues.map(
    (v) => createElement("a:gd", { name: v.name, fmla: `val ${v.value}` })
  );
  return createElement("a:prstGeom", { prst: geometry.preset }, [createElement("a:avLst", {}, avLstChildren)]);
}
function serializeTextRect(textRect) {
  if (!textRect) {
    return void 0;
  }
  return createElement("a:rect", {
    l: textRect.left,
    t: textRect.top,
    r: textRect.right,
    b: textRect.bottom
  });
}
function serializeCustomGeometry(geometry) {
  const avLst = createElement(
    "a:avLst",
    {},
    (geometry.adjustValues ?? []).map((v) => createElement("a:gd", { name: v.name, fmla: `val ${v.value}` }))
  );
  const gdLst = createElement(
    "a:gdLst",
    {},
    (geometry.guides ?? []).map((g) => createElement("a:gd", { name: g.name, fmla: g.formula }))
  );
  const ahLst = createElement("a:ahLst", {}, []);
  const cxnLst = createElement(
    "a:cxnLst",
    {},
    (geometry.connectionSites ?? []).map(
      (site) => createElement("a:cxn", { ang: ooxmlAngleUnits(site.angle) }, [
        createElement("a:pos", {
          x: ooxmlEmu(site.position.x),
          y: ooxmlEmu(site.position.y)
        })
      ])
    )
  );
  const rect = serializeTextRect(geometry.textRect);
  const pathLst = createElement("a:pathLst", {}, geometry.paths.map(serializeGeometryPath));
  const children2 = [avLst, gdLst, ahLst, cxnLst, ...rect ? [rect] : [], pathLst];
  return createElement("a:custGeom", {}, children2);
}
function serializeTransformOrDefault(transform) {
  if (transform) {
    return serializeTransform(transform);
  }
  return createElement("a:xfrm", {}, [
    createElement("a:off", { x: "0", y: "0" }),
    createElement("a:ext", { cx: "0", cy: "0" })
  ]);
}
function serializeGroupTransformOrDefault(transform) {
  if (transform) {
    return serializeGroupTransform(transform);
  }
  return createElement("a:xfrm", {}, [
    createElement("a:off", { x: "0", y: "0" }),
    createElement("a:ext", { cx: "0", cy: "0" }),
    createElement("a:chOff", { x: "0", y: "0" }),
    createElement("a:chExt", { cx: "0", cy: "0" })
  ]);
}
function serializeGeometryPath(path) {
  const attrs = {
    w: ooxmlEmu(path.width),
    h: ooxmlEmu(path.height),
    fill: path.fill,
    stroke: path.stroke ? "1" : "0",
    extrusionOk: path.extrusionOk ? "1" : "0"
  };
  return createElement("a:path", attrs, path.commands.map(serializePathCommand));
}
function serializePathCommand(command) {
  switch (command.type) {
    case "moveTo":
      return createElement("a:moveTo", {}, [
        createElement("a:pt", { x: ooxmlEmu(command.point.x), y: ooxmlEmu(command.point.y) })
      ]);
    case "lineTo":
      return createElement("a:lnTo", {}, [
        createElement("a:pt", { x: ooxmlEmu(command.point.x), y: ooxmlEmu(command.point.y) })
      ]);
    case "arcTo":
      return createElement("a:arcTo", {
        wR: ooxmlEmu(command.widthRadius),
        hR: ooxmlEmu(command.heightRadius),
        stAng: ooxmlAngleUnits(command.startAngle),
        swAng: ooxmlAngleUnits(command.swingAngle)
      });
    case "quadBezierTo":
      return createElement("a:quadBezTo", {}, [
        createElement("a:pt", { x: ooxmlEmu(command.control.x), y: ooxmlEmu(command.control.y) }),
        createElement("a:pt", { x: ooxmlEmu(command.end.x), y: ooxmlEmu(command.end.y) })
      ]);
    case "cubicBezierTo":
      return createElement("a:cubicBezTo", {}, [
        createElement("a:pt", { x: ooxmlEmu(command.control1.x), y: ooxmlEmu(command.control1.y) }),
        createElement("a:pt", { x: ooxmlEmu(command.control2.x), y: ooxmlEmu(command.control2.y) }),
        createElement("a:pt", { x: ooxmlEmu(command.end.x), y: ooxmlEmu(command.end.y) })
      ]);
    case "close":
      return createElement("a:close");
  }
}
function serializeConnectionTarget(name, target) {
  return createElement(name, { id: target.shapeId, idx: String(target.siteIndex) });
}
function serializeGraphicFrameContent(content) {
  switch (content.type) {
    case "oleObject":
      return serializeOleObjectGraphicData(content.data);
    case "table":
      return serializeTableGraphicData(content.data.table);
    default:
      throw new Error(
        `serializeGraphicFrame: content type '${content.type}' is not supported for serialization.`
      );
  }
}
function serializeGraphicFrame(frame) {
  const nvGraphicFramePr = createElement("p:nvGraphicFramePr", {}, [
    serializeGraphicFrameCNvPr(frame.nonVisual),
    createElement(
      "p:cNvGraphicFramePr",
      {},
      frame.nonVisual.graphicFrameLocks ? [serializeGraphicFrameLocks(frame.nonVisual.graphicFrameLocks)] : []
    ),
    createElement("p:nvPr")
  ]);
  const xfrm = serializeGraphicFrameTransform(frame.transform);
  const graphic = createElement(
    "a:graphic",
    {
      xmlns: "http://schemas.openxmlformats.org/drawingml/2006/main"
    },
    [serializeGraphicFrameContent(frame.content)]
  );
  return createElement("p:graphicFrame", {}, [nvGraphicFramePr, xfrm, graphic]);
}
function serializeGraphicFrameCNvPr(nonVisual) {
  const attrs = {
    id: nonVisual.id,
    name: nonVisual.name
  };
  if (nonVisual.description) {
    attrs.descr = nonVisual.description;
  }
  if (nonVisual.title) {
    attrs.title = nonVisual.title;
  }
  if (nonVisual.hidden !== void 0) {
    attrs.hidden = nonVisual.hidden ? "1" : "0";
  }
  return createElement("p:cNvPr", attrs);
}
function serializeGraphicFrameLocks(locks) {
  const attrs = {};
  if (locks.noGrp !== void 0) {
    attrs.noGrp = ooxmlBool(locks.noGrp);
  }
  if (locks.noDrilldown !== void 0) {
    attrs.noDrilldown = ooxmlBool(locks.noDrilldown);
  }
  if (locks.noSelect !== void 0) {
    attrs.noSelect = ooxmlBool(locks.noSelect);
  }
  if (locks.noChangeAspect !== void 0) {
    attrs.noChangeAspect = ooxmlBool(locks.noChangeAspect);
  }
  if (locks.noMove !== void 0) {
    attrs.noMove = ooxmlBool(locks.noMove);
  }
  if (locks.noResize !== void 0) {
    attrs.noResize = ooxmlBool(locks.noResize);
  }
  return createElement("a:graphicFrameLocks", attrs);
}
function serializeGraphicFrameTransform(transform) {
  const attrs = {};
  if (transform.rotation && Number(transform.rotation) !== 0) {
    attrs.rot = ooxmlAngleUnits(transform.rotation);
  }
  if (transform.flipH) {
    attrs.flipH = "1";
  }
  if (transform.flipV) {
    attrs.flipV = "1";
  }
  return createElement("p:xfrm", attrs, [
    createElement("a:off", { x: ooxmlEmu(transform.x), y: ooxmlEmu(transform.y) }),
    createElement("a:ext", { cx: ooxmlEmu(transform.width), cy: ooxmlEmu(transform.height) })
  ]);
}
function serializeOleObjectGraphicData(oleRef) {
  if (!oleRef.resourceId) {
    throw new Error("serializeOleObjectGraphicData: resourceId is required");
  }
  if (!oleRef.progId) {
    throw new Error("serializeOleObjectGraphicData: progId is required");
  }
  const oleObjAttrs = {
    "r:id": oleRef.resourceId,
    progId: oleRef.progId
  };
  if (oleRef.name) {
    oleObjAttrs.name = oleRef.name;
  }
  if (oleRef.showAsIcon !== void 0) {
    oleObjAttrs.showAsIcon = ooxmlBool(oleRef.showAsIcon);
  }
  if (oleRef.imgW !== void 0) {
    oleObjAttrs.imgW = String(oleRef.imgW);
  }
  if (oleRef.imgH !== void 0) {
    oleObjAttrs.imgH = String(oleRef.imgH);
  }
  const oleObjChildren = [createElement("p:embed")];
  const oleObj = createElement("p:oleObj", oleObjAttrs, oleObjChildren);
  return createElement(
    "a:graphicData",
    {
      uri: "http://schemas.openxmlformats.org/presentationml/2006/ole"
    },
    [oleObj]
  );
}
function serializeTableGraphicData(table) {
  return createElement(
    "a:graphicData",
    {
      uri: "http://schemas.openxmlformats.org/drawingml/2006/table"
    },
    [serializeDrawingTable(table)]
  );
}
function addContentType(contentTypesXml, extension, contentType) {
  if (!extension) {
    throw new Error("addContentType: extension is required");
  }
  if (!contentType) {
    throw new Error("addContentType: contentType is required");
  }
  const root = getDocumentRoot(contentTypesXml);
  if (!root || root.name !== "Types") {
    throw new Error("addContentType: invalid [Content_Types].xml (missing Types root)");
  }
  const normalizedExt = extension.replace(/^\./, "").toLowerCase();
  const existing = findDefault(root, normalizedExt);
  if (existing) {
    const existingType = existing.attrs.ContentType;
    if (existingType && existingType !== contentType) {
      throw new Error(`addContentType: extension "${normalizedExt}" already exists with ContentType "${existingType}"`);
    }
    return contentTypesXml;
  }
  const newDefault = createElement("Default", {
    Extension: normalizedExt,
    ContentType: contentType
  });
  return updateDocumentRoot(contentTypesXml, (typesEl) => {
    if (typesEl.name !== "Types") {
      return typesEl;
    }
    const firstOverrideIndex = typesEl.children.findIndex((child) => isXmlElement(child) && child.name === "Override");
    const insertIndex = firstOverrideIndex === -1 ? typesEl.children.length : firstOverrideIndex;
    const children2 = [...typesEl.children];
    children2.splice(insertIndex, 0, newDefault);
    return { ...typesEl, children: children2 };
  });
}
function addOverride$2(contentTypesXml, partName, contentType) {
  if (!partName) {
    throw new Error("addOverride: partName is required");
  }
  if (!contentType) {
    throw new Error("addOverride: contentType is required");
  }
  const root = getDocumentRoot(contentTypesXml);
  if (!root || root.name !== "Types") {
    throw new Error("addOverride: invalid [Content_Types].xml (missing Types root)");
  }
  const normalizedPartName = partName.startsWith("/") ? partName : `/${partName}`;
  const existing = findOverride(root, normalizedPartName);
  if (existing) {
    const existingType = existing.attrs.ContentType;
    if (existingType && existingType !== contentType) {
      throw new Error(`addOverride: part "${normalizedPartName}" already exists with ContentType "${existingType}"`);
    }
    return contentTypesXml;
  }
  const overrideEl = createElement("Override", {
    PartName: normalizedPartName,
    ContentType: contentType
  });
  return updateDocumentRoot(contentTypesXml, (typesEl) => {
    if (typesEl.name !== "Types") {
      return typesEl;
    }
    return { ...typesEl, children: [...typesEl.children, overrideEl] };
  });
}
function findDefault(typesEl, extension) {
  return typesEl.children.find(
    (child) => isXmlElement(child) && child.name === "Default" && child.attrs.Extension?.toLowerCase() === extension.toLowerCase()
  );
}
function findOverride(typesEl, partName) {
  return typesEl.children.find(
    (child) => isXmlElement(child) && child.name === "Override" && child.attrs.PartName === partName
  );
}
var RELATIONSHIPS_XMLNS = "http://schemas.openxmlformats.org/package/2006/relationships";
function createRelationshipsDocument(relationships = []) {
  const children2 = relationships.map((relationship) => {
    const attrs = {
      Id: relationship.id,
      Type: relationship.type,
      Target: relationship.target
    };
    if (relationship.targetMode) {
      attrs.TargetMode = relationship.targetMode;
    }
    return createElement("Relationship", attrs);
  });
  return {
    children: [createElement("Relationships", { xmlns: RELATIONSHIPS_XMLNS }, children2)]
  };
}
function generateRelationshipId(existingIds) {
  const used = /* @__PURE__ */ new Set();
  for (const id of existingIds) {
    const match = /^rId(\d+)$/.exec(id);
    if (!match) {
      continue;
    }
    used.add(Number(match[1]));
  }
  const findNext = (n) => {
    if (!used.has(n)) {
      return `rId${n}`;
    }
    return findNext(n + 1);
  };
  return findNext(1);
}
function addRelationship$2(relsXml, target, type) {
  if (!target) {
    throw new Error("addRelationship: target is required");
  }
  const existing = listRelationships(relsXml).find((rel) => rel.type === type && rel.target === target);
  if (existing) {
    return { updatedXml: relsXml, rId: existing.id };
  }
  const root = getDocumentRoot(relsXml);
  if (!root || root.name !== "Relationships") {
    throw new Error("addRelationship: invalid .rels document (missing Relationships root)");
  }
  const existingIds = listRelationships(relsXml).map((rel) => rel.id);
  const rId = generateRelationshipId(existingIds);
  const relationshipAttrs = {
    Id: rId,
    Type: type,
    Target: target
  };
  const targetMode = inferTargetMode(type, target);
  if (targetMode) {
    relationshipAttrs.TargetMode = targetMode;
  }
  const relationshipEl = createElement("Relationship", relationshipAttrs);
  const updated = updateDocumentRoot(relsXml, (rootEl) => {
    if (rootEl.name !== "Relationships") {
      return rootEl;
    }
    const nextAttrs = { ...rootEl.attrs };
    if (nextAttrs.xmlns === void 0) {
      nextAttrs.xmlns = RELATIONSHIPS_XMLNS;
    }
    return {
      ...rootEl,
      attrs: nextAttrs,
      children: [...rootEl.children, relationshipEl]
    };
  });
  return { updatedXml: updated, rId };
}
function ensureRelationshipsDocument(relsXml) {
  if (relsXml === null) {
    return createRelationshipsDocument();
  }
  const root = getDocumentRoot(relsXml);
  if (!root || root.name !== "Relationships") {
    return createRelationshipsDocument();
  }
  return relsXml;
}
function inferTargetMode(type, target) {
  if (type !== OFFICE_RELATIONSHIP_TYPES.hyperlink) {
    return void 0;
  }
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(target)) {
    return "External";
  }
  return void 0;
}
var IMAGE_REL = OFFICE_RELATIONSHIP_TYPES.image;
var VIDEO_REL = OFFICE_RELATIONSHIP_TYPES.video;
var AUDIO_REL = OFFICE_RELATIONSHIP_TYPES.audio;
function addMedia({ pkg, mediaData, mediaType, referringPart }) {
  if (!mediaData) {
    throw new Error("addMedia: mediaData is required");
  }
  if (!mediaType) {
    throw new Error("addMedia: mediaType is required");
  }
  if (!referringPart) {
    throw new Error("addMedia: referringPart is required");
  }
  const { extension, relationshipType, prefix } = inferMediaInfo(mediaType);
  const existingPath = findExistingMediaByBytes(pkg, extension, mediaData);
  const mediaPath = existingPath ?? generateMediaPath(pkg, prefix, extension);
  if (!existingPath) {
    pkg.writeBinary(mediaPath, mediaData);
  }
  updateContentTypesForMedia(pkg, extension, mediaType);
  const rId = addMediaRelationship({ pkg, referringPart, mediaPath, relationshipType });
  return { path: mediaPath, rId };
}
function updateContentTypesForMedia(pkg, extension, mediaType) {
  const contentTypesText = pkg.readText("[Content_Types].xml");
  if (contentTypesText === null) {
    throw new Error("addMedia: missing [Content_Types].xml");
  }
  const contentTypesXml = parseXml(contentTypesText);
  const updated = addContentType(contentTypesXml, extension, mediaType);
  pkg.writeText("[Content_Types].xml", serializeXml$1(updated));
}
function loadOrCreateRelsDocument$1(pkg, relsPath) {
  const existing = pkg.readText(relsPath);
  if (existing === null) {
    return ensureRelationshipsDocument(null);
  }
  return ensureRelationshipsDocument(parseXml(existing));
}
function addMediaRelationship({
  pkg,
  referringPart,
  mediaPath,
  relationshipType
}) {
  const relsPath = getRelationshipPartPath(referringPart);
  const relsXml = loadOrCreateRelsDocument$1(pkg, relsPath);
  const target = buildRelationshipTarget$1(referringPart, mediaPath);
  const { updatedXml, rId } = addRelationship$2(relsXml, target, relationshipType);
  pkg.writeText(relsPath, serializeXml$1(updatedXml));
  return rId;
}
function inferMediaInfo(mediaType) {
  const extension = inferExtensionFromMediaContentType(mediaType);
  if (mediaType.startsWith("video/")) {
    return { extension, relationshipType: VIDEO_REL, prefix: "video" };
  }
  if (mediaType.startsWith("audio/")) {
    return { extension, relationshipType: AUDIO_REL, prefix: "audio" };
  }
  return { extension, relationshipType: IMAGE_REL, prefix: "image" };
}
function findExistingMediaByBytes(pkg, extension, mediaData) {
  const candidates = pkg.listFiles().filter((path) => path.startsWith("ppt/media/") && path.toLowerCase().endsWith(`.${extension}`)).sort();
  for (const path of candidates) {
    const existing = pkg.readBinary(path);
    if (existing && buffersEqual(existing, mediaData)) {
      return path;
    }
  }
  return null;
}
function buffersEqual(a, b) {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  const ua = new Uint8Array(a);
  const ub = new Uint8Array(b);
  for (let i = 0; i < ua.length; i += 1) {
    if (ua[i] !== ub[i]) {
      return false;
    }
  }
  return true;
}
function generateMediaPath(pkg, prefix, extension) {
  const existing = new Set(pkg.listFiles().filter((p) => p.startsWith("ppt/media/")));
  return findUnusedNumberedPath(existing, `ppt/media/${prefix}`, extension);
}
function findUnusedNumberedPath(existing, base, extension) {
  const tryNumber = (n) => {
    const candidate = `${base}${n}.${extension}`;
    if (!existing.has(candidate)) {
      return candidate;
    }
    return tryNumber(n + 1);
  };
  return tryNumber(1);
}
function countCommonPrefix(a, b) {
  const check = (i) => {
    if (i >= a.length || i >= b.length || a[i] !== b[i]) {
      return i;
    }
    return check(i + 1);
  };
  return check(0);
}
function buildRelationshipTarget$1(sourcePart, targetPart) {
  const sourceDir = getDirectory$1(sourcePart);
  const sourceSegments = sourceDir.split("/").filter((s) => s.length > 0);
  const targetSegments = targetPart.split("/").filter((s) => s.length > 0);
  const common = countCommonPrefix(sourceSegments, targetSegments);
  const up = sourceSegments.length - common;
  const relSegments = [...Array.from({ length: up }, () => ".."), ...targetSegments.slice(common)];
  return relSegments.join("/");
}
function getDirectory$1(path) {
  const lastSlash = path.lastIndexOf("/");
  if (lastSlash === -1) {
    return "";
  }
  return path.slice(0, lastSlash);
}
function serializeXml$1(doc) {
  return serializeDocument(doc, { declaration: true, standalone: true });
}
var OLE_OBJECT_REL = OFFICE_RELATIONSHIP_TYPES.oleObject;
var OLE_TYPE_MAP = {
  xlsx: {
    extension: "xlsx",
    progId: "Excel.Sheet.12",
    contentType: OLE_CONTENT_TYPES.xlsx
  },
  docx: {
    extension: "docx",
    progId: "Word.Document.12",
    contentType: OLE_CONTENT_TYPES.docx
  },
  pptx: {
    extension: "pptx",
    progId: "PowerPoint.Show.12",
    contentType: OLE_CONTENT_TYPES.pptx
  }
};
var FONT_REL_TYPE = OFFICE_RELATIONSHIP_TYPES.font;
function schemeChildName(name) {
  return `a:${name}`;
}
function upsertChildBeforeExtLst$1(parent, childName, newChild) {
  const existingIndex = parent.children.findIndex((c) => isXmlElement(c) && c.name === childName);
  if (existingIndex !== -1) {
    return {
      ...parent,
      children: parent.children.map((c, i) => i === existingIndex ? newChild : c)
    };
  }
  const extLstIndex = parent.children.findIndex((c) => isXmlElement(c) && c.name === "a:extLst");
  const insertIndex = extLstIndex === -1 ? parent.children.length : extLstIndex;
  const nextChildren = [...parent.children];
  nextChildren.splice(insertIndex, 0, newChild);
  return { ...parent, children: nextChildren };
}
function buildSchemeEntry(existingEntry, entryName, color) {
  if (!existingEntry) {
    return createElement(entryName, {}, [serializeColor2(color)]);
  }
  const preserved = existingEntry.children.filter((c) => {
    if (!isXmlElement(c)) {
      return true;
    }
    return c.name === "a:extLst";
  });
  return createElement(existingEntry.name, { ...existingEntry.attrs }, [serializeColor2(color), ...preserved]);
}
function patchSchemeColor(colorScheme, name, color) {
  if (!colorScheme) {
    throw new Error("patchSchemeColor requires colorScheme.");
  }
  if (!name) {
    throw new Error("patchSchemeColor requires name.");
  }
  if (!color) {
    throw new Error("patchSchemeColor requires color.");
  }
  if (color.spec.type !== "srgb" && color.spec.type !== "system") {
    throw new Error(`patchSchemeColor only supports srgb/system, got: ${color.spec.type}`);
  }
  const entryName = schemeChildName(name);
  const existingEntry = colorScheme.children.find((c) => isXmlElement(c) && c.name === entryName);
  const updatedEntry = buildSchemeEntry(existingEntry, entryName, color);
  return upsertChildBeforeExtLst$1(colorScheme, entryName, updatedEntry);
}
function buildTypefaceChild({ fontElement, childName, typeface, existingIndex }) {
  if (existingIndex === -1) {
    return createElement(childName, { typeface }, []);
  }
  const existingChild = fontElement.children[existingIndex];
  return {
    ...existingChild,
    attrs: {
      ...existingChild.attrs,
      typeface
    }
  };
}
function upsertTypeface(fontElement, childName, typeface) {
  if (typeface === void 0) {
    return fontElement;
  }
  const existingIndex = fontElement.children.findIndex((c) => isXmlElement(c) && c.name === childName);
  const updatedChild = buildTypefaceChild({ fontElement, childName, typeface, existingIndex });
  if (existingIndex !== -1) {
    return {
      ...fontElement,
      children: fontElement.children.map((c, i) => i === existingIndex ? updatedChild : c)
    };
  }
  const extLstIndex = fontElement.children.findIndex((c) => isXmlElement(c) && c.name === "a:extLst");
  const insertIndex = extLstIndex === -1 ? fontElement.children.length : extLstIndex;
  const nextChildren = [...fontElement.children];
  nextChildren.splice(insertIndex, 0, updatedChild);
  return { ...fontElement, children: nextChildren };
}
function patchFont(fontScheme, fontName, fontFamily) {
  const existing = getChild(fontScheme, fontName) ?? createElement(fontName, {}, []);
  const withLatin = upsertTypeface(existing, "a:latin", fontFamily.latin);
  const withEa = upsertTypeface(withLatin, "a:ea", fontFamily.eastAsian);
  const withCs = upsertTypeface(withEa, "a:cs", fontFamily.complexScript);
  const existingIndex = fontScheme.children.findIndex((c) => isXmlElement(c) && c.name === fontName);
  if (existingIndex !== -1) {
    return {
      ...fontScheme,
      children: fontScheme.children.map((c, i) => i === existingIndex ? withCs : c)
    };
  }
  const extLstIndex = fontScheme.children.findIndex((c) => isXmlElement(c) && c.name === "a:extLst");
  const insertIndex = extLstIndex === -1 ? fontScheme.children.length : extLstIndex;
  const nextChildren = [...fontScheme.children];
  nextChildren.splice(insertIndex, 0, withCs);
  return { ...fontScheme, children: nextChildren };
}
function patchMajorFont(fontScheme, fontFamily) {
  if (!fontScheme) {
    throw new Error("patchMajorFont requires fontScheme.");
  }
  if (!fontFamily) {
    throw new Error("patchMajorFont requires fontFamily.");
  }
  return patchFont(fontScheme, "a:majorFont", fontFamily);
}
function patchMinorFont(fontScheme, fontFamily) {
  if (!fontScheme) {
    throw new Error("patchMinorFont requires fontScheme.");
  }
  if (!fontFamily) {
    throw new Error("patchMinorFont requires fontFamily.");
  }
  return patchFont(fontScheme, "a:minorFont", fontFamily);
}
function requireThemeElements(root) {
  const themeElements = getChild(root, "a:themeElements");
  if (!themeElements) {
    throw new Error("patchTheme: missing a:themeElements element.");
  }
  return themeElements;
}
function upsertChildBeforeExtLst(parent, childName, newChild) {
  const existingIndex = parent.children.findIndex((c) => isXmlElement(c) && c.name === childName);
  if (existingIndex !== -1) {
    return {
      ...parent,
      children: parent.children.map((c, i) => i === existingIndex ? newChild : c)
    };
  }
  const extLstIndex = parent.children.findIndex((c) => isXmlElement(c) && c.name === "a:extLst");
  const insertIndex = extLstIndex === -1 ? parent.children.length : extLstIndex;
  const nextChildren = [...parent.children];
  nextChildren.splice(insertIndex, 0, newChild);
  return { ...parent, children: nextChildren };
}
function patchFormatSchemeElement(fmtScheme, scheme) {
  const buildStyleList = (name, entries) => {
    const existing = getChild(fmtScheme, name);
    if (!existing) {
      return createElement(name, {}, entries);
    }
    const preserved = existing.children.filter((c) => !isXmlElement(c) || c.name === "a:extLst");
    return {
      ...existing,
      children: [...entries, ...preserved]
    };
  };
  const fillElements = scheme.fillStyles.map(serializeFill);
  const lineElements = scheme.lineStyles.map(serializeLine);
  const effectElements = scheme.effectStyles.map((e) => {
    const effectChild = e ? serializeEffects(e) : null;
    return createElement("a:effectStyle", {}, effectChild ? [effectChild] : [createElement("a:effectLst")]);
  });
  const bgFillElements = scheme.bgFillStyles.map(serializeFill);
  const withFill = upsertChildBeforeExtLst(
    fmtScheme,
    "a:fillStyleLst",
    buildStyleList("a:fillStyleLst", fillElements)
  );
  const withLine = upsertChildBeforeExtLst(withFill, "a:lnStyleLst", buildStyleList("a:lnStyleLst", lineElements));
  const withEffect = upsertChildBeforeExtLst(
    withLine,
    "a:effectStyleLst",
    buildStyleList("a:effectStyleLst", effectElements)
  );
  return upsertChildBeforeExtLst(
    withEffect,
    "a:bgFillStyleLst",
    buildStyleList("a:bgFillStyleLst", bgFillElements)
  );
}
function applyColorScheme(themeElements, scheme) {
  const clrScheme = getChild(themeElements, "a:clrScheme");
  if (!clrScheme) {
    throw new Error("patchTheme: missing a:clrScheme.");
  }
  const entries = Object.entries(scheme);
  const updatedClrScheme = entries.reduce((current, [name, color]) => {
    if (!color) {
      return current;
    }
    return patchSchemeColor(current, name, color);
  }, clrScheme);
  return replaceChildByName(themeElements, "a:clrScheme", updatedClrScheme);
}
function applyFontScheme(themeElements, scheme) {
  const fontScheme = getChild(themeElements, "a:fontScheme");
  if (!fontScheme) {
    throw new Error("patchTheme: missing a:fontScheme.");
  }
  const withMajor = patchMajorFont(fontScheme, scheme.majorFont);
  const updated = patchMinorFont(withMajor, scheme.minorFont);
  return replaceChildByName(themeElements, "a:fontScheme", updated);
}
function applyFormatScheme(themeElements, scheme) {
  const fmtScheme = getChild(themeElements, "a:fmtScheme");
  if (!fmtScheme) {
    throw new Error("patchTheme: missing a:fmtScheme.");
  }
  const updated = patchFormatSchemeElement(fmtScheme, scheme);
  return replaceChildByName(themeElements, "a:fmtScheme", updated);
}
function applyThemeChangeToElements(themeElements, change) {
  switch (change.type) {
    case "colorScheme":
      return applyColorScheme(themeElements, change.scheme);
    case "fontScheme":
      return applyFontScheme(themeElements, change.scheme);
    case "formatScheme":
      return applyFormatScheme(themeElements, change.scheme);
  }
}
function applyThemeChange(current, change) {
  return updateDocumentRoot(current, (root) => {
    if (root.name !== "a:theme") {
      throw new Error(`patchTheme: unexpected root element: ${root.name}`);
    }
    const themeElements = requireThemeElements(root);
    const updatedThemeElements = applyThemeChangeToElements(themeElements, change);
    return replaceChildByName(root, "a:themeElements", updatedThemeElements);
  });
}
function patchTheme(themeXml, changes) {
  if (!themeXml) {
    throw new Error("patchTheme requires themeXml.");
  }
  if (!changes) {
    throw new Error("patchTheme requires changes.");
  }
  return changes.reduce((current, change) => applyThemeChange(current, change), themeXml);
}
function assertNever(value) {
  throw new Error(`Unexpected value: ${value}`);
}
function requireChild$2(parent, name, context) {
  const child = getChild(parent, name);
  if (!child) {
    throw new Error(`${context}: missing required child: ${name}`);
  }
  return child;
}
function requireTable$1(tableElement) {
  if (tableElement.name !== "a:tbl") {
    throw new Error(`patchTable: expected a:tbl, got ${tableElement.name}`);
  }
}
function createEmptyTxBody() {
  return createElement("a:txBody", {}, [createElement("a:bodyPr"), createElement("a:lstStyle"), createElement("a:p")]);
}
function serializeCellProperties(props) {
  const attrs = {};
  if (props.rowSpan !== void 0) {
    attrs.rowSpan = String(props.rowSpan);
  }
  if (props.colSpan !== void 0) {
    attrs.gridSpan = String(props.colSpan);
  }
  if (props.horizontalMerge) {
    attrs.hMerge = "1";
  }
  if (props.verticalMerge) {
    attrs.vMerge = "1";
  }
  return createElement("a:tcPr", attrs);
}
function serializeTableCell2(cell) {
  const attrs = {};
  if (cell.id) {
    attrs.id = cell.id;
  }
  const txBody = cell.textBody ? serializeDrawingTextBody(cell.textBody) : createEmptyTxBody();
  const tcPr = serializeCellProperties(cell.properties);
  return createElement("a:tc", attrs, [txBody, tcPr]);
}
function serializeTableRow2(row) {
  return createElement("a:tr", { h: ooxmlEmu(row.height) }, row.cells.map(serializeTableCell2));
}
function patchTableCell(cell, content) {
  if (cell.name !== "a:tc") {
    throw new Error(`patchTableCell: expected a:tc, got ${cell.name}`);
  }
  const txBody = getChild(cell, "a:txBody");
  if (txBody) {
    return replaceChildByName(cell, "a:txBody", patchTextBodyElement(txBody, content));
  }
  const tcPr = getChild(cell, "a:tcPr");
  const newTxBody = serializeDrawingTextBody(content);
  if (!tcPr) {
    return setChildren(cell, [newTxBody, ...cell.children]);
  }
  const tcPrIndex = cell.children.findIndex((c) => isXmlElement(c) && c.name === "a:tcPr");
  if (tcPrIndex < 0) {
    return setChildren(cell, [newTxBody, ...cell.children]);
  }
  const nextChildren = [...cell.children];
  nextChildren.splice(tcPrIndex, 0, newTxBody);
  return setChildren(cell, nextChildren);
}
function getTableRows(table) {
  return getChildren(table, "a:tr");
}
function getTableGrid(table) {
  return requireChild$2(table, "a:tblGrid", "patchTable");
}
function getTableGridCols(tblGrid) {
  return getChildren(tblGrid, "a:gridCol");
}
function getRowCells(row) {
  return getChildren(row, "a:tc");
}
function replaceCellAt(row, colIndex, newCell) {
  if (colIndex < 0) {
    throw new Error(`replaceCellAt: colIndex out of range: ${colIndex}`);
  }
  const cells = getChildren(row, "a:tc");
  if (colIndex >= cells.length) {
    throw new Error(`replaceCellAt: colIndex out of range: ${colIndex}`);
  }
  let current = -1;
  const nextChildren = row.children.map((child) => {
    if (!isXmlElement(child) || child.name !== "a:tc") {
      return child;
    }
    current += 1;
    return current === colIndex ? newCell : child;
  });
  return setChildren(row, nextChildren);
}
function insertCellAt(row, position, newCell) {
  if (position < 0) {
    throw new Error(`insertCellAt: position out of range: ${position}`);
  }
  const nextChildren = [];
  let cellIdx = 0;
  let inserted = false;
  for (const child of row.children) {
    if (isXmlElement(child) && child.name === "a:tc" && cellIdx === position) {
      nextChildren.push(newCell);
      inserted = true;
    }
    nextChildren.push(child);
    if (isXmlElement(child) && child.name === "a:tc") {
      cellIdx += 1;
    }
  }
  if (!inserted) {
    if (position !== cellIdx) {
      throw new Error(`insertCellAt: position out of range: ${position}`);
    }
    nextChildren.push(newCell);
  }
  return setChildren(row, nextChildren);
}
function removeCellAt(row, colIndex) {
  if (colIndex < 0) {
    throw new Error(`removeCellAt: colIndex out of range: ${colIndex}`);
  }
  const cells = getChildren(row, "a:tc");
  if (colIndex >= cells.length) {
    throw new Error(`removeCellAt: colIndex out of range: ${colIndex}`);
  }
  let current = -1;
  const nextChildren = row.children.filter((child) => {
    if (!isXmlElement(child) || child.name !== "a:tc") {
      return true;
    }
    current += 1;
    return current !== colIndex;
  });
  return setChildren(row, nextChildren);
}
function replaceRowAt(table, rowIndex, newRow) {
  const rows = getTableRows(table);
  if (rowIndex < 0 || rowIndex >= rows.length) {
    throw new Error(`patchTable: rowIndex out of range: ${rowIndex}`);
  }
  let currentRowIndex = -1;
  const nextChildren = table.children.map((child) => {
    if (!isXmlElement(child) || child.name !== "a:tr") {
      return child;
    }
    currentRowIndex += 1;
    return currentRowIndex === rowIndex ? newRow : child;
  });
  return setChildren(table, nextChildren);
}
function insertRowAt(table, newRow, position) {
  const rows = getTableRows(table);
  if (position < 0 || position > rows.length) {
    throw new Error(`patchTable: addRow position out of range: ${position}`);
  }
  const children2 = [...table.children];
  const rawFirstRowIndex = children2.findIndex((c) => isXmlElement(c) && c.name === "a:tr");
  const firstRowIndex = rawFirstRowIndex < 0 ? children2.length : rawFirstRowIndex;
  children2.splice(firstRowIndex + position, 0, newRow);
  return setChildren(table, children2);
}
function addTableRow(table, row, position) {
  requireTable$1(table);
  const gridCols = getTableGridCols(getTableGrid(table));
  if (row.cells.length !== gridCols.length) {
    throw new Error(`addTableRow: row.cells length (${row.cells.length}) must match column count (${gridCols.length})`);
  }
  const newRow = serializeTableRow2(row);
  const insertAt = position ?? getTableRows(table).length;
  return insertRowAt(table, newRow, insertAt);
}
function addTableColumn(table, column, position) {
  requireTable$1(table);
  const tblGrid = getTableGrid(table);
  const gridCols = getTableGridCols(tblGrid);
  const insertAt = position ?? gridCols.length;
  if (insertAt < 0 || insertAt > gridCols.length) {
    throw new Error(`addTableColumn: position out of range: ${insertAt}`);
  }
  const newGridCol = createElement("a:gridCol", { w: ooxmlEmu(column.width) });
  const nextGridChildren = [...tblGrid.children];
  nextGridChildren.splice(insertAt, 0, newGridCol);
  const nextTblGrid = setChildren(tblGrid, nextGridChildren);
  const newCell = createElement("a:tc", {}, [createEmptyTxBody(), createElement("a:tcPr")]);
  const nextChildren = table.children.map((child) => {
    if (!isXmlElement(child)) {
      return child;
    }
    if (child.name === "a:tblGrid") {
      return nextTblGrid;
    }
    if (child.name === "a:tr") {
      return insertCellAt(child, insertAt, newCell);
    }
    return child;
  });
  return setChildren(table, nextChildren);
}
function removeRow(table, rowIndex) {
  requireTable$1(table);
  const rows = getTableRows(table);
  if (rowIndex < 0 || rowIndex >= rows.length) {
    throw new Error(`removeRow: rowIndex out of range: ${rowIndex}`);
  }
  let currentRowIndex = -1;
  const nextChildren = table.children.filter((child) => {
    if (!isXmlElement(child) || child.name !== "a:tr") {
      return true;
    }
    currentRowIndex += 1;
    return currentRowIndex !== rowIndex;
  });
  return setChildren(table, nextChildren);
}
function removeColumn(table, colIndex) {
  requireTable$1(table);
  const tblGrid = getTableGrid(table);
  const gridCols = getTableGridCols(tblGrid);
  if (colIndex < 0 || colIndex >= gridCols.length) {
    throw new Error(`removeColumn: colIndex out of range: ${colIndex}`);
  }
  const nextGrid = setChildren(
    tblGrid,
    tblGrid.children.filter((_, idx) => idx !== colIndex)
  );
  const nextChildren = table.children.map((child) => {
    if (!isXmlElement(child)) {
      return child;
    }
    if (child.name === "a:tblGrid") {
      return nextGrid;
    }
    if (child.name === "a:tr") {
      return removeCellAt(child, colIndex);
    }
    return child;
  });
  return setChildren(table, nextChildren);
}
function ensureTcPr(cell) {
  const tcPr = getChild(cell, "a:tcPr");
  if (tcPr) {
    return cell;
  }
  return setChildren(cell, [...cell.children, createElement("a:tcPr")]);
}
function patchMergeCell(cell, attrs) {
  const withTcPr = ensureTcPr(cell);
  const tcPr = requireChild$2(withTcPr, "a:tcPr", "patchMergeCell");
  const updated = Object.entries(attrs).reduce((current, [k, v]) => {
    if (v === void 0) {
      return removeAttribute(current, k);
    }
    return setAttribute(current, k, v);
  }, tcPr);
  return replaceChildByName(withTcPr, "a:tcPr", updated);
}
function applyMergeRange({
  table,
  startRow,
  startCol,
  rowSpan,
  colSpan
}) {
  const rows = getTableRows(table);
  if (rowSpan < 1 || colSpan < 1) {
    throw new Error("merge: rowSpan and colSpan must be >= 1");
  }
  if (startRow < 0 || startCol < 0) {
    throw new Error("merge: startRow/startCol must be >= 0");
  }
  if (startRow + rowSpan > rows.length) {
    throw new Error("merge: row range out of bounds");
  }
  const firstRowCells = getRowCells(rows[startRow]);
  if (startCol + colSpan > firstRowCells.length) {
    throw new Error("merge: column range out of bounds");
  }
  const processRow = (currentTable, r) => {
    const rowIndex = startRow + r;
    const rowEl = rows[rowIndex];
    const rowChildren = [];
    let cellIdx = 0;
    for (const child of rowEl.children) {
      if (isXmlElement(child) && child.name === "a:tc") {
        const rr = rowIndex - startRow;
        const cc = cellIdx - startCol;
        const inRange = rr >= 0 && rr < rowSpan && cc >= 0 && cc < colSpan;
        if (!inRange) {
          rowChildren.push(child);
          cellIdx += 1;
          continue;
        }
        const isTopLeft = rr === 0 && cc === 0;
        const isContinuationCol = cc > 0 && colSpan > 1;
        const isContinuationRow = rr > 0 && rowSpan > 1;
        rowChildren.push(
          patchMergeCell(child, {
            gridSpan: isTopLeft && colSpan > 1 ? String(colSpan) : void 0,
            rowSpan: isTopLeft && rowSpan > 1 ? String(rowSpan) : void 0,
            hMerge: !isTopLeft && isContinuationCol ? "1" : void 0,
            vMerge: !isTopLeft && isContinuationRow ? "1" : void 0
          })
        );
        cellIdx += 1;
        continue;
      }
      rowChildren.push(child);
    }
    return replaceRowAt(currentTable, rowIndex, setChildren(rowEl, rowChildren));
  };
  const rowIndices = Array.from({ length: rowSpan }, (_, i) => i);
  return rowIndices.reduce(processRow, table);
}
function applySplitRange({
  table,
  startRow,
  startCol,
  rowSpan,
  colSpan
}) {
  const rows = getTableRows(table);
  if (rowSpan < 1 || colSpan < 1) {
    throw new Error("split: rowSpan and colSpan must be >= 1");
  }
  if (startRow < 0 || startCol < 0) {
    throw new Error("split: startRow/startCol must be >= 0");
  }
  if (startRow + rowSpan > rows.length) {
    throw new Error("split: row range out of bounds");
  }
  const firstRowCells = getRowCells(rows[startRow]);
  if (startCol + colSpan > firstRowCells.length) {
    throw new Error("split: column range out of bounds");
  }
  const processRow = (currentTable, r) => {
    const rowIndex = startRow + r;
    const rowEl = rows[rowIndex];
    const cells = getRowCells(rowEl);
    const rowChildren = [];
    let cellIdx = 0;
    for (const child of rowEl.children) {
      if (isXmlElement(child) && child.name === "a:tc") {
        const originalCell = cells[cellIdx];
        const rr = rowIndex - startRow;
        const cc = cellIdx - startCol;
        const inRange = rr >= 0 && rr < rowSpan && cc >= 0 && cc < colSpan;
        if (inRange) {
          rowChildren.push(
            patchMergeCell(originalCell, {
              gridSpan: void 0,
              rowSpan: void 0,
              hMerge: void 0,
              vMerge: void 0
            })
          );
        } else {
          rowChildren.push(originalCell);
        }
        cellIdx += 1;
        continue;
      }
      rowChildren.push(child);
    }
    return replaceRowAt(currentTable, rowIndex, setChildren(rowEl, rowChildren));
  };
  const rowIndices = Array.from({ length: rowSpan }, (_, i) => i);
  return rowIndices.reduce(processRow, table);
}
function patchTable(tableElement, changes) {
  requireTable$1(tableElement);
  let next = tableElement;
  for (const change of changes) {
    switch (change.type) {
      case "cell": {
        const rows = getTableRows(next);
        const rowEl = rows[change.row];
        if (!rowEl) {
          throw new Error(`patchTable: row out of range: ${change.row}`);
        }
        const cells = getRowCells(rowEl);
        const cellEl = cells[change.col];
        if (!cellEl) {
          throw new Error(`patchTable: col out of range: ${change.col}`);
        }
        const patchedCell = patchTableCell(cellEl, change.content);
        next = replaceRowAt(next, change.row, replaceCellAt(rowEl, change.col, patchedCell));
        break;
      }
      case "addRow":
        next = addTableRow(next, change.row, change.position);
        break;
      case "removeRow":
        next = removeRow(next, change.rowIndex);
        break;
      case "addColumn":
        next = addTableColumn(next, change.column, change.position);
        break;
      case "removeColumn":
        next = removeColumn(next, change.colIndex);
        break;
      case "merge":
        next = applyMergeRange({
          table: next,
          startRow: change.startRow,
          startCol: change.startCol,
          rowSpan: change.rowSpan,
          colSpan: change.colSpan
        });
        break;
      case "split":
        next = applySplitRange({
          table: next,
          startRow: change.startRow,
          startCol: change.startCol,
          rowSpan: change.rowSpan,
          colSpan: change.colSpan
        });
        break;
      default:
        assertNever(change);
    }
  }
  return next;
}
function requireTable(tableElement) {
  if (tableElement.name !== "a:tbl") {
    throw new Error(`patchTableStyleId: expected a:tbl, got ${tableElement.name}`);
  }
}
function ensureTblPr(table) {
  const tblPr = getChild(table, "a:tblPr");
  if (tblPr) {
    return table;
  }
  const nextChildren = [createElement("a:tblPr"), ...table.children];
  return setChildren(table, nextChildren);
}
function patchTableStyleId(tableElement, styleId2) {
  requireTable(tableElement);
  const withTblPr = ensureTblPr(tableElement);
  const tblPr = getChild(withTblPr, "a:tblPr");
  if (!tblPr) {
    throw new Error("patchTableStyleId: missing a:tblPr after ensure");
  }
  if (!styleId2) {
    const cleaned = removeChildren(tblPr, (child) => isXmlElement(child) && child.name === "a:tableStyleId");
    return replaceChildByName(withTblPr, "a:tblPr", cleaned);
  }
  const tableStyleId = createElement("a:tableStyleId", {}, [createText(styleId2)]);
  if (getChild(tblPr, "a:tableStyleId")) {
    const nextTblPr2 = replaceChildByName(tblPr, "a:tableStyleId", tableStyleId);
    return replaceChildByName(withTblPr, "a:tblPr", nextTblPr2);
  }
  const nextTblPr = setChildren(tblPr, [...tblPr.children, tableStyleId]);
  return replaceChildByName(withTblPr, "a:tblPr", nextTblPr);
}
function requireDataModelRoot(dataXml) {
  const root = getByPath(dataXml, ["dgm:dataModel"]);
  if (!root) {
    throw new Error("DiagramPatcher: missing dgm:dataModel root");
  }
  return root;
}
function createDiagramText(text) {
  return createElement("dgm:t", {}, [
    createElement("a:bodyPr"),
    createElement("a:lstStyle"),
    createElement("a:p", {}, [createElement("a:r", {}, [createElement("a:t", {}, [createText(text)])])])
  ]);
}
function hasPoint(ptLst, nodeId) {
  return getChildren(ptLst, "dgm:pt").some((pt2) => pt2.attrs.modelId === nodeId);
}
function patchPointText(pt2, text) {
  const t = getChild(pt2, "dgm:t");
  const nextT = createDiagramText(text);
  if (t) {
    return setChildren(
      pt2,
      pt2.children.map((c) => isXmlElement(c) && c.name === "dgm:t" ? nextT : c)
    );
  }
  return setChildren(pt2, [...pt2.children, nextT]);
}
function addConnection({ cxnLst, srcId, destId, connectionType }) {
  const existing = getChildren(cxnLst, "dgm:cxn").some(
    (cxn2) => cxn2.attrs.srcId === srcId && cxn2.attrs.destId === destId && cxn2.attrs.type === connectionType
  );
  if (existing) {
    return cxnLst;
  }
  const cxn = createElement("dgm:cxn", { srcId, destId, type: connectionType });
  return setChildren(cxnLst, [...cxnLst.children, cxn]);
}
function removeConnectionsForNode(cxnLst, nodeId) {
  const next = cxnLst.children.filter((c) => {
    if (!isXmlElement(c) || c.name !== "dgm:cxn") {
      return true;
    }
    return c.attrs.srcId !== nodeId && c.attrs.destId !== nodeId;
  });
  return setChildren(cxnLst, next);
}
function mapPointsWithIndex(children2, targetIdx, text) {
  const result = [];
  const acc = { ptIndex: -1 };
  for (const c of children2) {
    if (!isXmlElement(c) || c.name !== "dgm:pt") {
      result.push(c);
      continue;
    }
    acc.ptIndex += 1;
    result.push(acc.ptIndex === targetIdx ? patchPointText(c, text) : c);
  }
  return result;
}
function patchDiagramNodeText(dataXml, nodeId, text) {
  if (!nodeId) {
    throw new Error("patchDiagramNodeText: nodeId is required");
  }
  if (text === void 0) {
    throw new Error("patchDiagramNodeText: text is required");
  }
  return updateDocumentRoot(dataXml, (root) => {
    const dataModel = root.name === "dgm:dataModel" ? root : requireDataModelRoot(dataXml);
    const ptLst = getChild(dataModel, "dgm:ptLst");
    if (!ptLst) {
      throw new Error("patchDiagramNodeText: missing dgm:ptLst");
    }
    const pts = getChildren(ptLst, "dgm:pt");
    const idx = pts.findIndex((pt2) => pt2.attrs.modelId === nodeId);
    if (idx < 0) {
      throw new Error(`patchDiagramNodeText: node not found: ${nodeId}`);
    }
    const nextPtLstChildren = mapPointsWithIndex(ptLst.children, idx, text);
    const nextPtLst = setChildren(ptLst, nextPtLstChildren);
    return setChildren(
      dataModel,
      dataModel.children.map((c) => isXmlElement(c) && c.name === "dgm:ptLst" ? nextPtLst : c)
    );
  });
}
function addDiagramNode({ dataXml, parentId, nodeId, text }) {
  if (!parentId) {
    throw new Error("addNode: parentId is required");
  }
  if (!nodeId) {
    throw new Error("addNode: nodeId is required");
  }
  return updateDocumentRoot(dataXml, (root) => {
    const dataModel = root.name === "dgm:dataModel" ? root : requireDataModelRoot(dataXml);
    const ptLst = getChild(dataModel, "dgm:ptLst");
    if (!ptLst) {
      throw new Error("addNode: missing dgm:ptLst");
    }
    const cxnLst = getChild(dataModel, "dgm:cxnLst") ?? createElement("dgm:cxnLst");
    if (hasPoint(ptLst, nodeId)) {
      throw new Error(`addNode: nodeId already exists: ${nodeId}`);
    }
    if (!hasPoint(ptLst, parentId)) {
      throw new Error(`addNode: parentId not found: ${parentId}`);
    }
    const pt2 = createElement("dgm:pt", { modelId: nodeId, type: "node" }, [createDiagramText(text)]);
    const nextPtLst = setChildren(ptLst, [...ptLst.children, pt2]);
    const nextCxnLst = addConnection({ cxnLst, srcId: parentId, destId: nodeId, connectionType: "parOf" });
    const nextChildren = dataModel.children.map((c) => {
      if (!isXmlElement(c)) {
        return c;
      }
      if (c.name === "dgm:ptLst") {
        return nextPtLst;
      }
      if (c.name === "dgm:cxnLst") {
        return nextCxnLst;
      }
      return c;
    });
    if (!getChild(dataModel, "dgm:cxnLst")) {
      nextChildren.push(nextCxnLst);
    }
    return setChildren(dataModel, nextChildren);
  });
}
function removeDiagramNode(dataXml, nodeId) {
  if (!nodeId) {
    throw new Error("removeNode: nodeId is required");
  }
  return updateDocumentRoot(dataXml, (root) => {
    const dataModel = root.name === "dgm:dataModel" ? root : requireDataModelRoot(dataXml);
    const ptLst = getChild(dataModel, "dgm:ptLst");
    if (!ptLst) {
      throw new Error("removeNode: missing dgm:ptLst");
    }
    const pts = getChildren(ptLst, "dgm:pt");
    const exists = pts.some((pt2) => pt2.attrs.modelId === nodeId);
    if (!exists) {
      throw new Error(`removeNode: node not found: ${nodeId}`);
    }
    const nextPtLst = setChildren(
      ptLst,
      ptLst.children.filter((c) => !(isXmlElement(c) && c.name === "dgm:pt" && c.attrs.modelId === nodeId))
    );
    const cxnLst = getChild(dataModel, "dgm:cxnLst");
    const nextCxnLst = cxnLst ? removeConnectionsForNode(cxnLst, nodeId) : void 0;
    return setChildren(
      dataModel,
      dataModel.children.map((c) => {
        if (!isXmlElement(c)) {
          return c;
        }
        if (c.name === "dgm:ptLst") {
          return nextPtLst;
        }
        if (c.name === "dgm:cxnLst" && nextCxnLst) {
          return nextCxnLst;
        }
        return c;
      })
    );
  });
}
function setDiagramConnection({ dataXml, srcId, destId, connectionType }) {
  if (!srcId || !destId) {
    throw new Error("setConnection: srcId and destId are required");
  }
  if (!connectionType) {
    throw new Error("setConnection: connectionType is required");
  }
  return updateDocumentRoot(dataXml, (root) => {
    const dataModel = root.name === "dgm:dataModel" ? root : requireDataModelRoot(dataXml);
    const ptLst = getChild(dataModel, "dgm:ptLst");
    if (!ptLst) {
      throw new Error("setConnection: missing dgm:ptLst");
    }
    if (!hasPoint(ptLst, srcId) || !hasPoint(ptLst, destId)) {
      throw new Error("setConnection: srcId/destId must exist in dgm:ptLst");
    }
    const cxnLst = getChild(dataModel, "dgm:cxnLst") ?? createElement("dgm:cxnLst");
    const nextCxnLst = addConnection({ cxnLst, srcId, destId, connectionType });
    const hasCxnLst = getChild(dataModel, "dgm:cxnLst") !== void 0;
    if (hasCxnLst) {
      const nextChildren2 = dataModel.children.map((c) => isXmlElement(c) && c.name === "dgm:cxnLst" ? nextCxnLst : c);
      return setChildren(dataModel, nextChildren2);
    }
    const nextChildren = [...dataModel.children, nextCxnLst];
    return setChildren(dataModel, nextChildren);
  });
}
function applyDiagramChange(dataXml, change) {
  switch (change.type) {
    case "nodeText":
      return patchDiagramNodeText(dataXml, change.nodeId, change.text);
    case "addNode":
      return addDiagramNode({
        dataXml,
        parentId: change.parentId,
        nodeId: change.nodeId,
        text: change.text
      });
    case "removeNode":
      return removeDiagramNode(dataXml, change.nodeId);
    case "setConnection":
      return setDiagramConnection({
        dataXml,
        srcId: change.srcId,
        destId: change.destId,
        connectionType: change.connectionType
      });
  }
}
function patchDiagram(diagramFiles, changes) {
  const nextData = changes.reduce(applyDiagramChange, diagramFiles.data);
  return {
    ...diagramFiles,
    data: nextData
  };
}
function cloneNode(node) {
  if (!isXmlElement(node)) {
    return { ...node };
  }
  return createElement(node.name, { ...node.attrs }, node.children.map(cloneNode));
}
function requireChild$1(parent, name, context) {
  const child = getChild(parent, name);
  if (!child) {
    throw new Error(`${context}: missing required child: ${name}`);
  }
  return child;
}
function requireChartRoot(chartXml) {
  const chartSpace = getByPath(chartXml, ["c:chartSpace"]);
  if (!chartSpace) {
    throw new Error("patchChartData: missing c:chartSpace root");
  }
  return chartSpace;
}
function getPlotArea(chartSpace) {
  const chart = requireChild$1(chartSpace, "c:chart", "patchChartData");
  return requireChild$1(chart, "c:plotArea", "patchChartData");
}
function getSeriesContainers(plotArea) {
  return plotArea.children.filter((c) => {
    if (!isXmlElement(c)) {
      return false;
    }
    return getChild(c, "c:ser") !== void 0;
  });
}
function patchPlotAreaSeriesContainers(plotArea, containers, data) {
  const patchedContainers = /* @__PURE__ */ new Map();
  for (const container of containers) {
    patchedContainers.set(container.name, patchContainerSeries(container, data));
  }
  const nextChildren = plotArea.children.map((child) => {
    if (!isXmlElement(child)) {
      return child;
    }
    const patched = patchedContainers.get(child.name);
    return patched ?? child;
  });
  return setChildren(plotArea, nextChildren);
}
function setOrAddSimpleValChild(parent, name, val) {
  const existing = getChild(parent, name);
  if (existing) {
    return replaceChildByName(parent, name, createElement(name, { ...existing.attrs, val }));
  }
  return setChildren(parent, [...parent.children, createElement(name, { val })]);
}
function serializePtList(ptName, values) {
  return values.map(
    (value, idx) => createElement(ptName, { idx: String(idx) }, [createElement("c:v", {}, [createText(value)])])
  );
}
function patchCache(cache, values) {
  const preserved = cache.children.filter((c) => {
    if (!isXmlElement(c)) {
      return true;
    }
    return c.name !== "c:ptCount" && c.name !== "c:pt";
  });
  return createElement(cache.name, { ...cache.attrs }, [
    createElement("c:ptCount", { val: String(values.length) }),
    ...serializePtList("c:pt", values),
    ...preserved
  ]);
}
function patchCategoryElement(cat, categories) {
  const strRef = getChild(cat, "c:strRef");
  if (strRef) {
    const strCache = getChild(strRef, "c:strCache");
    if (!strCache) {
      throw new Error("patchChartData: c:strRef without c:strCache is not supported");
    }
    const nextStrRef = replaceChildByName(strRef, "c:strCache", patchCache(strCache, categories));
    return replaceChildByName(cat, "c:strRef", nextStrRef);
  }
  const strLit = getChild(cat, "c:strLit");
  if (strLit) {
    return replaceChildByName(cat, "c:strLit", patchCache(strLit, categories));
  }
  return createElement(cat.name, { ...cat.attrs }, [
    createElement("c:strLit", {}, [
      createElement("c:ptCount", { val: String(categories.length) }),
      ...serializePtList("c:pt", categories)
    ])
  ]);
}
function patchValuesElement(val, values) {
  const strValues = values.map((v) => String(v));
  const numRef = getChild(val, "c:numRef");
  if (numRef) {
    const numCache = getChild(numRef, "c:numCache");
    if (!numCache) {
      throw new Error("patchChartData: c:numRef without c:numCache is not supported");
    }
    const nextNumRef = replaceChildByName(numRef, "c:numCache", patchCache(numCache, strValues));
    return replaceChildByName(val, "c:numRef", nextNumRef);
  }
  const numLit = getChild(val, "c:numLit");
  if (numLit) {
    return replaceChildByName(val, "c:numLit", patchCache(numLit, strValues));
  }
  return createElement(val.name, { ...val.attrs }, [
    createElement("c:numLit", {}, [
      createElement("c:ptCount", { val: String(values.length) }),
      ...serializePtList("c:pt", strValues)
    ])
  ]);
}
function patchSeriesName(tx, seriesName) {
  const v = getChild(tx, "c:v");
  if (v) {
    return replaceChildByName(tx, "c:v", createElement("c:v", {}, [createText(seriesName)]));
  }
  const strRef = getChild(tx, "c:strRef");
  if (strRef) {
    const strCache = getChild(strRef, "c:strCache");
    if (strCache) {
      const nextStrRef = replaceChildByName(strRef, "c:strCache", patchCache(strCache, [seriesName]));
      return replaceChildByName(tx, "c:strRef", nextStrRef);
    }
  }
  return createElement(tx.name, { ...tx.attrs }, [createElement("c:v", {}, [createText(seriesName)])]);
}
function patchOrCreateChildWithUpdater(options) {
  const existing = getChild(options.parent, options.name);
  if (!existing) {
    return setChildren(options.parent, [...options.parent.children, options.create()]);
  }
  return replaceChildByName(options.parent, options.name, options.updater(existing));
}
function patchSeriesData(seriesElement, series) {
  if (seriesElement.name !== "c:ser") {
    throw new Error(`patchSeriesData: expected c:ser, got ${seriesElement.name}`);
  }
  const ref = { value: seriesElement };
  if (getChild(ref.value, "c:idx")) {
    ref.value = setOrAddSimpleValChild(ref.value, "c:idx", getChild(ref.value, "c:idx")?.attrs.val ?? "0");
  }
  if (getChild(ref.value, "c:order")) {
    ref.value = setOrAddSimpleValChild(ref.value, "c:order", getChild(ref.value, "c:order")?.attrs.val ?? "0");
  }
  ref.value = patchOrCreateChildWithUpdater({
    parent: ref.value,
    name: "c:tx",
    updater: (tx) => patchSeriesName(tx, series.name),
    create: () => createElement("c:tx", {}, [createElement("c:v", {}, [createText(series.name)])])
  });
  ref.value = patchOrCreateChildWithUpdater({
    parent: ref.value,
    name: "c:val",
    updater: (val) => patchValuesElement(val, series.values),
    create: () => createElement("c:val", {}, [
      createElement("c:numLit", {}, [
        createElement("c:ptCount", { val: String(series.values.length) }),
        ...serializePtList("c:pt", series.values.map(String))
      ])
    ])
  });
  return ref.value;
}
function setSeriesIndex(ser, index) {
  const ref = { value: ser };
  ref.value = setOrAddSimpleValChild(ref.value, "c:idx", String(index));
  ref.value = setOrAddSimpleValChild(ref.value, "c:order", String(index));
  return ref.value;
}
function ensureSeriesCount(seriesContainer, desiredCount) {
  const existingSeries = getChildren(seriesContainer, "c:ser");
  if (existingSeries.length >= desiredCount) {
    return seriesContainer;
  }
  if (existingSeries.length === 0) {
    throw new Error("patchChartData: cannot add series when chart has no existing c:ser template");
  }
  const template = existingSeries[0];
  const additional = [];
  for (let i = existingSeries.length; i < desiredCount; i += 1) {
    additional.push(setSeriesIndex(cloneNode(template), i));
  }
  const nextChildren = [...seriesContainer.children, ...additional];
  return setChildren(seriesContainer, nextChildren);
}
function patchContainerSeries(container, data) {
  const next = ensureSeriesCount(container, data.series.length);
  const seriesElements = getChildren(next, "c:ser");
  const patchedSeries = seriesElements.map((ser, idx) => {
    const s = data.series[idx];
    if (!s) {
      return ser;
    }
    const withIndex = setSeriesIndex(ser, idx);
    return patchSeriesData(withIndex, s);
  });
  const seriesIdx = { value: 0 };
  const nextChildren = next.children.map((child) => {
    if (!isXmlElement(child) || child.name !== "c:ser") {
      return child;
    }
    const replacement = patchedSeries[seriesIdx.value];
    seriesIdx.value += 1;
    return replacement ?? child;
  });
  return setChildren(next, nextChildren);
}
function patchPlotAreaSeriesCategories(plotArea, categories) {
  const patchSeries = (ser) => {
    const cat = getChild(ser, "c:cat");
    if (!cat) {
      return ser;
    }
    return replaceChildByName(ser, "c:cat", patchCategoryElement(cat, categories));
  };
  const patchAny = (node) => {
    if (!isXmlElement(node)) {
      return node;
    }
    const nextChildren = node.children.map(patchAny);
    const nextEl = createElement(node.name, { ...node.attrs }, nextChildren);
    if (node.name !== "c:ser") {
      return nextEl;
    }
    return patchSeries(nextEl);
  };
  return patchAny(plotArea);
}
function patchAllSeriesCategories(chartSpace, categories) {
  const plotArea = getPlotArea(chartSpace);
  const seriesElements = findElements(plotArea, (el) => el.name === "c:ser");
  if (seriesElements.length === 0) {
    return chartSpace;
  }
  const patchedPlotArea = patchPlotAreaSeriesCategories(plotArea, categories);
  const chart = requireChild$1(chartSpace, "c:chart", "patchChartData");
  const nextChart = replaceChildByName(chart, "c:plotArea", patchedPlotArea);
  return replaceChildByName(chartSpace, "c:chart", nextChart);
}
function validateChartData(data) {
  if (!Array.isArray(data.categories)) {
    throw new Error("patchChartData: data.categories must be an array");
  }
  if (!Array.isArray(data.series)) {
    throw new Error("patchChartData: data.series must be an array");
  }
  for (const [idx, s] of data.series.entries()) {
    if (!s) {
      throw new Error(`patchChartData: series[${idx}] is missing`);
    }
    if (s.values.length !== data.categories.length) {
      throw new Error(
        `patchChartData: series[${idx}].values length (${s.values.length}) must match categories length (${data.categories.length})`
      );
    }
  }
}
function patchChartData(chartXml, data) {
  validateChartData(data);
  return updateDocumentRoot(chartXml, (root) => {
    if (root.name !== "c:chartSpace") {
      throw new Error(`patchChartData: expected c:chartSpace root, got ${root.name}`);
    }
    const plotArea = getPlotArea(root);
    const containers = getSeriesContainers(plotArea);
    if (containers.length === 0) {
      throw new Error("patchChartData: no series container found under c:plotArea");
    }
    const patchedPlotArea = patchPlotAreaSeriesContainers(plotArea, containers, data);
    const chart = requireChild$1(root, "c:chart", "patchChartData");
    const nextChart = replaceChildByName(chart, "c:plotArea", patchedPlotArea);
    const withSeries = replaceChildByName(root, "c:chart", nextChart);
    return patchAllSeriesCategories(withSeries, data.categories);
  });
}
function patchChartTitle(chartXml, title) {
  if (!title) {
    throw new Error("patchChartTitle: title is required");
  }
  return updateDocumentRoot(chartXml, (root) => {
    const chartSpace = root.name === "c:chartSpace" ? root : requireChartRoot(chartXml);
    const chart = requireChild$1(chartSpace, "c:chart", "patchChartTitle");
    const titleEl = createElement("c:title", {}, [
      createElement("c:tx", {}, [
        createElement("c:rich", {}, [
          createElement("a:bodyPr"),
          createElement("a:lstStyle"),
          createElement("a:p", {}, [createElement("a:r", {}, [createElement("a:t", {}, [createText(title)])])])
        ])
      ]),
      createElement("c:layout"),
      createElement("c:overlay", { val: "0" })
    ]);
    if (getChild(chart, "c:title")) {
      const nextChart2 = replaceChildByName(chart, "c:title", titleEl);
      return replaceChildByName(chartSpace, "c:chart", nextChart2);
    }
    const nextChart = setChildren(chart, [...chart.children, titleEl]);
    return replaceChildByName(chartSpace, "c:chart", nextChart);
  });
}
function patchChartStyle(chartXml, styleId2) {
  if (!Number.isFinite(styleId2)) {
    throw new Error("patchChartStyle: styleId must be a finite number");
  }
  return updateDocumentRoot(chartXml, (root) => {
    const chartSpace = root.name === "c:chartSpace" ? root : requireChartRoot(chartXml);
    const styleEl = getChild(chartSpace, "c:style");
    if (styleEl) {
      return replaceChildByName(
        chartSpace,
        "c:style",
        createElement("c:style", { ...styleEl.attrs, val: String(styleId2) })
      );
    }
    return setChildren(chartSpace, [...chartSpace.children, createElement("c:style", { val: String(styleId2) })]);
  });
}
function requireChild(parent, name, context) {
  const child = getChild(parent, name);
  if (!child) {
    throw new Error(`${context}: missing required child: ${name}`);
  }
  return child;
}
function patchGraphicFrameTitle(graphicFrame, title) {
  const nv = requireChild(graphicFrame, "p:nvGraphicFramePr", "patchChartElement");
  const cNvPr = requireChild(nv, "p:cNvPr", "patchChartElement");
  const nextCNvPr = { ...cNvPr, attrs: { ...cNvPr.attrs, name: title } };
  return updateChildByName(
    graphicFrame,
    "p:nvGraphicFramePr",
    (nvEl) => replaceChildByName(nvEl, "p:cNvPr", nextCNvPr)
  );
}
function applyChartElementChange(frame, change) {
  switch (change.type) {
    case "title":
      return patchGraphicFrameTitle(frame, change.value);
    case "data":
    case "style":
      return frame;
  }
}
function patchChartElement(graphicFrame, changes) {
  if (graphicFrame.name !== "p:graphicFrame") {
    throw new Error(`patchChartElement: expected p:graphicFrame, got ${graphicFrame.name}`);
  }
  return changes.reduce((frame, change) => applyChartElementChange(frame, change), graphicFrame);
}
function patchChartTransform(graphicFrame, transform) {
  if (graphicFrame.name !== "p:graphicFrame") {
    throw new Error(`patchChartTransform: expected p:graphicFrame, got ${graphicFrame.name}`);
  }
  const xfrm = getChild(graphicFrame, "p:xfrm");
  if (!xfrm || !isXmlElement(xfrm)) {
    throw new Error("patchChartTransform: missing p:xfrm");
  }
  const patched = patchTransformElement(xfrm, transform);
  return replaceChildByName(graphicFrame, "p:xfrm", patched);
}
function applyChartXmlChange(doc, change) {
  switch (change.type) {
    case "title":
      return patchChartTitle(doc, change.value);
    case "data":
      return patchChartData(doc, change.data);
    case "style":
      return patchChartStyle(doc, change.style.styleId);
  }
}
function patchChart(target, changes) {
  const nextFrame = patchChartElement(target.graphicFrame, changes);
  const nextChartXml = changes.reduce((doc, change) => applyChartXmlChange(doc, change), target.chartXml);
  return { graphicFrame: nextFrame, chartXml: nextChartXml };
}
var ENTRANCE_PRESET_IDS = {
  appear: 1,
  fly: 2,
  blinds: 3,
  box: 4,
  checkerboard: 5,
  circle: 6,
  crawl: 7,
  diamond: 8,
  dissolve: 9,
  fade: 10,
  flash: 11,
  peek: 12,
  plus: 13,
  randomBars: 14,
  splits: 15,
  strips: 16,
  wedge: 17,
  wheel: 18,
  wipe: 19,
  zoom: 20,
  float: 21,
  grow: 22,
  bounce: 23,
  swivel: 24,
  fadeZoom: 53
};
var EMPHASIS_PRESET_IDS = {
  pulse: 1,
  colorPulse: 2,
  teeter: 3,
  spin: 4,
  grow: 5,
  shrink: 6,
  transparency: 7,
  boldFlash: 8,
  blink: 9,
  wave: 10
};
var EXIT_PRESET_IDS = {
  disappear: 1,
  fly: 2,
  blinds: 3,
  box: 4,
  checkerboard: 5,
  circle: 6,
  crawl: 7,
  diamond: 8,
  dissolve: 9,
  fade: 10,
  flash: 11,
  peek: 12,
  plus: 13,
  randomBars: 14,
  splits: 15,
  strips: 16,
  wedge: 17,
  wheel: 18,
  wipe: 19,
  zoom: 20
};
var DIRECTION_SUBTYPES = {
  left: 1,
  right: 2,
  top: 3,
  bottom: 4,
  topLeft: 5,
  topRight: 6,
  bottomLeft: 7,
  bottomRight: 8,
  in: 16,
  out: 32
};
function getPresetId(effectClass, effect) {
  switch (effectClass) {
    case "entrance":
      return ENTRANCE_PRESET_IDS[effect] ?? 1;
    case "exit":
      return EXIT_PRESET_IDS[effect] ?? 1;
    case "emphasis":
      return EMPHASIS_PRESET_IDS[effect] ?? 1;
    default:
      return 1;
  }
}
var timeNodeIdCounter = 1;
function nextTimeNodeId() {
  return timeNodeIdCounter++;
}
function resetTimeNodeIdCounter() {
  timeNodeIdCounter = 1;
}
function buildShapeTarget(shapeId) {
  return {
    type: "shape",
    shapeId
  };
}
function resolveEffectFilter(effect) {
  switch (effect) {
    case "wipe":
      return "wipe(right)";
    case "blinds":
      return "blinds(horizontal)";
    case "fly":
      return "slide(fromBottom)";
    case "zoom":
      return "zoom";
    case "wheel":
      return "wheel(1)";
    case "randomBars":
      return "randombar(horizontal)";
    default:
      return "fade";
  }
}
function buildEffectBehavior(spec) {
  const target = buildShapeTarget(spec.shapeId);
  const duration = spec.duration ?? 500;
  const presetId = getPresetId(spec.class, spec.effect);
  const subtype = spec.direction ? DIRECTION_SUBTYPES[spec.direction] : void 0;
  const id = nextTimeNodeId();
  const filter = resolveEffectFilter(spec.effect);
  const transition = spec.class === "exit" ? "out" : "in";
  const effectNode = {
    type: "animateEffect",
    id,
    duration,
    fill: "hold",
    target,
    transition,
    filter,
    preset: {
      id: presetId,
      class: spec.class,
      subtype
    },
    autoReverse: spec.autoReverse,
    repeatCount: spec.repeat
  };
  return effectNode;
}
function buildVisibilitySet(shapeId, visible) {
  return {
    type: "set",
    id: nextTimeNodeId(),
    duration: 1,
    fill: "hold",
    target: buildShapeTarget(shapeId),
    attribute: "style.visibility",
    value: visible ? "visible" : "hidden"
  };
}
function resolveStartConditions(trigger, delay) {
  switch (trigger) {
    case "afterPrevious":
      return [{ event: "onEnd", delay }];
    case "withPrevious":
      return [{ delay }];
    default:
      return [{ event: "onClick", delay }];
  }
}
function buildEffectContainer(spec) {
  const effectNode = buildEffectBehavior(spec);
  const containerId = nextTimeNodeId();
  const children2 = [];
  if (spec.class === "entrance") {
    children2.push(buildVisibilitySet(spec.shapeId, true));
  }
  children2.push(effectNode);
  if (spec.class === "exit") {
    children2.push(buildVisibilitySet(spec.shapeId, false));
  }
  const delayValue = spec.delay ?? 0;
  const startConditions = resolveStartConditions(spec.trigger, delayValue);
  return {
    type: "parallel",
    id: containerId,
    fill: "hold",
    children: children2,
    startConditions,
    nodeType: spec.trigger === "onClick" ? "clickEffect" : spec.trigger === "withPrevious" ? "withEffect" : "afterEffect"
  };
}
function buildClickGroups(animations) {
  const { groups, current } = animations.reduce(
    (acc, anim) => {
      const container = buildEffectContainer(anim);
      if (anim.trigger === "onClick" || anim.trigger === void 0) {
        const nextGroups = acc.current.length > 0 ? [...acc.groups, acc.current] : acc.groups;
        return { groups: nextGroups, current: [container] };
      }
      return { groups: acc.groups, current: [...acc.current, container] };
    },
    { groups: [], current: [] }
  );
  return current.length > 0 ? [...groups, current] : groups;
}
function buildTimingTree(animations) {
  resetTimeNodeIdCounter();
  if (animations.length === 0) {
    return {};
  }
  const clickGroups = buildClickGroups(animations);
  const sequenceChildren = clickGroups.map((group, index) => {
    if (group.length === 1) {
      return group[0];
    }
    return {
      type: "parallel",
      id: nextTimeNodeId(),
      fill: "hold",
      children: group,
      nodeType: index === 0 ? "clickEffect" : "afterEffect"
    };
  });
  const mainSeq = {
    type: "sequence",
    id: nextTimeNodeId(),
    duration: "indefinite",
    nodeType: "mainSeq",
    children: sequenceChildren,
    concurrent: false,
    nextAction: "seek",
    prevAction: "skip"
  };
  const root = {
    type: "parallel",
    id: nextTimeNodeId(),
    duration: "indefinite",
    nodeType: "tmRoot",
    children: [mainSeq]
  };
  return {
    rootTimeNode: root
  };
}
function addAnimationsToSlide(slideDoc, animations) {
  if (animations.length === 0) {
    return slideDoc;
  }
  const timing = buildTimingTree(animations);
  const timingEl = serializeTiming(timing);
  if (!timingEl) {
    return slideDoc;
  }
  const timingElWithNs = {
    ...timingEl,
    attrs: {
      ...timingEl.attrs,
      "xmlns:a": "http://schemas.openxmlformats.org/drawingml/2006/main"
    }
  };
  const newChildren = slideDoc.children.map((child) => {
    if (!isXmlElement(child) || child.name !== "p:sld") {
      return child;
    }
    const filteredChildren = child.children.filter((c) => !isXmlElement(c) || c.name !== "p:timing");
    return {
      ...child,
      children: [...filteredChildren, timingElWithNs]
    };
  });
  return {
    ...slideDoc,
    children: newChildren
  };
}
var COMMENT_CONTENT_TYPE = PRESENTATIONML_CONTENT_TYPES.comments;
var COMMENT_AUTHORS_CONTENT_TYPE = PRESENTATIONML_CONTENT_TYPES.commentAuthors;
var COMMENT_REL_TYPE = PRESENTATIONML_RELATIONSHIP_TYPES.comments;
var COMMENT_AUTHORS_REL_TYPE = PRESENTATIONML_RELATIONSHIP_TYPES.commentAuthors;
function getSlideRelsPath$2(slidePath) {
  return slidePath.replace(/\/([^/]+)\.xml$/, "/_rels/$1.xml.rels");
}
function getNextCommentIndex(pkg, slidePath) {
  const slideNum = slidePath.match(/slide(\d+)\.xml$/)?.[1] ?? "1";
  const commentsPath = `ppt/comments/comment${slideNum}.xml`;
  const commentsXml = pkg.readText(commentsPath);
  if (!commentsXml) {
    return 1;
  }
  const doc = parseXml(commentsXml);
  const root = doc.children.find(isXmlElement);
  if (!root) {
    return 1;
  }
  const comments = getChildren(root, "p:cm");
  const maxIdx = comments.reduce((max2, cm) => {
    const idx = parseInt(cm.attrs.idx ?? "0", 10);
    return idx > max2 ? idx : max2;
  }, 0);
  return maxIdx + 1;
}
function ensureCommentAuthors(pkg) {
  const authorsPath = "ppt/commentAuthors.xml";
  const authorsXml = pkg.readText(authorsPath);
  if (authorsXml) {
    const doc = parseXml(authorsXml);
    const root = doc.children.find(isXmlElement);
    if (root) {
      const list = parseCommentAuthorList(root);
      return { authors: [...list.authors], doc };
    }
  }
  return { authors: [], doc: createCommentAuthorListDocument([]) };
}
function findOrCreateAuthor(authors, name, initials) {
  const existing = authors.find((a) => a.name === name);
  if (existing) {
    return existing;
  }
  const maxId = authors.reduce((max2, a) => Math.max(max2, a.id), -1);
  const newAuthor = {
    id: maxId + 1,
    name,
    initials: initials ?? name.slice(0, 2).toUpperCase(),
    lastIdx: 0,
    colorIndex: (maxId + 1) % 8
  };
  authors.push(newAuthor);
  return newAuthor;
}
function loadExistingComments(pkg, commentsPath) {
  const commentsXml = pkg.readText(commentsPath);
  if (!commentsXml) {
    return [];
  }
  const doc = parseXml(commentsXml);
  const root = doc.children.find(isXmlElement);
  if (!root) {
    return [];
  }
  return [...parseCommentList(root).comments];
}
function addCommentToSlide(pkg, slidePath, spec) {
  const slideNum = slidePath.match(/slide(\d+)\.xml$/)?.[1] ?? "1";
  const commentsPath = `ppt/comments/comment${slideNum}.xml`;
  const { authors } = ensureCommentAuthors(pkg);
  const author = findOrCreateAuthor(authors, spec.authorName, spec.authorInitials);
  const existingComments = loadExistingComments(pkg, commentsPath);
  const position = spec.x !== void 0 && spec.y !== void 0 ? { x: spec.x, y: spec.y } : void 0;
  const newComment = {
    authorId: author.id,
    dateTime: (/* @__PURE__ */ new Date()).toISOString(),
    idx: getNextCommentIndex(pkg, slidePath),
    position,
    text: spec.text
  };
  const comments = [...existingComments, newComment];
  const updatedAuthors = authors.map(
    (a) => a.id === author.id ? { ...a, lastIdx: Math.max(a.lastIdx ?? 0, newComment.idx ?? 0) } : a
  );
  const authorsXmlOut = serializeDocument(createCommentAuthorListDocument(updatedAuthors), {
    declaration: true,
    standalone: true
  });
  pkg.writeText("ppt/commentAuthors.xml", authorsXmlOut);
  const commentsXmlOut = serializeDocument(createCommentListDocument(comments), {
    declaration: true,
    standalone: true
  });
  pkg.writeText(commentsPath, commentsXmlOut);
  const contentTypesPath = "[Content_Types].xml";
  const contentTypesXml = pkg.readText(contentTypesPath);
  if (contentTypesXml) {
    const ctDoc = addOverride$2(
      addOverride$2(parseXml(contentTypesXml), `/${commentsPath}`, COMMENT_CONTENT_TYPE),
      "/ppt/commentAuthors.xml",
      COMMENT_AUTHORS_CONTENT_TYPE
    );
    pkg.writeText(contentTypesPath, serializeDocument(ctDoc, { declaration: true, standalone: true }));
  }
  const relsPath = getSlideRelsPath$2(slidePath);
  const relsXml = pkg.readText(relsPath);
  const relsDoc = ensureRelationshipsDocument(relsXml ? parseXml(relsXml) : null);
  const { updatedXml: newRelsDoc } = addRelationship$2(relsDoc, `../comments/comment${slideNum}.xml`, COMMENT_REL_TYPE);
  pkg.writeText(relsPath, serializeDocument(newRelsDoc, { declaration: true, standalone: true }));
  const presRelsPath = "ppt/_rels/presentation.xml.rels";
  const presRelsXml = pkg.readText(presRelsPath);
  const presRelsDoc = ensureRelationshipsDocument(presRelsXml ? parseXml(presRelsXml) : null);
  const { updatedXml: newPresRelsDoc } = addRelationship$2(presRelsDoc, "commentAuthors.xml", COMMENT_AUTHORS_REL_TYPE);
  pkg.writeText(presRelsPath, serializeDocument(newPresRelsDoc, { declaration: true, standalone: true }));
}
var NOTES_CONTENT_TYPE$1 = PRESENTATIONML_CONTENT_TYPES.notesSlide;
var NOTES_REL_TYPE$1 = PRESENTATIONML_RELATIONSHIP_TYPES.notesSlide;
var P_NS = "http://schemas.openxmlformats.org/presentationml/2006/main";
var A_NS = "http://schemas.openxmlformats.org/drawingml/2006/main";
var R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
function getSlideRelsPath$1(slidePath) {
  return slidePath.replace(/\/([^/]+)\.xml$/, "/_rels/$1.xml.rels");
}
function getNotesPath(slidePath) {
  const slideNum = slidePath.match(/slide(\d+)\.xml$/)?.[1] ?? "1";
  return `ppt/notesSlides/notesSlide${slideNum}.xml`;
}
function createNotesSlideDocument(slideRId, text) {
  const textBody = createElement("p:txBody", {}, [
    createElement("a:bodyPr"),
    createElement("a:lstStyle"),
    createElement("a:p", {}, [
      createElement("a:r", {}, [
        createElement("a:rPr", { lang: "en-US" }),
        createElement("a:t", {}, [{ type: "text", value: text }])
      ]),
      createElement("a:endParaRPr", { lang: "en-US" })
    ])
  ]);
  const notesBodyShape = createElement("p:sp", {}, [
    createElement("p:nvSpPr", {}, [
      createElement("p:cNvPr", { id: "2", name: "Notes Placeholder 2" }),
      createElement("p:cNvSpPr", {}, [createElement("a:spLocks", { noGrp: "1" })]),
      createElement("p:nvPr", {}, [createElement("p:ph", { type: "body", idx: "1" })])
    ]),
    createElement("p:spPr"),
    textBody
  ]);
  const slideImageShape = createElement("p:sp", {}, [
    createElement("p:nvSpPr", {}, [
      createElement("p:cNvPr", { id: "3", name: "Slide Image Placeholder 3" }),
      createElement("p:cNvSpPr", {}, [createElement("a:spLocks", { noGrp: "1", noRot: "1", noChangeAspect: "1" })]),
      createElement("p:nvPr", {}, [createElement("p:ph", { type: "sldImg" })])
    ]),
    createElement("p:spPr")
  ]);
  const spTree = createElement("p:spTree", {}, [
    createElement("p:nvGrpSpPr", {}, [
      createElement("p:cNvPr", { id: "1", name: "" }),
      createElement("p:cNvGrpSpPr"),
      createElement("p:nvPr")
    ]),
    createElement("p:grpSpPr", {}, [
      createElement("a:xfrm", {}, [
        createElement("a:off", { x: "0", y: "0" }),
        createElement("a:ext", { cx: "0", cy: "0" }),
        createElement("a:chOff", { x: "0", y: "0" }),
        createElement("a:chExt", { cx: "0", cy: "0" })
      ])
    ]),
    slideImageShape,
    notesBodyShape
  ]);
  const cSld = createElement("p:cSld", {}, [spTree]);
  const notes = createElement(
    "p:notes",
    {
      "xmlns:a": A_NS,
      "xmlns:r": R_NS,
      "xmlns:p": P_NS
    },
    [cSld]
  );
  return { children: [notes] };
}
function findNotesBodyPlaceholder(notesDoc) {
  const spTree = getByPath(notesDoc, ["p:notes", "p:cSld", "p:spTree"]);
  if (!spTree) {
    return null;
  }
  const shapes = getChildren(spTree, "p:sp");
  for (const sp of shapes) {
    const nvSpPr = getChild(sp, "p:nvSpPr");
    if (!nvSpPr) {
      continue;
    }
    const nvPr = getChild(nvSpPr, "p:nvPr");
    if (!nvPr) {
      continue;
    }
    const ph = getChild(nvPr, "p:ph");
    if (!ph) {
      continue;
    }
    const phType = ph.attrs.type;
    if (phType === "body" || phType === void 0) {
      return sp;
    }
  }
  return null;
}
function updateNotesText(notesDoc, text) {
  const placeholder = findNotesBodyPlaceholder(notesDoc);
  if (!placeholder) {
    return notesDoc;
  }
  const newTextBody = createElement("p:txBody", {}, [
    createElement("a:bodyPr"),
    createElement("a:lstStyle"),
    createElement("a:p", {}, [
      createElement("a:r", {}, [
        createElement("a:rPr", { lang: "en-US" }),
        createElement("a:t", {}, [{ type: "text", value: text }])
      ]),
      createElement("a:endParaRPr", { lang: "en-US" })
    ])
  ]);
  const newChildren = placeholder.children.map((child) => {
    if (isXmlElement(child) && child.name === "p:txBody") {
      return newTextBody;
    }
    return child;
  });
  const newPlaceholder = setChildren(placeholder, newChildren);
  const spTree = getByPath(notesDoc, ["p:notes", "p:cSld", "p:spTree"]);
  if (!spTree) {
    return notesDoc;
  }
  const newSpTreeChildren = spTree.children.map((child) => {
    if (child === placeholder) {
      return newPlaceholder;
    }
    return child;
  });
  const newSpTree = setChildren(spTree, newSpTreeChildren);
  const cSld = getByPath(notesDoc, ["p:notes", "p:cSld"]);
  if (!cSld) {
    return notesDoc;
  }
  const newCsldChildren = cSld.children.map((child) => {
    if (isXmlElement(child) && child.name === "p:spTree") {
      return newSpTree;
    }
    return child;
  });
  const newCsld = setChildren(cSld, newCsldChildren);
  const notes = getByPath(notesDoc, ["p:notes"]);
  if (!notes) {
    return notesDoc;
  }
  const newNotesChildren = notes.children.map((child) => {
    if (isXmlElement(child) && child.name === "p:cSld") {
      return newCsld;
    }
    return child;
  });
  const newNotes = setChildren(notes, newNotesChildren);
  return {
    children: notesDoc.children.map((child) => {
      if (isXmlElement(child) && child.name === "p:notes") {
        return newNotes;
      }
      return child;
    })
  };
}
function setSlideNotes(pkg, slidePath, spec) {
  const notesPath = getNotesPath(slidePath);
  const notesXml = pkg.readText(notesPath);
  if (notesXml) {
    const notesDoc = parseXml(notesXml);
    const updatedDoc = updateNotesText(notesDoc, spec.text);
    const updatedXml = serializeDocument(updatedDoc, { declaration: true, standalone: true });
    pkg.writeText(notesPath, updatedXml);
  } else {
    const slideRelsPath = getSlideRelsPath$1(slidePath);
    const slideRelsXml = pkg.readText(slideRelsPath);
    const slideRId = "rId1";
    const notesDoc = createNotesSlideDocument(slideRId, spec.text);
    const notesXmlOut = serializeDocument(notesDoc, { declaration: true, standalone: true });
    pkg.writeText(notesPath, notesXmlOut);
    const contentTypesPath = "[Content_Types].xml";
    const contentTypesXml = pkg.readText(contentTypesPath);
    if (contentTypesXml) {
      const ctDoc = parseXml(contentTypesXml);
      const updatedCtDoc = addOverride$2(ctDoc, `/${notesPath}`, NOTES_CONTENT_TYPE$1);
      pkg.writeText(contentTypesPath, serializeDocument(updatedCtDoc, { declaration: true, standalone: true }));
    }
    const relsDoc = ensureRelationshipsDocument(slideRelsXml ? parseXml(slideRelsXml) : null);
    const notesFilename = notesPath.split("/").pop();
    const { updatedXml: newRelsDoc } = addRelationship$2(relsDoc, `../notesSlides/${notesFilename}`, NOTES_REL_TYPE$1);
    pkg.writeText(slideRelsPath, serializeDocument(newRelsDoc, { declaration: true, standalone: true }));
    const notesRelsPath = notesPath.replace(/\/([^/]+)\.xml$/, "/_rels/$1.xml.rels");
    const slideNum = slidePath.match(/slide(\d+)\.xml$/)?.[1] ?? "1";
    const notesRelsDoc = {
      children: [
        createElement("Relationships", { xmlns: "http://schemas.openxmlformats.org/package/2006/relationships" }, [
          createElement("Relationship", {
            Id: "rId1",
            Type: PRESENTATIONML_RELATIONSHIP_TYPES.slide,
            Target: `../slides/slide${slideNum}.xml`
          })
        ])
      ]
    };
    pkg.writeText(notesRelsPath, serializeDocument(notesRelsDoc, { declaration: true, standalone: true }));
  }
}
var REL_SLIDE_LAYOUT = PRESENTATIONML_RELATIONSHIP_TYPES.slideLayout;
var REL_SLIDE_MASTER = PRESENTATIONML_RELATIONSHIP_TYPES.slideMaster;
var REL_THEME = OFFICE_RELATIONSHIP_TYPES.theme;
function readXmlOrThrow(pkg, path) {
  const text = pkg.readText(path);
  if (!text) {
    throw new Error(`Missing required XML part: ${path}`);
  }
  return parseXml(text);
}
function writeXml(pkg, path, doc) {
  const xml = serializeDocument(doc, { declaration: true, standalone: true });
  pkg.writeText(path, xml);
}
var PRESENTATION_XML_PATH$1 = "ppt/presentation.xml";
var PRESENTATION_RELS_PATH$1 = "ppt/_rels/presentation.xml.rels";
var CONTENT_TYPES_PATH$1 = "[Content_Types].xml";
var SLIDE_REL_TYPE = PRESENTATIONML_RELATIONSHIP_TYPES.slide;
var SLIDE_LAYOUT_REL_TYPE = PRESENTATIONML_RELATIONSHIP_TYPES.slideLayout;
var NOTES_REL_TYPE = PRESENTATIONML_RELATIONSHIP_TYPES.notesSlide;
var SLIDE_CONTENT_TYPE = PRESENTATIONML_CONTENT_TYPES.slide;
var NOTES_CONTENT_TYPE = PRESENTATIONML_CONTENT_TYPES.notesSlide;
var RELS_XMLNS$1 = "http://schemas.openxmlformats.org/package/2006/relationships";
function getSlideEntries$1(presentationXml) {
  const sldIdLst = getByPath(presentationXml, ["p:presentation", "p:sldIdLst"]);
  if (!sldIdLst) {
    return [];
  }
  return getChildren(sldIdLst, "p:sldId").map((el) => {
    const id = el.attrs.id;
    const rId = el.attrs["r:id"];
    if (!id || !rId) {
      throw new Error("Invalid p:sldId (missing id or r:id)");
    }
    const slideId = Number.parseInt(id, 10);
    if (!Number.isFinite(slideId)) {
      throw new Error(`Invalid slideId: ${id}`);
    }
    return { slideId, rId };
  });
}
function getRelationshipEntries$1(relsXml) {
  const relsRoot = getByPath(relsXml, ["Relationships"]);
  if (!relsRoot) {
    return [];
  }
  return getChildren(relsRoot, "Relationship").map((rel) => {
    const id = rel.attrs.Id ?? "";
    const type = rel.attrs.Type ?? "";
    const target = rel.attrs.Target ?? "";
    return { id, type, target };
  });
}
function generateSlideId$1(existing) {
  const used = new Set(existing);
  for (let id = 256; ; id++) {
    if (!used.has(id)) {
      return id;
    }
  }
}
function generateRId(existing) {
  const used = new Set(existing);
  for (let i = 1; ; i++) {
    const rId = `rId${i}`;
    if (!used.has(rId)) {
      return rId;
    }
  }
}
function getSlideNumbersFromPackage(pkg) {
  const numbers = [];
  for (const path of pkg.listFiles()) {
    const match = /^ppt\/slides\/slide(\d+)\.xml$/.exec(path);
    if (match?.[1]) {
      numbers.push(Number.parseInt(match[1], 10));
    }
  }
  return numbers;
}
function getNextSlideNumber(pkg) {
  const existing = getSlideNumbersFromPackage(pkg);
  const max2 = existing.length > 0 ? Math.max(...existing) : 0;
  return max2 + 1;
}
function getNotesNumbersFromPackage(pkg) {
  const numbers = [];
  for (const path of pkg.listFiles()) {
    const match = /^ppt\/notesSlides\/notesSlide(\d+)\.xml$/.exec(path);
    if (match?.[1]) {
      numbers.push(Number.parseInt(match[1], 10));
    }
  }
  return numbers;
}
function getNextNotesNumber(pkg) {
  const existing = getNotesNumbersFromPackage(pkg);
  const max2 = existing.length > 0 ? Math.max(...existing) : 0;
  return max2 + 1;
}
function normalizeNotesTarget(target) {
  return target.startsWith("../") ? `ppt/${target.slice(3)}` : `ppt/${target}`;
}
function findNotesPath(pkg, slideRelsPath) {
  const slideRelsText = pkg.readText(slideRelsPath);
  if (!slideRelsText) {
    return null;
  }
  const slideRelsXml = parseXml(slideRelsText);
  const slideRelEntries = getRelationshipEntries$1(slideRelsXml);
  const notesRel = slideRelEntries.find((r) => r.type === NOTES_REL_TYPE);
  return notesRel ? normalizeNotesTarget(notesRel.target) : null;
}
function removeNotesSlideIfPresent(pkg, notesPath, contentTypesXml) {
  if (!notesPath || !pkg.exists(notesPath)) {
    return contentTypesXml;
  }
  pkg.remove(notesPath);
  const notesRelsPath = notesPath.replace(/\.xml$/, ".xml.rels").replace("/notesSlides/", "/notesSlides/_rels/");
  if (pkg.exists(notesRelsPath)) {
    pkg.remove(notesRelsPath);
  }
  return removeOverride$1(contentTypesXml, `/${notesPath}`);
}
function addSlideToList$1({ presentationXml, slideId, rId, position }) {
  return updateDocumentRoot(presentationXml, (root) => {
    const sldIdLst = getChildren(root, "p:sldIdLst")[0];
    if (!sldIdLst) {
      throw new Error("Missing p:sldIdLst in presentation.xml");
    }
    const sldIds = getChildren(sldIdLst, "p:sldId");
    const newSldId = createElement("p:sldId", { id: `${slideId}`, "r:id": rId });
    const insertAt = position ?? sldIds.length;
    const nextSldIds = [...sldIds.slice(0, insertAt), newSldId, ...sldIds.slice(insertAt)];
    const updatedSldIdLst = setChildren(sldIdLst, nextSldIds);
    return {
      ...root,
      children: root.children.map((c) => isXmlElement(c) && c.name === "p:sldIdLst" ? updatedSldIdLst : c)
    };
  });
}
function removeSlideFromList$1(presentationXml, slideId) {
  return updateDocumentRoot(presentationXml, (root) => {
    const sldIdLst = getChildren(root, "p:sldIdLst")[0];
    if (!sldIdLst) {
      throw new Error("Missing p:sldIdLst in presentation.xml");
    }
    const sldIds = getChildren(sldIdLst, "p:sldId");
    const nextSldIds = sldIds.filter((el) => el.attrs.id !== `${slideId}`);
    const updatedSldIdLst = setChildren(sldIdLst, nextSldIds);
    return {
      ...root,
      children: root.children.map((c) => isXmlElement(c) && c.name === "p:sldIdLst" ? updatedSldIdLst : c)
    };
  });
}
function reorderSlideInList$1(presentationXml, slideId, toIndex) {
  return updateDocumentRoot(presentationXml, (root) => {
    const sldIdLst = getChildren(root, "p:sldIdLst")[0];
    if (!sldIdLst) {
      throw new Error("Missing p:sldIdLst in presentation.xml");
    }
    const sldIds = [...getChildren(sldIdLst, "p:sldId")];
    const fromIndex = sldIds.findIndex((el) => el.attrs.id === `${slideId}`);
    if (fromIndex === -1) {
      throw new Error(`Slide ${slideId} not found in sldIdLst`);
    }
    const [moved] = sldIds.splice(fromIndex, 1);
    sldIds.splice(toIndex, 0, moved);
    const updatedSldIdLst = setChildren(sldIdLst, sldIds);
    return {
      ...root,
      children: root.children.map((c) => isXmlElement(c) && c.name === "p:sldIdLst" ? updatedSldIdLst : c)
    };
  });
}
function addRelationship$1({ relsXml, id, type, target }) {
  return updateDocumentRoot(relsXml, (root) => {
    const newRel = createElement("Relationship", { Id: id, Type: type, Target: target });
    const nextChildren = [...root.children.filter(isXmlElement), newRel];
    return setChildren(root, nextChildren);
  });
}
function removeRelationship(relsXml, rId) {
  return updateDocumentRoot(relsXml, (root) => {
    const rels = getChildren(root, "Relationship");
    const nextRels = rels.filter((r) => r.attrs.Id !== rId);
    return setChildren(root, nextRels);
  });
}
function updateRelationshipTarget$1(relsXml, rId, newTarget) {
  return updateDocumentRoot(relsXml, (root) => {
    const rels = getChildren(root, "Relationship");
    const nextRels = rels.map(
      (r) => r.attrs.Id !== rId ? r : createElement("Relationship", { ...r.attrs, Target: newTarget })
    );
    return setChildren(root, nextRels);
  });
}
function addOverride$1(contentTypesXml, partName, contentType) {
  return updateDocumentRoot(contentTypesXml, (root) => {
    const overrides = getChildren(root, "Override");
    const exists = overrides.some((o) => o.attrs.PartName === partName && o.attrs.ContentType === contentType);
    if (exists) {
      return root;
    }
    const nonOverrides = root.children.filter((c) => isXmlElement(c) && c.name !== "Override");
    const newOverride = createElement("Override", { PartName: partName, ContentType: contentType });
    return setChildren(root, [...nonOverrides, ...overrides, newOverride]);
  });
}
function removeOverride$1(contentTypesXml, partName) {
  return updateDocumentRoot(contentTypesXml, (root) => {
    const filtered = root.children.filter(
      (c) => !(isXmlElement(c) && c.name === "Override" && c.attrs.PartName === partName)
    );
    return setChildren(root, filtered);
  });
}
function buildBlankSlideXml$1() {
  return {
    children: [
      createElement(
        "p:sld",
        {
          "xmlns:a": "http://schemas.openxmlformats.org/drawingml/2006/main",
          "xmlns:r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
          "xmlns:p": "http://schemas.openxmlformats.org/presentationml/2006/main"
        },
        [
          createElement("p:cSld", {}, [
            createElement("p:spTree", {}, [
              createElement("p:nvGrpSpPr", {}, [
                createElement("p:cNvPr", { id: "1", name: "" }),
                createElement("p:cNvGrpSpPr"),
                createElement("p:nvPr")
              ]),
              createElement("p:grpSpPr", {}, [
                createElement("a:xfrm", {}, [
                  createElement("a:off", { x: "0", y: "0" }),
                  createElement("a:ext", { cx: "0", cy: "0" }),
                  createElement("a:chOff", { x: "0", y: "0" }),
                  createElement("a:chExt", { cx: "0", cy: "0" })
                ])
              ])
            ])
          ]),
          createElement("p:clrMapOvr", {}, [createElement("a:masterClrMapping")])
        ]
      )
    ]
  };
}
function normalizeLayoutPath(layoutPath) {
  return layoutPath.startsWith("ppt/") ? `../${layoutPath.slice(4)}` : layoutPath;
}
function buildSlideRelsXml$1(layoutPath) {
  const targetFromSlides = normalizeLayoutPath(layoutPath);
  return {
    children: [
      createElement("Relationships", { xmlns: RELS_XMLNS$1 }, [
        createElement("Relationship", {
          Id: "rId1",
          Type: SLIDE_LAYOUT_REL_TYPE,
          Target: targetFromSlides
        })
      ])
    ]
  };
}
function addSlideToPackage(pkg, spec) {
  if (!pkg.exists(spec.layoutPath)) {
    throw new Error(`Layout not found: ${spec.layoutPath}`);
  }
  const presentationXml = readXmlOrThrow(pkg, PRESENTATION_XML_PATH$1);
  const presentationRelsXml = readXmlOrThrow(pkg, PRESENTATION_RELS_PATH$1);
  const contentTypesXml = readXmlOrThrow(pkg, CONTENT_TYPES_PATH$1);
  const slideEntries = getSlideEntries$1(presentationXml);
  const relsEntries = getRelationshipEntries$1(presentationRelsXml);
  const slideId = generateSlideId$1(slideEntries.map((s) => s.slideId));
  const rId = generateRId(relsEntries.map((r) => r.id));
  const slideNumber = getNextSlideNumber(pkg);
  const slideFilename = `slide${slideNumber}`;
  const slidePath = `ppt/slides/${slideFilename}.xml`;
  const slideRelsPath = `ppt/slides/_rels/${slideFilename}.xml.rels`;
  writeXml(pkg, slidePath, buildBlankSlideXml$1());
  writeXml(pkg, slideRelsPath, buildSlideRelsXml$1(spec.layoutPath));
  const updatedPresentationXml = addSlideToList$1({
    presentationXml,
    slideId,
    rId,
    position: spec.insertAt
  });
  const updatedPresentationRelsXml = addRelationship$1({
    relsXml: presentationRelsXml,
    id: rId,
    type: SLIDE_REL_TYPE,
    target: `slides/${slideFilename}.xml`
  });
  const updatedContentTypesXml = addOverride$1(contentTypesXml, `/ppt/slides/${slideFilename}.xml`, SLIDE_CONTENT_TYPE);
  writeXml(pkg, PRESENTATION_XML_PATH$1, updatedPresentationXml);
  writeXml(pkg, PRESENTATION_RELS_PATH$1, updatedPresentationRelsXml);
  writeXml(pkg, CONTENT_TYPES_PATH$1, updatedContentTypesXml);
  return { slideNumber };
}
function removeSlideFromPackage(pkg, slideIndex) {
  const presentationXml = readXmlOrThrow(pkg, PRESENTATION_XML_PATH$1);
  const presentationRelsXml = readXmlOrThrow(pkg, PRESENTATION_RELS_PATH$1);
  const contentTypesXml = readXmlOrThrow(pkg, CONTENT_TYPES_PATH$1);
  const slideEntries = getSlideEntries$1(presentationXml);
  if (slideIndex < 0 || slideIndex >= slideEntries.length) {
    throw new Error(`Slide index out of range: ${slideIndex}`);
  }
  const entry = slideEntries[slideIndex];
  const relsEntries = getRelationshipEntries$1(presentationRelsXml);
  const slideRel = relsEntries.find((r) => r.id === entry.rId);
  if (!slideRel) {
    throw new Error(`Relationship not found: ${entry.rId}`);
  }
  const slidePath = `ppt/${slideRel.target}`;
  const slideRelsPath = slidePath.replace(/\.xml$/, ".xml.rels").replace("/slides/", "/slides/_rels/");
  const notesPath = findNotesPath(pkg, slideRelsPath);
  pkg.remove(slidePath);
  if (pkg.exists(slideRelsPath)) {
    pkg.remove(slideRelsPath);
  }
  const updatedPresentationXml = removeSlideFromList$1(presentationXml, entry.slideId);
  const updatedPresentationRelsXml = removeRelationship(presentationRelsXml, entry.rId);
  const baseContentTypes = removeOverride$1(contentTypesXml, `/${slidePath}`);
  const updatedContentTypesXml = removeNotesSlideIfPresent(pkg, notesPath, baseContentTypes);
  writeXml(pkg, PRESENTATION_XML_PATH$1, updatedPresentationXml);
  writeXml(pkg, PRESENTATION_RELS_PATH$1, updatedPresentationRelsXml);
  writeXml(pkg, CONTENT_TYPES_PATH$1, updatedContentTypesXml);
}
function reorderSlideInPackage(pkg, fromIndex, toIndex) {
  if (fromIndex === toIndex) {
    return;
  }
  const presentationXml = readXmlOrThrow(pkg, PRESENTATION_XML_PATH$1);
  const slideEntries = getSlideEntries$1(presentationXml);
  if (fromIndex < 0 || fromIndex >= slideEntries.length) {
    throw new Error(`From index out of range: ${fromIndex}`);
  }
  if (toIndex < 0 || toIndex >= slideEntries.length) {
    throw new Error(`To index out of range: ${toIndex}`);
  }
  const entry = slideEntries[fromIndex];
  const updatedPresentationXml = reorderSlideInList$1(presentationXml, entry.slideId, toIndex);
  writeXml(pkg, PRESENTATION_XML_PATH$1, updatedPresentationXml);
}
function updateSlideRelInNotesRels(notesRelsXml, slideFilename) {
  const notesRelEntries = getRelationshipEntries$1(notesRelsXml);
  const slideRel = notesRelEntries.find((rel) => rel.type === SLIDE_REL_TYPE);
  if (!slideRel) {
    return notesRelsXml;
  }
  return updateRelationshipTarget$1(notesRelsXml, slideRel.id, `../slides/${slideFilename}.xml`);
}
function updateNotesRelsForDuplicate({
  pkg,
  sourceNotesPath,
  slideFilename,
  newNotesRelsPath
}) {
  const sourceNotesRelsPath = sourceNotesPath.replace(/\.xml$/, ".xml.rels").replace("/notesSlides/", "/notesSlides/_rels/");
  const sourceNotesRelsText = pkg.readText(sourceNotesRelsPath);
  if (!sourceNotesRelsText) {
    return;
  }
  const notesRelsXml = parseXml(sourceNotesRelsText);
  const updatedNotesRelsXml = updateSlideRelInNotesRels(notesRelsXml, slideFilename);
  writeXml(pkg, newNotesRelsPath, updatedNotesRelsXml);
}
function duplicateNotesSlide$1(options) {
  const { pkg, notesRel, slideFilename, slideRelsXml, contentTypesXml } = options;
  const sourceNotesPath = normalizeNotesTarget(notesRel.target);
  const sourceNotesXml = pkg.readText(sourceNotesPath);
  if (!sourceNotesXml) {
    return { updatedSlideRelsXml: slideRelsXml, updatedContentTypesXml: contentTypesXml };
  }
  const notesNumber = getNextNotesNumber(pkg);
  const notesFilename = `notesSlide${notesNumber}`;
  const newNotesPath = `ppt/notesSlides/${notesFilename}.xml`;
  const newNotesRelsPath = `ppt/notesSlides/_rels/${notesFilename}.xml.rels`;
  pkg.writeText(newNotesPath, sourceNotesXml);
  const updatedContentTypesXml = addOverride$1(contentTypesXml, `/${newNotesPath}`, NOTES_CONTENT_TYPE);
  updateNotesRelsForDuplicate({ pkg, sourceNotesPath, slideFilename, newNotesRelsPath });
  const updatedSlideRelsXml = updateRelationshipTarget$1(
    slideRelsXml,
    notesRel.id,
    `../notesSlides/${notesFilename}.xml`
  );
  return { updatedSlideRelsXml, updatedContentTypesXml };
}
function duplicateSlideRelsAndNotes(options) {
  const { pkg, sourceSlideRelsText, slideFilename, newSlideRelsPath, contentTypesXml } = options;
  if (!sourceSlideRelsText) {
    return contentTypesXml;
  }
  const slideRelsXml = parseXml(sourceSlideRelsText);
  const slideRelEntries = getRelationshipEntries$1(slideRelsXml);
  const notesRel = slideRelEntries.find((r) => r.type === NOTES_REL_TYPE);
  if (!notesRel) {
    writeXml(pkg, newSlideRelsPath, slideRelsXml);
    return contentTypesXml;
  }
  const { updatedSlideRelsXml, updatedContentTypesXml } = duplicateNotesSlide$1({
    pkg,
    notesRel,
    slideFilename,
    slideRelsXml,
    contentTypesXml
  });
  writeXml(pkg, newSlideRelsPath, updatedSlideRelsXml);
  return updatedContentTypesXml;
}
function duplicateSlideInPackage(pkg, slideIndex, insertAt) {
  const presentationXml = readXmlOrThrow(pkg, PRESENTATION_XML_PATH$1);
  const presentationRelsXml = readXmlOrThrow(pkg, PRESENTATION_RELS_PATH$1);
  const contentTypesXml = readXmlOrThrow(pkg, CONTENT_TYPES_PATH$1);
  const slideEntries = getSlideEntries$1(presentationXml);
  if (slideIndex < 0 || slideIndex >= slideEntries.length) {
    throw new Error(`Slide index out of range: ${slideIndex}`);
  }
  const sourceEntry = slideEntries[slideIndex];
  const relsEntries = getRelationshipEntries$1(presentationRelsXml);
  const sourceRel = relsEntries.find((r) => r.id === sourceEntry.rId);
  if (!sourceRel) {
    throw new Error(`Source slide relationship not found: ${sourceEntry.rId}`);
  }
  const sourceSlidePath = `ppt/${sourceRel.target}`;
  const sourceSlideXml = pkg.readText(sourceSlidePath);
  if (!sourceSlideXml) {
    throw new Error(`Source slide not found: ${sourceSlidePath}`);
  }
  const sourceSlideRelsPath = sourceSlidePath.replace(/\.xml$/, ".xml.rels").replace("/slides/", "/slides/_rels/");
  const sourceSlideRelsText = pkg.readText(sourceSlideRelsPath);
  const slideId = generateSlideId$1(slideEntries.map((s) => s.slideId));
  const rId = generateRId(relsEntries.map((r) => r.id));
  const slideNumber = getNextSlideNumber(pkg);
  const slideFilename = `slide${slideNumber}`;
  const newSlidePath = `ppt/slides/${slideFilename}.xml`;
  const newSlideRelsPath = `ppt/slides/_rels/${slideFilename}.xml.rels`;
  pkg.writeText(newSlidePath, sourceSlideXml);
  const baseContentTypes = addOverride$1(contentTypesXml, `/ppt/slides/${slideFilename}.xml`, SLIDE_CONTENT_TYPE);
  const updatedContentTypesXml = duplicateSlideRelsAndNotes({
    pkg,
    sourceSlideRelsText,
    slideFilename,
    newSlideRelsPath,
    contentTypesXml: baseContentTypes
  });
  const effectiveInsertAt = insertAt ?? slideIndex + 1;
  const updatedPresentationXml = addSlideToList$1({ presentationXml, slideId, rId, position: effectiveInsertAt });
  const updatedPresentationRelsXml = addRelationship$1({
    relsXml: presentationRelsXml,
    id: rId,
    type: SLIDE_REL_TYPE,
    target: `slides/${slideFilename}.xml`
  });
  writeXml(pkg, PRESENTATION_XML_PATH$1, updatedPresentationXml);
  writeXml(pkg, PRESENTATION_RELS_PATH$1, updatedPresentationRelsXml);
  writeXml(pkg, CONTENT_TYPES_PATH$1, updatedContentTypesXml);
}
async function applySlideOperations(pkg, options) {
  try {
    const addSlides = options.addSlides ?? [];
    addSlides.forEach((spec) => addSlideToPackage(pkg, spec));
    const duplicateSlides = options.duplicateSlides ?? [];
    duplicateSlides.forEach((spec) => duplicateSlideInPackage(pkg, spec.sourceSlideNumber - 1, spec.insertAt));
    const reorderSlides = options.reorderSlides ?? [];
    reorderSlides.forEach((spec) => reorderSlideInPackage(pkg, spec.from, spec.to));
    const removeSlides = [...options.removeSlides ?? []].sort((a, b) => b.slideNumber - a.slideNumber);
    removeSlides.forEach((spec) => removeSlideFromPackage(pkg, spec.slideNumber - 1));
    return {
      success: true,
      data: {
        added: addSlides.length,
        removed: removeSlides.length,
        reordered: reorderSlides.length,
        duplicated: duplicateSlides.length
      }
    };
  } catch (err2) {
    return {
      success: false,
      error: `Slide operation failed: ${err2.message}`
    };
  }
}
function uint8ArrayToArrayBuffer(data) {
  const arrayBuffer = new ArrayBuffer(data.byteLength);
  new Uint8Array(arrayBuffer).set(data);
  return arrayBuffer;
}
function getSlideRelsPath(slidePath) {
  return slidePath.replace(/\/([^/]+)\.xml$/, "/_rels/$1.xml.rels");
}
function generateShapeId(existingIds) {
  const maxId = existingIds.reduce((max2, id) => {
    const num = parseInt(id, 10);
    return Number.isNaN(num) ? max2 : Math.max(max2, num);
  }, 0);
  return String(maxId + 1);
}
var PRESET_MAP = {
  // =========================================================================
  // Basic Shapes
  // =========================================================================
  rectangle: "rect",
  ellipse: "ellipse",
  triangle: "triangle",
  rtTriangle: "rtTriangle",
  diamond: "diamond",
  pentagon: "pentagon",
  hexagon: "hexagon",
  heptagon: "heptagon",
  octagon: "octagon",
  decagon: "decagon",
  dodecagon: "dodecagon",
  parallelogram: "parallelogram",
  trapezoid: "trapezoid",
  // Additional basic shapes
  teardrop: "teardrop",
  halfFrame: "halfFrame",
  corner: "corner",
  diagStripe: "diagStripe",
  chord: "chord",
  funnel: "funnel",
  gear6: "gear6",
  gear9: "gear9",
  pie: "pie",
  pieWedge: "pieWedge",
  blockArc: "blockArc",
  // =========================================================================
  // Rounded/Snipped Rectangles
  // =========================================================================
  roundRect: "roundRect",
  round1Rect: "round1Rect",
  round2SameRect: "round2SameRect",
  round2DiagRect: "round2DiagRect",
  snip1Rect: "snip1Rect",
  snip2SameRect: "snip2SameRect",
  snip2DiagRect: "snip2DiagRect",
  snipRoundRect: "snipRoundRect",
  // =========================================================================
  // Block Arrows
  // =========================================================================
  rightArrow: "rightArrow",
  leftArrow: "leftArrow",
  upArrow: "upArrow",
  downArrow: "downArrow",
  leftRightArrow: "leftRightArrow",
  upDownArrow: "upDownArrow",
  bentArrow: "bentArrow",
  uturnArrow: "uturnArrow",
  chevron: "chevron",
  notchedRightArrow: "notchedRightArrow",
  stripedRightArrow: "stripedRightArrow",
  // Additional block arrows
  quadArrow: "quadArrow",
  quadArrowCallout: "quadArrowCallout",
  leftRightUpArrow: "leftRightUpArrow",
  leftUpArrow: "leftUpArrow",
  bentUpArrow: "bentUpArrow",
  curvedLeftArrow: "curvedLeftArrow",
  curvedRightArrow: "curvedRightArrow",
  curvedUpArrow: "curvedUpArrow",
  curvedDownArrow: "curvedDownArrow",
  circularArrow: "circularArrow",
  swooshArrow: "swooshArrow",
  leftCircularArrow: "leftCircularArrow",
  leftRightCircularArrow: "leftRightCircularArrow",
  // Arrow callouts
  leftArrowCallout: "leftArrowCallout",
  rightArrowCallout: "rightArrowCallout",
  upArrowCallout: "upArrowCallout",
  downArrowCallout: "downArrowCallout",
  leftRightArrowCallout: "leftRightArrowCallout",
  upDownArrowCallout: "upDownArrowCallout",
  // =========================================================================
  // Stars & Banners
  // =========================================================================
  star4: "star4",
  star5: "star5",
  star6: "star6",
  star7: "star7",
  star8: "star8",
  star10: "star10",
  star12: "star12",
  star16: "star16",
  star24: "star24",
  star32: "star32",
  // Banners
  ribbon: "ribbon",
  ribbon2: "ribbon2",
  ellipseRibbon: "ellipseRibbon",
  ellipseRibbon2: "ellipseRibbon2",
  verticalScroll: "verticalScroll",
  horizontalScroll: "horizontalScroll",
  wave: "wave",
  doubleWave: "doubleWave",
  irregularSeal1: "irregularSeal1",
  irregularSeal2: "irregularSeal2",
  // =========================================================================
  // Callouts
  // =========================================================================
  wedgeRectCallout: "wedgeRectCallout",
  wedgeRoundRectCallout: "wedgeRoundRectCallout",
  wedgeEllipseCallout: "wedgeEllipseCallout",
  cloudCallout: "cloudCallout",
  // Border callouts
  borderCallout1: "borderCallout1",
  borderCallout2: "borderCallout2",
  borderCallout3: "borderCallout3",
  // Accent callouts
  accentCallout1: "accentCallout1",
  accentCallout2: "accentCallout2",
  accentCallout3: "accentCallout3",
  // Accent border callouts
  accentBorderCallout1: "accentBorderCallout1",
  accentBorderCallout2: "accentBorderCallout2",
  accentBorderCallout3: "accentBorderCallout3",
  // Callout shapes
  callout1: "callout1",
  callout2: "callout2",
  callout3: "callout3",
  // =========================================================================
  // Flowchart Shapes
  // =========================================================================
  flowChartProcess: "flowChartProcess",
  flowChartDecision: "flowChartDecision",
  flowChartTerminator: "flowChartTerminator",
  flowChartDocument: "flowChartDocument",
  flowChartData: "flowChartInputOutput",
  flowChartConnector: "flowChartConnector",
  // Additional flowchart shapes
  flowChartAlternateProcess: "flowChartAlternateProcess",
  flowChartSort: "flowChartSort",
  flowChartExtract: "flowChartExtract",
  flowChartMerge: "flowChartMerge",
  flowChartOnlineStorage: "flowChartOnlineStorage",
  flowChartMagneticTape: "flowChartMagneticTape",
  flowChartMagneticDisk: "flowChartMagneticDisk",
  flowChartMagneticDrum: "flowChartMagneticDrum",
  flowChartDisplay: "flowChartDisplay",
  flowChartDelay: "flowChartDelay",
  flowChartPreparation: "flowChartPreparation",
  flowChartManualInput: "flowChartManualInput",
  flowChartManualOperation: "flowChartManualOperation",
  flowChartPunchedCard: "flowChartPunchedCard",
  flowChartPunchedTape: "flowChartPunchedTape",
  flowChartSummingJunction: "flowChartSummingJunction",
  flowChartOr: "flowChartOr",
  flowChartCollate: "flowChartCollate",
  flowChartInternalStorage: "flowChartInternalStorage",
  flowChartMultidocument: "flowChartMultidocument",
  flowChartOffpageConnector: "flowChartOffpageConnector",
  flowChartPredefinedProcess: "flowChartPredefinedProcess",
  // =========================================================================
  // Math Shapes
  // =========================================================================
  mathPlus: "mathPlus",
  mathMinus: "mathMinus",
  mathMultiply: "mathMultiply",
  mathDivide: "mathDivide",
  mathEqual: "mathEqual",
  mathNotEqual: "mathNotEqual",
  // =========================================================================
  // Braces & Brackets
  // =========================================================================
  leftBrace: "leftBrace",
  rightBrace: "rightBrace",
  leftBracket: "leftBracket",
  rightBracket: "rightBracket",
  bracePair: "bracePair",
  bracketPair: "bracketPair",
  // =========================================================================
  // Action Buttons
  // =========================================================================
  actionButtonBackPrevious: "actionButtonBackPrevious",
  actionButtonBeginning: "actionButtonBeginning",
  actionButtonBlank: "actionButtonBlank",
  actionButtonDocument: "actionButtonDocument",
  actionButtonEnd: "actionButtonEnd",
  actionButtonForwardNext: "actionButtonForwardNext",
  actionButtonHelp: "actionButtonHelp",
  actionButtonHome: "actionButtonHome",
  actionButtonInformation: "actionButtonInformation",
  actionButtonMovie: "actionButtonMovie",
  actionButtonReturn: "actionButtonReturn",
  actionButtonSound: "actionButtonSound",
  // =========================================================================
  // Misc Shapes
  // =========================================================================
  heart: "heart",
  lightning: "lightningBolt",
  lightningBolt: "lightningBolt",
  sun: "sun",
  moon: "moon",
  cloud: "cloud",
  arc: "arc",
  donut: "donut",
  frame: "frame",
  cube: "cube",
  can: "can",
  foldedCorner: "foldedCorner",
  smileyFace: "smileyFace",
  noSmoking: "noSmoking",
  plus: "mathPlus",
  cross: "plus",
  homePlate: "homePlate",
  plaque: "plaque",
  // Additional misc shapes
  bevel: "bevel",
  rect: "rect",
  line: "line",
  bentConnector2: "bentConnector2",
  bentConnector3: "bentConnector3",
  bentConnector4: "bentConnector4",
  bentConnector5: "bentConnector5",
  curvedConnector2: "curvedConnector2",
  curvedConnector3: "curvedConnector3",
  curvedConnector4: "curvedConnector4",
  curvedConnector5: "curvedConnector5",
  straightConnector1: "straightConnector1",
  flowChartInputOutput: "flowChartInputOutput",
  plaqueTabs: "plaqueTabs",
  squareTabs: "squareTabs",
  cornerTabs: "cornerTabs"
};
function stripHash(hex) {
  return hex.startsWith("#") ? hex.slice(1) : hex;
}
function buildColor(colorSpec) {
  if (typeof colorSpec === "string") {
    return { spec: { type: "srgb", value: stripHash(colorSpec) } };
  }
  const transform = {
    ...colorSpec.lumMod !== void 0 && { lumMod: colorSpec.lumMod * 1e3 },
    ...colorSpec.lumOff !== void 0 && { lumOff: colorSpec.lumOff * 1e3 },
    ...colorSpec.tint !== void 0 && { tint: colorSpec.tint * 1e3 },
    ...colorSpec.shade !== void 0 && { shade: colorSpec.shade * 1e3 }
  };
  return {
    spec: { type: "scheme", value: colorSpec.theme },
    transform: Object.keys(transform).length > 0 ? transform : void 0
  };
}
function buildSolidFill(hexColor) {
  return {
    type: "solidFill",
    color: { spec: { type: "srgb", value: stripHash(hexColor) } }
  };
}
function buildSolidFillFromSpec(colorSpec) {
  return {
    type: "solidFill",
    color: buildColor(colorSpec)
  };
}
function buildThemeFill(spec) {
  const themeColorInput = {
    theme: spec.theme,
    lumMod: spec.lumMod,
    lumOff: spec.lumOff,
    tint: spec.tint,
    shade: spec.shade
  };
  return buildSolidFillFromSpec(themeColorInput);
}
function buildGradientFill$1(spec) {
  const stops = spec.stops.map((stop) => ({
    position: stop.position * 1e3,
    // Convert 0-100 to 0-100000
    color: buildColor(stop.color)
  }));
  if (spec.gradientType === "linear") {
    return {
      type: "gradientFill",
      stops,
      linear: {
        angle: spec.angle ?? 0,
        scaled: false
      },
      rotWithShape: true
    };
  }
  if (spec.gradientType === "radial") {
    return {
      type: "gradientFill",
      stops,
      path: {
        path: "circle"
      },
      rotWithShape: true
    };
  }
  return {
    type: "gradientFill",
    stops,
    path: {
      path: "rect"
    },
    rotWithShape: true
  };
}
function buildPatternFill(spec) {
  return {
    type: "patternFill",
    preset: spec.preset,
    foregroundColor: buildColor(spec.fgColor),
    backgroundColor: buildColor(spec.bgColor)
  };
}
function buildTileFill(tile) {
  if (tile === void 0) {
    return void 0;
  }
  return {
    tx: px(tile.offsetX ?? 0),
    ty: px(tile.offsetY ?? 0),
    sx: pct(tile.scaleX ?? 100),
    sy: pct(tile.scaleY ?? 100),
    flip: tile.flip ?? "none",
    alignment: tile.alignment ?? "tl"
  };
}
function buildStretchFill() {
  return {};
}
function buildSourceRect(rect) {
  if (!rect) {
    return void 0;
  }
  return {
    left: pct(rect.left),
    top: pct(rect.top),
    right: pct(rect.right),
    bottom: pct(rect.bottom)
  };
}
function buildBlipFill(spec) {
  const hasTile = spec.tile !== void 0;
  const sourceRect = buildSourceRect(spec.sourceRect);
  return {
    type: "blipFill",
    resourceId: spec.resourceId,
    sourceRect,
    dpi: spec.dpi,
    rotWithShape: spec.rotWithShape,
    compressionState: spec.compressionState,
    stretch: hasTile ? void 0 : buildStretchFill(),
    tile: buildTileFill(spec.tile)
  };
}
function isBlipFillInput(spec) {
  return typeof spec === "object" && "resourceId" in spec;
}
function buildFill(fillSpec) {
  if (typeof fillSpec === "string") {
    if (fillSpec === "none") {
      return void 0;
    }
    return buildSolidFill(fillSpec);
  }
  if (isBlipFillInput(fillSpec)) {
    return buildBlipFill(fillSpec);
  }
  switch (fillSpec.type) {
    case "solid": {
      const solidSpec = fillSpec;
      if (isThemeColorInput(solidSpec.color)) {
        return buildSolidFillFromSpec(solidSpec.color);
      }
      return buildSolidFill(solidSpec.color);
    }
    case "gradient":
      return buildGradientFill$1(fillSpec);
    case "pattern":
      return buildPatternFill(fillSpec);
    case "theme":
      return buildThemeFill(fillSpec);
    default:
      return void 0;
  }
}
function buildBlipEffectsFromSpec(spec) {
  return {
    ...spec.alphaBiLevel && { alphaBiLevel: { threshold: pct(spec.alphaBiLevel.threshold * 1e3) } },
    ...spec.alphaCeiling && { alphaCeiling: true },
    ...spec.alphaFloor && { alphaFloor: true },
    ...spec.alphaInv && { alphaInv: true },
    ...spec.alphaMod && { alphaMod: true },
    ...spec.alphaRepl && { alphaRepl: { alpha: pct(spec.alphaRepl.alpha * 1e3) } },
    ...spec.biLevel && { biLevel: { threshold: pct(spec.biLevel.threshold * 1e3) } },
    ...spec.blur && { blur: { radius: px(spec.blur.radius), grow: false } },
    ...spec.colorChange && {
      colorChange: {
        from: buildColor(spec.colorChange.from),
        to: buildColor(spec.colorChange.to),
        useAlpha: spec.colorChange.useAlpha ?? false
      }
    },
    ...spec.colorReplace && { colorReplace: { color: buildColor(spec.colorReplace.color) } },
    ...spec.duotone && {
      duotone: {
        colors: [buildColor(spec.duotone.colors[0]), buildColor(spec.duotone.colors[1])]
      }
    },
    ...spec.grayscale && { grayscale: true },
    ...spec.hsl && {
      hsl: {
        hue: deg(spec.hsl.hue),
        saturation: pct(spec.hsl.saturation * 1e3),
        luminance: pct(spec.hsl.luminance * 1e3)
      }
    },
    ...spec.luminance && {
      luminance: {
        brightness: pct(spec.luminance.brightness * 1e3),
        contrast: pct(spec.luminance.contrast * 1e3)
      }
    },
    ...spec.tint && {
      tint: {
        hue: deg(spec.tint.hue),
        amount: pct(spec.tint.amount * 1e3)
      }
    },
    ...spec.alphaModFix !== void 0 && { alphaModFix: { amount: pct(spec.alphaModFix * 1e3) } }
  };
}
function requireNumber(name, value) {
  if (value === void 0 || Number.isNaN(value)) {
    throw new Error(`customGeometry: ${name} is required`);
  }
  return value;
}
function buildPathCommand(spec) {
  switch (spec.type) {
    case "moveTo":
      return {
        type: "moveTo",
        point: { x: px(requireNumber("moveTo.x", spec.x)), y: px(requireNumber("moveTo.y", spec.y)) }
      };
    case "lineTo":
      return {
        type: "lineTo",
        point: { x: px(requireNumber("lineTo.x", spec.x)), y: px(requireNumber("lineTo.y", spec.y)) }
      };
    case "arcTo":
      return {
        type: "arcTo",
        widthRadius: px(requireNumber("arcTo.widthRadius", spec.widthRadius)),
        heightRadius: px(requireNumber("arcTo.heightRadius", spec.heightRadius)),
        startAngle: deg(requireNumber("arcTo.startAngle", spec.startAngle)),
        swingAngle: deg(requireNumber("arcTo.swingAngle", spec.swingAngle))
      };
    case "quadBezierTo":
      return {
        type: "quadBezierTo",
        control: {
          x: px(requireNumber("quadBezierTo.control.x", spec.control?.x)),
          y: px(requireNumber("quadBezierTo.control.y", spec.control?.y))
        },
        end: {
          x: px(requireNumber("quadBezierTo.end.x", spec.end?.x)),
          y: px(requireNumber("quadBezierTo.end.y", spec.end?.y))
        }
      };
    case "cubicBezierTo":
      return {
        type: "cubicBezierTo",
        control1: {
          x: px(requireNumber("cubicBezierTo.control1.x", spec.control1?.x)),
          y: px(requireNumber("cubicBezierTo.control1.y", spec.control1?.y))
        },
        control2: {
          x: px(requireNumber("cubicBezierTo.control2.x", spec.control2?.x)),
          y: px(requireNumber("cubicBezierTo.control2.y", spec.control2?.y))
        },
        end: {
          x: px(requireNumber("cubicBezierTo.end.x", spec.end?.x)),
          y: px(requireNumber("cubicBezierTo.end.y", spec.end?.y))
        }
      };
    case "close":
      return { type: "close" };
  }
}
function buildGeometryPath(spec) {
  if (!spec.commands || spec.commands.length === 0) {
    throw new Error("customGeometry: path.commands is required");
  }
  return {
    width: px(requireNumber("path.width", spec.width)),
    height: px(requireNumber("path.height", spec.height)),
    fill: spec.fill,
    stroke: spec.stroke,
    extrusionOk: spec.extrusionOk,
    commands: spec.commands.map(buildPathCommand)
  };
}
function buildCustomGeometryFromSpec(spec) {
  if (!spec) {
    throw new Error("customGeometry is required");
  }
  if (!spec.paths || spec.paths.length === 0) {
    throw new Error("customGeometry.paths is required");
  }
  return {
    type: "custom",
    paths: spec.paths.map(buildGeometryPath)
  };
}
function detectEmbeddedMediaType(spec) {
  return spec.mimeType;
}
function buildMediaReferenceFromSpec(spec, rId, contentType) {
  if (!spec) {
    throw new Error("media spec is required");
  }
  if (!spec.type) {
    throw new Error("media.type is required");
  }
  if (!spec.data) {
    throw new Error("media.data is required");
  }
  if (!rId) {
    throw new Error("media rId is required");
  }
  if (spec.type === "video") {
    return {
      mediaType: "video",
      media: { videoFile: { link: rId, contentType } }
    };
  }
  return {
    mediaType: "audio",
    media: { audioFile: { link: rId, contentType } }
  };
}
function buildBackgroundFill(spec) {
  if (typeof spec === "string") {
    return {
      type: "solidFill",
      color: buildColor(spec)
    };
  }
  switch (spec.type) {
    case "solid":
      return {
        type: "solidFill",
        color: buildColor(spec.color)
      };
    case "gradient":
      return buildGradientFill(spec);
    default:
      throw new Error(`Unknown background fill type: ${spec.type}`);
  }
}
function buildGradientFill(spec) {
  const stops = spec.stops.map((stop) => ({
    position: stop.position * 1e3,
    // Convert 0-100 to 0-100000
    color: buildColor(stop.color)
  }));
  return {
    type: "gradientFill",
    stops,
    linear: {
      angle: spec.angle ?? 0,
      scaled: false
    },
    rotWithShape: false
  };
}
function buildBackgroundElement(fill) {
  const fillXml = serializeFill(fill);
  const bgPr = createElement("p:bgPr", {}, [fillXml]);
  return createElement("p:bg", {}, [bgPr]);
}
function buildFillMode(mode) {
  if (mode === "tile") {
    return createElement("a:tile", {
      tx: "0",
      ty: "0",
      sx: "100000",
      sy: "100000",
      flip: "none",
      algn: "tl"
    });
  }
  return createElement("a:stretch", {}, [createElement("a:fillRect")]);
}
function buildBlipFillBackground(rId, mode = "stretch") {
  const blipElement = createElement("a:blip", { "r:embed": rId });
  const fillMode = buildFillMode(mode);
  const blipFill = createElement("a:blipFill", { rotWithShape: "0" }, [blipElement, fillMode]);
  const bgPr = createElement("p:bgPr", {}, [blipFill]);
  return createElement("p:bg", {}, [bgPr]);
}
function withoutBackground(children2) {
  return children2.filter((c) => !(isXmlElement(c) && c.name === "p:bg"));
}
function applyBackground(slideDoc, spec) {
  const fill = buildBackgroundFill(spec);
  const bgElement = buildBackgroundElement(fill);
  return updateDocumentRoot(slideDoc, (root) => {
    const cSld = getChild(root, "p:cSld");
    if (!cSld) {
      return root;
    }
    const existingBg = getChild(cSld, "p:bg");
    const filteredChildren = existingBg ? withoutBackground(cSld.children) : cSld.children;
    const newCsld = {
      ...cSld,
      children: [bgElement, ...filteredChildren]
    };
    return replaceChildByName(root, "p:cSld", newCsld);
  });
}
function resolveImageData(spec) {
  return {
    arrayBuffer: uint8ArrayToArrayBuffer(spec.data),
    mimeType: spec.mimeType
  };
}
async function applyImageBackground(slideDoc, spec, ctx) {
  const { arrayBuffer, mimeType } = resolveImageData(spec);
  const { rId } = addMedia({
    pkg: ctx.zipPackage,
    mediaData: arrayBuffer,
    mediaType: mimeType,
    referringPart: ctx.slidePath
  });
  const bgElement = buildBlipFillBackground(rId, spec.mode ?? "stretch");
  return updateDocumentRoot(slideDoc, (root) => {
    const cSld = getChild(root, "p:cSld");
    if (!cSld) {
      return root;
    }
    const existingBg = getChild(cSld, "p:bg");
    const filteredChildren = existingBg ? withoutBackground(cSld.children) : cSld.children;
    const newCsld = {
      ...cSld,
      children: [bgElement, ...filteredChildren]
    };
    return replaceChildByName(root, "p:cSld", newCsld);
  });
}
function isImageBackground(spec) {
  return typeof spec === "object" && spec.type === "image";
}
function textRunSpecToTextRun(spec) {
  const properties = {
    ...spec.bold !== void 0 && { bold: spec.bold },
    ...spec.italic !== void 0 && { italic: spec.italic },
    ...spec.fontSize !== void 0 && { fontSize: spec.fontSize },
    ...spec.fontFamily !== void 0 && { fontFamily: spec.fontFamily },
    ...spec.color !== void 0 && { color: { spec: { type: "srgb", value: spec.color } } }
  };
  return {
    type: "text",
    text: spec.text,
    properties
  };
}
function paragraphSpecToParagraph(spec) {
  const props = {
    ...spec.alignment && { alignment: spec.alignment }
  };
  return {
    runs: spec.runs.map(textRunSpecToTextRun),
    properties: props
  };
}
function contentToTextBody(content) {
  if (typeof content === "string") {
    return {
      bodyProperties: {},
      paragraphs: [
        {
          runs: [{ type: "text", text: content, properties: {} }],
          properties: {}
        }
      ]
    };
  }
  return {
    bodyProperties: {},
    paragraphs: content.paragraphs.map(paragraphSpecToParagraph)
  };
}
function cellSpecToTableCell(content) {
  return {
    properties: {},
    textBody: contentToTextBody(content)
  };
}
function rowSpecToTableRow(spec, colCount) {
  const cells = [];
  for (let i = 0; i < colCount; i++) {
    const content = spec.cells[i];
    if (content !== void 0) {
      cells.push(cellSpecToTableCell(content));
    } else {
      cells.push({ properties: {} });
    }
  }
  return {
    height: spec.height,
    cells
  };
}
function colSpecToTableColumn(spec) {
  return {
    width: spec.width
  };
}
function findGraphicFrameById(spTree, shapeId) {
  const children2 = spTree.children.filter(isXmlElement);
  for (const child of children2) {
    if (child.name !== "p:graphicFrame") {
      continue;
    }
    const nvGraphicFramePr = getChildren(child, "p:nvGraphicFramePr")[0];
    if (!nvGraphicFramePr) {
      continue;
    }
    const cNvPr = getChildren(nvGraphicFramePr, "p:cNvPr")[0];
    if (!cNvPr) {
      continue;
    }
    if (cNvPr.attrs.id === shapeId) {
      return child;
    }
  }
  return null;
}
function getTableFromGraphicFrame(graphicFrame) {
  const graphic = getChildren(graphicFrame, "a:graphic")[0];
  if (!graphic) {
    return null;
  }
  const graphicData = getChildren(graphic, "a:graphicData")[0];
  if (!graphicData) {
    return null;
  }
  return getChildren(graphicData, "a:tbl")[0] ?? null;
}
function getColumnCount(table) {
  const tblGrid = getChildren(table, "a:tblGrid")[0];
  if (!tblGrid) {
    return 0;
  }
  return getChildren(tblGrid, "a:gridCol").length;
}
function replaceTableInGraphicFrame(graphicFrame, newTable) {
  const graphic = getChildren(graphicFrame, "a:graphic")[0];
  if (!graphic) {
    return graphicFrame;
  }
  const graphicData = getChildren(graphic, "a:graphicData")[0];
  if (!graphicData) {
    return graphicFrame;
  }
  const newGraphicDataChildren = graphicData.children.map((c) => {
    if (isXmlElement(c) && c.name === "a:tbl") {
      return newTable;
    }
    return c;
  });
  const newGraphicData = setChildren(graphicData, newGraphicDataChildren);
  const newGraphicChildren = graphic.children.map((c) => {
    if (isXmlElement(c) && c.name === "a:graphicData") {
      return newGraphicData;
    }
    return c;
  });
  const newGraphic = setChildren(graphic, newGraphicChildren);
  const newGraphicFrameChildren = graphicFrame.children.map((c) => {
    if (isXmlElement(c) && c.name === "a:graphic") {
      return newGraphic;
    }
    return c;
  });
  return setChildren(graphicFrame, newGraphicFrameChildren);
}
function getGraphicFrameId$1(frame) {
  const nvGraphicFramePr = getChildren(frame, "p:nvGraphicFramePr")[0];
  if (!nvGraphicFramePr) {
    return null;
  }
  const cNvPr = getChildren(nvGraphicFramePr, "p:cNvPr")[0];
  if (!cNvPr) {
    return null;
  }
  return cNvPr.attrs.id ?? null;
}
function replaceGraphicFrameInSpTree(spTree, shapeId, newFrame) {
  const newChildren = spTree.children.map((c) => {
    if (!isXmlElement(c) || c.name !== "p:graphicFrame") {
      return c;
    }
    const frameId = getGraphicFrameId$1(c);
    if (frameId === shapeId) {
      return newFrame;
    }
    return c;
  });
  return setChildren(spTree, newChildren);
}
function buildTableChanges(spec, colCount) {
  const cellChanges = (spec.updateCells ?? []).map((cellUpdate) => ({
    type: "cell",
    row: cellUpdate.row,
    col: cellUpdate.col,
    content: contentToTextBody(cellUpdate.content)
  }));
  const addRowChanges = (spec.addRows ?? []).map((rowSpec) => ({
    type: "addRow",
    row: rowSpecToTableRow(rowSpec, colCount),
    position: rowSpec.position
  }));
  const removeRowChanges = [...spec.removeRows ?? []].sort((a, b) => b - a).map((rowIndex) => ({ type: "removeRow", rowIndex }));
  const addColChanges = (spec.addColumns ?? []).map((colSpec) => ({
    type: "addColumn",
    column: colSpecToTableColumn(colSpec),
    position: colSpec.position
  }));
  const removeColChanges = [...spec.removeColumns ?? []].sort((a, b) => b - a).map((colIndex) => ({ type: "removeColumn", colIndex }));
  return [...cellChanges, ...addRowChanges, ...removeRowChanges, ...addColChanges, ...removeColChanges];
}
function applyTablePatch(table, changes, styleId2) {
  const patched = changes.length > 0 ? patchTable(table, changes) : table;
  return styleId2 !== void 0 ? patchTableStyleId(patched, styleId2) : patched;
}
function processTableUpdate(acc, spec) {
  const graphicFrame = findGraphicFrameById(acc.spTree, spec.shapeId);
  if (!graphicFrame) {
    return acc;
  }
  const table = getTableFromGraphicFrame(graphicFrame);
  if (!table) {
    return acc;
  }
  const colCount = getColumnCount(table);
  const changes = buildTableChanges(spec, colCount);
  const updatedTable = applyTablePatch(table, changes, spec.styleId);
  const updatedFrame = replaceTableInGraphicFrame(graphicFrame, updatedTable);
  const newSpTree = replaceGraphicFrameInSpTree(acc.spTree, spec.shapeId, updatedFrame);
  return { spTree: newSpTree, updated: acc.updated + 1 };
}
function applyTableUpdates(slideDoc, updates) {
  if (updates.length === 0) {
    return { doc: slideDoc, updated: 0 };
  }
  const spTree = getByPath(slideDoc, ["p:sld", "p:cSld", "p:spTree"]);
  if (!spTree) {
    return { doc: slideDoc, updated: 0 };
  }
  const { spTree: currentSpTree, updated } = updates.reduce(processTableUpdate, { spTree, updated: 0 });
  const cSld = getByPath(slideDoc, ["p:sld", "p:cSld"]);
  if (!cSld) {
    return { doc: slideDoc, updated };
  }
  const newCsldChildren = cSld.children.map((c) => {
    if (isXmlElement(c) && c.name === "p:spTree") {
      return currentSpTree;
    }
    return c;
  });
  const newCsld = setChildren(cSld, newCsldChildren);
  const sld = getByPath(slideDoc, ["p:sld"]);
  if (!sld) {
    return { doc: slideDoc, updated };
  }
  const newSldChildren = sld.children.map((c) => {
    if (isXmlElement(c) && c.name === "p:cSld") {
      return newCsld;
    }
    return c;
  });
  const newSld = setChildren(sld, newSldChildren);
  return {
    doc: {
      children: slideDoc.children.map((c) => {
        if (isXmlElement(c) && c.name === "p:sld") {
          return newSld;
        }
        return c;
      })
    },
    updated
  };
}
var LINE_END_TYPE_MAP = {
  none: "none",
  triangle: "triangle",
  stealth: "stealth",
  diamond: "diamond",
  oval: "oval",
  arrow: "arrow"
};
var LINE_END_SIZE_MAP = {
  sm: "sm",
  med: "med",
  lg: "lg"
};
function buildLineEnd(spec) {
  return {
    type: LINE_END_TYPE_MAP[spec.type] ?? "none",
    width: LINE_END_SIZE_MAP[spec.width ?? "med"] ?? "med",
    length: LINE_END_SIZE_MAP[spec.length ?? "med"] ?? "med"
  };
}
function buildLine(lineColor, lineWidth, options) {
  return {
    width: lineWidth,
    cap: options?.cap ?? "flat",
    compound: options?.compound ?? "sng",
    alignment: "ctr",
    fill: {
      type: "solidFill",
      color: { spec: { type: "srgb", value: lineColor.startsWith("#") ? lineColor.slice(1) : lineColor } }
    },
    dash: options?.dash ?? "solid",
    join: options?.join ?? "round",
    headEnd: options?.headEnd ? buildLineEnd(options.headEnd) : void 0,
    tailEnd: options?.tailEnd ? buildLineEnd(options.tailEnd) : void 0
  };
}
function buildReflection(spec) {
  return {
    blurRadius: px(spec.blurRadius ?? 0),
    startOpacity: pct((spec.startOpacity ?? 100) * 1e3),
    startPosition: pct(0),
    endOpacity: pct((spec.endOpacity ?? 0) * 1e3),
    endPosition: pct(1e5),
    distance: px(spec.distance ?? 0),
    direction: deg(spec.direction ?? 0),
    fadeDirection: deg(spec.fadeDirection ?? 90),
    scaleX: pct((spec.scaleX ?? 100) * 1e3),
    scaleY: pct((spec.scaleY ?? -100) * 1e3)
  };
}
function buildEffects(spec) {
  return {
    ...spec.shadow && {
      shadow: {
        type: "outer",
        color: { spec: { type: "srgb", value: spec.shadow.color } },
        blurRadius: px(spec.shadow.blur ?? 4),
        distance: px(spec.shadow.distance ?? 3),
        direction: deg(spec.shadow.direction ?? 45)
      }
    },
    ...spec.glow && {
      glow: {
        color: { spec: { type: "srgb", value: spec.glow.color } },
        radius: px(spec.glow.radius)
      }
    },
    ...spec.softEdge && {
      softEdge: {
        radius: px(spec.softEdge.radius)
      }
    },
    ...spec.reflection && { reflection: buildReflection(spec.reflection) }
  };
}
var UNDERLINE_MAP = {
  none: "none",
  single: "sng",
  double: "dbl",
  heavy: "heavy",
  dotted: "dotted",
  dashed: "dash",
  wavy: "wavy"
};
var STRIKE_MAP = {
  none: "noStrike",
  single: "sngStrike",
  double: "dblStrike"
};
var VERTICAL_POSITION_MAP = {
  normal: 0,
  superscript: 30,
  subscript: -25
};
function buildHyperlink(spec) {
  return {
    id: spec.url,
    // Placeholder - URL stored here, will be replaced with rId
    tooltip: spec.tooltip
  };
}
function resolveBaseline(position) {
  if (!position || position === "normal") {
    return void 0;
  }
  return VERTICAL_POSITION_MAP[position];
}
function buildRunProperties(spec) {
  const underline = spec.underline && spec.underline !== "none" ? UNDERLINE_MAP[spec.underline] ?? spec.underline : void 0;
  const strike = spec.strikethrough && spec.strikethrough !== "noStrike" ? STRIKE_MAP[spec.strikethrough] : void 0;
  const caps = spec.caps && spec.caps !== "none" ? spec.caps : void 0;
  const baseline = resolveBaseline(spec.verticalPosition);
  const properties = {
    ...spec.bold !== void 0 && { bold: spec.bold },
    ...spec.italic !== void 0 && { italic: spec.italic },
    ...underline !== void 0 && { underline },
    ...strike !== void 0 && { strike },
    ...caps !== void 0 && { caps },
    ...baseline !== void 0 && { baseline },
    ...spec.letterSpacing !== void 0 && { spacing: px(spec.letterSpacing) },
    ...spec.fontSize !== void 0 && { fontSize: spec.fontSize },
    ...spec.fontFamily !== void 0 && { fontFamily: spec.fontFamily },
    ...spec.color !== void 0 && { fill: buildSolidFill(spec.color) },
    ...spec.outline !== void 0 && { textOutline: buildLine(spec.outline.color, spec.outline.width ?? 1) },
    ...spec.effects !== void 0 && { effects: buildEffects(spec.effects) },
    ...spec.hyperlink !== void 0 && { hyperlink: buildHyperlink(spec.hyperlink) }
  };
  return Object.keys(properties).length > 0 ? properties : void 0;
}
function buildTextRun(spec) {
  const properties = buildRunProperties(spec);
  return {
    type: "text",
    text: spec.text,
    properties
  };
}
function buildBulletStyle(spec) {
  if (spec === void 0 || spec.type === "none") {
    return void 0;
  }
  if (spec.type === "char") {
    return {
      bullet: { type: "char", char: spec.char ?? "\u2022" },
      colorFollowText: true,
      sizeFollowText: true,
      fontFollowText: true
    };
  }
  if (spec.type === "autoNum") {
    return {
      bullet: { type: "auto", scheme: spec.autoNumType ?? "arabicPeriod" },
      colorFollowText: true,
      sizeFollowText: true,
      fontFollowText: true
    };
  }
  return void 0;
}
function buildLineSpacing(spec) {
  if (spec === void 0) {
    return void 0;
  }
  if (spec.type === "percent") {
    return { type: "percent", value: spec.value * 1e3 };
  }
  return { type: "points", value: spec.value };
}
function buildParagraph(spec) {
  const runs = spec.runs.map(buildTextRun);
  const bulletStyle = buildBulletStyle(spec.bullet);
  const lineSpacing = buildLineSpacing(spec.lineSpacing);
  const properties = {
    ...spec.level !== void 0 && { level: spec.level },
    ...spec.alignment !== void 0 && { alignment: spec.alignment },
    ...bulletStyle !== void 0 && { bulletStyle },
    ...lineSpacing !== void 0 && { lineSpacing },
    ...spec.spaceBefore !== void 0 && { spaceBefore: { type: "points", value: spec.spaceBefore } },
    ...spec.spaceAfter !== void 0 && { spaceAfter: { type: "points", value: spec.spaceAfter } },
    ...spec.indent !== void 0 && { indent: px(spec.indent) },
    ...spec.marginLeft !== void 0 && { marginLeft: px(spec.marginLeft) }
  };
  return { properties, runs };
}
function isRichText(text) {
  return Array.isArray(text);
}
function buildBodyProperties(spec) {
  if (!spec) {
    return {};
  }
  const hasInsets = spec.insetLeft !== void 0 || spec.insetTop !== void 0 || spec.insetRight !== void 0 || spec.insetBottom !== void 0;
  return {
    ...spec.anchor !== void 0 && { anchor: spec.anchor },
    ...spec.verticalType !== void 0 && { verticalType: spec.verticalType },
    ...spec.wrapping !== void 0 && { wrapping: spec.wrapping },
    ...spec.anchorCenter !== void 0 && { anchorCenter: spec.anchorCenter },
    ...hasInsets && {
      insets: {
        left: px(spec.insetLeft ?? 0),
        top: px(spec.insetTop ?? 0),
        right: px(spec.insetRight ?? 0),
        bottom: px(spec.insetBottom ?? 0)
      }
    }
  };
}
function buildTextBody(text, bodyPropertiesSpec) {
  const bodyProperties = buildBodyProperties(bodyPropertiesSpec);
  if (isRichText(text)) {
    return {
      bodyProperties,
      paragraphs: text.map(buildParagraph)
    };
  }
  return {
    bodyProperties,
    paragraphs: [{ properties: {}, runs: [{ type: "text", text }] }]
  };
}
function collectHyperlinks(text) {
  const hyperlinks = [];
  if (!isRichText(text)) {
    return hyperlinks;
  }
  for (const paragraph of text) {
    for (const run of paragraph.runs) {
      if (run.hyperlink) {
        hyperlinks.push({
          url: run.hyperlink.url,
          tooltip: run.hyperlink.tooltip
        });
      }
    }
  }
  return hyperlinks;
}
function buildBevel(spec) {
  return {
    preset: spec.preset ?? "circle",
    width: px(spec.width ?? 8),
    height: px(spec.height ?? 8)
  };
}
function buildShape3d(spec) {
  return {
    ...spec.bevelTop && { bevelTop: buildBevel(spec.bevelTop) },
    ...spec.bevelBottom && { bevelBottom: buildBevel(spec.bevelBottom) },
    ...spec.material && { preset: spec.material },
    ...spec.extrusionHeight !== void 0 && { extrusionHeight: px(spec.extrusionHeight) }
  };
}
function buildLineFromShapeSpec(spec) {
  if (!spec.lineColor) {
    return void 0;
  }
  return buildLine(spec.lineColor, spec.lineWidth ?? 1, {
    dash: spec.lineDash,
    cap: spec.lineCap,
    join: spec.lineJoin,
    compound: spec.lineCompound,
    headEnd: spec.lineHeadEnd,
    tailEnd: spec.lineTailEnd
  });
}
function buildConnectorConnection(shapeId, siteIndex, defaultSiteIndex) {
  if (!shapeId) {
    return void 0;
  }
  return { shapeId, siteIndex: siteIndex ?? defaultSiteIndex };
}
function resolveGeometry(customGeometry, preset) {
  if (customGeometry) {
    return buildCustomGeometryFromSpec(customGeometry);
  }
  return { type: "preset", preset, adjustValues: [] };
}
function buildSpShape(spec, id) {
  const preset = PRESET_MAP[spec.type];
  if (!preset) {
    throw new Error(`Unknown shape type: "${spec.type}". Use a valid PresetShapeType.`);
  }
  return {
    type: "sp",
    nonVisual: { id, name: `Shape ${id}` },
    placeholder: spec.placeholder ? { type: spec.placeholder.type, idx: spec.placeholder.idx } : void 0,
    properties: {
      transform: {
        x: px(spec.x),
        y: px(spec.y),
        width: px(spec.width),
        height: px(spec.height),
        rotation: deg(spec.rotation ?? 0),
        flipH: spec.flipH ?? false,
        flipV: spec.flipV ?? false
      },
      geometry: resolveGeometry(spec.customGeometry, preset),
      fill: spec.fill ? buildFill(spec.fill) : void 0,
      line: buildLineFromShapeSpec(spec),
      effects: spec.effects ? buildEffects(spec.effects) : void 0,
      // Type assertion: drawing-ml Shape3d is structurally compatible with pptx Shape3d
      shape3d: spec.shape3d ? buildShape3d(spec.shape3d) : void 0
    },
    // Type assertion: drawing-ml TextBody is structurally compatible with pptx TextBody
    textBody: spec.text ? buildTextBody(spec.text, spec.textBody) : void 0
  };
}
function registerHyperlinks(text, ctx) {
  const urlToRid = /* @__PURE__ */ new Map();
  if (!text) {
    return urlToRid;
  }
  const hyperlinks = collectHyperlinks(text);
  if (hyperlinks.length === 0) {
    return urlToRid;
  }
  const relsPath = getSlideRelsPath(ctx.slidePath);
  const relsXml = ctx.zipPackage.readText(relsPath);
  const initialRelsDoc = ensureRelationshipsDocument(relsXml ? parseXml(relsXml) : null);
  const { doc: finalRelsDoc, map: urlToRidMap } = hyperlinks.reduce(
    (acc, hlink) => {
      if (acc.map.has(hlink.url)) {
        return acc;
      }
      const { updatedXml, rId } = addRelationship$2(
        acc.doc,
        hlink.url,
        OFFICE_RELATIONSHIP_TYPES.hyperlink
      );
      const newMap = new Map(acc.map);
      newMap.set(hlink.url, rId);
      return { doc: updatedXml, map: newMap };
    },
    { doc: initialRelsDoc, map: urlToRid }
  );
  const updatedRelsXml = serializeDocument(finalRelsDoc, { declaration: true, standalone: true });
  ctx.zipPackage.writeText(relsPath, updatedRelsXml);
  return urlToRidMap;
}
function replaceHyperlinkUrls(element, urlToRid) {
  if (urlToRid.size === 0) {
    return element;
  }
  if (element.name === "a:hlinkClick" && element.attrs["r:id"]) {
    const url = element.attrs["r:id"];
    const rId = urlToRid.get(url);
    if (rId) {
      return {
        ...element,
        attrs: { ...element.attrs, "r:id": rId }
      };
    }
  }
  const children2 = element.children.map((child) => {
    if (isXmlElement(child)) {
      return replaceHyperlinkUrls(child, urlToRid);
    }
    return child;
  });
  return { ...element, children: children2 };
}
function buildShapeXml(spec, id, urlToRid) {
  const baseXml = serializeShape2(buildSpShape(spec, id));
  return urlToRid.size > 0 ? replaceHyperlinkUrls(baseXml, urlToRid) : baseXml;
}
var shapeBuilder = (spec, id, ctx) => {
  const urlToRid = registerHyperlinks(spec.text, ctx);
  const xml = buildShapeXml(spec, id, urlToRid);
  return { xml };
};
function buildPicShape({
  spec,
  id,
  resourceId,
  media
}) {
  return {
    type: "pic",
    nonVisual: { id, name: `Picture ${id}` },
    blipFill: {
      resourceId,
      stretch: true,
      blipEffects: spec.effects ? buildBlipEffectsFromSpec(spec.effects) : void 0
    },
    properties: {
      transform: {
        x: px(spec.x),
        y: px(spec.y),
        width: px(spec.width),
        height: px(spec.height),
        rotation: deg(spec.rotation ?? 0),
        flipH: spec.flipH ?? false,
        flipV: spec.flipV ?? false
      }
    },
    mediaType: media?.mediaType,
    media: media?.media
  };
}
function resolveMediaArrayBuffer(media) {
  return uint8ArrayToArrayBuffer(media.data);
}
function resolveImageSpecData(spec) {
  return {
    arrayBuffer: uint8ArrayToArrayBuffer(spec.data),
    mimeType: spec.mimeType
  };
}
async function buildEmbeddedMedia(spec, ctx) {
  if (!spec.media) {
    return void 0;
  }
  const mediaArrayBuffer = resolveMediaArrayBuffer(spec.media);
  const mediaType = detectEmbeddedMediaType(spec.media);
  const { rId: mediaRId } = addMedia({
    pkg: ctx.zipPackage,
    mediaData: mediaArrayBuffer,
    mediaType,
    referringPart: ctx.slidePath
  });
  return buildMediaReferenceFromSpec(spec.media, mediaRId, mediaType);
}
var imageBuilder = async (spec, id, ctx) => {
  const { arrayBuffer, mimeType } = resolveImageSpecData(spec);
  const { rId } = addMedia({
    pkg: ctx.zipPackage,
    mediaData: arrayBuffer,
    mediaType: mimeType,
    referringPart: ctx.slidePath
  });
  const media = await buildEmbeddedMedia(spec, ctx);
  return { xml: serializeShape2(buildPicShape({ spec, id, resourceId: rId, media })) };
};
function buildCxnShape(spec, id) {
  const preset = spec.preset ?? "straightConnector1";
  return {
    type: "cxnSp",
    nonVisual: {
      id,
      name: `Connector ${id}`,
      startConnection: buildConnectorConnection(spec.startShapeId, spec.startSiteIndex, 1),
      endConnection: buildConnectorConnection(spec.endShapeId, spec.endSiteIndex, 3)
    },
    properties: {
      transform: {
        x: px(spec.x),
        y: px(spec.y),
        width: px(spec.width),
        height: px(spec.height),
        rotation: deg(spec.rotation ?? 0),
        flipH: spec.flipH ?? false,
        flipV: spec.flipV ?? false
      },
      geometry: { type: "preset", preset, adjustValues: [] },
      line: spec.lineColor ? buildLine(spec.lineColor, spec.lineWidth ?? 2) : buildLine("000000", 2)
    }
  };
}
var connectorBuilder = (spec, id) => ({
  xml: serializeShape2(buildCxnShape(spec, id))
});
function isGroupSpec(spec) {
  return spec.type === "group" && "children" in spec;
}
function buildGroupChild(spec, existingIds) {
  const newId = generateShapeId(existingIds);
  existingIds.push(newId);
  if (isGroupSpec(spec)) {
    return buildGrpShape(spec, newId, existingIds);
  }
  return buildSpShape(spec, newId);
}
function buildGrpShape(spec, id, existingIds) {
  const children2 = spec.children.map((childSpec) => buildGroupChild(childSpec, existingIds));
  const transform = {
    x: px(spec.x),
    y: px(spec.y),
    width: px(spec.width),
    height: px(spec.height),
    rotation: deg(spec.rotation ?? 0),
    flipH: spec.flipH ?? false,
    flipV: spec.flipV ?? false,
    childOffsetX: px(0),
    childOffsetY: px(0),
    childExtentWidth: px(spec.width),
    childExtentHeight: px(spec.height)
  };
  return {
    type: "grpSp",
    nonVisual: { id, name: `Group ${id}` },
    properties: {
      transform,
      fill: spec.fill ? buildFill(spec.fill) : void 0
    },
    children: children2
  };
}
var groupBuilder = (spec, id, ctx) => ({
  xml: serializeShape2(buildGrpShape(spec, id, ctx.existingIds))
});
function mapVerticalAlignment(va) {
  if (va === "middle") {
    return "center";
  }
  return va;
}
function buildCellBorder(color, width) {
  return buildLine(color, width);
}
function buildCellBorders(color, width) {
  const border = buildCellBorder(color, width);
  return {
    left: border,
    right: border,
    top: border,
    bottom: border
  };
}
function buildCellMargins(cellSpec) {
  const hasMargin = cellSpec.marginLeft !== void 0 || cellSpec.marginRight !== void 0 || cellSpec.marginTop !== void 0 || cellSpec.marginBottom !== void 0;
  if (!hasMargin) {
    return void 0;
  }
  return {
    left: px(cellSpec.marginLeft ?? 0),
    right: px(cellSpec.marginRight ?? 0),
    top: px(cellSpec.marginTop ?? 0),
    bottom: px(cellSpec.marginBottom ?? 0)
  };
}
function buildCellProperties(cellSpec) {
  const margins = buildCellMargins(cellSpec);
  return {
    ...cellSpec.fill !== void 0 && {
      fill: { type: "solidFill", color: { spec: { type: "srgb", value: cellSpec.fill } } }
    },
    ...cellSpec.borderColor !== void 0 && {
      borders: buildCellBorders(cellSpec.borderColor, cellSpec.borderWidth ?? 1)
    },
    ...cellSpec.verticalAlignment !== void 0 && {
      anchor: mapVerticalAlignment(cellSpec.verticalAlignment)
    },
    ...margins !== void 0 && { margins },
    ...cellSpec.gridSpan !== void 0 && cellSpec.gridSpan > 1 && { colSpan: cellSpec.gridSpan },
    ...cellSpec.rowSpan !== void 0 && cellSpec.rowSpan > 1 && { rowSpan: cellSpec.rowSpan }
  };
}
function buildCellTextBody(cellSpec) {
  if (cellSpec.content) {
    return contentToTextBody(cellSpec.content);
  }
  if (cellSpec.text !== void 0) {
    return contentToTextBody(cellSpec.text);
  }
  throw new Error("TableCellSpec requires either 'text' or 'content'");
}
function buildTableCell(cellSpec) {
  return {
    properties: buildCellProperties(cellSpec),
    textBody: buildCellTextBody(cellSpec)
  };
}
function collectMergeFlags(rows) {
  const hMerge = /* @__PURE__ */ new Set();
  const vMerge = /* @__PURE__ */ new Set();
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const cell = row[c];
      if (cell.gridSpan !== void 0 && cell.gridSpan > 1) {
        for (let i = 1; i < cell.gridSpan && c + i < row.length; i++) {
          hMerge.add(`${r},${c + i}`);
        }
      }
      if (cell.rowSpan !== void 0 && cell.rowSpan > 1) {
        for (let i = 1; i < cell.rowSpan && r + i < rows.length; i++) {
          vMerge.add(`${r + i},${c}`);
        }
      }
    }
  }
  return { hMerge, vMerge };
}
function buildTableRow({ rowCells, rowHeight, rowIndex, mergeFlags }) {
  const cells = rowCells.map((cellSpec, colIndex) => {
    const key = `${rowIndex},${colIndex}`;
    const isHMerge = mergeFlags.hMerge.has(key);
    const isVMerge = mergeFlags.vMerge.has(key);
    if (isHMerge || isVMerge) {
      return {
        properties: {
          ...isHMerge && { horizontalMerge: true },
          ...isVMerge && { verticalMerge: true }
        }
      };
    }
    return buildTableCell(cellSpec);
  });
  return { height: rowHeight, cells };
}
function buildTable(spec) {
  for (let i = 0; i < spec.rows.length; i++) {
    if (!Array.isArray(spec.rows[i])) {
      throw new Error(`Table rows[${i}] must be an array of cells, got ${typeof spec.rows[i]}`);
    }
  }
  const colCount = spec.rows[0]?.length ?? 0;
  const rowCount = spec.rows.length;
  const colWidth = px(colCount > 0 ? spec.width / colCount : spec.width);
  const rowHeight = px(rowCount > 0 ? spec.height / rowCount : spec.height);
  const mergeFlags = collectMergeFlags(spec.rows);
  return {
    properties: {},
    grid: {
      columns: Array.from({ length: colCount }, () => ({ width: colWidth }))
    },
    rows: spec.rows.map((row, rowIndex) => buildTableRow({ rowCells: row, rowHeight, rowIndex, mergeFlags }))
  };
}
function buildTableGraphicFrame(spec, id) {
  const table = buildTable(spec);
  return {
    type: "graphicFrame",
    nonVisual: { id, name: `Table ${id}` },
    transform: {
      x: px(spec.x),
      y: px(spec.y),
      width: px(spec.width),
      height: px(spec.height),
      rotation: deg(0),
      flipH: false,
      flipV: false
    },
    content: {
      type: "table",
      data: { table }
    }
  };
}
var tableBuilder = (spec, id) => ({
  xml: serializeGraphicFrame(buildTableGraphicFrame(spec, id))
});
function addElementsSync({ slideDoc, specs, existingIds, ctx, builder }) {
  return specs.reduce(
    (acc, spec) => {
      const newId = generateShapeId(existingIds);
      existingIds.push(newId);
      const { xml } = builder(spec, newId, ctx);
      const doc = updateDocumentRoot(
        acc.doc,
        (root) => updateAtPath(root, ["p:cSld", "p:spTree"], (tree) => addShapeToTree(tree, xml))
      );
      return { doc, added: acc.added + 1 };
    },
    { doc: slideDoc, added: 0 }
  );
}
async function addElementsAsync({
  slideDoc,
  specs,
  existingIds,
  ctx,
  builder
}) {
  const initial = { doc: slideDoc, added: 0 };
  return specs.reduce(async (accPromise, spec) => {
    const acc = await accPromise;
    const newId = generateShapeId(existingIds);
    existingIds.push(newId);
    const { xml } = await builder(spec, newId, ctx);
    const doc = updateDocumentRoot(
      acc.doc,
      (root) => updateAtPath(root, ["p:cSld", "p:spTree"], (tree) => addShapeToTree(tree, xml))
    );
    return { doc, added: acc.added + 1 };
  }, Promise.resolve(initial));
}
var CHART_NS = "http://schemas.openxmlformats.org/drawingml/2006/chart";
var DRAWING_NS2 = "http://schemas.openxmlformats.org/drawingml/2006/main";
function buildDefaultSeries() {
  return createElement("c:ser", {}, [
    createElement("c:idx", { val: "0" }),
    createElement("c:order", { val: "0" }),
    createElement("c:tx", {}, [createElement("c:v", {}, [{ type: "text", value: "Series 1" }])]),
    createElement("c:cat", {}, [
      createElement("c:strLit", {}, [
        createElement("c:ptCount", { val: "1" }),
        createElement("c:pt", { idx: "0" }, [createElement("c:v", {}, [{ type: "text", value: "A" }])])
      ])
    ]),
    createElement("c:val", {}, [
      createElement("c:numLit", {}, [
        createElement("c:ptCount", { val: "1" }),
        createElement("c:pt", { idx: "0" }, [createElement("c:v", {}, [{ type: "text", value: "1" }])])
      ])
    ])
  ]);
}
function buildDefaultScatterSeries() {
  return createElement("c:ser", {}, [
    createElement("c:idx", { val: "0" }),
    createElement("c:order", { val: "0" }),
    createElement("c:tx", {}, [createElement("c:v", {}, [{ type: "text", value: "Series 1" }])]),
    createElement("c:xVal", {}, [
      createElement("c:numLit", {}, [
        createElement("c:ptCount", { val: "1" }),
        createElement("c:pt", { idx: "0" }, [createElement("c:v", {}, [{ type: "text", value: "1" }])])
      ])
    ]),
    createElement("c:yVal", {}, [
      createElement("c:numLit", {}, [
        createElement("c:ptCount", { val: "1" }),
        createElement("c:pt", { idx: "0" }, [createElement("c:v", {}, [{ type: "text", value: "1" }])])
      ])
    ])
  ]);
}
function buildDefaultBubbleSeries() {
  return createElement("c:ser", {}, [
    createElement("c:idx", { val: "0" }),
    createElement("c:order", { val: "0" }),
    createElement("c:tx", {}, [createElement("c:v", {}, [{ type: "text", value: "Series 1" }])]),
    createElement("c:xVal", {}, [
      createElement("c:numLit", {}, [
        createElement("c:ptCount", { val: "1" }),
        createElement("c:pt", { idx: "0" }, [createElement("c:v", {}, [{ type: "text", value: "1" }])])
      ])
    ]),
    createElement("c:yVal", {}, [
      createElement("c:numLit", {}, [
        createElement("c:ptCount", { val: "1" }),
        createElement("c:pt", { idx: "0" }, [createElement("c:v", {}, [{ type: "text", value: "1" }])])
      ])
    ]),
    createElement("c:bubbleSize", {}, [
      createElement("c:numLit", {}, [
        createElement("c:ptCount", { val: "1" }),
        createElement("c:pt", { idx: "0" }, [createElement("c:v", {}, [{ type: "text", value: "10" }])])
      ])
    ])
  ]);
}
function buildBarChart(barDirection, grouping) {
  return createElement("c:barChart", {}, [
    createElement("c:barDir", { val: barDirection }),
    createElement("c:grouping", { val: grouping }),
    buildDefaultSeries()
  ]);
}
function buildBar3DChart(barDirection, grouping) {
  return createElement("c:bar3DChart", {}, [
    createElement("c:barDir", { val: barDirection }),
    createElement("c:grouping", { val: grouping }),
    buildDefaultSeries()
  ]);
}
function buildLineChart(grouping) {
  return createElement("c:lineChart", {}, [createElement("c:grouping", { val: grouping }), buildDefaultSeries()]);
}
function buildLine3DChart(grouping) {
  return createElement("c:line3DChart", {}, [createElement("c:grouping", { val: grouping }), buildDefaultSeries()]);
}
function buildPieChart() {
  return createElement("c:pieChart", {}, [createElement("c:varyColors", { val: "1" }), buildDefaultSeries()]);
}
function buildPie3DChart() {
  return createElement("c:pie3DChart", {}, [createElement("c:varyColors", { val: "1" }), buildDefaultSeries()]);
}
function buildDoughnutChart(holeSize) {
  return createElement("c:doughnutChart", {}, [
    createElement("c:varyColors", { val: "1" }),
    buildDefaultSeries(),
    createElement("c:holeSize", { val: String(holeSize) })
  ]);
}
function buildAreaChart(grouping) {
  return createElement("c:areaChart", {}, [createElement("c:grouping", { val: grouping }), buildDefaultSeries()]);
}
function buildArea3DChart(grouping) {
  return createElement("c:area3DChart", {}, [createElement("c:grouping", { val: grouping }), buildDefaultSeries()]);
}
function buildScatterChart(scatterStyle) {
  return createElement("c:scatterChart", {}, [
    createElement("c:scatterStyle", { val: scatterStyle }),
    buildDefaultScatterSeries()
  ]);
}
function buildRadarChart(radarStyle) {
  return createElement("c:radarChart", {}, [createElement("c:radarStyle", { val: radarStyle }), buildDefaultSeries()]);
}
function buildBubbleChart(bubbleScale, sizeRepresents) {
  return createElement("c:bubbleChart", {}, [
    createElement("c:varyColors", { val: "0" }),
    buildDefaultBubbleSeries(),
    createElement("c:bubbleScale", { val: String(bubbleScale) }),
    createElement("c:sizeRepresents", { val: sizeRepresents })
  ]);
}
function buildOfPieChart(ofPieType) {
  return createElement("c:ofPieChart", {}, [
    createElement("c:ofPieType", { val: ofPieType }),
    createElement("c:varyColors", { val: "1" }),
    buildDefaultSeries()
  ]);
}
function buildStockChart() {
  const buildStockSeries = (idx, name) => createElement("c:ser", {}, [
    createElement("c:idx", { val: String(idx) }),
    createElement("c:order", { val: String(idx) }),
    createElement("c:tx", {}, [createElement("c:v", {}, [{ type: "text", value: name }])]),
    createElement("c:cat", {}, [
      createElement("c:strLit", {}, [
        createElement("c:ptCount", { val: "1" }),
        createElement("c:pt", { idx: "0" }, [createElement("c:v", {}, [{ type: "text", value: "Day 1" }])])
      ])
    ]),
    createElement("c:val", {}, [
      createElement("c:numLit", {}, [
        createElement("c:ptCount", { val: "1" }),
        createElement("c:pt", { idx: "0" }, [createElement("c:v", {}, [{ type: "text", value: "100" }])])
      ])
    ])
  ]);
  return createElement("c:stockChart", {}, [
    buildStockSeries(0, "Open"),
    buildStockSeries(1, "High"),
    buildStockSeries(2, "Low"),
    buildStockSeries(3, "Close")
  ]);
}
function buildSurfaceChart(wireframe) {
  return createElement("c:surfaceChart", {}, [
    createElement("c:wireframe", { val: wireframe ? "1" : "0" }),
    buildDefaultSeries()
  ]);
}
function buildSurface3DChart(wireframe) {
  return createElement("c:surface3DChart", {}, [
    createElement("c:wireframe", { val: wireframe ? "1" : "0" }),
    buildDefaultSeries()
  ]);
}
function buildChartTypeElement(chartType, options) {
  switch (chartType) {
    case "areaChart":
      return buildAreaChart(options?.grouping ?? "standard");
    case "area3DChart":
      return buildArea3DChart(options?.grouping ?? "standard");
    case "barChart":
      return buildBarChart(options?.barDirection ?? "col", options?.barGrouping ?? "clustered");
    case "bar3DChart":
      return buildBar3DChart(options?.barDirection ?? "col", options?.barGrouping ?? "clustered");
    case "bubbleChart":
      return buildBubbleChart(options?.bubbleScale ?? 100, options?.sizeRepresents ?? "area");
    case "doughnutChart":
      return buildDoughnutChart(options?.holeSize ?? 50);
    case "lineChart":
      return buildLineChart(options?.grouping ?? "standard");
    case "line3DChart":
      return buildLine3DChart(options?.grouping ?? "standard");
    case "ofPieChart":
      return buildOfPieChart(options?.ofPieType ?? "pie");
    case "pieChart":
      return buildPieChart();
    case "pie3DChart":
      return buildPie3DChart();
    case "radarChart":
      return buildRadarChart(options?.radarStyle ?? "standard");
    case "scatterChart":
      return buildScatterChart(options?.scatterStyle ?? "lineMarker");
    case "stockChart":
      return buildStockChart();
    case "surfaceChart":
      return buildSurfaceChart(options?.wireframe ?? false);
    case "surface3DChart":
      return buildSurface3DChart(options?.wireframe ?? false);
  }
}
function buildChartSpaceElement(chartType, options) {
  const chartTypeEl = buildChartTypeElement(chartType, options);
  return createElement(
    "c:chartSpace",
    {
      "xmlns:c": CHART_NS,
      "xmlns:a": DRAWING_NS2
    },
    [createElement("c:chart", {}, [createElement("c:plotArea", {}, [chartTypeEl])])]
  );
}
function buildChartSpaceDocument(chartType, options) {
  return {
    children: [buildChartSpaceElement(chartType, options)]
  };
}
var CHART_CONTENT_TYPE = DRAWINGML_CONTENT_TYPES.chart;
function requireText(value, context) {
  if (!value) {
    throw new Error(context);
  }
  return value;
}
function getNextChartIndex(zipPackage) {
  const files = zipPackage.listFiles();
  const chartNumbers = files.map((f) => /^ppt\/charts\/chart(\d+)\.xml$/u.exec(f)).filter((match) => match !== null).map((match) => Number(match[1])).filter((n) => Number.isFinite(n));
  const max2 = chartNumbers.length > 0 ? Math.max(...chartNumbers) : 0;
  return max2 + 1;
}
function toChartData(data) {
  return {
    categories: [...data.categories],
    series: data.series.map((s) => ({ name: s.name, values: [...s.values] }))
  };
}
function buildGraphicFrameXml(shapeId, name, relId) {
  return createElement("p:graphicFrame", {}, [
    createElement("p:nvGraphicFramePr", {}, [
      createElement("p:cNvPr", { id: shapeId, name }),
      createElement("p:cNvGraphicFramePr"),
      createElement("p:nvPr")
    ]),
    createElement("p:xfrm", {}, [
      createElement("a:off", { x: "0", y: "0" }),
      createElement("a:ext", { cx: "0", cy: "0" })
    ]),
    createElement("a:graphic", {}, [
      createElement("a:graphicData", { uri: "http://schemas.openxmlformats.org/drawingml/2006/chart" }, [
        createElement("c:chart", { "r:id": relId })
      ])
    ])
  ]);
}
function buildTransform$1(spec) {
  return {
    x: spec.x,
    y: spec.y,
    width: spec.width,
    height: spec.height,
    rotation: 0,
    flipH: false,
    flipV: false
  };
}
function ensureChartContentType(zipPackage, chartPartPath) {
  const contentTypesPath = "[Content_Types].xml";
  const xml = requireText(zipPackage.readText(contentTypesPath), `ensureChartContentType: missing ${contentTypesPath}`);
  const doc = parseXml(xml);
  const updated = addOverride$2(doc, `/${chartPartPath}`, CHART_CONTENT_TYPE);
  const out = serializeDocument(updated, { declaration: true, standalone: true });
  zipPackage.writeText(contentTypesPath, out);
}
function ensureSlideChartRelationship(zipPackage, slidePath, chartPartPath) {
  const relsPath = getSlideRelsPath(slidePath);
  const relsXml = zipPackage.readText(relsPath);
  const relsDoc = ensureRelationshipsDocument(relsXml ? parseXml(relsXml) : null);
  const { updatedXml, rId } = addRelationship$2(
    relsDoc,
    `../charts/${chartPartPath.split("/").pop()}`,
    OFFICE_RELATIONSHIP_TYPES.chart
  );
  const out = serializeDocument(updatedXml, { declaration: true, standalone: true });
  zipPackage.writeText(relsPath, out);
  return rId;
}
function buildChartDocument(spec) {
  const base = buildChartSpaceDocument(spec.chartType, spec.options);
  const withData = patchChartData(base, toChartData(spec.data));
  const withTitle = spec.title !== void 0 ? patchChartTitle(withData, spec.title) : withData;
  return spec.styleId !== void 0 ? patchChartStyle(withTitle, spec.styleId) : withTitle;
}
function addChartsToSlide(options) {
  if (options.specs.length === 0) {
    return { doc: options.slideDoc, added: 0 };
  }
  const firstChartIndex = getNextChartIndex(options.ctx.zipPackage);
  return options.specs.reduce(
    (acc, spec) => {
      if (spec.data.categories.length === 0) {
        throw new Error("addChartsToSlide: data.categories must not be empty");
      }
      if (spec.data.series.length === 0) {
        throw new Error("addChartsToSlide: data.series must not be empty");
      }
      const chartIndex = firstChartIndex + acc.added;
      const chartFilename = `chart${chartIndex}.xml`;
      const chartPath = `ppt/charts/${chartFilename}`;
      const chartDoc = buildChartDocument(spec);
      ensureChartContentType(options.ctx.zipPackage, chartPath);
      const relId = ensureSlideChartRelationship(options.ctx.zipPackage, options.ctx.slidePath, chartPath);
      const chartXml = serializeDocument(chartDoc, { declaration: true, standalone: true });
      options.ctx.zipPackage.writeText(chartPath, chartXml);
      const newId = generateShapeId(options.ctx.existingIds);
      options.ctx.existingIds.push(newId);
      const frameName = spec.title ?? `Chart ${newId}`;
      const frameXml = buildGraphicFrameXml(newId, frameName, relId);
      const transformed = patchChartTransform(frameXml, buildTransform$1(spec));
      const nextDoc = updateDocumentRoot(
        acc.doc,
        (root) => updateAtPath(root, ["p:cSld", "p:spTree"], (tree) => addShapeToTree(tree, transformed))
      );
      return { doc: nextDoc, added: acc.added + 1 };
    },
    { doc: options.slideDoc, added: 0 }
  );
}
function requireXmlText(value, context) {
  if (!value) {
    throw new Error(context);
  }
  return value;
}
function getGraphicFrameId(frame) {
  const cNvPr = getByPath(frame, ["p:nvGraphicFramePr", "p:cNvPr"]);
  if (!cNvPr || !isXmlElement(cNvPr)) {
    return void 0;
  }
  return cNvPr.attrs.id;
}
function frameChartResourceId(frame) {
  const chart = getByPath(frame, ["a:graphic", "a:graphicData", "c:chart"]);
  if (!chart || !isXmlElement(chart)) {
    return void 0;
  }
  return chart.attrs["r:id"];
}
function findGraphicFrameByChartRid(spTree, chartRid) {
  for (const child of spTree.children) {
    if (!isXmlElement(child) || child.name !== "p:graphicFrame") {
      continue;
    }
    if (frameChartResourceId(child) === chartRid) {
      return child;
    }
  }
  return void 0;
}
function buildTransform(spec) {
  if (!spec) {
    throw new Error("buildTransform: transform is required");
  }
  return {
    x: spec.x,
    y: spec.y,
    width: spec.width,
    height: spec.height,
    rotation: spec.rotation ?? 0,
    flipH: spec.flipH ?? false,
    flipV: spec.flipV ?? false
  };
}
function buildChartChanges(spec) {
  const changes = [];
  if (spec.title !== void 0) {
    changes.push({ type: "title", value: spec.title });
  }
  if (spec.data !== void 0) {
    changes.push({
      type: "data",
      data: {
        categories: [...spec.data.categories],
        series: spec.data.series.map((s) => ({ name: s.name, values: [...s.values] }))
      }
    });
  }
  if (spec.styleId !== void 0) {
    changes.push({ type: "style", style: { styleId: spec.styleId } });
  }
  return changes;
}
function resolveChartFrame(graphicFrame, transform) {
  if (transform) {
    return patchChartTransform(graphicFrame, buildTransform(transform));
  }
  return graphicFrame;
}
function applyChartUpdates(slideDoc, ctx, updates) {
  if (updates.length === 0) {
    return { doc: slideDoc, updated: 0 };
  }
  const relsPath = getSlideRelsPath(ctx.slidePath);
  const relsXml = requireXmlText(
    ctx.zipPackage.readText(relsPath),
    `applyChartUpdates: could not read slide rels: ${relsPath}`
  );
  const relsDoc = parseXml(relsXml);
  const relMap = new Map(listRelationships(relsDoc).map((r) => [r.id, r.target]));
  return updates.reduce(
    (acc, update) => {
      const chartTarget = relMap.get(update.resourceId);
      if (!chartTarget) {
        throw new Error(`applyChartUpdates: missing chart relationship: ${update.resourceId}`);
      }
      const chartPartPath = resolveRelationshipTargetPath(ctx.slidePath, chartTarget);
      const chartXml = requireXmlText(
        ctx.zipPackage.readText(chartPartPath),
        `applyChartUpdates: could not read chart part: ${chartPartPath}`
      );
      const chartDoc = parseXml(chartXml);
      const spTree = getByPath(acc.doc, ["p:sld", "p:cSld", "p:spTree"]);
      if (!spTree || !isXmlElement(spTree)) {
        throw new Error("applyChartUpdates: invalid slide structure (missing p:spTree)");
      }
      const frame = findGraphicFrameByChartRid(spTree, update.resourceId);
      if (!frame) {
        throw new Error(`applyChartUpdates: could not find p:graphicFrame for chart ${update.resourceId}`);
      }
      const changes = buildChartChanges(update);
      const patched = patchChart({ graphicFrame: frame, chartXml: chartDoc }, changes);
      const patchedFrame = resolveChartFrame(patched.graphicFrame, update.transform);
      const frameId = getGraphicFrameId(frame);
      if (!frameId) {
        throw new Error("applyChartUpdates: could not determine graphicFrame id");
      }
      const nextDoc = updateDocumentRoot(
        acc.doc,
        (root) => updateAtPath(root, ["p:cSld", "p:spTree"], (tree) => {
          const nextChildren = tree.children.map((child) => {
            if (!isXmlElement(child) || child.name !== "p:graphicFrame") {
              return child;
            }
            return getGraphicFrameId(child) === frameId ? patchedFrame : child;
          });
          return { ...tree, children: nextChildren };
        })
      );
      const nextChartXml = serializeDocument(patched.chartXml, { declaration: true, standalone: true });
      ctx.zipPackage.writeText(chartPartPath, nextChartXml);
      return { doc: nextDoc, updated: acc.updated + 1 };
    },
    { doc: slideDoc, updated: 0 }
  );
}
function convertAnimationSpec(spec) {
  return {
    shapeId: spec.shapeId,
    class: spec.class,
    effect: spec.effect,
    trigger: spec.trigger,
    duration: spec.duration,
    delay: spec.delay,
    direction: spec.direction,
    repeat: spec.repeat,
    autoReverse: spec.autoReverse
  };
}
function applyAnimations(slideDoc, specs) {
  if (specs.length === 0) {
    return { doc: slideDoc, added: 0 };
  }
  const patcherSpecs = specs.map(convertAnimationSpec);
  const updatedDoc = addAnimationsToSlide(slideDoc, patcherSpecs);
  return {
    doc: updatedDoc,
    added: specs.length
  };
}
function applyComments(pkg, slidePath, specs) {
  for (const spec of specs) {
    addCommentToSlide(pkg, slidePath, {
      authorName: spec.authorName,
      authorInitials: spec.authorInitials,
      text: spec.text,
      x: spec.x,
      y: spec.y
    });
  }
}
function applyNotes(pkg, slidePath, spec) {
  setSlideNotes(pkg, slidePath, {
    text: spec.text
  });
}
function findDiagramPaths(pkg, slideRelsPath, resourceId) {
  const relsXml = pkg.readText(slideRelsPath);
  if (!relsXml) {
    return null;
  }
  const relsDoc = parseXml(relsXml);
  const root = relsDoc.children.find(isXmlElement);
  if (!root) {
    return null;
  }
  const rels = getChildren(root, "Relationship");
  const diagramRel = rels.find((r) => r.attrs.Id === resourceId);
  if (!diagramRel) {
    return null;
  }
  const pathsFromRels = rels.reduce(
    (acc, rel) => {
      const relType = rel.attrs.Type ?? "";
      const target = rel.attrs.Target ?? "";
      if (relType.includes("diagramData") && !acc.data) {
        return { ...acc, data: normalizeRelPath(slideRelsPath, target) };
      }
      if (relType.includes("diagramLayout") && !acc.layout) {
        return { ...acc, layout: normalizeRelPath(slideRelsPath, target) };
      }
      if (relType.includes("diagramColors") && !acc.colors) {
        return { ...acc, colors: normalizeRelPath(slideRelsPath, target) };
      }
      if (relType.includes("diagramQuickStyle") && !acc.quickStyle) {
        return { ...acc, quickStyle: normalizeRelPath(slideRelsPath, target) };
      }
      return acc;
    },
    {
      data: null,
      layout: null,
      colors: null,
      quickStyle: null
    }
  );
  const findDiagramFile = (suffix) => {
    const files = pkg.listFiles();
    return files.find((f) => f.includes("diagrams/") && f.endsWith(suffix)) ?? null;
  };
  const dataPath = pathsFromRels.data ?? findDiagramFile("data1.xml");
  const layoutPath = pathsFromRels.layout ?? findDiagramFile("layout1.xml");
  const colorsPath = pathsFromRels.colors ?? findDiagramFile("colors1.xml");
  const quickStylePath = pathsFromRels.quickStyle ?? findDiagramFile("quickStyle1.xml");
  if (!dataPath || !layoutPath || !colorsPath || !quickStylePath) {
    return null;
  }
  return {
    data: dataPath,
    layout: layoutPath,
    colors: colorsPath,
    quickStyle: quickStylePath
  };
}
function normalizeRelPath(relsPath, target) {
  if (target.startsWith("/")) {
    return target.slice(1);
  }
  const baseDir = relsPath.replace(/_rels\/[^/]+\.rels$/, "");
  const parts = baseDir.split("/").filter(Boolean);
  for (const segment of target.split("/")) {
    if (segment === "..") {
      parts.pop();
    } else if (segment !== ".") {
      parts.push(segment);
    }
  }
  return parts.join("/");
}
function convertChange(spec) {
  switch (spec.type) {
    case "nodeText":
      return { type: "nodeText", nodeId: spec.nodeId, text: spec.text };
    case "addNode":
      return { type: "addNode", parentId: spec.parentId, nodeId: spec.nodeId, text: spec.text };
    case "removeNode":
      return { type: "removeNode", nodeId: spec.nodeId };
    case "setConnection":
      return { type: "setConnection", srcId: spec.srcId, destId: spec.destId, connectionType: spec.connectionType };
  }
}
function applySmartArtUpdates(pkg, slidePath, specs) {
  if (specs.length === 0) {
    return;
  }
  const slideRelsPath = getSlideRelsPath(slidePath);
  for (const spec of specs) {
    const paths = findDiagramPaths(pkg, slideRelsPath, spec.resourceId);
    if (!paths) {
      throw new Error(`SmartArt update failed: could not find diagram for resourceId "${spec.resourceId}"`);
    }
    const dataXml = pkg.readText(paths.data);
    const layoutXml = pkg.readText(paths.layout);
    const colorsXml = pkg.readText(paths.colors);
    const quickStyleXml = pkg.readText(paths.quickStyle);
    if (!dataXml || !layoutXml || !colorsXml || !quickStyleXml) {
      throw new Error(`SmartArt update failed: missing diagram files for resourceId "${spec.resourceId}"`);
    }
    const diagramFiles = {
      data: parseXml(dataXml),
      layout: parseXml(layoutXml),
      colors: parseXml(colorsXml),
      quickStyle: parseXml(quickStyleXml)
    };
    const changes = spec.changes.map(convertChange);
    const updatedFiles = patchDiagram(diagramFiles, changes);
    pkg.writeText(paths.data, serializeDocument(updatedFiles.data, { declaration: true, standalone: true }));
  }
}
function insertTransitionAfter(root, transition, afterName) {
  const filtered = root.children.filter((c) => !(isXmlElement(c) && c.name === "p:transition"));
  const afterIndex = filtered.findIndex((c) => isXmlElement(c) && c.name === afterName);
  if (afterIndex === -1) {
    return { ...root, children: [...filtered, transition] };
  }
  const before = filtered.slice(0, afterIndex + 1);
  const after = filtered.slice(afterIndex + 1);
  return { ...root, children: [...before, transition, ...after] };
}
function removeTransition(root) {
  const children2 = root.children.filter((c) => !(isXmlElement(c) && c.name === "p:transition"));
  return { ...root, children: children2 };
}
function toSlideTransition(spec) {
  return {
    type: spec.type,
    duration: spec.duration,
    advanceOnClick: spec.advanceOnClick,
    advanceAfter: spec.advanceAfter,
    direction: spec.direction,
    orientation: spec.orientation,
    spokes: spec.spokes,
    inOutDirection: spec.inOutDirection
  };
}
function applySlideTransition(slideDoc, transition) {
  if (transition.type === "none") {
    return updateDocumentRoot(slideDoc, removeTransition);
  }
  const transitionEl = serializeSlideTransition(toSlideTransition(transition));
  if (!transitionEl) {
    return slideDoc;
  }
  return updateDocumentRoot(slideDoc, (root) => {
    const clrMapOvr = getChild(root, "p:clrMapOvr");
    if (clrMapOvr) {
      return insertTransitionAfter(root, transitionEl, "p:clrMapOvr");
    }
    return insertTransitionAfter(root, transitionEl, "p:cSld");
  });
}
function isSchemeColorName(value) {
  return SCHEME_COLOR_NAMES.includes(value);
}
function requireThemePath(theme) {
  if (!theme.path) {
    throw new Error('theme.path is required (e.g., "ppt/theme/theme1.xml")');
  }
  return theme.path;
}
function toSrgbColor(hex) {
  return { spec: { type: "srgb", value: hex } };
}
function mergeFontSpec(base, patch) {
  if (!patch) {
    return base;
  }
  return {
    latin: patch.latin ?? base.latin,
    eastAsian: patch.eastAsian ?? base.eastAsian,
    complexScript: patch.complexScript ?? base.complexScript
  };
}
function mergeFontScheme(base, patch) {
  if (!patch) {
    return base;
  }
  return {
    majorFont: mergeFontSpec(base.majorFont, patch.majorFont),
    minorFont: mergeFontSpec(base.minorFont, patch.minorFont)
  };
}
function applyThemeEditsToThemeXml(themeXmlText, theme) {
  const hasColorScheme = theme.colorScheme && Object.keys(theme.colorScheme).length > 0;
  const hasFontScheme = theme.fontScheme && (theme.fontScheme.majorFont || theme.fontScheme.minorFont);
  if (!hasColorScheme && !hasFontScheme) {
    throw new Error("theme edits require at least one of colorScheme or fontScheme");
  }
  const themeXml = parseXml(themeXmlText);
  const changeList = [];
  if (hasColorScheme && theme.colorScheme) {
    const scheme = {};
    for (const [name, value] of Object.entries(theme.colorScheme)) {
      if (!isSchemeColorName(name)) {
        throw new Error(`theme.colorScheme has unsupported key: ${name}`);
      }
      if (!value) {
        continue;
      }
      scheme[name] = toSrgbColor(value);
    }
    changeList.push({ type: "colorScheme", scheme });
  }
  if (hasFontScheme) {
    const base = parseFontScheme(themeXml);
    const merged = mergeFontScheme(base, theme.fontScheme);
    changeList.push({ type: "fontScheme", scheme: merged });
  }
  const updated = patchTheme(themeXml, changeList);
  return serializeDocument(updated, { declaration: true, standalone: true });
}
function applyThemeEditsToPackage(zipPackage, theme) {
  const themePath = requireThemePath(theme);
  const themeXmlText = zipPackage.readText(themePath);
  if (!themeXmlText) {
    throw new Error(`Theme XML not found in template: ${themePath}`);
  }
  const updated = applyThemeEditsToThemeXml(themeXmlText, theme);
  zipPackage.writeText(themePath, updated);
}
function classifyPatches2(patches) {
  const textReplacePatches = [];
  const slideModifyPatches = [];
  const themeUpdatePatches = [];
  const slideAddPatches = [];
  const slideRemovePatches = [];
  const slideDuplicatePatches = [];
  const slideReorderPatches = [];
  for (const patch of patches) {
    switch (patch.type) {
      case "text.replace":
        textReplacePatches.push(patch);
        break;
      case "slide.modify":
        slideModifyPatches.push(patch);
        break;
      case "theme.update":
        themeUpdatePatches.push(patch);
        break;
      case "slide.add":
        slideAddPatches.push(patch);
        break;
      case "slide.remove":
        slideRemovePatches.push(patch);
        break;
      case "slide.duplicate":
        slideDuplicatePatches.push(patch);
        break;
      case "slide.reorder":
        slideReorderPatches.push(patch);
        break;
      default: {
        const _exhaustive = patch;
        throw new Error(`Unknown patch type: ${_exhaustive.type}`);
      }
    }
  }
  return {
    textReplacePatches,
    slideModifyPatches,
    themeUpdatePatches,
    slideAddPatches,
    slideRemovePatches,
    slideDuplicatePatches,
    slideReorderPatches
  };
}
function replaceTextContent2(opts, value) {
  if (opts.replaceAll) {
    return value.includes(opts.search) ? value.split(opts.search).join(opts.replace) : void 0;
  }
  const idx = value.indexOf(opts.search);
  return idx !== -1 ? value.slice(0, idx) + opts.replace + value.slice(idx + opts.search.length) : void 0;
}
function replaceTextInNode(opts, node) {
  if (isXmlText(node) || !isXmlElement(node)) {
    return { node, changed: false };
  }
  const isTextField = node.name === "a:t";
  const newChildren = [];
  let changed = false;
  for (const child of node.children) {
    if (isTextField && isXmlText(child)) {
      const replaced = replaceTextContent2(opts, child.value);
      if (replaced !== void 0) {
        newChildren.push({ type: "text", value: replaced });
        changed = true;
      } else {
        newChildren.push(child);
      }
    } else {
      const result = replaceTextInNode(opts, child);
      changed = changed || result.changed;
      newChildren.push(result.node);
    }
  }
  if (!changed) {
    return { node, changed: false };
  }
  return { node: { ...node, children: newChildren }, changed: true };
}
function getSlideXmlPaths(zipPackage) {
  return zipPackage.listFiles().filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f)).sort((a, b) => {
    const numA = parseInt(a.match(/slide(\d+)\.xml$/)[1], 10);
    const numB = parseInt(b.match(/slide(\d+)\.xml$/)[1], 10);
    return numA - numB;
  });
}
function getTargetSlidePaths(patch, allSlidePaths) {
  if (!patch.slides || patch.slides.length === 0) {
    return allSlidePaths;
  }
  return patch.slides.map((n) => allSlidePaths[n - 1]).filter((p) => p !== void 0);
}
function applyTextReplaceToSlide(zipPackage, slidePath, opts) {
  const xml = zipPackage.readText(slidePath);
  if (!xml) {
    return false;
  }
  const doc = parseXml(xml);
  const results = doc.children.map((child) => replaceTextInNode(opts, child));
  const changed = results.some((r) => r.changed);
  if (changed) {
    const updatedDoc = { ...doc, children: results.map((r) => r.node) };
    const updatedXml = serializeDocument(updatedDoc, { declaration: true, standalone: true });
    zipPackage.writeText(slidePath, updatedXml);
  }
  return changed;
}
function applyTextReplacePatches2(zipPackage, patches) {
  if (patches.length === 0) {
    return 0;
  }
  const allSlidePaths = getSlideXmlPaths(zipPackage);
  return patches.reduce((total, patch) => {
    const opts = {
      search: patch.search,
      replace: patch.replace,
      replaceAll: patch.replaceAll !== false
    };
    const targetPaths = getTargetSlidePaths(patch, allSlidePaths);
    const replacements = targetPaths.filter(
      (slidePath) => applyTextReplaceToSlide(zipPackage, slidePath, opts)
    ).length;
    return total + replacements;
  }, 0);
}
function getShapeId(shape) {
  return shape.type === "contentPart" ? "0" : shape.nonVisual?.id ?? "0";
}
function getExistingShapeIds(apiSlide) {
  const domainSlide = parseSlide(apiSlide.content);
  if (!domainSlide) {
    return [];
  }
  return domainSlide.shapes.map(getShapeId);
}
async function applyBackgroundSpec(slideDoc, spec, ctx) {
  if (!spec) {
    return slideDoc;
  }
  if (isImageBackground(spec)) {
    return applyImageBackground(slideDoc, spec, ctx);
  }
  return applyBackground(slideDoc, spec);
}
async function processSlide(ctx, slideMod) {
  const slideNum = slideMod.slideNumber;
  if (slideNum < 1 || slideNum > ctx.presentation.count) {
    throw new Error(`Slide ${slideNum} not found. Valid range: 1-${ctx.presentation.count}`);
  }
  const apiSlide = ctx.presentation.getSlide(slideNum);
  const slidePath = `ppt/slides/${apiSlide.filename}.xml`;
  const slideXml = ctx.zipPackage.readText(slidePath);
  if (!slideXml) {
    throw new Error(`Could not read slide XML: ${slidePath}`);
  }
  const slideDoc = parseXml(slideXml);
  const spTree = getByPath(slideDoc, ["p:sld", "p:cSld", "p:spTree"]);
  if (!spTree) {
    throw new Error(`Invalid slide structure: ${slidePath}`);
  }
  const existingIds = getExistingShapeIds(apiSlide);
  const buildCtx = {
    existingIds,
    specDir: ctx.specDir,
    zipPackage: ctx.zipPackage,
    slidePath
  };
  const docWithBackground = await applyBackgroundSpec(slideDoc, slideMod.background, buildCtx);
  const { doc: afterShapes, added: shapesAdded } = addElementsSync({
    slideDoc: docWithBackground,
    specs: slideMod.addShapes ?? [],
    existingIds,
    ctx: buildCtx,
    builder: shapeBuilder
  });
  const { doc: afterImages, added: imagesAdded } = await addElementsAsync({
    slideDoc: afterShapes,
    specs: slideMod.addImages ?? [],
    existingIds,
    ctx: buildCtx,
    builder: imageBuilder
  });
  const { doc: afterConnectors, added: connectorsAdded } = addElementsSync({
    slideDoc: afterImages,
    specs: slideMod.addConnectors ?? [],
    existingIds,
    ctx: buildCtx,
    builder: connectorBuilder
  });
  const { doc: afterGroups, added: groupsAdded } = addElementsSync({
    slideDoc: afterConnectors,
    specs: slideMod.addGroups ?? [],
    existingIds,
    ctx: buildCtx,
    builder: groupBuilder
  });
  const { doc: afterTables, added: tablesAdded } = addElementsSync({
    slideDoc: afterGroups,
    specs: slideMod.addTables ?? [],
    existingIds,
    ctx: buildCtx,
    builder: tableBuilder
  });
  const { doc: afterChartAdds } = addChartsToSlide({
    slideDoc: afterTables,
    specs: slideMod.addCharts ?? [],
    ctx: { zipPackage: ctx.zipPackage, slidePath, existingIds }
  });
  const { doc: afterCharts } = applyChartUpdates(
    afterChartAdds,
    { zipPackage: ctx.zipPackage, slidePath },
    slideMod.updateCharts ?? []
  );
  const { doc: afterTableUpdates } = applyTableUpdates(afterCharts, slideMod.updateTables ?? []);
  const { doc: afterAnimations } = applyAnimations(afterTableUpdates, slideMod.addAnimations ?? []);
  if (slideMod.addComments && slideMod.addComments.length > 0) {
    applyComments(ctx.zipPackage, slidePath, slideMod.addComments);
  }
  if (slideMod.speakerNotes) {
    applyNotes(ctx.zipPackage, slidePath, slideMod.speakerNotes);
  }
  if (slideMod.updateSmartArt && slideMod.updateSmartArt.length > 0) {
    applySmartArtUpdates(ctx.zipPackage, slidePath, slideMod.updateSmartArt);
  }
  const finalDoc = slideMod.transition ? applySlideTransition(afterAnimations, slideMod.transition) : afterAnimations;
  const updatedXml = serializeDocument(finalDoc, { declaration: true, standalone: true });
  ctx.zipPackage.writeText(slidePath, updatedXml);
  return shapesAdded + imagesAdded + connectorsAdded + groupsAdded + tablesAdded;
}
async function patchPptx(spec, sourceData, specDir) {
  const { zipPackage, presentationFile } = await loadPptxBundleFromBuffer(sourceData);
  const classified = classifyPatches2(spec.patches);
  for (const patch of classified.themeUpdatePatches) {
    applyThemeEditsToPackage(zipPackage, {
      colorScheme: patch.colorScheme,
      fontScheme: patch.fontScheme
    });
  }
  const hasSlideOps = classified.slideAddPatches.length > 0 || classified.slideDuplicatePatches.length > 0 || classified.slideReorderPatches.length > 0 || classified.slideRemovePatches.length > 0;
  if (hasSlideOps) {
    const slideOpsResult = await applySlideOperations(zipPackage, {
      addSlides: classified.slideAddPatches.map(({ type: _type, ...rest }) => rest),
      duplicateSlides: classified.slideDuplicatePatches.map(({ type: _type, ...rest }) => rest),
      reorderSlides: classified.slideReorderPatches.map(({ type: _type, ...rest }) => rest),
      removeSlides: classified.slideRemovePatches.map(({ type: _type, ...rest }) => rest)
    });
    if (!slideOpsResult.success) {
      throw new Error(`Slide operations failed: ${slideOpsResult.error}`);
    }
  }
  if (classified.slideModifyPatches.length > 0) {
    const presentation = openPresentation(presentationFile);
    const ctx = {
      zipPackage,
      presentation,
      specDir
    };
    for (const patch of classified.slideModifyPatches) {
      const { type: _type, ...slideMod } = patch;
      await processSlide(ctx, slideMod);
    }
  }
  applyTextReplacePatches2(zipPackage, classified.textReplacePatches);
  const buffer = await zipPackage.toArrayBuffer();
  return new Uint8Array(buffer);
}

// node_modules/aurochs/dist/xlsx/parser/index.js
async function parseWorkbook(xlsxBuffer) {
  const pkg = await loadZipPackage(xlsxBuffer);
  const sharedStrings = parseSharedStringsFromPackage(pkg);
  const sheets = await parseSheets(pkg, sharedStrings);
  return {
    sheets,
    sharedStrings,
    package: pkg
  };
}
function parseSharedStringsFromPackage(pkg) {
  const ssText = pkg.readText("xl/sharedStrings.xml");
  if (!ssText) {
    return [];
  }
  const ssXml = parseXml(ssText);
  const sstElement = getByPath(ssXml, ["sst"]);
  if (!sstElement) {
    return [];
  }
  return parseSharedStrings(sstElement);
}
async function parseSheets(pkg, sharedStrings) {
  const sheets = /* @__PURE__ */ new Map();
  const wbText = pkg.readText("xl/workbook.xml");
  if (!wbText) {
    return sheets;
  }
  const wbXml = parseXml(wbText);
  const sheetsElement = getByPath(wbXml, ["workbook", "sheets"]);
  if (!sheetsElement) {
    return sheets;
  }
  const relsMap = parseRelationshipsFromPackage(pkg, "xl/_rels/workbook.xml.rels");
  const sheetElements = getChildren(sheetsElement, "sheet");
  for (const sheetEl of sheetElements) {
    const name = sheetEl.attrs["name"];
    const rId = sheetEl.attrs["r:id"];
    if (!name || !rId) {
      continue;
    }
    const target = relsMap.get(rId);
    if (!target) {
      continue;
    }
    const xmlPath = target.startsWith("/") ? target.substring(1) : `xl/${target}`;
    const sheetData = parseSheet({ pkg, name, id: rId, xmlPath, sharedStrings });
    if (sheetData) {
      sheets.set(name, sheetData);
    }
  }
  return sheets;
}
function parseRelationshipsFromPackage(pkg, relsPath) {
  const relsText = pkg.readText(relsPath);
  if (!relsText) {
    return /* @__PURE__ */ new Map();
  }
  const relsXml = parseXml(relsText);
  const relsElement = getByPath(relsXml, ["Relationships"]);
  if (!relsElement) {
    return /* @__PURE__ */ new Map();
  }
  return parseRelationships2(relsElement);
}
var SHEET_ROOT_ELEMENTS = ["worksheet", "macrosheet"];
function findSheetDataElement(sheetXml) {
  for (const rootName of SHEET_ROOT_ELEMENTS) {
    const sheetData = getByPath(sheetXml, [rootName, "sheetData"]);
    if (sheetData) {
      return sheetData;
    }
  }
  return void 0;
}
function parseSheet(params) {
  const { pkg, name, id, xmlPath, sharedStrings } = params;
  const sheetText = pkg.readText(xmlPath);
  if (!sheetText) {
    return void 0;
  }
  const sheetXml = parseXml(sheetText);
  const sheetDataEl = findSheetDataElement(sheetXml);
  if (!sheetDataEl) {
    return { name, id, rows: /* @__PURE__ */ new Map(), xmlPath };
  }
  const rows = /* @__PURE__ */ new Map();
  const rowElements = getChildren(sheetDataEl, "row");
  for (const rowEl of rowElements) {
    const rowNumStr = rowEl.attrs["r"];
    if (!rowNumStr) {
      continue;
    }
    const rowNumber = parseInt(rowNumStr, 10);
    const cells = /* @__PURE__ */ new Map();
    const cellElements = getChildren(rowEl, "c");
    for (const cellEl of cellElements) {
      const cell = parseCell(cellEl, sharedStrings);
      if (cell) {
        const colMatch = cell.ref.match(/^([A-Z]+)/);
        if (colMatch) {
          cells.set(colMatch[1], cell);
        }
      }
    }
    rows.set(rowNumber, { rowNumber, cells });
  }
  return { name, id, rows, xmlPath };
}
function parseCell(cellEl, sharedStrings) {
  const ref = cellEl.attrs["r"];
  if (!ref) {
    return void 0;
  }
  const type = cellEl.attrs["t"];
  const vElement = getChild(cellEl, "v");
  const rawValue = vElement ? getTextContent(vElement) ?? "" : "";
  const resolveValue = () => {
    if (type === "s") {
      const index = parseInt(rawValue, 10);
      return sharedStrings[index] ?? "";
    }
    if (type === "b") {
      return rawValue === "1" || rawValue === "true";
    }
    if (type === "str") {
      return rawValue;
    }
    if (type === "inlineStr") {
      const isElement = getChild(cellEl, "is");
      const tElement = isElement ? getChild(isElement, "t") : null;
      return tElement ? getTextContent(tElement) ?? "" : "";
    }
    const num = parseFloat(rawValue);
    return Number.isNaN(num) ? rawValue : num;
  };
  const value = resolveValue();
  return { ref, type, rawValue, value };
}

// node_modules/aurochs/dist/xlsx/builder/index.js
function findRowIndex(worksheet, rowNumber) {
  return worksheet.rows.findIndex((row) => row.rowNumber === rowNumber);
}
function findCellIndex(row, col) {
  return row.cells.findIndex((cell) => cell.address.col === col);
}
function insertRowSorted(rows, row) {
  const rowNumber = row.rowNumber;
  const insertIndex = rows.findIndex((r2) => r2.rowNumber > rowNumber);
  if (insertIndex === -1) {
    return [...rows, row];
  }
  return [...rows.slice(0, insertIndex), row, ...rows.slice(insertIndex)];
}
function insertCellSorted(cells, cell) {
  const colNumber = cell.address.col;
  const insertIndex = cells.findIndex((c) => c.address.col > colNumber);
  if (insertIndex === -1) {
    return [...cells, cell];
  }
  return [...cells.slice(0, insertIndex), cell, ...cells.slice(insertIndex)];
}
function normalizeUpdaterResult(address, result) {
  return { ...result, address };
}
function updateCell(worksheet, address, value) {
  return updateCellById(worksheet, address, (cell) => {
    if (!cell) {
      return { address, value };
    }
    const { formula: removedFormula, ...withoutFormula } = cell;
    return { ...withoutFormula, value };
  });
}
function updateCellById(worksheet, address, updater) {
  const rowIndex = findRowIndex(worksheet, address.row);
  if (rowIndex === -1) {
    const createdCell = normalizeUpdaterResult(address, updater(void 0));
    const createdRow = {
      rowNumber: address.row,
      cells: [createdCell]
    };
    return { ...worksheet, rows: insertRowSorted(worksheet.rows, createdRow) };
  }
  const row = worksheet.rows[rowIndex];
  const cellIndex = findCellIndex(row, address.col);
  const currentCell = cellIndex === -1 ? void 0 : row.cells[cellIndex];
  const updatedCell = normalizeUpdaterResult(address, updater(currentCell));
  const updateCellsInRow = (rowCells, idx, cell) => {
    if (idx === -1) {
      return insertCellSorted(rowCells, cell);
    }
    const next = [...rowCells];
    next[idx] = cell;
    return next;
  };
  const updatedCells = updateCellsInRow(row.cells, cellIndex, updatedCell);
  const updatedRow = { ...row, cells: updatedCells };
  const updatedRows = [...worksheet.rows];
  updatedRows[rowIndex] = updatedRow;
  return { ...worksheet, rows: updatedRows };
}
function assertPositiveInteger(value, label) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer: ${value}`);
  }
}
function assertValidRowIndex(value, label) {
  const n2 = value;
  if (!Number.isInteger(n2) || n2 < 1) {
    throw new Error(`${label} must be a 1-based integer RowIndex: ${n2}`);
  }
}
function assertValidColIndex(value, label) {
  const n2 = value;
  if (!Number.isInteger(n2) || n2 < 1) {
    throw new Error(`${label} must be a 1-based integer ColIndex: ${n2}`);
  }
}
function assertFiniteNumber(value, label) {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number: ${value}`);
  }
}
function toRowNumber(v2) {
  return v2;
}
function toColNumber(v2) {
  return v2;
}
function updateRowCollection(rows, rowIndex, update) {
  const target = toRowNumber(rowIndex);
  const existingIndex = rows.findIndex((r2) => toRowNumber(r2.rowNumber) === target);
  if (existingIndex >= 0) {
    const next = [...rows];
    next[existingIndex] = update(rows[existingIndex]);
    return next;
  }
  const created = update(void 0);
  const insertIndex = rows.findIndex((r2) => toRowNumber(r2.rowNumber) > target);
  if (insertIndex === -1) {
    return [...rows, created];
  }
  return [...rows.slice(0, insertIndex), created, ...rows.slice(insertIndex)];
}
function splitColumnDefAt(def, col, override) {
  const min = toColNumber(def.min);
  const max2 = toColNumber(def.max);
  const target = toColNumber(col);
  if (target < min || target > max2) {
    return [def];
  }
  if (min === max2 && min === target) {
    return [{ ...def, ...override, min: col, max: col }];
  }
  const next = [];
  if (min < target) {
    next.push({ ...def, max: colIdx(target - 1) });
  }
  next.push({ ...def, ...override, min: col, max: col });
  if (target < max2) {
    next.push({ ...def, min: colIdx(target + 1) });
  }
  return next;
}
function normalizeColumnDefs(columns) {
  if (columns.length <= 1) {
    return columns;
  }
  const merged = [];
  for (const def of columns) {
    const last = merged[merged.length - 1];
    if (!last) {
      merged.push(def);
      continue;
    }
    const lastMax = toColNumber(last.max);
    const defMin = toColNumber(def.min);
    const contiguous = lastMax + 1 === defMin;
    const sameProps = last.width === def.width && last.hidden === def.hidden && last.bestFit === def.bestFit && last.styleId === def.styleId;
    if (contiguous && sameProps) {
      merged[merged.length - 1] = { ...last, max: def.max };
    } else {
      merged.push(def);
    }
  }
  return merged;
}
function isColumnInRange(col, def) {
  return toColNumber(def.min) <= toColNumber(col) && toColNumber(col) <= toColNumber(def.max);
}
function applyColumnOverride(columns, col, override) {
  if (!columns || columns.length === 0) {
    return [{ min: col, max: col, ...override }];
  }
  const result = columns.reduce(
    (acc, def) => {
      if (isColumnInRange(col, def)) {
        return {
          defs: [...acc.defs, ...splitColumnDefAt(def, col, override)],
          covered: true
        };
      }
      return { defs: [...acc.defs, def], covered: acc.covered };
    },
    { defs: [], covered: false }
  );
  const next = result.covered ? result.defs : [...result.defs, { min: col, max: col, ...override }];
  const sorted = [...next].sort((a, b22) => toColNumber(a.min) - toColNumber(b22.min));
  return [...normalizeColumnDefs(sorted)];
}
function setRowHeight(worksheet, rowIndex, height) {
  assertValidRowIndex(rowIndex, "rowIndex");
  assertFiniteNumber(height, "height");
  if (height < 0) {
    throw new Error(`height must be >= 0: ${height}`);
  }
  const rows = updateRowCollection(worksheet.rows, rowIndex, (row) => ({
    ...row ?? { rowNumber: rowIndex, cells: [] },
    height,
    customHeight: true
  }));
  return { ...worksheet, rows };
}
function hideRows(worksheet, startRow, count) {
  assertValidRowIndex(startRow, "startRow");
  assertPositiveInteger(count, "count");
  const start = toRowNumber(startRow);
  const indices = Array.from({ length: count }, (_2, i2) => rowIdx(start + i2));
  const rows = indices.reduce(
    (acc, rowIndex) => updateRowCollection(acc, rowIndex, (row) => ({
      ...row ?? { rowNumber: rowIndex, cells: [] },
      hidden: true
    })),
    worksheet.rows
  );
  return { ...worksheet, rows };
}
function unhideRows(worksheet, startRow, count) {
  assertValidRowIndex(startRow, "startRow");
  assertPositiveInteger(count, "count");
  const start = toRowNumber(startRow);
  const indices = Array.from({ length: count }, (_2, i2) => rowIdx(start + i2));
  const rows = indices.reduce(
    (acc, rowIndex) => updateRowCollection(acc, rowIndex, (row) => ({
      ...row ?? { rowNumber: rowIndex, cells: [] },
      hidden: void 0
    })),
    worksheet.rows
  );
  return { ...worksheet, rows };
}
function setRowOutlineLevel(worksheet, rowIndex, outlineLevel) {
  assertValidRowIndex(rowIndex, "rowIndex");
  if (outlineLevel < 0 || outlineLevel > 7) {
    throw new Error(`outlineLevel must be 0-7: ${outlineLevel}`);
  }
  const rows = updateRowCollection(worksheet.rows, rowIndex, (row) => ({
    ...row ?? { rowNumber: rowIndex, cells: [] },
    outlineLevel: outlineLevel === 0 ? void 0 : outlineLevel
  }));
  return { ...worksheet, rows };
}
function setRowCollapsed(worksheet, rowIndex, collapsed) {
  assertValidRowIndex(rowIndex, "rowIndex");
  const rows = updateRowCollection(worksheet.rows, rowIndex, (row) => ({
    ...row ?? { rowNumber: rowIndex, cells: [] },
    collapsed: collapsed ? true : void 0
  }));
  return { ...worksheet, rows };
}
function setColumnWidth(worksheet, colIndex, width) {
  assertValidColIndex(colIndex, "colIndex");
  assertFiniteNumber(width, "width");
  if (width < 0) {
    throw new Error(`width must be >= 0: ${width}`);
  }
  return {
    ...worksheet,
    columns: applyColumnOverride(worksheet.columns, colIndex, { width, customWidth: true })
  };
}
function setColumnCustomWidth(worksheet, colIndex, customWidth) {
  assertValidColIndex(colIndex, "colIndex");
  return {
    ...worksheet,
    columns: applyColumnOverride(worksheet.columns, colIndex, {
      customWidth: void 0
    })
  };
}
function hideColumns(worksheet, startCol, count) {
  assertValidColIndex(startCol, "startCol");
  assertPositiveInteger(count, "count");
  const start = toColNumber(startCol);
  const indices = Array.from({ length: count }, (_2, i2) => colIdx(start + i2));
  const columns = indices.reduce((acc, col) => applyColumnOverride(acc, col, { hidden: true }), worksheet.columns);
  return { ...worksheet, columns };
}
function unhideColumns(worksheet, startCol, count) {
  assertValidColIndex(startCol, "startCol");
  assertPositiveInteger(count, "count");
  const start = toColNumber(startCol);
  const indices = Array.from({ length: count }, (_2, i2) => colIdx(start + i2));
  const columns = indices.reduce((acc, col) => applyColumnOverride(acc, col, { hidden: void 0 }), worksheet.columns);
  return { ...worksheet, columns };
}
function setColumnOutlineLevel(worksheet, colIndex, outlineLevel) {
  assertValidColIndex(colIndex, "colIndex");
  if (outlineLevel < 0 || outlineLevel > 7) {
    throw new Error(`outlineLevel must be 0-7: ${outlineLevel}`);
  }
  return {
    ...worksheet,
    columns: applyColumnOverride(worksheet.columns, colIndex, {
      outlineLevel: outlineLevel === 0 ? void 0 : outlineLevel
    })
  };
}
function setColumnStyleId(worksheet, colIndex, sid) {
  assertValidColIndex(colIndex, "colIndex");
  return {
    ...worksheet,
    columns: applyColumnOverride(worksheet.columns, colIndex, {
      styleId: sid === 0 ? void 0 : sid
    })
  };
}
function setColumnBestFit(worksheet, colIndex, bestFit) {
  assertValidColIndex(colIndex, "colIndex");
  return {
    ...worksheet,
    columns: applyColumnOverride(worksheet.columns, colIndex, {
      bestFit: bestFit ? true : void 0
    })
  };
}
function setColumnCollapsed(worksheet, colIndex, collapsed) {
  assertValidColIndex(colIndex, "colIndex");
  return {
    ...worksheet,
    columns: applyColumnOverride(worksheet.columns, colIndex, {
      collapsed: collapsed ? true : void 0
    })
  };
}
function isMultiCellRange(range) {
  return range.start.row !== range.end.row || range.start.col !== range.end.col;
}
function rangesOverlap(a, b22) {
  return a.start.row <= b22.end.row && b22.start.row <= a.end.row && a.start.col <= b22.end.col && b22.start.col <= a.end.col;
}
function rangesEqual(a, b22) {
  return a.start.row === b22.start.row && a.start.col === b22.start.col && a.end.row === b22.end.row && a.end.col === b22.end.col;
}
function validateRanges(ranges) {
  for (let i2 = 0; i2 < ranges.length; i2++) {
    const range = ranges[i2];
    if (!isMultiCellRange(range)) {
      throw new Error(
        `Merge range ${formatRange(range)} is a single cell and cannot be merged`
      );
    }
    for (let j2 = i2 + 1; j2 < ranges.length; j2++) {
      if (rangesOverlap(range, ranges[j2])) {
        throw new Error(
          `Merge range ${formatRange(range)} overlaps with ${formatRange(ranges[j2])}`
        );
      }
    }
  }
}
function addMergeCells(worksheet, ranges) {
  if (ranges.length === 0) {
    return worksheet;
  }
  validateRanges(ranges);
  const existing = worksheet.mergeCells ?? [];
  const toAdd = [];
  for (const range of ranges) {
    if (existing.some((e2) => rangesEqual(range, e2))) {
      continue;
    }
    for (const existingRange of existing) {
      if (rangesOverlap(range, existingRange)) {
        throw new Error(
          `Merge range ${formatRange(range)} overlaps with existing merge region ${formatRange(existingRange)}`
        );
      }
    }
    toAdd.push(range);
  }
  if (toAdd.length === 0) {
    return worksheet;
  }
  return {
    ...worksheet,
    mergeCells: [...existing, ...toAdd]
  };
}
function resolveDrawingRelId(resolved, pkg, sheet) {
  if (!resolved.drawing) {
    return void 0;
  }
  return patchDrawing({ pkg, sheet, drawing: resolved.drawing, media: resolved.media });
}
function resolveDrawingFromUpdate(update) {
  if (update.drawing) {
    return { drawing: update.drawing, media: update.media };
  }
  if (!update.images || update.images.length === 0) {
    return { drawing: void 0, media: void 0 };
  }
  const anchors = [];
  const mediaMap = /* @__PURE__ */ new Map();
  for (const [idx, img] of update.images.entries()) {
    const relId = `rId_img_${idx + 1}`;
    anchors.push({
      type: "twoCellAnchor",
      editAs: "oneCell",
      from: { col: colIdx(img.fromCol), colOff: 0, row: rowIdx(img.fromRow), rowOff: 0 },
      to: { col: colIdx(img.toCol), colOff: 0, row: rowIdx(img.toRow), rowOff: 0 },
      content: {
        type: "picture",
        nvPicPr: { id: idx + 1, name: img.name ?? `Image${idx + 1}` },
        blipRelId: relId
      }
    });
    mediaMap.set(relId, { data: img.data, contentType: img.contentType });
  }
  return { drawing: { anchors }, media: mediaMap };
}
async function patchWorkbook(workbook, updates) {
  const pkg = workbook.package;
  const updatedSheets = [];
  const sst = createSharedStringTableBuilder();
  for (const str of workbook.sharedStrings) {
    sst.addString(str);
  }
  const initialCount = workbook.sharedStrings.length;
  const parseContext = {
    ...createDefaultParseContext(),
    sharedStrings: workbook.sharedStrings
  };
  for (const update of updates) {
    const sheet = workbook.sheets.get(update.sheetName);
    if (!sheet) {
      throw new Error(`patchWorkbook: sheet "${update.sheetName}" not found`);
    }
    const resolved = resolveDrawingFromUpdate(update);
    const drawingRelId = resolveDrawingRelId(resolved, pkg, sheet);
    patchSheet({ pkg, sheet, update, sst, parseContext, drawingRelId });
    updatedSheets.push(update.sheetName);
  }
  const allStrings = sst.getStrings();
  const newSharedStrings = allStrings.slice(initialCount);
  if (newSharedStrings.length > 0) {
    const sstXml = generateSharedStrings(allStrings);
    pkg.writeText("xl/sharedStrings.xml", serializeWithDeclaration(sstXml));
  }
  const xlsxBuffer = await pkg.toArrayBuffer();
  return { xlsxBuffer, updatedSheets, newSharedStrings };
}
function patchSheet(params) {
  const { pkg, sheet, update, sst, parseContext, drawingRelId } = params;
  const sheetText = pkg.readText(sheet.xmlPath);
  if (!sheetText) {
    throw new Error(`patchSheet: sheet XML not found at ${sheet.xmlPath}`);
  }
  const sheetXml = parseXml(sheetText);
  const sheetRootEl = findSheetRootElement(sheetXml);
  if (!sheetRootEl) {
    throw new Error(
      `patchSheet: sheet root element not found in ${sheet.xmlPath}. Expected one of: ${SHEET_ROOT_ELEMENTS2.join(", ")}`
    );
  }
  const parsed = parseWorksheet({
    worksheetElement: sheetRootEl,
    context: parseContext,
    options: void 0,
    sheetInfo: {
      name: sheet.name,
      sheetId: sheetId(extractSheetIndex(sheet.xmlPath)),
      state: "visible",
      xmlPath: sheet.xmlPath
    }
  });
  const worksheet = applySheetUpdate(parsed, update);
  const serialized = serializeWorksheet(worksheet, sst, drawingRelId);
  const doc = serializeDocument({ children: [serialized] }, { declaration: true, standalone: true });
  pkg.writeText(sheet.xmlPath, doc);
}
function applySheetUpdate(worksheet, update) {
  const withCells = applyCellUpdates(worksheet, update.cells);
  const withRows = applyRowUpdates(withCells, update.rows);
  const withCols = applyColUpdates(withRows, update.cols);
  const withMerge = applyMergeCellUpdates(withCols, update.mergeCells);
  const withDimension = applyDimension(withMerge, update.dimension);
  return applyDrawing(withDimension, update.drawing);
}
function applyDimension(ws, dimension) {
  if (!dimension) {
    return ws;
  }
  return { ...ws, dimension: parseDimensionString(dimension) };
}
function applyDrawing(ws, drawing) {
  if (!drawing) {
    return ws;
  }
  return { ...ws, drawing };
}
function toCellValue(raw) {
  if (typeof raw === "number") {
    return { type: "number", value: raw };
  }
  return { type: "string", value: raw };
}
function applyCellUpdates(worksheet, cells) {
  return cells.reduce((ws, cell) => {
    const colIndex = columnLetterToIndex2(cell.col.toUpperCase());
    return updateCell(ws, {
      col: colIdx(colIndex),
      row: rowIdx(cell.row),
      colAbsolute: false,
      rowAbsolute: false
    }, toCellValue(cell.value));
  }, worksheet);
}
function applyRowUpdates(worksheet, rows) {
  if (!rows || rows.length === 0) {
    return worksheet;
  }
  return rows.reduce((ws, row) => applySingleRowUpdate(ws, row), worksheet);
}
function applyRowOutlineLevel(ws, ri, outlineLevel) {
  if (outlineLevel === void 0) {
    return ws;
  }
  return setRowOutlineLevel(ws, ri, outlineLevel);
}
function applyRowCollapsed(ws, ri, collapsed) {
  if (collapsed === void 0) {
    return ws;
  }
  return setRowCollapsed(ws, ri, collapsed);
}
function applySingleRowUpdate(ws, row) {
  const ri = rowIdx(row.row);
  const withHeight = applyRowHeight(ws, ri, row);
  const withVisibility = applyRowVisibility(withHeight, ri, row);
  const withOutline = applyRowOutlineLevel(withVisibility, ri, row.outlineLevel);
  return applyRowCollapsed(withOutline, ri, row.collapsed);
}
function applyRowHeight(ws, ri, row) {
  if (row.height === void 0) {
    return ws;
  }
  const withHeight = setRowHeight(ws, ri, row.height);
  if (row.customHeight !== false) {
    return withHeight;
  }
  const rowIndex = withHeight.rows.findIndex((r2) => r2.rowNumber === ri);
  if (rowIndex < 0) {
    return withHeight;
  }
  const updatedRows = [...withHeight.rows];
  updatedRows[rowIndex] = { ...updatedRows[rowIndex], customHeight: void 0 };
  return { ...withHeight, rows: updatedRows };
}
function applyRowVisibility(ws, ri, row) {
  if (row.hidden === true) {
    return hideRows(ws, ri, 1);
  }
  if (row.hidden === false) {
    return unhideRows(ws, ri, 1);
  }
  return ws;
}
function applyColUpdates(worksheet, cols) {
  if (!cols || cols.length === 0) {
    return worksheet;
  }
  return cols.reduce((ws, col) => applySingleColUpdate(ws, col), worksheet);
}
function applyColOutlineLevel(ws, ci, outlineLevel) {
  if (outlineLevel === void 0) {
    return ws;
  }
  return setColumnOutlineLevel(ws, ci, outlineLevel);
}
function applyColCollapsed(ws, ci, collapsed) {
  if (collapsed === void 0) {
    return ws;
  }
  return setColumnCollapsed(ws, ci, collapsed);
}
function applyColBestFit(ws, ci, bestFit) {
  if (bestFit === void 0) {
    return ws;
  }
  return setColumnBestFit(ws, ci, bestFit);
}
function applyColStyleId(ws, ci, sid) {
  if (sid === void 0) {
    return ws;
  }
  return setColumnStyleId(ws, ci, styleId(sid));
}
function applySingleColUpdate(ws, col) {
  const ci = colIdx(col.col);
  const withWidth = applyColWidth(ws, ci, col);
  const withVisibility = applyColVisibility(withWidth, ci, col);
  const withOutline = applyColOutlineLevel(withVisibility, ci, col.outlineLevel);
  const withCollapsed = applyColCollapsed(withOutline, ci, col.collapsed);
  const withBestFit = applyColBestFit(withCollapsed, ci, col.bestFit);
  return applyColStyleId(withBestFit, ci, col.styleId);
}
function applyColWidth(ws, ci, col) {
  if (col.width === void 0) {
    return ws;
  }
  const withWidth = setColumnWidth(ws, ci, col.width);
  if (col.customWidth === false) {
    return setColumnCustomWidth(withWidth, ci);
  }
  return withWidth;
}
function applyColVisibility(ws, ci, col) {
  if (col.hidden === true) {
    return hideColumns(ws, ci, 1);
  }
  if (col.hidden === false) {
    return unhideColumns(ws, ci, 1);
  }
  return ws;
}
function applyMergeCellUpdates(worksheet, mergeCells) {
  if (!mergeCells || mergeCells.length === 0) {
    return worksheet;
  }
  const ranges = mergeCells.map(parseRange);
  return addMergeCells(worksheet, ranges);
}
function parseDimensionString(dimension) {
  return parseRange(dimension);
}
function parseExistingRelationships2(xml) {
  if (!xml) {
    return [];
  }
  return listRelationships(parseXml(xml));
}
function patchDrawing(params) {
  const { pkg, sheet, drawing, media } = params;
  const sheetIndex = extractSheetIndex(sheet.xmlPath);
  const drawingPartPath = `xl/drawings/drawing${sheetIndex}.xml`;
  const sheetPartPath = sheet.xmlPath;
  const drawingXml = serializeDrawing(drawing);
  pkg.writeText(drawingPartPath, serializeWithDeclaration(drawingXml));
  const drawingRelationships = [];
  const mediaDefaultExtensions = /* @__PURE__ */ new Map();
  const blipRelIds = collectBlipRelIds(drawing);
  const mediaCounter = { value: 0 };
  for (const relId of blipRelIds) {
    const mediaPart = media?.get(relId);
    if (!mediaPart) {
      continue;
    }
    mediaCounter.value++;
    const ext = inferExtensionFromContentType(mediaPart.contentType);
    const mediaPartPath = `xl/media/image_s${sheetIndex}_${mediaCounter.value}.${ext}`;
    pkg.writeBinary(mediaPartPath, mediaPart.data);
    drawingRelationships.push({
      id: relId,
      type: OFFICE_RELATIONSHIP_TYPES.image,
      target: buildRelativeTarget(drawingPartPath, mediaPartPath)
    });
    mediaDefaultExtensions.set(ext, mediaPart.contentType);
  }
  if (drawingRelationships.length > 0) {
    const drawingRelsXml = serializeRelationships(drawingRelationships);
    pkg.writeText(getRelationshipPartPath(drawingPartPath), serializeWithDeclaration(drawingRelsXml));
  }
  const drawingRelId = `rId_drawing${sheetIndex}`;
  const sheetDrawingRel = {
    id: drawingRelId,
    type: OFFICE_RELATIONSHIP_TYPES.drawing,
    target: buildRelativeTarget(sheetPartPath, drawingPartPath)
  };
  const sheetRelsPath = getRelationshipPartPath(sheetPartPath);
  const existingSheetRelsText = pkg.readText(sheetRelsPath);
  const sheetRels = parseExistingRelationships2(existingSheetRelsText);
  sheetRels.push(sheetDrawingRel);
  const sheetRelsXml = serializeRelationships(sheetRels);
  pkg.writeText(sheetRelsPath, serializeWithDeclaration(sheetRelsXml));
  updateContentTypesForDrawing(pkg, drawingPartPath, mediaDefaultExtensions);
  return drawingRelId;
}
var SHEET_ROOT_ELEMENTS2 = ["worksheet", "macrosheet"];
function findSheetRootElement(sheetXml) {
  for (const rootName of SHEET_ROOT_ELEMENTS2) {
    const element = getByPath(sheetXml, [rootName]);
    if (element) {
      return element;
    }
  }
  return null;
}
function extractSheetIndex(xmlPath) {
  const match = xmlPath.match(/sheet(\d+)\.xml$/);
  if (!match) {
    throw new Error(`extractSheetIndex: cannot parse sheet index from "${xmlPath}"`);
  }
  return parseInt(match[1], 10);
}
function collectBlipRelIds(drawing) {
  const relIds = [];
  for (const anchor of drawing.anchors) {
    if (anchor.content) {
      collectContentRelIds(anchor.content, relIds);
    }
  }
  return relIds;
}
function collectContentRelIds(content, relIds) {
  switch (content.type) {
    case "picture":
      if (content.blipRelId) {
        relIds.push(content.blipRelId);
      }
      break;
    case "groupShape":
      for (const child of content.children) {
        collectContentRelIds(child, relIds);
      }
      break;
  }
}
var inferExtensionFromContentType = inferExtensionFromMediaContentType;
function updateContentTypesForDrawing(pkg, drawingPartPath, mediaDefaultExtensions) {
  const contentTypesText = pkg.readText("[Content_Types].xml");
  if (!contentTypesText) {
    return;
  }
  const contentTypesDoc = parseXml(contentTypesText);
  const parsed = parseContentTypes(contentTypesDoc);
  const entries = contentTypesToEntries(parsed);
  const drawingOverridePartName = `/${drawingPartPath}`;
  const hasDrawingOverride = entries.some(
    (e2) => e2.kind === "override" && e2.partName === drawingOverridePartName
  );
  if (!hasDrawingOverride) {
    entries.push({
      kind: "override",
      partName: drawingOverridePartName,
      contentType: DRAWINGML_CONTENT_TYPES.drawing
    });
  }
  for (const [extension, contentType] of mediaDefaultExtensions) {
    const hasDefault = entries.some(
      (e2) => e2.kind === "default" && e2.extension === extension
    );
    if (!hasDefault) {
      entries.push({ kind: "default", extension, contentType });
    }
  }
  const contentTypesXml = serializeContentTypes(entries);
  pkg.writeText("[Content_Types].xml", serializeWithDeclaration(contentTypesXml));
}
function columnLetterToIndex2(col) {
  const upper = col.toUpperCase();
  return [...upper].reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0);
}

// entry-aurochs-skill.js
module.exports = {
  async patchDocxBytes(spec, bytes) {
    return await patchDocx(spec, bytes);
  },
  async patchPptxBytes(spec, bytes) {
    return await patchPptx(spec, bytes);
  },
  async patchXlsxBytes(updates, bytes) {
    const wb = await parseWorkbook(bytes);
    const result = await patchWorkbook(wb, updates);
    return new Uint8Array(result.xlsxBuffer);
  }
};
