# Quick Start Guide - Sprint Stats Tracker

Get your sprint statistics tracker up and running in 5 minutes.

## Prerequisites

- A Google account
- Access to a Jira Cloud instance
- Your Atlassian account email

## 5-Minute Setup

### 1. Create Jira API Token (2 minutes)

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click **Create API token**
3. Label: "Sprint Stats Tracker"
4. **Important**: Do NOT limit scopes - create with full access (the greenhopper API used for Sprint Reports doesn't support granular scopes)
5. Click **Create**
6. **Copy the token** and save it temporarily (you'll need it in step 3)

### 2. Set Up Google Sheet (1 minute)

1. Create a new Google Sheet: https://sheets.new
2. Name it "Sprint Statistics"
3. Go to **Extensions > Apps Script**
4. Delete the default code
5. Copy and paste the entire `Code.gs` file from this folder
6. Click **💾 Save**
7. Click **▶ Run** dropdown → select `onOpen`
8. Click **Review permissions** → choose your account → **Advanced** → **Go to Sprint Stats Tracker** → **Allow**

### 3. Configure Credentials (1 minute)

1. Close Apps Script tab, go back to your sheet
2. **Reload the page** (you should see "Sprint Stats" menu appear)
3. Click **Sprint Stats > Configure Credentials**
4. Fill in:
   - Jira Server URL: `https://your-org.atlassian.net`
   - Jira Email: Your Atlassian account email
   - Jira API Token: [paste token from step 1]
   - Default Dev Count: `5`
5. Click **Save Configuration**

**Note**: Sprint dates and length are automatically fetched from Jira - no need to enter manually!

### 4. Add Your First Sprint (1 minute)

1. Click **Sprint Stats > Add Sprint Data**
2. Enter your sprint name exactly as it appears in Jira
3. Adjust dev count if needed (defaults to your configured value)
4. Click **Fetch Sprint Data**
5. Wait a few seconds...
6. ✅ Data appears in your sheet!

## What You Get

Your sheet now has:
- Sprint name and fetch date
- **Sprint start/end dates and working days** (from Jira)
- **Velocity** (with your custom Review state logic, based on sprint-close state)
- **Velocity per developer** (auto-calculated)
- Breakdown by issue type (Story, Bug, Vulnerability, Weakness, Task, Spike, Other)
- Total issues
- 5-sprint running average (auto-calculated from previous sprints)
- Link to view the Sprint Report in Jira

## Next Steps

1. **Add historical data**: Run the tool for your last 4-5 sprints to build history
2. **Create charts**: Select data columns and Insert > Chart for visualizations
3. **Share with team**: File > Share and give view/edit access as needed
4. **Set up Slack** (optional): See [SLACK_SETUP.md](SLACK_SETUP.md) for auto-notifications

## Tips

- **Exact sprint names**: Use copy-paste from Jira to avoid typos
- **When to run**: Run after the sprint is closed in Jira (uses historical sprint-close state)
- **Quick access**: Bookmark your Google Sheet for easy access
- **Review the link**: Click "View Sprint Report" to see the full report and access the retrospective in Jira

## Troubleshooting

**Can't see "Sprint Stats" menu?**
→ Reload the page

**"Jira credentials not configured" error?**
→ Make sure you clicked "Save Configuration" in step 3

**"No issues found for sprint"?**
→ Check sprint name spelling (case-sensitive)

**Need help?**
→ See the full README.md for detailed troubleshooting

---

That's it! You now have an automated sprint statistics tracker. 🎉
