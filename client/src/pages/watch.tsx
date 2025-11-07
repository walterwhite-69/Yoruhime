import { useQuery } from "@tanstack/react-query";
import { useRoute, useSearch, Link, useLocation } from "wouter";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function Watch() {
  const [, params] = useRoute("/watch/:id");
  const search = useSearch();
  const [, setLocation] = useLocation();
  
  const { animeId, episodeId } = useMemo(() => {
    let id = params?.id ? decodeURIComponent(params.id) : undefined;
    let epId: string | null = null;
    
    if (id && id.includes('?ep=')) {
      const parts = id.split('?ep=');
      id = parts[0];
      epId = parts[1];
    } else {
      const epParam = new URLSearchParams(search).get("ep");
      epId = epParam;
    }
    
    return { animeId: id, episodeId: epId };
  }, [params?.id, search]);

  const [selectedLanguage, setSelectedLanguage] = useState<'sub' | 'dub'>('sub');
  const [episodeSearch, setEpisodeSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const episodesPerPage = 20;

  const { data: animeInfo } = useQuery({
    queryKey: ["/api/anime", animeId, "info"],
    enabled: !!animeId,
  });

  const { data: episodesData } = useQuery({
    queryKey: ["/api/anime", animeId, "episodes"],
    enabled: !!animeId,
    refetchInterval: 1000 * 60 * 5,
    refetchIntervalInBackground: true,
    staleTime: 1000 * 60 * 3,
  });

  const episodes = (episodesData as any)?.episodes || [];

  const filteredEpisodes = useMemo(() => {
    if (!episodes || episodes.length === 0) return [];
    if (!episodeSearch) return episodes;
    return episodes.filter((ep: any) =>
      ep.number?.toString().includes(episodeSearch) ||
      ep.title?.toLowerCase().includes(episodeSearch.toLowerCase())
    );
  }, [episodes, episodeSearch]);

  const paginatedEpisodes = useMemo(() => {
    const start = (currentPage - 1) * episodesPerPage;
    return filteredEpisodes.slice(start, start + episodesPerPage);
  }, [filteredEpisodes, currentPage]);

  const currentEpisodeIndex = useMemo(() => {
    return episodes.findIndex((ep: any) => {
      const epNumber = ep.episodeId?.includes('::ep=') 
        ? ep.episodeId.split('::ep=')[1]
        : ep.episodeId?.includes('?ep=') 
        ? ep.episodeId.split('?ep=')[1]
        : ep.episodeId;
      return epNumber === episodeId;
    });
  }, [episodes, episodeId]);

  const currentEpisode = useMemo(() => {
    return episodes.find((ep: any) => {
      const epNumber = ep.episodeId?.includes('::ep=') 
        ? ep.episodeId.split('::ep=')[1]
        : ep.episodeId?.includes('?ep=') 
        ? ep.episodeId.split('?ep=')[1]
        : ep.episodeId;
      return epNumber === episodeId;
    });
  }, [episodes, episodeId]);
  
  const hiAnimeEpisodeId = useMemo(() => {
    if (!currentEpisode?.episodeId) return null;
    
    if (currentEpisode.episodeId.includes('::ep=')) {
      return currentEpisode.episodeId.split('::ep=')[1];
    } else if (currentEpisode.episodeId.includes('?ep=')) {
      return currentEpisode.episodeId.split('?ep=')[1];
    }
    return currentEpisode.episodeId;
  }, [currentEpisode]);
  
  const embedUrl = hiAnimeEpisodeId 
    ? `https://megaplay.buzz/stream/s-2/${hiAnimeEpisodeId}/${selectedLanguage}` 
    : null;
  
  const isDubAvailable = useMemo(() => {
    const info = animeInfo as any;
    if (!info?.anime?.info?.stats?.episodes) return false;
    const dubCount = info.anime.info.stats.episodes.dub;
    const currentEpNumber = currentEpisode?.number || 0;
    return dubCount && dubCount > 0 && currentEpNumber <= dubCount;
  }, [animeInfo, currentEpisode]);

  const nextEpisode = useMemo(() => {
    if (currentEpisodeIndex >= 0 && currentEpisodeIndex < episodes.length - 1) {
      return episodes[currentEpisodeIndex + 1];
    }
    return null;
  }, [episodes, currentEpisodeIndex]);

  const nextEpisodeNumber = useMemo(() => {
    if (!nextEpisode) return null;
    const epNumber = nextEpisode.episodeId?.includes('::ep=') 
      ? nextEpisode.episodeId.split('::ep=')[1]
      : nextEpisode.episodeId?.includes('?ep=') 
      ? nextEpisode.episodeId.split('?ep=')[1]
      : nextEpisode.episodeId;
    return epNumber;
  }, [nextEpisode]);

  const totalPages = Math.ceil(filteredEpisodes.length / episodesPerPage);

  useEffect(() => {
    if (!isDubAvailable && selectedLanguage === 'dub') {
      setSelectedLanguage('sub');
    }
  }, [isDubAvailable, selectedLanguage]);

  useEffect(() => {
    const BLOCK_PATTERNS = [
      /zazengraph\.shop/i,
      /muermoabject\.shop/i,
      /doubleclick\.net/i,
      /googlesyndication\.com/i,
      /adsystem\.com/i,
      /adservice\.google/i,
      /popads/i,
      /adnxs\.com/i,
      /outbrain\.com/i,
      /taboola\.com/i,
      /propellerads/i,
      /exoclick/i,
      /adsterra/i
    ];

    const WHITELIST_PATTERNS = [
      /megaplay\.buzz/i,
      /megacloud/i,
      /vidstreaming/i,
      /streamsb/i,
      /streamtape/i,
      /hianime/i,
      /mp4upload/i,
      /filemoon/i
    ];

    const shouldBlock = (src: string) => {
      if (!src) return false;
      if (WHITELIST_PATTERNS.some(pattern => pattern.test(src))) {
        return false;
      }
      return BLOCK_PATTERNS.some(pattern => pattern.test(src));
    };

    const removeIfBlocked = (el: HTMLElement) => {
      const src = (el as any).src || (el as any).data || '';
      if (shouldBlock(src)) {
        console.warn('[AdBlocker] Blocked ad iframe:', src);
        el.remove();
      }
    };

    const blockNavigation = (e: Event) => {
      const target = e.target as HTMLElement;
      const clickedLink = target.closest('a');
      if (clickedLink && clickedLink.href) {
        if (shouldBlock(clickedLink.href)) {
          e.preventDefault();
          e.stopPropagation();
          console.warn('[AdBlocker] Blocked navigation to:', clickedLink.href);
        }
      }
    };

    const scanExisting = () => {
      document.querySelectorAll('iframe, embed, object').forEach(el => removeIfBlocked(el as HTMLElement));
    };

    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== 1) return;
          const element = node as HTMLElement;
          if (['IFRAME', 'EMBED', 'OBJECT'].includes(element.tagName)) {
            removeIfBlocked(element);
          } else if (element.querySelectorAll) {
            element.querySelectorAll('iframe, embed, object').forEach(el => removeIfBlocked(el as HTMLElement));
          }
        });
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    document.addEventListener('click', blockNavigation, true);
    scanExisting();

    return () => {
      observer.disconnect();
      document.removeEventListener('click', blockNavigation, true);
    };
  }, []);

  if (!episodeId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No episode selected</p>
      </div>
    );
  }

  const handleVideoEnd = () => {
    if (nextEpisodeNumber && animeId) {
      setLocation(`/watch/${animeId}?ep=${nextEpisodeNumber}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="w-full aspect-video">
          <iframe
            key={`${episodeId}-${selectedLanguage}`}
            src={embedUrl || undefined}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            allowFullScreen
            className="rounded-lg"
          />
        </div>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Language</h3>
            {currentEpisode?.filler && (
              <div className="mb-4 p-3 bg-gradient-to-r from-amber-700/20 via-yellow-800/20 to-orange-700/20 border border-amber-700/40 rounded-lg backdrop-blur-sm">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-500">
                  You're watching a filler episode🤓☝️
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedLanguage === 'sub' ? "default" : "outline"}
                onClick={() => setSelectedLanguage('sub')}
                data-testid="button-language-sub"
              >
                🎌 SUB
              </Button>
              {isDubAvailable && (
                <Button
                  variant={selectedLanguage === 'dub' ? "default" : "outline"}
                  onClick={() => setSelectedLanguage('dub')}
                  data-testid="button-language-dub"
                >
                  🎙️ DUB
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {episodes.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Episodes ({filteredEpisodes.length})</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search episodes..."
                      value={episodeSearch}
                      onChange={(e) => {
                        setEpisodeSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-9 w-64"
                      data-testid="input-episode-search"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {paginatedEpisodes.map((episode: any) => {
                  const epNumber = episode.episodeId?.includes('::ep=') 
                    ? episode.episodeId.split('::ep=')[1]
                    : episode.episodeId?.includes('?ep=') 
                    ? episode.episodeId.split('?ep=')[1]
                    : episode.episodeId;
                  return (
                  <Link
                    key={episode.episodeId}
                    href={`/watch/${animeId}?ep=${encodeURIComponent(epNumber)}`}
                  >
                    <Button
                      variant={episode.filler ? "outline" : (episodeId === epNumber ? "default" : "outline")}
                      className={`w-full justify-start text-left h-auto py-3 px-3 ${
                        episode.filler 
                          ? episodeId === epNumber
                            ? "bg-amber-700 hover:bg-amber-800 border-amber-600 text-white"
                            : "border-amber-600/50 bg-amber-700/5 text-amber-700 dark:text-amber-400 hover:bg-amber-700/10 hover:border-amber-600"
                          : ""
                      }`}
                      data-testid={`button-episode-${episode.number}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {episode.number} - {episode.title || `Episode ${episode.number}`}
                        </div>
                      </div>
                    </Button>
                  </Link>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    data-testid="button-page-prev"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    data-testid="button-page-next"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
