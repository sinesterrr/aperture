import { SeerrSection } from "../../components/seerr-section";
import { SeerrRequestSection } from "../../components/seerr-request-section";
import { SeerrMediaItem, SeerrRequestItem } from "../../types/seerr";

interface DiscoverWidgetsProps {
  recentlyAdded: SeerrMediaItem[];
  recentRequests: SeerrRequestItem[];
  trending: SeerrMediaItem[];
  popularMovies: SeerrMediaItem[];
  popularTv: SeerrMediaItem[];
}

export function DiscoverWidgets({
  recentlyAdded,
  recentRequests,
  trending,
  popularMovies,
  popularTv,
}: DiscoverWidgetsProps) {
  return (
    <div className="space-y-8">
      {recentlyAdded.length > 0 && (
        <SeerrSection sectionName="Recently Added" items={recentlyAdded} />
      )}

      {recentRequests.length > 0 && (
        <SeerrRequestSection
          sectionName="Recent Requests"
          items={recentRequests}
        />
      )}

      {trending.length > 0 && (
        <SeerrSection sectionName="Trending" items={trending} />
      )}

      {popularMovies.length > 0 && (
        <SeerrSection sectionName="Popular Movies" items={popularMovies} />
      )}

      {popularTv.length > 0 && (
        <SeerrSection sectionName="Popular TV Shows" items={popularTv} />
      )}
    </div>
  );
}
