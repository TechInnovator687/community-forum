import type { ReactNode } from "react";
import { Container } from "../AppLayout/primitives/container";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="grid min-h-dvh place-items-center bg-background py-10">
      <Container className="max-w-md">{children}</Container>
    </main>
  );
}
