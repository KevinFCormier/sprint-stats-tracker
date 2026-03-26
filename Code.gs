/**
 * Sprint Statistics Tracker for Google Sheets
 *
 * This Apps Script fetches sprint statistics from Jira and automatically
 * populates a Google Sheet with velocity metrics, issue breakdowns, and
 * running averages.
 *
 * Setup Instructions:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Replace Code.gs with this file
 * 4. Set up Script Properties (see README.md)
 * 5. Reload the sheet and use "Sprint Stats > Add Sprint Data" menu
 */

// ============================================================================
// Configuration
// ============================================================================

/**
 * Get Jira configuration from Script Properties
 */
function getJiraConfig() {
  const scriptProperties = PropertiesService.getScriptProperties();

  return {
    serverUrl: scriptProperties.getProperty('JIRA_SERVER_URL'),
    email: scriptProperties.getProperty('JIRA_EMAIL'),
    apiToken: scriptProperties.getProperty('JIRA_ACCESS_TOKEN'),
    slackWebhook: scriptProperties.getProperty('SLACK_WEBHOOK_URL'),
    defaultDevCount: scriptProperties.getProperty('DEFAULT_DEV_COUNT') || '5'
  };
}

// ============================================================================
// Menu Functions
// ============================================================================

/**
 * Creates custom menu when spreadsheet opens
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Sprint Stats')
    .addItem('Add Sprint Data', 'showSprintDialog')
    .addSeparator()
    .addItem('Configure Credentials', 'showConfigDialog')
    .addToUi();
}

/**
 * Shows dialog to enter sprint name
 */
function showSprintDialog() {
  const config = getJiraConfig();

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input { width: 100%; padding: 8px; margin-bottom: 15px; box-sizing: border-box; }
      button { background-color: #4CAF50; color: white; padding: 10px 20px;
               border: none; cursor: pointer; width: 100%; }
      button:hover { background-color: #45a049; }
      .error { color: red; margin-top: 10px; }
      .loading { color: #666; margin-top: 10px; }
    </style>
    <div>
      <label for="sprintName">Sprint Name:</label>
      <input type="text" id="sprintName" placeholder="Team Sprint 1" autofocus>

      <label for="devCount">Number of Developers:</label>
      <input type="number" id="devCount" value="${config.defaultDevCount}" min="1" max="20">

      <button onclick="fetchData()">Fetch Sprint Data</button>
      <div id="message"></div>
    </div>

    <script>
      // Auto-focus on input
      document.getElementById('sprintName').focus();

      // Allow Enter key to submit
      document.getElementById('sprintName').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') fetchData();
      });

      function fetchData() {
        const sprintName = document.getElementById('sprintName').value.trim();
        const devCount = document.getElementById('devCount').value;

        if (!sprintName) {
          document.getElementById('message').innerHTML =
            '<div class="error">Please enter a sprint name</div>';
          return;
        }

        document.getElementById('message').innerHTML =
          '<div class="loading">Fetching data from Jira...</div>';

        google.script.run
          .withSuccessHandler(onSuccess)
          .withFailureHandler(onFailure)
          .fetchAndInsertSprintData(sprintName, devCount);
      }

      function onSuccess(result) {
        document.getElementById('message').innerHTML =
          '<div style="color: green; margin-top: 10px;">✓ Sprint data added successfully!</div>';
        setTimeout(() => google.script.host.close(), 1500);
      }

      function onFailure(error) {
        document.getElementById('message').innerHTML =
          '<div class="error">Error: ' + error.message + '</div>';
      }
    </script>
  `)
    .setWidth(400)
    .setHeight(250);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add Sprint Statistics');
}

/**
 * Shows dialog to configure credentials
 */
function showConfigDialog() {
  const config = getJiraConfig();

  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      label { display: block; margin-bottom: 5px; font-weight: bold; }
      input { width: 100%; padding: 8px; margin-bottom: 15px; box-sizing: border-box; }
      button { background-color: #4CAF50; color: white; padding: 10px 20px;
               border: none; cursor: pointer; width: 100%; }
      button:hover { background-color: #45a049; }
      .info { background-color: #e7f3fe; border-left: 4px solid #2196F3;
              padding: 10px; margin-bottom: 15px; }
    </style>
    <div>
      <div class="info">
        <strong>Note:</strong> These credentials are stored securely in Script Properties.
      </div>

      <label for="serverUrl">Jira Server URL:</label>
      <input type="text" id="serverUrl" placeholder="https://your-org.atlassian.net"
             value="${config.serverUrl || ''}">

      <label for="email">Jira Email:</label>
      <input type="email" id="email" placeholder="your-email@company.com"
             value="${config.email || ''}">

      <label for="apiToken">Jira API Token:</label>
      <input type="password" id="apiToken" placeholder="Your API token">

      <label for="slackWebhook">Slack Webhook URL (optional):</label>
      <input type="text" id="slackWebhook" placeholder="https://hooks.slack.com/services/..."
             value="${config.slackWebhook || ''}">

      <label for="defaultDevCount">Default Dev Count:</label>
      <input type="number" id="defaultDevCount" value="${config.defaultDevCount}" min="1" max="20">

      <button onclick="saveConfig()">Save Configuration</button>
      <div id="message"></div>
    </div>

    <script>
      function saveConfig() {
        const serverUrl = document.getElementById('serverUrl').value.trim();
        const email = document.getElementById('email').value.trim();
        const apiToken = document.getElementById('apiToken').value.trim();
        const slackWebhook = document.getElementById('slackWebhook').value.trim();
        const defaultDevCount = document.getElementById('defaultDevCount').value;

        if (!serverUrl || !email) {
          document.getElementById('message').innerHTML =
            '<div style="color: red; margin-top: 10px;">Please fill in all required fields</div>';
          return;
        }

        google.script.run
          .withSuccessHandler(onSuccess)
          .withFailureHandler(onFailure)
          .saveJiraConfig(serverUrl, email, apiToken, slackWebhook, defaultDevCount);
      }

      function onSuccess() {
        document.getElementById('message').innerHTML =
          '<div style="color: green; margin-top: 10px;">✓ Configuration saved!</div>';
        setTimeout(() => google.script.host.close(), 1500);
      }

      function onFailure(error) {
        document.getElementById('message').innerHTML =
          '<div style="color: red; margin-top: 10px;">Error: ' + error.message + '</div>';
      }
    </script>
  `)
    .setWidth(500)
    .setHeight(550);

  SpreadsheetApp.getUi().showModalDialog(html, 'Configure Jira Credentials');
}

