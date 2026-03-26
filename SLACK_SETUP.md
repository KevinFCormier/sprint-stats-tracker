# Slack Integration Setup Guide

Add automatic Slack notifications when sprint data is added to your Google Sheet.

## What You Get

When you add sprint statistics, a formatted message is automatically posted to your Slack channel with:
- 📊 Sprint name and velocity
- 📈 Trend indicator (up/down vs 5-sprint average)
- Issue breakdown (Stories, Bugs, Tasks, etc.)
- 🔍 Button to view in Jira
- 📊 Button to view the Google Sheet

## Setup (5 minutes)

### Step 1: Create a Slack App

1. Go to https://api.slack.com/apps
2. Click **Create New App**
3. Choose **From scratch**
4. App Name: `Sprint Statistics Bot`
5. Pick your workspace
6. Click **Create App**

### Step 2: Enable Incoming Webhooks

1. In the left sidebar, click **Incoming Webhooks**
2. Toggle **Activate Incoming Webhooks** to **On**
3. Scroll down and click **Add New Webhook to Workspace**
4. Select the channel where you want notifications (e.g., `#team-sprints`)
5. Click **Allow**
6. **Copy the Webhook URL** (starts with `https://hooks.slack.com/services/...`)

### Step 3: Add Webhook to Google Sheets

1. In your Google Sheet, click **Sprint Stats > Configure Credentials**
2. Paste the webhook URL into the **Slack Webhook URL** field
3. Click **Save Configuration**

### Step 4: Test It!

1. Click **Sprint Stats > Add Sprint Data**
2. Enter a sprint name and fetch data
3. Check your Slack channel - you should see a formatted message!

## Example Slack Message

```
📊 My Team Sprint 5

Velocity:              Total Issues:
28 points              12

📈 +7.5% vs 5-sprint avg (26.0)

Issue Breakdown:
Stories: 3 • Bugs: 5 • Tasks: 2 • Spikes: 1

[🔍 View in Jira] [📊 View Data Sheet]
```

## Customization

### Change the Channel

To change which channel receives notifications:

1. Go to https://api.slack.com/apps
2. Select your Sprint Statistics Bot app
3. Click **Incoming Webhooks** in the sidebar
4. Click **Add New Webhook to Workspace**
5. Select the new channel
6. Copy the new webhook URL
7. Update in Google Sheets: **Sprint Stats > Configure Credentials**

### Disable Notifications

To temporarily disable Slack notifications:

1. Click **Sprint Stats > Configure Credentials**
2. Clear the **Slack Webhook URL** field
3. Click **Save Configuration**

To re-enable later, just paste the webhook URL back in.

### Multiple Channels

If you want to post to multiple channels:

**Option 1: Create multiple webhooks**
- The current implementation only supports one webhook
- You'd need to modify the code to support multiple

**Option 2: Use a forwarding channel**
- Create a private channel for the bot
- Have team members "follow" that channel to their preferred channels
- Slack will automatically cross-post messages

## Security

### Webhook URL Security

The webhook URL is:
- ✅ Stored in encrypted Script Properties
- ✅ Only accessible to users with script edit permissions
- ✅ Not visible in the spreadsheet
- ✅ Rate-limited by Slack (prevents abuse)

**Important**: Anyone with the webhook URL can post to your channel. Keep it secure:
- Don't commit it to Git
- Don't share it publicly
- Don't paste it in public Slack channels
- Treat it like a password

### Regenerating Webhook

If the webhook URL is compromised:

1. Go to https://api.slack.com/apps
2. Select your app
3. Click **Incoming Webhooks**
4. Find the compromised webhook and click **Remove**
5. Click **Add New Webhook to Workspace**
6. Update the URL in Google Sheets configuration

## Troubleshooting

### "Slack post failed" in logs

**Check the webhook URL**:
1. Make sure it starts with `https://hooks.slack.com/services/`
2. Verify there are no extra spaces or characters
3. Test the webhook directly:
   ```bash
   curl -X POST -H 'Content-type: application/json' \
     --data '{"text":"Test message"}' \
     YOUR_WEBHOOK_URL
   ```

**Check app permissions**:
1. Go to https://api.slack.com/apps
2. Verify the app is installed to your workspace
3. Check that incoming webhooks are enabled

