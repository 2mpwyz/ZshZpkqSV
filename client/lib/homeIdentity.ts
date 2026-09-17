export type HomeRole = "guest" | "manager" | "service_provider";

export interface HomeIdentity {
  role: HomeRole;
  displayName: string;
}

const HOME_IDENTITY_KEY = "sheraton-home-identity";

export const getCachedHomeIdentity = (): HomeIdentity | null => {
  try {
    const cached = localStorage.getItem(HOME_IDENTITY_KEY);
    if (!cached) return null;

    const identity = JSON.parse(cached) as HomeIdentity;
    if (!identity.role || !identity.displayName) return null;
    return identity;
  } catch {
    return null;
  }
};

export const cacheHomeIdentity = (identity: HomeIdentity) => {
  localStorage.setItem(HOME_IDENTITY_KEY, JSON.stringify(identity));
};

export const clearCachedHomeIdentity = () => {
  localStorage.removeItem(HOME_IDENTITY_KEY);
};
