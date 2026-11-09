// A detail page from maarifcms, rendered on first visit and refreshed when staff publish.
import { detailRoute } from "@/site-pages/route";
import { getAlbum } from "@/lib/cms";
import { AlbumPage } from "@/site-pages/campus-life/detail";

const route = detailRoute((slug) => `/campus-life/gallery/${slug}`, getAlbum, (item) => ({ title: item.title, description: item.summary }), AlbumPage);
export const dynamicParams = true;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
