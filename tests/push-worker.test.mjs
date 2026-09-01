import assert from 'node:assert/strict';
import test from 'node:test';
import {
  deleteDeadSubscription,
  processDueReminders,
} from '../docs/notifications/reference/worker.js';

class MemoryKv {
  constructor(values = {}) {
    this.values = new Map(Object.entries(values));
  }
  async get(key, type) {
    const value = this.values.get(key);
    return type === 'json' && value ? JSON.parse(value) : value;
  }
  async put(key, value) {
    this.values.set(key, value);
  }
  async delete(key) {
    this.values.delete(key);
  }
  async list({ prefix }) {
    return {
      keys: [...this.values.keys()]
        .filter((key) => key.startsWith(prefix))
        .map((name) => ({ name })),
      list_complete: true,
    };
  }
}

test('dead subscription cleanup removes subscription and owned reminders', async () => {
  const store = new MemoryKv({
    'subscription:sub1': '{}',
    'reminder:sub1:a:1': '{}',
    'reminder:sub1:b:2': '{}',
    'subscription:sub2': '{}',
  });
  const removed = await deleteDeadSubscription(store, 'sub1');
  assert.equal(removed, 2);
  assert.equal(store.values.has('subscription:sub1'), false);
  assert.equal(store.values.has('subscription:sub2'), true);
});

test('scheduled run deletes orphan reminder and returns secret-free counters', async () => {
  const now = new Date('2026-08-31T12:00:00.000Z');
  const reminderKey = 'reminder:missing:type:id';
  const reminder = { subscriptionId: 'missing', fireAt: '2026-08-31T12:00:00.000Z' };
  const store = new MemoryKv({
    'due:2026-08-31T12:00': JSON.stringify({ keys: [reminderKey] }),
    [reminderKey]: JSON.stringify(reminder),
  });
  const originalLog = console.log;
  let log = '';
  console.log = (value) => {
    log = value;
  };
  try {
    const counters = await processDueReminders({ PUSH_STORE: store, APP_ID: 'test-app' }, { now });
    assert.deepEqual(counters, {
      due: 1,
      sent: 0,
      failed: 0,
      deadSubscriptionsDeleted: 0,
      orphanRemindersDeleted: 1,
    });
    assert.equal(store.values.has(reminderKey), false);
    assert.doesNotMatch(log, /endpoint|p256dh|auth|payload/i);
  } finally {
    console.log = originalLog;
  }
});

test('404/410 push response deletes dead subscription and reminders', async () => {
  const now = new Date('2026-08-31T12:00:00.000Z');
  const reminderKey = 'reminder:sub1:type:id';
  const store = new MemoryKv({
    'due:2026-08-31T12:00': JSON.stringify({ keys: [reminderKey] }),
    [reminderKey]: JSON.stringify({ subscriptionId: 'sub1', fireAt: now.toISOString() }),
    'subscription:sub1': JSON.stringify({ subscription: { endpoint: 'https://push.invalid' } }),
  });
  const error = Object.assign(new Error('gone'), { status: 410 });
  const originalLog = console.log;
  console.log = () => {};
  try {
    const counters = await processDueReminders(
      { PUSH_STORE: store, APP_ID: 'test-app' },
      {
        now,
        sendWebPush: async () => {
          throw error;
        },
      }
    );
    assert.equal(counters.deadSubscriptionsDeleted, 1);
    assert.equal(counters.orphanRemindersDeleted, 1);
    assert.equal(store.values.has('subscription:sub1'), false);
    assert.equal(store.values.has(reminderKey), false);
  } finally {
    console.log = originalLog;
  }
});
