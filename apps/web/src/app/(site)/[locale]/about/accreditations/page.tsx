// GENERATED from the navigation tree (one route per page, so each ships only its own client
// parts). Page content lives in src/site-pages/.
import { innerRoute } from "@/site-pages/route";
import { AccreditationsPage, description } from "@/site-pages/about/accreditations";

const route = innerRoute("about/accreditations", AccreditationsPage, description);
export const generateMetadata = route.generateMetadata;
export default route.Page;
