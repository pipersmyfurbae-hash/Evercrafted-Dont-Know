import assert from 'node:assert/strict';
import { createRateLimiter } from '../services/rateLimiter';

type TestCase = { name: string; run: () => void };
const cases: TestCase[] = [];
function test(name: string, run: () => void): void {
  cases.push({ name, run });
}

function makeReqRes(ip: string) {
  const req = { ip } as any;
  let statusCode = 200;
  let body: unknown;
  const res = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(payload: unknown) {
      body = payload;
      return res;
    },
  } as any;
  return { req, res, getStatus: () => statusCode, getBody: () => body };
}

test('allows requests under the limit', () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 3 });
  let nextCalls = 0;
  const next = () => { nextCalls += 1; };

  for (let i = 0; i < 3; i += 1) {
    const { req, res } = makeReqRes('1.2.3.4');
    limiter(req, res, next);
  }

  assert.equal(nextCalls, 3);
});

test('blocks the request once the limit is exceeded, with 429', () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 2 });
  let nextCalls = 0;
  const next = () => { nextCalls += 1; };

  for (let i = 0; i < 2; i += 1) {
    const { req, res } = makeReqRes('5.6.7.8');
    limiter(req, res, next);
  }

  const blocked = makeReqRes('5.6.7.8');
  limiter(blocked.req, blocked.res, next);

  assert.equal(nextCalls, 2);
  assert.equal(blocked.getStatus(), 429);
});

test('tracks each IP independently', () => {
  const limiter = createRateLimiter({ windowMs: 60_000, max: 1 });
  let nextCalls = 0;
  const next = () => { nextCalls += 1; };

  const a = makeReqRes('10.0.0.1');
  limiter(a.req, a.res, next);
  const b = makeReqRes('10.0.0.2');
  limiter(b.req, b.res, next);

  assert.equal(nextCalls, 2);
  assert.equal(a.getStatus(), 200);
  assert.equal(b.getStatus(), 200);
});

let passed = 0;
for (const { name, run } of cases) {
  try {
    run();
    passed += 1;
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}
console.log(`\n${passed} rate limiter tests passed.`);
