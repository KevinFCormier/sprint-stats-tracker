# Changelog

## v1.0.2 — Slack Sprint Report Link

- Slack notification "View in Jira" button now links to the Sprint Report page instead of a JQL issues query, matching the spreadsheet behavior

## v1.0.1 — Documentation Fixes

- Removed org-specific references (emails, Jira URLs, project keys, sprint names) for public release
- Genericized custom field comments in Code.gs
- Made `testJiraConnection()` use configured email instead of hardcoded project key
- Fixed "Comparison to Previous Workflow" to include sprint close steps in new process
- Corrected time-saved estimate (~10 min → ~2 min)
- Added complete file listing to README
- Added `.gitignore` and `LICENSE` file
- Added API scope troubleshooting details to README

## v1.0.0 — Initial Release

### Features

- **Sprint Report API integration**: Fetches historical sprint data from Jira's Sprint Report API, capturing issue state at sprint close time rather than current state
- **Custom velocity calculation**: Counts Story/Bug items in Review + Closed/Done states; all other types require Closed/Done only
- **Automatic sprint metadata**: Start/end dates and working days (excludes weekends) fetched directly from Jira
- **Velocity per developer**: Auto-calculated from velocity and developer count
- **Issue type breakdown**: Tracks Story, Bug, Vulnerability, Weakness, Task, Spike, and Other
- **5-sprint rolling average**: Auto-calculated from the previous 5 sprints
- **Sprint Report links**: Direct links to Jira's Sprint Retrospective page
- **Slack notifications**: Optional webhook integration to post sprint stats to a Slack channel
- **Secure credential storage**: Jira tokens stored in Google Apps Script encrypted properties

### Known Limitations

- **API token scopes**: The greenhopper API does not support Jira Cloud's granular scope system. API tokens must be created with full access (no scope restrictions). See the README troubleshooting section for details.
- **Working days**: Excludes weekends but does not account for holidays (Jira doesn't provide this data).
