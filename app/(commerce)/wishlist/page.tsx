import { redirect } from "next/navigation";

/** Redirect legacy /wishlist to /account/wishlist */
export default function WishlistRedirect() {
    redirect("/account/wishlist");
}
