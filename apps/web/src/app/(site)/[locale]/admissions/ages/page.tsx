// GENERATED from the navigation tree (one route per page, so each ships only its own client
// parts). Page content lives in src/site-pages/.
import { innerRoute } from "@/site-pages/route";
import { AgesPage } from "@/site-pages/admissions/ages";
import { descriptions } from "@/site-pages/admissions/shared";

const route = innerRoute("admissions/ages", AgesPage, descriptions.ages);
export const generateMetadata = route.generateMetadata;
export default route.Page;
