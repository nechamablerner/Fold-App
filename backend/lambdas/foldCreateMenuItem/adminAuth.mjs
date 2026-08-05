function normalizeGroups(rawGroups) {
  if (!rawGroups) return [];

  // Common shapes:
  // - Array: ["Admin"]
  // - String: "Admin"
  // - String with brackets: "[Admin]" or "[Admin,Users]"
  if (typeof rawGroups === "string") {
    let s = rawGroups.trim();
    if (s.startsWith("[") && s.endsWith("]")) {
      s = s.slice(1, -1);
    }
    return s
      .split(",")
      .map((g) =>
        g
          .replace(/['"\[\]]/g, "")
          .trim()
          .toLowerCase(),
      )
      .filter(Boolean);
  }

  const groups = Array.isArray(rawGroups) ? rawGroups : [rawGroups];
  return groups
    .filter((group) => typeof group === "string" && group.trim().length > 0)
    .map((group) => group.trim().toLowerCase());
}

export function isAdminFromClaims(claims = {}) {
  const groups = normalizeGroups(
    claims["cognito:groups"] ?? claims.groups ?? claims["cognito:group"] ?? [],
  );

  return groups.some((group) => group === "admin" || group === "admins");
}

export function getAdminStatusFromEvent(event) {
  const claims = event?.requestContext?.authorizer?.jwt?.claims || {};
  return isAdminFromClaims(claims);
}
