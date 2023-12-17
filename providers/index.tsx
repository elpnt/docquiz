import { Toaster } from "sonner";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Toaster duration={5000} />
      {children}
    </>
  );
};
