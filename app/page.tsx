import type { Metadata } from "next";
import { LoreBook } from "./components/LoreBook";

export const metadata: Metadata = {
  title: "OFF/BEAT Brand Guidelines",
  description:
    "The living OFF/BEAT brand book: guidelines, approved assets, and embedded design tools.",
};

export default function Home() {
  return <LoreBook />;
}