### Messages not appearing in channel

**Check the channel**:
- The webhook posts to the channel you selected during setup
- If you want a different channel, create a new webhook

**Check app installation**:
- Go to your Slack workspace
- Type `/apps` and search for "Sprint Statistics Bot"
- If not found, reinstall from https://api.slack.com/apps

### "Invalid webhook URL" error

- The URL must be exactly as provided by Slack
- Don't modify or shorten it
- If it's not working, regenerate a new webhook

### Messages posting but formatting is broken

This shouldn't happen with the current implementation, but if it does:
- Check the Apps Script logs: Apps Script editor > View > Logs
- The script uses Slack Block Kit for formatting
- Errors will be logged but won't stop the sheet update

## Advanced: Customizing the Message

To customize the Slack message format, edit the `postToSlack()` function in Code.gs:

### Add more fields
```javascript
message.blocks.push({
  type: 'section',
  fields: [
    {
      type: 'mrkdwn',
      text: `*Sprint Length:*\n${sprintLength} weeks`
    },
    {
      type: 'mrkdwn',
      text: `*Team Size:*\n${devCount} developers`
    }
  ]
});
```

### Change colors/styles
```javascript
// Make the Jira button green
url: jiraQuery,
style: 'primary'  // Options: primary (green), danger (red), or omit for default
```

### Add mentions
```javascript
text: {
  type: 'mrkdwn',
  text: `<!channel> Sprint stats are in for ${sprintName}!`
}
```

### Conditional notifications
Only post if velocity is below average:
```javascript
function postToSlack(sprintName, velocity, issueCounts, jiraQuery, fiveSprintAvg) {
  // Only post if velocity is concerning
  if (fiveSprintAvg && velocity < fiveSprintAvg * 0.9) {
    // ... existing code
  }
}
```

## Slack Block Kit

The messages use [Slack Block Kit](https://api.slack.com/block-kit) for rich formatting.

**Useful tools**:
- [Block Kit Builder](https://app.slack.com/block-kit-builder) - Visual editor for designing messages
- [Block Kit documentation](https://api.slack.com/block-kit)

You can prototype your message layout in the Block Kit Builder, then copy the JSON into the `postToSlack()` function.

## Rate Limits

Slack webhook rate limits:
- **1 message per second** per webhook
- No overall limit on total messages

Since you're only posting once per sprint (every 2 weeks), you're nowhere near the limit.

## Privacy Considerations

**Data posted to Slack**:
- Sprint name
- Velocity (points)
- Issue counts by type
- Link to Jira (requires Jira login to view)
- Link to Google Sheet (requires sheet access to view)

**Not posted**:
- Individual issue details
- Assignee names
- Issue descriptions
- Sensitive data

If your sprint names or issue counts are sensitive, consider disabling Slack notifications or using a private channel.

## Alternative: Slack App with Slash Commands

For a more advanced setup, you could create a Slack app with slash commands:

```
/sprint-stats "Team Sprint 5"
```

This would require:
1. Creating a Slack app with slash command
2. Hosting a web endpoint (Cloud Function, OpenShift, etc.)
3. Connecting to Jira from the endpoint
4. Posting results back to Slack

The current webhook approach is simpler and sufficient for most use cases.

## FAQ

**Q: Can I post to multiple channels?**
A: Not with a single webhook. Create multiple webhooks (one per channel) and modify the code to loop through them.

**Q: Can I customize who gets notified?**
A: Yes, use `@username` or `<!channel>` in the message text.

**Q: Can I schedule automated posts?**
A: The current setup only posts when you manually add sprint data. For scheduling, you'd need time-based triggers in Apps Script.

**Q: What if Slack is down?**
A: The script logs an error but continues. Your Google Sheet data is still saved.

**Q: Can I use this with Microsoft Teams instead?**
A: Yes, Teams has incoming webhooks too. You'd need to modify the message format (Teams uses different JSON structure).

**Q: Will this work with Slack's free plan?**
A: Yes! Incoming webhooks work on all Slack plans, including free.

## Next Steps

Once you have Slack working:
1. ✅ Test with a real sprint
2. ✅ Share the Slack channel with your team
3. ✅ Customize the message format if desired
4. ✅ Consider adding it to your sprint retrospective workflow

Enjoy your automated sprint notifications! 🎉
