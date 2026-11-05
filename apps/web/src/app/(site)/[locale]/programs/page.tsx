// GENERATED from the navigation tree (one route per page, so each ships only its own client
// parts). Page content lives in src/site-pages/.
import { innerRoute } from "@/site-pages/route";
import { ProgramsPage, description } from "@/site-pages/programs/overview";

const route = innerRoute("programs", ProgramsPage, description);
export const generateMetadata = route.generateMetadata;
export default route.Page;
