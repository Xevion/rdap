import { type AppType } from "next/dist/shared/lib/utils";

import "@fontsource-variable/inter";
import "@fontsource/ibm-plex-mono/400.css";

import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
	return <Component {...pageProps} />;
};

export default MyApp;
