import type {ObjectType} from "@/types";

// keeps track of how many registries we've loaded
const loadedRegistries = 0;

// registry data is stored in this
const registryData = {};

// keeps track of the elements we've created so we can assign a unique ID
// let elementCounter = 123456;

const cardTitles = {
    "domain": "Domain Name",
    "ip network": "IP Network",
    "nameserver": "Nameserver",
    "entity": "Entity",
    "autnum": "AS Number",
};

export function domainMatch(tld: string, domain: string): boolean {
    return domain.toUpperCase().endsWith(`.${tld.toUpperCase()}`);
}

/*
export function asnMatch(range, asn) {
    let [min, max] = range.split('-', 2);
    min = parseInt(min);
    max = parseInt(max);

    return (asn >= min && asn <= max);
}
*/

/*
export function entityMatch(tag: string, handle: string) {
    return handle.toUpperCase().endsWith('-' + tag.toUpperCase());
}
*/

/*
export function ipMatch(prefix: string, ip: string) {
    const parsedIp = ipaddr.parse(ip);
    const cidr = ipaddr.parseCIDR(prefix);
    return (parsedIp.kind() == cidr[0].kind() && parsedIp.match(cidr));
}
*/

// return the first HTTPS url, or the first URL
export function getBestURL(urls: string[]): string {
    urls.forEach((url) => {
        if (url.startsWith('https://'))
            return url;
    })
    return urls[0]!;
}

// given a URL, injects that URL into the query input,
// and initiates an RDAP query
/*
export function runQuery(url) {
    const type = document.getElementById('type');

    for (let i = 0; i < type.options.length; i++) if ('url' == type.options[i].value) type.selectedIndex = i;
    document.getElementById('object').value = url;
    doQuery();
}
*/

/*
export function showSpinner(msg) {
    msg = msg ? msg : 'Loading...';

    const div = document.getElementById('output-div');
    div.innerHTML = '';

    const spinner = document.createElement('div');
    spinner.classList.add('spinner-border');
    spinner.role = 'status';
    const span = spinner.appendChild(document.createElement('span'));
    span.classList.add('sr-only');
    span.appendChild(document.createTextNode(msg));

    div.appendChild(spinner);

    const msgDiv = document.createElement('div');
    msgDiv.id = 'spinner-msg';
    msgDiv.appendChild(document.createTextNode(msg));
    div.appendChild(msgDiv);
}
*/

// export function handleError(error) {
//     var div = document.getElementById('output-div');
//     div.innerHTML = '';
//     div.appendChild(createErrorNode(error));
// }

/*
export function createErrorNode(error) {
    el = document.createElement('p');
    el.classList.add('error', 'alert', 'alert-warning');
    el.appendChild(document.createTextNode(error));

    return el;
}
*/

// process an RDAP object. Argument is a JSON object, return
// value is an element that can be inserted into the page
/*
export function processObject(object, toplevel, followReferral = true) {
    if (!object) {
        console.log(object);
        return false;
    }

    const dl = document.createElement('dl');

    switch (object.objectClassName) {
        case 'domain':
            processDomain(object, dl, toplevel);
            break;

        case 'nameserver':
            processNameserver(object, dl, toplevel);
            break;

        case 'entity':
            processEntity(object, dl, toplevel);
            break;

        case 'autnum':
            processAutnum(object, dl, toplevel);
            break;

        case 'ip network':
            processIp(object, dl, toplevel);
            break;

        default:
            if (object.errorCode) {
                return createErrorNode(object.errorCode + ' error: ' + object.title);

            } else {
                processUnknown(object, dl, toplevel);

            }
    }

    const card = document.createElement('div');
    card.classList.add('card');

    let titleText = '';
    if (object.unicodeName) {
        titleText = object.unicodeName.toUpperCase();

    } else if (object.ldhName) {
        titleText = object.ldhName.toUpperCase();

    } else if (object.handle) {
        titleText = object.handle.toUpperCase();

    }

    if (object.handle && object.handle != titleText) titleText += ' (' + object.handle + ')';

    if (titleText.length > 0) {
        titleText = cardTitles[object.objectClassName] + ' ' + titleText;

    } else if (!toplevel) {
        titleText = cardTitles[object.objectClassName];

    } else {
        titleText = 'Response';

    }

    const title = document.createElement('div');
    title.classList.add('card-header', 'font-weight-bold');
    title.appendChild(document.createTextNode(titleText));
    card.appendChild(title);

    const body = document.createElement('div');
    body.classList.add('card-body');

    body.appendChild(dl);

    card.appendChild(body);
    return card;
}
*/

