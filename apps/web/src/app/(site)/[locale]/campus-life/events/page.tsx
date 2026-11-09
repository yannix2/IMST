// GENERATED from the navigation tree (one route per page, so each ships only its own client
// parts). Page content lives in src/site-pages/.
import { innerRoute } from "@/site-pages/route";
import { EventsPage, descriptions } from "@/site-pages/campus-life/campus-life";

const route = innerRoute("campus-life/events", EventsPage, descriptions.events);
export const generateMetadata = route.generateMetadata;
export default route.Page;
