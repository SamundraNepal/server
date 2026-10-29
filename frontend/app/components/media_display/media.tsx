"use client";
import AddToAlbum from "@/app/components/addToAlbum";
import FolderAlbum from "@/app/components/albumFolder";
import CreateNewAlbum from "@/app/components/createAlbum";
import DeleteFilesModel from "@/app/components/deleteModel";
import DisplayFiles from "@/app/components/file_display/displayfiles";
import FullScreenImage from "@/app/components/fullscreenImage";
import ToolBar from "@/app/components/toolbar";
import UploadModal from "@/app/components/uploadFiles";
import { useUser } from "@/app/context/UserContext";
import { CreateAlbum } from "@/app/services/createAlbum.service";
import {
  AlbumsDTO,
  FileDataProps,
  MediaResponseDTO,
  UploadingFilesDTO,
} from "@/app/types/files.types";
import { useRouter } from "next/navigation";
import { ChangeEvent, SyntheticEvent, useRef, useState } from "react";
import { MediaPageProps } from "@/app/types/files.types";
import RestoreFilesModel from "../restoreFileModel";
import { InfiniteLoading } from "@/app/services/media.data.service";
import {
  GetInfiniteSearchFiles,
  GetSearchFilesNormal as GetSearchFilesNormal,
} from "@/app/services/searchFiles.services";

