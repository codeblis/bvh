function hashGradient(slug: string) {
	let hash = 0;
	for (const character of slug) {
		hash = (hash * 31 + character.charCodeAt(0)) | 0;
	}
	const angle = Math.abs(hash % 360);
	const hue1 = Math.abs((hash * 7) % 360);
	const hue2 = (hue1 + 40 + Math.abs((hash * 13) % 60)) % 360;
	return `linear-gradient(${angle}deg, oklch(0.55 0.09 ${hue1}), oklch(0.35 0.06 ${hue2}))`;
}

export function ArticleCover({
	slug,
	src,
	alt,
	className = "aspect-video w-full",
}: {
	slug: string;
	src?: string;
	alt?: string;
	className?: string;
}) {
	return (
		<div
			className={`relative overflow-hidden ${className}`}
			style={src ? undefined : { background: hashGradient(slug) }}
		>
			{src ? (
				// biome-ignore lint/performance/noImgElement: Storage host is configured at runtime.
				<img
					src={src}
					alt={alt ?? ""}
					width={1280}
					height={720}
					className="h-full w-full object-cover"
				/>
			) : null}
		</div>
	);
}
