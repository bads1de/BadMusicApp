import { useState, useRef, useCallback } from "react";
import { SunoSong } from "@/types";
import usePlayer from "./usePlayer";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Suno曲の再生を管理するカスタムフック
 *
 * @param {SunoSong[]} sunoSongs - 再生対象のSuno曲リスト
 * @returns {function} Suno曲を再生する関数
 */
const useOnPlaySuno = (sunoSongs: SunoSong[]) => {
  const player = usePlayer();
  const supabase = createClientComponentClient();
  const [lastPlayTime, setLastPlayTime] = useState<number>(0);
  const cooldownRef = useRef<boolean>(false);
  const pendingPlayRef = useRef<string | null>(null);

  const processPlay = async (id: string) => {
    try {
      player.setId(id, true);
      player.setIds(
        sunoSongs.map((song) => song.id),
        true
      );

      const { data: songData, error: selectError } = await supabase
        .from("suno_songs")
        .select("count")
        .eq("id", id)
        .single();

      if (selectError || !songData) throw selectError;

      const currentCount = songData.count || 0;
      const { data: incrementedCount, error: incrementError } =
        await supabase.rpc("increment", { x: currentCount });

      if (incrementError) throw incrementError;

      const { error: updateError } = await supabase
        .from("suno_songs")
        .update({ count: incrementedCount })
        .eq("id", id);

      if (updateError) throw updateError;
    } catch (error) {
      console.error("エラーが発生しました:", error);
    }
  };

  const onPlay = useCallback(
    async (id: string) => {
      const currentTime = Date.now();

      if (cooldownRef.current) {
        pendingPlayRef.current = id;
        return;
      }

      if (currentTime - lastPlayTime < 1000) {
        pendingPlayRef.current = id;
        return;
      }

      cooldownRef.current = true;
      setLastPlayTime(currentTime);

      player.play();
      await processPlay(id);

      setTimeout(async () => {
        cooldownRef.current = false;
        if (pendingPlayRef.current) {
          const pendingId = pendingPlayRef.current;
          pendingPlayRef.current = null;
          await onPlay(pendingId);
        }
      }, 1000);
    },
    [lastPlayTime, player, sunoSongs, supabase]
  );

  return debounce(onPlay, 500);
};

export default useOnPlaySuno;