/**
 * Saves Jira configuration to Script Properties
 */
function saveJiraConfig(serverUrl, email, apiToken, slackWebhook, defaultDevCount) {
  const scriptProperties = PropertiesService.getScriptProperties();

  scriptProperties.setProperty('JIRA_SERVER_URL', serverUrl);
  scriptProperties.setProperty('JIRA_EMAIL', email);
  scriptProperties.setProperty('DEFAULT_DEV_COUNT', defaultDevCount);

  // Only update API token if provided (allows updating other settings without re-entering token)
  if (apiToken) {
    scriptProperties.setProperty('JIRA_ACCESS_TOKEN', apiToken);
  }

  // Save Slack webhook (can be empty to disable notifications)
  if (slackWebhook) {
    scriptProperties.setProperty('SLACK_WEBHOOK_URL', slackWebhook);
  } else {
    scriptProperties.deleteProperty('SLACK_WEBHOOK_URL');
  }
}

// ============================================================================
// Jira API Functions
// ============================================================================

/**
 * Extract sprint details from issues
 * Issues contain sprint information in the customfield_10020 field (sprint field)
 */
function getSprintDetailsFromIssues(issues) {
  if (!issues || issues.length === 0) {
    return null;
  }

  // Get the sprint field from the first issue
  const firstIssue = issues[0];
  const sprintField = firstIssue.fields.customfield_10020;

  if (!sprintField || sprintField.length === 0) {
    Logger.log('Warning: No sprint field found in issues');
    return null;
  }

  // The sprint field is an array of sprint objects
  const sprint = sprintField[0];

  if (!sprint) {
    Logger.log('Warning: Sprint field is empty');
    return null;
  }

  // Extract sprint details
  try {
    const startDate = sprint.startDate ? new Date(sprint.startDate) : null;
    const endDate = sprint.endDate ? new Date(sprint.endDate) : null;
    const workingDays = startDate && endDate ? calculateWorkingDays(startDate, endDate) : null;
    const sprintId = sprint.id;
    const boardId = sprint.boardId;

    Logger.log(`Sprint details: ${sprint.name}, ID: ${sprintId}, Board: ${boardId}, ${startDate} to ${endDate}, ${workingDays} working days`);

    return {
      startDate: startDate,
      endDate: endDate,
      workingDays: workingDays,
      sprintId: sprintId,
      boardId: boardId
    };
  } catch (error) {
    Logger.log(`Warning: Error parsing sprint details: ${error.message}`);
    return null;
  }
}

