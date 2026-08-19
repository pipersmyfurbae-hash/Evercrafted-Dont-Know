/* Botanical Instrument Panel public boundary: customer memory is private session data; only public snapshots enter matching. */
import { VNEXT_KEYS, VNEXT_MEMORY_MATCH_SCHEMA_VERSION, type MemoryMatchPreference, type MemoryMatchProfile, type MemoryMatchResult, type MoodoorMemoryMatchSession } from "./vnext";
import { MoodoorPublishingService } from "./publishing";

const now = () => new Date().toISOString();
const load = <T,>(fallback: T): T => { try { return JSON.parse(localStorage.getItem(VNEXT_KEYS.memoryMatches) || JSON.stringify(fallback)) as T; } catch { return fallback; } };
const save = (items: MoodoorMemoryMatchSession[]) => localStorage.setItem(VNEXT_KEYS.memoryMatches, JSON.stringify(items));
const unique = (items: string[]) => Array.from(new Set(items));
const includesAny = (text: string, words: string[]) => words.some(word => text.includes(word));
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const makeId = () => `MM-${Date.now().toString(36).toUpperCase()}`;

const groups: Record<string, string[]> = {
  warmth: ["warm", "fire", "candle", "golden", "sun", "hearth", "glow", "orange"],
  nostalgia: ["grandmother", "grandmother's", "old", "remember", "childhood", "familiar", "again", "home"],
  winter: ["winter", "snow", "cold", "december", "christmas", "frost", "cabin"],
  quiet: ["quiet", "still", "silence", "soft", "after", "hushed", "calm"],
  ritual: ["ritual", "dinner", "gathering", "table", "tradition", "holiday"],
  botanical: ["garden", "cedar", "pine", "branch", "moss", "leaf", "flower", "botanical"],
  architectural: ["threshold", "door", "house", "line", "structure", "stone", "window"],
  dramatic: ["glowing", "storm", "dark", "contrast", "night", "bold", "deep"],
  cool: ["cool", "blue", "silver", "mist", "morning"],
  avoidHoliday: ["not christmas", "not christmasy", "no christmas", "without christmas"],
};

function interpret(text: string) {
  const value = text.toLowerCase();
  const signals = Object.keys(groups).filter(key => key !== "avoidHoliday" && includesAny(value, groups[key]));
  const avoids = (includesAny(value, groups.avoidHoliday) || (value.includes("christmas") && (value.includes("not") || value.includes("without")))) ? ["holiday-coded", "literal-christmas"] : [];
  const emotional_center = includesAny(value, groups.nostalgia) ? "familiar warmth" : includesAny(value, groups.quiet) ? "quiet belonging" : includesAny(value, groups.dramatic) ? "luminous contrast" : "a feeling worth carrying forward";
  const tension = includesAny(value, groups.winter) && includesAny(value, groups.warmth) ? "warmth against the cold" : includesAny(value, groups.ritual) && includesAny(value, groups.quiet) ? "gathering giving way to stillness" : includesAny(value, groups.architectural) ? "welcome held at a threshold" : "memory and the present meeting";
  const atmosphere = unique([includesAny(value, groups.quiet) ? "quiet" : "", includesAny(value, groups.warmth) ? "glowing" : "", includesAny(value, groups.winter) ? "winter air" : "", includesAny(value, groups.dramatic) ? "deep contrast" : "", includesAny(value, groups.ritual) ? "ritual" : ""].filter(Boolean));
  const sensory = unique([includesAny(value, ["cedar", "pine"]) ? "evergreen" : "", includesAny(value, ["orange", "citrus"]) ? "citrus brightness" : "", includesAny(value, ["brass", "metal"]) ? "aged metal" : "", includesAny(value, ["snow", "cold", "frost"]) ? "cold air" : ""].filter(Boolean));
  return {
    emotional_center, tension, atmosphere, sensory_signals: sensory,
    temporal_qualities: includesAny(value, groups.winter) ? ["winter"] : ["specific moment"],
    place_signals: includesAny(value, groups.architectural) ? ["threshold / home"] : [],
    material_signals: sensory,
    color_signals: includesAny(value, groups.cool) ? ["cool restraint"] : includesAny(value, groups.warmth) ? ["warm glow"] : ["natural, considered contrast"],
    movement: includesAny(value, groups.quiet) ? ["stillness"] : ["gentle movement"],
    warmth: includesAny(value, groups.warmth) ? "warm" : "balanced",
    restraint: includesAny(value, groups.quiet) ? "restrained" : "balanced",
    familiarity: includesAny(value, groups.nostalgia) ? "familiar" : "open",
    signals, avoids,
  };
}

