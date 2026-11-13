# Veerly icon set v1 — hand-drawn on a 24 grid.
# Stroke elements inherit stroke from the wrapper. Elements with class="a" are the yellow accent fill.
# Order matters: later elements paint on top.
def N(x,y,w,h):  # the Veerly notch (from the V logo flag): slanted bottom-left
    s=round(w*0.29,2); return f'<path class="a" d="M{x} {y}h{w}v{h}h-{round(w-s,2)}z"/>'
ICONS = {}
def I(name, concept, body, ui=False): ICONS[name]=dict(concept=concept, body=body, ui=ui)

# ---------- Course structure ----------
I('path','Learning path', N(16,2.5,5,3.8)+
  '<circle cx="5.5" cy="18.5" r="2.25"/><path d="M8 18.5h7a3.25 3.25 0 0 0 0-6.5H9a3.25 3.25 0 0 1 0-6.5h7M16 2.5v6"/>')
I('portfolio','Portfolio projects',
  '<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><path d="M3 12.5h6.5M14.5 12.5H21"/>'+N(9.5,10.5,5,4))
I('job-ready','Job-ready checklist',
  '<path class="a" d="M12 2.6l2.4 1.8 3-.2.8 2.9 2.5 1.6-1 2.8 1 2.8-2.5 1.6-.8 2.9-3-.2L12 21.4l-2.4-1.8-3 .2-.8-2.9-2.5-1.6 1-2.8-1-2.8 2.5-1.6.8-2.9 3 .2z"/>'
  '<path d="M12 2.6l2.4 1.8 3-.2.8 2.9 2.5 1.6-1 2.8 1 2.8-2.5 1.6-.8 2.9-3-.2L12 21.4l-2.4-1.8-3 .2-.8-2.9-2.5-1.6 1-2.8-1-2.8 2.5-1.6.8-2.9 3 .2z"/><path d="M8.6 12.2l2.3 2.3 4.5-4.9"/>')
I('dashboard','Trackers',
  '<path class="a" d="M6 4h12a3 3 0 0 1 3 3v2.5H3V7a3 3 0 0 1 3-3z"/><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9.5h18M9.5 9.5V20M13.5 16.5v-2M17 16.5v-4"/>')
I('target','Job hunt tracker',
  '<circle class="a" cx="11" cy="13" r="4.5"/><circle cx="11" cy="13" r="8.5"/><circle cx="11" cy="13" r="4.5"/><path d="M11 13l7.5-7.5M18.5 5.5V2.5M18.5 5.5h3"/>')
I('week-review','Weekly review',
  '<path class="a" d="M6.5 5h11a3 3 0 0 1 3 3v2h-17V8a3 3 0 0 1 3-3z"/><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17M9 15.2l2.1 2.1 4-4.3"/>')
I('mic','Interview practice',
  '<rect class="a" x="9" y="3" width="6" height="11" rx="3"/><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"/>')
I('folder','Portfolio progress',
  '<path d="M3.5 17.5V6.5A1.5 1.5 0 0 1 5 5h3.6l2 2.5H17A1.5 1.5 0 0 1 18.5 9v1.5"/>'
  '<path class="a" d="M3.5 18.5l2.4-6.6A1.5 1.5 0 0 1 7.3 11h13a1 1 0 0 1 .95 1.3l-2.1 6.2a1.5 1.5 0 0 1-1.4 1H4.5a1 1 0 0 1-1-1z"/>'
  '<path d="M3.5 18.5l2.4-6.6A1.5 1.5 0 0 1 7.3 11h13a1 1 0 0 1 .95 1.3l-2.1 6.2a1.5 1.5 0 0 1-1.4 1H4.5a1 1 0 0 1-1-1z"/>')
I('library','Resources / library',
  '<rect x="3.5" y="4" width="4" height="16" rx="1"/><rect class="a" x="9" y="7" width="4" height="13" rx="1"/><rect x="9" y="7" width="4" height="13" rx="1"/><path d="M14.6 6.1l3.4-.9a1 1 0 0 1 1.2.7l3 12.2a1 1 0 0 1-.7 1.2l-3.4.9a1 1 0 0 1-1.2-.7L13.9 7.3a1 1 0 0 1 .7-1.2z"/><path d="M3.5 8h4M9 10.5h4"/>')
