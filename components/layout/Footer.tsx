import { CurrencyService } from "@/modules/currency/currency.service";
import { FooterClient } from "./FooterClient";

/** Server wrapper: fetches currency then delegates all rendering to FooterClient */
export default async function Footer() {
    const currentCurrency = await CurrencyService.getCurrency();
    return <FooterClient currentCurrency={currentCurrency} />;
}
