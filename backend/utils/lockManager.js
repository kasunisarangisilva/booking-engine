/**
 * In-Memory Keyed Async Mutex Lock Manager
 * Ensures that concurrent operations targeting the same key (e.g., listingId)
 * are executed sequentially (atomically) to prevent race conditions and double bookings.
 */
class LockManager {
    constructor() {
        this.locks = new Map();
    }

    /**
     * Acquires a lock for a given key. Returns a release function.
     * @param {string} key 
     * @returns {Promise<Function>} release function
     */
    async acquire(key) {
        let currentLock = this.locks.get(key);
        let releaseNext;

        const nextLockPromise = new Promise(resolve => {
            releaseNext = resolve;
        });

        if (currentLock) {
            // Queue behind the existing promise chain
            const previousLock = currentLock;
            this.locks.set(key, previousLock.then(() => nextLockPromise));
            await previousLock;
        } else {
            // First in line for this key
            this.locks.set(key, nextLockPromise);
        }

        // Return release callback
        return () => {
            releaseNext();
            // Clean up memory if no other requests are queued behind this one
            if (this.locks.get(key) === nextLockPromise) {
                this.locks.delete(key);
            }
        };
    }

    /**
     * Helper to wrap an async task within a lock for the specified key
     * @param {string} key 
     * @param {Function} asyncFn 
     */
    async runWithLock(key, asyncFn) {
        const release = await this.acquire(key);
        try {
            return await asyncFn();
        } finally {
            release();
        }
    }
}

module.exports = new LockManager();
