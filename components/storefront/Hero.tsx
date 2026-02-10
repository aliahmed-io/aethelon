import prisma from "@/lib/db";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { unstable_cache } from "next/cache";

async function getData() {
  try {
    const data = await unstable_cache(
      async () => {
        return await prisma.banner.findMany({
          orderBy: {
            createdAt: "desc",
          },
        });
      },
      ["banners"],
      { revalidate: 3600 }
    )();

    return data;
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}

export async function Hero() {
  const data = await getData();

  return (
    <Carousel className="mx-auto max-w-7xl">
      <CarouselContent>
        {data.map((item, index) => (
          <CarouselItem key={item.id}>
            <div className="relative h-[60vh] lg:h-[80vh] max-h-[800px]">
              <Image
                alt={item.title}
                src={item.imageString}
                fill
                priority={index === 0}
                className="object-cover w-full h-full rounded-xl"
              />
              <div className="absolute top-6 left-6 bg-opacity-75 bg-black text-white p-6 rounded-xl shadow-lg transition-transform hover:scale-105">
                <h1 className="text-xl lg:text-4xl font-bold">{item.title}</h1>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="ml-16" />
      <CarouselNext className="mr-16" />
    </Carousel>
  );
}