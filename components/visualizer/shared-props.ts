import type {
    VisualizerProduct,
    RoomPreset,
    LightingMode,
} from "@/components/visualizer/types";

export interface VisualizerSharedProps {
    products: VisualizerProduct[];
    allProducts: VisualizerProduct[];
    selectedProduct: VisualizerProduct | null;
    setSelectedProduct: (product: VisualizerProduct | null) => void;
    roomBackground: RoomPreset;
    setRoomBackground: (preset: RoomPreset) => void;
    activeRoomUrl: string;
    customRoomUrl: string | null;
    handleRoomUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    lightingMode: LightingMode;
    setLightingMode: (mode: LightingMode) => void;
    modelScale: number;
    setModelScale: (scale: number) => void;
    categories: { id: string; name: string }[];
    categoryFilter: string | null;
    setCategoryFilter: (id: string | null) => void;
    // AI Analysis
    isAnalyzing: boolean;
    analysisResult: {
        placementAdvice: string;
        lightingMode: "day" | "night" | "studio";
        styleCompatibility: number;
        colorHarmony: string;
    } | null;
    onApplyAiSettings: () => void;
}
