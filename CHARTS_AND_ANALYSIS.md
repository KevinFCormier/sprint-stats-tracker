# Charts and Analysis Guide

Once you have sprint data in your sheet, here are recommended charts and analyses to create.

## Recommended Charts

### 1. Velocity Trend Line Chart

**Purpose**: Track velocity over time to see team performance trends

**How to create**:
1. Select columns B and G (Sprint Name and Velocity)
2. Include the last 10-20 sprints
3. Go to **Insert > Chart**
4. Chart type: **Line chart**
5. Customize:
   - Title: "Sprint Velocity Trend"
   - Vertical axis: "Story Points"
   - Horizontal axis: "Sprint"
   - Check "Use row 1 as headers"

**Add 5-Sprint Average line**:
1. In the chart editor, click **Setup**
2. Click **Add series**
3. Select column Q (5-Sprint Avg)
4. This creates a combo chart showing actual velocity and rolling average

### 2. Issue Type Distribution (Stacked Bar)

**Purpose**: See how issue types are distributed across sprints

**How to create**:
1. Select columns B, I, J, K, L, M, N (Sprint Name through Spike)
2. Include the last 5-10 sprints
3. Go to **Insert > Chart**
4. Chart type: **Stacked column chart**
5. Customize:
   - Title: "Issue Distribution by Sprint"
   - Legend: Right side
   - Colors: Use distinct colors for each issue type (Story, Bug, Vulnerability, Weakness, Task, Spike)

### 3. Velocity vs Team Size (Scatter)

**Purpose**: Analyze correlation between team size and velocity

**How to create**:
1. Select columns F and G (Developers and Velocity)
2. Go to **Insert > Chart**
3. Chart type: **Scatter chart**
4. Add trendline:
   - Series → Trendline → Linear
   - Label: "R² = [value]"

### 4. Velocity per Developer Trend

**Purpose**: Track productivity normalized by team size

**How to create**:
1. Select columns B and H (Sprint Name and Velocity per Dev)
2. Go to **Insert > Chart**
3. Chart type: **Line chart**
4. This shows velocity per developer over time (already calculated for you!)

## Useful Formulas and Analyses

### Summary Statistics Section

Create a "Summary" section at the top right of your sheet:

```
| Metric                    | Value                    |
|---------------------------|--------------------------|
| Total Sprints Tracked     | =COUNTA(B2:B)-1          |
| Average Velocity          | =AVERAGE(G2:G)           |
| Median Velocity           | =MEDIAN(G2:G)            |
| Std Deviation             | =STDEV(G2:G)             |
| Min Velocity              | =MIN(G2:G)               |
| Max Velocity              | =MAX(G2:G)               |
| Avg Points per Dev        | =AVERAGE(H2:H)           |
| Avg Working Days          | =AVERAGE(E2:E)           |
```

### Sprint-over-Sprint Change

Add a "% Change" column (you can add this after the existing columns):

**Formula in row 3** (row 3, since row 2 has no previous sprint):
```
=(G3-G2)/G2*100
```

Format as percentage with 1 decimal place. This shows velocity change from previous sprint.

### Story vs Bug Ratio

Add a "Story/Bug Ratio" column:

**Formula**:
```
=IF(J2=0, "No Bugs", I2/J2)
```

This shows the ratio of stories to bugs. A higher number means more feature work vs bug fixes.

### Sprint Predictability Score

Add a "Predictability" column that compares actual velocity to 5-sprint average:

**Formula**:
```
=IF(Q2="", "", ABS(G2-Q2)/Q2*100)
```

Lower percentage = more predictable sprint. Format as percentage.

### Conditional Formatting

Highlight exceptional sprints:

1. Select velocity column (G2:G100)
2. Format > Conditional formatting
3. Format cells if: "Custom formula is"
4. Formula: `=G2>AVERAGE($G$2:$G)*1.2`
5. Color: Light green (high velocity)

Repeat for low velocity:
4. Formula: `=G2<AVERAGE($G$2:$G)*0.8`
5. Color: Light red (low velocity)

## Advanced Analysis

### Moving Average (Smoothed Trend)

Add a "3-Sprint Moving Avg" column:

**Formula** (starts at row 4, needs 3 sprints):
```
=AVERAGE(G2:G4)
```

