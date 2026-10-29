import { EllipsisVertical, Lock, Trash, Unlock } from "lucide-react";
import { AlbumsDTO } from "../types/files.types";
import { ChangeEvent, SyntheticEvent, useState } from "react";
import {
  SetAlbumPassword,
  UnlockDeleteAlbumWithPassword,
} from "../services/createAlbum.service";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";

interface FolderAlbumProps {
  data: AlbumsDTO;
  handleRefresh: (value: boolean) => void;
}

export default function FolderAlbum({ data, handleRefresh }: FolderAlbumProps) {
  const router = useRouter();

  const [PasswordModel, setPasswordModel] = useState<boolean>(false);
  // display enter password
  const [authModel, setAuthModel] = useState({ isOpen: false, mode: "hello" });

  const handleOpenAndCLoseSetPasswordModel = () => {
    setPasswordModel((prev) => !prev);
  };

  const handleOpenAndCLosePasswordModel = (type: string) => {
    setAuthModel((prev) => ({
      ...prev,
      isOpen: !prev.isOpen,
      mode: type,
    }));
  };

  const handleAlbumOpen = () => {
    if (!data.isLocked) {
      router.push(`/album/${data._id}`);
    } else {
      // open the enter password model
      handleOpenAndCLosePasswordModel("OPEN");
    }
  };

  return (
    <div className="group w-full max-w-45 sm:max-w-50 cursor-pointer relative">
      <SetPasswordModel
        albumData={data}
        passwordModelOpen={PasswordModel}
        openAndCloseModel={handleOpenAndCLoseSetPasswordModel}
        handleRefresh={handleRefresh}
      />

      <EnterAndClearPasswordModel
        albumData={data}
        passwordModelOpen={authModel}
        openAndCloseModel={handleOpenAndCLosePasswordModel}
      />

      {/* Folder */}

      <div
        onClick={handleAlbumOpen}
        className={`
          relative
          aspect-4/3
          rounded-xl
         ${data.isLocked ? `bg-gray-600` : `bg-green-200`}
          shadow-lg
          transition-all duration-200
          group-hover:-translate-y-1
          group-hover:shadow-xl
        `}
      >
        {/* Folder tab */}
        <div
          className={`
            absolute
            -top-3 left-4
            h-7 w-16
            rounded-t-xl
               ${data.isLocked ? `bg-gray-600` : `bg-green-200`}
          `}
        />
      </div>
      {/* This is lock and unlock password so this album*/}

      <div className="absolute inset-y-0 right-3 z-10  items-center gap-1 h-fit flex-row flex">
        <FolderControl
          data={data}
          handleOpenAndCLoseSetPasswordModel={
            handleOpenAndCLoseSetPasswordModel
          }
          handleOpenAndCLosePasswordModel={handleOpenAndCLosePasswordModel}
        />
      </div>
      {/* Name */}
      <div className="mt-3">
        <h3
          className="
            truncate
            text-sm sm:text-base
            font-semibold
            text-gray-800
          "
        >
          {data?.albumName}
        </h3>

        {
          <p className="text-xs sm:text-sm text-gray-500">
            {data.numberOfItems > 1
              ? `${data.numberOfItems} Files`
              : `${data.numberOfItems} File`}
          </p>
        }
      </div>
    </div>
  );
}

interface FolderControlProps {
  data: AlbumsDTO;
  handleOpenAndCLoseSetPasswordModel: () => void;
  handleOpenAndCLosePasswordModel: (value: string) => void;
}

