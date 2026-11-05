// GENERATED from the navigation tree (one route per page, so each ships only its own client
// parts). Page content lives in src/site-pages/.
import { innerRoute } from "@/site-pages/route";
import { LevelPageView, levelDescription } from "@/site-pages/programs/level";

const route = innerRoute("programs/upper-secondary", ({ locale }) => <LevelPageView locale={locale} level="upper-secondary" />, levelDescription("upper-secondary"));
export const generateMetadata = route.generateMetadata;
export default route.Page;
