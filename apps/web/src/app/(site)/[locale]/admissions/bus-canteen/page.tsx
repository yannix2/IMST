// GENERATED from the navigation tree (one route per page, so each ships only its own client
// parts). Page content lives in src/site-pages/.
import { innerRoute } from "@/site-pages/route";
import { BusCanteenPage } from "@/site-pages/admissions/admissions";
import { descriptions } from "@/site-pages/admissions/shared";

const route = innerRoute("admissions/bus-canteen", BusCanteenPage, descriptions.bus);
export const generateMetadata = route.generateMetadata;
export default route.Page;
