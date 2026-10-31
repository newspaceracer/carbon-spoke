// Middle truncation for names that differ at the END — file names ("…v12-final.pdf"),
// paths, ids. Cutting the end would make "Proposal v11.pdf" and "Proposal v12.pdf"
// read the same; cutting the middle keeps both the start and the version/extension.
// Callers show the full value too (a title tooltip + screen-reader text).

/** `text` shortened to at most `max` characters by replacing its middle with "…". */
export const truncateMiddle = (text: string, max = 48): string => {
  const chars = [...text]; // code points, so an accented or astral char isn't split
  if (chars.length <= max) return text;
  const tail = Math.min(18, Math.floor(max / 3));
  return `${chars.slice(0, max - tail - 1).join('').trimEnd()}…${chars.slice(-tail).join('')}`;
};