// simplify the process of adding a name => value to a definition list
/*
export function addProperty(dl, name, value) {

    const dt = document.createElement('dt');
    dt.classList.add('rdap-property-name');
    dt.appendChild(document.createTextNode(name));
    dl.appendChild(dt);

    const dd = document.createElement('dd');
    dd.classList.add('rdap-property-value');
    if (value instanceof Node) {
        dd.appendChild(value);

    } else {
        dd.appendChild(document.createTextNode(String(value)));

    }
    dl.appendChild(dd);
}
*/

// called by the individual object processors, since all RDAP objects have a similar set of
// properties. the first argument is the RDAP object and the second is the <dl> element
// being used to display that object.
/*
export function processCommonObjectProperties(object, dl) {
    // if (object.objectClassName) addProperty(dl, 'Object Type:', object.objectClassName);
    // if (object.handle) addProperty(dl, 'Handle:', object.handle);
    if (object.status) processStatus(object.status, dl);
    if (object.events) processEvents(object.events, dl);
    if (object.entities) processEntities(object.entities, dl);
    if (object.remarks) processRemarks(object.remarks, dl);
    if (object.notices) processNotices(object.notices, dl);
    if (object.links) processLinks(object.links, dl);
    if (object.lang) addProperty(dl, 'Language:', object.lang);
    if (object.port43) addProperty(dl, 'Whois Server:', object.port43);
    if (object.rdapConformance) processrdapConformance(object.rdapConformance, dl);

    const div = document.createElement('div');
    div.id = 'element-' + ++elementCounter;

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-secondary');
    button.appendChild(document.createTextNode('Show'));
    button.onclick = new Function('showRawData("' + div.id + '");return false');
    div.appendChild(button);

    const pre = document.createElement('pre');
    pre.style = 'display:none;visibility:hidden';
    pre.appendChild(document.createTextNode(JSON.stringify(object, null, 2)));
    div.appendChild(pre);

    addProperty(dl, 'Raw Data:', div);
}
*/

// call back for "Show Raw Data" button
/*
export function showRawData(id) {
    const div = document.getElementById(id);
    div.childNodes[0].style = 'display:none;visibility:hidden';
    div.childNodes[1].style = 'display:block;visibility:visible';
}
*/

// convert an array into a bulleted list
/*
export function createList(list) {
    const ul = document.createElement('ul');

    for (let i = 0; i < list.length; i++) {
        const li = document.createElement('li');
        if (list[i] instanceof Node) {
            li.appendChild(list[i]);

        } else {
            li.appendChild(document.createTextNode(list[i]));

        }
        ul.appendChild(li);
    }

    return ul;
}
*/

// add the RDAP conformance of the response
/*
export function processrdapConformance(rdapConformance, dl) {
    addProperty(dl, 'Conformance:', createList(rdapConformance));
}
*/

// add the object's status codes
/*
export function processStatus(status, dl) {
    const s = [];
    for (let i = 0; i < status.length; i++) {
        const span = document.createElement('span');
        span.classList.add('rdap-status-code');
        span.appendChild(document.createTextNode(status[i]));
        span.setAttribute("title", rdapStatusInfo[status[i]]);
        s.push(span);
    }
    addProperty(dl, 'Status:', createList(s));
}
*/

// add the object's events
/*
export function processEvents(events, dl) {
    const sdl = document.createElement('dl');

    for (let i = 0; i < events.length; i++) {
        const span1 = document.createElement('span');
        span1.appendChild(document.createTextNode(new Date(events[i].eventDate).toLocaleString()));
        span1.classList.add('rdap-event-time');
        span1.setAttribute('title', events[i].eventDate);

        const span2 = document.createElement('span');
        span2.appendChild(span1);

        if (events[i].eventActor) {
            span2.appendChild(document.createTextNode(' (by ' + events[i].eventActor + ')'));
        }
        addProperty(sdl, events[i].eventAction + ':', span2);
    }

    addProperty(dl, 'Event:', sdl);
}
*/