function FolderControl({
  data,
  handleOpenAndCLoseSetPasswordModel,
  handleOpenAndCLosePasswordModel,
}: FolderControlProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleOpenFolder = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      <div className="relative">
        {/* Ellipsis */}
        <div
          onClick={handleOpenFolder}
          className={`rounded-xl p-1 bg-white text-green-400 shadow-sm
      transition-all duration-200
      ${isOpen ? "opacity-0 scale-0 pointer-events-none" : "opacity-100 scale-100"}
      hover:scale-110 hover:bg-amber-50 hover:shadow-md
    `}
        >
          <EllipsisVertical size={16} strokeWidth={2.5} />
        </div>

        {/* Menu */}
        <div
          className={`absolute top-0 right-0 flex flex-col bg-white
      justify-center items-center p-1
      transition-all duration-100
      ${
        isOpen
          ? "opacity-100 scale-100"
          : "opacity-0 scale-0 pointer-events-none"
      }
    `}
        >
          {!data.isLocked && (
            <div
              onClick={handleOpenAndCLoseSetPasswordModel}
              className="p-1 text-green-400 shadow-sm transition-all duration-200
          hover:scale-110 hover:bg-amber-50 hover:shadow-md"
            >
              <Unlock size={16} strokeWidth={2.5} />
            </div>
          )}

          {data.isLocked && (
            <div
              onClick={() => handleOpenAndCLosePasswordModel("CLEAR")}
              className="p-1 text-orange-500 shadow-sm transition-all duration-200
          hover:scale-110 hover:bg-amber-50 hover:shadow-md"
            >
              <Lock size={16} strokeWidth={2.5} />
            </div>
          )}

          <div
            onClick={() => handleOpenAndCLosePasswordModel("DELETE")}
            className="p-1 text-red-600 shadow-sm transition-all duration-200
        hover:scale-110 hover:bg-amber-50 hover:shadow-md"
          >
            <Trash size={16} strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </>
  );
}

interface SetPasswordInterface {
  password: string;
  confirmPassword: string;
}

interface SetPasswordModelProps {
  albumData: AlbumsDTO;
  passwordModelOpen: boolean;
  openAndCloseModel: () => void;
  handleRefresh: (value: boolean) => void;
}

