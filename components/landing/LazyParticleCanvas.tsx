'use client';

import dynamic from 'next/dynamic';

const ParticleCanvas = dynamic(() => import('./ParticleCanvas'), {
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-background z-0" />,
});

export default function LazyParticleCanvas() {
    return <ParticleCanvas />;
}
