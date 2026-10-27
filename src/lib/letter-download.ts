// Letter downloads — shared by the permit header actions and the Final permit
// letter tab. No real bytes in the prototype: the generated (unsigned) letter
// downloads as a printable HTML document, the signed letter as a stub named like
// the upload. Each returns false when nothing is on file, so the caller can say so.

const read = (k: string) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };

const save = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href: url, download: name }).click();
  URL.revokeObjectURL(url);
};

export const signedLetterOnFile = (id: string) => !!read(`permit-signed-letter-${id}`);

export function downloadUnsignedLetter(id: string): boolean {
  const letter = read(`permit-letter-${id}`) as { html: string } | null;
  if (!letter) return false;
  const doc = `<!doctype html><html><head><meta charset="utf-8"><title>Permit ${id}</title></head><body>${letter.html}</body></html>`;
  save(new Blob([doc], { type: 'text/html' }), `${id}-permit-letter.html`);
  return true;
}

export function downloadSignedLetter(id: string): boolean {
  const signed = read(`permit-signed-letter-${id}`) as { name: string } | null;
  if (!signed) return false;
  save(new Blob([`Prototype placeholder for ${signed.name}`], { type: 'application/pdf' }), signed.name);
  return true;
}
