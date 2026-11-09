// GENERATED from the navigation tree (one route per page, so each ships only its own client
// parts). Page content lives in src/site-pages/.
import { innerRoute } from "@/site-pages/route";
import { HandbookPage, descriptions } from "@/site-pages/parents/parents";

const route = innerRoute("parents/handbook", HandbookPage, descriptions.handbook);
export const generateMetadata = route.generateMetadata;
export default route.Page;
