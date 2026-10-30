/**
 * Self-scheduling poller.
 *
 * Why not setInterval:
 * - an interval fires again even when the previous request is still running;
 * - it keeps firing while the browser tab is hidden;
 * - it cannot back off after a temporary error.
 *
 * The poller is deliberately dependency-free so it can be unit-tested with an
 * injected scheduler.
 */

export function nextPollDelay({ attempt, failed }) {
    if (failed) {
        return Math.min(30000, 5000 * (2 ** Math.min(attempt, 3)));
    }
    return Math.min(15000, 5000 + (attempt * 3000));
}

/**
 * @param {{
 *   task: () => Promise<boolean|void>,
 *   delayFor?: (state: {attempt: number, failed: boolean}) => number,
 *   initialDelayMs?: number,
 *   maxDurationMs?: number,
 *   now?: () => number,
 *   setTimeoutFn?: typeof setTimeout,
 *   clearTimeoutFn?: typeof clearTimeout,
 *   onError?: (error: any) => void
 * }} options
 */
export function createPoller({
    task,
    delayFor = nextPollDelay,
    initialDelayMs = 5000,
    maxDurationMs = 0,
    now = () => Date.now(),
    setTimeoutFn = setTimeout,
    clearTimeoutFn = clearTimeout,
    onError,
}) {
    let stopped = false;
    let paused = false;
    let running = false;
    let timer = null;
    let attempt = 0;
    let startedAt = 0;

    const clear = () => {
        if (timer !== null) {
            clearTimeoutFn(timer);
            timer = null;
        }
    };

    const schedule = (delayMs) => {
        if (stopped || paused) return;
        clear();
        timer = setTimeoutFn(tick, Math.max(0, delayMs));
    };

    const tick = async () => {
        timer = null;
        if (stopped || paused || running) return;

        if (maxDurationMs > 0 && now() - startedAt >= maxDurationMs) {
            stop();
            return;
        }

        running = true;
        let shouldStop = false;
        let failed = false;

        try {
            const result = await task();
            if (result === false) shouldStop = true;
        } catch (error) {
            failed = true;
            if (onError) onError(error);
        } finally {
            running = false;
        }

        if (stopped) return;
        if (shouldStop) {
            stop();
            return;
        }

        attempt += 1;
        schedule(delayFor({ attempt, failed }));
    };

    function start() {
        if (stopped || running || timer !== null) return;
        startedAt = now();
        schedule(initialDelayMs);
    }

    function stop() {
        stopped = true;
        paused = false;
        clear();
    }

    function pause() {
        if (stopped || paused) return;
        paused = true;
        clear();
    }

    function resume() {
        if (stopped || !paused) return;
        paused = false;
        schedule(0);
    }

    function runNow() {
        if (stopped || running) return;
        clear();
        schedule(0);
    }

    return {
        start,
        stop,
        pause,
        resume,
        runNow,
        isRunning: () => running,
    };
}
