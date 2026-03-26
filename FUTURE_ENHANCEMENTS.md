# Future Enhancements

Potential improvements to the Sprint Statistics Tracker.

## ✅ Implemented Features

### 1. Slack Integration - IMPLEMENTED ✅

**Status**: Fully implemented! See [SLACK_SETUP.md](SLACK_SETUP.md) for setup instructions.

The tool now automatically posts formatted sprint statistics to Slack when you add data, including:
- Sprint name and velocity
- Trend indicator vs 5-sprint average
- Issue breakdown by type
- Links to Jira and Google Sheet

**Original proposal**:
1. Add Slack webhook URL to Script Properties
2. Modify `fetchAndInsertSprintData()` to call `postToSlack()` after insertion
3. Format message with sprint stats

**Code outline**:
```javascript
function postToSlack(sprintName, velocity, issueCounts, jiraQuery) {
  const webhookUrl = PropertiesService.getScriptProperties()
    .getProperty('SLACK_WEBHOOK_URL');

  if (!webhookUrl) return; // Skip if not configured

  const message = {
    text: `📊 Sprint Statistics - ${sprintName}`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${sprintName}*\n\nVelocity: *${velocity}* points`
        }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Stories:* ${issueCounts['Story'] || 0}` },
          { type: "mrkdwn", text: `*Bugs:* ${issueCounts['Bug'] || 0}` },
          { type: "mrkdwn", text: `*Tasks:* ${issueCounts['Task'] || 0}` },
          { type: "mrkdwn", text: `*Spikes:* ${issueCounts['Spike'] || 0}` }
        ]
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "View in Jira" },
            url: jiraQuery
          }
        ]
      }
    ]
  };

  UrlFetchApp.fetch(webhookUrl, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(message)
  });
}
```

**Setup**:
1. Create Slack app and incoming webhook
2. Add webhook URL to configuration dialog
3. Enable/disable in settings

**Benefit**: Team visibility, automatic sprint retrospective data sharing

---

### 2. Auto-Detect Current Sprint

**What**: Button to "Add Current Sprint" that auto-detects sprint name

**Implementation**:
1. Query Jira for active sprints in your project
2. Filter for sprints matching your team's naming pattern
3. Find sprint in "Active" state
4. Pre-fill sprint name in dialog

**Code outline**:
```javascript
function getCurrentSprint() {
  const config = getJiraConfig();
  const url = `${config.serverUrl}/rest/agile/1.0/board/YOUR_BOARD_ID/sprint?state=active`;

  // Fetch active sprints
  // Filter by name pattern
  // Return sprint name
}
```

**Challenge**: Need to identify the correct Jira board ID

**Benefit**: Saves typing/copy-paste of sprint name

---

### 3. Bulk Import Historical Data

**What**: Import data for multiple sprints at once

**Implementation**:
1. Dialog with textarea for sprint names (one per line)
2. Loop through and fetch each
3. Progress indicator
4. Summary of successes/failures

**UI**:
```
Enter sprint names (one per line):
┌─────────────────────────────────────┐
│ Team Sprint 1                       │
│ Team Sprint 2                       │
│ Team Sprint 3                       │
│ Team Sprint 4                       │
│ Team Sprint 5                       │
└─────────────────────────────────────┘

[Fetch All Sprints]
```

**Benefit**: Faster setup when starting fresh

---

## Priority 2: Medium Impact, Medium Effort

### 4. Sprint Health Metrics

**What**: Additional calculated metrics about sprint health

**Metrics**:
- **Scope creep**: % of issues added mid-sprint
- **Carryover**: % of issues carried to next sprint
- **Completion rate**: % of sprint commitment completed
- **Bug ratio**: Bugs as % of total issues

**Implementation**:
1. Requires additional Jira queries to get sprint changes
2. Use sprint changelog API to detect additions
3. Add columns to sheet for these metrics

**Challenge**: Sprint changelog API can be slow/complex

**Benefit**: Better sprint retrospective insights

---

### 5. Team Member Breakdown

**What**: Track velocity by individual developer

**Implementation**:
1. Add "Assignee" data to Jira query
2. Create separate "Developer Stats" sheet
3. Calculate points per developer
4. Track individual velocity trends

**Privacy consideration**: May not want to track individual metrics

**Benefit**: Identify training needs, load balancing

---

