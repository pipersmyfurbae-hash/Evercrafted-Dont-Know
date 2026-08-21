import assert from 'node:assert/strict';
import { rankMoodoorMatches, toPublicMatch, type MoodoorListing, type MoodProfile } from '../services/moodoor/core';

/**
 * Covers the Phase 2 API boundary added on top of the existing matcher:
 * toPublicMatch() must strip internal fields (quality, isMoodoorPublished,
 * publishedAt) before a match crosses POST /api/v1/moodoor/matches, per the
 * public response contract in the migration plan doc.
 */

type TestCase = { name: string; run: () => void };
const cases: TestCase[] = [];
function test(name: string, run: () => void): void {
  cases.push({ name, run });
}

function makeListing(overrides: Partial<MoodoorListing> = {}): MoodoorListing {
  return {
    id: 'winter-hearth',
    title: 'Winter Hearth',
    summary: 'A warm, evergreen wreath with cedar and quiet brass.',
    imageUrl: null,
    price: 148,
    currency: 'USD',
    seasonTags: ['winter'],
    moodTags: ['warm', 'hearth'],
    paletteTags: ['golden', 'evergreen'],
    formula: 'crescent',
    availability: 'in_stock',
    quality: 'approved',
    publishedAt: '2026-01-01T00:00:00.000Z',
    isMoodoorPublished: true,
    ...overrides,
  };
}

const profile: MoodProfile = { mood: 'warm', season: 'winter', door: 'dark-wood' };

test('toPublicMatch strips quality, isMoodoorPublished, and publishedAt from the listing', () => {
  const [match] = rankMoodoorMatches(profile, [makeListing()]);
  const publicMatch = toPublicMatch(match);

  assert.equal('quality' in publicMatch.listing, false);
  assert.equal('isMoodoorPublished' in publicMatch.listing, false);
  assert.equal('publishedAt' in publicMatch.listing, false);
  assert.equal(publicMatch.listing.title, 'Winter Hearth');
  assert.equal(publicMatch.explanation, match.explanation);
  assert.deepEqual(publicMatch.matchedSignals, match.matchedSignals);
});

test('toPublicMatch never exposes the internal numeric score', () => {
  const [match] = rankMoodoorMatches(profile, [makeListing()]);
  const publicMatch = toPublicMatch(match);
  assert.equal('score' in publicMatch, false);
});

let passed = 0;
for (const { name, run } of cases) {
  try {
    run();
    passed += 1;
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}
console.log(`\n${passed} Moodoor projection boundary tests passed.`);
