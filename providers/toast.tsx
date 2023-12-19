import { Toaster } from "sonner";

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Toaster duration={10000} position="top-center" richColors closeButton />
      {children}
    </>
  );
};
