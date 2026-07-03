"use client";

import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import type { ReactNode } from "react";

type IntlProviderProps = {
  children: ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
  timeZone: string;
};

export function IntlProvider({ children, locale, messages, timeZone }: IntlProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
      {children}
    </NextIntlClientProvider>
  );
}
