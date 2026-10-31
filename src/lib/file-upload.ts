// File uploads — what every cds-file-uploader does with a choice, in one place.
// The trigger is either a drop zone (several files) or an "Add file" button (one
// file); both fire their own `-changed` event, handled the same here.
//
// Each chosen file becomes a cds-file-uploader-item with a remove (×) control. A
// file of the wrong type, or over MAX_FILE_MB, becomes an item in Carbon's error
// state instead: it names the problem, doesn't count as uploaded, and can be
// removed. A static prototype can't store bytes, so "uploaded" means listed.
//
// Carbon filters a drop by `accept` BEFORE firing its event, so a wrong-type
// file would vanish silently. We note what was dropped (capture phase, ahead of
// Carbon's own handler) and report the difference as rejected.

export const MAX_FILE_MB = 25;
export const MAX_FILE_SIZE = `${MAX_FILE_MB} MB`;

/** ".pdf,.doc,.docx" → "PDF, DOC, or DOCX". */
const typeList = (accept: string): string[] =>
  accept.split(/[\s,]+/).filter(Boolean).map((t) => t.replace(/^\./, '').toUpperCase());
const joinOr = (items: string[]) =>
  items.length < 3 ? items.join(' or ') : `${items.slice(0, -1).join(', ')}, or ${items.at(-1)}`;

/** The standard hint: "Accepted file types: PDF, DOC, or DOCX." */
export const acceptedTypes = (accept: string) => {
  const types = typeList(accept);
  return `Accepted file type${types.length === 1 ? '' : 's'}: ${joinOr(types)}.`;
};

export interface UploadOptions {
  /** Where the file items go (the uploader's file-list div). */
  list: HTMLElement;
  /** One file: a new valid choice replaces the current one. */
  single?: boolean;
  /** List only errors — for an upload that happens the moment a file is chosen. */
  errorsOnly?: boolean;
  /** Valid files, as they're chosen. */
  onAdd?: (files: File[]) => void;
  /** After any add or remove: the names of the valid files now listed. */
  onChange?: (names: string[]) => void;
}

export interface Upload {
  /** Names of the valid files listed. */
  names(): string[];
  /** List a file by name (seeding from a saved application). */
  add(name: string): void;
  /** Remove every item, valid or not. */
  clear(): void;
}

export function wireUpload(trigger: HTMLElement, opts: UploadOptions): Upload {
  const { list, single, errorsOnly, onAdd, onChange } = opts;
  const accept = trigger.getAttribute('accept') ?? '';
  const maxBytes = MAX_FILE_MB * 1024 * 1024;

  const valid = () => [...list.querySelectorAll<any>('cds-file-uploader-item:not([invalid])')];
  const names = () => valid().map((i) => i.textContent ?? '');
  const changed = () => onChange?.(names());

  const item = (name: string, error?: { subject: string; body: string }) => {
    const el = document.createElement('cds-file-uploader-item') as any;
    el.state = 'edit';
    el.size = 'md';
    el.textContent = name;
    if (error) {
      // The attribute, not the property: Lit reflects `invalid` on its next
      // update, and the valid-file count below runs before that.
      el.setAttribute('invalid', '');
      el.errorSubject = error.subject;
      el.errorBody = error.body;
    }
    el.addEventListener('cds-file-uploader-item-deleted', () => { el.remove(); changed(); });
    list.append(el);
  };

  let dropped: File[] | null = null;
  trigger.addEventListener('drop', (e) => { dropped = [...((e as DragEvent).dataTransfer?.files ?? [])]; }, { capture: true });

  const handle = (e: Event) => {
    const added = ((e as CustomEvent).detail?.addedFiles ?? []) as File[];
    const rejected = dropped ? dropped.filter((f) => !added.includes(f)) : [];
    dropped = null;
    const tooBig = added.filter((f) => f.size > maxBytes);
    let ok = added.filter((f) => f.size <= maxBytes);
    if (single) ok = ok.slice(0, 1);

    // Errors from an earlier choice have been seen; this choice replaces them.
    list.querySelectorAll('cds-file-uploader-item[invalid]').forEach((i) => i.remove());
    if (single && ok.length) valid().forEach((i) => i.remove());
    if (!errorsOnly) ok.forEach((f) => item(f.name));
    rejected.forEach((f) => item(f.name, { subject: 'Unsupported file type', body: acceptedTypes(accept) }));
    tooBig.forEach((f) => item(f.name, { subject: 'File too large', body: `Maximum file size: ${MAX_FILE_SIZE}.` }));

    if (ok.length) onAdd?.(ok);
    changed();
  };
  trigger.addEventListener('cds-file-uploader-drop-container-changed', handle);
  trigger.addEventListener('cds-file-uploader-button-changed', handle);

  return {
    names,
    add: (name) => { if (single) valid().forEach((i) => i.remove()); item(name); changed(); },
    clear: () => { list.replaceChildren(); changed(); },
  };
}
