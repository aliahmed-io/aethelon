
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
    Img,
    Link,
} from "@react-email/components";

interface BroadcastEmailProps {
    subject: string;
    message: string;
    imageUrl?: string;
    recipientEmail?: string;
}

export const BroadcastEmail = ({ subject, message, imageUrl, recipientEmail }: BroadcastEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>{subject}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans text-stone-900">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[32px] w-[560px] shadow-sm">
                        {imageUrl && (
                            <Section className="mb-[24px]">
                                <Img
                                    src={imageUrl}
                                    alt="Announcement"
                                    className="w-full h-auto rounded-sm object-cover border border-stone-200"
                                    width="560"
                                    height="300"
                                />
                            </Section>
                        )}
                        <Heading className="text-[24px] font-bold text-center m-0 mb-[24px] text-stone-900 leading-tight">
                            {subject}
                        </Heading>
                        <Text className="text-[16px] leading-[26px] text-stone-600 whitespace-pre-wrap">
                            {message}
                        </Text>
                        <Section className="text-center mt-[40px] pt-[24px] border-t border-stone-100">
                            <Text className="text-stone-400 text-[12px] leading-[20px] uppercase tracking-wider">
                                Aethelon Geneve Announcement
                            </Text>
                            {recipientEmail && (
                                <Text className="text-stone-400 text-[11px] leading-[20px] mt-2">
                                    <Link
                                        href={`${process.env.NEXT_PUBLIC_URL || ""}/newsletter/unsubscribe?email=${encodeURIComponent(
                                            recipientEmail
                                        )}`}
                                        className="text-stone-500 underline decoration-stone-300 hover:text-stone-900"
                                    >
                                        Unsubscribe
                                    </Link>
                                </Text>
                            )}
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default BroadcastEmail;
