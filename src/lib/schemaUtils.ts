/**
 * Schema injection helper utilities to manage dynamic JSON-LD tags
 */

export function injectSchema(id: string, data: object): void {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

export function removeSchema(id: string): void {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
}
