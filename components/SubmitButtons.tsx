"use client";

import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag } from "lucide-react";
import { useFormStatus } from "react-dom";
import type { ComponentProps } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";

type BaseButtonProps = ComponentProps<typeof Button>;

interface buttonProps extends Omit<BaseButtonProps, "children" | "type"> {
  text: string;
  startIcon?: ReactNode;
  variant?:
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | null
  | undefined;
}

export function SubmitButton({ text, startIcon, variant, ...props }: buttonProps) {
  const { pending } = useFormStatus();
  return (
    <>
      {pending ? (
        <Button disabled variant={variant} {...props}>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please Wait
        </Button>
      ) : (
        <Button variant={variant} type="submit" {...props}>
          {startIcon ? <span className="mr-2 inline-flex">{startIcon}</span> : null}
          {text}
        </Button>
      )}
    </>
  );
}

export function ShoppingBagButton() {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <Button disabled size="lg" className="w-full mt-5">
          <Loader2 className="mr-4 h-5 w-5 animate-spin" /> Please Wait
        </Button>
      ) : (
        <Button size="lg" className="w-full mt-5" type="submit">
          <ShoppingBag className="mr-4 h-5 w-5" /> Add to Cart
        </Button>
      )}
    </>
  );
}

export function DeleteItem() {
  const { pending } = useFormStatus();

  return (
    <>
      {pending ? (
        <button disabled className="font-medium text-primary text-end">
          Removing...
        </button>
      ) : (
        <button type="submit" className="font-medium text-primary text-end">
          Delete
        </button>
      )}
    </>
  );
}

export function CheckoutButton() {
  const router = useRouter();

  const handleCheckout = () => {
    router.push("/store/checkout");
  };

  return (
    <Button onClick={handleCheckout} size="lg" className="w-full mt-5">
      Checkout
    </Button>
  );
}