/**
 * Calculate working days between two dates (excludes weekends)
 * This is a simple calculation - doesn't account for holidays
 * Uses < instead of <= to handle end dates set to midnight of the day after sprint ends
 */
function calculateWorkingDays(startDate, endDate) {
  let count = 0;
  const current = new Date(startDate);

  // Use < instead of <= because Jira typically sets end date to midnight of the day AFTER the sprint ends
  while (current < endDate) {
    const dayOfWeek = current.getDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Fetch sprint report data from Jira Agile API
 * This gives us the historical state of issues at sprint close
 */
function getSprintReport(sprintId, boardId) {
  const config = getJiraConfig();

  if (!config.serverUrl || !config.email || !config.apiToken) {
    throw new Error('Jira credentials not configured. Use Sprint Stats > Configure Credentials');
  }

  const url = `${config.serverUrl}/rest/greenhopper/1.0/rapid/charts/sprintreport?rapidViewId=${boardId}&sprintId=${sprintId}`;

  const auth = Utilities.base64Encode(`${config.email}:${config.apiToken}`);

  const options = {
    method: 'get',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json'
    },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const statusCode = response.getResponseCode();

  if (statusCode !== 200) {
    throw new Error(`Sprint Report API error (${statusCode}): ${response.getContentText()}`);
  }

  const data = JSON.parse(response.getContentText());
  return data;
}

/**
 * Fetch issues from Jira using JQL
 */
function searchJiraIssues(jql, maxResults = 500) {
  const config = getJiraConfig();

  if (!config.serverUrl || !config.email || !config.apiToken) {
    throw new Error('Jira credentials not configured. Use Sprint Stats > Configure Credentials');
  }

  const url = `${config.serverUrl}/rest/api/3/search/jql?` +
    `jql=${encodeURIComponent(jql)}&` +
    `maxResults=${maxResults}&` +
    `fields=key,summary,status,resolution,issuetype,customfield_10028,customfield_12310243,customfield_10020`;

  const auth = Utilities.base64Encode(`${config.email}:${config.apiToken}`);

  const options = {
    method: 'get',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json'
    },
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const statusCode = response.getResponseCode();

  if (statusCode !== 200) {
    throw new Error(`Jira API error (${statusCode}): ${response.getContentText()}`);
  }

  const data = JSON.parse(response.getContentText());
  return data.issues || [];
}

/**
 * Find the story points field name in an issue
 */
function findStoryPointsField(issue) {
  const possibleFields = [
    'customfield_10028',     // Common Jira Cloud story points field
    'customfield_12310243',  // Alternative story points field (some Jira instances)
  ];

  for (const fieldName of possibleFields) {
    if (issue.fields[fieldName] !== undefined && issue.fields[fieldName] !== null) {
      return fieldName;
    }
  }

  return null;
}

/**
 * Calculate velocity based on custom rules:
 * - Story and Bug in Review state count toward velocity
 * - All other issue types only count if Closed/Done
 */
function calculateVelocity(issues, enableDebug = false) {
  let velocity = 0;
  let storyPointsFieldName = null;
  const debugInfo = {
    closedPoints: 0,
    reviewStoryBugPoints: 0,
    reviewTaskPoints: 0,
    skipped: []
  };

  // Find the story points field from the first issue that has one
  for (const issue of issues) {
    storyPointsFieldName = findStoryPointsField(issue);
    if (storyPointsFieldName) {
      break;
    }
  }

  if (!storyPointsFieldName) {
    Logger.log('Warning: Could not find story points field in issues');
    return 0;
  }

  for (const issue of issues) {
    const status = issue.fields.status?.name;
    const resolution = issue.fields.resolution?.name;
    const issueType = issue.fields.issuetype?.name;
    const storyPoints = issue.fields[storyPointsFieldName];

    if (!storyPoints) continue;

    // Check if issue is completed (Closed status OR Done resolution)
    const isComplete = status === 'Closed' || status === 'Done' || resolution === 'Done';
    const isReview = status === 'Review';

    // For Story and Bug: count if Closed/Done OR in Review
    if (issueType === 'Story' || issueType === 'Bug') {
      if (isComplete) {
        velocity += storyPoints;
        if (enableDebug) {
          debugInfo.closedPoints += storyPoints;
          Logger.log(`✓ Closed ${issueType}: ${issue.key} (${storyPoints} pts) - Status: ${status}, Resolution: ${resolution}`);
        }
      } else if (isReview) {
        velocity += storyPoints;
        if (enableDebug) {
          debugInfo.reviewStoryBugPoints += storyPoints;
          Logger.log(`✓ Review ${issueType}: ${issue.key} (${storyPoints} pts) - Status: ${status}`);
        }
      } else if (enableDebug) {
        debugInfo.skipped.push(`${issue.key} (${issueType}, ${storyPoints} pts): ${status}`);
      }
    } else {
      // For all other types: only count if Closed/Done
      if (isComplete) {
        velocity += storyPoints;
        if (enableDebug) {
          debugInfo.closedPoints += storyPoints;
          Logger.log(`✓ Closed ${issueType}: ${issue.key} (${storyPoints} pts) - Status: ${status}, Resolution: ${resolution}`);
        }
      } else if (isReview && enableDebug) {
        debugInfo.reviewTaskPoints += storyPoints;
        Logger.log(`✗ Skipped ${issueType} in Review: ${issue.key} (${storyPoints} pts) - Status: ${status}`);
      } else if (enableDebug) {
        debugInfo.skipped.push(`${issue.key} (${issueType}, ${storyPoints} pts): ${status}`);
      }
    }
  }

  if (enableDebug) {
    Logger.log('\n=== VELOCITY CALCULATION SUMMARY ===');
    Logger.log(`Closed items: ${debugInfo.closedPoints} points`);
    Logger.log(`Story/Bug in Review: ${debugInfo.reviewStoryBugPoints} points`);
    Logger.log(`Task in Review (excluded): ${debugInfo.reviewTaskPoints} points`);
    Logger.log(`Total Velocity: ${velocity} points`);
    if (debugInfo.skipped.length > 0) {
      Logger.log(`\nSkipped items (not closed/review):`);
      debugInfo.skipped.forEach(item => Logger.log(`  - ${item}`));
    }
  }

  return velocity;
}

/**
 * Calculate velocity from sprint report data
 */
function calculateVelocityFromReport(reportIssues, enableDebug = false) {
  let velocity = 0;
  const debugInfo = {
    closedPoints: 0,
    reviewStoryBugPoints: 0,
    reviewTaskPoints: 0,
    skipped: []
  };

  for (const issue of reportIssues) {
    const status = issue.currentStatus || issue.status?.name;
    const issueType = issue.typeName || issue.type?.name;
    const storyPoints = issue.currentEstimateStatistic?.statFieldValue?.value ||
                        issue.estimateStatistic?.statFieldValue?.value;

    if (!storyPoints || storyPoints === 0) continue;

    // Check if issue is completed (based on sprint report categorization + status)
    const isComplete = status === 'Closed' || status === 'Done';
    const isReview = status === 'Review';

    // For Story and Bug: count if Closed/Done OR in Review
    if (issueType === 'Story' || issueType === 'Bug') {
      if (isComplete) {
        velocity += storyPoints;
        if (enableDebug) {
          debugInfo.closedPoints += storyPoints;
          Logger.log(`✓ Closed ${issueType}: ${issue.key} (${storyPoints} pts) - Status: ${status}`);
        }
      } else if (isReview) {
        velocity += storyPoints;
        if (enableDebug) {
          debugInfo.reviewStoryBugPoints += storyPoints;
          Logger.log(`✓ Review ${issueType}: ${issue.key} (${storyPoints} pts) - Status: ${status}`);
        }
      } else if (enableDebug) {
        debugInfo.skipped.push(`${issue.key} (${issueType}, ${storyPoints} pts): ${status}`);
      }
    } else {
      // For all other types: only count if Closed/Done
      if (isComplete) {
        velocity += storyPoints;
        if (enableDebug) {
          debugInfo.closedPoints += storyPoints;
          Logger.log(`✓ Closed ${issueType}: ${issue.key} (${storyPoints} pts) - Status: ${status}`);
        }
      } else if (isReview && enableDebug) {
        debugInfo.reviewTaskPoints += storyPoints;
        Logger.log(`✗ Skipped ${issueType} in Review: ${issue.key} (${storyPoints} pts) - Status: ${status}`);
      } else if (enableDebug) {
        debugInfo.skipped.push(`${issue.key} (${issueType}, ${storyPoints} pts): ${status}`);
      }
    }
  }

  if (enableDebug) {
    Logger.log('\n=== VELOCITY CALCULATION SUMMARY ===');
    Logger.log(`Closed items: ${debugInfo.closedPoints} points`);
    Logger.log(`Story/Bug in Review: ${debugInfo.reviewStoryBugPoints} points`);
    Logger.log(`Task in Review (excluded): ${debugInfo.reviewTaskPoints} points`);
    Logger.log(`Total Velocity: ${velocity} points`);
    if (debugInfo.skipped.length > 0) {
      Logger.log(`\nSkipped items (not closed/review):`);
      debugInfo.skipped.forEach(item => Logger.log(`  - ${item}`));
    }
  }

  return velocity;
}

/**
 * Count issues by type from sprint report data
 */
function countIssueTypesFromReport(reportIssues) {
  const counts = {};

  for (const issue of reportIssues) {
    const issueType = issue.typeName || issue.type?.name || 'Unknown';
    counts[issueType] = (counts[issueType] || 0) + 1;
  }

  return counts;
}

/**
 * Count issues by type
 */
function countIssueTypes(issues) {
  const counts = {};

  for (const issue of issues) {
    const issueType = issue.fields.issuetype?.name || 'Unknown';
    counts[issueType] = (counts[issueType] || 0) + 1;
  }

  return counts;
}

// ============================================================================
// Spreadsheet Functions
// ============================================================================

/**
 * Get or create the Sprint Data sheet
 */
function getOrCreateDataSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Sprint Data');

  if (!sheet) {
    sheet = ss.insertSheet('Sprint Data');

    // Set up headers
    const headers = [
      'Sprint Name',
      'Fetch Date',
      'Start Date',
      'End Date',
      'Working Days',
      'Developers',
      'Velocity',
      'Velocity per Dev',
      'Story',
      'Bug',
      'Vulnerability',
      'Weakness',
      'Task',
      'Spike',
      'Other',
      'Total Issues',
      '5-Sprint Avg',
      'Sprint Report'
    ];

    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);

    // Set column widths
    sheet.setColumnWidth(1, 250); // Sprint Name
    sheet.setColumnWidth(2, 100); // Fetch Date
    sheet.setColumnWidth(3, 100); // Start Date
    sheet.setColumnWidth(4, 100); // End Date
    sheet.setColumnWidth(5, 100); // Working Days
    sheet.setColumnWidth(18, 400); // Sprint Report
  }

  return sheet;
}

