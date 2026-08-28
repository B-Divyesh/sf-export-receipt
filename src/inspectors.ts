import type { CategoryCheck } from './types';

export interface ExportInspector {
  id: string;
  name: string;
  matches(paths: string[]): boolean;
  inspect(paths: string[]): CategoryCheck[];
}

const has = (paths: string[], pattern: RegExp) => paths.some((path) => pattern.test(path));
const check = (id: string, label: string, present: boolean, detail: string): CategoryCheck => ({ id, label, status: present ? 'present' : 'missing', detail });

/** Inspectors are deliberately small and data-only so new export layouts can be added without changing the parser. */
export const inspectors: ExportInspector[] = [
  {
    id: 'harbor-mail', name: 'Harbor Mail export',
    matches: (paths) => has(paths, /^account\/(messages|contacts)\.(json|csv)$/i),
    inspect: (paths) => [
      check('messages', 'Messages', has(paths, /^account\/messages\.(json|csv)$/i), 'Expected account/messages.json or account/messages.csv.'),
      check('contacts', 'Contacts', has(paths, /^account\/contacts\.(json|csv)$/i), 'Expected account/contacts.json or account/contacts.csv.'),
      check('profile', 'Profile', has(paths, /^account\/(profile|account)\.(json|csv)$/i), 'No profile or account file was found. Confirm whether the service includes account settings separately.'),
      check('media', 'Media', has(paths, /^(media|attachments)\//i), 'No media folder was found. Confirm whether attachments were requested.'),
    ],
  },
  {
    id: 'google-takeout', name: 'Google Takeout',
    matches: (paths) => has(paths, /(^|\/)Takeout\//i),
    inspect: (paths) => [
      check('takeout-activity', 'Activity data', has(paths, /Takeout\/My Activity\//i), 'No My Activity category was found.'),
      check('takeout-contacts', 'Contacts', has(paths, /Takeout\/Contacts\//i), 'No Contacts category was found.'),
      check('takeout-media', 'Photos or media', has(paths, /Takeout\/Google Photos\//i), 'No Google Photos category was found.'),
    ],
  },
  {
    id: 'meta-download', name: 'Meta download',
    matches: (paths) => has(paths, /(^|\/)(your_facebook_activity|messages|profile_information)\//i),
    inspect: (paths) => [
      check('meta-profile', 'Profile information', has(paths, /(^|\/)profile_information\//i), 'No profile information category was found.'),
      check('meta-messages', 'Messages', has(paths, /(^|\/)messages\//i), 'No messages category was found.'),
      check('meta-media', 'Photos and videos', has(paths, /(^|\/)(photos_and_videos|media)\//i), 'No photos or videos category was found.'),
    ],
  },
];

export function inspectCategories(paths: string[]): { name?: string; checks: CategoryCheck[]; ambiguous?: string[] } {
  const matches = inspectors.filter((candidate) => candidate.matches(paths));
  if (matches.length > 1) return { name: 'Ambiguous export layout', checks: [], ambiguous: matches.map((candidate) => candidate.name) };
  const inspector = matches[0];
  return inspector ? { name: inspector.name, checks: inspector.inspect(paths) } : { checks: [] };
}
