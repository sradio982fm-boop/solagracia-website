import { parseFocalUrl } from "@/lib/focal-point";
import { sanitizeAssetSrc } from "@/lib/security";

type SmartImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src"
> & {
  src: string | null | undefined;
};

/**
 * Drop-in `<img>` replacement that honours a focal point encoded in the URL
 * (see `lib/focal-point`). Combine with an `object-cover` class so the chosen
 * subject stays visible regardless of the container's aspect ratio.
 *
 * Asset URLs from CMS are sanitized so `javascript:` / `data:` payloads
 * never reach `src`.
 */
export function SmartImage({ src, style, ...rest }: SmartImageProps) {
  const { cleanUrl, objectPosition } = parseFocalUrl(src);
  const safeSrc = sanitizeAssetSrc(cleanUrl);
  if (!safeSrc) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={safeSrc} style={{ objectPosition, ...style }} {...rest} />
  );
}
