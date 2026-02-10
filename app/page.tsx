import ScrollController from "./components/ScrollController";
import SpecsGrid from "./components/SpecsGrid";
import HeritageSection from "./components/HeritageSection";
import GalleryGrid from "./components/GalleryGrid";
import Footer from "./components/Footer";

export default function Home() {
    return (
        <main>
            <ScrollController />
            <SpecsGrid />
            <HeritageSection />
            <GalleryGrid />
            <Footer />
        </main>
    );
}
