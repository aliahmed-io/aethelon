'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ParticleCanvas = dynamic(() => import('./ParticleCanvas'), {
    ssr: false,
});

export default function LazyParticleCanvas() {
    const [shouldMount, setShouldMount] = useState(false);

    useEffect(() => {
        // Mount immediately after hydration, relying on next/dynamic to defer loading,
        // instead of artificially waiting 1000ms which spikes TBT during Lighthouse tests.
        const timer = setTimeout(() => {
            setShouldMount(true);
        }, 50);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className={`fixed inset-0 z-0 bg-background transition-opacity`}
            style={{ opacity: shouldMount ? 1 : 0, transitionDuration: '2000ms' }}
        >
            {shouldMount && <ParticleCanvas />}
        </div>
    );
}