Then in row 5:
```
=AVERAGE(G3:G5)
```

Copy down. This creates a smoother trend line than the 5-sprint average.

### Velocity Forecast

Add a "Forecasted Velocity" column using linear regression:

**Formula**:
```
=FORECAST(ROW(), $G$2:$G, ROW($G$2:$G))
```

This projects future velocity based on historical trend.

### Team Capacity Utilization

If you track planned capacity separately, add:

**Formula**:
```
=(G2 / (F2 * E2 / 5 * 10)) * 100
```

Assumes 10 points per dev per week capacity. Uses working days from column E. Adjust multiplier as needed.

### Issue Type Pivot Table

Create a pivot table to analyze issue types across all sprints:

1. Select all data (A1:N100)
2. Insert > Pivot table
3. Rows: Issue Types (drag Story, Bug, Task, etc. into rows)
4. Values: Count (or Sum of count columns)
5. This shows total counts across all sprints

## Dashboard Layout Example

Create a separate "Dashboard" sheet with:

**Top Section**: Summary metrics (using formulas from 'Sprint Data'!E2:E)
```
┌─────────────────────────────────────────────┐
│  Sprint Statistics Dashboard                │
│                                             │
│  Last 5 Sprints Avg: 27.4 points           │
│  Last Sprint: Team Sprint 5 (28)            │
│  Trend: ↑ +2.3%                            │
└─────────────────────────────────────────────┘
```

**Middle Section**: Charts
- Velocity trend line (left)
- Issue type distribution (right)

**Bottom Section**: Recent sprints table
- Last 5 sprints only
- Sorted by date descending

### Dashboard Formulas

**Last 5 Sprints Average**:
```
=AVERAGE('Sprint Data'!E2:E6)
```

**Last Sprint Name**:
```
='Sprint Data'!A2
```

**Last Sprint Velocity**:
```
='Sprint Data'!E2
```

**Trend** (compare last sprint to 5-sprint avg):
```
=('Sprint Data'!E2 - AVERAGE('Sprint Data'!E2:E6)) / AVERAGE('Sprint Data'!E2:E6) * 100
```

**Trend Indicator** (up/down arrow):
```
=IF(E2>M2, "↑", IF(E2<M2, "↓", "→"))
```

## Data Validation

Add data validation to maintain data quality:

### Working Days
1. Select column E (Working Days)
2. Data > Data validation
3. Criteria: Number between 5 and 15
4. Show warning: "Working days should be 5-15 for a typical sprint"

### Developer Count
1. Select column F (Developers)
2. Data > Data validation
3. Criteria: Number between 1 and 20
4. Show warning: "Developer count should be 1-20"

## Sharing Insights

### Weekly Report Template

Copy this into Slack or email after each sprint:

```
📊 Sprint Statistics - [Sprint Name]

Velocity: [X] points (5-sprint avg: [Y])
Trend: [↑/↓] [+/- %] vs average

Issue Breakdown:
  Stories: [X]
  Bugs: [X]
  Tasks: [X]

📈 View full data: [Google Sheet link]
🔍 View in Jira: [Jira query link from sheet]
```

### Monthly Review

Every month, create a summary:
1. Filter to last 4 sprints (roughly 1 month)
2. Calculate average velocity for the month
3. Compare to previous month
4. Note any trends (improving, stable, declining)
5. Identify outliers and discuss why

## Tips

- **Keep it simple**: Start with 2-3 key charts, add more as needed
- **Update regularly**: Add new sprint data right after sprint ends
- **Review trends**: Look at the 5-sprint average more than individual sprints
- **Celebrate wins**: Use the data to recognize high-performing sprints
- **Investigate dips**: Low velocity sprints deserve a retrospective look

## Example Analysis Questions

Use your data to answer:

1. **Velocity stability**: Is our velocity predictable (low std deviation)?
2. **Team scaling**: How does velocity change when we add/remove developers?
3. **Issue mix**: Are we doing more features or bugs lately?
4. **Sprint length impact**: Do 2-week vs 3-week sprints affect velocity?
5. **Seasonal patterns**: Any quarterly trends (end-of-quarter push, holiday slowdowns)?
6. **Capacity**: Are we under/over-utilizing team capacity?

These insights help with sprint planning and team process improvements.
