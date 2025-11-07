import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Play, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState, useMemo, memo, useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { SiGithub } from "react-icons/si";

const AnimeCard = memo(({ anime, type }: { anime: any; type: string }) => (
  <Link href={`/anime/${anime.id}`}>
    <Card className="group cursor-pointer overflow-hidden border-0 bg-transparent hover-elevate transition-transform duration-150 will-change-transform" data-testid={`card-${type}-${anime.id}`} style={{ contain: 'layout style paint' }}>
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
        <img 
          src={anime.poster} 
          alt={anime.name} 
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105 will-change-transform" 
          loading="lazy" 
          decoding="async"
          style={{ transform: 'translateZ(0)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
        {anime.rank && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs bg-primary/90 backdrop-blur-sm text-primary-foreground">#{anime.rank}</Badge>
          </div>
        )}
        {anime.type && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs bg-background/90 backdrop-blur-sm">{anime.type}</Badge>
          </div>
        )}
        {anime.episodes?.sub && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs bg-primary/90 backdrop-blur-sm text-primary-foreground">EP {anime.episodes.sub}</Badge>
          </div>
        )}
      </div>
      <div className="pt-2 px-1">
        <h3 className="text-sm font-medium line-clamp-2" title={anime.name}>{anime.name}</h3>
        {anime.duration && <p className="text-xs text-muted-foreground mt-1">{anime.duration}</p>}
      </div>
    </Card>
  </Link>
));

AnimeCard.displayName = "AnimeCard";

