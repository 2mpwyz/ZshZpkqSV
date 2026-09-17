import React, { useState, useEffect, useRef } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { supabase } from '../lib/supabase';

interface MuxVideoPlayerProps {
  filename: string;
  b2Url: string;
}

export const MuxVideoPlayer: React.FC<MuxVideoPlayerProps> = ({
  filename,
  b2Url,
}) => {
  const [playbackId, setPlaybackId] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    let retries = 0;

    const fetch = async () => {
      try {
        const { data: video } = await supabase
          .from('video_uploads')
          .select('playback_id, status')
          .eq('filename', filename)
          .maybeSingle();

        if (!isMountedRef.current) return;

        if (video?.playback_id && video.status === 'ready') {
          setPlaybackId(video.playback_id);
        } else if (video?.status === 'processing' && retries < 3) {
          retries++;
          timeoutRef.current = setTimeout(fetch, 1500);
        }
      } catch (e) {
        // Silently fail, use B2 fallback
      }
    };

    fetch();

    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [filename]);

  if (playbackId) {
    return (
      <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
        <MuxPlayer
          playbackId={playbackId}
          streamType="on-demand"
          controls
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
      <video src={b2Url} controls className="w-full h-full object-contain" />
    </div>
  );
};

export default MuxVideoPlayer;
