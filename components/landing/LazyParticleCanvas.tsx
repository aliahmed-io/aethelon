'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ParticleCanvas = dynamic(() => import('./ParticleCanvas'), {
    ssr: false,
});

export default function LazyParticleCanvas() {
    const [shouldMount, setShouldMount] = useState(false);

    useEffect(() => {
        // Radical performance optimization:
        // By deferring the heavy React Three Fiber WebGL mount by 1000ms,
        // we guarantee the browser paints the texts and Navbar instantly.
        // The canvas will then elegantly fade in from behind.
        const timer = setTimeout(() => {
            setShouldMount(true);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className="fixed inset-0 z-0 bg-background transition-opacity duration-[2000ms]"
            style={{ opacity: shouldMount ? 1 : 0 }}
        >
            {shouldMount && <ParticleCanvas />}
        </div>
    );
}
