import { cookies } from "next/headers";
import { GetAlbumFiles } from "@/app/services/createAlbum.service";
import Media from "@/app/components/media_display/media";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;
  const { id } = await params;

  const albumData = await GetAlbumFiles(authToken!, id);

  return (
    <Media
      data={albumData?.data.albumFiles}
      mediaType={`Album-${albumData.data.albumData.type}`}
      displayName={albumData?.data.albumData?.albumName}
      albumID={id}
    />
  );
}