// add the object's links
/*
export function processLinks(links, dl) {
    const ul = document.createElement('ul');

    for (let i = 0; i < links.length; i++) {
        li = document.createElement('li');

        const title = (links[i].title ? links[i].title : links[i].href);

        var link;
        if (links[i].type && 0 == links[i].type.indexOf('application/rdap+json')) {
            link = createRDAPLink(links[i].href, title);

        } else {
            link = document.createElement('a');
            link.rel = 'noopener';
            link.title = link.href = links[i].href;
            link.target = '_new';
            link.appendChild(document.createTextNode(title));

        }

        li.appendChild(link);

        if (links[i].rel) li.appendChild(document.createTextNode(' (' + links[i].rel + ')'));

        ul.appendChild(li);
    }

    addProperty(dl, 'Links:', ul);
}
*/

// add the object's entities
/*
export function processEntities(entities, dl) {
    const div = document.createElement('div');

    for (let i = 0; i < entities.length; i++) div.appendChild(processObject(entities[i]));

    addProperty(dl, 'Entities:', div);
}
*/

// add the object's remarks
/*
export function processRemarks(remarks, dl) {
    addProperty(dl, 'Remarks:', processRemarksOrNotices(remarks));

}
*/

// add the responses's notices
/*
export function processNotices(notices, dl) {
    addProperty(dl, 'Notices:', processRemarksOrNotices(notices));
}
*/

// command handler for remarks and notices
/*
export function processRemarksOrNotices(things) {
    const div = document.createElement('div');

    for (let i = 0; i < things.length; i++) {
        const section = document.createElement('section');
        section.classList.add('card');
        div.appendChild(section);

        const title = document.createElement('header');
        title.classList.add('card-header', 'font-weight-bold');
        title.appendChild(document.createTextNode(things[i].title));
        section.appendChild(title);

        const body = document.createElement('div');
        body.classList.add('card-body');
        section.appendChild(body);

        if (things[i].description) for (let j = 0; j < things[i].description.length; j++) {
            const p = document.createElement('p');
            p.innerHTML = convertURLstoLinks(things[i].description[j]);
            body.appendChild(p);
        }

        if (things[i].links) {
            const ldl = document.createElement('dl');
            processLinks(things[i].links, ldl);
            body.appendChild(ldl);
        }
    }

    return div;
}
*/

// naively match URLs in plain text and convert to links
/*
export function convertURLstoLinks(str) {
    return str.replace(
        /(https?:\/\/[^\s]+[^\.])/g,
        '<a href="$1" target="_new" rel="noopener">$1</a>'
    );
}
*/

// process a domain
/*
export function processDomain(object, dl, toplevel = false) {

    if (toplevel) document.title = 'Domain ' + (object.unicodeName ? object.unicodeName : object.ldhName).toUpperCase() + ' - RDAP Lookup';

    if (object.unicodeName) {
        addProperty(dl, 'Name:', object.unicodeName);
        addProperty(dl, 'ASCII Name:', object.ldhName);

    } else {
        addProperty(dl, 'Name:', object.ldhName);

    }

    if (object.handle) addProperty(dl, 'Handle:', object.handle);

    // process events, status and entities here, then set them to null so processCommonObjectProperties()
    // doesn't process them again. this makes the output look more like a traditional whois record:
    if (object.events) processEvents(object.events, dl);
    if (object.status) processStatus(object.status, dl);
    if (object.entities) processEntities(object.entities, dl);

    object.events = object.status = object.entities = null;

    if (object.nameservers) {
        const div = document.createElement('div');

        for (let i = 0; i < object.nameservers.length; i++) div.appendChild(processObject(object.nameservers[i]));

        addProperty(dl, 'Nameservers:', div);
    }

    addProperty(dl, 'DNSSEC:', object.secureDNS && object.secureDNS.delegationSigned ? 'Secure' : 'Insecure');

    processCommonObjectProperties(object, dl);
}
*/

// process a nameserver
/*
export function processNameserver(object, dl, toplevel = false) {

    if (toplevel) document.title = 'Nameserver ' + object.ldhName + ' - RDAP Lookup';

    addProperty(dl, 'Host Name:', object.ldhName);
    if (object.unicodeName) addProperty(dl, 'Internationalised Domain Name:', object.unicodeName);
    if (object.handle) addProperty(dl, 'Handle:', object.handle);

    if (object.ipAddresses) {
        if (object.ipAddresses.v4) {
            for (var i = 0; i < object.ipAddresses.v4.length; i++) {
                addProperty(dl, 'IP Address:', createRDAPLink('https://rdap.org/ip/' + object.ipAddresses.v4[i], object.ipAddresses.v4[i]));
            }
        }

        if (object.ipAddresses.v6) {
            for (var i = 0; i < object.ipAddresses.v6.length; i++) {
                addProperty(dl, 'IP Address:', createRDAPLink('https://rdap.org/ip/' + object.ipAddresses.v6[i], object.ipAddresses.v6[i]));
            }
        }
    }

    processCommonObjectProperties(object, dl);
}
*/

