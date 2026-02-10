/* eslint-disable @next/next/no-head-element */
import * as React from "react";

interface OrderDeliveredEmailProps {
    customerName: string;
    orderNumber: string;
    deliveryDate: string;
    items: { name: string; quantity: number }[];
    reviewLink: string;
}

export function OrderDeliveredEmail({
    customerName,
    orderNumber,
    deliveryDate,
    items,
    reviewLink,
}: OrderDeliveredEmailProps) {
    return (
        <html>
            <head>
                <meta charSet="UTF-8" />
            </head>
            <body style={{
                fontFamily: "'Helvetica Neue', Arial, sans-serif",
                backgroundColor: "#050505",
                color: "#ffffff",
                margin: 0,
                padding: "40px 20px"
            }}>
                <div style={{
                    maxWidth: "600px",
                    margin: "0 auto",
                    backgroundColor: "#0A0A0C",
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "40px"
                }}>
                    {/* Header */}
                    <div style={{ textAlign: "center", marginBottom: "40px" }}>
                        <h1 style={{
                            fontSize: "14px",
                            letterSpacing: "0.2em",
                            fontWeight: "bold",
                            margin: 0
                        }}>
                            AETHELON GENEVE
                        </h1>
                    </div>

                    {/* Main Content */}
                    <div style={{ marginBottom: "32px" }}>
                        <h2 style={{
                            fontSize: "24px",
                            fontWeight: 300,
                            letterSpacing: "-0.02em",
                            marginBottom: "16px"
                        }}>
                            Your Order Has Arrived
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", lineHeight: "1.6" }}>
                            Dear {customerName}, your order #{orderNumber} was delivered on {deliveryDate}.
                        </p>
                    </div>

                    {/* Items Delivered */}
                    <div style={{
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        padding: "24px",
                        marginBottom: "32px"
                    }}>
                        <p style={{
                            fontSize: "10px",
                            letterSpacing: "0.15em",
                            color: "rgba(255,255,255,0.4)",
                            marginBottom: "16px",
                            textTransform: "uppercase"
                        }}>
                            Items Delivered
                        </p>
                        {items.map((item, i) => (
                            <p key={i} style={{
                                fontSize: "14px",
                                marginBottom: "8px"
                            }}>
                                ✓ {item.name} × {item.quantity}
                            </p>
                        ))}
                    </div>

                    {/* Review CTA */}
                    <div style={{ textAlign: "center", marginBottom: "32px" }}>
                        <p style={{
                            color: "rgba(255,255,255,0.6)",
                            fontSize: "14px",
                            marginBottom: "16px"
                        }}>
                            We&apos;d love to hear about your experience
                        </p>
                        <a
                            href={reviewLink}
                            style={{
                                display: "inline-block",
                                backgroundColor: "#ffffff",
                                color: "#000000",
                                padding: "14px 32px",
                                fontSize: "12px",
                                fontWeight: "bold",
                                letterSpacing: "0.15em",
                                textDecoration: "none",
                                textTransform: "uppercase"
                            }}
                        >
                            Write a Review
                        </a>
                    </div>

                    {/* Footer */}
                    <div style={{
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                        paddingTop: "24px",
                        textAlign: "center"
                    }}>
                        <p style={{
                            fontSize: "10px",
                            letterSpacing: "0.15em",
                            color: "rgba(255,255,255,0.3)",
                            marginBottom: "8px"
                        }}>
                            NEED HELP? REPLY TO THIS EMAIL
                        </p>
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                            © {new Date().getFullYear()} Aethelon Geneve. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
        </html>
    );
}
