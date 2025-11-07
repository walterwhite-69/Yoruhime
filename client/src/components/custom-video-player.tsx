import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipForward,
  SkipBack,
  Minimize,
  Subtitles,
  RotateCcw,
  Loader2,
} from "lucide-react";
import Hls from "hls.js";

interface CustomVideoPlayerProps {
  sources: any;
  onQualityChange?: (quality: string) => void;
  onVideoEnd?: () => void;
  nextEpisodeUrl?: string;
  onPlaybackError?: (errorType: string, errorDetails: any) => void;
}

export function CustomVideoPlayer({ sources, onQualityChange, onVideoEnd, nextEpisodeUrl, onPlaybackError }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const orientationLockTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [qualities, setQualities] = useState<string[]>([]);
  const [currentQuality, setCurrentQuality] = useState<string>("");
  const [buffered, setBuffered] = useState(0);
  const [showSkipIndicator, setShowSkipIndicator] = useState<{ side: 'left' | 'right', amount: number } | null>(null);
  const [subtitles, setSubtitles] = useState<Array<{ lang: string; url: string }>>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("Off");
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  
  const lastTapRef = useRef<{ side: 'left' | 'right', time: number, count: number } | null>(null);
  const skipIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;

  const setupAutoHide = useCallback(() => {
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    
    setShowControls(true);
    
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !sources?.sources?.[0]) return;

    const videoSource = sources.sources[0];
    
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    video.pause();
    video.removeAttribute('src');
    video.load();
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setQualities([]);
    setCurrentQuality('');
    setBuffered(0);
    
    while (video.firstChild) {
      video.removeChild(video.firstChild);
    }
    
    const subtitleTracks = (sources.tracks || sources.subtitles || []).filter(
      (track: any) => {
        const trackLang = track.lang || track.label || '';
        return trackLang.toLowerCase() !== 'thumbnails';
      }
    );
    
    if (subtitleTracks.length > 0) {
      const normalizedSubtitles = subtitleTracks.map((sub: any) => ({
        ...sub,
        lang: sub.lang || sub.label || 'English',
        url: sub.url || sub.file
      }));
      
      setSubtitles(normalizedSubtitles);
      normalizedSubtitles.forEach((subtitle: any, index: number) => {
        const track = document.createElement('track');
        track.kind = 'subtitles';
        track.label = subtitle.lang;
        track.srclang = subtitle.lang.toLowerCase().substring(0, 2);
        track.src = subtitle.url;
        video.appendChild(track);
      });
      
      setTimeout(() => {
        if (video.textTracks.length > 0) {
          const englishIndex = normalizedSubtitles.findIndex((s: any) => {
            return s.lang.toLowerCase().includes('english');
          });
          const defaultIndex = englishIndex !== -1 ? englishIndex : 0;
          
          for (let i = 0; i < video.textTracks.length; i++) {
            video.textTracks[i].mode = i === defaultIndex ? 'showing' : 'disabled';
          }
          setCurrentSubtitle(normalizedSubtitles[defaultIndex].lang);
        }
      }, 100);
    } else {
      setSubtitles([]);
      setCurrentSubtitle("Off");
    }

    if (videoSource.isM3U8) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
          maxBufferSize: 60 * 1000 * 1000,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          progressive: true,
          abrEwmaDefaultEstimate: 500000,
          abrBandWidthFactor: 0.95,
          abrBandWidthUpFactor: 0.7,
          startLevel: -1,
          autoStartLoad: true,
          debug: false,
        });
        hlsRef.current = hls;
        
        hls.on(Hls.Events.ERROR, (_event, data) => {
          console.log('HLS Error:', data.type, data.details, data.fatal);
          
          if (data.fatal) {
            retryCountRef.current += 1;
            
            if (retryCountRef.current > maxRetries) {
              console.error('Max retries exceeded, notifying parent to switch server');
              onPlaybackError?.('FATAL_ERROR', { 
                type: data.type, 
                details: data.details,
                message: 'Failed to play video after multiple attempts'
              });
              return;
            }
            
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log(`Network error (attempt ${retryCountRef.current}/${maxRetries}), attempting to recover...`);
                setTimeout(() => {
                  if (hlsRef.current) {
                    hls.startLoad();
                  }
                }, 1000);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log(`Media error (attempt ${retryCountRef.current}/${maxRetries}), attempting to recover...`);
                setTimeout(() => {
                  if (hlsRef.current) {
                    hls.recoverMediaError();
                  }
                }, 1000);
                break;
              default:
                console.error('Unrecoverable fatal error:', data);
                onPlaybackError?.('FATAL_ERROR', { 
                  type: data.type, 
                  details: data.details,
                  message: 'Unrecoverable playback error'
                });
                break;
            }
          }
        });

        retryCountRef.current = 0;
        hls.loadSource(videoSource.url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          const availableQualities = data.levels.map((level) => `${level.height}p`);
          setQualities(['Auto', ...availableQualities]);
          setCurrentQuality('Auto');
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          const levelHeight = hls.levels[data.level]?.height;
          if (levelHeight) {
            setCurrentQuality(`${levelHeight}p`);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoSource.url;
      }
    } else {
      video.src = videoSource.url;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [sources]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
      
      const introStart = sources?.intro?.start;
      const introEnd = sources?.intro?.end;
      const outroStart = sources?.outro?.start;
      const outroEnd = sources?.outro?.end;
      
      const hasValidIntro = introStart !== undefined && introEnd !== undefined && 
                           introStart !== introEnd && introEnd > introStart;
      const hasValidOutro = outroStart !== undefined && outroEnd !== undefined && 
                           outroStart !== outroEnd && outroEnd > outroStart;
      
      if (hasValidIntro && time >= introStart && time < introEnd) {
        setShowSkipIntro(true);
        setShowSkipOutro(false);
      } else if (hasValidOutro && time >= outroStart && time < outroEnd) {
        setShowSkipIntro(false);
        setShowSkipOutro(true);
      } else {
        setShowSkipIntro(false);
        setShowSkipOutro(false);
      }
    };
    
    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => {
      setIsPlaying(true);
      setIsBuffering(false);
    };
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsBuffering(true);
    const handleCanPlay = () => setIsBuffering(false);
    const handleEnded = () => {
      if (onVideoEnd) {
        onVideoEnd();
      }
    };
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedPercent = (bufferedEnd / video.duration) * 100;
        setBuffered(bufferedPercent);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("ended", handleEnded);
    };
  }, [sources, onVideoEnd]);

  useEffect(() => {
    setupAutoHide();
  }, [isPlaying, setupAutoHide]);


  useEffect(() => {
    const lockOrientation = async (retryCount = 0) => {
      if (!document.fullscreenElement || !window.screen?.orientation) return;
      
      const orientations = ['portrait-primary', 'portrait'];
      
      for (const orientation of orientations) {
        try {
          await (window.screen.orientation as any).lock(orientation);
          setIsPortrait(true);
          console.log(`Successfully locked to ${orientation} mode`);
          return;
        } catch (err) {
          console.log(`Failed to lock ${orientation}:`, err);
        }
      }
      
      if (retryCount < 2) {
        setTimeout(() => lockOrientation(retryCount + 1), 150);
      }
    };
    
    const handleFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      
      if (orientationLockTimeoutRef.current) {
        clearTimeout(orientationLockTimeoutRef.current);
        orientationLockTimeoutRef.current = null;
      }
      
      if (isNowFullscreen) {
        if (isMobile) {
          orientationLockTimeoutRef.current = setTimeout(() => {
            lockOrientation();
          }, 100);
        }
      } else {
        setIsPortrait(false);
        if (window.screen?.orientation && (window.screen.orientation as any).unlock) {
          try {
            (window.screen.orientation as any).unlock();
          } catch (err) {
            console.log('Failed to unlock orientation');
          }
        }
      }
      
      setTimeout(() => {
        const video = videoRef.current;
        if (!video) return;
        
        const tracks = video.textTracks;
        if (tracks.length === 0) return;
        
        for (let i = 0; i < tracks.length; i++) {
          if (currentSubtitle === "Off") {
            tracks[i].mode = 'disabled';
          } else if (tracks[i].label === currentSubtitle) {
            tracks[i].mode = 'showing';
          } else {
            tracks[i].mode = 'disabled';
          }
        }
        
        console.log(`Restored subtitle: ${currentSubtitle}`);
      }, 150);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (orientationLockTimeoutRef.current) {
        clearTimeout(orientationLockTimeoutRef.current);
      }
    };
  }, [isMobile, currentSubtitle]);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                            (window.innerWidth <= 768 && 'ontouchstart' in window);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          toggleMute();
          break;
        case "c":
        case "C":
          e.preventDefault();
          cycleSubtitles();
          break;
        case "ArrowLeft":
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case "ArrowRight":
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume((prev) => Math.min(1, prev + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume((prev) => Math.max(0, prev - 0.1));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentSubtitle, subtitles]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      try {
        await containerRef.current.requestFullscreen({ navigationUI: 'hide' });
      } catch (err) {
        try {
          await containerRef.current.requestFullscreen();
        } catch (fallbackErr) {
          console.log('Fullscreen request failed:', fallbackErr);
        }
      }
    } else {
      document.exitFullscreen();
    }
  };

  const togglePortrait = async () => {
    if (!window.screen?.orientation) return;
    
    const newPortraitState = !isPortrait;
    
    try {
      if (newPortraitState) {
        await (window.screen.orientation as any).lock('portrait-primary');
      } else {
        await (window.screen.orientation as any).lock('landscape-primary');
      }
      setIsPortrait(newPortraitState);
    } catch (err) {
      console.log('Orientation lock not supported or failed:', err);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    setIsMuted(value[0] === 0);
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        Math.max(0, videoRef.current.currentTime + seconds),
        duration
      );
    }
  };

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent, side: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    
    const now = Date.now();
    const tapDelay = 300;
    
    if (lastTapRef.current && lastTapRef.current.side === side && now - lastTapRef.current.time < tapDelay) {
      if (lastTapRef.current.count === 1) {
        const skipSeconds = side === 'right' ? 10 : -10;
        
        skip(skipSeconds);
        
        setShowSkipIndicator({ side, amount: 10 });
        
        if (skipIndicatorTimeoutRef.current) {
          clearTimeout(skipIndicatorTimeoutRef.current);
        }
        
        skipIndicatorTimeoutRef.current = setTimeout(() => {
          setShowSkipIndicator(null);
          lastTapRef.current = null;
        }, 800);
      }
      lastTapRef.current.count += 1;
      lastTapRef.current.time = now;
    } else {
      lastTapRef.current = { side, time: now, count: 1 };
    }
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const changeQuality = (quality: string) => {
    if (!hlsRef.current) return;

    if (quality === "Auto") {
      hlsRef.current.currentLevel = -1;
    } else {
      const level = hlsRef.current.levels.findIndex(
        (l) => `${l.height}p` === quality
      );
      if (level !== -1) {
        hlsRef.current.currentLevel = level;
      }
    }
    setCurrentQuality(quality);
    if (onQualityChange) onQualityChange(quality);
  };

  const changeSubtitle = (subtitle: string) => {
    const video = videoRef.current;
    if (!video) return;

    const tracks = video.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      if (subtitle === "Off") {
        tracks[i].mode = 'disabled';
      } else if (tracks[i].label === subtitle) {
        tracks[i].mode = 'showing';
      } else {
        tracks[i].mode = 'disabled';
      }
    }
    setCurrentSubtitle(subtitle);
  };

  const cycleSubtitles = () => {
    if (subtitles.length === 0) return;
    
    const options = ["Off", ...subtitles.map(s => s.lang)];
    const currentIndex = options.indexOf(currentSubtitle);
    const nextIndex = (currentIndex + 1) % options.length;
    changeSubtitle(options[nextIndex]);
  };

  const skipIntro = () => {
    if (videoRef.current && sources?.intro?.end !== undefined) {
      videoRef.current.currentTime = sources.intro.end;
      setShowSkipIntro(false);
    }
  };

  const skipOutro = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = videoRef.current.duration;
      setShowSkipOutro(false);
    }
  };

  const toggleControls = () => {
    if (!isPlaying) {
      return;
    }
    
    if (!showControls) {
      setShowControls(true);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    } else {
      setShowControls(false);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-black aspect-video w-full group rounded-lg overflow-hidden"
      onMouseMove={setupAutoHide}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      data-testid="video-player-container"
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain custom-video-subtitles"
        data-testid="video-element"
        playsInline
        crossOrigin="anonymous"
      />

      <div className="absolute top-2 left-2 z-50 pointer-events-none opacity-40">
        <span className="text-white font-bold text-base sm:text-lg drop-shadow-lg">
          Yoruhime 夜姫
        </span>
      </div>

      <div 
        className="absolute left-0 top-0 bottom-20 w-1/3 z-20 pointer-events-auto"
        onDoubleClick={(e) => handleDoubleTap(e, 'left')}
        onTouchStart={(e) => {
          e.preventDefault();
          handleDoubleTap(e, 'left');
        }}
      />
      
      <div 
        className="absolute right-0 top-0 bottom-20 w-1/3 z-20 pointer-events-auto"
        onDoubleClick={(e) => handleDoubleTap(e, 'right')}
        onTouchStart={(e) => {
          e.preventDefault();
          handleDoubleTap(e, 'right');
        }}
      />

      <div 
        className="absolute left-1/3 right-1/3 top-0 bottom-20 z-10 pointer-events-auto"
        onClick={isPlaying ? toggleControls : undefined}
      />

      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 pointer-events-none ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute inset-x-0 bottom-0 p-2 sm:p-4 transition-all duration-300 z-40 ${
          showControls ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-2 sm:space-y-3">
          <div className="relative">
            <div
              className="absolute top-1/2 -translate-y-1/2 h-1 bg-muted-foreground/30 rounded-full left-0 right-0"
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 h-1 bg-muted-foreground/50 rounded-full left-0"
              style={{ width: `${buffered}%` }}
            />
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="w-full cursor-pointer relative z-10"
              data-testid="video-progress-slider"
            />
          </div>

          <div className="flex items-center justify-between gap-1 sm:gap-2 flex-wrap">
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => skip(-10)}
                className="text-white hover:bg-white/20 shrink-0 h-8 w-8 sm:h-9 sm:w-9"
                data-testid="button-skip-back"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-white/20 shrink-0 h-8 w-8 sm:h-9 sm:w-9"
                data-testid="button-play-pause"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => skip(10)}
                className="text-white hover:bg-white/20 shrink-0 h-8 w-8 sm:h-9 sm:w-9"
                data-testid="button-skip-forward"
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              <div className="items-center gap-1 group/volume shrink-0 hidden sm:flex">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9"
                  data-testid="button-mute"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <div className="w-16 opacity-0 group-hover/volume:opacity-100 transition-opacity">
                  <Slider
                    value={[volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="cursor-pointer"
                    data-testid="volume-slider"
                  />
                </div>
              </div>

              <span className="text-white text-xs font-medium tabular-nums shrink-0">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-1">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 text-xs h-7 px-2 sm:h-8 sm:px-3"
                    data-testid="button-playback-speed"
                  >
                    {playbackRate}x
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  sideOffset={5} 
                  container={containerRef.current || undefined}
                  className="z-[9999]"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                    <DropdownMenuItem
                      key={rate}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlaybackRate(rate);
                      }}
                      data-testid={`option-speed-${rate}`}
                    >
                      {rate}x
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {qualities.length > 0 && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 text-xs h-7 px-2 sm:h-8 sm:px-3 max-w-[60px] sm:max-w-none"
                      data-testid="button-quality"
                    >
                      <span className="truncate">{currentQuality}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    sideOffset={5} 
                    container={containerRef.current || undefined}
                    className="z-[9999]"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    {qualities.map((quality) => (
                      <DropdownMenuItem
                        key={quality}
                        onClick={(e) => {
                          e.stopPropagation();
                          changeQuality(quality);
                        }}
                        data-testid={`option-quality-${quality}`}
                      >
                        {quality}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {subtitles.length > 0 && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 text-xs h-7 px-2 sm:h-8 sm:px-3 gap-1"
                      data-testid="button-subtitles"
                    >
                      <Subtitles className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{currentSubtitle}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    sideOffset={5} 
                    container={containerRef.current || undefined}
                    className="z-[9999]"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    <DropdownMenuLabel>Subtitle Track</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        changeSubtitle("Off");
                      }}
                      data-testid="option-subtitle-off"
                      className={currentSubtitle === "Off" ? "bg-accent" : ""}
                    >
                      Off
                    </DropdownMenuItem>
                    {subtitles.map((subtitle) => (
                      <DropdownMenuItem
                        key={subtitle.lang}
                        onClick={(e) => {
                          e.stopPropagation();
                          changeSubtitle(subtitle.lang);
                        }}
                        data-testid={`option-subtitle-${subtitle.lang}`}
                        className={currentSubtitle === subtitle.lang ? "bg-accent" : ""}
                      >
                        {subtitle.lang}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {isMobile && isFullscreen && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePortrait}
                  className="text-white hover:bg-white/20 shrink-0 h-8 w-8 sm:h-9 sm:w-9"
                  data-testid="button-portrait-control"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="7" y="4" width="10" height="16" rx="2" ry="2"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                    <path d="M20 12a8 8 0 1 1-8-8" opacity="0.5"/>
                    <polyline points="16 4 20 4 20 8" opacity="0.5"/>
                  </svg>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20 shrink-0 h-8 w-8 sm:h-9 sm:w-9"
                data-testid="button-fullscreen"
              >
                {isFullscreen ? (
                  <Minimize className="h-4 w-4" />
                ) : (
                  <Maximize className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="bg-black/50 backdrop-blur-sm rounded-full p-4 sm:p-6">
            <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 text-white animate-spin" />
          </div>
        </div>
      )}

      {!isPlaying && !isBuffering && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-30 pointer-events-none"
        >
          <div 
            className="bg-white/20 backdrop-blur-sm rounded-full p-4 sm:p-6 hover:bg-white/30 transition-colors pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
          >
            <Play className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
          </div>
        </div>
      )}

      {showSkipIndicator && (
        <div 
          className={`absolute top-1/2 -translate-y-1/2 z-30 pointer-events-none ${
            showSkipIndicator.side === 'left' ? 'left-8' : 'right-8'
          }`}
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center gap-1">
              <SkipBack className={`h-8 w-8 text-white ${showSkipIndicator.side === 'right' ? 'rotate-180' : ''}`} />
              <span className="text-white font-bold text-lg">{showSkipIndicator.amount}s</span>
            </div>
          </div>
        </div>
      )}

      {showSkipIntro && (
        <div className="absolute bottom-32 right-4 sm:bottom-36 sm:right-8 z-50 animate-in fade-in slide-in-from-right duration-300">
          <Button
            onClick={skipIntro}
            className="bg-white/90 hover:bg-white text-black font-semibold px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base rounded-md shadow-2xl backdrop-blur-sm border-2 border-white/50"
            data-testid="button-skip-intro"
          >
            Skip Intro
          </Button>
        </div>
      )}

      {showSkipOutro && (
        <div className="absolute bottom-32 right-4 sm:bottom-36 sm:right-8 z-50 animate-in fade-in slide-in-from-right duration-300">
          <Button
            onClick={skipOutro}
            className="bg-white/90 hover:bg-white text-black font-semibold px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base rounded-md shadow-2xl backdrop-blur-sm border-2 border-white/50"
            data-testid="button-skip-outro"
          >
            Skip Outro
          </Button>
        </div>
      )}

    </div>
  );
}
