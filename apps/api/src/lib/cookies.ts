export const readCookie = (cookieHeader: string | undefined, name: string): string | undefined => {
  if (!cookieHeader) {
    return undefined;
  }

  const pairs = cookieHeader.split(";");

  for (const pair of pairs) {
    const [rawKey, ...rawValueParts] = pair.trim().split("=");
    if (rawKey !== name) {
      continue;
    }

    const value = rawValueParts.join("=");
    if (!value) {
      return undefined;
    }

    return decodeURIComponent(value);
  }

  return undefined;
};
