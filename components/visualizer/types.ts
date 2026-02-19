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
        src: "https://images.unsplash.com/photo-1595246140625-573b715d11fc?q=80&w=2612&auto=format&fit=crop",
        alt: "Bright modern living room with neutral tones and large windows",
    },
    {
        id: "minimalist-bedroom",
        label: "Minimalist Bedroom",
        src: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=2560&auto=format&fit=crop",
        alt: "Clean minimalist bedroom with white walls and wooden floor",
    },
    {
        id: "open-office",
        label: "Open Office",
        src: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2569&auto=format&fit=crop",
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
