// Research-team contact cards — ONE card per person. When the same person holds
// several roles (e.g. the PI is also the person in charge of field work), their
// entries fold into a single card listing every title, in the order given.
// Identity is the email (case-insensitive), falling back to the name. Only people
// merge; organizations / facilities always keep their own card.
import type { Contact } from '../data/permit';

export interface TeamEntry {
  role: string;
  contact: Contact;
  kind?: 'person' | 'organization' | 'facility';
  cvHref?: string;
}

export interface TeamCard {
  roles: string[];
  contact: Contact;
  kind: 'person' | 'organization' | 'facility';
  cvHref?: string;
}

const identity = (c: Contact) => (c.email ? c.email.trim().toLowerCase() : c.name.trim().toLowerCase());

export const teamCards = (entries: TeamEntry[]): TeamCard[] => {
  const cards: TeamCard[] = [];
  const byPerson = new Map<string, TeamCard>();
  for (const { role, contact, kind = 'person', cvHref } of entries) {
    const key = kind === 'person' ? identity(contact) : null;
    const existing = key ? byPerson.get(key) : undefined;
    if (existing) {
      if (!existing.roles.includes(role)) existing.roles.push(role);
      existing.cvHref ??= cvHref;
      continue;
    }
    const card: TeamCard = { roles: [role], contact, kind, cvHref };
    cards.push(card);
    if (key) byPerson.set(key, card);
  }
  return cards;
};
