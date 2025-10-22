import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import Generic from "@/components/lookup/Generic";
import type { MetaParsedGeneric } from "@/hooks/useLookup";
import useLookup from "@/hooks/useLookup";
import LookupInput from "@/components/form/LookupInput";
import ErrorCard from "@/components/common/ErrorCard";
import { Maybe } from "true-myth";
import type { TargetType } from "@/types";

const Index: NextPage = () => {
  const { error, setTarget, setTargetType, submit, getType } = useLookup();
  const [detectedType, setDetectedType] = useState<Maybe<TargetType>>(
    Maybe.nothing()
  );
  const [response, setResponse] = useState<Maybe<MetaParsedGeneric>>(
    Maybe.nothing()
  );
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
      <nav className="bg-zinc-850 px-5 py-4 shadow-xs">
        <span
          className="text-xl font-medium text-white"
          style={{ fontSize: "larger" }}
        >
          <a href="https://github.com/Xevion/rdap">rdap</a>
          <a
            href={"https://xevion.dev"}
            className="text-zinc-400 hover:animate-pulse"
          >
            .xevion.dev
          </a>
        </span>
      </nav>
      <div className="mx-auto max-w-screen-sm px-5 lg:max-w-screen-md xl:max-w-screen-lg">
        <div className="dark container mx-auto w-full py-6 md:py-12 ">
          <LookupInput
            isLoading={isLoading}
            detectedType={detectedType}
            onChange={async ({ target, targetType }) => {
              setTarget(target);
              setTargetType(targetType);

              const detectResult = await getType(target);
              if (detectResult.isOk) {
                setDetectedType(Maybe.just(detectResult.value));
              } else {
                setDetectedType(Maybe.nothing());
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
        </div>
      </div>
    </>
  );
};

export default Index;
