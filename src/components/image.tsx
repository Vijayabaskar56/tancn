import { Image as UnImage } from "@unpic/react";
import type { ImgHTMLAttributes } from "react";

interface ImageProps
	extends Omit<ImgHTMLAttributes<HTMLImageElement>, "srcSet"> {
	src: string;
	alt: string;
	width: number;
	height: number;
	quality?: number;
	priority?: boolean;
	blur?: number;
}

export function Image({
	src,
	alt,
	width,
	height,
	quality = 75,
	priority = false,
	blur = 0,
	loading,
	decoding = "async",
	className,
	...props
}: ImageProps) {
	return (
		<UnImage
			src={src}
			alt={alt}
			width={width}
			height={height}
			loading={priority ? "eager" : loading || "lazy"}
			decoding={decoding}
			className={className}
			cdn="cloudflare"
			options={{
				cloudflare: {
					domain: "tancn.dev",
				},
			}}
			operations={{
				cloudflare: {
					width: width,
					height: height,
					quality: quality,
					format: "auto",
					blur: blur,
				},
			}}
			{...props}
		/>
	);
}

interface ThemeImageProps extends Omit<ImageProps, "src"> {
	lightSrc: string;
	darkSrc: string;
}

export function ThemeImage({ lightSrc, darkSrc, ...props }: ThemeImageProps) {
	const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const src = isDark ? darkSrc : lightSrc;

	return <Image src={src} {...props} />;
}
