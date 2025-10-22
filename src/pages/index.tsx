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
import type { TargetType } from "@/rdap/schemas";
import { Flex, Container, Section, Text, Link } from "@radix-ui/themes";

const Index: NextPage = () => {
	const { error, setTarget, setTargetType, submit, getType } = useLookup();
	const [detectedType, setDetectedType] = useState<Maybe<TargetType>>(Maybe.nothing());
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
					<ThemeToggle />
				</nav>
			</Flex>
			<Container size="3" px="5">
				<Section size="2">
					<LookupInput
						isLoading={isLoading}
						detectedType={detectedType}
						onChange={async ({ target, targetType }) => {
							setTarget(target);
							setTargetType(targetType);

							// Only run autodetection when in autodetect mode (targetType is null)
							if (targetType === null) {
								const detectResult = await getType(target);
								if (detectResult.isOk) {
									setDetectedType(Maybe.just(detectResult.value));
								} else {
									setDetectedType(Maybe.nothing());
								}
							}
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
						<Generic url={response.value.url} data={response.value.data} />
					) : null}
				</Section>
			</Container>
		</>
	);
};

export default Index;
