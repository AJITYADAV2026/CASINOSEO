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

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <SiteShell>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/articles/:slug"} component={Article} />
        <Route path={"/category/:slug"} component={Category} />
        <Route path={"/archive"} component={Archive} />
        <Route path={"/archive/:date"} component={Digest} />
        <Route path={"/games"} component={Games} />
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
