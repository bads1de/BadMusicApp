import getLikedSongs, { getAllLikedSongs } from "@/actions/getLikedSongs";
import Header from "@/components/Header";
import Image from "next/image";
import LikedContent from "./components/LikedContent";

// export const revalidate = 0;

const Liked = async () => {
  const songs = await getAllLikedSongs();

  return (
    <div className="bg-[#0d0d0d] rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <div className="mt-20">
          <div className="flex flex-col md:flex-row items-center gap-x-5">
            <div className="relative h-32 w-32 lg:h-44 lg:w-44">
              <Image
                fill
                src="/images/liked.png"
                alt="Playlist"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
              <p className="hidden md:block font-semibold text-sm">
                プレイリスト
              </p>
              <h1 className="text-white text-4xl sm:text-5xl lg:text-7xl font-bold">
                お気に入りの曲
              </h1>
            </div>
          </div>
        </div>
      </Header>
      <LikedContent songs={songs} />
    </div>
  );
};

export default Liked;
