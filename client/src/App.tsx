import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { SiteShell } from "./components/SiteShell";
import Article from "./pages/Article";
import Category from "./pages/Category";
import Archive from "./pages/Archive";
import Digest from "./pages/Digest";
import Games from "./pages/Games";
import Guides from "./pages/Guides";
import ResponsibleEntertainment from "./pages/ResponsibleEntertainment";
import About from "./pages/About";
import Search from "./pages/Search";
import Articles from "./pages/Articles";
import GameDetail from "./pages/GameDetail";
import History from "./pages/History";
import Culture from "./pages/Culture";
import Destinations from "./pages/Destinations";
import Vlogs from "./pages/Vlogs";
import Facts from "./pages/Facts";
import Gallery from "./pages/Gallery";
import { Disclaimer, Privacy, Terms } from "./pages/LegalPages";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <SiteShell>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/articles"} component={Articles} />
        <Route path={"/articles/:slug"} component={Article} />
        <Route path={"/category/:slug"} component={Category} />
        <Route path={"/archive"} component={Archive} />
        <Route path={"/archive/:date"} component={Digest} />
        <Route path={"/games"} component={Games} />
        <Route path={"/games/:slug"} component={GameDetail} />
        <Route path={"/history"} component={History} />
        <Route path={"/culture"} component={Culture} />
        <Route path={"/destinations"} component={Destinations} />
        <Route path={"/vlogs"} component={Vlogs} />
        <Route path={"/facts"} component={Facts} />
        <Route path={"/gallery"} component={Gallery} />
        <Route path={"/privacy"} component={Privacy} />
        <Route path={"/disclaimer"} component={Disclaimer} />
        <Route path={"/terms"} component={Terms} />
        <Route path={"/guides"} component={Guides} />
        <Route path={"/responsible-entertainment"} component={ResponsibleEntertainment} />
        <Route path={"/about"} component={About} />
        <Route path={"/search"} component={Search} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </SiteShell>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