I('checklist','SOP library',
  '<rect class="a" x="10" y="10.5" width="12" height="5" rx="2.5"/><path d="M3.5 6.3l1.6 1.6L8.3 4.7M11.5 6.5h9M3.5 12.6l1.6 1.6 3.2-3.2M11.5 13h9M11.5 19.5h9"/><rect x="3.8" y="17.5" width="4" height="4" rx="1.2"/>')
I('chat-pair','Interview prep',
  '<path d="M14.5 7.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5.5a2 2 0 0 0 2 2h.5V15l2.8-2.5"/>'
  '<path class="a" d="M11 9h8a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-.5v2.8L15.3 18H11a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z"/>'
  '<path d="M11 9h8a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-.5v2.8L15.3 18H11a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z"/>')
I('dictionary','Keyword bank',
  '<path class="a" d="M14.5 3H18v6.5l-1.75-1.3-1.75 1.3z"/><path d="M4 18.5V5a2 2 0 0 1 2-2h13.5v15.5H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h13.5"/><path d="M7.5 14.5l2.5-6.5 2.5 6.5M8.4 12.3h3.2"/>')

# ---------- Projects ----------
I('inbox','Inbox zero / inbox',
  '<path class="a" d="M3 13.5h4.6l1.4 2.5h6l1.4-2.5H21V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'
  '<path d="M3 13.5L5.4 6A2 2 0 0 1 7.3 4.5h9.4a2 2 0 0 1 1.9 1.5l2.4 7.5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 13.5h4.6l1.4 2.5h6l1.4-2.5H21"/>')
I('calendar-clock','Calendar across time zones',
  '<path d="M20.5 10.5V8a3 3 0 0 0-3-3h-11a3 3 0 0 0-3 3v9.5a3 3 0 0 0 3 3H11M8 3v4M16 3v4M3.5 10H11"/>'
  '<circle class="a" cx="17" cy="16.5" r="5"/><circle cx="17" cy="16.5" r="5"/><path d="M17 14v2.7l1.6 1"/>')
I('handshake','Client onboarding',
  '<circle class="a" cx="12.2" cy="13" r="4.4"/>'
  '<path d="M3 7.5v8.5M21 7.5v8.5"/>'
  '<path d="M21 9h-4.8l-4.7 2.2a1.45 1.45 0 0 0 1.1 2.7l2.8-.9 4.2 3.5"/><path d="M3 9h3.8l3.1-1.6a2 2 0 0 1 1.6-.1l2.4.9"/>'
  '<path d="M5.6 14.6l4.4 4a1.35 1.35 0 0 0 1.9-1.9M11.2 15.9l1.7 1.6a1.35 1.35 0 0 0 1.9-1.9l-1.2-1.2"/>')
I('plane','Travel itinerary',
  '<path class="a" d="M10 13.5l2.6 6.8L21 4z"/><path d="M21 4L3 11l7 2.5 2.6 6.8z"/><path d="M10 13.5L16 8.5"/>')
I('sheet','Expense tracker / sheet',
  '<path class="a" d="M6 4h12a2.5 2.5 0 0 1 2.5 2.5v3h-17v-3A2.5 2.5 0 0 1 6 4z"/><rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M3.5 14.75h17M9.5 9.5V20"/>')
I('palette','Social media pack / Canva',
  '<circle class="a" cx="16.4" cy="10" r="2.4"/>'
  '<path d="M12 3a9 9 0 0 0 0 18c1.3 0 2-.8 2-1.9 0-1.4-1.1-1.7-1.1-2.9 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.4 17 3 12 3z"/><circle cx="7.5" cy="12" r="1.2"/><circle cx="9" cy="7.7" r="1.2"/><circle cx="13.3" cy="6.6" r="1.2"/>')
I('board','Multi-client task board',
  '<rect x="3" y="4" width="5" height="15" rx="1.6"/><rect class="a" x="9.5" y="4" width="5" height="9.5" rx="1.6"/><rect x="9.5" y="4" width="5" height="9.5" rx="1.6"/><rect x="16" y="4" width="5" height="12" rx="1.6"/>')
I('bolt','Automation / Zapier',
  '<path class="a" d="M13.5 2.5L4.5 13.5h7l-1 8 9-11h-7z"/><path d="M13.5 2.5L4.5 13.5h7l-1 8 9-11h-7z"/>')
