import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
//import { createPost } from "./mcp.tool.js";
import { z } from "zod";
import { exec } from "child_process";
import util from "util";

const server = new McpServer({
    name: "example-server",
    version: "1.0.0"
});

// ... set up server resources, tools, and prompts ...

const app = express();


server.tool(
    "addTwoNumbers",
    "Add two numbers",
    {
        a: z.number(),
        b: z.number()
    },
    async (arg) => {
        const { a, b } = arg;
        return {
            content: [
                {
                    type: "text",
                    text: `The sum of ${a} and ${b} is ${a + b}`
                }
            ]
        }
    }
)


server.tool(
    "getCurrentTime",
    "Get the current time",
    {},
    async () => {
        const now = new Date();
        return {
            content: [
                {
                    type: "text",
                    text: `The current time is ${now.toISOString()}`
                }
            ]
        }
    }
)

server.tool(
    "getBatteryStatus",
    "Get the battery status of the device",
    {},
    async () => {
        // Get actual battery status using pmset (macOS only)
        const execAsync = util.promisify(exec);
        const { stdout } = await execAsync('pmset -g batt');
        // Example output: "Now drawing from 'Battery Power'\n -InternalBattery-0 (id=1234567)\t95%; discharging; 3:45 remaining present: true"
        const match = stdout.match(/(\d+)%.*?(charging|discharging|charged)/i);
        const batteryStatus = {
            level: match ? parseInt(match[1], 10) : null,
            charging: match ? /charging|discharging|charged/i.test(match[3]) : null
        };
        return {
            content: [
                {type: "text",
                    text: `Battery level is ${batteryStatus.level}% and it is ${batteryStatus.charging ? "charging" : "not charging"}.`
                }
            ]
        };
    }   
)

server.tool(
    "getListofHugeFileInSystem",
    "Get a list of huge files in the system",
    {},
    async () => {
        // Simulating retrieval of huge files
        const execAsync = util.promisify(exec);

        const desktopPath = `${process.env.HOME}/Desktop`;
        const { stdout } = await execAsync(`find "${desktopPath}" -type f -size +100M -exec ls -lh {} \\; | awk '{ print $9, $5 }'`);
        const hugeFiles = stdout
            .split('\n')
            .filter(line => line.trim())
            .map(line => {
                const parts = line.split(' ');
                const name = parts.slice(0, -1).join(' ');
                const size = parts[parts.length - 1];
                return { name, size };
            });
        return {
            content: [
                {type: "text",
                    text: `Huge files in the system:\n${hugeFiles.map(file => `${file.name} (${file.size})`).join("\n")}`
                }
            ]
        };
    }
)



// to support multiple simultaneous connections we have a lookup object from
// sessionId to transport
const transports = {};

app.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport('/messages', res);
    transports[ transport.sessionId ] = transport;
    res.on("close", () => {
        delete transports[ transport.sessionId ];
    });
    await server.connect(transport);
});

app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId;
    const transport = transports[ sessionId ];
    if (transport) {
        await transport.handlePostMessage(req, res);
    } else {
        res.status(400).send('No transport found for sessionId');
    }
});

app.listen(3001, () => {
    console.log("Server is running on http://localhost:3001");
});