// GENERATED from the navigation tree (one route per page, so each ships only its own client
// parts). Page content lives in src/site-pages/.
import { innerRoute } from "@/site-pages/route";
import { OpeningsPage, descriptions } from "@/site-pages/careers/careers";

const route = innerRoute("careers/openings", OpeningsPage, descriptions.openings);
export const generateMetadata = route.generateMetadata;
export default route.Page;
