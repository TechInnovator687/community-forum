import type { Metadata } from "next";
import { getLocale, getMessages, getTimeZone } from "next-intl/server";
import { AppProviders } from "@/app/providers";
import { THEME_INIT_SCRIPT } from "@/components/providers/ThemeProvider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Community Forum",
  description: "Community forum application shell",
  icons: {
    icon: "/favicon.svg"
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const timeZone = await getTimeZone();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <AppProviders locale={locale} messages={messages} timeZone={timeZone}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
