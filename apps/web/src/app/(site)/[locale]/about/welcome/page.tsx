// GENERATED from the navigation tree (one route per page, so each ships only its own client
// parts). Page content lives in src/site-pages/.
import { innerRoute } from "@/site-pages/route";
import { WelcomePage, description } from "@/site-pages/about/welcome";

const route = innerRoute("about/welcome", WelcomePage, description);
export const generateMetadata = route.generateMetadata;
export default route.Page;
