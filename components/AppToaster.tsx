"use client";

import { Toaster } from "react-hot-toast";

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        error: {
          duration: 5000
        },
        style: {
          border: "1px solid #000000",
          color: "#000000",
          fontWeight: 700
        }
      }}
    />
  );
}
