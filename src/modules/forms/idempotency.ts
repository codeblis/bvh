export function notificationIdempotencyKey(
	reference: string,
	status: string,
	attempts: number,
) {
	if (status === "pending" && attempts === 0) return reference;
	return `${reference}-${attempts + 1}`;
}
