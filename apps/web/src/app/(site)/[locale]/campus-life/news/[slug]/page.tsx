// A detail page from maarifcms, rendered on first visit and refreshed when staff publish.
import { detailRoute } from "@/site-pages/route";
import { getNewsArticle } from "@/lib/cms";
import { NewsArticlePage } from "@/site-pages/campus-life/detail";

const route = detailRoute((slug) => `/campus-life/news/${slug}`, getNewsArticle, (item) => ({ title: item.seo.title || item.title, description: item.seo.description || item.summary }), NewsArticlePage);
export const dynamicParams = true;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
