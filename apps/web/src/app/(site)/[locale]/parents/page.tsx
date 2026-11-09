// GENERATED from the navigation tree (one route per page, so each ships only its own client
// parts). Page content lives in src/site-pages/.
import { innerRoute } from "@/site-pages/route";
import { ParentsPage, descriptions } from "@/site-pages/parents/parents";

const route = innerRoute("parents", ParentsPage, descriptions.overview);
export const generateMetadata = route.generateMetadata;
export default route.Page;