I('workflow','Automated onboarding system',
  '<rect x="3" y="3.5" width="7" height="6" rx="2"/><rect x="14" y="14.5" width="7" height="6" rx="2"/><circle class="a" cx="17.5" cy="6.5" r="3"/><circle cx="17.5" cy="6.5" r="3"/><path d="M10 6.5h4.5M6.5 9.5V15a2.5 2.5 0 0 0 2.5 2.5h5M17.5 9.5v5"/>')
I('gem','Specialist offer / retainer',
  '<path class="a" d="M6.8 4h5.2l-2.4 5H3.3z"/><path d="M6.8 4h10.4l3.5 5L12 20.5 3.3 9z"/><path d="M3.3 9h17.4M9.6 9L12 20.5 14.4 9 12 4z"/>')
I('team','Team handbook / people',
  '<path d="M14.2 4.9a3 3 0 1 1 1.9 5.6M16.7 13.4A5.5 5.5 0 0 1 21 18.8"/><circle class="a" cx="9" cy="8.5" r="3.5"/><circle cx="9" cy="8.5" r="3.5"/><path d="M3 20.5a6 6 0 0 1 12 0"/>')

# ---------- Core skills ----------
I('mail','Inbox management / email',
  '<path class="a" d="M4.6 5h14.8L12 11.4z"/><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.6 6.4L12 13l8.4-6.6"/>')
I('calendar-days','Calendar and scheduling',
  '<path class="a" d="M6.5 5h11a3 3 0 0 1 3 3v2h-17V8a3 3 0 0 1 3-3z"/><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/><path stroke-width="2.6" d="M8 14h.01M12 14h.01M16 14h.01M8 17.3h.01M12 17.3h.01"/>')
I('pen','Written communication',
  '<rect class="a" x="11" y="17.5" width="10.5" height="4" rx="2"/><path d="M15.6 4.4a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4zM13.5 6.5l3 3M12.5 19.5h7.5"/>')
I('spreadsheet','Docs and spreadsheets',
  '<path class="a" d="M14 3v5h5z"/><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5"/><rect x="8.5" y="12" width="7" height="5.5" rx="1"/><path d="M8.5 14.75h7M12 12v5.5"/>')
I('map','Research and travel',
  '<path class="a" d="M8.5 4l7 2.5V20l-7-2.5z"/><path d="M3 6.5L8.5 4l7 2.5L21 4v13.5L15.5 20l-7-2.5L3 20zM8.5 4v13.5M15.5 6.5V20"/>')
I('headset','Customer support',
  '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect class="a" x="3" y="13" width="4" height="6" rx="1.6"/><rect x="3" y="13" width="4" height="6" rx="1.6"/><rect x="17" y="13" width="4" height="6" rx="1.6"/><path d="M20 19v.3a2.7 2.7 0 0 1-2.7 2.7H14"/>')
I('board-square','Project and task tools',
  '<rect class="a" x="9.5" y="5.5" width="6" height="10" rx="2"/><rect x="3" y="3" width="18" height="18" rx="3.5"/><path d="M7.5 7.5v9M12.5 7.5v6M17 7.5v7.5"/>')
I('steps','SOPs and process',
  N(17.5,3,4,3)+'<path d="M17.5 3v4.5M2.5 20.5h4.5V16h4.5v-4.25H16V7.5h4.5"/>')
I('shield','Privacy and security',
  '<path class="a" d="M12 3v18c-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M9 12l2.1 2.1 4-4.4"/>')

# ---------- Tool guides ----------
I('mail-open','Gmail Help Center',
  '<path d="M3 10v8.5A2.5 2.5 0 0 0 5.5 21h13a2.5 2.5 0 0 0 2.5-2.5V10l-9-6.5z"/><path class="a" d="M6.8 12.8V7.5h10.4v5.3L12 16.2z"/><path d="M6.8 12.5V7.5h10.4v5"/><path d="M3 10l9 6 9-6"/>')
I('calendar','Google Calendar Help Center',
  '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/>'+N(11.5,13,5.5,4))
I('grad-cap','Google Workspace Training',
  '<path class="a" d="M12 4L2.5 9 12 14l9.5-5z"/><path d="M12 4L2.5 9 12 14l9.5-5z"/><path d="M6.5 11.2v4.3c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3v-4.3M21.5 9v5"/>')
