---
title: "A Love Letter to Grist"
date: 2026-03-09
---

My previous company was called [Opvia](https://www.opvia.io/). It was basically [Notion](https://www.notion.so/), but with stronger guarantees around audit logging and version management, so it was easier to sell into regulated industries. I was pretty proud of a lot of the things I built there, but I wasn't so okay with the perverse incentives that come with being a SaaS system of record company. Specifically, I was haunted by the question "are we sticky with our customers because we make their lives better than using excel, or are we sticky because once you've spent all this time getting data into the system in a nice relational way, and it's a massive pain to get the data out again?"

After leaving Opvia, I wanted to make something that did all of the same stuff but without the data lock-in and perverse incentives that we had. I had stumbled across the [local-first movement](https://www.inkandswitch.com/local-first/), and all the crazy things people were doing with SQLite. In my vision, I wanted something that worked like Excel from my childhood (where you pass around .xls files) but each file contained the whole database. I decided that I would solve the multiplayer story using something like [cr-sqlite](https://github.com/vlcn-io/cr-sqlite), and was blissfully naive about the conflict resolution piece. I suppose what I was building in my head was Microsoft Access.

Recently, I was browsing around the [EMF Camp](https://www.emfcamp.org/) site and stumbled upon [Grist](https://fwww.getgrist.com/). It is open source and uses sqlite as the file format. I think this is basically what I would have built at the end of that summer, if I was not in danger of running out of money. I suddenly became really excited about this, and told everyone who would listen.

It is basically [Airtable](https://www.airtable.com/), but open source and with data sovereignty. Each column directly maps to a column in an sqlite database, and each row to a row. There are a few reserved metadata tables for configuring widgets and views, but if you fetch the .grist file from the cloud server (or [grist-static](https://github.com/gristlabs/grist-static)) then you can open it in the sqlite3 CLI and `select * from mytable` will do exactly what you expect.

In the last few years I have gone all in on sqlite and local-first (including going to [Local-First Conf](https://www.localfirstconf.com/) in Berlin and the local-first devroom at [FOSDEM](https://fosdem.org/), and even joining the [D1](https://developers.cloudflare.com/d1/) managed sqlite database team at [Cloudflare](https://www.cloudflare.com/)).

I was surprised not to see more hype from Grist around local-first. I had stumbled across grist-static (which is a fully in-browser version of Grist that can be hosted on [GitHub Pages](https://pages.github.com/)). I assumed that they were probably doing pretty well against most of the [local-first ideals from the paper](https://www.inkandswitch.com/local-first/):

### 1. No spinners: your work at your fingertips

If grist-static exists then surely everything can be done in the browser completely offline, right?

The future looks like it could be pulled in this direction, but unfortunately that is not the primary architecture right now. As it stands, when you open a Grist document, it fetches the sqlite file from S3 into a server and starts a Python sandbox to serve the backend for your database. If you lose connection then it will show a toast for a second telling you it is in read-only mode before it reconnects.

10 out of 10 for grist-static, but 0 out of 10 for grist-proper.

### 2. Your work is not trapped on one device

Everything is done on the server, but you can access it from anywhere and the format that the server stores your work in is the same sqlite .grist file format that you are given when you download the database for local use.

10 out of 10.

### 3. The network is optional

8 out of 10 for grist-static but 0 out of 10 for grist-proper. See point 1.

### 4. Seamless collaboration with your colleagues

I haven't been using grist to collaborate with anyone so far, but it has public projects and you can invite people to your team. They even have a fork and merge ui, which I'm looking for an excuse to play with. Grist also got a bunch of contributions from the French government, so I expect it to work reasonably well for government department sized teams.

If I could change anything here, I would make it easier to export a .grist file, edit it in some external program and then use the fork and merge ui to compare changes before overwriting the original on the server. It currently defaults to creating a new document, which is *technically* nondestructive, but not very satisfying if you have public links that point into the original and you don't want to break them by archiving it. I get that this kind of reconciliation problem is *extremely hard*, and an area of [ongoing](https://www.inkandswitch.com/upwelling) [research](https://www.inkandswitch.com/patchwork/notebook/). I also understand that getting it wrong can be *disastrous*, so I understand why they've done it like they have. A boy can dream though, right?

0 out of 10 for grist-static but 9 out of 10 for grist-proper.

### 5. The Long Now

This is the whole fucking deal. I can't emphasize this enough. This is important especially right now, and especially for people who [paid attention in history class](https://fosdem.org/2026/schedule/event/SFKNTZ-welcome_to_fosdem_2026/).

When I got bitten by the local-first bug during my summer after Opvia, it felt like going back to [my Freedesktop roots](https://www.collabora.co.uk/). People were taking principled stances on things, and talking about [certain ideals](https://www.inkandswitch.com/local-first/) in the same way that Free Software people talk about [certain freedoms](https://en.wikipedia.org/wiki/The_Free_Software_Definition#The_Four_Essential_Freedoms). This ideal is the place where the two communities overlap.

So how does Grist do here?

Grist's backing store and interchange format are .grist files. These are sqlite databases under the hood, which is what your browser uses, and also most iphone and android apps. The sqlite file format is basically infrastructure at this point, and grist uses it in a way that I would have never dreamed of when I was working at Opvia. A .grist file's database structure closely mirrors what you see in the UI (with some extra book-keeping tables off on the side). Whenever you make a change to your table structure, grist runs ALTER TABLE on the sqlite database to make the change. This means that you can drop into the sqlite3 cli or tableplus and do *whatever you want* to the underlying data without any grist-specific tooling in sight, and without any fear of data getting silently omitted in the export process. For a multi-tenant system running on top of postgres, this would be unheard of. Really nice.

To give another comparison, the other local-first Notion clone that I tried out in my summer off was [AFFiNE](https://affine.pro/). It can also run entirely in the browser, and has an offline-capable CRDT-based sync engine. On the surface of it, .grist files and .affine files are both sqlite databases, but .affine's tables are just a bunch of opaque binary CRDT nonsense. I would not expect to be able to edit a .affine file in any tool other than affine itself.

AFFiNE is AGPL licensed, so in theory you can keep it going in the long now. I don't expect anyone to build a hosting business around it if affine folds though. When I tried to contribute to it, their issue tracker was in a closed linear project, and it was an uphill struggle because I couldn't see whether my contributions were aligned with their vision at all. It seems like their github issue tracker is more active now, so maybe that changed since then.

Grist's core is Apache licensed. This is a solid license that smells like Internet Infrastructure. Issues are public, and there are a bunch of contributions from external organisations, including the french government.

10 out of 10.

### 6. Security and privacy by default

I was in the radical openness camp until Facebook made that deeply unfashionable. I used to keep a [public trello board](https://trello.com/b/oUj099Rh) of all of my project ideas (which at some point got [moved to airtable](https://airtable.com/shrxzaWek4fIuLFys/tbl6uWspa4WBsm3Nr/viwA6Pty74btc1Ltm?blocks=hide) and then maybe affine before being abandoned). I'm now I'm starting to build that up again [in grist](https://alsuren.getgrist.com/sAknM8Q9Z4cB/Public-Projects/p/5) (one day I will build a kanban view that I actually like, I promise). I also have a private database for tracking house things that I share only with people I live with. I do not expect to be served adverts about the contents of either of these databases.

Grist also has some fancy [row level security](https://support.getgrist.com/access-rules/) things that are enforced server-side, but fundamentally the server needs to be able to read the whole database, and retrofitting end to end encryption into the thing would be quite tricky.

[Note: when I shared this post with folks on the grist discord, they mentioned that grist started out as a desktop app with end-to-end encrypted sync. You can still feel those roots in a bunch of places, even though the architecture has changed a lot since then.]

7 out of 10?

### 7. You retain ultimate ownership and control

I fundamentally trust Grist to act in my interests more than I trust Airtable or Notion. The fact that a self hosted version is just a single docker command away, and the statically hosted version is so capable, gives me confidence that I will be able to eject onto [fly.io](https://fly.io/) if I need to. I would love to say [Durable Objects](https://developers.cloudflare.com/durable-objects/) here, but the lack of ability to fetch/post the underlying sqlite backing store for a Durable Object makes some things hard.

One thing to note is that widgets are basically iframes, and can point basically anywhere. I didn't mention it in The Long Now, but I wonder if there might be some scope for golang-style caching proxies, or even a system for vendoring widgets into your .grist file (grist has a jsfiddle-like UI for authoring widgets if you want, and they do get stored in the .grist file). Honestly though, if I lose a couple of widgets over the decades, but my data is in the shape that **I** specified in the UI, it won't be much work to build replacements.

Bonus: if you consider Grist widgets to be apps and Grist to be some data infrastructure/container then maybe it is already approaching [the vision that Orion Reed is describing in this post](https://bsky.app/profile/orionreed.com/post/3mgb6vig4b22m).

10 out of 10 again.

## Conclusion

I would not say that Grist has all of the local-first ideals nailed. I don't think anyone does. I realised as I was using it that the data sovereignty piece is the one that I really care about though, and that is why I am all in on Grist at the moment. I would much rather have Grist with its long-now-proof sqlite storage than AFFiNE with its magical real time sync engine and no trust that I will be able to get my data out in 10 years time.
