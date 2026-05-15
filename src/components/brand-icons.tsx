import { cn } from "@/lib/cn";

type IconProps = {
  className?: string;
  size?: number;
};

export function InstagramIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn(className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TiktokIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn(className)}
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.5 6.6c-1.6-.4-2.9-1.5-3.6-3H13v11.3a2.7 2.7 0 1 1-2.7-2.7c.3 0 .6 0 .9.1V9.5a5.7 5.7 0 1 0 4.9 5.6V9.7a8 8 0 0 0 3.4 1Z" />
    </svg>
  );
}

export function YoutubeIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn(className)}
      fill="currentColor"
      aria-hidden
    >
      <path d="M22.5 7a3 3 0 0 0-2.1-2.1C18.5 4.5 12 4.5 12 4.5s-6.5 0-8.4.4A3 3 0 0 0 1.5 7C1 8.9 1 12 1 12s0 3.1.5 5a3 3 0 0 0 2.1 2.1c1.9.4 8.4.4 8.4.4s6.5 0 8.4-.4A3 3 0 0 0 22.5 17c.5-1.9.5-5 .5-5s0-3.1-.5-5ZM10 15.5v-7l6 3.5-6 3.5Z" />
    </svg>
  );
}
