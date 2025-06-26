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

## License

MIT
