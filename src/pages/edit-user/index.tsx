import { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import { UsersLayoutContextType } from "../manage-users/layout";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { getUserById, getUserImageUrl } from "../../actions";
import { UserDto } from "@jellyfin/sdk/lib/generated-client/models";
import ProfileTab from "../../components/profile-tabs/profile";
import AccessTab from "../../components/profile-tabs/access";
import ParentalControlTab from "../../components/profile-tabs/parental-control";
import PasswordTab from "../../components/profile-tabs/password";

const TABS = [
  {
    label: "Profile",
    value: "profile",
    component: <ProfileTab />,
  },
  {
    label: "Access",
    value: "access",
    component: <AccessTab />,
  },
  {
    label: "Parental Control",
    value: "parental-control",
    component: <ParentalControlTab />,
  },
  {
    label: "Password",
    value: "password",
    component: <PasswordTab />,
  },
];

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const { setBreadcrumbLabel } = useOutletContext<UsersLayoutContextType>();
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const userData = await getUserById(id);

        if (userData) {
          setUser(userData);
          setBreadcrumbLabel(userData.Name || `User ${id}`);
        } else {
          setBreadcrumbLabel("User Not Found");
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to load user:", error);
        setBreadcrumbLabel("Error");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, setBreadcrumbLabel]);

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
        {TABS.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="mt-6">
        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            {tab.component}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
