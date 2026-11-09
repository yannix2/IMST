// GENERATED from the navigation tree (one route per page, so each ships only its own client
// parts). Page content lives in src/site-pages/.
import { innerRoute } from "@/site-pages/route";
import { SchedulesPage, descriptions } from "@/site-pages/parents/parents";

const route = innerRoute("parents/schedules", SchedulesPage, descriptions.schedules);
export const generateMetadata = route.generateMetadata;
export default route.Page;
