import { useState, useRef, useCallback } from 'react';

export interface VoiceRecordingState {
  isRecording: boolean;
  isSupported: boolean;
  error: string | null;
  duration: number; // in seconds
}

export function useVoiceRecording() {
  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    isSupported: typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
    error: null,
    duration: 0,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));

      if (!navigator.mediaDevices?.getUserMedia) {
        setState(prev => ({
          ...prev,
          error: 'Voice recording is not supported in your browser',
          isSupported: false,
        }));
        return false;
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        setState(prev => ({
          ...prev,
          error: `Recording error: ${event.error}`,
          isRecording: false,
        }));
        stopRecording();
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      // Start duration tracking
      let seconds = 0;
      durationIntervalRef.current = setInterval(() => {
        seconds++;
        setState(prev => ({ ...prev, duration: seconds }));
      }, 1000);

      setState(prev => ({
        ...prev,
        isRecording: true,
        error: null,
      }));

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to access microphone. Please check permissions.';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isRecording: false,
      }));
      return false;
    }
  }, []);

  const stopRecording = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve(null);
        return;
      }

      // Stop duration tracking
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      // Stop the recording
      mediaRecorderRef.current.onstop = () => {
        // Stop all tracks in the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Create blob from chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];

        if (audioBlob.size === 0) {
          setState(prev => ({
            ...prev,
            error: 'Recording is empty',
            isRecording: false,
            duration: 0,
          }));
          resolve(null);
          return;
        }

        // Convert blob to File
        const timestamp = Date.now();
        const audioFile = new File([audioBlob], `voice-note-${timestamp}.webm`, {
          type: 'audio/webm',
        });

        setState(prev => ({
          ...prev,
          isRecording: false,
          duration: 0,
        }));

        resolve(audioFile);
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  const cancelRecording = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    audioChunksRef.current = [];

    setState(prev => ({
      ...prev,
      isRecording: false,
      error: null,
      duration: 0,
    }));
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
