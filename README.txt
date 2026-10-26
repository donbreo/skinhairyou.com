SKIN HAIR & YOU - STATIC WEBSITE

Run `npm ci`, then set the values from sample.env in your environment and
run `npm start`. On Linux/macOS, use `set -a && . ./sample.env && set +a
&& npm start`. Node.js 20 or newer is required. Node does not load sample.env
automatically.
All 12 HTML pages contain their own complete content and navigation.
Styling is in assets/site.css; optional interactions are in assets/site.js.
Images and fonts are local to assets, so the folder can be deployed on its own.

SERVER AND HTTPS DEPLOYMENT
server.js serves only the allowlisted HTML pages, robots.txt, sitemap.xml,
llms.txt and files in assets/.
It sets security headers, a restrictive Content Security Policy, disables
unneeded HTTP methods and limits request timeouts and header counts.
For a Cloudflare Tunnel running on this same server, use the sample.env
values: HOST=127.0.0.1, PORT=12207 and TRUST_PROXY=loopback. In the tunnel's
public-hostname or ingress configuration, route demo.skinhairyou.com to
http://127.0.0.1:12207. Example local-managed ingress:

  ingress:
    - hostname: demo.skinhairyou.com
      service: http://127.0.0.1:12207
    - service: http_status:404

Cloudflare serves HTTPS at the edge; cloudflared makes an outbound tunnel
connection and forwards requests to the local HTTP origin. Do not expose
port 12207 publicly. When cloudflared runs in a container or on a different
host, use an origin address reachable from it and set TRUST_PROXY only to
the exact trusted proxy address/network. Ensure the proxy overwrites
X-Forwarded-* headers. DNS/public-hostname routing and TLS are configured
in Cloudflare; no origin certificate is needed for this loopback HTTP setup.

THEME DEMO
Add ?theme-demo=1 to any page URL to reveal the temporary palette selector.
Green, purple and red palettes update the page accents, logo SVG and browser
theme color; purple is the default when no valid saved selection exists.
The selection is remembered in this browser. Remove the selector
by removing the theme-demo block near the top of assets/site.js and the
.theme-demo styles in assets/site.css when the demo is complete.

Migrated pages:
Home, About us, Our services, Hair Disorders, Hair Transplant (FUE),
Nail Disorders, STD / HIV Care, Skin Disorders, Facial Cleansing,
Journal (the original Blog), Results, and Contact.

The original articles, treatment topics, patient testimonial, six results
images, clinic addresses and phone numbers have been carried over.
Copy has been edited for readability and to avoid guaranteed medical
outcomes or misleading treatment claims. Have a clinician review treatment
information and confirm the current contact details before publication.

CONTACT FORM
The vanilla JavaScript form requires a name, then opens a prefilled
WhatsApp chat to +91 98197 97935. All other enquiry details are optional.
Visitors review and send the message in WhatsApp; this website does not
send or store the form data. No PHP or third-party form service is used.
Without JavaScript, visitors can open a WhatsApp chat directly using the
link on the contact page.

The mobile navigation and results viewer are progressively enhanced.
All content and normal page links remain available without JavaScript.
The gallery supports filtering, arrow keys and Escape to close.

SEO AND AI SEARCH DISCOVERY
The authoritative site is https://www.skinhairyou.com. All 12 pages have
static canonical URLs, descriptive titles and summaries, Open Graph and
Twitter cards, and JSON-LD describing the site, clinic organisation and
page. Treatment pages describe services and breadcrumbs. About and Contact
include the two MedicalClinic locations using the published addresses.
The journal describes its three existing articles without inventing dates
or clinician reviews. No ratings, prices, opening hours or qualifications
have been fabricated.

Edit metadata and structured data in scripts/seo.js, then run
`npm run seo:generate`. Generated metadata is embedded in the HTML and
works without JavaScript, including on static hosts. Keep visible content
and structured facts in sync. `npm run check` detects stale generated
output; `npm test` checks metadata, links, entity references, crawler files,
HTTP responses, redirects and security headers. Restart the Node server
after changing HTML because its CSP hashes are computed at startup.

robots.txt allows ordinary search crawlers, OAI-SearchBot (ChatGPT search)
and GPTBot (potential training use), as selected by the site owner.
llms.txt is a supplementary public content guide, not a requirement or
a guarantee of recognition by OpenAI or other AI systems. AI search
discovery relies primarily on crawlable, useful, factual public pages.
User-triggered ChatGPT-User visits are separate from automated crawling.

The Node server redirects /index.html to /, the apex skinhairyou.com host
to www.skinhairyou.com, and production HTTP to HTTPS. Query strings are
preserved. Other hosts, including demo.skinhairyou.com and localhost,
receive X-Robots-Tag: noindex, nofollow and a disallow-all robots.txt.
The proxy must set X-Forwarded-Proto correctly to avoid HTTPS redirect
loops. Configure Cloudflare to route www.skinhairyou.com to this origin
and redirect the apex domain to the www hostname at the edge as well.
On static hosting, configure these redirects and staging crawler rules
in the hosting platform; the checked-in robots.txt allows production
crawling. robots.txt is not an access-control or privacy mechanism.

PUBLISHING CHECKLIST
- Confirm both clinic addresses, telephone numbers and service availability
  with the owner, and have a qualified clinician review medical content.
- Add verified clinician names, qualifications, registration details,
  editorial review dates and medical references when supplied; do not
  present unreviewed journal copy as clinician-reviewed advice.
- Publish to https://www.skinhairyou.com and inspect production pages,
  robots.txt and sitemap.xml. Check Cloudflare/WAF rules do not block
  legitimate Googlebot or OpenAI crawlers; verify crawler IPs using their
  official documentation rather than trusting user-agent names alone.
- Verify the domain in Google Search Console and Bing Webmaster Tools;
  submit https://www.skinhairyou.com/sitemap.xml and inspect key URLs.
- Use Google's Rich Results Test / Schema Markup Validator on public URLs.
  Structured data validity does not guarantee rich-result eligibility.
- Keep a verified Google Business Profile for each clinic and maintain
  consistent names, addresses, phones, hours and authentic patient reviews.
- Monitor indexing and search referrals after publication. No SEO or GEO
  implementation can guarantee rankings, citations or GPT recommendations.

Official guidance:
https://developers.google.com/search/docs/appearance/ai-features
https://developers.google.com/search/docs/appearance/structured-data/local-business
https://developers.openai.com/api/docs/bots
