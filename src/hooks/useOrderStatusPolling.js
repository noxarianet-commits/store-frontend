import { useEffect, useRef } from 'react';
import api from '../api';
import { createPoller } from '../utils/poller';

const TERMINAL_STATUSES = new Set(['COMPLETED', 'FAILED', 'CANCELLED']);
const TERMINAL_HTTP_STATUSES = new Set([401, 403, 404]);

/**
 * Poll order status without overlapping requests.
 *
 * - pauses while the tab is hidden;
 * - polls immediately when the tab becomes visible again;
 * - backs off on temporary errors;
 * - stops on terminal order status or terminal HTTP errors (404/401/403);
 * - aborts the in-flight request on unmount.
 */
export function useOrderStatusPolling({
    orderId,
    enabled = true,
    onUpdate,
    onError,
    maxDurationMs = 35 * 60 * 1000,
    initialDelayMs = 5000,
}) {
    const onUpdateRef = useRef(onUpdate);
    const onErrorRef = useRef(onError);

    useEffect(() => {
        onUpdateRef.current = onUpdate;
    }, [onUpdate]);

    useEffect(() => {
        onErrorRef.current = onError;
    }, [onError]);

    useEffect(() => {
        if (!enabled || !orderId) return undefined;

        let poller = null;
        let activeController = null;

        const handleError = (error) => {
            if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') return;

            const status = error?.response?.status;
            if (TERMINAL_HTTP_STATUSES.has(status)) {
                poller?.stop();
            }

            if (onErrorRef.current) onErrorRef.current(error);
        };

        poller = createPoller({
            initialDelayMs,
            maxDurationMs,
            task: async () => {
                activeController = new AbortController();
                const res = await api.getPaymentStatus(orderId, {
                    signal: activeController.signal,
                });
                activeController = null;

                const data = res.data?.data;
                if (!data) return true;

                if (onUpdateRef.current) onUpdateRef.current(data);
                return !TERMINAL_STATUSES.has(data.status);
            },
            onError: handleError,
        });

        const handleVisibility = () => {
            if (document.hidden) poller.pause();
            else poller.resume();
        };

        document.addEventListener('visibilitychange', handleVisibility);
        poller.start();
        if (document.hidden) poller.pause();

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            if (activeController) activeController.abort();
            poller.stop();
        };
    }, [orderId, enabled, initialDelayMs, maxDurationMs]);
}
