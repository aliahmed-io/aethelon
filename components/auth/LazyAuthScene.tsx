"use client";

import dynamic from "next/dynamic";

const AuthScene = dynamic(() => import("./AuthScene"), {
    ssr: false,
});

export default function LazyAuthScene() {
    return <AuthScene />;
}
