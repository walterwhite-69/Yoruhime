import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SiX, SiFacebook, SiReddit, SiTelegram, SiGithub } from "react-icons/si";

export default function Landing() {
  const [, setLocation] = useLocation();

  const { data: trending } = useQuery({
    queryKey: ["/api/trending"],
    staleTime: 1000 * 60 * 5,
  });

  const topSearchKeywords = [
    "One Piece",
    "Chainsaw Man",
    "My Hero Academia",
    "Demon Slayer",
    "Jujutsu Kaisen",
    "Attack on Titan",
    "Naruto",
    "Dragon Ball",
    "Death Note",
    "Tokyo Ghoul"
  ];

  const spotlightAnime = (trending as any)?.spotlightAnimes?.[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {spotlightAnime && (
          <>
            <img
              src={spotlightAnime.poster}
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/70 to-background" />
          </>
        )}

        <div className="relative z-10 w-full max-w-5xl px-6 py-16 text-center space-y-8">
          <div className="space-y-4">
            <h1 
              className="text-5xl md:text-7xl font-black text-foreground"
              data-testid="text-landing-title"
            >
              Yoruhime
            </h1>
            <p className="text-2xl md:text-3xl font-bold text-muted-foreground">
              夜姫
            </p>
          </div>

          <div className="w-full max-w-2xl mx-auto">
            <LandingSearch />
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Top search:</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {topSearchKeywords.map((keyword) => (
                <Link key={keyword} href={`/search?q=${encodeURIComponent(keyword)}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hover-elevate active-elevate-2"
                    data-testid={`button-keyword-${keyword.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {keyword}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={() => setLocation("/home")}
              size="lg"
              className="px-8 py-6 text-lg font-semibold"
              data-testid="button-watch-anime"
            >
              Watch anime
            </Button>
          </div>
        </div>
      </div>

      <div className="border-y bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Share Yoruhime to your friends
          </h2>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              className="hover-elevate active-elevate-2 gap-2"
              onClick={() => window.open(`https://telegram.me/share/url?url=${encodeURIComponent(window.location.href)}`, '_blank')}
              data-testid="button-share-telegram"
            >
              <SiTelegram className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hover-elevate active-elevate-2 gap-2"
              onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`, '_blank')}
              data-testid="button-share-twitter"
            >
              <SiX className="h-4 w-4" />
              Tweet
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hover-elevate active-elevate-2 gap-2"
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
              data-testid="button-share-facebook"
            >
              <SiFacebook className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hover-elevate active-elevate-2 gap-2"
              onClick={() => window.open(`https://reddit.com/submit?url=${encodeURIComponent(window.location.href)}`, '_blank')}
              data-testid="button-share-reddit"
            >
              <SiReddit className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">
            Yoruhime - The best site to watch anime online for Free
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Do you know that according to Google, the monthly search volume for anime related topics is up to over 1 Billion times? 
            Anime is famous worldwide and it is no wonder we've seen a sharp rise in the number of free anime streaming sites.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            Just like free online movie streaming sites, anime watching sites are not created equally, some are better than the rest, 
            so we've decided to build Yoruhime to be one of the best free anime streaming site for all anime fans on the world.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">1/ What is Yoruhime?</h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Yoruhime is a free site to watch anime where you can enjoy subbed or dubbed anime in ultra HD quality without any 
            registration or payment. We provide a clean and safe streaming experience for all anime fans.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">2/ Is Yoruhime safe?</h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Yes, we prioritize user safety and maintain a clean streaming environment. If you find any suspicious content, 
            please forward us the info and we will address it immediately.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">3/ So what makes Yoruhime the best site to watch anime free online?</h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Before building Yoruhime, we've checked many other free anime sites, and learnt from them. We only keep the good things 
            and remove all the bad things from all the competitors, to put it in our Yoruhime website. Let's see how we're so confident 
            about being the best site for anime streaming:
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Safety:</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                We maintain a safe streaming environment for all users.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Content library:</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Our main focus is anime. You can find here popular, classic, as well as current titles from all genres such as action, 
                drama, kids, fantasy, horror, mystery, police, romance, school, comedy, music, game and many more. All these titles come 
                with English subtitles or are dubbed in many languages.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Quality/Resolution:</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                All titles are in excellent resolution, the best quality possible. Yoruhime also has a quality setting function to make 
                sure our users can enjoy streaming no matter how fast your Internet speed is. You can stream the anime at 360p if your 
                Internet is being ridiculous, Or if it is good, you can go with 720p or even 1080p anime.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Streaming experience:</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Compared to other anime streaming sites, the loading speed at Yoruhime is faster. Downloading is just as easy as streaming, 
                you won't have any problem saving the videos to watch offline later.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Updates:</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                We updates new titles as well as fulfill the requests on a daily basis so be warned, you will never run out of what to 
                watch on Yoruhime.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">User interface:</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Our UI and UX makes it easy for anyone, no matter how old you are, how long have you been on the Internet. Literally, 
                you can figure out how to navigate our site after a quick look. If you want to watch a specific title, search for it via 
                the search box. If you want to look for suggestions, you can use the site's categories or simply scroll down for new releases.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Device compatibility:</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Yoruhime works alright on both your mobile and desktop. However, we'd recommend you use your desktop for a smoother 
                streaming experience.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Customer care:</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                We are in active mode 24/7. You can always contact us for any help, query, or business-related inquiry. On our previous 
                projects, we were known for our great customer service as we were quick to fix broken links or upload requested content.
              </p>
            </div>
          </div>

          <p className="text-base text-muted-foreground leading-relaxed pt-4">
            So if you're looking for a trustworthy and safe site for your Anime streaming, let's give Yoruhime a try. And if you like us, 
            please help us to spread the words and do not forget to bookmark our site.
          </p>
          <p className="text-base text-muted-foreground font-semibold">
            Thank you!
          </p>
        </div>
      </div>

      <div className="border-t mt-12">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center space-y-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-12 w-12 hover-elevate active-elevate-2"
            onClick={() => window.open("https://github.com/walterwhite-69", "_blank")}
            data-testid="button-github"
          >
            <SiGithub className="h-5 w-5" />
          </Button>
          <p className="text-sm text-muted-foreground">© Yoruhime. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

function LandingSearch() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: suggestions } = useQuery({
    queryKey: ["/api/search/suggestions", { q: searchQuery }],
    enabled: searchQuery.length > 0,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (animeId: string) => {
    setSearchQuery("");
    setShowSuggestions(false);
    const cleanId = animeId.split('?')[0];
    setLocation(`/anime/${cleanId}`);
  };

  const suggestionsList = (suggestions as any)?.suggestions || [];

  return (
    <div ref={wrapperRef} className="relative">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
          <input
            type="text"
            placeholder="Search anime..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full pl-12 pr-6 py-4 text-base bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            data-testid="input-landing-search"
          />
        </div>
      </form>

      {showSuggestions && suggestionsList.length > 0 && (
        <div className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto z-50 bg-popover border border-border rounded-lg shadow-lg">
          <div className="p-2 space-y-1">
            {suggestionsList.map((suggestion: any) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion.id)}
                className="w-full text-left p-3 hover-elevate active-elevate-2 rounded-md flex items-center gap-4 transition-all"
                data-testid={`suggestion-${suggestion.id}`}
              >
                <div className="relative shrink-0 overflow-hidden rounded-md">
                  <img
                    src={suggestion.poster}
                    alt={suggestion.name}
                    className="w-12 h-16 object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {suggestion.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {suggestion.jname}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
