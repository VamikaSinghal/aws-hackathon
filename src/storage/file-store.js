import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const statePath = process.env.ADAPTIVE_HEALTH_STATE_PATH || "./data/adaptive-health-state.json";
const tableName = process.env.AWS_DYNAMODB_TABLE || "";
const userId = process.env.ADAPTIVE_HEALTH_USER_ID || "demo-user";

// Lambda best practice: construct the client once outside the request path, reused across
// invocations in the same execution environment.
const docClient = tableName
  ? DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION || "us-west-2" }), {
      marshallOptions: { removeUndefinedValues: true }
    })
  : null;

export async function readState() {
  if (docClient) {
    const { Item } = await docClient.send(new GetCommand({ TableName: tableName, Key: { userId } }));
    return Item ? Item.state : null;
  }

  try {
    const raw = await readFile(statePath, "utf8");
    return JSON.parse(raw);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function writeState(state) {
  if (docClient) {
    await docClient.send(
      new PutCommand({ TableName: tableName, Item: { userId, state, updatedAt: new Date().toISOString() } })
    );
    return;
  }

  await mkdir(path.dirname(statePath), { recursive: true });
  await writeFile(statePath, JSON.stringify(state, null, 2));
}

