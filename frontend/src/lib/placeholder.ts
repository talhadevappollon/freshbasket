// Inline SVG fallback so a missing product photo never triggers a network request
// (the previous via.placeholder.com URLs are an external dependency that is no longer reliable).
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" rx="24" fill="#f0fdf4"/><g fill="none" stroke="#16a34a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity=".85"><path d="M62 80h76l-8 64H70z"/><path d="M80 80c0-14 8-24 20-24s20 10 20 24"/></g><text x="100" y="172" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" font-weight="700" fill="#15803d">Fresh Basket</text></svg>`;

export const PLACEHOLDER_IMG = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
