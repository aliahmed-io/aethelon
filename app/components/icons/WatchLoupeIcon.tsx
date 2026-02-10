import { type LucideProps } from "lucide-react";

export function WatchLoupeIcon(props: LucideProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            {/* Main Lens Circle */}
            <circle cx="10" cy="10" r="7" />

            {/* Highlight Arc (Reflection) */}
            <path d="M7 7a4 4 0 0 1 4-1.5" />

            {/* Connector Bridge */}
            <path d="M17 10h2" />

            {/* Connector Dot */}
            <circle cx="20" cy="10" r="1.5" fill="currentColor" stroke="none" />

            {/* Hanging Chain (Dots) */}
            <circle cx="20" cy="14" r="1" fill="currentColor" stroke="none" />
            <circle cx="20" cy="17" r="1" fill="currentColor" stroke="none" />
            <circle cx="20" cy="20" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}
