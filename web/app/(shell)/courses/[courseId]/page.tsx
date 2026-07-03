import { FeedTemplate } from "@/components/templates";
import { getPaginationFromSearch, type SearchPagination } from "@/lib/utils/PaginationSearch";

type CourseFeedPageProps = {
  params: Promise<{
    courseId: string;
  }>;
  searchParams: Promise<SearchPagination>;
};

export default async function CourseFeedPage({ params, searchParams }: CourseFeedPageProps) {
  const [{ courseId }, query] = await Promise.all([params, searchParams]);

  return <FeedTemplate courseId={courseId} pagination={getPaginationFromSearch(query)} />;
}
