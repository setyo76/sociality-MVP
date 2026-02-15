"use client";

import { Provider } from "react-redux";
import { makeStore } from "@/store"; // Import makeStore

export default function Providers({ children }: { children: React.ReactNode }) {
  // Pastikan store instance dibuat sekali saja
  const store = makeStore();

  return <Provider store={store}>{children}</Provider>;
}