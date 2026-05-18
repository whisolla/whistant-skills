---
name: trello
description: Manage Trello boards, lists, and cards via the Trello REST API.
version: 2.8
---

# trello

> **Runtime:** Terminal: `run /skills/trello/scripts/trello.js <action> [args]`. JS: `var s = require('/skills/trello/scripts/trello.js'); await s.listBoards()`

Manage Trello boards, lists, and cards directly via the Trello REST API.

## Setup

1. Get your API key: https://trello.com/power-ups/admin (log in, click "API Key")
2. Generate a token (click "Token" link on that page)
3. Store once via keychain:

```js
var s = require("/skills/trello/scripts/trello.js");
await s.configure("your-api-key", "your-token");
```

After this, the skill finds your credentials automatically — no need to pass them in any command.

| Token source | When it's used |
|-------------|---------------|
| `keychain.get("TRELLO_API_KEY")` / `keychain.get("TRELLO_API_TOKEN")` | Normal Whistant use (set once via `configure`, persists) |
| `s.init(KEY, TOKEN)` | Testing via `/code` — sets credentials in-memory for the session |
| `TRELLO_API_KEY` / `TRELLO_API_TOKEN` env vars | Node.js CLI local testing |

## Terminal Usage

```bash
# List all boards
run /skills/trello/scripts/trello.js listBoards

# Get board details
run /skills/trello/scripts/trello.js getBoard BOARD_ID

# Get lists in a board
run /skills/trello/scripts/trello.js getBoardLists BOARD_ID

# Get all cards on a board
run /skills/trello/scripts/trello.js getBoardCards BOARD_ID

# Get list details
run /skills/trello/scripts/trello.js getList LIST_ID

# Get cards in a list
run /skills/trello/scripts/trello.js getListCards LIST_ID

# Create a card
run /skills/trello/scripts/trello.js createCard --list LIST_ID --name "New Task" --desc "Description"

# Move card to another list
run /skills/trello/scripts/trello.js moveCard CARD_ID --to LIST_ID

# Add a comment to a card
run /skills/trello/scripts/trello.js addComment CARD_ID --text "Looks good!"

# Archive a card
run /skills/trello/scripts/trello.js archiveCard CARD_ID
```

## JS API

```js
var s = require('/skills/trello/scripts/trello.js');
s.init("API_KEY", "TOKEN");  // or use configure() once for keychain

// List all boards
var boards = await s.listBoards();
console.log(boards.data.map(function(b) { return b.name; }));

// Get board details
var board = await s.getBoard("BOARD_ID");

// Get lists in a board
var lists = await s.getBoardLists("BOARD_ID");

// Get all cards on a board
var cards = await s.getBoardCards("BOARD_ID");

// Get list details
var list = await s.getList("LIST_ID");

// Get cards in a list
var listCards = await s.getListCards("LIST_ID");

// Create a card
var card = await s.createCard({ idList: "LIST_ID", name: "Card Title", desc: "Description" });

// Move card to another list
await s.moveCard("CARD_ID", "NEW_LIST_ID");

// Add a comment
await s.addComment("CARD_ID", "Comment text");

// Archive a card
await s.archiveCard("CARD_ID");
```

## Actions

### listBoards()
Returns all boards visible to the account.

```js
var result = await s.listBoards();
// result.data → array of board objects with id, name, url
```

### getBoard(boardId)
Returns details for a single board.

```js
var board = await s.getBoard("BOARD_ID");
// board.data → board object with name, desc, prefs, url
```

### getBoardLists(boardId)
Returns all lists in a board.

```js
var lists = await s.getBoardLists("BOARD_ID");
// lists.data → array of list objects with id, name
```

### getBoardCards(boardId)
Returns all cards on a board (across all lists).

```js
var cards = await s.getBoardCards("BOARD_ID");
// cards.data → array of card objects
```

### getList(listId)
Returns details for a single list.

```js
var list = await s.getList("LIST_ID");
// list.data → { id, name, closed, idBoard }
```

### getListCards(listId)
Returns all cards in a single list.

```js
var cards = await s.getListCards("LIST_ID");
// cards.data → array of card objects with id, name, desc, idList
```

### createCard({ idList, name, desc? })
Creates a new card in a list.

```js
var card = await s.createCard({ idList: "LIST_ID", name: "New Task", desc: "Optional description" });
// card.data → { id, name, desc, idList, url }
```

### moveCard(cardId, listId)
Moves a card to a different list. Same as `updateCard(cardId, { idList })`.

```js
await s.moveCard("CARD_ID", "TARGET_LIST_ID");
```

### addComment(cardId, text)
Adds a comment to a card.

```js
await s.addComment("CARD_ID", "This looks great!");
```

### archiveCard(cardId)
Archives (closes) a card. Set `closed: false` to unarchive via `updateCard`.

```js
await s.archiveCard("CARD_ID");
```

### updateCard(cardId, fields)
Updates a card's fields: `name`, `desc`, `closed`, `idList`.

```js
await s.updateCard("CARD_ID", { name: "Updated Title" });
```

## Setup on Mac/Linux (OpenClaw)

```bash
export TRELLO_API_KEY=your_key_here
export TRELLO_API_TOKEN=your_token_here
```

## Notes

- Board/List/Card IDs can be found in the Trello URL: `https://trello.com/b/<shortLink>/<boardName>` or `https://trello.com/c/<cardId>`
- Rate limits: 300 requests/10s per API key; 100 requests/10s per token
- All write operations (POST/PUT) include key and token automatically
- API base: `https://api.trello.com/1`
