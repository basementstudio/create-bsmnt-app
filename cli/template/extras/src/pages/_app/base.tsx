import { type AppType } from "next/dist/shared/lib/utils";

import "~/css/global.scss";

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default MyApp;
