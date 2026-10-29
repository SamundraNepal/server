import { InfiniteLoading } from "@/app/services/media.data.service";
import { FileDataProps, MediaResponseDTO } from "@/app/types/files.types";
import { CheckCheck, Circle, Files } from "lucide-react";
import Image from "next/image";
import test from "node:test";
import { useRef, useState } from "react";

interface displayFileSmallProps {
  selectedFiles: MediaResponseDTO[];
  data: FileDataProps[] | null;
  toggleSelectedFiles: (file: MediaResponseDTO) => void;
  handleFullScreen: (
    imageList: MediaResponseDTO[],
    indexNumber: number,
  ) => void;
}

export default function DisplayFiles({
  data,
  selectedFiles,
  toggleSelectedFiles,
  handleFullScreen,
}: displayFileSmallProps) {
  const NEXT_PUBLIC_URL = `${process.env.NEXT_PUBLIC_URL}`;

  //We want 50 physical slots.

  const [slots, setSlots] = useState(
    Array.from({ length: 50 }, (_, index) => ({
      slotIndex: index,
      dataIndex: index,
    })),
  );
  //Create the out-of-view tracker
  const [outOfView, setOutOfView] = useState<Set<number>>(new Set());

  const observeElement = (
    element: HTMLDivElement | null,
    slotIndex: number,
  ) => {
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setOutOfView((prev) => {
        const next = new Set(prev);

        if (entry.isIntersecting) {
          next.delete(slotIndex);
        } else {
          next.add(slotIndex);
        }

        return next;
      });
    });

    observer.observe(element);
  };

  //Track scroll direction
  const previousScrollTop = useRef(0);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const currentScroll = event.currentTarget.scrollTop;

    if (currentScroll > previousScrollTop.current) {
      if (outOfView.size > 0) {
        setSlots((prev) => {
          let nextIndex = nextDataIndex;

          return prev.map((slot) => {
            if (!outOfView.has(slot.slotIndex)) {
              return slot;
            }

            const recycledSlot = {
              ...slot,
              dataIndex: nextIndex,
            };

            nextIndex++;

            return recycledSlot;
          });
        });

        setNextDataIndex((prev) => prev + outOfView.size);

        setOutOfView(new Set());
      }
    } else if (currentScroll < previousScrollTop.current) {
      console.log("UP");

      if (outOfView.size > 0) {
        setSlots((prev) => {
          const visible = prev.filter((slot) => !outOfView.has(slot));

          const recycled = prev.filter((slot) => outOfView.has(slot));

          return [...recycled, ...visible];
        });

        setOutOfView(new Set());
      }
    }

    previousScrollTop.current = currentScroll;
  };

  //we keep the slots in place and change their dataIndex.
  const [nextDataIndex, setNextDataIndex] = useState(50);

  const columns = 4;
  const totalItems = 1000;

  const totalRows = Math.ceil(totalItems / columns);
  const rowHeight = 100;

  const totalHeight = totalRows * rowHeight;

  return (
    <div
      onScroll={handleScroll}
      className="h-full w-full overflow-y-scroll p-6"
    >
      <div
        className="relative"
        style={{
          height: `${totalHeight}px`,
        }}
      >
        {slots.map((slot) => {
          const row = Math.floor(slot.dataIndex / columns);
          const column = slot.dataIndex % columns;

          return (
            <div
              ref={(element) => observeElement(element, slot.slotIndex)}
              key={slot.slotIndex}
              className="absolute aspect-square rounded-md bg-gray-200 text-center text-2xl text-red-800"
              style={{
                top: `${row * 100}px`,
                left: `${column * 100}px`,
              }}
            >
              {slot.dataIndex + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// back up

/*
  const [slots, setSlots] = useState(
    Array.from({ length: 30 }, (_, index) => index),
  );

  const moveFirstRowToEnd = async () => {
    setSlots((prev) => {
      const firstRow = prev.slice(0, 8);
      const remaining = prev.slice(8);

      return [...remaining, ...firstRow];
    });

    test();
  };

  const test = async () => {
    try {
      const response = await InfiniteLoading(2, 100);
      testingData = response.imagesData.data;
    } finally {
    }
  };

  <div
    className="grid grid-cols-3 sm:grid-cols-8 gap-2 h-full w-full transition-all duration-500"
    onWheel={(event) => {
      if (event.deltaY > 0) {
        // scrolling down
        moveFirstRowToEnd();
      }
    }}
  >
    {slots.map((slot, index) => {
      return (
        <div
          key={slot}
          className="border-2 h-40 w-40 bg-red-900 transition-all duration-100"
        >
          {slot + 1}

          {testingData && (
            <Image
              onClick={() => {
                const { allFiles, globalIndex } = fileGlobalIndex(
                  testingData[0].files[slot]._id,
                );

                handleFullScreen(allFiles, globalIndex);
              }}
              src={`${NEXT_PUBLIC_URL}/media/images/${testingData[0].files[slot].fileName}?type=${testingData[0].files[slot].mediaType}`}
              width={testingData[0].files[slot].fileXDimension}
              height={testingData[0].files[slot].fileYDimension}
              alt={testingData[0].files[slot].fileName || ""}
              loading="lazy"
              quality={10}
              unoptimized
              className="aspect-square object-cover rounded-lg"
            />
          )}
        </div>
      );
    })}
  </div>

  return (
    <>
      {data?.map((day, dateIndex) => {
        return (
          <section key={dateIndex} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-500">
              {new Date(day?._id).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h2>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {day.files.map((files, fileIndex) => (
                <div
                  ref={(element) => observeElement(element, files._id)}
                  key={fileIndex}
                  className="group relative aspect-square cursor-pointer border-4 border-transparent hover:border-orange-400 transition-all duration-50"
                >
                  {!outOfView.has(files._id) && (
                    <>
                      <div
                        className={`absolute top-2 right-2 z-10 cursor-pointer transition-all duration-200 ${
                          selectedFiles.some(
                            (item) => item._id === files._id,
                          )
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                        onClick={() => toggleSelectedFiles(files)}
                      >
                        {selectedFiles.some(
                          (item) => item._id === files._id,
                        ) ? (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
                            <CheckCheck
                              size={30}
                              className="text-white"
                            />
                          </div>
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
                            <Circle
                              size={36}
                              className="text-white transition-colors hover:text-emerald-400"
                            />
                          </div>
                        )}
                      </div>

                      <Image
                        onClick={() => {
                          const { allFiles, globalIndex } =
                            fileGlobalIndex(files._id);

                          handleFullScreen(allFiles, globalIndex);
                        }}
                        src={`${NEXT_PUBLIC_URL}/media/images/${files.fileName}?type=${files.mediaType}`}
                        width={files.fileXDimension}
                        height={files.fileYDimension}
                        alt={files.fileName || ""}
                        loading="lazy"
                        quality={10}
                        unoptimized
                        className="aspect-square object-cover rounded-lg"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}
*/
