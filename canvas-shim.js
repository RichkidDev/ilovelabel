// Empty shim for "canvas" — pdfjs-dist conditionally requires it for Node.js,
// but it's never needed in the browser. This prevents bundler resolution errors.
export default {};
