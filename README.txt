SKIN HAIR & YOU - STATIC WEBSITE

Run `npm ci`, then set the values from sample.env in your environment and
run `npm start`. On Linux/macOS, use `set -a && . ./sample.env && set +a
&& npm start`. Node.js 20 or newer is required. Node does not load sample.env
automatically.
All 12 HTML pages contain their own complete content and navigation.
Styling is in assets/site.css; optional interactions are in assets/site.js.
Images and fonts are local to assets, so the folder can be deployed on its own.

SERVER AND HTTPS DEPLOYMENT
server.js serves only the allowlisted HTML pages and files in assets/.
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
theme color; the selection is remembered in this browser. Remove the selector
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
