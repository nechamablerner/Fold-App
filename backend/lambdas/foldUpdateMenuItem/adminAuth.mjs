function normalizeGroups(rawGroups) {
  if (!rawGroups) return [];

  const groups = Array.isArray(rawGroups) ? rawGroups : [rawGroups];
  return groups
    .filter((group) => typeof group === "string" && group.trim().length > 0)
    .map((group) => group.trim().toLowerCase());
}

function decodeJwtPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64Payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64Payload.padEnd(
      base64Payload.length + ((4 - (base64Payload.length % 4)) % 4),
      "=",
    );

    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch (error) {
    return null;
  }
}

export function isAdminFromClaims(claims = {}) {
  const groups = normalizeGroups(
    claims["cognito:groups"] ?? claims.groups ?? claims["cognito:group"] ?? [],
  );

  return groups.some((group) => group === "admin" || group === "admins");
}

export function getAdminStatusFromEvent(event) {
  const claims =
    event?.requestContext?.authorizer?.jwt?.claims ||
    event?.requestContext?.authorizer?.claims ||
    {};

  if (isAdminFromClaims(claims)) {
    console.log("Admin check passed from authorizer claims", claims);
    return true;
  }

  const authHeader =
    event?.headers?.authorization || event?.headers?.Authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    return false;
  }

  const decodedClaims = decodeJwtPayload(token);
  console.log("Admin check fallback decode", {
    tokenPreview: token.slice(0, 20),
    decodedClaims,
  });
  return isAdminFromClaims(decodedClaims || {});
}
