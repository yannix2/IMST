// GENERATED from the navigation tree (one route per page, so each ships only its own client
// parts). Page content lives in src/site-pages/.
import { innerRoute } from "@/site-pages/route";
import { StudentSupportPage, descriptions } from "@/site-pages/programs/more";

const route = innerRoute("programs/student-support", StudentSupportPage, descriptions.support);
export const generateMetadata = route.generateMetadata;
export default route.Page;
