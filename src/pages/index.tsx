import {type NextPage} from "next";
import Head from "next/head";
import type {ObjectType} from "@/types";
import {placeholders, registryURLs} from "@/constants";
import {domainMatch, getBestURL, getType} from "@/rdap";
import type {FormEvent} from "react";
import {useEffect, useMemo, useState} from "react";
import {truthy} from "@/helpers";
import axios from "axios";
import type {ParsedGeneric} from "@/components/Generic";
import Generic from "@/components/Generic";
import type {ZodSchema} from "zod";
import type {Register} from "@/responses";
import {DomainSchema, RegisterSchema} from "@/responses";

const Index: NextPage = () => {
    const [requestJSContact, setRequestJSContact] = useState(false);
    const [followReferral, setFollowReferral] = useState(false);
    const [object, setObject] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<ParsedGeneric | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [registryData, setRegistryData] = useState<Record<string, Register> | null>(null);

    // Change the selected type automatically
    const uriType = useMemo<ObjectType>(function () {
        return getType(object) ?? 'domain';
    }, [object]);

    async function loadRegistryData() {
        setLoading(true);

        console.log('Retrieving registry  ..')
        let registersLoaded = 0;
        const totalRegisters = Object.keys(registryURLs).length;
        const responses = await Promise.all(Object.entries(registryURLs).map(async ([url, registryType]) => {
            const response = await axios.get(url);
            registersLoaded++;
            console.log(`Registered loaded ${registersLoaded}/${totalRegisters}`)
            return {
                registryType,
                response: RegisterSchema.parse(response.data)
            };
        }))

        console.log('Registry data set.')
        setRegistryData(() => {
            return Object.fromEntries(
                responses.map(({registryType, response}) => [registryType, response])
            ) as Record<string, Register>
        })
        setLoading(false);
    }

    // construct an RDAP URL for the given object
    function getRDAPURL(object: string): string | null {
        let urls: string[] = [];

        if (registryData == null) {
            console.log('Registry data not loaded.')
            return null;
        }
        const service = registryData[uriType]?.services;
        if (service == undefined) return null;

        services:
            for (const serviceItem of service) {
                // special case for object tags, since the registrant email address is in the 0th position
                const [rangeIndex, urlIndex] = uriType == 'entity' ? [1, 2] : [0, 1];

                for (const tld of serviceItem[rangeIndex]!) {
                    let match = false;

                    switch (uriType) {
                        case 'domain':
                            match = domainMatch(tld, object);
                            break;
                        // case "autnum":
                        //     match = asnMatch(range, object);
                        //     break;
                        // case "entity":
                        //     match = entityMatch(range, object);
                        //     break;
                        // case "ip":
                        //     match = ipMatch(range, object);
                        //     break;
                    }

                    if (match) {
                        urls = serviceItem[urlIndex]!;
                        break services;
                    }
                }
            }


        // no match
        if (urls.length == 0) return null;

        let url = getBestURL(urls);
        // some bootstrap entries have a trailing slash, some don't
        if (!url.endsWith('/')) url += '/';
        return `${url + uriType}/${object}`;
    }


    async function submit(e?: FormEvent) {
        e?.preventDefault();

        console.log(`Submit invoked. ${uriType}/${JSON.stringify(object)}`)
        const queryParams = requestJSContact ? '?jscard=1' : '';
        const [url, schema]: [string, ZodSchema<ParsedGeneric>] | [null, null] = (function () {
            switch (uriType) {
                // case 'url':
                //     return [object];
                // case 'tld':
                //     return `https://root.rdap.org/domain/${object}${queryParams}`;
                // case 'registrar':
                //     return `https://registrars.rdap.org/entity/${object}-IANA${queryParams}`;
                // case 'json':
                //     return `json://${object}`
                case 'domain':
                    const temp = getRDAPURL(object);
                    if (temp) return [`${temp}${queryParams}`, DomainSchema]
                    return [null, null];
                default:
                    setError(`No RDAP URL available for ${uriType} ${object}.`);
                    return [null, null];
            }
        })()

        console.log(`URL: ${url ?? "null"}`)
        if (url != null)
            await sendQuery(url, schema, followReferral);
    }

    async function sendQuery(url: string, schema: ZodSchema<ParsedGeneric>, followReferral = false) {
        setLoading(true);

        let data: ParsedGeneric | null = null;
        if (url.startsWith('json://')) {
            console.log('Mock JSON query detected.')
            // run the callback with a mock XHR
            data = schema.parse(JSON.parse(url.substring(7)))
        } else {
            try {
                const response = await axios.get(url, {responseType: "json"})
                if (response.status == 404)
                    setError('This object does not exist.');
                else if (response.status != 200)
                    setError(`Error ${response.status}: ${response.statusText}`)
                data = schema.parse(response.data);
            } catch (e) {
                console.log(e);
                setLoading(false);
                if (e instanceof Error)
                    setError(e.toString())
                return;
            }
        }

        // if (followReferral && data.hasOwnProperty('links') != undefined) {
        //     console.log('Using followReferral.')
        //     for (const link of data.links) {
        //         if ('related' == link.rel && 'application/rdap+json' == link.type && link.href.match(/^(https?:|)\/\//i)) {
        //             await sendQuery(link.href, false)
        //             return;
        //         }
        //     }
        // }

        setLoading(false);
        console.log(data);
        try {
            setResponse(data);
            const url = `${window.location.origin}?type=${encodeURIComponent(uriType)}&object=${object}&request-jscontact=${requestJSContact ? 1 : 0}&follow-referral=${followReferral ? 1 : 0}`
            window.history.pushState(null, document.title, url);

        } catch (e) {
            if (e instanceof Error)
                setError(`Exception: ${e.message}`);
            else
                setError('Unknown error.')
        }
    }

    useEffect(() => {
        // Load parameters from URL query string on page load
        const params = new URLSearchParams(window.location.search);

        // if (params.has('type'))
        //     setUriType(params.get('type') as ObjectType);

        if (params.has('object'))
            setObject(params.get('object')!);

        if (params.has('request-jscontact') && truthy(params.get('request-jscontact')))
            setRequestJSContact(true);

        if (params.has('follow-referral') && truthy(params.get('follow-referral')))
            setFollowReferral(true);

        if (params.has('object') && (params.get('object')?.length ?? 0) > 0) {
            setObject(params.get('object')!);
            // submit(null);
        }

        loadRegistryData().catch(console.error);
    }, [])

    return (
        <>
            <Head>
                <title>rdap.xevion.dev</title>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="shortcut icon" href="/shortcut-icon.svg"/>
                <meta name="description" content=""/>
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
                <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
                  <span className="text-white" style={{fontSize: 'larger'}}>
                    <a className="navbar-brand" href="#">rdap.xevion.dev</a>
                  </span>
                </nav>
                <div className="container py-12 mx-auto max-w-screen-lg">
                    <form onSubmit={(e) => {
                        void submit(e)
                    }} className="form-inline">
                        <div className="col p-0">
                            <div className="input-group">

                                <div className="input-group-prepend">
                                    <select className="custom-select" id="type" name="type"
                                            value={uriType}>
                                        <option value="domain">Domain</option>
                                        <option value="tld">TLD</option>
                                        <option value="ip">IP/CIDR</option>
                                        <option value="autnum">AS Number</option>
                                        <option value="entity">Entity</option>
                                        <option value="registrar">Registrar</option>
                                        <option value="url">URL</option>
                                        <option value="json">JSON</option>
                                    </select>
                                </div>

                                <input className="form-control"
                                       type="text"
                                       placeholder={placeholders[uriType]}
                                       disabled={loading}
                                       onChange={(e) => {
                                           setObject(e.target.value);
                                       }} required/>

                                <div className="input-group-append">
                                    <input id="button" type="button" value="Submit" onClick={(event) => {
                                        void submit(event)
                                    }}
                                           className="btn btn-primary"
                                           disabled={loading}/>
                                </div>
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

                    <div id="output-div">
                        {response != null ? <Generic data={response}/> : null}
                    </div>

                    <p>This page implements a <em>completely private lookup tool</em> for domain names, IP addresses and
                        Autonymous System Numbers (ASNs). Only the relevant registry sees your query: your browser will
                        directly
                        connect to the registry&apos;s RDAP server using an encrypted HTTPS connection to protect the
                        confidentiality of
                        your query. If you click the &quot;Follow referral to registrar&apos;s RDAP
                        record&quot; checkbox, then the
                        sponsoring
                        registrar may also see your query.</p>
                    <ul>
                        <li><a href="https://about.rdap.org" target="_new">Click here</a> for more information about
                            what RDAP is
                            and how it differs from traditional Whois.
                        </li>
                        <li>Most generic TLDs now support RDAP, but only a few ccTLDs have deployed RDAP so far. To see
                            which TLDs
                            support RDAP, <a href="https://deployment.rdap.org" target="_new">click here</a>.
                        </li>
                        <li>There is no bootstrap registry for top-level domains or ICANN-accredited registrars; instead
                            these queries are sent to the
                            <a href="https://about.rdap.org/#additional"
                               target="_new">
                                {"{"}root,registrars{"}"}.rdap.org servers
                            </a>.
                        </li>
                        <li>To submit feedback, <a href="mailto:feedback@rdap.org">click here</a>. Please contact the
                            relevant
                            registry or registrar if you have an issue with the content of an RDAP response.
                        </li>
                        <li>This tool is Free Software; for the license, <a href="LICENSE">click here</a>. To fork a
                            copy of the git
                            repository, <a rel="noopener" target="_new"
                                           href="https://gitlab.centralnic.com/centralnic/rdap-web-client">click
                                here</a>.
                        </li>
                        <li>This page uses <a rel="noopener" target="_new"
                                              href="https://github.com/whitequark/ipaddr.js/">ipaddr.js</a> by <a
                            rel="noopener"
                            target="_new"
                            href="https://whitequark.org/">whitequark</a>.
                        </li>
                    </ul>

                </div>
            </>
        </>
    );
};

export default Index;
