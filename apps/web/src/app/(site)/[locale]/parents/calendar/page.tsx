// GENERATED from the navigation tree (one route per page, so each ships only its own client
// parts). Page content lives in src/site-pages/.
import { innerRoute } from "@/site-pages/route";
import { CalendarPage, descriptions } from "@/site-pages/parents/parents";

const route = innerRoute("parents/calendar", CalendarPage, descriptions.calendar);
export const generateMetadata = route.generateMetadata;
export default route.Page;
