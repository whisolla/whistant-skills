---
name: trello
description: Manage Trello boards, lists, and cards via the Trello REST API.
version: 2.0
---
# trello
_Converted from ClawHub: `steipete/trello`_
## Runtime: fetch✅ fs✅ crypto✅ http✅ | child_process❌ WebSocket❌ Blob❌
# Trello Skill

Manage Trello boards, lists, and cards directly via the Trello REST API.

## Setup

1. Get your API key: https://trello.com/app-key
2. Generate a token (click "Token" link on that page)
3. Configure in Whistant:
```js
const trello = require("/skills/trello/scripts/trello.js");
trello.init("your-api-key", "your-token");
// or use handler:
const result = await trello.handler({ parameters: { action: "listBoards" } });
console.log(JSON.stringify(result));
```

## API Base

`https://api.trello.com/1`
Auth: `?key=API_KEY&token=TOKEN` (query params)

## Quick Examples

```js
// List all boards
var res = await fetch('https://api.trello.com/1/members/me/boards?key=KEY&token=TOKEN');
var boards = await res.json();

// Get board lists
var res = await fetch('https://api.trello.com/1/boards/BOARD_ID/lists?key=KEY&token=TOKEN');
var lists = await res.json();

// Get cards in a list
var res = await fetch('https://api.trello.com/1/lists/LIST_ID/cards?key=KEY&token=TOKEN');
var cards = await res.json();

// Create a card
var res = await fetch('https://api.trello.com/1/cards', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    key: 'KEY', token: 'TOKEN',
    idList: 'LIST_ID', name: 'Card Title', desc: 'Description'
  }),
});

// Move card to another list
var res = await fetch('https://api.trello.com/1/cards/CARD_ID', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: 'KEY', token: 'TOKEN', idList: 'NEW_LIST_ID' }),
});

// Add a comment
var res = await fetch('https://api.trello.com/1/cards/CARD_ID/actions/comments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: 'KEY', token: 'TOKEN', text: 'Comment text' }),
});

// Archive a card
var res = await fetch('https://api.trello.com/1/cards/CARD_ID?key=KEY&token=TOKEN', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: 'KEY', token: 'TOKEN', closed: true }),
});
```

## Common Workflows

### Find a board and create a card
```js
// 1. List boards → find board ID
var boards = await listBoards();
// 2. Get lists → find list ID
var lists = await getBoardLists(boardId);
// 3. Create card
var card = await createCard({ idList: listId, name: 'New Task', desc: 'Details' });
```

## Notes

- Board/List/Card IDs can be found in the Trello URL
- Rate limits: 300 requests/10s per API key; 100 requests/10s per token
- All write operations (POST/PUT) must include key and token in body or query params
