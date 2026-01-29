import { SeerrSection } from "../../components/seerr-section";
import { SeerrMediaItem } from "../../types/seerr";

interface DiscoverWidgetsProps {
  recentlyAdded: SeerrMediaItem[];
  trending: SeerrMediaItem[];
}

export function DiscoverWidgets({
  recentlyAdded,
  trending,
}: DiscoverWidgetsProps) {
  return (
    <div className="space-y-8">
      {recentlyAdded.length > 0 && (
        <SeerrSection sectionName="Recently Added" items={recentlyAdded} />
      )}

      {trending.length > 0 && (
        <SeerrSection sectionName="Trending" items={trending} />
      )}
    </div>
  );
}
