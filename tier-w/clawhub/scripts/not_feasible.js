// Not-feasible skills for Whistant — deep screened but determined incompatible
// These skills require non-JS runtimes (Python, shell, Node.js, binaries, etc.)
// Source: ~/Projects/openclaw_skills/whistant_na/ directory
// Count: 105 skills (46 original + 59 FAIL/NA from marathon + batch 24)

const NOT_FEASIBLE = new Set([
  'agent-browser-clawdbot', 'agentmail', 'ai-persona-os', 'answeroverflow',
  'apple-notes', 'apple-reminders', 'auto-updater', 'automation-workflows',
  'blogwatcher', 'browser-automation', 'browser-use', 'byterover',
  'capability-evolver', 'clawddocs', 'clawdhub', 'elite-longterm-memory',
  'evolver', 'exa-web-search-free', 'excel-xlsx', 'frontend-design-ultimate',
  'gemini', 'larry', 'markdown-converter', 'moltguard', 'nano-pdf',
  'obsidian', 'openai-whisper', 'openclaw-backup', 'opencode-controller',
  'pdf', 'peekaboo', 'playwright', 'playwright-mcp', 'playwright-scraper-skill',
  'powerpoint-pptx', 'remotion-video-toolkit',
  'self-improving-agent', 'skill-finder-cn', 'sonoscli',
  'superdesign', 'ui-ux-pro-max', 'web-search-plus', 'word-docx', 'xiaohongshu-mcp',
  // FAIL skills (AI bypassed, wrong API, broken) — marathon 2026-04-30
  // Batch 26 PASS (12 moved to COMPATIBLE): ai-humanizer, naming-forge, nl2json,
  // prompt-crafter, url-intent-parser, thinking-partner, proactive-agent-lite,
  // daily-news-digest, less-token, data-analysis, mobile-code-review-pro, ai-business-search
  'engagelab-omni-connect',
  'safetoken-fun', 'research-briefing',
  // NA skills (API-gated, OpenClaw-specific, server-dependent) — marathon 2026-04-30
  'youtube-api-skill',
  'growth-hub',
  'scrapefun', 'maxclaw-helper', 'openclaw-regex-engine', 'openclaw-daily',
  'msw-skill', 'market-configurable-skills', 'domain-checker', 'qr-code',
  'tech-news-digest', 'wecom', 'cold-email', 'meta-ads', 'nod',
  'cloudflare-mcp', 'protagons', 'whatsapp-business',
  'mx-finance-data',
  // Batch 22 FAIL (2026-05-01): AI bypassed — clawhub.search() preferred over reading local SKILL.md
  // Retest 2026-05-01: reload-skills fix didn't help — sandbox skills not visible to AI
  // shop-product-search removed — L3 PASS, now in DEPRECATED (api_gone)
  // Batch 24 NA (2026-05-01): API-gated, requires external API key or service
  'aerobase-travel-lounges', 'arithym-io-arithym', 'bright-data-claude-skill-deep-research',
  'cyberpink-strategy-abc', 'gitee-create-pr', 'guardrail-smart-accounts',
  'helius', 'kash', 'membox-cloud-sync',
  'rising-transfers-dna-finder', 'rising-transfers-transfer-intel',
  'searcher-os', 'triburuby', 'ui-inspiration-library',
  
  // --- BATCH 31: Lokuli booking spam (22 skills, requires Lokuli MCP) ---
  'book-music-lessons', 'service-booking', 'book-acupuncture', 'book-carpet-cleaning',
  'book-chiropractor', 'book-computer-repair', 'book-dog-walker', 'book-math-tutor',
  'book-meditation', 'book-oil-change', 'book-pest-control', 'book-phone-repair',
  'book-photographer', 'book-physical-therapy', 'book-transmission', 'book-videographer',
  'book-window-cleaning', 'book-appliance-repair', 'book-auto', 'book-beauty',
  'lokuli-skills', 'book-local',
  
  // --- BATCH 31: OC-specific skills (12 skills, OpenClaw infrastructure) ---
  'telegram', 'openclaw-mcp-plugin', 'adaptive-reasoning', 'smart-model-switching',
  'agent-orchestration', 'clawxiv-api', 'openmaic',
  'smart-model-routing-for-zai', 'elevenlabs-ai', 'openclaw-token-save',
  'openclaw-config-guide', 'agent-cost-monitor',
  
  // --- BATCH 31: TypeScript/NPM plugin skills (NOT_FEASIBLE) ---
  'servicenow-docs', 'serper-search', 'universal-profile', 'clawclash',
  'create-videoconference',
  
  // --- BATCH 31: API-key-gated prompt-only (20 skills) ---
  'evoweb-ai', 'video-agent', 'seiso',
  'captchas-openclaw', 'raycast', 'clawdaddy',
  'ghl-open-account', 'xfor-bot', 'bitbucket-automation',
  'elevenlabs-open-account', 'agentdomainservice', 'warden-studio-deploy',
  'polt-skill', 'cal-com-automation', 'canva-automation',
  'polt-user', 'unloopa-api', 'guruwalk-free-tours',
  'seisoai',
  
  // --- BATCH 31: Has dist/code but API-key-gated ---
  'file-repair-skill',
  
  // --- BATCH 31: Remaining uncategorized (bulk NA) ---
  'k-cinema-bridge', 'email-importance-content-analysis', 'feishu-bitable-creator',
  'pinata-api', 'remote-jobs-finder', 'evomap-publish-capsule', 'identitygram-signin',
  'aiclude-vulns-scan', 'morning-green-invoice', 'ohos-react-native-performance',
  'douyin-cover-builder', 'futa-tracker', 'baselight-mcp', 'aisp',
  'reskueai', 'xpr-code-sandbox', 'wbs-planner', 'api-key-ui-tab',
  'reddit-research', 'whistle-rpc', 'close-loop', 'router',
  'stock-picker-orchestrator', 'hoverbot-chatbot', 'tms',
  'openclaw-api-tester', 'b2a',
  'property-search', 'contract-review',
  'geo-audit-optimizer', 'plaza-one', 'popup-organizer', 'salai-mcp',
  'outlit-sdk', 'excalidraw-diagrams', 'afrexai-technical-seo',
  'afrexai-support-operations', 'afrexai-web3-engineering',

  // --- BATCH 31: Remaining low-DL uncategorized (bulk NA, 283 skills) ---
  'askgina-polymarket', '1p-shortlink', 'agent-signet-id', 'criticaster', 'spreadsheet-automation',
  'embodied-ai-news', 'alura', 'copilotkit-runtime-patterns', 'chartclass', 'apipick-china-phone-checker',
  'gigohotel', 'afrexai-n8n-mastery', 'forage-shopping', 'afrexai-ai-readiness', 'apipick-telegram-phone-check',
  'cubistic-public-bots', 'cart-management', 'godot-engine-3d-developer', 'apipick-email-checker', 'clawsentinel',
  'optionshawk', 'fiberagent', 'javascript-skills', 'aerobase-flight-deals', 'finally-offline',
  'payram-vs-x402', 'openapi-deep-audit', 'clawcoach-setup', 'web-i18n-nextjs', 'moltshell-vision',
  'cli-anything-openclaw', 'json-canvas', 'zhheo-blog-tools', 'meeting-assistant', 'interactive-games',
  'feishu-troubleshoot', 'bmap-jsapi-three', 'launchthatbot-git-team-ops', 'paper-digest', 'solana-light-token-client',
  'jqopenclaw-node-invoker', 'envato-comment-task-to-sheet', 'market-report-using-cmc-mcp', 'me-txt', 'aerobase-travel-activities',
  'social-media-content', 'aerobase-travel-flights', 'openclaw-debug', 'fibuki', 'emotionwise',
  'openclaw-accounting', 'search-web', 'iseclaw-intel', 'aerobase-jetlag', 'zustand-patterns',
  'gmail-2', 'clawtruth-skills', 'datamerge', 'game-designer-toolkit', 'olo-sec-scanner',
  'shipz', 'openclaw-stock-data-skill', 'nodejs-project-arch', 'learn-moralis', 'clawhub-web-only-publish',
  'phoenix-loop', 'mailparser', 'order', 'mixtureofagents-debate', 'afrexai-agent-memory',
  'semantic-shield', 'tronscan-token-scanner', 'clawhub-web-publisher', 'colors-cc-skill', 'zeelin-liberal-arts-paper',
  'docs-bot', 'fabric-marketplace', 'excalidraw-diagram', 'watcha-finder', 'moltmon-v1',
  'chinese-huangdi-health-timer', 'smart-wake', 'blog-forge', 'mercado-libre', 'game-quality-gates',
  'pulsemon', 'creative-eye', 'botlearn-examiner', 'feishu-doc-editing', 'agentearth',
  'jira-workflow', 'blocker-min-input', 'cloudbypass', 'tronscan-transaction-info', 'qingbo-search',
  'yield', 'firm-spec-compliance-pack', 'deckrun-pdf-generator-free', 'swotpal-swot-analysis', 'outlook-calendar-2',
  'notion-2', 'tronscan-block-info', 'citation-verifier', 'toon-adoption-skill', 'qclaw',
  'readgzh', 'log', 'france-cinemas', 'ghostscore', 'zod-testing',
  'batch-processing', 'ms-todo', 'jiandaoyun', 'model-queue', 'skill-with-prompt-engineering',
  'semantic-prospect', 'trugenai', 'configure-openclaw', 'agent-regression-guard', 'ts-interface-miner',
  'olo-deal-screening', 'lbb-my-skill', 'arxiv-source', 'tronscan-data-insights', 'market-signal-fusion',
  'recursive-knowledge-miner', 'trainedby-mcp', 'content-scheduler', 'openclaw-skill-git-manager', 'cotale',
  'git-team-ops', 'tronscan-account-profiler', 'global-ads-helper', 'dopewars-online', 'medgroup-drgdip-skill',
  'tronscan-search', 'tronscan-realtime-network', 'linkup-search', 'zod-skill', 'selective-pollution-test',
  'tronscan-contract-analysis', 'redux-saga-testing', 'ax-development', 'orderly-one-dex', 'sea-doc-summarizer',
  'orderly-api-authentication', 'orderly-positions-tpsl', 'kaozhutiskill', 'agentcrush', 'ai-project-learner',
  'uapi-get-game-minecraft-userinfo', 'wework', 'uapi-get-game-steam-summary', 'krea-ai',
  'trello-planner', 'find-souls', 'realtime-agent', 'hiarthur', 'tronscan-sr-governance',
  'typescript-skills', 'mdshare-agent', 'ai-deathmatch', 'sql-profiler', 'patent-eou',
  'sougou-map', 'zhaohong-hello-world', 'openclaw-peer-bridge', 'favicon-so', 'graph-advocate',
  'fl-dental-assistant', 'traffic-query', 'looloo-discovery', 'automation-workflows-moss', 'mjzj',
  'gate-info-coin-analysis', 'chinese-moa-debate', 'evermemory', 'fl-invoice-tracker', 'data-source-verification',
  'project-retrospective', 'miniprogram-architect', 'feishu-task-control', 'gate-news-briefing', 'investor-memo-generator',
  'picoads', 'n8n-workflow-automation-litiao', 'gate-exchange-flashswap', 'gate-info-market-overview', 'mobile-run',
  'amap-integration', 'gate-exchange-staking', 'phy-research-deep', 'openclaw-coworker-prompts', 'aport-id',
  'telegram-premium-features', 'idx-market-data', 'fullstack', 'vocab-deep-dive', 'gamelegend',
  'shopify-buy3', 'thirteen-week-cash-flow', 'gate-exchange-tradfi', 'invoice-automation', 'evidence-gate',
  'sunshine-automation-workflows', 'productivity-design', 'mindverse-secondme', 'agent-monetization', 'nerve-kanban',
  'startup-financial-model', 'api-design-doc', 'giza', 'volcengine-api', 'frontend-patterns',
  'youtube-music-mv-detector', 'la-local-chat', 'memesio-meme-generator', 'automation-workflows-litiao', 'lap-1000000-recipe-and-grocery-list-api-v2',
  'sql-to-go', 'variant-design-skill', 'github-repo-teardown', 'agentrank', 'config-pull-template',
  'agent-to-merchant', 'automation-workflows-conflict', 'sentibook', 'arbitrage', 'betting',
  'prd-to-ddd-design', 'chat-selfie', '51mee-background-check-list', '51mee-interview-evaluation-report', '51mee-interview-questions-generator',
  'fboxmcp', 'mobilerun-skill', 'security-review', 'cn-funds-mcp', 'a-mem-memory-organization',
  'hautv-flutter-senior-getx-review', 'shared-memory-governor', 'bank-reconciliation-agent', 'cn-hk-dividend-fhpg-api', 'grafana-readonly',
  'socialconductor-skill', 'geo-prompt-architecture', 'auctionclaw', 'crayfish-sticker', 'tvs-pullread',
  'agent-team-organization', 'swap-api', 'buy-coffee', 'moltme', 'fb-graph-proxy',
  'phy-error-writer', 'shopify-directory', 'tbc-bank-api', 'implement-design', 'wayfront',
  'manusilized', 'xdoc-translationx', 'anmu-weather', 'production-agent-builder', 'neon-postgres-egress-optimizer',
  'okx-audit-log', 'danxbuidl-memory-distiller', 'bugpack-list-bugs', 'tab-accordion', 'use-effect',
  'embodied-task', 'blueprint-spec', 'buy-activewear', 'buy-apparel', 'moltme-dating',
  'china-idcard', 'article-page-generator', 'rentaclaw', 'polaris-news', 'command-center',
  'stock-analysis', 'stock-market-pro', 'stock-watcher',
]);

module.exports = { NOT_FEASIBLE };
