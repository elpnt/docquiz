import { FaGithub } from "react-icons/fa";

export const Footer = () => (
  <footer className="w-full border-t border-t-foreground/10 p-8 gap-y-4 flex flex-col justify-center items-center">
    <p className="text-sm">
      Made by{" "}
      <a
        href="https://twitter.com/elpntdev"
        target="_blank"
        rel="noreferrer"
        className="underline font-medium"
      >
        Kensuke
      </a>
    </p>
    <a href="https://github.com/elpnt/docquiz" target="_blank" rel="noreferrer">
      <FaGithub className="h-6 w-6 text-neutral-900 hover:text-neutral-700" />
    </a>
  </footer>
);
