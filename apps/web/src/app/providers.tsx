import type { PropsWithChildren } from "react";

import { SessionProvider } from "../features/session/session-context";

export const AppProviders = ({ children }: PropsWithChildren) => {
  return <SessionProvider>{children}</SessionProvider>;
};
