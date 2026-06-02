/* Avatars ──────────────────────────────────────────────────────────────
   Initial-based, image-based, with status dot, sizes.
   ───────────────────────────────────────────────────────────────────── */

export function AvatarInitial({
  initials = "JW",
  size = "md",
}: {
  initials?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "sm" ? "size-8 text-[12px]" : size === "lg" ? "size-12 text-[15px]" : "size-10 text-[13px]";
  return (
    <span
      className={
        "inline-flex items-center justify-center rounded-full bg-rose-100 text-rose-700 font-semibold " +
        dim
      }
    >
      {initials}
    </span>
  );
}

export function AvatarImage() {
  return (
    <span className="inline-flex items-center justify-center size-10 rounded-full bg-cream-200 text-ink-500 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://api.dicebear.com/9.x/initials/svg?seed=Profluencer"
        alt=""
        className="size-10 object-cover"
      />
    </span>
  );
}

export function AvatarWithStatus() {
  return (
    <span className="relative inline-block">
      <AvatarInitial />
      <span
        aria-hidden
        className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-cream-100"
      />
    </span>
  );
}

export function AvatarGroup() {
  return (
    <div className="flex -space-x-2">
      <AvatarInitial initials="JW" />
      <AvatarInitial initials="AB" />
      <AvatarInitial initials="MJ" />
      <span className="inline-flex items-center justify-center size-10 rounded-full bg-cream-200 text-ink-700 text-[12px] font-semibold ring-2 ring-cream-100">
        +4
      </span>
    </div>
  );
}
