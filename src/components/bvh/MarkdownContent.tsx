import type { ReactNode } from "react";

type Block =
	| { kind: "heading"; level: 2 | 3; text: string }
	| { kind: "paragraph"; text: string }
	| { kind: "quote"; text: string }
	| { kind: "list"; ordered: boolean; items: string[] };

function isBlockStart(line: string) {
	return /^(#{2,3})\s+|^>\s+|^[-*]\s+|^\d+\.\s+/.test(line);
}

export function parseMarkdownBlocks(source: string): Block[] {
	const lines = source.replace(/\r\n?/g, "\n").split("\n");
	const blocks: Block[] = [];

	for (let index = 0; index < lines.length; ) {
		const line = lines[index].trim();
		if (!line) {
			index += 1;
			continue;
		}

		const heading = /^(##|###)\s+(.+)$/.exec(line);
		if (heading) {
			blocks.push({
				kind: "heading",
				level: heading[1].length as 2 | 3,
				text: heading[2],
			});
			index += 1;
			continue;
		}

		if (line.startsWith("> ")) {
			blocks.push({ kind: "quote", text: line.slice(2).trim() });
			index += 1;
			continue;
		}

		const unordered = /^[-*]\s+(.+)$/.exec(line);
		const ordered = /^\d+\.\s+(.+)$/.exec(line);
		if (unordered || ordered) {
			const isOrdered = Boolean(ordered);
			const items: string[] = [];
			while (index < lines.length) {
				const candidate = lines[index].trim();
				const match = isOrdered
					? /^\d+\.\s+(.+)$/.exec(candidate)
					: /^[-*]\s+(.+)$/.exec(candidate);
				if (!match) break;
				items.push(match[1]);
				index += 1;
			}
			blocks.push({ kind: "list", ordered: isOrdered, items });
			continue;
		}

		const paragraph: string[] = [line];
		index += 1;
		while (index < lines.length) {
			const candidate = lines[index].trim();
			if (!candidate || isBlockStart(candidate)) break;
			paragraph.push(candidate);
			index += 1;
		}
		blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
	}

	return blocks;
}

function safeHref(value: string) {
	if (value.startsWith("/") || value.startsWith("#")) return value;
	try {
		const url = new URL(value);
		return url.protocol === "http:" || url.protocol === "https:" ? value : null;
	} catch {
		return null;
	}
}

function InlineMarkdown({ text }: { text: string }) {
	const pattern = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
	const nodes: ReactNode[] = [];
	let cursor = 0;

	for (const match of text.matchAll(pattern)) {
		const start = match.index;
		if (start > cursor) nodes.push(text.slice(cursor, start));
		const token = match[0];
		const key = `${start}:${token}`;

		const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
		if (link) {
			const href = safeHref(link[2].trim());
			nodes.push(
				href ? (
					<a
						key={key}
						href={href}
						className="text-primary underline underline-offset-2"
						target={href.startsWith("http") ? "_blank" : undefined}
						rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
					>
						{link[1]}
					</a>
				) : (
					<span key={key}>{link[1]}</span>
				),
			);
		} else if (token.startsWith("**")) {
			nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
		} else if (token.startsWith("`")) {
			nodes.push(
				<code
					key={key}
					className="rounded bg-secondary px-1 py-0.5 text-[0.9em]"
				>
					{token.slice(1, -1)}
				</code>,
			);
		} else {
			nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
		}
		cursor = start + token.length;
	}
	if (cursor < text.length) nodes.push(text.slice(cursor));
	return nodes;
}

export function MarkdownContent({ source }: { source: string }) {
	return (
		<div className="space-y-4 text-[14px] leading-6 text-foreground/80">
			{parseMarkdownBlocks(source).map((block, index) => {
				const key = `${block.kind}:${index}:${"text" in block ? block.text.slice(0, 24) : block.items[0]}`;
				if (block.kind === "heading") {
					return block.level === 2 ? (
						<h2 key={key} className="pt-4 font-serif text-2xl text-foreground">
							<InlineMarkdown text={block.text} />
						</h2>
					) : (
						<h3 key={key} className="pt-2 font-serif text-xl text-foreground">
							<InlineMarkdown text={block.text} />
						</h3>
					);
				}
				if (block.kind === "quote") {
					return (
						<blockquote
							key={key}
							className="border-l-2 border-primary pl-4 italic"
						>
							<InlineMarkdown text={block.text} />
						</blockquote>
					);
				}
				if (block.kind === "list") {
					const Tag = block.ordered ? "ol" : "ul";
					return (
						<Tag
							key={key}
							className={
								block.ordered
									? "list-decimal space-y-1 pl-6"
									: "list-disc space-y-1 pl-6"
							}
						>
							{block.items.map((item) => (
								<li key={item}>
									<InlineMarkdown text={item} />
								</li>
							))}
						</Tag>
					);
				}
				return (
					<p key={key}>
						<InlineMarkdown text={block.text} />
					</p>
				);
			})}
		</div>
	);
}
