import * as React from "react";
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Tailwind,
} from "@react-email/components";

interface DeliveryEmailProps {
    orderId: string;
}

export const DeliveryEmail = ({ orderId }: DeliveryEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Your Aethelon Geneve Order has been Delivered!</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans text-stone-900">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[32px] w-[560px] shadow-sm">
                        <Heading className="text-[24px] font-bold text-center m-0 mb-[24px]">
                            Order Delivered
                        </Heading>
                        <Text className="text-[16px] leading-[24px] text-stone-500 mb-4">
                            Great news! Your order has been delivered to your shipping address.
                        </Text>
                        <Section className="bg-stone-50 p-4 rounded mb-4 border border-stone-100">
                            <Text className="text-[14px] m-0">
                                <strong>Order ID:</strong> {orderId}
                            </Text>
                        </Section>
                        <Text className="text-[16px] leading-[24px] text-stone-500">
                            We hope you enjoy your new timepiece. Thank you for choosing Aethelon Geneve.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default DeliveryEmail;
