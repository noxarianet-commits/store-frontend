import test from 'node:test';
import assert from 'node:assert/strict';

import { createPoller, nextPollDelay } from './poller.js';

function createFakeScheduler() {
    const queue = [];
    let nextId = 1;

    return {
        queue,
        setTimeoutFn(fn) {
            const id = nextId++;
            queue.push({ id, fn });
            return id;
        },
        clearTimeoutFn(id) {
            const index = queue.findIndex(item => item.id === id);
            if (index >= 0) queue.splice(index, 1);
        },
        runNext() {
            const item = queue.shift();
            if (!item) return Promise.resolve();
            return item.fn();
        },
    };
}

const tick = () => new Promise(resolve => setTimeout(resolve, 0));

test('nextPollDelay grows from 8s to a 15s cap', () => {
    assert.equal(nextPollDelay({ attempt: 1, failed: false }), 8000);
    assert.equal(nextPollDelay({ attempt: 2, failed: false }), 11000);
    assert.equal(nextPollDelay({ attempt: 99, failed: false }), 15000);
});

test('nextPollDelay backs off on errors up to 30s', () => {
    assert.equal(nextPollDelay({ attempt: 1, failed: true }), 10000);
    assert.equal(nextPollDelay({ attempt: 2, failed: true }), 20000);
    assert.equal(nextPollDelay({ attempt: 99, failed: true }), 30000);
});

test('poller never runs two tasks concurrently', async () => {
    const scheduler = createFakeScheduler();
    let calls = 0;
    let resolveTask;

    const poller = createPoller({
        task: () => {
            calls += 1;
            return new Promise(resolve => { resolveTask = resolve; });
        },
        initialDelayMs: 0,
        setTimeoutFn: scheduler.setTimeoutFn,
        clearTimeoutFn: scheduler.clearTimeoutFn,
    });

    poller.start();
    assert.equal(scheduler.queue.length, 1);

    const first = scheduler.runNext();
    assert.equal(calls, 1);
    assert.equal(poller.isRunning(), true);

    // A second runNow() while the first request is in flight must be ignored.
    poller.runNow();
    assert.equal(calls, 1);
    assert.equal(scheduler.queue.length, 0);

    resolveTask(true);
    await first;
    await tick();

    assert.equal(scheduler.queue.length, 1);
    poller.stop();
});

test('poller stops on false and clears the timer', async () => {
    const scheduler = createFakeScheduler();
    let calls = 0;

    const poller = createPoller({
        task: async () => {
            calls += 1;
            return false;
        },
        initialDelayMs: 0,
        setTimeoutFn: scheduler.setTimeoutFn,
        clearTimeoutFn: scheduler.clearTimeoutFn,
    });

    poller.start();
    await scheduler.runNext();
    await tick();

    assert.equal(calls, 1);
    assert.equal(scheduler.queue.length, 0);
    poller.stop();
});
