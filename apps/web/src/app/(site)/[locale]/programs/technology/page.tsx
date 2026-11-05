// GENERATED from the navigation tree (one route per page, so each ships only its own client
// parts). Page content lives in src/site-pages/.
import { innerRoute } from "@/site-pages/route";
import { TechnologyPage, descriptions } from "@/site-pages/programs/more";

const route = innerRoute("programs/technology", TechnologyPage, descriptions.technology);
export const generateMetadata = route.generateMetadata;
export default route.Page;
