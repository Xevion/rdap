import { Theme } from "@radix-ui/themes";
import { ThemeProvider } from "next-themes";
import { type AppType } from "next/dist/shared/lib/utils";

import "@fontsource-variable/inter";
import "@fontsource/ibm-plex-mono/400.css";
import "@radix-ui/themes/styles.css";
import "overlayscrollbars/overlayscrollbars.css";

import "@/styles/globals.css";
import { DateFormatProvider } from "@/contexts/DateFormatContext";
import { TelemetryProvider } from "@/contexts/TelemetryContext";
import ErrorBoundary from "@/components/ErrorBoundary";

const MyApp: AppType = ({ Component, pageProps }) => {
	return (
		<ErrorBoundary>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				// Cloudflare Rocket Loader breaks the script injection and causes theme flashing
				scriptProps={{ "data-cfasync": "false" }}
			>
				<Theme accentColor="indigo" grayColor="slate" radius="medium" scaling="100%">
					<TelemetryProvider>
						<DateFormatProvider>
							<Component {...pageProps} />
						</DateFormatProvider>
					</TelemetryProvider>
				</Theme>
			</ThemeProvider>
		</ErrorBoundary>
	);
};

export default MyApp;
