# Sprint Statistics Tracker - Google Sheets Apps Script

Automatically fetch and track sprint statistics from Jira directly in Google Sheets, with custom velocity calculation that counts Story/Bug items in Review state.

**⚠️ Disclaimer**: This repository was generated using Claude code and has not been thoroughly reviewed. Use at your own risk.

## Features

- **One-click data collection**: Enter sprint name and data appears in your sheet
- **Historical accuracy**: Uses Sprint Report API to capture state at sprint close (not current state)
- **Custom velocity logic**: Counts Story/Bug in Review state + all closed items
- **Auto-fetched sprint dates**: Start/end dates and working days from Jira
- **Automatic calculations**: Running 5-sprint average, velocity per dev, issue breakdowns
- **Built-in graphing**: Create charts that auto-update with new data
- **Slack notifications**: Auto-post sprint stats to your team channel (optional)
- **Secure credentials**: Jira tokens stored in encrypted Script Properties
- **Direct Sprint Report links**: Click to view full sprint retrospective in Jira

## Setup Instructions

### Step 1: Create Your Google Sheet

1. Create a new Google Sheet (or open an existing one)
2. The script will automatically create a "Sprint Data" sheet when you first use it

### Step 2: Add the Apps Script Code

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete the default `function myFunction() {}` code
3. Copy the entire contents of `Code.gs` from this folder
4. Paste it into the Apps Script editor
5. Click **Save** (disk icon) and name your project "Sprint Stats Tracker"
6. Click **Run** (play icon) and select `onOpen` function
7. You'll be asked to authorize the script - click **Review permissions**
8. Choose your Google account
9. Click **Advanced** → **Go to Sprint Stats Tracker (unsafe)**
   - This warning appears because it's your own script, not a published add-on
10. Click **Allow**

### Step 3: Configure Jira Credentials

1. Close the Apps Script tab and go back to your Google Sheet
2. Reload the page - you should now see a **"Sprint Stats"** menu
3. Click **Sprint Stats > Configure Credentials**
4. Fill in:
   - **Jira Server URL**: Your Jira Cloud URL (e.g., `https://your-org.atlassian.net`)
   - **Jira Email**: Your Atlassian account email
   - **Jira API Token**: Generate from [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
   - **Slack Webhook URL** (optional): See [SLACK_SETUP.md](SLACK_SETUP.md) for instructions
   - **Default Dev Count**: `5` (adjust to your team size)
5. Click **Save Configuration**

**⚠️ Important - API Token Scopes**: When creating your Jira API token, **do not limit scopes**. The script uses Jira's greenhopper API (which powers the Sprint Report in Jira's UI) and this legacy API does not properly support granular scope restrictions. Create a token with full access. The script only performs read operations and credentials are stored securely in encrypted Script Properties.

**Note**: Sprint length is no longer manually entered - it's automatically calculated from the sprint's start and end dates in Jira.

**Security Note**: These credentials are stored in Script Properties, which are:
- Encrypted at rest by Google
- Only accessible to users with edit permissions on the script
- Never visible in the spreadsheet itself
- Separate from the sheet (if you share the sheet view-only, credentials are not shared)

### Step 4: Use the Tool

1. Click **Sprint Stats > Add Sprint Data**
2. Enter the sprint name exactly as it appears in Jira
3. Adjust developer count if needed (defaults to your configured value)
4. Click **Fetch Sprint Data**
5. Data will be added to the "Sprint Data" sheet!

### Step 5: Set Up Slack Notifications (Optional)

For automatic Slack notifications when sprint data is added:

1. Follow the [Slack Setup Guide](SLACK_SETUP.md)
2. Takes 5 minutes to set up
3. Completely optional - works fine without Slack

### Step 6: Add Charts (Optional)

Once you have a few sprints of data, create charts:

#### Velocity Trend Chart
1. Select columns B (Sprint Name) and G (Velocity)
2. Insert > Chart
3. Chart type: Line chart
4. Customize as needed

#### Issue Type Breakdown (Pie Chart)
1. For a specific sprint row, select columns I-N (Story, Bug, Vulnerability, Weakness, Task, Spike)
2. Insert > Chart
3. Chart type: Pie chart

#### Running Average Chart
1. Select columns B, G, and Q (Sprint Name, Velocity, 5-Sprint Avg)
2. Insert > Chart
3. Chart type: Combo chart (Velocity as columns, Average as line)

#### Velocity per Developer Trend
1. Select columns B and H (Sprint Name, Velocity per Dev)
2. Insert > Chart
3. Chart type: Line chart

## How It Works

### Historical State from Sprint Report

**Important**: The script uses Jira's **Sprint Report API** to fetch the state of issues **as they were when the sprint closed**. This means:
- Issues that were moved out of the sprint after close are still counted
- Status/resolution reflects the sprint-end snapshot, not current state
- Matches exactly what you see in Jira's Sprint Report page

This is different from querying current issue state, which can change after sprint closure.

### Velocity Calculation Logic

The script implements custom velocity rules on the historical sprint data:

**For Story and Bug types:**
- Counts story points if status is "Closed" OR "Done" OR "Review"

**For all other types (Task, Spike, Vulnerability, Weakness, etc.):**
- Counts story points ONLY if status is "Closed" OR "Done"
- Does NOT count Review state

This reflects a workflow where Review means code is delivered but testing/verification is pending.

### Data Collected

