import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { dashboardLoadingAtom } from "../../lib/atoms";
import { fetchVirtualFolders } from "../../actions/media";
import { VirtualFolderInfo } from "@jellyfin/sdk/lib/generated-client/models";

export default function LibrariesPage() {
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const [libraries, setLibraries] = useState<VirtualFolderInfo[]>([]);

  useEffect(() => {
    async function fetchLibraries() {
      try {
        setDashboardLoading(true);
        const libraryResult = await fetchVirtualFolders();
        setLibraries(libraryResult ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        setDashboardLoading(false);
      }
    }
    fetchLibraries();
  }, [setDashboardLoading]);

  console.log(libraries);

  return <div>Libraries</div>;
}
