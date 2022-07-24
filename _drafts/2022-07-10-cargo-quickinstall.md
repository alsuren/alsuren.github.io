---
title: DRAFT - cargo-quickinstall
---

This is a public draft of my blog post about `cargo-quickinstall`. I have received some feedback from workmates that I still need to integrate. You can track my progress [in my GitHub Pages repo](https://github.com/alsuren/alsuren.github.io/commits/master/_posts/2022-07-10-cargo-quickinstall.md) or on the [cargo-quickinstall issue](https://github.com/alsuren/cargo-quickinstall/issues/24). Once I have integrated that feedback, I will remove this notice and share it on twitter/reddit/etc.

<!-- TODO: better title - talk about the journey and the achievement? -->

![Full Architecture diagram for cargo-quickinstall](/images/quickinstall/quickinstall-blog-post.excalidraw.png)

I made a thing.

I made a thing that I threw together in a week.

I made a thing that is horrifically complicated, and held together with hot snot and string.

I made a thing that people *seem* to be using.

Halp!

## Pre-built binaies of rust-based tools
<!-- 
link to red-badger

 -->
Back when I was working at Red Badger, we had some GitHub Actions pipelines that relied on some tools that were written in Rust. We had our GitHub actions cache set up and everything, but every so often we would blast away the cache, and get a dog-slow build that had to rebuild all of the tools that we were using, before we could even start compiling our own project. I can't for the life of me remember what those tools were though.

When that project wound down, I had some bench time, so I decided try doing something about it. I decided to build a service that would pre-build your rust tools for you. That way, whenever you would usually write something like:

```bash
cargo install ripgrep
```

you could write:

```bash
cargo quickinstall ripgrep
```

This would install pre-compiled versions of any binaries in the crate. If we don't have a pre-compiled version, it would fallback to cargo install automatically.

The initial implementation of cargo-quickinstall was hacked together in less than a week. I also took the opportunity to make as many terrible architectural decisions as possible. Proper resume-driven development. Good times.

## Initial Implementation

<!-- "build the right thing, build the thing right" - is that how they say it?
? why is it building the right thing - make it clear that it is a joke?

capitalisation of Rust (always the same in the same document) and Wrangler, postgres, heroku, Vercel, Sematext, elasticsearch, api , Rust London, ... 
 -->

Following the Red Badger philosophy of "build the right thing, build the thing right", I decided to build the mechanism for getting the user's package-build requests first. That way, my service would always be "build the right thing".

### Stats Server

<!-- narration to self. Delete. Present as "I did xyz" without observations

qualify that wrangler is cloudflare's devtool
 -->
Looking through `git log --reverse --stat` to write this post has been really interesting. It seems that I started out by creating a cloudflare-workers project in rust, with wrangler, using their KV store. I think it had only just come out at the time, and I quickly realised that taking this approach would be an uphill battle. I don't think there were even official rust bindings to their KV store at the time. I had also read somewhere that their KV store was *heavily* read-optimised (as-in "please think of this as a configuration store, and don't try to make more than 1 write per second", or something). I had grand dreams that I might one-day receive more than 1 request per second, so I decided to switch tack.

The boring choice would be to spin up a heroku app and write to postgres. That was *too* boring though. What other hilarious resume-expanding technology stack could I use?

One of the most fundamental requirements for quickbuild has always been that it shouldn't cost me anything to maintain, so stringing together free-tier teaser offerings was the order of the day.

I remembered meeting with an ad-tech company at a careers fair a few years earlier, and they had a fun architecture. They didn't have *any* of their own servers in the hot loop of serving customers. They would serve *everything* from CDN, including tracking pixels, and then have a cronjob that parsed the CDN logs and used that to generate invoices to their customers. Clever, right? Web Scale!

Following this piece of slightly inappropriate architectural inspiration, I span up an empty Vercel project, and started spamming it with requests to random non-existent pages. I then hooked up the log drain to sematext. My client would make a request to a non-existent page, and immediately receive a 404 response. I would then periodically query the sematext elasticsearch API. No cold-start lambda delays to worry about. Brilliant.
<!-- 
TODO: change this into a footnote - see https://github.com/alecmocatta/alecmocatta.github.io/blob/master/_posts/2018-09-28-culture-biased-iq-test-of-bureaucracy.markdown for example
(In practice, when I made the client, I made it do this request in a background thread anyway, so it doesn't *really* matter how long my cold-start time is). -->

### Artifact Storage

<!-- jfrog bintray - explain what it is

[past experience](mijia-homie) that ... bintray. define bintray -->

I was already using Bintray for debian package repository hosting on [another personal project](https://github.com/alsuren/mijia-homie). I hacked up a script to build a package and upload it to bintray from my laptop. I ran it on a single package to get me started, and moved on.

### Client

<!-- [list](commit with the original list in)
[`jq`](link to jq)
[`tinyjson`](link)
 -->

Next on the list was the `cargo-quickinstall` client. This is basically a glorified bash script. I wanted `cargo install cargo-quickinstall` to be as quick as possible, so I only used things that were in `std`, and shelled out to the system's `curl` and `tar` binaries to do the actual work. `curl` and `tar` are both available on modern Windows boxes by default, so this turns out to be a surprisingly portable choice. I also initially did json parsing with `jq`, but this has since been replaced with `tinyjson` because apparently nobody has `jq` installed (they don't know what they're missing).

The initial client basically did this:

![](/images/quickinstall/quickinstall-blog-post-bintray-client.excalidraw.png)

### Automated Builder

The automated builder is responsible for this half of the architecture diagram:

![](/images/quickinstall/quickinstall-blog-post-sematext-builder.excalidraw.png)

The initial implementation got its list of requested crates from sematext's elasticsearch api. It was pretty simple - it would just make a list of all requested packages, and try to build + upload the first one that we didn't already have a package of in bintray. If there was nothing to do then it would just build `cargo-quickinstall` for good luck (which only takes a couple of seconds, so isn't that much wasted work).


#### Security and Trust

It's worth digging into the `cargo-quickinstall` trust model at this point. 

The trust model is currently:

1. you trust the author of the crate that you asked for, and its dependencies.
2. you trust me to be acting in good faith, and to have configured GitHub actions and GitHub releases correctly, and my sandboxing to be adequate.
3. you trust GitHub not to replace everyone's released binaries with cryptomalware.

`cargo-quickinstall` does not trust the author of **any** package on crates.io. As soon as we have run the crate's build.rs or any proc macros, we must treat the build box as compromised. There is some gymnastics involved here, so bear with me.

<!-- copy-paste this here:

Assuming that you trust `cargo-quickinstall` and that our sandboxing is solid, by using `cargo install $CRATE`, you're not forced to trust anyone that you're not already trusting by running `cargo install $CRATE`.
-->

#### GitHub Actions Gymnastics

The cronjob works out which crate needs to be built next for each target architecture, and which runner OS we need to build it on.

The workflow that does the building is given `$CRATE` `$VERSION` `$BUILD_OS` and `$TARGET_ARCH`. We currently supply these variables by running `sed` over a template, and committing the result to git. If I was writing it again today from scratch, I might revisit this decision, but this works well enough for now.

We spin up a runner with `$BUILD_OS` on it, and do the build. This essentially runs `cargo install $crate` and then tars up the resulting binaries and uses `actions/upload-artifact` to upload it with a known filename, so that it is available for other jobs in the same build pipeline. 

**Security notice:** I'm assuming that all runners are able to use `actions/upload-artifact` without any extra creds. I've not really dug into it that much. If it turns out that the runner is being given some kind of god token, and that token is available to `$CRATE`'s untrusted `build.rs` for doing anything other than uploading build artifacts then we're in big trouble. If you believe this to be the case, please email me so that I can stop building new packages and do a proper audit/redesign.

Once the builder is finished, we throw it in the bin, and spin up a new `ubuntu-20.04` runner. This downloads the tarball from `actions/upload-artifact` and uploads it to GitHub Releases (previously bintray).

<!-- [^1](previously bintray) -->

<!-- github.com/actions/runner - let's look through the source code before. Do secrets get sent to jobs that don't need them (Alec thinks that they *do* get sent to *steps* that don't need them)


https://securitylab.github.com/research/github-actions-preventing-pwn-requests/

 -->

By doing this whole dance, we ensure that a malicious crate author can only poison the tarball of their own crate, or any crates that depends on their crate. If you run `cargo install $CRATE` then you already trust every crate in `$CRATE`'s dependency tree, and you already trust GitHub for the crates.io index. Assuming that you trust `cargo-quickinstall` and that our sandboxing is solid, by using `cargo install $CRATE`, you're not forced to trust anyone that you're not already trusting by running `cargo install $CRATE`.

![Sequence diagram of GitHub Actions builders](/images/quickinstall/quickinstall-blog-post-ci-sequence-diagram.excalidraw.png)

There are probably massive holes in this logic. Even if it's all sound, `cargo-quickinstall` has never been audited. If you work at Microsoft/GitHub and/or would like to sponsor a security researcher to help me audit this, please leave a comment on [this issue](https://github.com/alsuren/cargo-quickinstall/issues/49) or contact me privately.

<!-- This is a good title. More like this plz -->
## Bootstrapping the package list

There is a bit of a chicken-and-egg problem with the approach I have described so far. If you don't have any users then you won't have any idea which packages need to be built. New users will always find that we don't have the packages that they want, so they will stop using our service. This means they will not tell us the names of any more packages that they want building.

To break this cycle, I made a list of popular packages by grabbing the html from [https://lib.rs/command-line-utilities](https://lib.rs/command-line-utilities) and pulling out the package names into a flat text file using [`pup`](https://github.com/EricChiang/pup) and `jq`.

<!-- This is a good title. More like this plz -->
### Skipping broken packages

Not all crates build on all platforms. Initially, my builder didn't have any memory of what it had attempted to build, so when it came across a package that it couldn't build, it would get stuck and attempt to rebuild it every hour until I manually excluded it. It also did each of the platforms in series, so a broken windows build would block progress on all platforms. It was also racey, so if a build took over an hour (or if I got impatient and triggered multiple builds in an hour) it would sometimes build the same package twice, and then crash when trying to upload it.

This is where the "sed the template and commit it to git" approach comes in. There is a branch for each target (`trigger/$TARGET`), and each time the cronjob builds, it checks out each `trigger/$TARGET` branch, using `git worktree`, and checks what it last attempted to build. It then walks down the list of popular/requested crates, and makes a new commit to trigger a build of the next crate *after* the one that was last attempted. We still do a lot of useless builds of packages that would never compile, but at least we weren't head-of-line blocking anymore.

<!-- [head-of-line blocking](wikipedia) || find a different way to phrase it -->

Later, when we started pushing tags for each successful build (as part of the switch to GitHub releases), we were able to detect repeatedly-failing builds and automatically add the offending packages to the exclude list. This process is a little fragile, and it currently errs on the side of building known-broken packages occasionally, but it's better than nothing.

## Free Tiers Don't Last Forever

The danger of relying on free-tier stuff is that your provider is not beholden to you in any way. They may take away your service at any time.

<!-- link to hack-and-learn on meetup; spotify-tui

reword end-of-life to made read-only || shut down
 -->
The first service to fall was bintray. Around this time, I was mentoring a hack-and-learn, and the `spotify-tui` maintainer pointed out that they use GitHub actions to make their releases, and that the release artifacts show up with predictable URLs. I had a bit of time before `bintray` was due to be properly end-of-lifed, so I kicked off the builder to also upload to GitHub Releases, and then made a release to make the client fetch from both places.

<!-- I was not hugely surprised - it was a terrible idea anyway -- alec doesn't like this - undermines reader; one doesn't follow from other -->

The next free-tier service to go a way was sematext. When sematext ended the free tier that my log pipeline was using, I was not hugely surprised - it was a terrible idea anyway. I added [a couple of typescript endpoints](https://github.com/alsuren/warehouse-clerk-tmp/tree/master/pages/api) to my vercel site so I was no longer relying on logs of 404 errors. Boring. I like boring. Boring is good, especially for things that people are using, and that I need to actually maintain.

<!-- thanks to my awesome external contributors. Emojis? -->
## External Contributors

I have really enjoyed working with external contributors on cargo-quickinstall. The client is *super simple*, so it is reasonably approachable for beginners. After mentoring two rust-london hack-and-learn events, most of the low-hanging fruit has been picked, but there are approachable issues that show up from time to time. If you want to have a go at one, check out the [good first issue](https://github.com/alsuren/cargo-quickinstall/labels/good%20first%20issue).

## Next Steps

There are a few open issues [on the board](https://github.com/alsuren/cargo-quickinstall/projects/1?fullscreen=true), and I'm happy to mentor people on any of them. The issue that I'm especially interested in mentoring someone on is [the one for building static binaries for non-ubuntu-20.04 support, and shelling out to `cargo-binstall` for the more complex fallback behaviour](https://github.com/alsuren/cargo-quickinstall/issues/84).

At the moment, there are no time-critical issues on the board (no security issues, and nothing that represents a regression for existing users in CI), so I am mostly leaving things open and offering mentoring on them. It is more valuable at the moment to get more people familiar with the codebase, and improve the bus-factor of the project.
<!-- [bus-factor](xkcd) -->

<!-- better title plz -->
## cargo-quickbuild

The other reason for me taking this approach with `cargo-quickinstall` is `cargo-quickbuild`. This is a project idea to take *parts* of dependency trees, rather than just the end-result. I have started progress on this over in a new [cargo-quick repo/org](https://github.com/cargo-quick/cargo-quick). The idea is to have a tool to make from-scratch builds quicker, by providing a central repo of prebuilt crates. It will have the same trust model as `cargo-quickinstall`, but a slightly more complex architecture. Once quickbuild has come along a bit further, I will port the quickinstall builder to use it, and then merge `cargo quickinstall` into the `cargo-quick` repo.

<!-- "this raises the question" 

if you mention these things and then not position yourself relative to them, it feels like an omission

f,g focus on x
l,k focus on y
quickbuild focuses on z -- needs to make it feel like it is in a new category - doesn't need to be too precice/accurate

editifying to have a taxonomy comparing these tools against each other

(read 
https://hadean.com/blog/managing-rust-dependencies-with-nix-part-ii/ so that you don't say something obviously false about nix)

- [ ] find the reddit comment where someone suggests that I should make quickbuild

 -->
It is reasonable to compare `cargo quickbuild` with things like `cargo-chef`, `sccache`, `bazel` and `nix`. These tools are all in a similar space, and I will definitely be stealing ideas from all of these projects. My aim with quickbuild is to meet users where they are. I'm hoping to produce noticeable speed-ups of from-scratch builds without requiring configuration changes in the user's computer or project. I also aim to build on shared infrastructure, available to all, so you don't need any involvement from finance or your ops team. I will be making use of free "open source tier" compute resources for building my packages, but they will be available for use by anyone to reduce their build times and CI costs, as long as they are happy to share their list of crates.io dependencies.

I will be sinking a bunch of time into quickbuild in August. If you would like to become the first sponsor this work, please go to [my GitHub Sponsors page](https://github.com/sponsors/alsuren).
