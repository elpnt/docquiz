"use client";

import { RequestProvider } from "./request-queue";
import { ToastProvider } from "./toast";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProvider>
      <RequestProvider>{children}</RequestProvider>
    </ToastProvider>
  );
};
