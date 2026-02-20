export interface VisualizerProduct {
    id: string;
    name: string;
    price: number;
    images: string[];
    modelUrl: string;
    usdzUrl: string | null;
    categories: { id: string; name: string }[];
}

export interface RoomPreset {
    id: string;
    label: string;
    src: string;
    alt: string;
}

/** Curated room presets — hosted on Unsplash (configured in next.config.ts) */
export const ROOM_PRESETS: RoomPreset[] = [
    {
        id: "modern-living",
        label: "Modern Living Room",
        src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=2612",
        alt: "Bright modern living room with neutral tones and large windows",
    },
    {
        id: "minimalist-bedroom",
        label: "Minimalist Bedroom",
        src: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=2560",
        alt: "Clean minimalist bedroom with white walls and wooden floor",
    },
    {
        id: "open-office",
        label: "Open Office",
        src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=2569",
        alt: "Contemporary open office space with natural lighting",
    },
];

export type LightingMode = "day" | "night" | "studio";

export interface VisualizerState {
    selectedProduct: VisualizerProduct | null;
    roomBackground: RoomPreset | null;
    customRoomUrl: string | null;
    lightingMode: LightingMode;
    modelScale: number;
}
