/* eslint-disable @next/next/no-head-element */
import * as React from "react";

interface OrderShippedEmailProps {
    customerName: string;
    orderNumber: string;
    trackingNumber: string;
    carrier: string;
    estimatedDelivery: string;
    items: { name: string; quantity: number; price: number }[];
}

export function OrderShippedEmail({
    customerName,
    orderNumber,
    trackingNumber,
    carrier,
    estimatedDelivery,
    items,
}: OrderShippedEmailProps) {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
                            VELORUM GENEVE
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
                            Your Order Has Shipped
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", lineHeight: "1.6" }}>
                            Dear {customerName}, your order #{orderNumber} is on its way.
                        </p>
                    </div>

                    {/* Tracking Info */}
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
                            marginBottom: "8px",
                            textTransform: "uppercase"
                        }}>
                            Tracking Number
                        </p>
                        <p style={{
                            fontSize: "18px",
                            fontWeight: 500,
                            fontFamily: "monospace",
                            marginBottom: "16px"
                        }}>
                            {trackingNumber}
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div>
                                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                                    CARRIER
                                </p>
                                <p style={{ fontSize: "14px" }}>{carrier}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "4px" }}>
                                    EST. DELIVERY
                                </p>
                                <p style={{ fontSize: "14px" }}>{estimatedDelivery}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div style={{ marginBottom: "32px" }}>
                        <p style={{
                            fontSize: "10px",
                            letterSpacing: "0.15em",
                            color: "rgba(255,255,255,0.4)",
                            marginBottom: "16px",
                            textTransform: "uppercase"
                        }}>
                            Order Summary
                        </p>
                        {items.map((item, i) => (
                            <div key={i} style={{
                                display: "flex",
                                justifyContent: "space-between",
                                paddingBottom: "12px",
                                marginBottom: "12px",
                                borderBottom: "1px solid rgba(255,255,255,0.05)"
                            }}>
                                <span style={{ fontSize: "14px" }}>
                                    {item.name} × {item.quantity}
                                </span>
                                <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
                                    ${(item.price / 100).toLocaleString()}
                                </span>
                            </div>
                        ))}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            paddingTop: "12px"
                        }}>
                            <span style={{ fontSize: "14px", fontWeight: 500 }}>Total</span>
                            <span style={{ fontSize: "14px", fontWeight: 500 }}>
                                ${(total / 100).toLocaleString()}
                            </span>
                        </div>
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
                            QUESTIONS? REPLY TO THIS EMAIL
                        </p>
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
                            © {new Date().getFullYear()} Velorum Geneve. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
        </html>
    );
}
