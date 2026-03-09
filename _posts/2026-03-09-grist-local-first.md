---
title: "Grist and Local-First"
date: 2026-03-09
---

My previous company was called Opvia. It was basically Notion, but with stronger guarantees around audit logging and version management, so it was easier to sell into regulated industries. I was pretty proud of a lot of the things I built there, but I wasn't so okay with the perverse incentives that come with being a SaaS system of record company. Specifically, "are we sticky with our customers because we make their lives better than using excel, or are we sticky because once you've spent all this time getting data into the system in a nice relational way, and it's a massive pain to get the data out again?"

After leaving Opvia, I wanted to make something that did all of the same stuff but without the data lock-in and perverse incentives that we had. I had stumbled across the local-first movement, and all the crazy things people were doing with sqlite. In my vision, I wanted something that worked like excel from my childhood (where you pass around .xls files) but each file contained the whole database. I decided that I would solve the multiplayer story using something like cr-sqlite, and was blissfully naive about the conflict resolution piece. I suppose what I was building in my head was Microsoft Access.

Recently, I was browsing around the EMFCamp site and stumbled upon https://www.getgrist.com/. It is open source and uses sqlite as the file format. I think this is basically what I would have built at the end of that summer, if I was not in danger of running out of money. I suddenly became really excited about this, and told everyone who would listen.

It is basically Airtable, but open source and with data sovereignty. Each column directly maps to a column in a sqlite database, and each row to a row. There are a few reserved metadata tables for configuring widgets and views, but if you fetch the .grist file from the cloud server (or grist-static) then you can open it in the sqlite3 cli and `select * from mytable` will do exactly what you expect.

In the last few years I have gone all in on sqlite and local-first (including going to Local-First Conf in Berlin and the local-first devroom at FOSDEM, and even joining the D1 managed sqlite database team at Cloudflare).

I was surprised not to see more hype from Grist around local-first. I had stumbled across grist-static (which is a fully in-browser version of Grist that can be hosted on github pages). I assumed that they were probably doing pretty well against most of the local-first ideals from the paper:

1. No spinners: your work at your fingertips

If grist-static exists then surely everything can be done in the browser completely offline, right?

The future looks like it could be pulled in this direction, but unfortunately that is not the primary architecture right now. As it stands, when you open a Grist document, it fetches the sqlite file from S3 into a server and starts a Python sandbox to serve the backend for your database. If you lose connection then it will show a toast for a second.

10 out of 10 for grist-static, but 0 out of 10 for grist-proper.

3. Your work is not trapped on one device

10 out of 10 here. Everything is done on the server, but you can access it from anywhere and the format that the server stores your work in is the same sqlite .grist file format that you are given when you download the database for local use.

5. The network is optional

8 out of 10 for grist-static but 0 out of 10 for grist-proper.

7. Seamless collaboration with your colleagues

I haven't been using grist to collaborate with anyone so far, but it has public projects and you can invite people to your team. They even have a fork and merge ui, which I'm looking for an excuse to play with. Grist also got a bunch of money from the French government, so I expect it to work reasonably well for government department sized teams.

0 out of 10 for grist-static but 9 out of 10 for grist-proper.

9. The Long Now

10 out of 10. Sqlite is a stable file format and the contents are basically what you would expect given your table layout. The whole thing is open source and can be statically hosted.

One thing to note is that widgets are basically iframes and can point basically anywhere. I wonder if there might be some scope for golang-style caching proxies, or even a system for vendoring widgets into your sqlite file (they have a jsfiddle-like UI for authoring widgets if you want).

11. Security and privacy by default

7 out of 10? They have some fancy row level security things in their enterprise offering, but fundamentally the server needs to be able to read the whole database, and retrofitting end to end encryption into the thing would be quite tricky.

13. You retain ultimate ownership and control

I fundamentally trust grist to act in my interests more than I trust Airtable or Notion. The fact that a self hosted version is just a single docker command away, and the statically hosted version is so capable, gives me confidence that I will be able to eject onto fly.io if I need to. I would love to say Durable Objects here, but the lack of ability to fetch/post the underlying sqlite backing store for a Durable Object makes some things hard.

Bonus: https://bsky.app/profile/orionreed.com/post/3mgb6vig4b22m if you consider grist widgets to be apps and Grist to be some data infrastructure/container then maybe it is already approaching the vision that Orion Reed is describing.

Conclusion

I would not say that Grist has all of the local-first ideals nailed. I would not even imagine that it has been written with a local-first mindset. I realised as I was using it that the data sovereignty piece is the one that I really care about though, and that is why I am all in on Grist at the moment. I would much rather have Grist with its long-now-proof sqlite storage than affine with its magical real time sync engine and no trust that I will be able to get my data out in 10 years time.
