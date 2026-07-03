import { SavedPostsTemplate } from "@/components/templates";
import { getPaginationFromSearch, type SearchPagination } from "@/lib/utils/PaginationSearch";

type SavedPageProps = {
  searchParams: Promise<SearchPagination>;
};

export default async function SavedPage({ searchParams }: SavedPageProps) {
  const query = await searchParams;

  return <SavedPostsTemplate pagination={getPaginationFromSearch(query)} />;
}
