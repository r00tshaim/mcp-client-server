# Custom MCP Example

## Overview

This project demonstrates how to use the **Model Context Protocol (MCP)** to separate tool logic from your AI agent, making your system more modular and maintainable. It consists of:

- **MCP Server**: Hosts various tools (functions) that can be called by clients.
- **MCP Client**: Connects to the server, interacts with the user, and lets the AI agent call tools as needed.

---

## How It Works

1. **MCP Server**  
   - Runs on Node.js using Express.
   - Registers several tools (like `addTwoNumbers`, `getCurrentTime`, `getBatteryStatus`, and `getListofHugeFileInSystem`).
   - Listens for connections from MCP clients via Server-Sent Events (SSE).

2. **MCP Client**  
   - Connects to the MCP server.
   - Uses Google Gemini AI to generate responses.
   - When the AI wants to use a tool, it calls the tool on the server and returns the result to the user.

---

## Tools Included in the MCP Server

- **addTwoNumbers**: Adds two numbers.
- **getCurrentTime**: Returns the current time.
- **getBatteryStatus**: Shows your Mac's battery status.
- **getListofHugeFileInSystem**: Lists large files on your Desktop.

---

## How MCP Clients Connect and Use Tools

- The client connects to the server using SSE.
- When the AI model decides a tool is needed, it sends a tool call request to the server.
- The server executes the tool and returns the result.
- The client displays the result to the user and continues the conversation.

---

## How to Start

### 1. Install dependencies

In both `server` and `client` folders, run:

```sh
pnpm install
```
or
```sh
npm install
```

### 2. Start the MCP Server

```sh
cd server
node index.js
```

The server will run at [http://localhost:3001](http://localhost:3001).

### 3. Start the MCP Client

```sh
cd client
node index.js
```

---

## Sample Input and Output

**User input:**
```
You: What is the current time?
```

**AI output:**
```
AI: The current time is 2025-06-26T12:34:56.789Z
```

**User input:**
```
You: Add 5 and 7
```

**AI output:**
```
AI: The sum of 5 and 7 is 12
```

---

## Why Use MCP?

- **Separation of Concerns**: Tools are managed on the server, not mixed into your AI agent code.
- **Scalability**: Add, update, or remove tools without changing your AI logic.
- **Standardized Communication**: MCP defines how tools are described, called, and how results are formatted.
- **Multi-Agent Support**: Multiple clients/agents can use the same set of tools.

**Without MCP:**  
You would need to hard-code tool logic and response formatting inside your AI agent, making it harder to maintain and extend.

**With MCP:**  
Your AI agent simply describes what it wants to do, and the server handles the details.

---

## Environment Variables

Create a `.env` file in the `client` folder with your Gemini API key:

```
GEMINI_API_KEY=your-google-genai-key
```

---


## SSE Analysis for Beginners

Here’s a clear breakdown of what’s happening in a real network capture when the MCP client and server communicate using SSE:

---

### 🔄 Full Sequence of Events

#### 📨 Step 1: Client Sends a `POST` Request

* **Packet #21**
* **Method:** `POST`
* **Endpoint:** `/messages?sessionId=...`
* **Payload:** JSON-RPC

  ```json
  {
    "method": "tools/call",
    "params": {
      "name": "getBatteryStatus",
      "arguments": {}
    },
    "jsonrpc": "2.0",
    "id": 3
  }
  ```

---

#### ✅ Step 2: Server Responds with `HTTP/1.1 202 Accepted`

* **Packet #23**
* This means: “I got your request, and I’ll handle it, but not right now.”

This typically happens when the **actual result will be streamed or sent later**, often used in async or server-sent event setups.

---

#### 📤 Step 3: Server Pushes the Response (SSE Style)

* **Packet #25**
* Server sends a raw TCP payload that looks like a **Server-Sent Events (SSE)** stream:

  ```
  event: message
  data: {"result":{"content":[{"type":"text","text":"Battery level is 92% and it is not charging."}]},"jsonrpc":"2.0","id":3}
  ```

🧠 Interpretation:

* This confirms that the server is using **Server-Sent Events (SSE)** to push the result **after** the initial 202 response.
* The client doesn’t poll or request again. Instead, it **keeps the connection open** and the server pushes data once it’s ready.

---

### 🧩 Summary of Communication Pattern

| Step | Role   | Action                                                                       |
| ---- | ------ | ---------------------------------------------------------------------------- |
| 1    | Client | Sends `POST /messages` with JSON-RPC payload                                 |
| 2    | Server | Responds with `HTTP/1.1 202 Accepted`                                        |
| 3    | Server | Later sends the result using **Server-Sent Event** with event type `message` |
| 4    | Client | ACKs the pushed data                                                         |

---

### ✅ Why SSE?

Using `Content-Type: text/event-stream`, the server can send **updates continuously or asynchronously** over a single long-lived HTTP connection.

This approach is perfect when:

* Results take time (e.g. processing a tool call).
* Real-time progress or streaming is desired.

---


## License

MIT