I('idea','Google Workspace Learning Center',
  '<path class="a" d="M8.7 14.6A6 6 0 1 1 15.3 14.6c-.5.5-.8 1.1-.8 1.9H9.5c0-.8-.3-1.4-.8-1.9z"/><path d="M8.7 14.6A6 6 0 1 1 15.3 14.6c-.5.5-.8 1.1-.8 1.9v1H9.5v-1c0-.8-.3-1.4-.8-1.9zM10 21h4"/>')
I('at','Outlook training',
  '<circle class="a" cx="12" cy="12" r="3.75"/><circle cx="12" cy="12" r="3.75"/><path d="M15.75 8.5v4.75a2.6 2.6 0 0 0 5.25 0V12a9 9 0 1 0-3.5 7.1"/>')
I('monitor','Microsoft Learn',
  '<rect x="3" y="4" width="18" height="12.5" rx="2.5"/>'+N(6,7,6,4)+'<path d="M12 16.5V20M8 20.5h8"/>')
I('calendar-plus','Calendly Help Center',
  '<circle class="a" cx="12" cy="15.2" r="3.6"/><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17M12 13v4.4M9.8 15.2h4.4"/>')
I('video','Zoom Learning Center',
  '<path class="a" d="M15.5 10.5l5.5-3.2v9.4l-5.5-3.2z"/><rect x="2.5" y="6" width="13" height="12" rx="2.75"/><path d="M15.5 10.5l5.5-3.2v9.4l-5.5-3.2"/>')
I('chat','Slack Help Center',
  '<path class="a" d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9.5L5 20.5V17a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9.5L5 20.5V17a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path stroke-width="2.6" d="M8 10.5h.01M12 10.5h.01M16 10.5h.01"/>')
I('grid','Trello Guide',
  '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect class="a" x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>')
I('todo','Asana Academy',
  '<circle class="a" cx="5.5" cy="5.5" r="2.2"/><circle cx="5.5" cy="5.5" r="2.2"/><path d="M10.5 5.5h10M10.5 12h10M10.5 18.5h6"/><circle cx="5.5" cy="12" r="2.2"/><circle cx="5.5" cy="18.5" r="2.2"/>')
I('notebook','Notion Academy',
  '<rect x="5" y="3" width="14.5" height="18" rx="2.5"/>'+N(10,7,6,3.4)+'<path d="M3 7.5h4M3 12h4M3 16.5h4M10 14h6"/>')
I('brush','Canva Design School',
  '<path class="a" d="M11 13.2a3 3 0 0 0-4.2 0c-1.3 1.3-.6 3.8-3.3 5.3 2.6 1.5 6.3 1.4 7.9-.2a3 3 0 0 0-.4-5.1z"/><path d="M11 13.2a3 3 0 0 0-4.2 0c-1.3 1.3-.6 3.8-3.3 5.3 2.6 1.5 6.3 1.4 7.9-.2a3 3 0 0 0-.4-5.1zM10.8 13l9.7-9.5M13 15.2l2-2"/>')
I('key','Bitwarden Help Center',
  '<circle class="a" cx="8" cy="15.5" r="4.5"/><circle cx="8" cy="15.5" r="4.5"/><circle cx="8" cy="15.5" r="1" fill="currentColor"/><path d="M11.2 12.3L20 3.5M16.5 7l2.5 2.5M14 9.5l2 2"/>')
I('nib','Technical Writing One',
  '<path class="a" d="M12 3L6.5 11l2.4 8h6.2l2.4-8z"/><path d="M12 3L6.5 11l2.4 8h6.2l2.4-8zM12 3v7.5M8 21.5h8"/><circle cx="12" cy="12.2" r="1.4" fill="currentColor"/>')

# ---------- Certifications ----------
I('award','HubSpot Academy certification',
  '<circle class="a" cx="12" cy="9" r="5.75"/><circle cx="12" cy="9" r="5.75"/><path d="M8.6 13.6L7 21l5-2.6 5 2.6-1.6-7.4M12 6.5l.8 1.6 1.7.3-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.3z"/>')
I('sparkle','Google AI Essentials',
  '<path class="a" d="M10.5 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5z"/><path d="M10.5 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5zM18 14.5c.3 1.5 1 2.2 2.5 2.5-1.5.3-2.2 1-2.5 2.5-.3-1.5-1-2.2-2.5-2.5 1.5-.3 2.2-1 2.5-2.5z"/><path stroke-width="2.6" d="M5 19.5h.01"/>')
