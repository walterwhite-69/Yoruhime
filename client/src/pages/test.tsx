import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function TestPage() {
  const [selectedAnime, setSelectedAnime] = useState<any>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);
  const [selectedServer, setSelectedServer] = useState<any>(null);

  const { data: topAiring, isLoading: loadingAiring, error: errorAiring } = useQuery({
    queryKey: ["/api/top-airing"],
  });

  const { data: episodes, isLoading: loadingEpisodes, error: errorEpisodes } = useQuery({
    queryKey: ["/api/anime", selectedAnime?.dataId, "episodes"],
    enabled: !!selectedAnime?.dataId,
  });

  const { data: servers, isLoading: loadingServers, error: errorServers } = useQuery({
    queryKey: ["/api/episode", selectedEpisode?.id, "servers"],
    enabled: !!selectedEpisode,
  });

  const { data: sources, isLoading: loadingSources, error: errorSources } = useQuery({
    queryKey: ["/api/episode/sources", selectedServer?.id],
    enabled: !!selectedServer,
  });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold">HiAnime API Test</h1>

        <Card>
          <CardHeader>
            <CardTitle>Step 1: Top Airing Anime</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAiring ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {topAiring?.results?.map((anime: any) => (
                  <Card
                    key={anime.id}
                    className={`cursor-pointer transition-all hover-elevate active-elevate-2 ${
                      selectedAnime?.id === anime.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => {
                      setSelectedAnime(anime);
                      setSelectedEpisode(null);
                      setSelectedServer(null);
                    }}
                    data-testid={`card-anime-${anime.id}`}
                  >
                    <img
                      src={anime.poster}
                      alt={anime.title}
                      className="w-full aspect-[2/3] object-cover rounded-t-lg"
                    />
                    <CardContent className="p-3">
                      <p className="text-sm font-medium line-clamp-2">{anime.title}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedAnime && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Episodes for {selectedAnime.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingEpisodes ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading episodes...</span>
                </div>
              ) : errorEpisodes ? (
                <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                  <p className="font-semibold">Error loading episodes</p>
                  <p className="text-sm mt-1">{(errorEpisodes as any)?.message || "Unknown error"}</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {episodes?.map((episode: any) => (
                    <Button
                      key={episode.id}
                      variant={selectedEpisode?.id === episode.id ? "default" : "outline"}
                      onClick={() => {
                        setSelectedEpisode(episode);
                        setSelectedServer(null);
                      }}
                      data-testid={`button-episode-${episode.number}`}
                    >
                      {episode.number}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedEpisode && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Available Servers</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingServers ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading servers...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Sub Servers:</h3>
                    <div className="flex flex-wrap gap-2">
                      {servers?.sub?.map((server: any) => (
                        <Button
                          key={server.id}
                          variant={selectedServer?.id === server.id ? "default" : "outline"}
                          onClick={() => setSelectedServer(server)}
                          data-testid={`button-server-${server.name}`}
                        >
                          {server.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {servers?.dub && servers.dub.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Dub Servers:</h3>
                      <div className="flex flex-wrap gap-2">
                        {servers.dub.map((server: any) => (
                          <Button
                            key={server.id}
                            variant={selectedServer?.id === server.id ? "default" : "outline"}
                            onClick={() => setSelectedServer(server)}
                            data-testid={`button-server-${server.name}`}
                          >
                            {server.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedServer && (
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Video Player</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingSources ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading video sources...</span>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Available Sources:</h3>
                    {sources?.sources?.map((source: any, idx: number) => (
                      <div key={idx} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">Type:</span> {source.type}
                        </p>
                        <p className="text-xs text-muted-foreground break-all mt-1">
                          {source.file}
                        </p>
                      </div>
                    ))}
                  </div>

                  {sources?.sources?.[0] && (
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Video Player:</h3>
                      <video
                        controls
                        className="w-full rounded-lg bg-black"
                        data-testid="video-player"
                      >
                        <source src={sources.sources[0].file} type="application/x-mpegURL" />
                        Your browser does not support the video tag.
                      </video>
                      <p className="text-xs text-muted-foreground mt-2">
                        Note: HLS streams may require additional player libraries like hls.js for full support
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