function SetPasswordModel({
  albumData,
  passwordModelOpen,
  openAndCloseModel,
  handleRefresh,
}: SetPasswordModelProps) {
  // USE CONTEXT.. CONTAINS USER INFO
  const { user, setUser } = useUser();

  const [password, setPassword] = useState<SetPasswordInterface>({
    password: "",
    confirmPassword: "",
  });
  const [apiResponse, setApiResponse] = useState<string>();

  const onHandleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setPassword((prev) => ({ ...prev, [id]: value }));
  };

  const handleOnAlbumPasswordCreate = async (
    e: SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!albumData._id) return;

    const response = await SetAlbumPassword(
      albumData._id,
      password.password,
      password.confirmPassword,
    );

    if (response.code !== 201) {
      setApiResponse(response.message);
    } else {
      // update album we set to be locked
      const updatedAlbums =
        albumData.type === "Images"
          ? user?.photoAlbums.map((album) =>
              album._id === albumData._id
                ? { ...album, isLocked: true }
                : album,
            )
          : user?.videoAlbums.map((album) =>
              album._id === albumData._id
                ? { ...album, isLocked: true }
                : album,
            );

      if (!updatedAlbums) return null;

      // then update the user data
      setUser((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          ...(albumData.type === "Images"
            ? { photoAlbums: updatedAlbums }
            : { videoAlbums: updatedAlbums }),
        };
      });
      openAndCloseModel();
      handleRefresh(true);
    }
  };

  const isMatch =
    password.password != null
      ? password.password == password.confirmPassword
        ? true
        : false
      : false;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 ${passwordModelOpen ? "opacity-100 scale-100" : "opacity-0 scale-0"} transition-all duration-200`}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800">Set Password</h2>

        <p className="mt-2 text-sm text-gray-500">
          Create a password for your account.
        </p>

        <form onSubmit={handleOnAlbumPasswordCreate} className="mt-6 space-y-4">
          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>

            <input
              required
              onChange={onHandleChange}
              value={password.password}
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-xl border text-gray-700 border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-100"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Confirm Password
            </label>

            <input
              required
              onChange={onHandleChange}
              value={password.confirmPassword}
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="w-full rounded-xl border  text-gray-700 border-gray-200 bg-gray-50 px-4 py-3 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-100"
            />
          </div>

          {isMatch && (
            <button className="mt-6 w-full rounded-xl bg-lime-500 px-4 py-3 font-semibold text-white transition hover:bg-lime-600 active:scale-[0.98]">
              Set Password
            </button>
          )}
        </form>

        {!isMatch && (
          <p className="mt-2 text-sm text-red-500">Password does not match</p>
        )}

        <button
          onClick={openAndCloseModel}
          type="button"
          className="mt-3 w-full rounded-xl bg-gray-100 px-4 py-3 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-200 hover:shadow-sm active:scale-[0.98]"
        >
          Cancel
        </button>

        <p className="text-red-500 font-light">{apiResponse}</p>
      </div>
    </div>
  );
}

interface EnterPasswordModelProps {
  albumData: AlbumsDTO;
  passwordModelOpen: {
    isOpen: boolean;
    mode: string;
  };
  openAndCloseModel: (mode: string) => void;
}

// this includes enter , clear password  and delet album as well
function EnterAndClearPasswordModel({
  albumData,
  passwordModelOpen,
  openAndCloseModel,
}: EnterPasswordModelProps) {
  const router = useRouter();

  // we will update the user data here..{Specifically User album update}
  const { user, setUser } = useUser();

  const [password, setPassword] = useState("");
  const [apiResponse, setApiResponse] = useState<string>();

  const handleOnPasswordSubmit = async (
    e: SyntheticEvent<HTMLFormElement>,
    methodType: string,
  ) => {
    e.preventDefault();
    if (!albumData._id) return;

    const response = await UnlockDeleteAlbumWithPassword(
      albumData._id,
      password,
      methodType,
      albumData.type,
    );

    if (response.code !== 201) {
      setApiResponse(response.message);
    } else {
      if (methodType !== "DELETE") {
        router.push(`/album/${albumData._id}`);
      }
      // handle diffrenet type of method if api reponse works
      switch (methodType) {
        case "DELETE":
          const updatedFileAlbum =
            albumData.type === "Images"
              ? user?.photoAlbums.filter(
                  (albums) => albums?._id != albumData._id,
                )
              : user?.videoAlbums.filter(
                  (albums) => albums?._id != albumData._id,
                );

          if (!updatedFileAlbum) return null;
          setUser((prev) => {
            if (!prev) return null;

            return {
              ...prev,
              ...(albumData.type === "Images"
                ? { photoAlbums: updatedFileAlbum }
                : { videoAlbums: updatedFileAlbum }),
            };
          });
          break;

        // we find the album which password has been cleared...
        // then we update it
        case "CLEAR":
          const updateAlbum = user?.photoAlbums.map((albums) =>
            albums._id === albumData._id
              ? { ...albums, isLocked: false }
              : albums,
          );
          if (!updateAlbum) return null;

          setUser((userData) => {
            if (!userData) return null;

            return { ...userData, photoAlbums: updateAlbum };
          });
          break;
      }

      // refresh the page... not reload
      router.refresh();
      openAndCloseModel("CLOSE");
    }
  };

  const getPasswordModelTitle = (mode: string) => {
    switch (mode) {
      case "DELETE":
        return "Delete Album";

      case "CLEAR":
        return "Clear Password";

      case "OPEN":
        return "Unlock Album";

      default:
        return "";
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 ${
        passwordModelOpen.isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
      } transition-all duration-200`}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800">
          {passwordModelOpen.mode === "DELETE"
            ? "Delete Album"
            : "Album Locked 🔒"}
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Enter the password to{" "}
          {passwordModelOpen.mode === "CLEAR"
            ? "remove the password from this album."
            : passwordModelOpen.mode === "DELETE"
              ? "delete this album."
              : "unlock this album."}
        </p>

        {passwordModelOpen.mode === "DELETE" && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <strong>Note:</strong> Deleting this album will also delete all
            photos inside it. You can recover the album and its photos from the
            Trash.
          </p>
        )}

        <form
          onSubmit={(e) =>
            handleOnPasswordSubmit(
              e,
              passwordModelOpen.mode === "CLEAR"
                ? "CLEAR"
                : passwordModelOpen.mode === "DELETE"
                  ? "DELETE"
                  : "OPEN",
            )
          }
          className="mt-6 space-y-4"
        >
          {/* Password */}
          {albumData.isLocked && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                required
                autoFocus
                onChange={(e) => {
                  setPassword(e.target.value);
                  setApiResponse(undefined);
                }}
                value={password}
                type="password"
                placeholder="Enter album password"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-100"
              />
            </div>
          )}

          {/* API Error */}
          {apiResponse && albumData.isLocked && (
            <p className="text-sm text-red-500">{apiResponse}</p>
          )}

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-lime-500 px-4 py-3 font-semibold text-white transition hover:bg-lime-600 active:scale-[0.98]"
          >
            {getPasswordModelTitle(passwordModelOpen.mode)}
          </button>
        </form>

        <button
          onClick={() => openAndCloseModel("close")}
          type="button"
          className="mt-3 w-full rounded-xl bg-gray-100 px-4 py-3 font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-200 hover:shadow-sm active:scale-[0.98]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
