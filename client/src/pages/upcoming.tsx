import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function Upcoming() {
  const { data: trending, isLoading } = useQuery({
    queryKey: ["/api/trending"],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">Top Upcoming</h1>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {trending?.topUpcomingAnimes?.map((anime: any, index: number) => (
              <Link key={`upcoming-${anime.id}-${index}`} href={`/anime/${anime.id}`}>
                <Card
                  className="group cursor-pointer overflow-hidden border-0 bg-transparent hover-elevate active-elevate-2 transition-all duration-200"
                  data-testid={`card-upcoming-${anime.id}`}
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
                    <img
                      src={anime.poster}
                      alt={anime.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {anime.rank && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-xs bg-primary/90 backdrop-blur-sm text-primary-foreground">
                          #{anime.rank}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="pt-2 px-1">
                    <h3 className="text-sm font-medium line-clamp-2" title={anime.name}>
                      {anime.name}
                    </h3>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