const SpotlightSlide = memo(({ anime, index, isActive }: { anime: any; index: number; isActive: boolean }) => (
  <div className="relative flex-[0_0_100%] min-w-0" style={{ contain: 'layout style paint' }}>
    <img 
      src={anime.poster} 
      alt={anime.name} 
      className="absolute inset-0 w-full h-full object-cover" 
      loading={index < 2 ? "eager" : "lazy"}
      decoding="async"
      style={{ transform: 'translateZ(0)', willChange: isActive ? 'transform' : 'auto' }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" style={{ transform: 'translateZ(0)' }} />
    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 lg:p-16">
      <div className="max-w-7xl mx-auto">
        <Badge variant="secondary" className="bg-primary/90 backdrop-blur-sm text-primary-foreground mb-2">#{anime.rank} Spotlight</Badge>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 text-white drop-shadow-lg line-clamp-2">{anime.name}</h1>
        <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
          {anime.otherInfo?.slice(0, 5).map((info: string, i: number) => (
            <Badge key={i} variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs md:text-sm">{info}</Badge>
          ))}
        </div>
        <p className="text-sm md:text-base lg:text-lg text-gray-200 max-w-3xl mb-4 md:mb-6 line-clamp-2 md:line-clamp-3 drop-shadow-md">{anime.description}</p>
        <Link href={`/anime/${anime.id}`}>
          <Button className="inline-flex items-center gap-2" data-testid="button-watch-now">
            <Play className="h-4 w-4 md:h-5 md:w-5" />
            Watch Now
          </Button>
        </Link>
      </div>
    </div>
  </div>
));

SpotlightSlide.displayName = "SpotlightSlide";

const LazySection = memo(({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { 
        rootMargin: '300px',
        threshold: 0.01
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [isVisible]);

  return (
    <section ref={sectionRef} className={className} style={{ contain: 'layout style paint', minHeight: isVisible ? 'auto' : '300px' }}>
      {isVisible ? children : <div className="h-72 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}
    </section>
  );
});

LazySection.displayName = "LazySection";

export default function Home() {
  const { data: trending, isLoading: loadingTrending } = useQuery({ 
    queryKey: ["/api/trending"], 
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10
  });
  
  const { data: topAiring, isLoading: loadingAiring } = useQuery({ 
    queryKey: ["/api/top-airing"], 
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10
  });

  const autoplayPlugin = useMemo(() => Autoplay({ 
    delay: 5000, 
    stopOnInteraction: false, 
    stopOnMouseEnter: false 
  }), []);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    duration: 20, 
    align: 'start', 
    containScroll: 'trimSnaps',
    skipSnaps: false,
    dragFree: false
  }, [autoplayPlugin]);
  
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const onSelect = useCallback(() => { 
    if (emblaApi) setSelectedIndex(emblaApi.selectedScrollSnap()); 
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const spotlightAnimes = useMemo(() => (trending as any)?.spotlightAnimes || [], [trending]);
  const trendingAnimes = useMemo(() => (trending as any)?.trendingAnimes || [], [trending]);
  const popularAnimes = useMemo(() => (trending as any)?.mostPopularAnimes || [], [trending]);
  const latestAnimes = useMemo(() => (trending as any)?.latestEpisodeAnimes || [], [trending]);
  const upcomingAnimes = useMemo(() => (trending as any)?.topUpcomingAnimes || [], [trending]);
  const airingResults = useMemo(() => (topAiring as any)?.results || [], [topAiring]);

  return (
    <div className="min-h-screen bg-background">
      {loadingTrending ? (
        <div className="h-[70vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : spotlightAnimes.length > 0 ? (
        <div className="relative h-[70vh] w-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-full transition-transform duration-700 ease-out" style={{ transform: 'translateZ(0)' }}>
            {spotlightAnimes.map((anime: any, index: number) => (
              <SpotlightSlide 
                key={anime.id || index} 
                anime={anime} 
                index={index}
                isActive={index === selectedIndex}
              />
            ))}
          </div>
          <Button variant="outline" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm" onClick={scrollPrev} data-testid="button-carousel-prev">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm" onClick={scrollNext} data-testid="button-carousel-next">
            <ChevronRight className="h-5 w-5" />
          </Button>
          <div className="absolute bottom-20 md:bottom-32 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {spotlightAnimes.map((_: any, index: number) => (
              <button 
                key={index} 
                className={`h-1.5 rounded-full transition-all duration-300 ${index === selectedIndex ? "w-8 bg-primary" : "w-1.5 bg-white/50 hover:bg-white/75"}`} 
                onClick={() => emblaApi?.scrollTo(index)} 
                data-testid={`button-carousel-dot-${index}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-10">
        {loadingAiring ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : airingResults.length > 0 ? (
          <LazySection>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Top Airing</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4" style={{ willChange: 'auto' }}>
              {airingResults.slice(0, 18).map((anime: any, index: number) => <AnimeCard key={`airing-${anime.id}-${index}`} anime={anime} type="airing" />)}
            </div>
          </LazySection>
        ) : null}

        {trendingAnimes.length > 0 && (
          <LazySection>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Trending Now</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4" style={{ willChange: 'auto' }}>
              {trendingAnimes.slice(0, 12).map((anime: any, index: number) => <AnimeCard key={`trending-${anime.id}-${index}`} anime={anime} type="trending" />)}
            </div>
          </LazySection>
        )}

        {popularAnimes.length > 0 && (
          <LazySection>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Most Popular</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4" style={{ willChange: 'auto' }}>
              {popularAnimes.slice(0, 12).map((anime: any, index: number) => <AnimeCard key={`popular-${anime.id}-${index}`} anime={anime} type="popular" />)}
            </div>
          </LazySection>
        )}

        {latestAnimes.length > 0 && (
          <LazySection>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Latest Episodes</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4" style={{ willChange: 'auto' }}>
              {latestAnimes.slice(0, 12).map((anime: any, index: number) => <AnimeCard key={`latest-${anime.id}-${index}`} anime={anime} type="latest" />)}
            </div>
          </LazySection>
        )}

        {upcomingAnimes.length > 0 && (
          <LazySection>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Top Upcoming</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4" style={{ willChange: 'auto' }}>
              {upcomingAnimes.slice(0, 12).map((anime: any, index: number) => <AnimeCard key={`upcoming-${anime.id}-${index}`} anime={anime} type="upcoming" />)}
            </div>
          </LazySection>
        )}
      </div>

      <div className="border-t mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center space-y-4">
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12 hover-elevate active-elevate-2" onClick={() => window.open("https://github.com/walterwhite-69", "_blank")} data-testid="button-github">
            <SiGithub className="h-5 w-5" />
          </Button>
          <p className="text-sm text-muted-foreground">© Yoruhime. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
