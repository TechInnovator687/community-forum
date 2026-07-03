"use client";

import type { AbstractIntlMessages } from "next-intl";
import type { ReactNode } from "react";
import { DemoUserProvider, IntlProvider, QueryProvider, ThemeProvider } from "@/components/providers";

type AppProvidersProps = {
  children: ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
  timeZone: string;
};

export function AppProviders({ children, locale, messages, timeZone }: AppProvidersProps) {
  return (
    <IntlProvider locale={locale} messages={messages} timeZone={timeZone}>
      <ThemeProvider>
        <QueryProvider>
          <DemoUserProvider>{children}</DemoUserProvider>
        </QueryProvider>
      </ThemeProvider>
    </IntlProvider>
  );
}
