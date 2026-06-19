const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

async function graphFetch(accessToken: string, path: string) {
  const res = await fetch(`${GRAPH_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Graph API error: ${res.status}`);
  return res.json();
}

export async function getOutlookMessages(accessToken: string, top = 20) {
  const data = await graphFetch(
    accessToken,
    `/me/messages?$top=${top}&$select=id,subject,from,receivedDateTime,isRead,importance,bodyPreview&$orderby=receivedDateTime desc`
  );
  return data.value as OutlookMessage[];
}

export async function getCalendarEvents(accessToken: string, from: string, to: string) {
  const data = await graphFetch(
    accessToken,
    `/me/calendarView?startDateTime=${from}&endDateTime=${to}&$select=id,subject,start,end,location,isAllDay,importance&$orderby=start/dateTime`
  );
  return data.value as CalendarEvent[];
}

export async function getMe(accessToken: string) {
  return graphFetch(accessToken, "/me?$select=displayName,mail,userPrincipalName");
}

export interface OutlookMessage {
  id: string;
  subject: string;
  from: { emailAddress: { name: string; address: string } };
  receivedDateTime: string;
  isRead: boolean;
  importance: "low" | "normal" | "high";
  bodyPreview: string;
}

export interface CalendarEvent {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: { displayName: string };
  isAllDay: boolean;
  importance: "low" | "normal" | "high";
}
