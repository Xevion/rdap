import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import Generic from "@/rdap/components/Generic";
import type { MetaParsedGeneric } from "@/rdap/hooks/useLookup";
import useLookup from "@/rdap/hooks/useLookup";
import LookupInput from "@/rdap/components/LookupInput";
import ErrorCard from "@/components/ErrorCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Maybe } from "true-myth";
import { Flex, Container, Section, Text, Link, IconButton } from "@radix-ui/themes";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

const Index: NextPage = () => {
	const { error, setTarget, setTargetType, submit, currentType } = useLookup();
	const [response, setResponse] = useState<Maybe<MetaParsedGeneric>>(Maybe.nothing());
	const [isLoading, setLoading] = useState<boolean>(false);

	return (
		<>
			<Head>
				<title>rdap.xevion.dev</title>
				<meta
					name="description"
					content="A custom, private RDAP lookup client built by Xevion."
				/>
				<meta property="og:url" content="https://rdap.xevion.dev" />
				<meta property="og:title" content="RDAP | by Xevion.dev" />
				<meta
					property="og:description"
					content="A custom, private RDAP lookup client built by Xevion."
				/>
				<meta property="og:site_name" content="rdap.xevion.dev" />
				<meta property="og:type" content="website" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta
					name="keywords"
					content="xevion, rdap, whois, rdap, domain name, dns, ip address"
				/>
			</Head>
			<OverlayScrollbarsComponent
				defer
				options={{
					scrollbars: {
						autoHide: "leave",
						autoHideDelay: 1300,
					},
				}}
				style={{ height: "100vh" }}
			>
				<Flex
					asChild
					justify="between"
					align="center"
					px="5"
					py="4"
					style={{
						borderBottom: "1px solid var(--gray-a5)",
					}}
				>
					<nav>
						<Text size="5" weight="medium">
							<Link href="https://github.com/Xevion/rdap" color="gray" highContrast>
								rdap
							</Link>
							<Link href="https://xevion.dev" color="gray">
								.xevion.dev
							</Link>
						</Text>
						<Flex gap="4" align="center">
							<IconButton
								asChild
								size="3"
								variant="ghost"
								aria-label="View on GitHub"
								title="View on GitHub"
							>
								<a
									href="https://github.com/Xevion/rdap"
									target="_blank"
									rel="noopener noreferrer"
								>
									<GitHubLogoIcon width="22" height="22" />
								</a>
							</IconButton>
							<ThemeToggle />
						</Flex>
					</nav>
				</Flex>
				<Container size="3" px="5">
					<Section size="2">
						<LookupInput
							isLoading={isLoading}
							detectedType={currentType}
							onChange={({ target, targetType }) => {
								setTarget(target);
								setTargetType(targetType);
							}}
							onSubmit={async function (props) {
								try {
									setLoading(true);
									setResponse(await submit(props));
									setLoading(false);
								} catch (e) {
									console.error(e);
									setResponse(Maybe.nothing());
									setLoading(false);
								}
							}}
						/>
						{error != null ? (
							<ErrorCard
								title="An error occurred while performing a lookup."
								description={error}
								className="mb-2"
							/>
						) : null}
						{response.isJust ? (
							<Generic
								url={response.value.url}
								data={response.value.data}
								queryTimestamp={response.value.completeTime}
							/>
						) : null}
					</Section>
				</Container>
			</OverlayScrollbarsComponent>
		</>
	);
};

export default Index;
