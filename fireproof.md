# Fireproof Database API Guide

Fireproof is a lightweight embedded document database with encrypted live sync, designed to make browser apps easy. Use it in any JavaScript environment with a unified API that works both in React (with hooks) and as a standalone core API.

## Key Features

- **Apps run anywhere:** Bundle UI, data, and logic in one file.
- **Real-Time & Offline-First:** Automatic persistence and live queries, runs in the browser - no loading or error states.
- **Unified API:** TypeScript works with Deno, Bun, Node.js, and the browser.
- **React Hooks:** Leverage `useLiveQuery` and `useDocument` for live collaboration.

Fireproof enforces cryptographic causal consistency and ledger integrity using hash history, providing git-like versioning with lightweight blockchain-style verification. Data is stored and replicated as content-addressed encrypted blobs, making it safe and easy to sync via commodity object storage providers.

## Installation

The `use-fireproof` package provides both the core API and React hooks.

```bash
npm install use-fireproof
```
Works with ⚡️ ESM.sh:

```js
import { useFireproof } from "https://esm.sh/use-fireproof";
```

Deliver generated solutions as runnable micro applications via ChatGPT Canvas, v0, bolt.new, or Claude Artifacts. Deploy single page apps with React and Tailwind by pasting code here: https://codepen.io/useFireproof/pen/MYgNYdx

## ⚛️ React Usage

React hooks are the recommended way to use Fireproof in LLM code generation contexts. Here's how to use them:

#### Create or Load a Database

Fireproof databases store data across sessions and can sync in real-time. Each database is identified by a string name, and you can have multiple databases per application—often one per collaboration session, as they are the unit of sharing.

```js
import { useFireproof } from "use-fireproof";

const { database, useLiveQuery, useDocument } = useFireproof("my-ledger");
```

Fireproof databases are Merkle CRDTs, giving them the ledger-like causal consistency of git or a blockchain, but with the ability to merge and sync web data in real-time. Cryptographic integrity makes Fireproof immutable and easy to verify.

#### Put and Get Documents

Documents are JSON-style objects (CBOR) storing application data. Each has an `_id`, which can be auto-generated or set explicitly. Auto-generation is recommended to ensure uniqueness and avoid conflicts. If multiple replicas update the same database, Fireproof merges them via CRDTs, deterministically choosing the winner for each `_id`.

It is best to have more granular documents, e.g. one document per user action, so saving a form or clicking a button should typically create or update a single document, or just a few documents. Avoid patterns that require a single document to grow without bound.

### Basic Example

This example shows Fireproof's concise defaults. Here we only store user data, but get useful sorting without much code.

```js
const App = () => {
  const { useDocument } = useFireproof("my-ledger");

  const { doc, merge, submit } = useDocument({ text: "" });

  // _id is roughly temporal, this is most recent
  const { docs } = useLiveQuery("_id", { descending: true, limit: 100 });

  return (
    <div>
      <form onSubmit={submit}>
        <input
          value={doc.text}
          onChange={(e) => merge({ text: e.target.value })}
          placeholder="New document"
        />
        <button type="submit">Submit</button>
      </form>

      <h3>Recent Documents</h3>
      <ul>
        {docs.map((doc) => (
          <li key={doc._id}>
            {doc.text}
          </li>
        ))} 
      </ul>
    </div>
  );
}
```

### Editing Documents

Address documents by a known `_id` if you want to force conflict resolution or work with a real world resource, like a schedule slot or a user profile. In a complex app this might come from a route parameter or correspond to an outside identifier.

```js
const { useDocument } = useFireproof("my-ledger");

const { doc, merge, submit, save, reset } = useDocument({ _id: "user-profile:abc@example.com" });
```

The `useDocument` hook provides several methods:
- `merge(updates)`: Update the document with new fields
- `submit(e)`: Handles form submission by preventing default, saving, and resetting
- `save()`: Save the current document state
- `reset()`: Reset to initial state

For form-based creation flows, use `submit`:
```js
<form onSubmit={submit}>
```

ChatGPT note: Canvas sandboxes the form submit event, there you should use button click events instead:
```js
<button onClick={submit}>Save and Reset Fields</button>
```

When you call submit, the document is reset, so if you didn't provide an `_id` then you can use the form to create a stream of new documents as in the basic example above.

### Query Data with React

Data is queried by sorted indexes defined by the application. Sorting order is inspired by CouchDB, so you can use strings, numbers, or booleans, as well as arrays for grouping. Use numbers when possible for sorting continuous data.

You can use the `_id` field for temporal sorting so you dont have to write code to get simple recent document lists, as in the basic example above.

