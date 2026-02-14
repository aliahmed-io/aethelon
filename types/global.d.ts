declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "model-viewer": Record<string, unknown>;
        }
    }
}

export {};