/**
 * Insert sprint data into the spreadsheet
 */
function insertSprintData(sprintName, sprintDetails, devCount, velocity, issueCounts, sprintReportUrl) {
  const sheet = getOrCreateDataSheet();
  const fetchDate = new Date();

  // Calculate total issues
  const totalIssues = Object.values(issueCounts).reduce((sum, count) => sum + count, 0);

  // Prepare row data with Sprint Name first, Fetch Date second
  const rowData = [
    sprintName,                     // Sprint Name
    fetchDate,                      // Fetch Date
    sprintDetails?.startDate || '', // Start Date
    sprintDetails?.endDate || '',   // End Date
    sprintDetails?.workingDays || '', // Working Days
    devCount,                       // Developers
    velocity,                       // Velocity
    '', // Velocity per Dev (will add formula)
    issueCounts['Story'] || 0,
    issueCounts['Bug'] || 0,
    issueCounts['Vulnerability'] || 0,
    issueCounts['Weakness'] || 0,
    issueCounts['Task'] || 0,
    issueCounts['Spike'] || 0,
    0, // Other (will calculate via formula)
    totalIssues,
    '', // 5-Sprint Avg (will add formula)
    sprintReportUrl
  ];

  // Insert row at position 2 (after header)
  sheet.insertRowAfter(1);
  const newRow = 2;
  sheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);

  // Remove bold formatting from data row (only header should be bold)
  sheet.getRange(newRow, 1, 1, rowData.length).setFontWeight('normal');

  // Add formula for "Velocity per Dev" column (col 8)
  const velocityPerDevFormula = `=G${newRow}/F${newRow}`;
  sheet.getRange(newRow, 8).setFormula(velocityPerDevFormula);

  // Add formula for "Other" column (col 15)
  const otherFormula = `=P${newRow}-SUM(I${newRow}:N${newRow})`;
  sheet.getRange(newRow, 15).setFormula(otherFormula);

  // Add formula for 5-Sprint Average (col 17)
  // This looks at the NEXT 5 rows (previous sprints) since we insert newest at top
  // Use INDIRECT to dynamically reference the range
  const avgFormula = `=IFERROR(AVERAGE(INDIRECT("G"&(ROW()+1)&":G"&(ROW()+5))),"")`;
  sheet.getRange(newRow, 17).setFormula(avgFormula);

  // Format the date columns
  sheet.getRange(newRow, 2).setNumberFormat('yyyy-MM-dd'); // Fetch Date
  if (sprintDetails?.startDate) {
    sheet.getRange(newRow, 3).setNumberFormat('yyyy-MM-dd'); // Start Date
  }
  if (sprintDetails?.endDate) {
    sheet.getRange(newRow, 4).setNumberFormat('yyyy-MM-dd'); // End Date
  }

  // Format velocity per dev with 1 decimal place
  sheet.getRange(newRow, 8).setNumberFormat('0.0');

  // Add hyperlink to Sprint Report
  sheet.getRange(newRow, 18).setFormula(
    `=HYPERLINK("${sprintReportUrl}", "View Sprint Report")`
  );

  return newRow;
}

