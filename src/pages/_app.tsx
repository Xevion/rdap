import { type AppType } from "next/dist/shared/lib/utils";
import { ThemeProvider } from "next-themes";
import { Theme } from "@radix-ui/themes";

import "@fontsource-variable/inter";
import "@fontsource/ibm-plex-mono/400.css";
import "@radix-ui/themes/styles.css";

import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
	return (
		<ThemeProvider attribute="class" defaultTheme="system">
			<Theme accentColor="indigo" grayColor="slate" radius="medium" scaling="100%">
				<Component {...pageProps} />
			</Theme>
		</ThemeProvider>
	);
};

export default MyApp;
