import { TypeSafeClient } from "@typesafe-ai/sdk";

let client: TypeSafeClient | undefined;

export function getJevClient(): TypeSafeClient {
  if (!client) {
    client = new TypeSafeClient();
  }
  return client;
}

export function hasJevApiKey(): boolean {
  return Boolean(process.env.TYPESAFE_API_KEY);
}
