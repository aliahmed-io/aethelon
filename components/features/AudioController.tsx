"use client";

import useSound from "use-sound";
import { useEffect } from "react";

export default function AudioController() {
    // We assume these files exist in /public/assets/audio/
    // Since we don't have them, this is a placeholder structure
    // that won't break the app but will work if files are added.

    // Volume state for fade in (removed unused state)

    // Drone Ambience
    const [playDrone, { stop: stopDrone }] = useSound("/assets/audio/drone.mp3", {
        loop: true,
        volume: 0.15,
        interrupt: true,
    });

    useEffect(() => {
        // Start drone on user interaction (browser policy)
        const startAudio = () => {
            playDrone();
            window.removeEventListener("click", startAudio);
            window.removeEventListener("scroll", startAudio);
        };

        window.addEventListener("click", startAudio);
        window.addEventListener("scroll", startAudio);

        return () => stopDrone();
    }, [playDrone, stopDrone]);

    return null; // Logic only component
}
