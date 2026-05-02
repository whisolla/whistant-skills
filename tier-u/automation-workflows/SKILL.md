---
name: automation-workflows
description: Design and implement automation workflows to save time and scale operations as a solopreneur. Use when identifying repetitive tasks to automate, building workflows across tools, setting up triggers and actions, or optimizing existing automations. Covers automation opportunity identification, workflow design, tool selection, testing, and maintenance.
version: 1.0
---

# Automation Workflows

> **Whistant Runtime:** Pure prompt guidance. No code execution required — this skill provides expert knowledge for designing automation workflows. The AI uses this playbook to guide the user through automation strategy, tool selection, and workflow design.

## Overview

As a solopreneur, your time is your most valuable asset. Automation lets you scale without hiring. The goal is simple: automate anything you do more than twice a week that doesn't require creative thinking. This playbook shows you how to identify automation opportunities, design workflows, and implement them.

---

## Step 1: Identify What to Automate

Not every task should be automated. Start by finding the highest-value opportunities.

**Automation audit:**

1. Track every task you do for a week
2. For each task, note how long it takes and how often you do it
3. Calculate time cost per task:
   `Time Cost = (Minutes per task × Frequency per month) / 60`
   Example: 15 min task done 20x/month = 5 hours/month
4. Sort by time cost (highest to lowest)

**Good candidates for automation:**
- Repetitive (same steps every time)
- Rule-based (no complex judgment calls)
- High-frequency (daily or weekly)
- Time-consuming (takes 10+ minutes)

**Examples:**
- ✅ Sending weekly reports to clients (same format, same schedule)
- ✅ Creating invoices after payment
- ✅ Adding new leads to CRM from form submissions
- ✅ Posting social media content on a schedule
- ❌ Conducting customer discovery interviews (requires nuance)
- ❌ Writing custom proposals for clients (requires creativity)

**Low-hanging fruit checklist:**
- Email notifications for form submissions
- Auto-save form responses to spreadsheet
- Schedule social posts in advance
- Auto-create invoices from payment confirmations
- Sync data between tools (CRM ↔ email tool ↔ spreadsheet)

---

## Step 2: Choose Your Automation Tool

Three main categories of no-code automation tools. Pick based on complexity and budget.

**Tool comparison:**

| Tool Category | Best For | Pricing | Learning Curve | Power Level |
|---|---|---|---|---|
| **Zapier** | Simple, 2-3 step workflows | $20-50/month | Easy | Low-Medium |
| **Make (Integromat)** | Visual, multi-step workflows | $9-30/month | Medium | Medium-High |
| **n8n** | Complex, developer-friendly, self-hosted | Free (self-hosted) or $20/month | Medium-Hard | High |

**Selection guide:**
- Budget < $20/month → Try Zapier free tier or n8n self-hosted
- Need visual workflow builder → Make
- Simple 2-step workflows → Zapier
- Complex workflows with branching logic → Make or n8n
- Want full control and customization → n8n

**Recommendation:** Start with Zapier (easiest to learn). Graduate to Make or n8n when you hit Zapier's limits.

---

## Step 3: Design Your Workflow

Before building, map out the workflow on paper or a whiteboard.

**Workflow design template:**

```
TRIGGER: What event starts the workflow?
  Example: "New row added to Google Sheet"

CONDITIONS (optional): Should this workflow run every time, or only when certain conditions are met?
  Example: "Only if Status column = 'Approved'"

ACTIONS: What should happen as a result?
  Step 1: [action]
  Step 2: [action]
  Step 3: [action]

ERROR HANDLING: What happens if something fails?
  Example: "Send me a Slack message if action fails"
```

**Example workflow (lead capture → CRM → email):**

```
TRIGGER: New form submission on website

CONDITIONS: Email field is not empty

ACTIONS:
  Step 1: Add lead to CRM (e.g., Airtable or HubSpot)
  Step 2: Send welcome email via email tool (e.g., ConvertKit)
  Step 3: Create task in project management tool (e.g., Notion) to follow up in 3 days
  Step 4: Send me a Slack notification: "New lead: [Name]"

ERROR HANDLING: If Step 1 fails, send email alert to me
```

**Design principles:**
- Keep it simple — start with 2-3 steps, add complexity later
- Test each step individually before chaining them together
- Add delays between actions if needed (some APIs are slow)
- Always include error notifications so you know when things break

---

## Step 4: Build and Test Your Workflow

**Testing checklist:**
- Submit test data through the trigger
- Verify each action executes correctly
- Check that data maps to the right fields
- Test with edge cases (empty fields, special characters, long text)
- Test error handling (intentionally cause a failure to see if alerts work)

**Common issues and fixes:**

| Issue | Cause | Fix |
|---|---|---|
| Workflow doesn't trigger | Trigger conditions too narrow | Check filter settings, broaden criteria |
| Action fails | API rate limit or permissions | Add delay between actions, re-authenticate |
| Data missing or incorrect | Field mapping wrong | Double-check which fields are mapped |
| Workflow runs multiple times | Duplicate triggers | De-duplicate based on unique ID |

**Rule:** Test with real data before relying on an automation.

---

## Automation Categories for Solopreneurs

### Client Management
- Auto-onboarding: Send welcome email + contract + invoice on signup
- Meeting scheduling: Auto-confirm + send calendar invite + reminder
- Follow-up sequences: Drip emails based on client lifecycle stage

### Marketing
- Social media: Batch schedule posts, auto-repost top content
- Email marketing: Welcome sequences, abandoned cart, re-engagement
- Content: Auto-share blog posts to social media

### Finance
- Invoicing: Auto-generate from time tracking or project completion
- Expense tracking: Auto-categorize from bank feeds
- Reporting: Weekly/monthly financial summaries

### Operations
- Data sync: Keep CRM, email tool, and spreadsheet in sync
- File organization: Auto-sort downloads, rename files
- Backups: Scheduled backups of critical data

---

## Quick Wins (Start Today)

1. **Email auto-responder:** Set up an auto-reply for common inquiries
2. **Calendar sync:** Connect your booking tool to your calendar
3. **Invoice automation:** Auto-generate invoices from completed projects
4. **Social media scheduling:** Queue up a week's worth of posts
5. **Form-to-spreadsheet:** Auto-save form submissions to a spreadsheet

---

*Based on automation workflows best practices for solopreneurs*
