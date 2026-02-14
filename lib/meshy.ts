import axios from "axios";
import logger from "@/lib/logger";

const MESHY_API_KEY = process.env.MESHY_API_KEY;

if (!MESHY_API_KEY) {
    // We'll log a warning but not throw immediately to allow build, 
    // as user promised to add key later.
    logger.warn("MESHY_API_KEY is missing from environment variables.");
}

const client = axios.create({
    baseURL: "https://api.meshy.ai/openapi/v1",
    headers: {
        Authorization: `Bearer ${MESHY_API_KEY}`,
    },
});

const PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL;

const DEFAULT_TEXTURE_PROMPT = `Create a highly realistic 3D replica of the shoe shown in the reference images.

Style:
- Photorealistic
- Real-world proportions
- Not stylized, not cartoon

Model requirements:
- Game-ready and optimized for real-time rendering
- Low to medium polygon count
- Clean topology, no unnecessary subdivisions
- No interior geometry that is not visible

Materials & textures:
- Physically Based Rendering (PBR)
- Single UV set
- Single texture set
- Texture resolution max 2048x2048

Output requirements:
- Final file size optimized for web use (target under 20MB)
- Output format: GLB (preferred) or GLTF
- Suitable for e-commerce product visualization`;

export async function createMeshyTask(imageUrls: string[]) {
    try {
        const texturePrompt = (process.env.MESHY_TEXTURE_PROMPT || DEFAULT_TEXTURE_PROMPT).slice(0, 600);
        const payload: any = {
            image_urls: imageUrls.slice(0, 4),
            topology: "triangle",
            target_polycount: Number(process.env.MESHY_TARGET_POLYCOUNT || 20000),
            should_remesh: true,
            should_texture: true,
            save_pre_remeshed_model: true,
            enable_pbr: true,
            texture_prompt: texturePrompt,
        };

        if (PUBLIC_APP_URL) {
            payload.webhook_url = `${PUBLIC_APP_URL}/api/webhooks/meshy`;
        }

        const response = await client.post("/multi-image-to-3d", payload);
        const data = response.data as any;
        const taskId = data?.taskId || data?.task_id || data?.id || data?.result;
        return { ...data, taskId };
    } catch (error) {
        logger.error({ err: error }, "Error creating Meshy task");
        throw error;
    }
}

export async function getMeshyTask(taskId: string) {
    try {
        const response = await client.get(`/multi-image-to-3d/${taskId}`);
        return response.data;
    } catch (error) {
        logger.error({ err: error }, "Error getting Meshy task");
        throw error;
    }
}