// ============================================================================
// Slack Integration
// ============================================================================

/**
 * Post sprint statistics to Slack
 */
function postToSlack(sprintName, velocity, issueCounts, jiraQuery, fiveSprintAvg) {
  const config = getJiraConfig();
  const webhookUrl = config.slackWebhook;

  // Skip if Slack webhook not configured
  if (!webhookUrl) {
    Logger.log('Slack webhook not configured, skipping notification');
    return;
  }

  try {
    // Calculate percentage change from 5-sprint average
    let trendText = '';
    if (fiveSprintAvg && fiveSprintAvg > 0) {
      const percentChange = ((velocity - fiveSprintAvg) / fiveSprintAvg * 100).toFixed(1);
      const arrow = percentChange > 0 ? '📈' : percentChange < 0 ? '📉' : '➡️';
      const sign = percentChange > 0 ? '+' : '';
      trendText = `${arrow} ${sign}${percentChange}% vs 5-sprint avg (${fiveSprintAvg.toFixed(1)})`;
    }

    // Build issue breakdown text
    const issueBreakdown = [];
    if (issueCounts['Story']) issueBreakdown.push(`Stories: ${issueCounts['Story']}`);
    if (issueCounts['Bug']) issueBreakdown.push(`Bugs: ${issueCounts['Bug']}`);
    if (issueCounts['Task']) issueBreakdown.push(`Tasks: ${issueCounts['Task']}`);
    if (issueCounts['Spike']) issueBreakdown.push(`Spikes: ${issueCounts['Spike']}`);
    if (issueCounts['Epic']) issueBreakdown.push(`Epics: ${issueCounts['Epic']}`);

    const message = {
      text: `📊 Sprint Statistics - ${sprintName}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `📊 ${sprintName}`,
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Velocity:*\n${velocity} points`
            },
            {
              type: 'mrkdwn',
              text: `*Total Issues:*\n${Object.values(issueCounts).reduce((sum, count) => sum + count, 0)}`
            }
          ]
        }
      ]
    };

    // Add trend if available
    if (trendText) {
      message.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: trendText
        }
      });
    }

    // Add issue breakdown
    if (issueBreakdown.length > 0) {
      message.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Issue Breakdown:*\n${issueBreakdown.join(' • ')}`
        }
      });
    }

    // Add actions (link to Jira and Google Sheet)
    const sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
    message.blocks.push({
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🔍 View in Jira',
            emoji: true
          },
          url: jiraQuery,
          style: 'primary'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📊 View Data Sheet',
            emoji: true
          },
          url: sheetUrl
        }
      ]
    });

    // Send to Slack
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(message),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(webhookUrl, options);

    if (response.getResponseCode() === 200) {
      Logger.log('Successfully posted to Slack');
    } else {
      Logger.log(`Slack post failed: ${response.getContentText()}`);
    }

  } catch (error) {
    // Don't fail the whole operation if Slack fails
    Logger.log(`Error posting to Slack: ${error.message}`);
  }
}

// ============================================================================
// Main Function
// ============================================================================

/**
 * Fetch sprint data from Jira and insert into spreadsheet
 */
function fetchAndInsertSprintData(sprintName, devCount) {
  try {
    Logger.log(`Fetching data for sprint: ${sprintName}`);

    // First, get sprint details to find sprint ID
    const jql = `sprint = "${sprintName}"`;
    const issues = searchJiraIssues(jql, 1); // Just get one issue to extract sprint details

    if (issues.length === 0) {
      throw new Error(`No issues found for sprint "${sprintName}"`);
    }

    // Extract sprint details (including sprint ID)
    const sprintDetails = getSprintDetailsFromIssues(issues);
    if (!sprintDetails || !sprintDetails.sprintId) {
      throw new Error('Could not determine sprint ID. Cannot fetch sprint report.');
    }

    Logger.log(`Sprint ID: ${sprintDetails.sprintId}, Board: ${sprintDetails.boardId}`);
    Logger.log(`Sprint dates: ${sprintDetails.startDate} to ${sprintDetails.endDate} (${sprintDetails.workingDays} working days)`);

    // Fetch the sprint report (historical state at sprint close)
    const sprintReport = getSprintReport(sprintDetails.sprintId, sprintDetails.boardId);

    // Combine all issues from sprint report
    const completedIssues = sprintReport.contents.completedIssues || [];
    const incompletedIssues = sprintReport.contents.issuesNotCompletedInCurrentSprint || [];
    const allReportIssues = [...completedIssues, ...incompletedIssues];

    Logger.log(`Found ${allReportIssues.length} issues in sprint report (${completedIssues.length} completed, ${incompletedIssues.length} incomplete)`);

    // Calculate velocity and issue counts (enable debug logging)
    const velocity = calculateVelocityFromReport(allReportIssues, true);
    const issueCounts = countIssueTypesFromReport(allReportIssues);

    // Build Sprint Report URL
    const config = getJiraConfig();
    let sprintReportUrl;

    if (sprintDetails?.sprintId && sprintDetails?.boardId) {
      // Link to the sprint report page
      sprintReportUrl = `${config.serverUrl}/secure/RapidBoard.jspa?rapidView=${sprintDetails.boardId}&view=reporting&chart=sprintRetrospective&sprint=${sprintDetails.sprintId}`;
    } else {
      // Fallback to issues search if we don't have sprint/board ID
      sprintReportUrl = `${config.serverUrl}/issues/?jql=${encodeURIComponent(jql)}`;
    }

    // Also build simple Jira query URL for Slack
    const jiraQuery = `${config.serverUrl}/issues/?jql=${encodeURIComponent(jql)}`;

    // Insert data into spreadsheet
    insertSprintData(
      sprintName,
      sprintDetails,
      parseInt(devCount),
      velocity,
      issueCounts,
      sprintReportUrl
    );

    Logger.log('Sprint data inserted successfully');

    // Calculate 5-sprint average for Slack notification
    const sheet = getOrCreateDataSheet();
    const velocityRange = sheet.getRange('G2:G6'); // Top 5 sprints (including the one just added) - column G is velocity
    const velocityValues = velocityRange.getValues().flat().filter(v => v !== '');
    const fiveSprintAvg = velocityValues.length > 0
      ? velocityValues.reduce((sum, v) => sum + v, 0) / velocityValues.length
      : null;

    // Post to Slack (if configured)
    postToSlack(sprintName, velocity, issueCounts, jiraQuery, fiveSprintAvg);

    return {
      success: true,
      message: `Added data for ${sprintName}: ${velocity} points, ${allReportIssues.length} issues`
    };

  } catch (error) {
    Logger.log('Error: ' + error.message);
    throw error;
  }
}

// ============================================================================
// Utility Functions for Testing
// ============================================================================

/**
 * Test function to verify Jira connection
 */
function testJiraConnection() {
  try {
    const config = getJiraConfig();
    const issues = searchJiraIssues(`assignee = "${config.email}" ORDER BY created DESC`, 1);
    Logger.log(`Successfully connected to Jira. Found ${issues.length} issue(s).`);
    return true;
  } catch (error) {
    Logger.log('Jira connection test failed: ' + error.message);
    return false;
  }
}
