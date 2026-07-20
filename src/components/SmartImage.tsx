import { parseFocalUrl } from "@/lib/focal-point";

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
 */
export function SmartImage({ src, style, ...rest }: SmartImageProps) {
  const { cleanUrl, objectPosition } = parseFocalUrl(src);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={cleanUrl} style={{ objectPosition, ...style }} {...rest} />
  );
}