function buildProfile(interpreted: ReturnType<typeof interpret>): MemoryMatchProfile {
  return { emotional_center: interpreted.emotional_center, tension: interpreted.tension, signals: interpreted.signals, avoids: interpreted.avoids, territory: interpreted.place_signals, palette_behavior: interpreted.color_signals, material_behavior: interpreted.material_signals, movement_behavior: interpreted.movement, story_signals: [...interpreted.atmosphere, ...interpreted.temporal_qualities], internal_dimensions: { warmth: interpreted.warmth === "warm" ? .8 : .5, restraint: interpreted.restraint === "restrained" ? .8 : .5, nostalgia: interpreted.familiarity === "familiar" ? .8 : .4, seasonality: interpreted.temporal_qualities.includes("winter") ? .8 : .4 } };
}

function entryText(entry: { title: string; summary: string; content: Record<string, unknown> }) {
  const design = entry.content.design as Record<string, unknown> | undefined;
  return [entry.title, entry.summary, String(entry.content.public_story || ""), String(design?.territory || ""), String(design?.foundation || ""), JSON.stringify(design?.essence || "")].join(" ").toLowerCase();
}

function resultFor(entry: ReturnType<typeof MoodoorPublishingService.list>[number], score: number, interpreted: ReturnType<typeof interpret>): MemoryMatchResult {
  const text = entryText(entry);
  const carried: string[] = [];
  if (interpreted.signals.includes("warmth") && includesAny(text, ["warm", "glow", "golden"])) carried.push("the warmth and light in your memory");
  if (interpreted.signals.includes("quiet") && includesAny(text, ["quiet", "still", "restrained"])) carried.push("its quieter, more spacious feeling");
  if (interpreted.signals.includes("botanical") && includesAny(text, ["botanical", "cedar", "pine", "garden", "leaf"])) carried.push("the botanical detail you remembered");
  if (interpreted.signals.includes("nostalgia") && includesAny(text, ["familiar", "old", "memory", "home"])) carried.push("a sense of familiarity without copying the memory literally");
  if (!carried.length) carried.push("the emotional atmosphere rather than only its literal objects");
  const quality: MemoryMatchResult["quality"] = score >= .72 ? "STRONG" : score >= .5 ? "MEANINGFUL" : "POSSIBLE";
  return { public_entry_id: entry.public_entry_id, slug: entry.slug, title: entry.title, summary: entry.summary, hero_asset: entry.hero_asset, availability: entry.commerce.availability || "Availability details by request", quality, internal_score: score, explanation: { headline: `${entry.title} carries something of that feeling.`, why_it_belongs: carried, carried_forward: carried, availability_label: entry.commerce.availability || "Availability details by request", public_safe: true } };
}

