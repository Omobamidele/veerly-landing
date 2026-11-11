// Veerly icon set. Hand-drawn on a 24 grid for Veerly; generated from brand-src/icons (do not edit by hand).
// Navy/blue stroke via currentColor, one yellow accent per icon (set --veerly-icon-accent or pass accent={false}).
import * as React from "react"

export type VeerlyIconProps = React.SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string; accent?: boolean }

function make(name: string, render: (accent: boolean) => React.ReactNode) {
  const Icon = React.forwardRef<SVGSVGElement, VeerlyIconProps>(function VeerlyIcon(
    { size = 24, strokeWidth = 2, accent = true, className, ...props }, ref) {
    return (
      <svg ref={ref} xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
        aria-hidden={props["aria-label"] ? undefined : true} data-veerly-icon={name}
        className={["veerly-icon", className].filter(Boolean).join(" ")} {...props}>
        {render(accent)}
      </svg>
    )
  })
  Icon.displayName = `Icon${name}`
  return Icon
}

/** Learning path */
export const IconPath = make("Path", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M16 2.5h5v3.8h-3.55z"/>}<circle cx="5.5" cy="18.5" r="2.25"/><path d="M8 18.5h7a3.25 3.25 0 0 0 0-6.5H9a3.25 3.25 0 0 1 0-6.5h7M16 2.5v6"/></>)
/** Portfolio projects */
export const IconPortfolio = make("Portfolio", (accent) => <><rect x="3" y="7" width="18" height="13" rx="3"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><path d="M3 12.5h6.5M14.5 12.5H21"/>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M9.5 10.5h5v4h-3.55z"/>}</>)
/** Job-ready checklist */
export const IconJobReady = make("JobReady", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M12 2.6l2.4 1.8 3-.2.8 2.9 2.5 1.6-1 2.8 1 2.8-2.5 1.6-.8 2.9-3-.2L12 21.4l-2.4-1.8-3 .2-.8-2.9-2.5-1.6 1-2.8-1-2.8 2.5-1.6.8-2.9 3 .2z"/>}<path d="M12 2.6l2.4 1.8 3-.2.8 2.9 2.5 1.6-1 2.8 1 2.8-2.5 1.6-.8 2.9-3-.2L12 21.4l-2.4-1.8-3 .2-.8-2.9-2.5-1.6 1-2.8-1-2.8 2.5-1.6.8-2.9 3 .2z"/><path d="M8.6 12.2l2.3 2.3 4.5-4.9"/></>)
/** Trackers */
export const IconDashboard = make("Dashboard", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M6 4h12a3 3 0 0 1 3 3v2.5H3V7a3 3 0 0 1 3-3z"/>}<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9.5h18M9.5 9.5V20M13.5 16.5v-2M17 16.5v-4"/></>)
/** Job hunt tracker */
export const IconTarget = make("Target", (accent) => <>{accent && <circle fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" cx="11" cy="13" r="4.5"/>}<circle cx="11" cy="13" r="8.5"/><circle cx="11" cy="13" r="4.5"/><path d="M11 13l7.5-7.5M18.5 5.5V2.5M18.5 5.5h3"/></>)
/** Weekly review */
export const IconWeekReview = make("WeekReview", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M6.5 5h11a3 3 0 0 1 3 3v2h-17V8a3 3 0 0 1 3-3z"/>}<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17M9 15.2l2.1 2.1 4-4.3"/></>)
/** Interview practice */
export const IconMic = make("Mic", (accent) => <>{accent && <rect fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" x="9" y="3" width="6" height="11" rx="3"/>}<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"/></>)
/** Portfolio progress */
export const IconFolder = make("Folder", (accent) => <><path d="M3.5 17.5V6.5A1.5 1.5 0 0 1 5 5h3.6l2 2.5H17A1.5 1.5 0 0 1 18.5 9v1.5"/>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M3.5 18.5l2.4-6.6A1.5 1.5 0 0 1 7.3 11h13a1 1 0 0 1 .95 1.3l-2.1 6.2a1.5 1.5 0 0 1-1.4 1H4.5a1 1 0 0 1-1-1z"/>}<path d="M3.5 18.5l2.4-6.6A1.5 1.5 0 0 1 7.3 11h13a1 1 0 0 1 .95 1.3l-2.1 6.2a1.5 1.5 0 0 1-1.4 1H4.5a1 1 0 0 1-1-1z"/></>)
/** Resources / library */
export const IconLibrary = make("Library", (accent) => <><rect x="3.5" y="4" width="4" height="16" rx="1"/>{accent && <rect fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" x="9" y="7" width="4" height="13" rx="1"/>}<rect x="9" y="7" width="4" height="13" rx="1"/><path d="M14.6 6.1l3.4-.9a1 1 0 0 1 1.2.7l3 12.2a1 1 0 0 1-.7 1.2l-3.4.9a1 1 0 0 1-1.2-.7L13.9 7.3a1 1 0 0 1 .7-1.2z"/><path d="M3.5 8h4M9 10.5h4"/></>)
/** SOP library */
export const IconChecklist = make("Checklist", (accent) => <>{accent && <rect fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" x="10" y="10.5" width="12" height="5" rx="2.5"/>}<path d="M3.5 6.3l1.6 1.6L8.3 4.7M11.5 6.5h9M3.5 12.6l1.6 1.6 3.2-3.2M11.5 13h9M11.5 19.5h9"/><rect x="3.8" y="17.5" width="4" height="4" rx="1.2"/></>)
/** Interview prep */
export const IconChatPair = make("ChatPair", (accent) => <><path d="M14.5 7.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v5.5a2 2 0 0 0 2 2h.5V15l2.8-2.5"/>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M11 9h8a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-.5v2.8L15.3 18H11a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z"/>}<path d="M11 9h8a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-.5v2.8L15.3 18H11a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z"/></>)
/** Keyword bank */
export const IconDictionary = make("Dictionary", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M14.5 3H18v6.5l-1.75-1.3-1.75 1.3z"/>}<path d="M4 18.5V5a2 2 0 0 1 2-2h13.5v15.5H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h13.5"/><path d="M7.5 14.5l2.5-6.5 2.5 6.5M8.4 12.3h3.2"/></>)
/** Inbox zero / inbox */
export const IconInbox = make("Inbox", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M3 13.5h4.6l1.4 2.5h6l1.4-2.5H21V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>}<path d="M3 13.5L5.4 6A2 2 0 0 1 7.3 4.5h9.4a2 2 0 0 1 1.9 1.5l2.4 7.5V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 13.5h4.6l1.4 2.5h6l1.4-2.5H21"/></>)
/** Calendar across time zones */
export const IconCalendarClock = make("CalendarClock", (accent) => <><path d="M20.5 10.5V8a3 3 0 0 0-3-3h-11a3 3 0 0 0-3 3v9.5a3 3 0 0 0 3 3H11M8 3v4M16 3v4M3.5 10H11"/>{accent && <circle fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" cx="17" cy="16.5" r="5"/>}<circle cx="17" cy="16.5" r="5"/><path d="M17 14v2.7l1.6 1"/></>)
/** Client onboarding */
export const IconHandshake = make("Handshake", (accent) => <>{accent && <circle fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" cx="12.2" cy="13" r="4.4"/>}<path d="M3 7.5v8.5M21 7.5v8.5"/><path d="M21 9h-4.8l-4.7 2.2a1.45 1.45 0 0 0 1.1 2.7l2.8-.9 4.2 3.5"/><path d="M3 9h3.8l3.1-1.6a2 2 0 0 1 1.6-.1l2.4.9"/><path d="M5.6 14.6l4.4 4a1.35 1.35 0 0 0 1.9-1.9M11.2 15.9l1.7 1.6a1.35 1.35 0 0 0 1.9-1.9l-1.2-1.2"/></>)
/** Travel itinerary */
export const IconPlane = make("Plane", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M10 13.5l2.6 6.8L21 4z"/>}<path d="M21 4L3 11l7 2.5 2.6 6.8z"/><path d="M10 13.5L16 8.5"/></>)
/** Expense tracker / sheet */
export const IconSheet = make("Sheet", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M6 4h12a2.5 2.5 0 0 1 2.5 2.5v3h-17v-3A2.5 2.5 0 0 1 6 4z"/>}<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M3.5 9.5h17M3.5 14.75h17M9.5 9.5V20"/></>)
/** Social media pack / Canva */
export const IconPalette = make("Palette", (accent) => <>{accent && <circle fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" cx="16.4" cy="10" r="2.4"/>}<path d="M12 3a9 9 0 0 0 0 18c1.3 0 2-.8 2-1.9 0-1.4-1.1-1.7-1.1-2.9 0-1 .8-1.7 1.8-1.7H17a4 4 0 0 0 4-4C21 6.4 17 3 12 3z"/><circle cx="7.5" cy="12" r="1.2"/><circle cx="9" cy="7.7" r="1.2"/><circle cx="13.3" cy="6.6" r="1.2"/></>)
/** Multi-client task board */
export const IconBoard = make("Board", (accent) => <><rect x="3" y="4" width="5" height="15" rx="1.6"/>{accent && <rect fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" x="9.5" y="4" width="5" height="9.5" rx="1.6"/>}<rect x="9.5" y="4" width="5" height="9.5" rx="1.6"/><rect x="16" y="4" width="5" height="12" rx="1.6"/></>)
/** Automation / Zapier */
export const IconBolt = make("Bolt", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M13.5 2.5L4.5 13.5h7l-1 8 9-11h-7z"/>}<path d="M13.5 2.5L4.5 13.5h7l-1 8 9-11h-7z"/></>)
/** Automated onboarding system */
export const IconWorkflow = make("Workflow", (accent) => <><rect x="3" y="3.5" width="7" height="6" rx="2"/><rect x="14" y="14.5" width="7" height="6" rx="2"/>{accent && <circle fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" cx="17.5" cy="6.5" r="3"/>}<circle cx="17.5" cy="6.5" r="3"/><path d="M10 6.5h4.5M6.5 9.5V15a2.5 2.5 0 0 0 2.5 2.5h5M17.5 9.5v5"/></>)
/** Specialist offer / retainer */
export const IconGem = make("Gem", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M6.8 4h5.2l-2.4 5H3.3z"/>}<path d="M6.8 4h10.4l3.5 5L12 20.5 3.3 9z"/><path d="M3.3 9h17.4M9.6 9L12 20.5 14.4 9 12 4z"/></>)
/** Team handbook / people */
export const IconTeam = make("Team", (accent) => <><path d="M14.2 4.9a3 3 0 1 1 1.9 5.6M16.7 13.4A5.5 5.5 0 0 1 21 18.8"/>{accent && <circle fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" cx="9" cy="8.5" r="3.5"/>}<circle cx="9" cy="8.5" r="3.5"/><path d="M3 20.5a6 6 0 0 1 12 0"/></>)
/** Inbox management / email */
export const IconMail = make("Mail", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M4.6 5h14.8L12 11.4z"/>}<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.6 6.4L12 13l8.4-6.6"/></>)
/** Calendar and scheduling */
export const IconCalendarDays = make("CalendarDays", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M6.5 5h11a3 3 0 0 1 3 3v2h-17V8a3 3 0 0 1 3-3z"/>}<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/><path strokeWidth="2.6" d="M8 14h.01M12 14h.01M16 14h.01M8 17.3h.01M12 17.3h.01"/></>)
/** Written communication */
export const IconPen = make("Pen", (accent) => <>{accent && <rect fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" x="11" y="17.5" width="10.5" height="4" rx="2"/>}<path d="M15.6 4.4a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4zM13.5 6.5l3 3M12.5 19.5h7.5"/></>)
/** Docs and spreadsheets */
export const IconSpreadsheet = make("Spreadsheet", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M14 3v5h5z"/>}<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5"/><rect x="8.5" y="12" width="7" height="5.5" rx="1"/><path d="M8.5 14.75h7M12 12v5.5"/></>)
/** Research and travel */
export const IconMap = make("Map", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M8.5 4l7 2.5V20l-7-2.5z"/>}<path d="M3 6.5L8.5 4l7 2.5L21 4v13.5L15.5 20l-7-2.5L3 20zM8.5 4v13.5M15.5 6.5V20"/></>)
/** Customer support */
export const IconHeadset = make("Headset", (accent) => <><path d="M4 14v-2a8 8 0 0 1 16 0v2"/>{accent && <rect fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" x="3" y="13" width="4" height="6" rx="1.6"/>}<rect x="3" y="13" width="4" height="6" rx="1.6"/><rect x="17" y="13" width="4" height="6" rx="1.6"/><path d="M20 19v.3a2.7 2.7 0 0 1-2.7 2.7H14"/></>)
/** Project and task tools */
export const IconBoardSquare = make("BoardSquare", (accent) => <>{accent && <rect fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" x="9.5" y="5.5" width="6" height="10" rx="2"/>}<rect x="3" y="3" width="18" height="18" rx="3.5"/><path d="M7.5 7.5v9M12.5 7.5v6M17 7.5v7.5"/></>)
/** SOPs and process */
export const IconSteps = make("Steps", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M17.5 3h4v3h-2.84z"/>}<path d="M17.5 3v4.5M2.5 20.5h4.5V16h4.5v-4.25H16V7.5h4.5"/></>)
/** Privacy and security */
export const IconShield = make("Shield", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M12 3v18c-4.3-1.2-7.5-4.9-7.5-9.5V6z"/>}<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.3-7.5 9.5-4.3-1.2-7.5-4.9-7.5-9.5V6z"/><path d="M9 12l2.1 2.1 4-4.4"/></>)
/** Gmail Help Center */
export const IconMailOpen = make("MailOpen", (accent) => <><path d="M3 10v8.5A2.5 2.5 0 0 0 5.5 21h13a2.5 2.5 0 0 0 2.5-2.5V10l-9-6.5z"/>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M6.8 12.8V7.5h10.4v5.3L12 16.2z"/>}<path d="M6.8 12.5V7.5h10.4v5"/><path d="M3 10l9 6 9-6"/></>)
/** Google Calendar Help Center */
export const IconCalendar = make("Calendar", (accent) => <><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M11.5 13h5.5v4h-3.91z"/>}</>)
/** Google Workspace Training */
export const IconGradCap = make("GradCap", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M12 4L2.5 9 12 14l9.5-5z"/>}<path d="M12 4L2.5 9 12 14l9.5-5z"/><path d="M6.5 11.2v4.3c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3v-4.3M21.5 9v5"/></>)
/** Google Workspace Learning Center */
export const IconIdea = make("Idea", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M8.7 14.6A6 6 0 1 1 15.3 14.6c-.5.5-.8 1.1-.8 1.9H9.5c0-.8-.3-1.4-.8-1.9z"/>}<path d="M8.7 14.6A6 6 0 1 1 15.3 14.6c-.5.5-.8 1.1-.8 1.9v1H9.5v-1c0-.8-.3-1.4-.8-1.9zM10 21h4"/></>)
/** Outlook training */
export const IconAt = make("At", (accent) => <>{accent && <circle fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" cx="12" cy="12" r="3.75"/>}<circle cx="12" cy="12" r="3.75"/><path d="M15.75 8.5v4.75a2.6 2.6 0 0 0 5.25 0V12a9 9 0 1 0-3.5 7.1"/></>)
/** Microsoft Learn */
export const IconMonitor = make("Monitor", (accent) => <><rect x="3" y="4" width="18" height="12.5" rx="2.5"/>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M6 7h6v4h-4.26z"/>}<path d="M12 16.5V20M8 20.5h8"/></>)
/** Calendly Help Center */
export const IconCalendarPlus = make("CalendarPlus", (accent) => <>{accent && <circle fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" cx="12" cy="15.2" r="3.6"/>}<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17M12 13v4.4M9.8 15.2h4.4"/></>)
/** Zoom Learning Center */
export const IconVideo = make("Video", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M15.5 10.5l5.5-3.2v9.4l-5.5-3.2z"/>}<rect x="2.5" y="6" width="13" height="12" rx="2.75"/><path d="M15.5 10.5l5.5-3.2v9.4l-5.5-3.2"/></>)
/** Slack Help Center */
export const IconChat = make("Chat", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9.5L5 20.5V17a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>}<path d="M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9.5L5 20.5V17a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path strokeWidth="2.6" d="M8 10.5h.01M12 10.5h.01M16 10.5h.01"/></>)
/** Trello Guide */
export const IconGrid = make("Grid", (accent) => <><rect x="3.5" y="3.5" width="7" height="7" rx="2"/>{accent && <rect fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" x="13.5" y="3.5" width="7" height="7" rx="2"/>}<rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/></>)
/** Asana Academy */
export const IconTodo = make("Todo", (accent) => <>{accent && <circle fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" cx="5.5" cy="5.5" r="2.2"/>}<circle cx="5.5" cy="5.5" r="2.2"/><path d="M10.5 5.5h10M10.5 12h10M10.5 18.5h6"/><circle cx="5.5" cy="12" r="2.2"/><circle cx="5.5" cy="18.5" r="2.2"/></>)
/** Notion Academy */
export const IconNotebook = make("Notebook", (accent) => <><rect x="5" y="3" width="14.5" height="18" rx="2.5"/>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M10 7h6v3.4h-4.26z"/>}<path d="M3 7.5h4M3 12h4M3 16.5h4M10 14h6"/></>)
/** Canva Design School */
export const IconBrush = make("Brush", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M11 13.2a3 3 0 0 0-4.2 0c-1.3 1.3-.6 3.8-3.3 5.3 2.6 1.5 6.3 1.4 7.9-.2a3 3 0 0 0-.4-5.1z"/>}<path d="M11 13.2a3 3 0 0 0-4.2 0c-1.3 1.3-.6 3.8-3.3 5.3 2.6 1.5 6.3 1.4 7.9-.2a3 3 0 0 0-.4-5.1zM10.8 13l9.7-9.5M13 15.2l2-2"/></>)
/** Bitwarden Help Center */
export const IconKey = make("Key", (accent) => <>{accent && <circle fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" cx="8" cy="15.5" r="4.5"/>}<circle cx="8" cy="15.5" r="4.5"/><circle cx="8" cy="15.5" r="1" fill="currentColor"/><path d="M11.2 12.3L20 3.5M16.5 7l2.5 2.5M14 9.5l2 2"/></>)
/** Technical Writing One */
export const IconNib = make("Nib", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M12 3L6.5 11l2.4 8h6.2l2.4-8z"/>}<path d="M12 3L6.5 11l2.4 8h6.2l2.4-8zM12 3v7.5M8 21.5h8"/><circle cx="12" cy="12.2" r="1.4" fill="currentColor"/></>)
/** HubSpot Academy certification */
export const IconAward = make("Award", (accent) => <>{accent && <circle fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" cx="12" cy="9" r="5.75"/>}<circle cx="12" cy="9" r="5.75"/><path d="M8.6 13.6L7 21l5-2.6 5 2.6-1.6-7.4M12 6.5l.8 1.6 1.7.3-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.3z"/></>)
/** Google AI Essentials */
export const IconSparkle = make("Sparkle", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M10.5 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5z"/>}<path d="M10.5 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5zM18 14.5c.3 1.5 1 2.2 2.5 2.5-1.5.3-2.2 1-2.5 2.5-.3-1.5-1-2.2-2.5-2.5 1.5-.3 2.2-1 2.5-2.5z"/><path strokeWidth="2.6" d="M5 19.5h.01"/></>)
/** Microsoft Office Specialist */
export const IconMedal = make("Medal", (accent) => <><path d="M6.5 2.5l3.6 7.2M17.5 2.5l-3.6 7.2"/>{accent && <circle fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" cx="12" cy="15" r="5.75"/>}<circle cx="12" cy="15" r="5.75"/><circle cx="12" cy="15" r="2.2"/></>)
/** Microsoft 365 Copilot */
export const IconBot = make("Bot", (accent) => <>{accent && <rect fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" x="6.5" y="11" width="11" height="5.5" rx="2.75"/>}<rect x="4" y="8" width="16" height="11.5" rx="3.5"/><path d="M12 8V5M2.5 12.5v3M21.5 12.5v3M9.5 13v1.5M14.5 13v1.5"/><circle cx="12" cy="3.6" r="1.4"/></>)
/** Google IT Support */
export const IconWrench = make("Wrench", (accent) => <><g transform="rotate(-45 12 12)">{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M21 9.1l-2.6 1.3v3.2l2.6 1.3A4.6 4.6 0 1 1 21 9.1z"/>}<path d="M13.4 10.25H4a1.75 1.75 0 0 0 0 3.5h9.4"/><path d="M21 9.1l-2.6 1.3v3.2l2.6 1.3A4.6 4.6 0 1 1 21 9.1z"/></g></>)
/** Arrow right */
export const IconArrowRight = make("ArrowRight", () => <><path d="M4.5 12h14.5M13.5 6.5L19 12l-5.5 5.5"/></>)
/** Arrow down */
export const IconArrowDown = make("ArrowDown", () => <><path d="M12 4.5V19M6.5 13.5L12 19l5.5-5.5"/></>)
/** Check */
export const IconCheck = make("Check", () => <><path d="M4.5 12.8l4.6 4.5L19.5 6.8"/></>)
/** Chevron down */
export const IconChevronDown = make("ChevronDown", () => <><path d="M6.5 9.5l5.5 5.5 5.5-5.5"/></>)
/** Chevron up */
export const IconChevronUp = make("ChevronUp", () => <><path d="M6.5 14.5L12 9l5.5 5.5"/></>)
/** Clock */
export const IconClock = make("Clock", () => <><circle cx="12" cy="12" r="8.75"/><path d="M12 7.5V12l3 2"/></>)
/** Lock */
export const IconLock = make("Lock", (accent) => <>{accent && <path fill="var(--veerly-icon-accent, #FFD84D)" stroke="none" data-accent="" d="M7.5 10.5h9a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-4.5a3 3 0 0 1 3-3z"/>}<rect x="4.5" y="10.5" width="15" height="10.5" rx="3"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5V17"/></>)
/** Restart */
export const IconRestart = make("Restart", () => <><path d="M4.5 12a7.5 7.5 0 1 0 2.4-5.5L4.5 8.8M4.5 4.5v4.3h4.3"/></>)
/** Loading */
export const IconSpinner = make("Spinner", () => <><circle cx="12" cy="12" r="8.5" opacity=".2"/><path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5"/></>)

export const veerlyIcons = {"path": IconPath, "portfolio": IconPortfolio, "job-ready": IconJobReady, "dashboard": IconDashboard, "target": IconTarget, "week-review": IconWeekReview, "mic": IconMic, "folder": IconFolder, "library": IconLibrary, "checklist": IconChecklist, "chat-pair": IconChatPair, "dictionary": IconDictionary, "inbox": IconInbox, "calendar-clock": IconCalendarClock, "handshake": IconHandshake, "plane": IconPlane, "sheet": IconSheet, "palette": IconPalette, "board": IconBoard, "bolt": IconBolt, "workflow": IconWorkflow, "gem": IconGem, "team": IconTeam, "mail": IconMail, "calendar-days": IconCalendarDays, "pen": IconPen, "spreadsheet": IconSpreadsheet, "map": IconMap, "headset": IconHeadset, "board-square": IconBoardSquare, "steps": IconSteps, "shield": IconShield, "mail-open": IconMailOpen, "calendar": IconCalendar, "grad-cap": IconGradCap, "idea": IconIdea, "at": IconAt, "monitor": IconMonitor, "calendar-plus": IconCalendarPlus, "video": IconVideo, "chat": IconChat, "grid": IconGrid, "todo": IconTodo, "notebook": IconNotebook, "brush": IconBrush, "key": IconKey, "nib": IconNib, "award": IconAward, "sparkle": IconSparkle, "medal": IconMedal, "bot": IconBot, "wrench": IconWrench, "arrow-right": IconArrowRight, "arrow-down": IconArrowDown, "check": IconCheck, "chevron-down": IconChevronDown, "chevron-up": IconChevronUp, "clock": IconClock, "lock": IconLock, "restart": IconRestart, "spinner": IconSpinner} as const
export type VeerlyIconName = keyof typeof veerlyIcons
