"use client";

import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_DEMO_USER, DEMO_USER_LIST, type DemoUser } from "@/constants";

type DemoUserContextValue = {
  user: DemoUser;
  users: DemoUser[];
  setUserId: (userId: string) => void;
};

const DemoUserContext = createContext<DemoUserContextValue | null>(null);

type DemoUserProviderProps = {
  children: ReactNode;
};

export function DemoUserProvider({ children }: DemoUserProviderProps) {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string>(DEFAULT_DEMO_USER.userId);

  const user = useMemo(
    () => DEMO_USER_LIST.find((candidate) => candidate.userId === userId) ?? DEFAULT_DEMO_USER,
    [userId],
  );

  const switchUser = useCallback(
    (nextUserId: string) => {
      setUserId(nextUserId);
      // Every query key includes the active auth, so switching identities
      // makes previously cached queries stale/inactive on their own. We also
      // force an explicit invalidation so anything currently on screen
      // refetches immediately under the new identity instead of waiting for
      // its next natural refetch trigger.
      void queryClient.invalidateQueries();
    },
    [queryClient],
  );

  const value = useMemo(() => ({ user, users: DEMO_USER_LIST, setUserId: switchUser }), [user, switchUser]);

  return <DemoUserContext.Provider value={value}>{children}</DemoUserContext.Provider>;
}

export function useDemoUser() {
  const context = useContext(DemoUserContext);

  if (!context) {
    throw new Error("useDemoUser must be used within a DemoUserProvider");
  }

  return context;
}
