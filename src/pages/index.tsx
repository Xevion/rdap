import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import Generic, { type ParsedGeneric } from "@/components/lookup/Generic";
import useLookup from "@/hooks/useLookup";
import { OGP } from "react-ogp";
import LookupInput from "@/components/form/LookupInput";
import ErrorCard from "@/components/common/ErrorCard";
import { Maybe } from "true-myth";

const Index: NextPage = () => {
  const { error, setTarget, submit } = useLookup();
  const [response, setResponse] = useState<ParsedGeneric | null>();
  const [isLoading, setLoading] = useState<boolean>(false);

  return (
    <>
      <Head>
        <title>rdap.xevion.dev</title>
        <OGP
          url="https://rdap.xevion.dev"
          title="RDAP | by Xevion.dev"
          description="A custom, private RDAP lookup client built by Xevion."
          siteName="rdap.xevion.dev"
          type="website"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="keywords"
          content="xevion, rdap, whois, rdap, domain name, dns, ip address"
        />
      </Head>
      <nav className="bg-zinc-850 px-5 py-4 shadow-sm">
        <span className="text-white" style={{ fontSize: "larger" }}>
          <a className="text-xl font-medium" href="#">
            rdap<span className="text-zinc-400">.xevion.dev</span>
          </a>
        </span>
      </nav>
      <div className="mx-auto max-w-screen-sm px-5 lg:max-w-screen-md xl:max-w-screen-lg">
        <div className="dark container mx-auto w-full py-6 md:py-12 ">
          <LookupInput
            isLoading={isLoading}
            detectedType={Maybe.nothing()}
            onChange={({ target, targetType }) => {
              setTarget(target);
            }}
            onSubmit={async function (props) {
              try {
                setLoading(true);
                const result = await submit(props);
                if (result.isJust)
                  setResponse(result.value);
                else
                  setResponse(null);
                setLoading(false);
              } catch (e) {
                setResponse(null);
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
          {response != null ? <Generic data={response} /> : null}
        </div>
      </div>
    </>
  );
};

export default Index;
