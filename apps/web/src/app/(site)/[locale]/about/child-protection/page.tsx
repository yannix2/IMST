// GENERATED from the navigation tree (one route per page, so each ships only its own client
// parts). Page content lives in src/site-pages/.
import { innerRoute } from "@/site-pages/route";
import { ChildProtectionPage, description } from "@/site-pages/about/child-protection";

const route = innerRoute("about/child-protection", ChildProtectionPage, description);
export const generateMetadata = route.generateMetadata;
export default route.Page;