I('medal','Microsoft Office Specialist',
  '<path d="M6.5 2.5l3.6 7.2M17.5 2.5l-3.6 7.2"/><circle class="a" cx="12" cy="15" r="5.75"/><circle cx="12" cy="15" r="5.75"/><circle cx="12" cy="15" r="2.2"/>')
I('bot','Microsoft 365 Copilot',
  '<rect class="a" x="6.5" y="11" width="11" height="5.5" rx="2.75"/><rect x="4" y="8" width="16" height="11.5" rx="3.5"/><path d="M12 8V5M2.5 12.5v3M21.5 12.5v3M9.5 13v1.5M14.5 13v1.5"/><circle cx="12" cy="3.6" r="1.4"/>')
I('wrench','Google IT Support',
  '<g transform="rotate(-45 12 12)"><path class="a" d="M21 9.1l-2.6 1.3v3.2l2.6 1.3A4.6 4.6 0 1 1 21 9.1z"/>'
  '<path d="M13.4 10.25H4a1.75 1.75 0 0 0 0 3.5h9.4"/><path d="M21 9.1l-2.6 1.3v3.2l2.6 1.3A4.6 4.6 0 1 1 21 9.1z"/></g>')

# ---------- Interface (landing page) ----------
I('levels','Level check',
  N(16,3.5,5,8)+'<rect x="3" y="14" width="5" height="6.5" rx="1.5"/><rect x="9.5" y="9" width="5" height="11.5" rx="1.5"/><rect x="16" y="3.5" width="5" height="17" rx="1.5"/>',ui=True)
I('arrow-right','Arrow right','<path d="M4.5 12h14.5M13.5 6.5L19 12l-5.5 5.5"/>',ui=True)
I('arrow-down','Arrow down','<path d="M12 4.5V19M6.5 13.5L12 19l5.5-5.5"/>',ui=True)
I('check','Check','<path d="M4.5 12.8l4.6 4.5L19.5 6.8"/>',ui=True)
I('chevron-down','Chevron down','<path d="M6.5 9.5l5.5 5.5 5.5-5.5"/>',ui=True)
I('chevron-up','Chevron up','<path d="M6.5 14.5L12 9l5.5 5.5"/>',ui=True)
I('clock','Clock','<circle cx="12" cy="12" r="8.75"/><path d="M12 7.5V12l3 2"/>',ui=True)
I('lock','Lock','<path class="a" d="M7.5 10.5h9a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-4.5a3 3 0 0 1 3-3z"/><rect x="4.5" y="10.5" width="15" height="10.5" rx="3"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5V17"/>',ui=True)
I('close','Close','<path d="M6 6l12 12M18 6L6 18"/>',ui=True)
I('arrow-left','Arrow left','<path d="M19.5 12H5M10.5 6.5L5 12l5.5 5.5"/>',ui=True)
I('restart','Restart','<path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5L4.5 8.8M4.5 4.5v4.3h4.3"/>',ui=True)
I('spinner','Loading','<circle cx="12" cy="12" r="8.5" opacity=".2"/><path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5"/>',ui=True)

# map: old Lucide glyph name -> new Veerly icon
OLD = {'route':'path','briefcase':'portfolio','badge-check':'job-ready','layout-dashboard':'dashboard','target':'target','calendar-check':'week-review','mic':'mic','folder-open':'folder','inbox':'inbox','calendar-clock':'calendar-clock','handshake':'handshake','plane':'plane','sheet':'sheet','palette':'palette','kanban':'board','zap':'bolt','workflow':'workflow','gem':'gem','users':'team','library-big':'library','list-checks':'checklist','messages-square':'chat-pair','book-a':'dictionary','mail':'mail','calendar-days':'calendar-days','pen-line':'pen','file-spreadsheet':'spreadsheet','map':'map','headset':'headset','square-kanban':'board-square','list-ordered':'steps','shield-check':'shield','mail-open':'mail-open','calendar':'calendar','graduation-cap':'grad-cap','lightbulb':'idea','at-sign':'at','monitor':'monitor','calendar-plus':'calendar-plus','video':'video','message-square':'chat','layout-grid':'grid','list-todo':'todo','notebook':'notebook','brush':'brush','key-round':'key','pen-tool':'nib','award':'award','sparkles':'sparkle','medal':'medal','bot':'bot','wrench':'wrench'}