### 6. Sprint Comparison Tool

**What**: Side-by-side comparison of two sprints

**Implementation**:
1. Add menu item "Compare Sprints"
2. Dialog to select two sprint rows
3. Generate comparison report showing:
   - Velocity difference
   - Issue type changes
   - Team size changes
   - Key issues links

**Benefit**: Useful for understanding why velocity changed

---

## Priority 3: Advanced Features

### 7. Predictive Analytics

**What**: Forecast future sprint velocity

**Implementation**:
1. Use linear regression on historical data
2. Calculate confidence intervals
3. Adjust for known factors (team size changes, holidays)
4. Show forecast in dashboard

**Library**: Could use simple statistics in Apps Script or TensorFlow.js

**Benefit**: Better sprint planning

---

### 8. Integration with Google Calendar

**What**: Auto-run script at end of each sprint

**Implementation**:
1. Team maintains sprint schedule in Google Calendar
2. Time-based trigger runs weekly
3. Checks if sprint ended this week
4. Auto-fetches data if yes

**Challenge**: Needs sprint end dates in accessible format

**Benefit**: Zero manual effort

---

### 9. Custom Field Support

**What**: Track additional Jira custom fields

**Implementation**:
1. Configuration UI to specify custom fields
2. Map field IDs to column names
3. Fetch additional fields in query
4. Add columns dynamically

**Use cases**:
- Track "Priority" distribution
- Track "Component" assignments
- Track custom tags/labels

**Benefit**: More detailed analysis

---

### 10. Export to Confluence

**What**: Auto-generate Confluence page with sprint stats

**Implementation**:
1. Add Confluence API credentials
2. Template for sprint report page
3. Create/update Confluence page when data added
4. Include charts as images

**Benefit**: Integration with team wiki/documentation

---

## Slack Bot (Standalone Alternative)

If you prefer a Slack-first approach instead of Google Sheets:

### Architecture
```
Slack slash command: /sprint-stats "Team Sprint 5"
  ↓
Cloud Function (Google Cloud / AWS Lambda / OpenShift)
  ↓
Fetch from Jira API
  ↓
Calculate velocity & stats
  ↓
Post formatted message to Slack
  ↓
Optionally: Store in Firestore/database for history
```

### Pros vs. Google Sheets
- ✅ Team sees results immediately in Slack
- ✅ No need to open another tool
- ✅ Can trigger from mobile

### Cons vs. Google Sheets
- ❌ No built-in graphing/analysis
- ❌ Requires infrastructure (Cloud Function hosting)
- ❌ Historical data harder to analyze
- ❌ Another platform to maintain

### Best approach: Hybrid
- Google Sheets as primary (data storage, analysis)
- Slack as notification layer (posted automatically from Sheets script)

---

## GitHub Actions Integration

Run sprint-stats.js automatically:

### Workflow
```yaml
name: Sprint Statistics

on:
  workflow_dispatch:
    inputs:
      sprint_name:
        description: 'Sprint name'
        required: true

jobs:
  collect-stats:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: node sprint-stats.js "${{ github.event.inputs.sprint_name }}"
        env:
          JIRA_SERVER_URL: ${{ secrets.JIRA_SERVER_URL }}
          JIRA_EMAIL: ${{ secrets.JIRA_EMAIL }}
          JIRA_ACCESS_TOKEN: ${{ secrets.JIRA_ACCESS_TOKEN }}
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: sprint-stats
          path: sprint-stats.csv
```

**Benefit**:
- Secure credential storage in GitHub Secrets
- Can manually trigger from Actions tab
- Results downloadable as artifact

**Limitation**:
- Still requires manual download and import to Sheets
- Google Sheets Apps Script is more integrated

---

## Recommended Implementation Order

If implementing additional features:

1. **Start with**: Slack notification (easy, high visibility)
2. **Then add**: Auto-detect current sprint (improves UX)
3. **Consider**: Bulk import (only if setting up fresh)
4. **Advanced**: Sprint health metrics (requires more Jira API work)

The core Google Sheets solution is already very powerful. Additional features should be added based on actual team needs, not just because they're possible.

---

## Contributing

If you implement any of these enhancements, consider:
- Adding them to the main `Code.gs` file
- Updating the README with new features
- Submitting a PR to this repository
- Documenting setup for others

The goal is to keep the solution simple and maintainable while solving real problems.