// process an entity
/*
export function processEntity(object, dl, toplevel = false) {

    if (toplevel) document.title = 'Entity ' + object.handle + ' - RDAP Lookup';

    if (object.handle) addProperty(dl, 'Handle:', object.handle);

    if (object.publicIds) {
        for (let i = 0; i < object.publicIds.length; i++) addProperty(dl, object.publicIds[i].type + ':', object.publicIds[i].identifier);
    }

    if (object.roles) addProperty(dl, 'Roles:', createList(object.roles));

    if (object.jscard) {
        addProperty(dl, 'Contact Information:', processJSCard(object.jscard));

    } else if (object.jscard_0) {
        addProperty(dl, 'Contact Information:', processJSCard(object.jscard_0));

    } else if (object.vcardArray && object.vcardArray[1]) {
        addProperty(dl, 'Contact Information:', processVCardArray(object.vcardArray[1]));
    }

    processCommonObjectProperties(object, dl);
}
*/

// process an entity's vCard
/*
export function processVCardArray(vcard) {
    const vdl = document.createElement('dl');

    for (let i = 0; i < vcard.length; i++) {
        const node = vcard[i];

        let type = node[0];
        let value = node[3];

        if ('version' == type) {
            continue;

        } else if ('fn' == type) {
            type = 'Name';

        } else if ('n' == type) {
            continue;

        } else if ('org' == type) {
            type = 'Organization';

        } else if ('tel' == type) {
            type = 'Phone';

            if (node[1].type) for (var j = 0; j < node[1].type; j++) if ('fax' == node[1].type[j]) {
                type = 'Fax';
                break;
            }

            var link = document.createElement('a');
            link.href = (0 == value.indexOf('tel:') ? '' : 'tel:') + value;
            link.appendChild(document.createTextNode(value));

            value = link;

        } else if ('adr' == type) {
            type = 'Address';

            if (node[1].label) {
                var div = document.createElement('div');
                strings = node[1].label.split("\n");
                for (var j = 0; j < strings.length; j++) {
                    div.appendChild(document.createTextNode(strings[j]));
                    if (j < strings.length - 1) div.appendChild(document.createElement('br'));
                }

                value = div;

            } else if (value) {
                var div = document.createElement('div');

                for (var j = 0; j < value.length; j++) {
                    if (value[j] && value[j].length > 0) {
                        div.appendChild(document.createTextNode(value[j]));
                        div.appendChild(document.createElement('br'));
                    }
                }

                value = div;
            }

        } else if ('email' == type) {
            type = 'Email';

            var link = document.createElement('a');
            link.href = 'mailto:' + value;
            link.appendChild(document.createTextNode(value));

            value = link;

        } else if ('contact-uri' == type) {
            type = 'Contact URL';

            var link = document.createElement('a');
            link.href = value;
            link.appendChild(document.createTextNode(value));

            value = link;
        }

        if (value) addProperty(vdl, type + ':', value);
    }

    addProperty(vdl, 'Contact format:', 'jCard');

    return vdl;
}
*/

/*
export function processJSCard(jscard) {
    const vdl = document.createElement('dl');

    if (jscard.fullName) addProperty(vdl, 'Name:', jscard.fullName);

    if (jscard.organizations) {
        for (const k in jscard.organizations) {
            addProperty(vdl, 'Organization:', jscard.organizations[k].name);
        }
    }

    if (jscard.addresses) {
        for (const k in jscard.addresses) {
            addProperty(vdl, 'Address:', processJSCardAddress(jscard.addresses[k]));
        }
    }

    if (jscard.emails) {
        for (const k in jscard.emails) {
            var link = document.createElement('a');
            link.href = 'mailto:' + jscard.emails[k].email;
            link.appendChild(document.createTextNode(jscard.emails[k].email));

            addProperty(vdl, 'Email Address:', link);
        }
    }

    if (jscard.phones) {
        for (const k in jscard.phones) {
            var link = document.createElement('a');
            link.href = jscard.phones[k].phone;
            link.appendChild(document.createTextNode(jscard.phones[k].phone));

            addProperty(vdl, (jscard.phones[k].features.fax ? 'Fax:' : 'Phone:'), link);
        }
    }

    addProperty(vdl, 'Contact format:', 'JSContact');

    return vdl;
}
*/

