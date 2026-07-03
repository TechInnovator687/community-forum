import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale =
    requested && locales.includes(requested as (typeof locales)[number]) ? requested : defaultLocale;
  const messages = (await import(`../locales/${locale}.json`)) as {
    default: IntlMessages;
  };

  return {
    locale,
    messages: messages.default,
    timeZone: "UTC"
  };
});
