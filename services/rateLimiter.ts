import type { NextFunction, Request, Response } from 'express';

/**
 * Minimal in-process fixed-window rate limiter for public, unauthenticated
 * routes (e.g. POST /api/v1/moodoor/matches, per the migration plan's
 * "rate-limit" requirement for that endpoint).
 *
 * This only limits per-process — it does not share state across multiple
 * server instances behind a load balancer. Fine for a single instance or
 * low-traffic deployment; swap for a shared store (Redis, Firestore) before
 * running more than one instance in production.
 */
export function createRateLimiter(options: { windowMs: number; max: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return function rateLimit(req: Request, res: Response, next: NextFunction) {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    if (entry.count >= options.max) {
      res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
      return;
    }

    entry.count += 1;
    next();
  };
}