/*
export function processJSCardAddress(address) {
    const dl = document.createElement('dl');
    for (k in address) {
        v = address[k];
        if ('street' == k) {
            const addr = document.createElement('span');
            for (let i = 0; i < v.length; i++) {
                if (i > 1) addr.appendChild(document.createElement('br'));
                addr.appendChild(document.createTextNode(v[i]));
            }
            addProperty(dl, 'Street:', addr);

        } else if ('locality' == k) {
            addProperty(dl, 'City:', v);

        } else if ('region' == k) {
            addProperty(dl, 'State/Province:', v);

        } else if ('postcode' == k) {
            addProperty(dl, 'Postal Code:', v);

        } else if ('countryCode' == k) {
            addProperty(dl, 'Country:', v);

        }
    }
    return dl;
}
*/

// process an AS number
/*
export function processAutnum(object, dl, toplevel = false) {

    if (toplevel) document.title = 'AS Number ' + object.handle + ' - RDAP Lookup';

    if (object.name) addProperty(dl, 'Network Name:', object.name);
    if (object.type) addProperty(dl, 'Network Type:', object.type);

    processCommonObjectProperties(object, dl);
}
*/

// process an IP or IP block
/*
export function processIp(object, dl, toplevel = false) {

    if (toplevel) document.title = 'IP Network ' + object.handle + ' - RDAP Lookup';

    if (object.ipVersion) addProperty(dl, 'IP Version:', object.ipVersion);
    if (object.startAddress && object.endAddress) addProperty(dl, 'Address Range:', object.startAddress + ' - ' + object.endAddress);
    if (object.name) addProperty(dl, 'Network Name:', object.name);
    if (object.type) addProperty(dl, 'Network Type:', object.type);
    if (object.country) addProperty(dl, 'Country:', object.country);
    if (object.parentHandle) addProperty(dl, 'Parent Network:', object.parentHandle);
    if (object.cidr0_cidrs) addProperty(dl, 'CIDR Prefix(es):', processCIDRs(object.cidr0_cidrs));

    processCommonObjectProperties(object, dl);
}
*/

/*
export function processCIDRs(cidrs) {
    const list = document.createElement('ul');
    for (i = 0; i < cidrs.length; i++) {
        const cidr = (cidrs[i].v6prefix ? cidrs[i].v6prefix : cidrs[i].v4prefix) + '/' + cidrs[i].length;
        list.appendChild(document.createElement('li')).appendChild(createRDAPLink('https://rdap.org/ip/' + cidr, cidr));
    }
    return list;
}
*/

/*
export function processUnknown(object, dl, toplevel = false) {
    processCommonObjectProperties(object, dl);
}
*/

// given an object, return the "self" URL (if any) 
/*
export function getSelfLink(object) {
    if (object.links) for (let i = 0; i < object.links.length; i++) if ('self' == object.links[i].rel) return object.links[i].href;

    return null;
}
*/

// create an RDAP link: a link pointing to an RDAP URL
// that when clicked, causes an RDAP query to be made
/*
export function createRDAPLink(url, title) {
    const link = document.createElement('a');

    link.href = 'javascript:void(0)';
    link.title = url;
    link.onclick = new Function("runQuery('" + url + "')");
    link.appendChild(document.createTextNode(title));

    return link;
}
*/

const URIPatterns: [RegExp, ObjectType][] = [
    [/^\d+$/, "autnum"],
    [/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/?\d*$/, "ip"],
    [/^[0-9a-f:]{2,}\/?\d*$/, "ip"],
    [/^https?:/, "url"],
    [/^{/, "json"],
    [/./, "domain"],
];

// guess the type from the input value
export function getType(value: string): ObjectType | null {
    for (let i = 0; i < URIPatterns.length; i++)
        if (URIPatterns[i]![0].test(value)) {
            return URIPatterns[i]![1];
        }
    return null;
}