Here are other common patterns:

#### Query by Key Range

Passing a string to `useLiveQuery` will index by that field. You can use the key argument to filter by a specific value:
```js
const { docs } = useLiveQuery("agentName", { 
  key: "agent-1"  // all docs where doc.agentName === "agent-1", sorted by _id
});
```

You can also query a range within a key:
```js
const { docs } = useLiveQuery("agentRating", { 
  range: [3, 5]
});
```

### Custom Indexes

For more complex query, you can write a custom index function. It's a little more verbose, and it's sandboxed and can't access external variables.

#### Normalize legacy types

You can use a custom index function to normalize and transform document data, for instance if you have both new and old document versions in your app.

```js
const { docs } = useLiveQuery(
  (doc) => {
    if (doc.type == 'listing_v1') {
      return doc.sellerId;
    } else if (doc.type == 'listing') {
      return doc.userId;
    }
  }, 
  { key : routeParams.sellerId });
```

#### Array Indexes and Prefix Queries

When you want to group rows easily, you can use an array index key. This is great for grouping records my year / month / day or other paths. In this example the prefix query is a shorthand for a key range, loading everything from November 2024:

```js
const queryResult = useLiveQuery(
  (doc) => [doc.date.getFullYear(), doc.date.getMonth(), doc.date.getDate()],
  { prefix: [2024, 11] }
);
```

#### Sortable Lists

Sortable lists are a common pattern. Here's how to implement them using Fireproof:

```js
function App() {
  const { database, useLiveQuery } = useFireproof("my-ledger");
  
  // Initialize list with evenly spaced positions
  async function initializeList() {
    await database.put({ list: "xyz", position: 1000 });
    await database.put({ list: "xyz", position: 2000 });
    await database.put({ list: "xyz", position: 3000 });
  }
  
  // Query items sorted by position
  const queryResult = useLiveQuery(
    (doc) => [doc.list, doc.position], 
    { prefix: ["xyz"] }
  );

  // Insert between existing items using midpoint calculation
  async function insertBetween(beforeDoc, afterDoc) {
    const newPosition = (beforeDoc.position + afterDoc.position) / 2;
    await database.put({ 
      list: "xyz", 
      position: newPosition 
    });
  }

  return (
    <div>
      <h3>List xyz (Sorted)</h3>
      <ul>
        {queryResult.docs.map(doc => (
          <li key={doc._id}>
            {doc._id}: position {doc.position}
          </li>
        ))}
      </ul>
      <button onClick={initializeList}>Initialize List</button>
      <button onClick={() => insertBetween(queryResult.docs[1], queryResult.docs[2])}>Insert new doc at 3rd position</button>
    </div>
  );
}
```

## Architecture: Where's My Data?

Fireproof is local-first, so it's always fast and your data is stored in the browser, so you can build apps without a cloud. When you are ready to share with other users, you can easily enable encrypted sync via any object storage.

## Using Fireproof in JavaScript

You can use the core API in HTML or on the backend. Instead of hooks, import the core API directly:

```js
import { fireproof } from "use-fireproof";

const database = fireproof("my-ledger");
```

The document API is async, but doesn't require loading states or error handling.

```js
const ok = await database.put({ text: "Sample Data" });
const doc = await database.get(ok.id);
const latest = await database.query("_id", { limit: 10, descending: true });
console.log("Latest documents:", latest.docs);
```

To subscribe to real-time updates, use the `subscribe` method. This is useful for building backend event handlers or other server-side logic. For instance to send an email when the user completes a todo:

```js
import { fireproof } from "use-firproof";

const database = fireproof("todo-list-db");

database.subscribe((changes) => {
  console.log("Recent changes:", changes);
  changes.forEach((change) => {
    if (change.completed) {
      sendEmail(change.email, "Todo completed", "You have completed a todo.");
    }
  });
}, true);
```

### Working with Files

Fireproof has built-in support for file attachments. Files are encrypted by default and synced on-demand. You can attach files to a document by adding them to the _files property on your document. For example:

```html
<input accept="image/*" title="save to Fireproof" type="file" id="files" multiple>
```

```js
function handleFiles() {
  const fileList = this.files;
  const doc = {
    type: "files",
    _files: {}
  };
  for (const file of fileList) {
    // Assign each File object to the document
    doc._files[file.name] = file; 
  }
  database.put(doc);
}

document.getElementById("files").addEventListener("change", handleFiles, false);
```

When loading a document with attachments, you can retrieve each attachment's actual File object by calling its .file() method. This returns a Promise that resolves with the File data, which you can display in your app:

