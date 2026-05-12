"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";

interface SplitTextRevealProps {
    text: string;
    className?: string;
    delay?: number;
    stagger?: number;
    type?: "words" | "chars";
    once?: boolean;
    style?: React.CSSProperties;
}

export function SplitTextReveal({
    text,
    className = "",
    delay = 0,
    stagger = 0.03,
    type = "words",
    once = true,
    style,
}: SplitTextRevealProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, margin: "-10%" });

    const items = type === "words" ? text.split(" ") : text.split("");

    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: stagger, delayChildren: delay * i },
        }),
    };

    const child = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 20,
                stiffness: 100,
            },
        },
        hidden: {
            opacity: 0,
            y: "120%",
        },
    };

    return (
        <motion.div
            ref={ref}
            variants={container}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className={className}
            style={{ display: "flex", flexWrap: "wrap", ...style }}
        >
            {items.map((item, index) => (
                <span
                    key={index}
                    style={{
                        overflow: "hidden",
                        display: "inline-block",
                        paddingRight: type === "words" ? "0.25em" : "0",
                    }}
                >
                    <motion.span
                        variants={child}
                        style={{ display: "inline-block" }}
                        className="pb-1" // Ensure descenders don't get cut off
                    >
                        {item === " " ? "\u00A0" : item}
                    </motion.span>
                </span>
            ))}
        </motion.div>
    );
}
