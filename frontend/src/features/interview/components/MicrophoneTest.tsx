import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Mic,
  CheckCircle,
  AlertCircle,
  Loader2,
  Volume2,
  Play,
  Pause,
  Settings,
} from 'lucide-react';
import {
  MicrophoneTestService,
  MicrophoneTestResult,
  AudioDevice,
} from '../utils/microphone-test';

interface MicrophoneTestProps {
  onTestComplete: (result: MicrophoneTestResult) => void;
  className?: string;
}

export const MicrophoneTest: React.FC<MicrophoneTestProps> = ({
  onTestComplete,
  className,
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<MicrophoneTestResult | null>(
    null
  );
  const [audioLevel, setAudioLevel] = useState(0);
  const [isRecordingTest, setIsRecordingTest] = useState(false);
  const [recordingTestResult, setRecordingTestResult] = useState<{
    success: boolean;
    blob?: Blob;
    error?: string;
  } | null>(null);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [micService] = useState(() => new MicrophoneTestService());
  const [availableDevices, setAvailableDevices] = useState<AudioDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      micService.cleanup();
    };
  }, [micService]);

  // Load available audio devices on mount
  useEffect(() => {
    const loadDevices = async () => {
      setIsLoadingDevices(true);
      try {
        const devices = await micService.getAudioInputDevices();
        setAvailableDevices(devices);

        // Select the first device by default
        if (devices.length > 0 && !selectedDevice) {
          setSelectedDevice(devices[0].deviceId);
          micService.setSelectedDevice(devices[0].deviceId);
        }
      } catch (error) {
        console.error('Failed to load audio devices:', error);
      } finally {
        setIsLoadingDevices(false);
      }
    };

    void loadDevices();
  }, [micService, selectedDevice]);

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId);
    micService.setSelectedDevice(deviceId);

    // Reset test results when device changes
    if (testResult) {
      resetTest();
    }
  };

  const runMicrophoneTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    setRecordingTestResult(null);
    setAudioLevel(0);

    try {
      const result = await micService.testMicrophone();
      setTestResult(result);
      onTestComplete(result);

      if (result.isWorking) {
        // Start monitoring audio levels
        micService.startAudioLevelMonitoring((level) => {
          setAudioLevel(level);
        });
      }
    } catch (error) {
      console.error('Microphone test failed:', error);
      const errorResult: MicrophoneTestResult = {
        hasPermission: false,
        isWorking: false,
        audioLevel: 0,
        error: 'Test failed unexpectedly',
      };
      setTestResult(errorResult);
      onTestComplete(errorResult);
    } finally {
      setIsTesting(false);
    }
  };

  const testRecording = async () => {
    if (!testResult?.isWorking) return;

    setIsRecordingTest(true);
    const result = await micService.testRecording(3000); // 3 second test
    setRecordingTestResult(result);
    setIsRecordingTest(false);
  };

  const playTestRecording = () => {
    if (!recordingTestResult?.blob) return;

    const audio = new Audio(URL.createObjectURL(recordingTestResult.blob));
    setIsPlayingTest(true);

    audio.onended = () => {
      setIsPlayingTest(false);
      URL.revokeObjectURL(audio.src);
    };

    void audio.play();
  };

  const resetTest = () => {
    micService.cleanup();
    setTestResult(null);
    setRecordingTestResult(null);
    setAudioLevel(0);
    setIsRecordingTest(false);
    setIsPlayingTest(false);
  };

  const getStatusIcon = () => {
    if (isTesting) {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
    }
    if (!testResult) {
      return <Mic className="h-5 w-5 text-gray-400" />;
    }
    if (testResult.hasPermission && testResult.isWorking) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  };

  const getStatusBadge = () => {
    if (isTesting) {
      return <Badge variant="secondary">Testing...</Badge>;
    }
    if (!testResult) {
      return <Badge variant="outline">Not Tested</Badge>;
    }
    if (testResult.hasPermission && testResult.isWorking) {
      return <Badge className="bg-green-100 text-green-800">Working</Badge>;
    }
    return <Badge variant="destructive">Failed</Badge>;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Microphone Test
        </CardTitle>
        <CardDescription>
          Test your microphone to ensure it works properly for the interview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Device Selection */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="text-sm font-medium">Audio Device:</span>
          </div>
          {isLoadingDevices ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading devices...
            </div>
          ) : availableDevices.length > 0 ? (
            <Select value={selectedDevice} onValueChange={handleDeviceChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a microphone..." />
              </SelectTrigger>
              <SelectContent>
                {availableDevices.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm text-muted-foreground">
              No audio devices found. Please connect a microphone.
            </div>
          )}
        </div>

        {/* Test Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status:</span>
          {getStatusBadge()}
        </div>

        {/* Error Message */}
        {testResult?.error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
            {testResult.error}
          </div>
        )}

        {/* Audio Level Indicator */}
        {testResult?.isWorking && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Audio Level
              </span>
              <span>{audioLevel}%</span>
            </div>
            <Progress value={audioLevel} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Speak into your microphone to test the audio level
            </p>
          </div>
        )}

        {/* Recording Test */}
        {testResult?.isWorking && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recording Test:</span>
              <Button
                onClick={() => void testRecording()}
                disabled={isRecordingTest}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {isRecordingTest ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    Test Recording
                  </>
                )}
              </Button>
            </div>

            {recordingTestResult && (
              <div className="p-3 rounded-md bg-muted">
                {recordingTestResult.success ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Recording successful!
                      </span>
                    </div>
                    <Button
                      onClick={playTestRecording}
                      disabled={isPlayingTest}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {isPlayingTest ? (
                        <>
                          <Pause className="h-4 w-4" />
                          Playing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Play Test
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">
                      Recording failed: {recordingTestResult.error}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => void runMicrophoneTest()}
            disabled={isTesting || !selectedDevice}
            className="flex-1"
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Testing...
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                {testResult ? 'Test Again' : 'Test Microphone'}
              </>
            )}
          </Button>

          {testResult && (
            <Button onClick={resetTest} variant="outline">
              Reset
            </Button>
          )}
        </div>

        {/* Instructions */}
        {!testResult && (
          <div className="p-3 text-sm text-muted-foreground bg-muted rounded-md">
            <p className="font-medium mb-1">Instructions:</p>
            <ul className="text-xs space-y-1">
              <li>• Select your preferred microphone device</li>
              <li>• Click &quot;Test Microphone&quot; to check permissions</li>
              <li>• Allow microphone access when prompted</li>
              <li>• Speak to test audio levels</li>
              <li>• Test recording functionality</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
