import {type NextPage} from "next";
import Head from "next/head";
import type {ObjectType} from "../types";
import {placeholders} from "../constants";
import {asnMatch, domainMatch, entityMatch, getBestURL, getRDAPURL, getType, ipMatch, showSpinner} from "../rdap";
import {useEffect, useState} from "react";
import {truthy} from "../helpers";
import {registryURLs} from "../constants";
import axios, {AxiosResponse} from "axios";
import update from "immutability-helper";
import GenericObject, {Link} from "../components/DomainType";

const Index: NextPage = () => {
    const [uriType, setUriType] = useState<ObjectType>('domain');


    const [requestJSContact, setRequestJSContact] = useState(false);
    const [followReferral, setFollowReferral] = useState(false);
    const [object, setObject] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [registryData, setRegistryData] = useState<Record<string, Any>>({});

    // Change the selected type automatically
    useEffect(function () {
        const new_type = getType(object);
        if (new_type != null && new_type != uriType)
            setUriType(new_type)
    }, [object]);

    async function loadRegistryData() {
        setLoading(true);
        const responses = await Promise.all(Object.entries(registryURLs).map(async ([url, registryType]) => {
            const response = await axios.get(url);
            return {
                registryType,
                response: response.data
            };
        }))

        setRegistryData(() => {
            return Object.fromEntries(
                responses.map(({registryType, response}) => [registryType, response.services])
            )
        })
        setLoading(false);
    }

    // construct an RDAP URL for the given object
    function getRDAPURL(object: string): string | null {
        let urls: string[] = [];

        const service: [string[], string[]][] | [string[], string[], string[]][] = registryData[uriType];
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


    function submit(e) {
        e?.preventDefault();

        const queryParams = requestJSContact ? '?jscard=1' : '';

        const url = (function () {
            switch (uriType) {
                case 'url':
                    return object;
                case 'tld':
                    return `https://root.rdap.org/domain/${object}${queryParams}`;
                case 'registrar':
                    return `https://registrars.rdap.org/entity/${object}-IANA${queryParams}`;
                case 'json':
                    return `json://${object}`
                case 'domain':
                    const temp = getRDAPURL(object);
                    if (temp) return `${temp}${queryParams}`
                    return null;
                default:
                    setError(`No RDAP URL available for ${uriType} ${object}.`);
                    return null;
            }
        })()

        if (url) sendQuery(url, followReferral);
    }

    async function sendQuery(url: string, followReferral = false) {
        setLoading(true);

        if (url.startsWith('json://')) {
            // run the callback with a mock XHR
            await handleResponse(JSON.parse(url.substring(7)))
        } else {
            try {
                const response = await axios.get(url, {responseType: "json"})
                if (response.status == 404)
                    setError('This object does not exist.');
                else if (response.status != 200)
                    setError(`Error ${response.status}: ${response.statusText}`)
                await handleResponse(response, followReferral)
            } catch (e) {
                setLoading(false);
                setError(e.toString())
            }
        }
    }

    // callback executed when a response is received
    async function handleResponse(data: { links: Link[] }, followReferral = false) {
        setLoading(false);

        if (followReferral && data.links != null) {
            for (const link of data.links) {
                if ('related' == link.rel && 'application/rdap+json' == link.type && link.href.match(/^(https?:|)\/\//i)) {
                    await sendQuery(link.href, false)
                    return;
                }
            }
        }

        try {
            // div.appendChild(processObject(xhr.response, true));
            setResponse(data);
            const url = `${window.location.href}?type=${encodeURIComponent(uriType)}&object=${object}&request-jscontact=${requestJSContact ? 1 : 0}&follow-referral=${followReferral ? 1 : 0}`
            window.history.pushState(null, document.title, url);

        } catch (e) {
            setError(`Exception: ${e.message} (line ${e.lineNumber})`);
        }
    }

    useEffect(() => {
        // Load parameters from URL query string on page load
        const params = new URLSearchParams(window.location.search);
        if (params.has('type'))
            setUriType(params.get('type') as ObjectType);
        else if (params.has('object'))
            setObject(params.get('object')!);

        if (params.has('request-jscontact') && truthy(params.get('request-jscontact')))
            setRequestJSContact(true);

        if (params.has('follow-referral') && truthy(params.get('follow-referral')))
            setFollowReferral(true);

        if (params.has('object') && (params.get('object')?.length ?? 0) > 0) {
            setObject(params.get('object')!);
            submit(null);
        }


        loadRegistryData().catch(console.error);
    }, [])

    useEffect(() => {
        if (!loading && registryData.domain != undefined)
            console.log(registryData);
    }, [loading])

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

                <br/>

                <div className="container">
                    <form onSubmit={submit} className="form-inline">
                        <div className="col p-0">
                            <div className="input-group">

                                <div className="input-group-prepend">
                                    <select className="custom-select" id="type" name="type"
                                            value={uriType}
                                            onChange={(e) => {
                                                setUriType(e.target.value as ObjectType);
                                            }}>
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
                                    <input id="button" type="button" value="Submit" onClick={submit}
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
                        {response != null ? <GenericObject data={response.data}/> : null}
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
