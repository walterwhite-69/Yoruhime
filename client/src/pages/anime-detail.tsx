import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Play, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function AnimeDetail() {
  const [, params] = useRoute("/anime/:id");
  const animeId = params?.id;
  const [episodeSearch, setEpisodeSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const episodesPerPage = 20;

  const { data: animeInfo, isLoading: loadingInfo } = useQuery({
    queryKey: ["/api/anime", animeId, "info"],
    enabled: !!animeId,
  });

  const { data: episodesData, isLoading: loadingEpisodes } = useQuery({
    queryKey: ["/api/anime", animeId, "episodes"],
    enabled: !!animeId,
    refetchInterval: 1000 * 60 * 5,
    refetchIntervalInBackground: true,
    staleTime: 1000 * 60 * 3,
  });

  const episodes = episodesData?.episodes || [];

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

  const totalPages = Math.ceil(filteredEpisodes.length / episodesPerPage);

  if (loadingInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!animeInfo?.anime?.info) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Anime not found</p>
      </div>
    );
  }

  const info = animeInfo.anime.info;
  const moreInfo = animeInfo.anime.moreInfo;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-[50vh] w-full overflow-hidden">
        <img
          src={info.poster}
          alt={info.name}
          className="absolute inset-0 w-full h-full object-cover blur-sm scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto flex gap-6">
            <img
              src={info.poster}
              alt={info.name}
              className="w-32 md:w-48 aspect-[2/3] object-cover rounded-lg shadow-xl hidden sm:block"
            />
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-bold mb-3 text-white drop-shadow-lg">
                {info.name}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {info.stats?.rating && (
                  <Badge variant="secondary" className="bg-primary/90 backdrop-blur-sm text-primary-foreground">
                    ⭐ {info.stats.rating}
                  </Badge>
                )}
                {info.stats?.quality && (
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                    {info.stats.quality}
                  </Badge>
                )}
                {info.stats?.episodes?.sub && (
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                    {info.stats.episodes.sub} Episodes
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Synopsis</h2>
              <p className="text-muted-foreground leading-relaxed">{info.description}</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Episodes</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search episode..."
                      value={episodeSearch}
                      onChange={(e) => {
                        setEpisodeSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-9 w-48"
                      data-testid="input-episode-search"
                    />
                  </div>
                </div>
              </div>

              {loadingEpisodes ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
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
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-3 px-3 hover-elevate active-elevate-2"
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
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        data-testid="button-prev-page"
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
                        data-testid="button-next-page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground text-center">
                    Showing {paginatedEpisodes.length} of {filteredEpisodes.length} episodes
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <h3 className="font-semibold">Information</h3>
                {moreInfo?.japanese && (
                  <div>
                    <p className="text-xs text-muted-foreground">Japanese</p>
                    <p className="text-sm">{moreInfo.japanese}</p>
                  </div>
                )}
                {moreInfo?.aired && (
                  <div>
                    <p className="text-xs text-muted-foreground">Aired</p>
                    <p className="text-sm">
                      {typeof moreInfo.aired === 'object' 
                        ? `${moreInfo.aired.from || '?'} to ${moreInfo.aired.to || '?'}`
                        : moreInfo.aired}
                    </p>
                  </div>
                )}
                {moreInfo?.status && (
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="text-sm">{moreInfo.status}</p>
                  </div>
                )}
                {moreInfo?.genres && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Genres</p>
                    <div className="flex flex-wrap gap-1">
                      {(typeof moreInfo.genres === 'string' ? moreInfo.genres.split(", ") : moreInfo.genres).map((genre: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
