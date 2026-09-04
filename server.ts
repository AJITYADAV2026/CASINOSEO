import { createCasinoVerseApp } from "./server/_core/app";
import { serveStatic } from "./server/_core/vite";

const app = createCasinoVerseApp();
serveStatic(app);

export default app;
