import React from 'react';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { Button } from './ui/button';
import { AlertCircle, Mic, Square, X } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (file: File) => void;
  disabled?: boolean;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  disabled = false,
}) => {
  const {
    isRecording,
    isSupported,
    error,
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecording();

  const handleStartRecording = async () => {
    const success = await startRecording();
    if (!success) {
      console.error('Failed to start recording');
    }
  };

  const handleStopRecording = async () => {
    const audioFile = await stopRecording();
    if (audioFile) {
      onRecordingComplete(audioFile);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-900">
              Voice recording not supported
            </p>
            <p className="text-xs text-red-700 mt-1">
              Your browser doesn't support voice recording. Please use a modern browser like Chrome, Firefox, or Edge.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isRecording) {
    return (
      <div className="space-y-3">
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Mic className="h-5 w-5 text-red-600" />
                <div className="absolute inset-0 animate-pulse">
                  <Mic className="h-5 w-5 text-red-400" />
                </div>
              </div>
              <span className="text-sm font-semibold text-red-900">
                Recording... {formatDuration(duration)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={cancelRecording}
            className="border-gray-300"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleStopRecording}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Square className="h-4 w-4 mr-2" />
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        onClick={handleStartRecording}
        disabled={disabled}
        className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50"
      >
        <Mic className="h-4 w-4 mr-2" />
        Record Voice Note
      </Button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
