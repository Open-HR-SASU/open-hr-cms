# Open HR CMS — Claude Code Instructions

## First Action Protocol

Before executing any CMS content tasks, load the following skills in order:

1. **Brand Guidelines:** `/Users/johnathenevans/Documents/Open HR/_REORGANIZATION_2025/SKILLS/openhr-brand-guidelines/SKILL.md`
2. **Strapi CMS:** `/Users/johnathenevans/Documents/Open HR/_REORGANIZATION_2025/SKILLS/strapi-cms/SKILL.md`

State what you read from each skill before proceeding with work.

---

## Project Context

**Purpose:** Strapi CMS instance for Open HR website content management
**Mission:** "RH pour tous" — employment infrastructure, not software

---

## Key Files

| File | Path | Purpose |
|------|------|---------|
| Seed Data | `./data/openhr-seed-data.json` | CMS content structure and entries |
| Seed Script | `./scripts/seed-openhr.js` | Executes seed data population |

---

## Execution Commands

```bash
# Populate CMS with seed data
npm run seed:openhr

# Or manually
node scripts/seed-openhr.js
```

---

## Working Rules

1. **Brand Compliance:** All content must align with Open HR brand guidelines (Teal 900 primary, ((○)) mark, "clear over clever" messaging)
2. **16-Year-Old Test:** Consumer-facing copy must be understandable by a 16-year-old — no jargon
3. **Seed File Authority:** The seed file is the source of truth for CMS content structure
4. **Preserve Existing:** When modifying seed data, preserve existing entry IDs to maintain relationships

---

## Content Boundaries

| ✅ GREEN (Public) | 🟡 YELLOW (Careful) | 🔴 RED (Never) |
|-------------------|---------------------|----------------|
| Mission statement | Pricing details | Proprietary methodology |
| Product benefits | Competitive positioning | Algorithm weights |
| Team bios (approved) | Partnership mentions | Internal metrics |

---

## Session Discipline

- Document changes in commit messages
- Test seed script after modifications: `node scripts/seed-openhr.js`
- Verify CMS admin panel reflects changes before closing session
