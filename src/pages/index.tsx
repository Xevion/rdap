import {type NextPage} from "next";
import Head from "next/head";
import {useRef, useState} from "react";
import Generic, {type ParsedGeneric} from "@/components/Generic";
import useLookup from "@/hooks/useLookup";
import {onPromise} from "@/helpers";
import {OGP} from "react-ogp";

const Index: NextPage = () => {
    const {error, setTarget, submit, currentType} = useLookup();
    const inputRef = useRef<HTMLInputElement>();
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
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="shortcut icon" href="/shortcut-icon.svg"/>
                <meta name="keywords" content="xevion, rdap, whois, rdap, domain name, dns, ip address"/>
            </Head>
            <>
                <style jsx>{`
                  dd {
                    margin: 0.5em 0 1em 2em;
                  }

                  .card {
                    margin-bottom: 1em;
                  }

                  dl {
                    margin: 0;
                  }

                  .rdap-status-code, .rdap-event-time {
                    border-bottom: 1px dashed silver;
                  }

                  #object {
                    text-transform: lowercase;
                  }

                  #spinner-msg {
                    height: 2em;
                    display: inline-block;
                    margin: -0.25em 0 0 0;
                    padding: 0.25em 0 0 0;
                  }

                `}</style>
                <nav className="navbar navbar-expand-lg navbar-dark shadow-sm">
                  <span className="text-white" style={{fontSize: 'larger'}}>
                    <a className="navbar-brand" href="#">rdap.xevion.dev</a>
                  </span>
                </nav>
                <div className="container py-12 mx-auto max-w-screen-lg">
                    <form onSubmit={onPromise(async function (e) {
                        e.preventDefault()

                        const r = await submit();
                        setResponse(() => r ?? null);
                    })} className="form-inline">
                        <div className="col p-0">
                            <div className="input-group">
                                <input
                                    onChange={(e) => setTarget(e.currentTarget.value)}
                                    className="form-control bg-zinc-800 focus:bg-zinc-700 focus:border-zinc-600 border-zinc-700 text-zinc-200"
                                    type="text"
                                />
                            </div>
                        </div>
                    </form>

                    <div className="container p-0 italic text-[#aaa]" style={{fontSize: "small"}}>
                        <div className="col pt-3 pb-1">
                            Options:&nbsp;
                            <label htmlFor="request-jscontact">
                                <input name="request-jscontact" id="request-jscontact" type="checkbox"/>
                                Request JSContact
                            </label>
                            &nbsp;
                            <label htmlFor="follow-referral">
                                <input name="follow-referral" id="follow-referral" type="checkbox"/>
                                Follow referral to registrar&apos;s RDAP record
                            </label>
                        </div>
                    </div>
                    <div>
                        {error}
                    </div>
                    <div id="output-div">
                        {response != null ? <Generic data={response}/> : null}
                    </div>
                </div>
            </>
        </>
    );
};

export default Index;