For each sprint, the script records:
- Sprint name
- **Sprint start/end dates** (from Jira)
- **Working days** (calculated, excludes weekends but not holidays)
- Date data was fetched
- Number of developers
- **Velocity** (calculated using custom logic on historical data)
- **Velocity per developer** (auto-calculated)
- Issue counts by type (Story, Bug, Vulnerability, Weakness, Task, Spike, Other)
- Total issues
- **5-sprint running average** (auto-calculated from previous 5 sprints)
- Link to Sprint Report in Jira

### Sheet Structure

```
| Sprint Name | Fetch Date | Start Date | End Date | Working Days | Devs | Velocity | Velocity/Dev | Story | Bug | Vuln | Weak | Task | Spike | Other | Total | 5-Sprint Avg | Sprint Report |
|-------------|------------|------------|----------|--------------|------|----------|--------------|-------|-----|------|------|------|-------|-------|-------|--------------|---------------|
| My Team Sprint 5 | 2026-03-25 | 2026-02-25 | 2026-03-12 | 11 | 5 | 68 | 13.6 | 3 | 12 | 0 | 0 | 3 | 1 | 2 | 21 | 65.2 | [View Sprint Report] |
```

## Sharing the Sheet

You can safely share the Google Sheet with team members:

**View-only sharing:**
- Safe to share with anyone
- They can see data but not run the script
- Credentials remain secure

**Edit access:**
- Team members can add new sprint data
- They'll use the shared credentials (or can configure their own)
- Only give to trusted team members

**Script editing:**
- Keep this restricted to 1-2 trusted people
- Script editors can see Script Properties (credentials)

## Advanced Usage

### Manual Formula Adjustments

The 5-sprint average formula looks at the previous 5 sprints:
```
=IFERROR(AVERAGE(INDIRECT("G"&(ROW()+1)&":G"&(ROW()+5))),"")
```

This dynamically references the 5 rows below (previous sprints, since newest is at top).

The velocity per dev formula:
```
=G2/F2
```

This divides velocity by number of developers.

### Filtering Sprints

Use Google Sheets filtering to analyze specific time periods or sprint lengths.

### Exporting Data

File > Download > CSV to export for other analysis tools.

### Running Automatically

You can set up time-based triggers to run the script automatically:

1. Go to Extensions > Apps Script
2. Click Triggers (clock icon)
3. Add Trigger
4. Choose `fetchAndInsertSprintData`
5. Configure timing (e.g., weekly)
6. You'll need to modify the function to hard-code the sprint name

However, this is not recommended since sprint names vary. Manual execution is better.

## Troubleshooting

### "Jira credentials not configured" error
- Run Sprint Stats > Configure Credentials and fill in all fields
- Make sure you clicked "Save Configuration"

### "No issues found for sprint" error
- Check the sprint name exactly matches Jira (case-sensitive)
- Verify the sprint exists in Jira
- Try searching in Jira first: `sprint = "Your Sprint Name"`

### "Jira API error (401)" - Authentication failed
- Your API token may be incorrect or expired
- Generate a new token at https://id.atlassian.com/manage-profile/security/api-tokens
- Update via Sprint Stats > Configure Credentials

### "Jira API error (403)" - Permission denied
- Make sure you have access to view the sprint in Jira
- Check that your email matches your Atlassian account
- **If using a limited scope token**: The greenhopper API (`/rest/greenhopper/1.0/rapid/charts/sprintreport`) does not support Jira Cloud's granular scope system. Create a new token with full access (no scope restrictions). The following scope combinations have been tested and **do not work**:
  - Classic read scopes only: `read:jira-work`, `read:board-scope:jira-software`, `read:sprint:jira-software` → 403 error
  - Adding granular write scopes → Still 403 error

### Script runs but velocity is 0
- Check if issues have story points assigned
- Run with Apps Script Logger (View > Logs) to see warnings
- The script looks for `customfield_10028` or `customfield_12310243` — you may need to adjust these for your Jira instance

### 5-Sprint Average shows wrong value
- This is normal for the first few sprints
- The formula averages all available sprints until you have 5+
- After 5 sprints, it shows a rolling 5-sprint average

## Security Best Practices

1. **Use a read-only API token**: When creating your Jira API token, limit its permissions if possible
2. **Restrict script edit access**: Only give Apps Script edit permissions to 1-2 people
3. **Don't commit credentials**: Never put credentials in the script itself (always use Script Properties)
4. **Regularly rotate tokens**: Update your Jira API token every 6-12 months
5. **Audit access**: Periodically review who has edit access to the sheet and script

## Comparison to Previous Workflow

**Old Process:**
1. Move unfinished items to next sprint
2. Close sprint in Jira
3. View sprint report
4. Manually count completed + Review items
5. Manually type into Google Doc
6. Calculate running average by hand

**New Process:**
1. Move unfinished items to next sprint
2. Close sprint in Jira
3. Click "Sprint Stats > Add Sprint Data"
4. Type sprint name
5. Click "Fetch"
6. Done!

**Time saved**: ~10 minutes per sprint → ~2 minutes

## Files

- `Code.gs` - The Apps Script code (paste into Apps Script editor)
- `README.md` - This file (setup instructions and documentation)
- `QUICKSTART.md` - 5-minute setup guide
- `SLACK_SETUP.md` - Slack notification setup guide
- `CHARTS_AND_ANALYSIS.md` - Guide for creating charts and analyses
- `SOLUTION_COMPARISON.md` - Comparison of different tracking approaches
- `FUTURE_ENHANCEMENTS.md` - Ideas for future improvements
- `CHANGELOG.md` - Release history
- `LICENSE` - Apache License 2.0

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. View execution logs: Apps Script editor > View > Logs
3. File an issue on this repository

## License

Apache License 2.0 — see [LICENSE](LICENSE) for details.
