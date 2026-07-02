import type { Metadata } from "next";
import { getLocale, getMessages } from "next-intl/server";
import { AppProviders } from "@/app/providers";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Community Forum",
  description: "Community forum application shell"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <AppProviders locale={locale} messages={messages}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
