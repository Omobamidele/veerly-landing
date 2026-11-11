# Veerly icons

61 original icons drawn for Veerly on a 24 px grid: 2 px round stroke in navy `#002B42` (or `currentColor`), with one flat yellow `#FFD84D` accent shape per icon, often the slanted notch from the V logo. Colours allowed: navy, blue `#0075AD`, yellow, white, light-blue tints.

- SVGs: this folder (`<name>.svg`, navy + yellow).
- React: `components/icons/veerly-icons.tsx` (`IconArrowRight` etc.; stroke is `currentColor`; `accent={false}` drops the yellow; `--veerly-icon-accent` recolours it).
- Notion tiles (280×280): `https://veerly-coach.netlify.app/icons/v2/<navy|blue|yellow|tint>/<name>.png`.
- Contact sheet: `screenshots/icons-sheet.png`.
- Source: `brand-src/icons-src/icons.py` (edit here, then run `build.py`, `gen_tsx.py`, `tiles.py`, `sheet.py`).

| Icon | Used for | Replaces |
|---|---|---|
| `path` | Learning path | route |
| `portfolio` | Portfolio projects | briefcase |
| `job-ready` | Job-ready checklist | badge-check |
| `dashboard` | Trackers | layout-dashboard |
| `target` | Job hunt tracker | target |
| `week-review` | Weekly review | calendar-check |
| `mic` | Interview practice | mic |
| `folder` | Portfolio progress | folder-open |
| `library` | Resources / library | library-big |
| `checklist` | SOP library | list-checks |
| `chat-pair` | Interview prep | messages-square |
| `dictionary` | Keyword bank | book-a |
| `inbox` | Inbox zero / inbox | inbox |
| `calendar-clock` | Calendar across time zones | calendar-clock |
| `handshake` | Client onboarding | handshake |
| `plane` | Travel itinerary | plane |
| `sheet` | Expense tracker / sheet | sheet |
| `palette` | Social media pack / Canva | palette |
| `board` | Multi-client task board | kanban |
| `bolt` | Automation / Zapier | zap |
| `workflow` | Automated onboarding system | workflow |
| `gem` | Specialist offer / retainer | gem |
| `team` | Team handbook / people | users |
| `mail` | Inbox management / email | mail |
| `calendar-days` | Calendar and scheduling | calendar-days |
| `pen` | Written communication | pen-line |
| `spreadsheet` | Docs and spreadsheets | file-spreadsheet |
| `map` | Research and travel | map |
| `headset` | Customer support | headset |
| `board-square` | Project and task tools | square-kanban |
| `steps` | SOPs and process | list-ordered |
| `shield` | Privacy and security | shield-check |
| `mail-open` | Gmail Help Center | mail-open |
| `calendar` | Google Calendar Help Center | calendar |
| `grad-cap` | Google Workspace Training | graduation-cap |
| `idea` | Google Workspace Learning Center | lightbulb |
| `at` | Outlook training | at-sign |
| `monitor` | Microsoft Learn | monitor |
| `calendar-plus` | Calendly Help Center | calendar-plus |
| `video` | Zoom Learning Center | video |
| `chat` | Slack Help Center | message-square |
| `grid` | Trello Guide | layout-grid |
| `todo` | Asana Academy | list-todo |
| `notebook` | Notion Academy | notebook |
| `brush` | Canva Design School | brush |
| `key` | Bitwarden Help Center | key-round |
| `nib` | Technical Writing One | pen-tool |
| `award` | HubSpot Academy certification | award |
| `sparkle` | Google AI Essentials | sparkles |
| `medal` | Microsoft Office Specialist | medal |
| `bot` | Microsoft 365 Copilot | bot |
| `wrench` | Google IT Support | wrench |
| `arrow-right` | Arrow right | — |
| `arrow-down` | Arrow down | — |
| `check` | Check | — |
| `chevron-down` | Chevron down | — |
| `chevron-up` | Chevron up | — |
| `clock` | Clock | — |
| `lock` | Lock | — |
| `restart` | Restart | — |
| `spinner` | Loading | — |
