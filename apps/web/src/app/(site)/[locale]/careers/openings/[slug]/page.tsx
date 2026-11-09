// A detail page from maarifcms, rendered on first visit and refreshed when staff publish.
import { detailRoute } from "@/site-pages/route";
import { getJob } from "@/lib/cms";
import { JobPage } from "@/site-pages/careers/careers";

const route = detailRoute((slug) => `/careers/openings/${slug}`, getJob, (item) => ({ title: item.title, description: item.summary }), JobPage);
export const dynamicParams = true;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
