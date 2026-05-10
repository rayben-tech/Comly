import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function makeRedis() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = makeRedis();

export const auditRatelimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 h"), analytics: false })
  : null;

export const generalRatelimit = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, "1 h"), analytics: false })
  : null;

export function getIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "anonymous"
  );
}

export async function checkRateLimit(
  key: string,
  type: "audit" | "general" = "general"
): Promise<boolean> {
  const limiter = type === "audit" ? auditRatelimit : generalRatelimit;
  if (!limiter) return true;
  try {
    const { success } = await limiter.limit(key);
    return success;
  } catch {
    return true;
  }
}
