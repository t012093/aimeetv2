from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from datetime import datetime, timedelta
from typing import Optional, Dict


class GoogleCalendarService:
    """Google Calendar service"""

    @staticmethod
    def get_calendar_service(access_token: str, refresh_token: str):
        """Get Google Calendar service"""
        from app.core.config import settings

        credentials = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
        )

        service = build("calendar", "v3", credentials=credentials)
        return service

    @staticmethod
    async def create_shift_event(
        user_access_token: str,
        user_refresh_token: str,
        title: str,
        description: str,
        start_datetime: datetime,
        end_datetime: datetime,
        attendees: list = None,
    ) -> Optional[Dict]:
        """Create a shift event in Google Calendar"""
        try:
            service = GoogleCalendarService.get_calendar_service(
                user_access_token, user_refresh_token
            )

            event = {
                "summary": title,
                "description": description,
                "start": {
                    "dateTime": start_datetime.isoformat(),
                    "timeZone": "Asia/Tokyo",
                },
                "end": {
                    "dateTime": end_datetime.isoformat(),
                    "timeZone": "Asia/Tokyo",
                },
            }

            if attendees:
                event["attendees"] = [{"email": email} for email in attendees]

            created_event = service.events().insert(calendarId="primary", body=event).execute()

            return {
                "event_id": created_event["id"],
                "html_link": created_event.get("htmlLink"),
            }
        except Exception as e:
            print(f"Error creating calendar event: {e}")
            return None

    @staticmethod
    async def create_meeting_event(
        user_access_token: str,
        user_refresh_token: str,
        title: str,
        description: str,
        start_datetime: datetime,
        end_datetime: datetime,
        attendees: list = None,
        create_meet_link: bool = True,
    ) -> Optional[Dict]:
        """Create a meeting event with Google Meet link"""
        try:
            service = GoogleCalendarService.get_calendar_service(
                user_access_token, user_refresh_token
            )

            event = {
                "summary": title,
                "description": description,
                "start": {
                    "dateTime": start_datetime.isoformat(),
                    "timeZone": "Asia/Tokyo",
                },
                "end": {
                    "dateTime": end_datetime.isoformat(),
                    "timeZone": "Asia/Tokyo",
                },
            }

            if attendees:
                event["attendees"] = [{"email": email} for email in attendees]

            if create_meet_link:
                event["conferenceData"] = {
                    "createRequest": {
                        "requestId": f"meet-{datetime.now().timestamp()}",
                        "conferenceSolutionKey": {"type": "hangoutsMeet"},
                    }
                }

            created_event = (
                service.events()
                .insert(
                    calendarId="primary",
                    body=event,
                    conferenceDataVersion=1 if create_meet_link else 0,
                )
                .execute()
            )

            meet_link = None
            if create_meet_link and "conferenceData" in created_event:
                meet_link = created_event["conferenceData"].get("entryPoints", [{}])[
                    0
                ].get("uri")

            return {
                "event_id": created_event["id"],
                "html_link": created_event.get("htmlLink"),
                "meet_link": meet_link,
            }
        except Exception as e:
            print(f"Error creating meeting event: {e}")
            return None

    @staticmethod
    async def update_event(
        user_access_token: str,
        user_refresh_token: str,
        event_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        start_datetime: Optional[datetime] = None,
        end_datetime: Optional[datetime] = None,
    ) -> bool:
        """Update a calendar event"""
        try:
            service = GoogleCalendarService.get_calendar_service(
                user_access_token, user_refresh_token
            )

            # Get existing event
            event = service.events().get(calendarId="primary", eventId=event_id).execute()

            # Update fields
            if title:
                event["summary"] = title
            if description:
                event["description"] = description
            if start_datetime:
                event["start"] = {
                    "dateTime": start_datetime.isoformat(),
                    "timeZone": "Asia/Tokyo",
                }
            if end_datetime:
                event["end"] = {
                    "dateTime": end_datetime.isoformat(),
                    "timeZone": "Asia/Tokyo",
                }

            service.events().update(calendarId="primary", eventId=event_id, body=event).execute()

            return True
        except Exception as e:
            print(f"Error updating calendar event: {e}")
            return False

    @staticmethod
    async def delete_event(
        user_access_token: str, user_refresh_token: str, event_id: str
    ) -> bool:
        """Delete a calendar event"""
        try:
            service = GoogleCalendarService.get_calendar_service(
                user_access_token, user_refresh_token
            )

            service.events().delete(calendarId="primary", eventId=event_id).execute()

            return True
        except Exception as e:
            print(f"Error deleting calendar event: {e}")
            return False
