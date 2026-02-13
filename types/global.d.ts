import * as React from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                src?: string;
                poster?: string;
                alt?: string;
                'camera-controls'?: boolean;
                'auto-rotate'?: boolean;
                ar?: boolean;
                'ar-modes'?: string;
                'ios-src'?: string;
                loading?: 'auto' | 'lazy' | 'eager';
                reveal?: 'auto' | 'interaction' | 'manual';
                'shadow-intensity'?: string;
                'ar-scale'?: string;
                'ar-placement'?: string;
                exposure?: string;
                'shadow-softness'?: string;
                'environment-image'?: string;
                'skybox-image'?: string;
                [key: string]: unknown;
            };
        }
    }
}

export { };
