"use client";
import { Image, Settings, Trash, UserStar, Video } from "lucide-react";
import { useRouter } from "next/navigation";

interface FolderCardsProps {
  type: number;
  folderName: string;
}

export default function FolderCards({ type, folderName }: FolderCardsProps) {
  // call the use context here

  const router = useRouter();

  const openFOlder = () => {
    router.push(`/${folderName}`);
  };

  return (
    <div
      onClick={openFOlder}
      className="ring-2 ring-lime-100 shadow-2xl p-2 sm:p-20 rounded-2xl uppercase flex flex-col justify-center 
      items-center text-lime-500 cursor-pointer hover:text-lime-300 hover:rotate-y-30 transition-all duration-500"
    >
      <h1>{folderName}</h1>
      {type == 0 && <Image size={50} />}
      {type == 1 && <Video size={50} />}
      {type == 2 && <Trash size={50} />}
      {type == 3 && <Settings size={50} />}
      {type == 4 && <UserStar size={50} />}
    </div>
  );
}
