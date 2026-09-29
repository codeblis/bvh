export function getAuthSiteOrigin() {
	const configured = process.env.NEXT_PUBLIC_SITE_URL;
	if (!configured) throw new Error("Missing auth site URL");
	const url = new URL(configured);
	if (
		url.username ||
		url.password ||
		(url.protocol !== "https:" &&
			!(
				url.protocol === "http:" &&
				["localhost", "127.0.0.1"].includes(url.hostname)
			))
	) {
		throw new Error("Invalid auth site URL");
	}
	return url.origin;
}
