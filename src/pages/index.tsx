import { type NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import Generic, { type ParsedGeneric } from "@/components/lookup/Generic";
import useLookup from "@/hooks/useLookup";
import { OGP } from "react-ogp";
import LookupInput from "@/components/form/LookupInput";

const Index: NextPage = () => {
  const { error, setTarget, submit } = useLookup();
  const [response, setResponse] = useState<ParsedGeneric | null>();

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
        <link rel="shortcut icon" href="/shortcut-icon.svg" />
        <meta
          name="keywords"
          content="xevion, rdap, whois, rdap, domain name, dns, ip address"
        />
      </Head>
      <nav className="bg-zinc-850 px-5 py-4 shadow-sm">
        <span className="text-white" style={{ fontSize: "larger" }}>
          <a className="text-xl font-medium" href="#">
            rdap.xevion.dev
          </a>
        </span>
      </nav>
      <div className="mx-auto max-w-screen-sm px-5 lg:max-w-screen-md xl:max-w-screen-lg">
        <div className="dark container mx-auto w-full py-6 md:py-12 ">
          <LookupInput
            onChange={({ target, targetType }) => {
              setTarget(target);
            }}
            onSubmit={async (props) => {
              try {
                setResponse(await submit(props));
              } catch (e) {
                setResponse(null);
              }
            }}
          />
          {error != null ? (
            <div className="my-3 mx-7 rounded border-2 border-red-800/40 bg-zinc-700 p-2 text-zinc-300">
              {error}
            </div>
          ) : null}
          {response != null ? <Generic data={response} /> : null}
        </div>
      </div>
    </>
  );
};

export default Index;
