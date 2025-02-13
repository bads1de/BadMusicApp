"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Heart,
  Share2,
  Download,
  Edit2,
  Clock,
  Music2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useGetSunoSongById from "@/hooks/useGetSunoSongById";
import { useUser } from "@/hooks/useUser";
import { downloadFile } from "@/libs/helpers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AudioWaveform from "@/components/AudioWaveform";
import PreviewDownloadModal from "@/components/Modals/DownloadPreviewModal";
import { MdLyrics } from "react-icons/md";
import { getRandomColor } from "@/libs/utils";
import useAudioWaveStore from "@/hooks/useAudioWave";
import SunoEditModal from "@/components/Modals/SunoEditModal";

interface SunoSongContentProps {
  sunoSongId: string;
}

const SunoSongContent: React.FC<SunoSongContentProps> = ({ sunoSongId }) => {
  const { sunoSong: song } = useGetSunoSongById(sunoSongId);
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"lyrics" | "similar">("lyrics");
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [duration, setDuration] = useState<string>("");
  const [primaryColor, setPrimaryColor] = useState(getRandomColor());
  const [secondaryColor, setSecondaryColor] = useState(getRandomColor());

  const { isPlaying, play, pause, currentSongId, initializeAudio } =
    useAudioWaveStore();

  useEffect(() => {
    if (song?.audio_url) {
      const audio = new Audio(song.audio_url);
      audio.addEventListener("loadedmetadata", () => {
        const minutes = Math.floor(audio.duration / 60);
        const seconds = Math.floor(audio.duration % 60);
        setDuration(`${minutes}:${seconds.toString().padStart(2, "0")}`);
      });
    }
  }, [song?.audio_url]);

  useEffect(() => {
    setPrimaryColor(getRandomColor());
    setSecondaryColor(getRandomColor());
  }, [sunoSongId]);

  const handlePlayClick = async () => {
    if (!song?.audio_url) return;

    if (currentSongId !== sunoSongId) {
      await initializeAudio(song.audio_url, sunoSongId);
      await play();
    } else {
      if (isPlaying) {
        pause();
      } else {
        await play();
      }
    }
  };
  const handlePlaybackEnded = () => {
    pause();
  };

  const handleDownloadClick = async () => {
    setIsLoading(true);
    setIsPreviewModalOpen(true);
  };

  const handleDownloadConfirm = async (type: "audio" | "video") => {
    if (song) {
      const url = type === "audio" ? song.audio_url : song.video_url;
      const extension = type === "audio" ? "mp3" : "mp4";
      if (url) {
        await downloadFile(url, `${song.title || "Untitled"}.${extension}`);
      }
    }
    setIsLoading(false);
    setIsPreviewModalOpen(false);
  };

  if (!song) return <SunoSongSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-b bg-black text-white">
      {/* Hero Section with Integrated Waveform */}
      <div className="relative h-[50vh] md:h-[60vh] w-full">
        {/* Background Image */}
        <Image
          src={song.image_url || "/images/wait.jpg"}
          alt="Song Cover"
          fill
          className="object-cover opacity-40"
          priority
        />
        <AudioWaveform
          audioUrl={song.audio_url}
          isPlaying={isPlaying && currentSongId === sunoSongId}
          onPlayPause={handlePlayClick}
          onEnded={handlePlaybackEnded}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          imageUrl={song.image_url}
          songId={sunoSongId}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col">
          {/* Upper Section (Album Art & Info) */}
          <div className="flex-1 p-6 md:p-12 flex items-end">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-7xl mx-auto w-full"
            >
              <div className="flex flex-col md:flex-row items-end gap-6">
                {/* Album Art */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="hidden md:block w-48 h-48 md:w-64 md:h-64 relative rounded-lg overflow-hidden shadow-2xl flex-shrink-0"
                >
                  <Image
                    src={song.image_url || "/images/wait.jpg"}
                    alt="Song Cover"
                    fill
                    className="object-cover"
                  />
                  <motion.div
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-all cursor-pointer"
                    onClick={handlePlayClick}
                  >
                    {isPlaying ? (
                      <Pause size={48} className="text-white" />
                    ) : (
                      <Play size={48} className="text-white" />
                    )}
                  </motion.div>
                </motion.div>

                {/* Song Info */}
                <div className="flex-grow">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                    {song.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-300 mb-4">
                    {song.author}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-6 mb-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Play size={16} />
                      <span>{song.count} plays</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart size={16} />
                      <span>{song.like_count} likes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>{duration}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handlePlayClick}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isPlaying ? (
                        <Pause className="mr-2" size={16} />
                      ) : (
                        <Play className="mr-2" size={16} />
                      )}
                      {isPlaying ? "Pause" : "Play Now"}
                    </Button>
                    <Button
                      onClick={handleDownloadClick}
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-600/10"
                    >
                      <Download className="mr-2" size={16} />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      className="border-purple-600 text-purple-600 hover:bg-purple-600/10"
                    >
                      <Share2 className="mr-2" size={16} />
                      Share
                    </Button>
                    {user?.id === song.user_id && (
                      <Button
                        variant="outline"
                        className="border-pink-600 text-pink-600 hover:bg-pink-600/10"
                        onClick={() => setIsEditModalOpen(true)}
                      >
                        <Edit2 className="mr-2" size={16} />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <PreviewDownloadModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={song.title}
        audioUrl={song.audio_url}
        videoUrl={song.video_url}
        onDownload={handleDownloadConfirm}
      />

      {/* Rest of the content remains the same */}
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Genre Tags */}
        <div className="flex flex-wrap gap-2 mb-12">
          {song.tags
            ?.split(/,\s*/)
            .map((tag) => tag.trim())
            .filter((tag) => tag !== "")
            .map((tag) => (
              <Link href={`/tag/${encodeURIComponent(tag)}`} key={tag}>
                <span className="px-4 py-2 rounded-full text-sm bg-white/10 hover:bg-white/20 transition-colors">
                  {tag}
                </span>
              </Link>
            ))}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-white/10">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("lyrics")}
                className={`pb-4 relative ${
                  activeTab === "lyrics"
                    ? "text-blue-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MdLyrics size={20} />
                  <span>Lyrics</span>
                </div>
                {activeTab === "lyrics" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab("similar")}
                className={`pb-4 relative ${
                  activeTab === "similar"
                    ? "text-blue-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Music2 size={20} />
                  <span>Similar Tracks</span>
                </div>
                {activeTab === "similar" && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                  />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "lyrics" ? (
            <motion.div
              key="lyrics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 rounded-xl p-8"
            >
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-line">{song.lyric}</div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="similar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card
                  key={i}
                  className="group relative overflow-hidden bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="relative aspect-video">
                    <Image
                      src="/images/wait.jpg"
                      alt="Similar Song"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/40"
                    >
                      <Play size={40} className="text-white" />
                    </motion.div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 truncate">
                      Similar Song {i}
                    </h3>
                    <p className="text-gray-400 text-sm truncate">
                      Artist Name
                    </p>
                  </div>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <SunoEditModal
        song={song}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};

const SunoSongSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-b bg-black p-6">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        <Skeleton className="w-48 h-48 md:w-64 md:h-64 rounded-lg" />
        <div className="flex-grow">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-8 w-1/2 mb-6" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default React.memo(SunoSongContent);
