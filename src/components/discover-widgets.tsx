"use client";

import { SeerrSection } from "@/src/components/seerr-section";
import { SeerrRequestSection } from "@/src/components/seerr-request-section";
import { useSeerr } from "@/src/contexts/seerr-context";
import { useSeerrDashboard } from "@/src/hooks/use-seerr-dashboard";

export function DiscoverWidgets() {
  const { recentRequests, canManageRequests } = useSeerr();
  const { recentlyAdded, trending, popularMovies, popularTv } =
    useSeerrDashboard();

  return (
    <div className="space-y-8">
      {recentlyAdded.length > 0 && (
        <SeerrSection sectionName="Recently Added" items={recentlyAdded} />
      )}

      {recentRequests.length > 0 && (
        <SeerrRequestSection
          sectionName="Recent Requests"
          items={recentRequests}
          canManageRequests={canManageRequests}
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
