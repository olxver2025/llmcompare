import { orgColor } from "@/lib/org-colors";
import { MONO_ORG_ICONS, orgIconSlug } from "@/lib/org-icons";
import { cn } from "@/lib/utils";

const SIZE = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
} as const;

export function OrgIcon({
  organization,
  size = "md",
  className,
}: {
  organization: string;
  size?: keyof typeof SIZE | number;
  className?: string;
}) {
  const px = typeof size === "number" ? size : SIZE[size];
  const slug = orgIconSlug(organization);

  if (!slug) {
    const initial = organization.trim().charAt(0).toUpperCase() || "?";
    return (
      <span
        aria-hidden
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-[3px] font-mono font-semibold text-white",
          className
        )}
        style={{
          width: px,
          height: px,
          fontSize: Math.max(9, Math.round(px * 0.55)),
          backgroundColor: orgColor(organization),
        }}
      >
        {initial}
      </span>
    );
  }

  const src = `/org-icons/${slug}.svg`;

  if (MONO_ORG_ICONS.has(slug)) {
    return (
      <span
        role="img"
        aria-label={organization}
        className={cn("inline-block shrink-0 bg-foreground", className)}
        style={{
          width: px,
          height: px,
          mask: `url(${src}) center / contain no-repeat`,
          WebkitMask: `url(${src}) center / contain no-repeat`,
        }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- local static SVG brand marks
    <img
      src={src}
      alt=""
      width={px}
      height={px}
      className={cn("inline-block shrink-0 object-contain", className)}
      aria-hidden
    />
  );
}
