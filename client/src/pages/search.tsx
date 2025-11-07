import { useQuery } from "@tanstack/react-query";
import { useSearch, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { memo } from "react";

const AnimeCard = memo(({ anime }: { anime: any }) => (
  <Link href={`/anime/${anime.id}`}>
    <Card className="group cursor-pointer overflow-hidden border-0 bg-transparent hover-elevate active-elevate-2 transition-transform duration-200" data-testid={`card-anime-${anime.id}`}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
        <img src={anime.poster} alt={anime.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        {anime.episodes?.sub && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs bg-background/90 backdrop-blur-sm">{anime.episodes.sub} eps</Badge>
          </div>
        )}
      </div>
      <div className="pt-2">
        <h3 className="text-sm font-medium line-clamp-2" title={anime.name}>{anime.name}</h3>
        <p className="text-xs text-muted-foreground mt-1">{anime.type}</p>
      </div>
    </Card>
  </Link>
));

AnimeCard.displayName = "AnimeCard";

export default function SearchPage() {
  const search = useSearch();
  const query = new URLSearchParams(search).get("q") || "";

  const { data: results, isLoading } = useQuery<{ animes: any[] }>({
    queryKey: ["/api/search", { q: query }],
    enabled: !!query,
    staleTime: 1000 * 60 * 2,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-muted-foreground mb-8">{query ? `Results for "${query}"` : "Enter a search query"}</p>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : results?.animes && results.animes.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            {results.animes.map((anime) => <AnimeCard key={anime.id} anime={anime} />)}
          </div>
        ) : query ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground">No results found for "{query}"</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
