import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { dashboardLoadingAtom } from "../../../lib/atoms";
import {
  CountryInfo,
  CultureDto,
} from "@jellyfin/sdk/lib/generated-client/models";
import { fetchCountries, fetchCultures } from "../../../actions/utils";

export default function AddLibraryPage() {
  const setDashboardLoading = useSetAtom(dashboardLoadingAtom);
  const [cultures, setCultures] = useState<CultureDto[]>([]);
  const [countries, setCountries] = useState<CountryInfo[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setDashboardLoading(true);
      try {
        const [culturesData, countriesData] = await Promise.all([
          fetchCultures(),
          fetchCountries(),
        ]);
        setCultures(culturesData);
        setCountries(countriesData);
      } catch (error) {
        console.error(error);
      } finally {
        setDashboardLoading(false);
      }
    };
    loadData();
  }, [setDashboardLoading]);

  return <div>AddLibraryPage</div>;
}
