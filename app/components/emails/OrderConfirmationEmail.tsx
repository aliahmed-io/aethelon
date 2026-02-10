import {
    Body,
    Container,
    Column,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Row,
    Section,
    Text,
    Tailwind,
} from "@react-email/components";
import * as React from "react";

interface OrderConfirmationEmailProps {
    firstName: string;
    orderId: string;
    orderDate: string;
    shippingAddress: any;
    items: any[];
}

export const OrderConfirmationEmail = ({
    firstName,
    orderId,
    orderDate,
    items,
}: OrderConfirmationEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Your Velorum Geneve Order Confirmation</Preview>
            <Tailwind>
                <Body className="bg-white font-sans text-stone-900 antialiased">
                    <Container className="mx-auto my-[40px] w-[560px] rounded border border-[#E5E5E5] p-0 shadow-sm">
                        <Section className="px-[32px] py-[32px]">
                            <Heading className="m-0 text-[24px] font-bold leading-[32px] tracking-tight text-stone-900">
                                Order Confirmation
                            </Heading>
                            <Text className="mt-[8px] text-[16px] leading-[24px] text-stone-500">
                                Thank you for your purchase, {firstName}. We&apos;ve received your order and representives are preparing it for shipment.
                            </Text>
                        </Section>
                        <Hr className="border-[#E5E5E5] my-0 mx-0 w-full" />
                        <Section className="px-[32px] py-[32px]">
                            <Row>
                                <Column>
                                    <Text className="m-0 text-[12px] font-semibold uppercase tracking-wider text-stone-500">
                                        Order Number
                                    </Text>
                                    <Text className="mt-[4px] text-[16px] font-medium text-stone-900">
                                        {orderId}
                                    </Text>
                                </Column>
                                <Column align="right">
                                    <Text className="m-0 text-[12px] font-semibold uppercase tracking-wider text-stone-500">
                                        Order Date
                                    </Text>
                                    <Text className="mt-[4px] text-[16px] font-medium text-stone-900">
                                        {orderDate}
                                    </Text>
                                </Column>
                            </Row>
                        </Section>
                        <Hr className="border-[#E5E5E5] my-0 mx-0 w-full" />
                        <Section className="px-[32px] py-[32px]">
                            <Text className="m-0 mb-4 text-[12px] font-semibold uppercase tracking-wider text-stone-500">
                                Items
                            </Text>
                            {items && items.map((item, index) => (
                                <Row key={index} className="mb-4 last:mb-0">
                                    <Column>
                                        <Text className="m-0 text-[14px] font-medium text-stone-900">
                                            {item.name} x {item.quantity}
                                        </Text>
                                        <Text className="m-0 text-[12px] text-stone-500">
                                            Size: {item.size}
                                        </Text>
                                    </Column>
                                </Row>
                            ))}
                        </Section>
                        <Hr className="border-[#E5E5E5] my-0 mx-0 w-full" />
                        <Section className="px-[32px] py-[32px] bg-stone-50 rounded-b">
                            <Text className="text-[12px] text-stone-500 text-center">
                                If you have any questions, reply to this email or verify your order status on your account dashboard.
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default OrderConfirmationEmail;
