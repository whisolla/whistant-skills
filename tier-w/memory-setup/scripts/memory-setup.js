'use strict';

// ── Memory Setup: Initialize OpenClaw-compatible memory structure ─────────────
// Creates the standard workspace memory structure:
//   workspace/
//   ├── MEMORY.md              # Long-term curated memory
//   └── memory/
//       ├── logs/              # Daily logs (YYYY-MM-DD.md)
//       ├── projects/           # Project-specific context
//       ├── groups/            # Group chat context
//       └── system/            # Preferences, setup notes
// ─────────────────────────────────────────────────────────────────────────────

var fs = require('fs');
var path = require('path');

var WORKSPACE = 'workspace/';
var MEMORY_DIR = WORKSPACE + 'memory/';

var TEMPLATES = {
  MEMORY_md:
    '# MEMORY.md — Long-Term Memory\n\n' +
    '## About the User\n' +
    '- Name: \n' +
    '- Preferences: \n' +
    '- Goals: \n\n' +
    '## Active Projects\n' +
    '- \n\n' +
    '## Decisions & Lessons\n' +
    '- \n\n' +
    '## Preferences\n' +
    '- Communication style: \n' +
    '- Tools and workflows: \n\n',
  daily_log:
    '# YYYY-MM-DD — Daily Log\n\n' +
    '## Tasks\n- [ ] \n\n' +
    '## Notes\n\n' +
    '---\n',
  project:
    '# Project: \n\n' +
    '## Status\n\n' +
    '## Key Decisions\n\n' +
    '## Pending\n\n',
  system_prefs:
    '# System Preferences\n\n' +
    '## Tool Preferences\n\n' +
    '## Workflow Conventions\n\n',
};

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function ensureFile(filePath, template) {
  ensureDir(path.dirname(filePath));
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, template || '');
  }
}

function init(userName) {
  // Create workspace memory structure
  ensureDir(WORKSPACE);
  ensureDir(MEMORY_DIR);
  ensureDir(MEMORY_DIR + 'logs/');
  ensureDir(MEMORY_DIR + 'projects/');
  ensureDir(MEMORY_DIR + 'groups/');
  ensureDir(MEMORY_DIR + 'system/');

  ensureFile(WORKSPACE + 'MEMORY.md', TEMPLATES.MEMORY_md);

  var today = new Date().toISOString().slice(0, 10);
  var logTemplate = TEMPLATES.daily_log.replace('YYYY-MM-DD', today);
  ensureFile(MEMORY_DIR + 'logs/' + today + '.md', logTemplate);

  return {
    ok: true,
    message: '✅ Memory structure initialized at workspace/',
    files: {
      memory_md: WORKSPACE + 'MEMORY.md',
      today_log: MEMORY_DIR + 'logs/' + today + '.md',
      projects: MEMORY_DIR + 'projects/',
      groups: MEMORY_DIR + 'groups/',
    },
  };
}

function createProject(name, description) {
  var safe = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  var file = MEMORY_DIR + 'projects/' + safe + '.md';
  var content = '# Project: ' + name + '\n\n' +
    '## Status: Active\n\n' +
    '## Description\n' + (description || '') + '\n\n' +
    '## Key Decisions\n\n\n## Pending\n\n';
  ensureFile(file, content);
  return { ok: true, file: file };
}

function dailyLog(date) {
  date = date || new Date().toISOString().slice(0, 10);
  var file = MEMORY_DIR + 'logs/' + date + '.md';
  ensureFile(file, TEMPLATES.daily_log.replace('YYYY-MM-DD', date));
  return { ok: true, file: file, content: fs.readFileSync(file, 'utf8') };
}

function appendToLog(date, entry) {
  date = date || new Date().toISOString().slice(0, 10);
  var file = MEMORY_DIR + 'logs/' + date + '.md';
  ensureFile(file, TEMPLATES.daily_log.replace('YYYY-MM-DD', date));
  fs.appendFileSync(file, '\n' + entry + '\n');
  return { ok: true };
}

function updateMemory(key, value) {
  // Simple key-value update to MEMORY.md
  var file = WORKSPACE + 'MEMORY.md';
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, TEMPLATES.MEMORY_md);
  }
  var content = fs.readFileSync(file, 'utf8');
  // Very simple replacement: look for "## Key" or append
  var marker = '## ' + key + '\n';
  if (content.includes(marker)) {
    // Replace following paragraph
    content = content.replace(marker + '[\s\S]*?(?=\n## |$)', marker + value + '\n');
  } else {
    content += '\n' + marker + value + '\n';
  }
  fs.writeFileSync(file, content);
  return { ok: true };
}

module.exports = { init, createProject, dailyLog, appendToLog, updateMemory };
