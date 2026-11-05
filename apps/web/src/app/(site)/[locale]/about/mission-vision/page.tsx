// GENERATED from the navigation tree (one route per page, so each ships only its own client
// parts). Page content lives in src/site-pages/.
import { innerRoute } from "@/site-pages/route";
import { MissionVisionPage, description } from "@/site-pages/about/mission-vision";

const route = innerRoute("about/mission-vision", MissionVisionPage, description);
export const generateMetadata = route.generateMetadata;
export default route.Page;
