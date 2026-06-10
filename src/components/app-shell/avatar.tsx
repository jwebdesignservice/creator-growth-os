export function Avatar({
  name,
  src,
  size = 36,
}: {
  name: string;
  src?: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
     
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover bg-cream-200"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-rose-200 text-rose-700 font-semibold inline-flex items-center justify-center"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
      }}
    >
      {initials || "?"}
    </div>
  );
}
