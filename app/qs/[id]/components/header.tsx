import { ExternalLink } from "lucide-react";

type HeaderProps = {
  title: string;
  url: string;
};

export const Header = async ({ title, url }: HeaderProps) => {
  return (
    <div className="border-b pb-4">
      <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:tracking-tight">
        {title}
      </h2>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-2 flex items-center text-sm text-neutral-500 gap-x-1 hover:text-neutral-700"
      >
        <ExternalLink className="h-4 w-4" />
        {url}
      </a>
    </div>
  );
};
