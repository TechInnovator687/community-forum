import { useTranslations } from "next-intl";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/molecules";

const skeletonItems = ["first", "second", "third"];

export function FeedSkeleton() {
  const t = useTranslations("common");

  return (
    <div className="grid animate-pulse gap-4" role="status" aria-label={t("loading")}>
      {skeletonItems.map((item) => (
        <Card key={item} className="overflow-hidden">
          <CardHeader>
            <div className="flex gap-3">
              <div className="size-10 rounded-full bg-muted" />
              <div className="grid flex-1 gap-2">
                <div className="h-5 w-2/3 rounded bg-muted" />
                <div className="h-4 w-1/3 rounded bg-muted" />
              </div>
              <div className="hidden h-6 w-20 shrink-0 rounded-full bg-muted sm:block" />
            </div>
          </CardHeader>
          <CardContent className="grid gap-2">
            <div className="h-4 rounded bg-muted" />
            <div className="h-4 w-5/6 rounded bg-muted" />
          </CardContent>
          <CardFooter className="justify-between">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="flex gap-1">
              <div className="size-9 rounded-md bg-muted" />
              <div className="size-9 rounded-md bg-muted" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