export default function Media({
  data,
  mediaType,
  displayName,
  albumID,
}: MediaPageProps) {
  const [filesData, setFilesData] = useState<FileDataProps[]>(data);
  const [previousData, setPreviousData] = useState(data);

  if (data !== previousData) {
    setPreviousData(data);
    setFilesData(data);
  }

  // user data from  use context
  const { user, setUser } = useUser();

  // router
  const router = useRouter();
  // Refresh the page
  const handleRefresh = (canRefresh: boolean) => {
    if (!canRefresh) return;

    // reset the selected files
    setSelectedFiles([]);
    router.refresh();
    canRefresh = false;
  };

  // Handle Albums creations
  const [albums, setAlbums] = useState<AlbumsDTO>({
    _id: "",
    albumName: "",
    numberOfItems: 0,
    isLocked: false,
    type: "",
  });
  const [createNewAlbum, setCreateNewAlbum] = useState<boolean>(false);

  const [albumExists, setAlbumExists] = useState<boolean>(false);

  // handle open,close and add album state
  const onOpenAndCloseCreateNewAlbum = () => {
    setCreateNewAlbum((prev) => !prev);
  };
  // handle album data
  const handleAlbumDataChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setAlbums((prev) => ({ ...prev, albumName: value }));
  };
  // Handle album create
  const handleAlbumCreate = async (data: SyntheticEvent<HTMLFormElement>) => {
    data.preventDefault();
    const exists =
      mediaType === "Images"
        ? user?.photoAlbums.includes(albums)
        : user?.videoAlbums.includes(albums);
    if (exists) {
      setAlbumExists(true);
      return;
    }

    // we will call the api here to create album
    // we will only pass the album name...
    // album details will be store in seperate
    const response = await CreateAlbum(albums, mediaType);

    if (response?.code == 201) {
      setAlbumExists(false);

      // set this as well this will keep UI UP TO DATE
      // When user navigate back to the media page it is still there.. no need for reload
      setUser((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          ...(mediaType === "Images"
            ? { photoAlbums: response.message }
            : { videoAlbums: response.message }),
        };
      });
      // once the data is created it will close it
      onOpenAndCloseCreateNewAlbum();
    } else {
      setAlbumExists(true);
    }
  };

  // Uploading files..
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFilesDTO[]>([]);
  const [uploadFile, setUploadFile] = useState<boolean>(false);

  //-----------//
  // Images data states
  const [imageDetails, setImageDetails] = useState<MediaResponseDTO[]>([]);
  const [indexNumber, setIndexNUmber] = useState<number>(0);

  const handleFullScreen = (
    imageDetails: MediaResponseDTO[],
    imageIndex: number,
  ) => {
    setIndexNUmber(imageIndex);
    setImageDetails(imageDetails);
    setViewFullScreen(true);
  };

  // Selecte images to track of which image is selected..
  const [selectedFiles, setSelectedFiles] = useState<MediaResponseDTO[]>([]);

  // Multiple or single file selected
  const [multipleFileSelected, setMultipleFileSelected] =
    useState<boolean>(false);

  const OpenCloseAddToAlbumSelected = () => {
    setMultipleFileSelected((prev) => !prev);
  };

  // Multiple Files or single file delete
  const [isDelete, setIsDelete] = useState<boolean>(false);

  const OpenCloseDeleteFilesSelected = () => {
    setIsDelete((prev) => !prev);
  };

  const [viewFullScreen, setViewFullScreen] = useState<boolean>(false);

  const handleCLoseFullScreen = () => {
    setImageDetails(imageDetails);
    setViewFullScreen(false);
  };

  // handle upload files like images and videos
  const onUploadFileOpenAndClose = () => {
    setUploadFile((prev) => !prev);
  };

  // handle toggle selected files
  const toggleSelectedFiles = (file: MediaResponseDTO) => {
    // first check if the file ID exists or not
    // if exists then remove it out of the array
    // if not add it to the array
    setSelectedFiles((prev) => {
      const exixts = prev.some((_id) => _id._id == file._id);

      if (exixts) {
        return prev.filter((_id) => _id._id !== file._id);
      }

      return [...prev, file];
    });
  };

  // handle file restore
  const [isRestore, setIsRestore] = useState<boolean>(false);

  const OpenAndCloseRestoreFile = () => {
    setIsRestore((prev) => !prev);
  };

  // handle search more data

  const [searchTag, setSearchTag] = useState<string>("");
  const activeSearchTagRef = useRef("");
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false);
  // handle  Search submit
  const handleSearchSubmit = async () => {
    try {
      const response = await GetSearchFilesNormal(
        searchTag,
        mediaType!,
        albumID,
        1,
        50,
      );
      if (response.code === 201) {
        // reset the page when submitting a new search
        currentLoadPageRef.current = 1;

        // we will hold this so what we wont loose it
        activeSearchTagRef.current = searchTag.trim();

        //if no data is return keep it as old data
        setFilesData(response?.filesData?.data ?? data);
        setIsSearchMode(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchTag(value);
  };

  // Load more data.. infinite loading..

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // this tracks if the scroll is at the end and then load more data
  const loadMoreObserverRef = useRef<IntersectionObserver | null>(null);

  const loadMoreRef = (element: HTMLDivElement | null) => {
    if (!element) return;

    // Don't create another observer
    if (loadMoreObserverRef.current) return;

    loadMoreObserverRef.current = new IntersectionObserver(async ([entry]) => {
      if (entry.isIntersecting) {
        await loadMoreData();
      }
    });

    loadMoreObserverRef.current.observe(element);
  };

  const isLoadingMoreRef = useRef(false);
  const currentLoadPageRef = useRef(1);

  const pageDataLimit: number = 50;

  const loadMoreData = async () => {
    isLoadingMoreRef.current = true;
    setIsLoading(true);

    try {
      const nextPage = currentLoadPageRef.current + 1;

      const response =
        activeSearchTagRef.current !== ""
          ? await GetInfiniteSearchFiles(
              activeSearchTagRef.current,
              mediaType!,
              nextPage,
              pageDataLimit,
              albumID,
            )
          : await InfiniteLoading(nextPage, pageDataLimit, mediaType);

      if (response.code === 201) {
        currentLoadPageRef.current = nextPage;

        setFilesData((prev) => {
          const updatedData = [...prev];

          response?.filesData?.data.forEach((responseDate: FileDataProps) => {
            const existingIndex = updatedData.findIndex(
              (data) => data._id === responseDate._id,
            );

            if (existingIndex !== -1) {
              updatedData[existingIndex] = {
                ...updatedData[existingIndex],
                files: [
                  ...updatedData[existingIndex].files,
                  ...responseDate.files,
                ],
              };
            } else {
              updatedData.push(responseDate);
            }
          });

          return updatedData;
        });
      }
    } catch (err) {
      console.log("Something went wrong at infinite loading:", err);
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-green-100 flex flex-col gap-2 items-center justify-center">
      <ToolBar
        mediaType={mediaType}
        folderName={displayName}
        onOpenAndCloseCreateNewAlbum={onOpenAndCloseCreateNewAlbum}
        onUploadFileOpenAndClose={onUploadFileOpenAndClose}
        selectedFiles={selectedFiles}
        OpenCloseAddToAlbumSelected={OpenCloseAddToAlbumSelected}
        OpenCloseRestoreFiles={OpenAndCloseRestoreFile}
        OpenCloseDeleteFilesSelected={OpenCloseDeleteFilesSelected}
        // search data props
        searchTag={searchTag}
        handleOnChange={handleOnChange}
        handleSearchSubmit={handleSearchSubmit}
      />

      <>
        {/* Create Album is not allowed in Inside Album */}

        <CreateNewAlbum
          createNewAlbumOpen={createNewAlbum}
          onOpenAndCloseCreateNewAlbum={onOpenAndCloseCreateNewAlbum}
          getAlbumName={albums}
          handleAlbumDataChange={handleAlbumDataChange}
          handleAlbumCreate={handleAlbumCreate}
          albumExixts={albumExists}
        />
      </>

      <>
        {/* Upload model also handle album ID based files
       if id is supplied then we add files with this id
      */}
        <UploadModal
          albumID={albumID!}
          uploadFile={uploadFile}
          fileType={mediaType}
          onClose={onUploadFileOpenAndClose}
          setUploadingFiles={setUploadingFiles}
          handleRefresh={handleRefresh}
        />
      </>

      <>
        <AddToAlbum
          mediaType={mediaType}
          type="MANY"
          singleImageIndex={indexNumber}
          imageDetails={selectedFiles!}
          OpenCloseAddToAlbumSelected={OpenCloseAddToAlbumSelected}
          isAddAlbumOpen={multipleFileSelected}
          handleRefresh={handleRefresh}
        />
      </>

      <>
        <DeleteFilesModel
          mediaType={mediaType}
          type="MANY"
          singleImageIndex={indexNumber}
          onDeleteClose={OpenCloseDeleteFilesSelected}
          isDelete={isDelete}
          imageDetails={selectedFiles!}
          handleRefresh={handleRefresh}
        />
      </>

      <>
        <RestoreFilesModel
          mediaType={mediaType}
          type="MANY"
          singleImageIndex={indexNumber}
          onRestoreClose={OpenAndCloseRestoreFile}
          isRestore={isRestore}
          imageDetails={selectedFiles!}
          handleRefresh={handleRefresh}
        />
      </>

      <>
        <FullScreenImage
          mediaType={mediaType}
          key={indexNumber}
          indexNumber={indexNumber}
          imageDetails={imageDetails!}
          onClose={handleCLoseFullScreen}
          isFullScreenMode={viewFullScreen}
          handleRefresh={handleRefresh}
        />
      </>

      <div className="flex-1 min-h-0 overflow-y-scroll p-2 sm:p-6 rounded-2xl shadow-2xl flex flex-col gap-8 w-full  fancy-scrollbar">
        {/* Do not display inside album or in trash folder*/}
        {mediaType !== "Album-Images" &&
          mediaType !== "Album-Videos" &&
          mediaType !== "Trash" && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              <DisplayAlbums
                mediaType={mediaType}
                handleRefresh={handleRefresh}
              />
            </div>
          )}
        <DisplayUploadingFiles uploadingFiles={uploadingFiles} />

        <DisplayFiles
          data={filesData}
          selectedFiles={selectedFiles}
          toggleSelectedFiles={toggleSelectedFiles}
          handleFullScreen={handleFullScreen}
        />

        {
          // this load more data
          <div className="w-full flex justify-center py-8">
            <div
              ref={loadMoreRef}
              className={`flex items-center gap-3 rounded-full ${isLoading ? "bg-gray-100" : "opacity-0"} px-5 py-3 shadow-sm`}
            >
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />

              <span className="text-sm font-medium text-gray-600">
                Loading more memories...
              </span>
            </div>
          </div>
        }
      </div>
    </div>
  );
}

interface DisplayUploadingFileProps {
  uploadingFiles: UploadingFilesDTO[];
}

function DisplayUploadingFiles({ uploadingFiles }: DisplayUploadingFileProps) {
  return (
    <>
      {uploadingFiles.length > 0 && (
        <div
          className={`${uploadingFiles.length > 0 ? "scale-100 opacity-100" : "scale-0 opacity-0"}w-full transition-all duration-300`}
        >
          {/* upload progress */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-green-200 p-5 shadow-lg ring-1 ring-green-500">
              {/* Title */}

              <div className="text-xs  text-red-500 font-bold uppercase">
                NOTE: Do not leave this page
              </div>

              <div className="text-center">
                <div className="text-base font-bold tracking-tight text-green-950">
                  Uploading {uploadingFiles.length} files
                </div>

                <div className="text-xs font-medium text-green-950/70">
                  Please wait...
                </div>

                {/* Current file progress */}
                <p className="mt-2 text-2xl font-black tracking-tight text-green-950">
                  {uploadingFiles.find((el) => el.progress < 100)?.progress ??
                    100}
                  %
                </p>
              </div>

              {/* Circle */}
              <div className="relative h-20 w-20">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-green-950/15"
                  />

                  {/* Progress */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-green-950 transition-all duration-500"
                    strokeDasharray="94.2"
                    strokeDashoffset={
                      94.2 -
                      (94.2 *
                        uploadingFiles.filter((el) => el.progress >= 100)
                          .length) /
                        uploadingFiles.length
                    }
                  />
                </svg>

                {/* Completed files */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black leading-none text-green-950">
                    {uploadingFiles.filter((el) => el.progress >= 100).length}/
                    {uploadingFiles.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface DisplayAlbumsProps {
  mediaType: string;
  handleRefresh: (value: boolean) => void;
}

function DisplayAlbums({ mediaType, handleRefresh }: DisplayAlbumsProps) {
  const { user } = useUser();

  return (
    <>
      {user &&
        (mediaType === "Images" ? user.photoAlbums : user.videoAlbums).map(
          (el, index) => {
            return (
              <FolderAlbum
                data={el}
                key={index}
                handleRefresh={handleRefresh}
              />
            );
          },
        )}
    </>
  );
}
