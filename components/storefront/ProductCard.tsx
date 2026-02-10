import { Button } from "@/components/ui/button";
import { WishlistButton } from "./WishlistButton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import { Box } from "lucide-react";

interface iAppProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    discountPercentage: number;
    modelUrl?: string | null;
  };
  priority?: boolean;
}

export function ProductCard({ item, priority = false }: iAppProps) {
  return (
    <div className="rounded-lg h-full flex flex-col">
      <Carousel className="w-full mx-auto">
        <CarouselContent>
          {item.images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[330px] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900/20">
                <Image
                  src={image}
                  alt={item.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover object-center w-full h-full"
                  priority={priority && index === 0}
                />
                {item.discountPercentage > 0 && (
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                    -{item.discountPercentage}%
                  </div>
                )}
                <div className="absolute top-2 left-2 z-10">
                  <WishlistButton productId={item.id} />
                </div>
                {!!item.modelUrl && (
                  <Badge
                    variant="secondary"
                    className="absolute bottom-2 left-2 z-10 bg-black/60 text-white border-white/10"
                  >
                    <Box className="h-3 w-3" />
                    3D
                  </Badge>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="ml-16" />
        <CarouselNext className="mr-16" />
      </Carousel>

      <div className="flex justify-between items-center mt-2">
        <h1 className="font-semibold text-xl">{item.name}</h1>
        <div className="flex flex-col items-end">
          <h3 className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/10">
            ${item.discountPercentage > 0 ? Math.round(item.price * (1 - item.discountPercentage / 100)) : item.price}
          </h3>
          {item.discountPercentage > 0 && (
            <span className="text-xs text-gray-500 line-through">${item.price}</span>
          )}
        </div>
      </div>
      <p className="text-gray-600 text-sm mt-2 line-clamp-2">
        {item.description}
      </p>

      <div className="w-full mt-auto pt-4">
        <div className="flex gap-2 w-full mt-auto pt-4">
          <Button asChild className="w-full flex-1">
            <Link href={`/store/product/${item.id}`} prefetch={false}>Learn More!</Link>
          </Button>
          <Button asChild variant="secondary" className="w-1/3">
            <Link href={`/store/try-on?productId=${item.id}`} prefetch={false}>Try On</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function LoadingProductCard() {
  return (
    <div className="flex flex-col">
      <Skeleton className="w-full h-[330px]" />
      <div className="flex flex-col mt-2 gap-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="w-full h-6" />
      </div>
      <Skeleton className="w-full h-10 mt-5" />
    </div>
  );
}