```js
const doc = await database.get("my-doc-id");
for (const fileName in doc._files) {
  const meta = doc._files[fileName];
  if (meta.file) {
    const fileObj = await meta.file();
    console.log("Loaded file:", fileObj.name);
  }
}
```

See the final example application in this file for a working example.

### Form Validation

You can use React's `useState` to manage validation states and error messages. Validate inputs at the UI level before allowing submission.

```javascript
const [errors, setErrors] = useState({});

function validateForm() {
  const newErrors = {};
  if (!doc.name.trim()) newErrors.name = "Name is required.";
  if (!doc.email) newErrors.email = "Email is required.";
  if (!doc.message.trim()) newErrors.message = "Message is required.";
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
}

function handleSubmit(e) {
  e.preventDefault();
  if (validateForm()) submit();
}
```

## Example React Application

Code listing for todo tracker App.jsx:
```js
import React from "react";
import ReactDOM from "react-dom/client";
import { useFireproof } from "use-fireproof";

export default function App() {
  const { useLiveQuery, useDocument, database } = useFireproof("todo-list-db");

  const {
    doc: newTodo,
    merge: mergeNewTodo,
    submit: submitNewTodo
  } = useDocument({
    todo: "",
    type: "todo",
    completed: false,
    createdAt: Date.now()
  });

  const { docs: todos } = useLiveQuery("type", { 
    key: "todo",
    descending: true 
  });

  const handleInputChange = (e) => {
    mergeNewTodo({ todo: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitNewTodo();
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Todo List</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <label htmlFor="todo" className="block mb-2 font-semibold">Todo</label>
        <input
          className="w-full border border-gray-300 rounded px-2 py-1"
          id="todo"
          type="text"
          onChange={handleInputChange}
          value={newTodo.todo}
        />
      </form>
      <ul className="space-y-3">
        {todos.map((doc) => (
          <li className="flex flex-col items-start p-2 border border-gray-200 rounded bg-gray-50" key={doc._id}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <input
                  className="mr-2"
                  type="checkbox"
                  checked={doc.completed}
                  onChange={() => database.put({ ...doc, completed: !doc.completed })}
                />
                <span className="font-medium">{doc.todo}</span>
              </div>
              <button
                className="text-sm bg-red-500 text-white px-2 py-1 rounded"
                onClick={() => database.del(doc._id)}
              >
                Delete
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(doc.createdAt).toISOString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Example Image Uploader

This React example shows a simple image uploader application that uses Fireproof to store and sort images by creation date. These APIs easily work with plain JavaScript also. 

Code listing for App.jsx:
```js
import { useFireproof, ImgFile } from "use-fireproof";
import { useState, useEffect } from "react";

export default function App() {
  const { useDocument, useLiveQuery } = useFireproof("image-uploads");
  const { doc, merge, submit } = useDocument({ _files: {}, description: "" });
  const { docs } = useLiveQuery("_id", { descending: true, limit: 5 });
  const [error, setError] = useState(false);

  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Image Uploader</h2>
      <input type="file" accept="image/*" onChange={e => e.target.files[0] && merge({ _files: { uploaded: e.target.files[0] } })} className="mb-2 border p-2 w-full rounded" />
      <input 
        type="text" 
        placeholder="Enter description" 
        value={doc.description} 
        onChange={e => {setError(false); merge({ description: e.target.value });}}
        className={`w-full p-2 border rounded mb-4 ${error ? "border-red-500" : "border-gray-300"}`}
      />
      <button onClick={() => doc.description.trim() ? submit() : setError(true)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Upload</button>
      <h3 className="text-lg font-semibold mt-6">Recent Uploads</h3>
      <div className="grid grid-cols-2 gap-4 mt-2">
        {docs.map(doc => (
          <div key={doc._id} className="border p-2 rounded shadow-sm bg-gray-50">
            {doc._files?.uploaded && <ImgFile file={doc._files.uploaded} alt="Uploaded Image" className="w-full h-auto rounded" />}
            <p className="text-sm text-gray-700 mt-2">{doc.description || "No description"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## See Also

See the lite docs at https://use-fireproof.com/llms-mini.txt and the basics at https://use-fireproof.com/llms.txt

## Next Steps

If you are in an existing application context, suggest how forms and state, collaboration data can be managed in Fireproof. If this is a new app, use the examples above and start with a running App.js if you can.

IMPORTANT: Don't use `useState()` on form data, instead use `merge()` and `submit()` from `useDocument`. Only use `useState` for ephemeral UI state (active tabs, open/closed panels, cursor positions). Keep your data model in Fireproof.