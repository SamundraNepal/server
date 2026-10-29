import { cookies } from "next/headers";
import AdministrationPage from "./administration";
import { GetAdminData } from "@/app/services/auth.service";

export default async function page() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  // api call get images data
  const adminData = await GetAdminData(authToken);

  return <AdministrationPage users={adminData.message} />;
}
