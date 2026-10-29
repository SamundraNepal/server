"use client";

import {
  ChevronLeft,
  ChevronRight,
  Info,
  MoveLeft,
  Plus,
  RotateCcw,
  Trash,
  X,
  RefreshCcwDot,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import AddToAlbum from "./addToAlbum";
import { MediaResponseDTO } from "../types/files.types";
import dynamic from "next/dynamic";
import DeleteFilesModel from "./deleteModel";
import RestoreFilesModel from "./restoreFileModel";

const PhotoLocation = dynamic(() => import("./location.display"), {
  ssr: false,
});

interface ImageDetailsProps {
  mediaType: string;
  indexNumber: number;
  imageDetails: MediaResponseDTO[];
  onClose: () => void;
  isFullScreenMode: boolean;
  handleRefresh: (value: boolean) => void;
}

interface ToolBarProps {
  handleFileRotation: () => void;

  mediaType: string;
  onClose: () => void;
  onDetailOpen: () => void;
  onDeleteOpen: () => void;
  onOpenAddAlbum: () => void;
  OpenCloseRestore: () => void;
}

interface DetailsProps {
  onDetailClose: () => void;
  isOpen: boolean;
  imageIndex: number;
  imageDetails: MediaResponseDTO[];
  isFullScreenMode: boolean;
}

export default function FullScreenImage({
  mediaType,
  indexNumber,
  imageDetails,
  onClose,
  isFullScreenMode,
  handleRefresh,
}: ImageDetailsProps) {
  const [openDetails, setOpenDetails] = useState<boolean>(false);
  const [isDelete, setIsDelete] = useState<boolean>(false);

  const [openAddAlbum, setOpenAddAlbum] = useState<boolean>(false);
  const [isRestore, setRestore] = useState<boolean>(false);

  const [currentIndexNumber, setCurrentIndexNUmber] =
    useState<number>(indexNumber);
  const [fadeEffect, setFadeEffect] = useState<boolean>(false);

  // image or file rotations options
  const [rotaionValue, setRotationValue] = useState<number>(0);

  const handleFileRotation = () => {
    setRotationValue((prev) => (prev + 90) % 360);
  };

  const CarouselFiles = (value: string) => {
    const maxImageLength = imageDetails.length - 1;
    setFadeEffect(true);
    switch (value) {
      case "RIGHT":
        if (currentIndexNumber < maxImageLength) {
          // timer before image changes

          setTimeout(() => {
            setCurrentIndexNUmber((prev) => prev + 1);
            // stop fade effect
            setFadeEffect(false);
          }, 200);
        } else {
          setFadeEffect(false);
        }
        break;
      case "LEFT":
        if (currentIndexNumber > 0) {
          // timer before image changes
          setTimeout(() => {
            setCurrentIndexNUmber((prev) => prev - 1);
            // stop fade effect
            setFadeEffect(false);
          }, 200);
        } else {
          setFadeEffect(false);
        }
        break;
    }
  };

  const onDetailOpen = () => {
    setOpenDetails(true);
  };

  const onDetailClose = () => {
    setOpenDetails(false);
  };

  const onDeleteOpen = () => {
    setIsDelete(true);
  };

  const onDeleteClose = () => {
    setIsDelete(false);
  };

  const OpenCloseAddToAlbumSelected = () => {
    setOpenAddAlbum((prev) => !prev);
  };

  const OpenCloseRestore = () => {
    setRestore((prev) => !prev);
  };

  return (
    <div
      key={indexNumber}
      className={`fixed inset-0 w-screen h-screen h-[100dvh] rounded-none bg-black flex justify-evenly overflow-hidden
      ${isFullScreenMode
          ? "scale-100 opacity-100 visible"
          : "scale-0 opacity-0 invisible pointer-events-none"
        }
      duration-200 transition-all z-50`}
    >
      <DeleteFilesModel
        mediaType={mediaType}
        type="SINGLE"
        singleImageIndex={indexNumber}
        imageDetails={imageDetails}
        onDeleteClose={onDeleteClose}
        isDelete={isDelete}
        handleRefresh={handleRefresh}
      />

      <RestoreFilesModel
        mediaType={mediaType}
        type="SINGLE"
        singleImageIndex={indexNumber}
        imageDetails={imageDetails}
        onRestoreClose={OpenCloseRestore}
        isRestore={isRestore}
        handleRefresh={handleRefresh}
      />

      <AddToAlbum
        mediaType={mediaType}
        type="SINGLE"
        singleImageIndex={indexNumber}
        imageDetails={imageDetails}
        OpenCloseAddToAlbumSelected={OpenCloseAddToAlbumSelected}
        isAddAlbumOpen={openAddAlbum}
        handleRefresh={handleRefresh}
      />

      <FileToolBar
        handleFileRotation={handleFileRotation}
        mediaType={mediaType}
        onClose={onClose}
        onDetailOpen={onDetailOpen}
        onDeleteOpen={onDeleteOpen}
        onOpenAddAlbum={OpenCloseAddToAlbumSelected}
        OpenCloseRestore={OpenCloseRestore}
      />

      {imageDetails.length > 0 && (
        <div
          key={indexNumber}
          className="flex justify-between items-center w-full h-full rounded-2xl bg-black"
        >
          <div
            onClick={() => CarouselFiles("LEFT")}
            className={`text-white sm:h-3/5 sm:w-1/5 flex justify-start items-center z-10 sm:opacity-0 hover:opacity-100 cursor-pointer transition-all duration-200 ${fadeEffect ? "pointer-events-none" : " cursor-pointer"} `}
          >
            <ChevronLeft size={60} />
          </div>

          {imageDetails[currentIndexNumber].mediaType === "Images" ? (
            <Image
              fill
              src={`${process.env.NEXT_PUBLIC_URL}/media/images/${imageDetails[currentIndexNumber].originalFileName}?type=${imageDetails[currentIndexNumber].mediaType}&original=true`}
              key={imageDetails[currentIndexNumber]._id}
              loading="lazy"
              alt={imageDetails[currentIndexNumber]._id}
              unoptimized
              style={{
                transform: `rotate(${rotaionValue}deg)`,
              }}
              className={`aspect-square object-contain rounded-lg transition-all duration-400 ${fadeEffect ? "scale-0 opacity-0" : "scale-100 opacity-100"
                }`}
            />
          ) : imageDetails[currentIndexNumber].mediaType === "Videos" ? (
            !imageDetails[currentIndexNumber]?.fileURL ? (
              <p>Video is being processed...</p>
            ) : (
              isFullScreenMode && (
                <video
                  src={`${process.env.NEXT_PUBLIC_URL}/media/videos/${imageDetails[currentIndexNumber].fileURL}`}
                  controls
                  playsInline
                  autoFocus
                  autoPlay
                  loop
                  style={{
                    transform: `rotate(${rotaionValue}deg)`,
                    transformOrigin: "center center",
                  }}
                  className="fixed inset-0 h-screen w-screen object-contain bg-black transition-all duration-400"
                />
              )
            )
          ) : null}
          <div
            onClick={() => CarouselFiles("RIGHT")}
            className={`text-white sm:h-3/5 sm:w-1/5 flex justify-end items-center z-10 sm:opacity-0 hover:opacity-100 cursor-pointer transition-all duration-200 ${fadeEffect ? "pointer-events-none" : " cursor-pointer"}`}
          >
            <ChevronRight size={60} />
          </div>
        </div>
      )}

      <DetailsBar
        onDetailClose={onDetailClose}
        isOpen={openDetails}
        imageIndex={currentIndexNumber}
        imageDetails={imageDetails}
        isFullScreenMode={isFullScreenMode}
      />
    </div>
  );
}

// this hold info , delete , album add function
function FileToolBar({
  handleFileRotation,
  mediaType,
  onClose,
  onDetailOpen,
  onDeleteOpen,
  onOpenAddAlbum,
  OpenCloseRestore,
}: ToolBarProps) {
  return (
    <div className="absolute flex flex-row gap-8 w-full justify-between items-center p-2 z-40">
      <button
        onClick={onClose}
        className=" rounded-full text-lime-400 cursor-pointer hover:text-lime-500 p-1 hover:scale-105 duration-150 transition-all"
      >
        <MoveLeft size={40} />
      </button>

      <div className="flex gap-2">
        <button
          onClick={handleFileRotation}
          className=" rounded-full text-lime-400 cursor-pointer hover:text-lime-500 p-1 hover:scale-105 duration-150 transition-all"
        >
          <RefreshCcwDot size={40} />
        </button>

        <button
          onClick={onDetailOpen}
          className=" rounded-full text-lime-400 cursor-pointer hover:text-lime-500 p-1 hover:scale-105 duration-150 transition-all"
        >
          <Info size={40} />
        </button>
        <button
          onClick={onDeleteOpen}
          className=" rounded-full text-lime-400 cursor-pointer hover:text-lime-500 p-1 hover:scale-105 duration-150 transition-all"
        >
          <Trash size={40} />
        </button>
        {mediaType !== "Trash" && (
          <button
            onClick={onOpenAddAlbum}
            className=" rounded-full text-lime-400 cursor-pointer hover:text-lime-500 p-1 hover:scale-105 duration-150 transition-all"
          >
            <Plus size={40} />
          </button>
        )}
        {mediaType === "Trash" && (
          <button
            onClick={OpenCloseRestore}
            className=" rounded-full text-lime-400 cursor-pointer hover:text-lime-500 p-1 hover:scale-105 duration-150 transition-all"
          >
            <RotateCcw size={40} />
          </button>
        )}
      </div>
    </div>
  );
}

// this hold metaData of the image eg size , name , location
function DetailsBar({
  onDetailClose,
  isOpen,
  imageIndex,
  imageDetails,
  isFullScreenMode,
}: DetailsProps) {
  return (
    <div
      key={imageIndex}
      className={`absolute flex flex-col gap-4 justify-start p-2 top-0 right-0  sm:w-1/5 w-full h-full bg-white 
           z-50 transition-transform duration-400 ease-out   ${isOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <button
        onClick={onDetailClose}
        className="w-full flex  justify-end text-red-500 hover:text-red-400 cursor-pointer"
      >
        <X size={30} />
      </button>

      <h1 className="font-bold text-gray-500">Details</h1>

      <div className="overflow-y-scroll">
        {imageDetails.length > 0 && (
          <div className="space-y-6 text-sm">
            {/* FILE */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                File
              </h3>

              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Name</span>
                  <span className="break-all text-gray-400">
                    {imageDetails[imageIndex]?.mediaType === "Videos" ? imageDetails[imageIndex]?.fileURL : imageDetails[imageIndex]?.fileName}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Format</span>
                  <span className="text-gray-400">
                    {imageDetails[imageIndex]?.format || "Unknown"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Original size</span>
                    <span className="text-gray-400">
                      {formatBytes(imageDetails[imageIndex]?.fileSize ?? 1)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">
                      Converted size
                    </span>
                    <span className="text-gray-400">
                      {formatBytes(
                        imageDetails[imageIndex]?.convertedFileSize ?? 1,
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Backed up</span>
                  <span className="text-gray-400">
                    {imageDetails[imageIndex]?.backUpDate
                      ? new Date(
                        imageDetails[imageIndex].backUpDate!,
                      ).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                      : "Unknown"}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Original date</span>
                  <span className="text-gray-400">
                    {imageDetails[imageIndex]?.dateTimeOriginal
                      ? new Date(
                        imageDetails[imageIndex].dateTimeOriginal!,
                      ).toLocaleString("en-AU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                      : "Unknown"}
                  </span>
                </div>

                {imageDetails[imageIndex]?.mediaType === "Videos" && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Duration</span>
                    <span className="text-gray-400">
                      {formatDuration(
                        imageDetails[imageIndex]?.fileDuration ?? 0,
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-white/10" />

            {/* CAMERA */}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Camera
              </h3>

              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Make</span>
                  <span className="text-gray-400">
                    {imageDetails[imageIndex]?.make || "Unknown"}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Model</span>
                  <span className="text-gray-400">
                    {imageDetails[imageIndex]?.model || "Unknown"}
                  </span>
                </div>

                {imageDetails[imageIndex]?.software && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Software</span>
                    <span className="break-all text-gray-400">
                      {imageDetails[imageIndex].software}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {imageDetails[imageIndex]?.focalLength && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">
                        Focal length
                      </span>
                      <span className="text-gray-400">
                        {imageDetails[imageIndex].focalLength}
                      </span>
                    </div>
                  )}

                  {imageDetails[imageIndex]?.focalLength35mm && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">
                        35mm equivalent
                      </span>
                      <span className="text-gray-400">
                        {imageDetails[imageIndex].focalLength35mm}
                      </span>
                    </div>
                  )}

                  {imageDetails[imageIndex]?.fNumber != null && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">Aperture</span>
                      <span className="text-gray-400">
                        ƒ/{imageDetails[imageIndex].fNumber}
                      </span>
                    </div>
                  )}

                  {imageDetails[imageIndex]?.iso != null && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">ISO</span>
                      <span className="text-gray-400">
                        {imageDetails[imageIndex].iso}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-white/10" />

            {/* EXPOSURE */}
            {imageDetails[imageIndex].exposureTime != null && (
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Exposure
                </h3>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {imageDetails[imageIndex]?.exposureTime && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">
                        Shutter speed
                      </span>
                      <span className="text-gray-400">
                        {imageDetails[imageIndex].exposureTime}
                      </span>
                    </div>
                  )}

                  {imageDetails[imageIndex]?.exposureCompensation != null && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">
                        Exposure comp.
                      </span>
                      <span className="text-gray-400">
                        {imageDetails[imageIndex].exposureCompensation} EV
                      </span>
                    </div>
                  )}

                  {imageDetails[imageIndex]?.exposureProgram && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">Program</span>
                      <span className="text-gray-400">
                        {imageDetails[imageIndex].exposureProgram}
                      </span>
                    </div>
                  )}

                  {imageDetails[imageIndex]?.meteringMode && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">Metering</span>
                      <span className="text-gray-400">
                        {imageDetails[imageIndex].meteringMode}
                      </span>
                    </div>
                  )}

                  {imageDetails[imageIndex]?.exposureMode && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">
                        Exposure mode
                      </span>
                      <span className="text-gray-400">
                        {imageDetails[imageIndex].exposureMode}
                      </span>
                    </div>
                  )}

                  {imageDetails[imageIndex]?.whiteBalance && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">
                        White balance
                      </span>
                      <span className="text-gray-400">
                        {imageDetails[imageIndex].whiteBalance}
                      </span>
                    </div>
                  )}

                  {imageDetails[imageIndex]?.flash && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">Flash</span>
                      <span className="text-gray-400">
                        {imageDetails[imageIndex].flash}
                      </span>
                    </div>
                  )}

                  {imageDetails[imageIndex]?.digitalZoomRatio != null && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">
                        Digital zoom
                      </span>
                      <span className="text-gray-400">
                        {imageDetails[imageIndex].digitalZoomRatio}×
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="h-px bg-white/10" />

            {/* IMAGE / VIDEO */}
            <div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Dimensions</span>
                  <span className="text-gray-400">
                    {imageDetails[imageIndex]?.fileXDimension} ×{" "}
                    {imageDetails[imageIndex]?.fileYDimension}
                  </span>
                </div>

                {imageDetails[imageIndex]?.megapixels != null && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Megapixels</span>
                    <span className="text-gray-400">
                      {imageDetails[imageIndex].megapixels} MP
                    </span>
                  </div>
                )}

                {imageDetails[imageIndex]?.orientation != null && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Orientation</span>
                    <span className="text-gray-400">
                      {imageDetails[imageIndex].orientation}
                    </span>
                  </div>
                )}

                {imageDetails[imageIndex]?.colorSpace && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Color space</span>
                    <span className="text-gray-400">
                      {imageDetails[imageIndex].colorSpace}
                    </span>
                  </div>
                )}

                {imageDetails[imageIndex]?.bitsPerSample != null && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">
                      Bits per sample
                    </span>
                    <span className="text-gray-400">
                      {imageDetails[imageIndex].bitsPerSample}
                    </span>
                  </div>
                )}

                {imageDetails[imageIndex]?.colorComponents != null && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">
                      Color components
                    </span>
                    <span className="text-gray-400">
                      {imageDetails[imageIndex].colorComponents}
                    </span>
                  </div>
                )}

                {imageDetails[imageIndex]?.yCbCrSubSampling && (
                  <div className="col-span-2 flex flex-col gap-1">
                    <span className="text-xs text-gray-500">
                      YCbCr subsampling
                    </span>
                    <span className="text-gray-400">
                      {imageDetails[imageIndex].yCbCrSubSampling}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-white/10" />

            {/* LOCATION */}

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Zone
              </h3>
              <span className="text-gray-400">
                {imageDetails[imageIndex].zone ?? "Not Avaliable"}
              </span>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Location
              </h3>

              {isFullScreenMode &&
                imageDetails[imageIndex]?.gPSLatitude != null &&
                imageDetails[imageIndex]?.gPSLongitude != null && (
                  <PhotoLocation
                    latitude={Number(imageDetails[imageIndex].gPSLatitude)}
                    longitude={Number(imageDetails[imageIndex].gPSLongitude)}
                  />
                )}

              {isFullScreenMode &&
                imageDetails[imageIndex]?.gPSLatitude === null &&
                imageDetails[imageIndex]?.gPSLongitude === null && (
                  <p className="text-gray-400"> No Location </p>
                )}

              <div className="mt-3 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Latitude</span>
                  <span className="text-gray-400">
                    {imageDetails[imageIndex]?.gPSLatitude != null
                      ? imageDetails[imageIndex].gPSLatitude.toFixed(5)
                      : "No data"}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Longitude</span>
                  <span className="text-gray-400">
                    {imageDetails[imageIndex]?.gPSLongitude != null
                      ? imageDetails[imageIndex].gPSLongitude.toFixed(5)
                      : "No data"}
                  </span>
                </div>

                {imageDetails[imageIndex]?.gPSAltitude != null && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Altitude</span>
                    <span className="text-gray-400">
                      {imageDetails[imageIndex].gPSAltitude} m
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const formatBytes = (value: number) => {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(2)} KB`;
  }

  if (value < 1024 * 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(2)} MB`;
  }

  return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};
const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};
