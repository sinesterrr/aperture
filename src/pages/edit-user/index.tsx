import { useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { UsersLayoutContextType } from "../manage-users/layout";

export default function EditUserPage() {
  const { setBreadcrumbLabel } = useOutletContext<UsersLayoutContextType>();

  useEffect(() => {
    setBreadcrumbLabel("Dummy User Name");
  }, []);

  return <div>EditUserPage</div>;
}
