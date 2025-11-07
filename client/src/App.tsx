import { Switch, Route, useRoute } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import AnimeDetail from "@/pages/anime-detail";
import Watch from "@/pages/watch";
import SearchPage from "@/pages/search";
import Trending from "@/pages/trending";
import Popular from "@/pages/popular";
import LatestEpisodes from "@/pages/latest-episodes";
import Upcoming from "@/pages/upcoming";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/home" component={Home} />
      <Route path="/anime/:id" component={AnimeDetail} />
      <Route path="/watch/:id" component={Watch} />
      <Route path="/search" component={SearchPage} />
      <Route path="/top-airing" component={Home} />
      <Route path="/trending" component={Trending} />
      <Route path="/popular" component={Popular} />
      <Route path="/latest-episodes" component={LatestEpisodes} />
      <Route path="/upcoming" component={Upcoming} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ConditionalNavbar() {
  const [isLanding] = useRoute("/");
  
  if (isLanding) {
    return null;
  }
  
  return <Navbar />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ConditionalNavbar />
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
