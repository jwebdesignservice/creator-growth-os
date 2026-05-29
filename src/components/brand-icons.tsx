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

export function SnapchatIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn(className)}
      fill="currentColor"
      aria-hidden
    >
      <path d="M12.166 3c.622 0 2.633.173 3.583 2.297.32.714.247 1.926.188 2.9l-.003.06c-.007.103-.013.2-.018.295.047.026.144.06.31.06.248-.01.544-.09.88-.236a.69.69 0 0 1 .29-.064c.107 0 .214.02.311.06l.005.002c.27.096.45.288.453.5.004.27-.252.503-.757.703-.06.024-.137.05-.218.077-.292.097-.734.245-.854.528-.062.146-.038.337.073.567l.004.008c.038.08.94 1.96 2.769 2.262.144.024.247.151.24.297a.39.39 0 0 1-.03.135c-.143.336-.749.582-1.852.752-.037.05-.075.236-.1.36-.024.114-.048.232-.084.356-.043.149-.149.222-.314.222h-.014c-.118 0-.283-.026-.49-.067-.298-.06-.667-.131-1.125-.131-.27 0-.549.022-.827.067-.541.09-.996.413-1.523.787-.757.537-1.614 1.145-2.919 1.145l-.124-.003-.087.003c-1.305 0-2.162-.608-2.918-1.144-.528-.375-.983-.698-1.524-.788a5.094 5.094 0 0 0-.827-.067c-.458 0-.827.077-1.124.135-.207.04-.372.063-.49.063h-.014c-.165 0-.27-.073-.314-.222a4.272 4.272 0 0 1-.084-.356c-.025-.124-.062-.31-.1-.36-1.103-.17-1.709-.416-1.852-.752a.39.39 0 0 1-.03-.135.297.297 0 0 1 .24-.297c1.83-.302 2.731-2.182 2.769-2.262l.004-.008c.111-.23.135-.421.073-.567-.12-.283-.562-.43-.854-.528-.081-.027-.157-.053-.218-.077-.66-.26-.785-.535-.752-.726.044-.24.355-.4.61-.4a.69.69 0 0 1 .29.06c.337.146.633.226.88.236.166 0 .264-.034.31-.06a8.598 8.598 0 0 1-.017-.295l-.003-.06c-.06-.972-.132-2.184.188-2.898C9.533 3.173 11.544 3 12.166 3Z" />
    </svg>
  );
}

export function LinkedinIcon({ className, size = 16 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={cn(className)}
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