export const MoodoorMemoryMatchingService = {
  list: () => load<MoodoorMemoryMatchSession[]>([]),
  get: (sessionId: string) => load<MoodoorMemoryMatchSession[]>([]).find(session => session.match_session_id === sessionId),
  createMemorySession(text = "") {
    const timestamp = now();
    const session: MoodoorMemoryMatchSession = { match_session_id: makeId(), schema_version: VNEXT_MEMORY_MATCH_SCHEMA_VERSION, status: "DRAFT", memory_input: { text, created_at: timestamp, retention: "SAVED_UNTIL_RESTART" }, interpretation: { emotional_center: "", tension: "", atmosphere: [], sensory_signals: [], temporal_qualities: [], place_signals: [], material_signals: [], color_signals: [], movement:[], warmth:"", restraint:"", familiarity:"", signals:[], avoids:[] }, matching_profile: { emotional_center: "", tension: "", signals: [], avoids: [], territory: [], palette_behavior: [], material_behavior: [], movement_behavior: [], story_signals: [], internal_dimensions: {} }, candidate_pool: [], matches: [], no_match: null, customer_preferences: [], revision: 1, provenance: { created_at: timestamp, updated_at: timestamp, published_entry_ids: [], privacy_boundary: "PRIVATE_CUSTOMER_MEMORY" } };
    save([...this.list(), session]);
    return session;
  },
  interpretCustomerMemory(sessionId: string, text?: string) {
    const session = this.get(sessionId);
    if (!session) throw new Error("Memory session not found");
    const input = (text ?? session.memory_input.text).trim();
    if (!input) throw new Error("Tell Moodoor a memory before continuing.");
    const interpreted = interpret(input);
    const next = { ...session, memory_input: { ...session.memory_input, text: input }, interpretation: interpreted, matching_profile: buildProfile(interpreted), status: "INTERPRETED" as const, revision: session.revision + 1, provenance: { ...session.provenance, updated_at: now() } };
    this.replace(next);
    return next;
  },
  findEligibleDesigns: () => MoodoorPublishingService.list().filter(entry => entry.status === "PUBLISHED" && entry.content_type === "DESIGN"),
  scoreCandidates(sessionId: string) {
    const session = this.get(sessionId);
    if (!session) throw new Error("Memory session not found");
    const current = session.status === "DRAFT" ? this.interpretCustomerMemory(sessionId) : session;
    const interpreted = current.interpretation;
    return this.findEligibleDesigns().map(entry => {
      const text = entryText(entry);
      let score = .24;
      for (const signal of interpreted.signals) {
        if (signal === "warmth" && includesAny(text, ["warm", "glow", "golden", "brass"])) score += .13;
        if (signal === "nostalgia" && includesAny(text, ["familiar", "old", "memory", "home"])) score += .13;
        if (signal === "winter" && includesAny(text, ["winter", "snow", "pine", "cedar"])) score += .1;
        if (signal === "quiet" && includesAny(text, ["quiet", "still", "restrained"])) score += .13;
        if (signal === "botanical" && includesAny(text, ["botanical", "garden", "leaf", "cedar", "pine"])) score += .1;
        if (signal === "architectural" && includesAny(text, ["threshold", "structure", "line"])) score += .08;
        if (signal === "dramatic" && includesAny(text, ["contrast", "dark", "deep"])) score += .08;
      }
      if (current.customer_preferences.includes("MORE_RESTRAINED") && includesAny(text, ["quiet", "restrained", "negative"])) score += .08;
      if (current.customer_preferences.includes("WARMER") && includesAny(text, ["warm", "glow", "golden"])) score += .08;
      if (current.customer_preferences.includes("COOLER") && includesAny(text, ["cool", "mist", "silver"])) score += .08;
      if (interpreted.avoids.length && includesAny(text, ["christmas", "holiday"])) score -= .35;
      return { entry, score: clamp(score) };
    }).filter(candidate => !(interpreted.avoids.length && includesAny(entryText(candidate.entry), ["christmas", "holiday"]))).filter(candidate => candidate.score >= .5).sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title)).slice(0, 3).map(candidate => resultFor(candidate.entry, candidate.score, interpreted));
  },
  rankCandidates(sessionId: string) {
    const session = this.get(sessionId);
    if (!session) throw new Error("Memory session not found");
    const matches = this.scoreCandidates(sessionId);
    const eligible = this.findEligibleDesigns();
    const next = { ...this.get(sessionId)!, candidate_pool: eligible.map(entry => entry.public_entry_id), matches, status: matches.length ? "MATCHED" as const : "NO_MATCH" as const, no_match: matches.length ? null : { message: "We don't have a design that carries this memory closely enough yet.", custom_design_label: "Start a custom design" }, revision: session.revision + 1, provenance: { ...session.provenance, updated_at: now(), published_entry_ids: eligible.map(entry => entry.public_entry_id) } };
    this.replace(next);
    return next;
  },
  applyPreference(sessionId: string, preference: MemoryMatchPreference) {
    const session = this.get(sessionId);
    if (!session) throw new Error("Memory session not found");
    const next = { ...session, customer_preferences: unique([...session.customer_preferences, preference]) as MemoryMatchPreference[], revision: session.revision + 1, provenance: { ...session.provenance, updated_at: now() } };
    this.replace(next);
    return this.rankCandidates(sessionId);
  },
  restartSession(sessionId: string) { save(this.list().filter(session => session.match_session_id !== sessionId)); },
  handoffToCustomDesign(sessionId: string) { const session = this.get(sessionId); if (!session) throw new Error("Memory session not found"); const next = { ...session, status: "HANDOFF" as const, revision: session.revision + 1, provenance: { ...session.provenance, updated_at: now() } }; this.replace(next); return next; },
  replace(next: MoodoorMemoryMatchSession) { save(this.list().map(session => session.match_session_id === next.match_session_id ? next : session)); },
};
