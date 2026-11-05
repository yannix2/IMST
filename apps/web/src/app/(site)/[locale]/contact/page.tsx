// GENERATED from the navigation tree (one route per page, so each ships only its own client
// parts). Page content lives in src/site-pages/.
import { innerRoute } from "@/site-pages/route";
import { ContactPage, description } from "@/site-pages/contact";

const route = innerRoute("contact", ContactPage, description);
export const generateMetadata = route.generateMetadata;
export default route.Page;
