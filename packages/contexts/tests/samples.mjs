/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// Shared synthetic records for the tests (no personal data).
export const UUID_A = '{11111111-2222-4333-8444-555555555555}';
export const UUID_B = '{aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee}';
export const rule = (over = {}) => ({
  version: 1, id: 'r_7f3a', enabled: true, match: { hosts: ['x.com', '*.x.com'] }, contexts: 'all',
  instruction: 'I come here to post and answer mentions. If I drift into the feed, nudge me.',
  limits: { daily_minutes: 15, allowed_hours: null }, observation: 'outline', observation_raised_hosts: [],
  effects: ['nudge', 'suggest_leave', 'pause_site'], override: 'confirm', agents: { access: 'none', instruction: '' },
  created_at: 1790000000000, updated_at: 1790000000000, ...over,
});
export const manifest = (over = {}) => ({
  version: 1, name: 'Fixture', kind: 'web',
  environments: [{ name: 'local', base_url: 'http://localhost:5173' }, { name: 'production', base_url: 'https://example.com' }],
  services: [{ name: 'Vite', url: 'http://localhost:5173/', port: 5173 }],
  surfaces: [{ name: 'Repository', url: 'https://github.com/acme/app', kind: 'repository' }], ...over,
});
