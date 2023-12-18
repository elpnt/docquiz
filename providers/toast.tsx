import { Toaster } from "sonner";

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Toaster duration={5000} position="top-center" richColors />
      {children}
    </>
  );
};
