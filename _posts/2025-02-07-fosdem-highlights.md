---
title: FOSDEM Highlights
---

I was at FOSDEM last weekend, after ~15 years away. I though I should probably write up my highlights while they're fresh in my head.

They should be in chronological order.

#### [The road to open source General Purpose Humanoids with dora-rs](https://fosdem.sojourner.rocks/2025/event/dff0c251-8b99-5e7b-a1b4-309ac341a92d) by Tao xavier

This talk is about a replacement for the ROS framework. It is explicitly trying to be a more Machine-Learning-Researcher-friendly alternative to ROS. Rather than having to have a separate machine/vm running linux + CMake, you can just pip install everything on Windows/Mac/Linux, and it will download the precompiled (typically rust or python) code. It seems to have some funding from huggingface, so from a money point of view, it could be considered a distant cousin of lerobot.

The core seems to be a message bus written with shared memory and apache arrow, which can be used to connect bits of a robot together. This is very similar to ROS.

It also does orchestration by reading yaml files which describe how the bits of the robot fit together. I find it interesting that lerobot previously relied heavily on yaml configurations (using hydra), and recently switched to using straight up python files for its configuration. The reason given by lerobot was that IDE completion support was better if everything is in one language. I guess this doesn't apply to dora, because it is already in two (python and rust).

They finished with a demo involving a reachy robot and some voice commands, using rerun.io for all of the UI elements.

#### [Zap the Flakes! Leveraging AI to Combat Flaky Tests with CANNIER](https://fosdem.sojourner.rocks/2025/event/197ed0a3-5fb7-54e9-874f-031f3c707cde) by Daniel Hiller

This one was an interesting one. I feel like a lot of projects I've worked on would benefit from a tool that can parse github actions logs to spot flakey tests, but that's not what this is about. This is about something that tries to stop flakey tests getting merged to main in the first place. It does this by running the test once and doing a bunch of static+dynamic analysis and then uses the resulting features to predict the probability of it being flakey (using a random forest model). The original implementation is in python, and the talk was about a WIP port to Go for Kubernetes tests.

I caught Daniel after the talk and had a great discussion about the inverted testing pyramid approach. It is definitely much easier to write integration tests and satisfy yourself and stakeholders that they actually test the thing you care about, but 1 hour CI test runs are no fun at all.

I wonder whether it would be possible to write a tool that can collect coverage information from an end-to-end integration tests suite and help you pick targets to distill into a [sans-io data driven integration test suite](https://matklad.github.io/2021/05/31/how-to-test.html). I've heard that LLMs are quite good at writing tests these days, so this coverage-driven test distillation might be something that is already within reach.


#### [How a City Platform Became a Global Community](https://fosdem.sojourner.rocks/2025/event/1e97a5f5-3b7b-5f27-b789-125a7943236f) by Carolina Romero Cruz

I went to this wondering whether they would be talking about something like [Polis](https://pol.is/). It seems like [Decidim](https://decidim.org/) is a much more traditional and multi-faceted collaboration tool than this. It started out in Barcelona and then exploded all over the place during lockdowns, with a bunch of twists and turns in its internal governance and funding journey. One of the takeaways for me was that government procurement is a nightmare.

#### [How I optimized zbus by 95%](https://fosdem.sojourner.rocks/2025/event/c6b5c626-f143-5de3-ad39-607212b13f99) by Zeeshan Ali Khan

I arrived late to this one, because I was actually interested in [Programming ROS 2 with Rust](https://fosdem.sojourner.rocks/2025/event/704b1ba0-5a17-5785-9367-1f840432d40a) by Júlia Marsal Perendreu, which was afterwards. This talk made my day because right at the very end, he mentions that [varlink](https://varlink.org/) is poised to replace dbus in a bunch of places. I'm not currently using desktop linux, so I will probably watch this one from a distance. I was part of the Telepathy core team back at Collabora, and [mijia-homie](https://github.com/alsuren/mijia-homie) is built on top of the BlueZ dbus interface, so I have first hand experience of how funky it can be.

Zeeshan has done a fantastic job with zbus, and I expect him to do the same with varlink.

As a side note, I am hoping that I can watch the video for [Adopting BlueZ in production: challenges and caveats](https://fosdem.sojourner.rocks/2025/event/90ee45c4-a33d-56a1-9435-751f9549dfc3) and see how it compares with our experience on mijia-homie.

#### [Programming ROS 2 with Rust](https://fosdem.sojourner.rocks/2025/event/704b1ba0-5a17-5785-9367-1f840432d40a) by Júlia Marsal Perendreu

I got the impression from this talk that [rclrs](https://crates.io/crates/rclrs) is a pretty good way to make robust production robotics applications. I mostly care about fucking around in python with desktop robot arms though, so I am more excited about lerobot and dora-rs.

#### [Could we actually replace containers?](https://fosdem.sojourner.rocks/2025/event/eccfef06-ff0c-59a7-a1dc-c84b1cb84c9b) by Dan Phillips

This talk was a little piece of gold. The whole project is pure audacity and I love it.

The jist is "Why do we need to wait for this WASI thing to be specified and stabilize? We already have POSIX, that's been stable for decades."

The project provides a libc implementation that can be used to compile basically-unmodified Dockerfile descriptions to WASM targets. They have demos that can run python code in their runtime, and then use basically-standard WASM pre-execution techniques to bring the cold start times way way down compared to native. They seem to have a runtime that works in the browser, bit I suspect the networking implementation needs to call out to an external proxy, because posix sockets are quite a lot more low level than you normally have access to in the browser (I've not checked).

I caught up with Dan afterwards to congratulate him on his audacity. We had a bit of a chin-wag about how server side wasm projects are doing (we both independently know the wasmCloud people).

#### [A long, short history of realtime AI agents](https://fosdem.sojourner.rocks/2025/event/38b00b90-0ef8-50f9-911f-e082836f28bf) by Rob Pickering

The AV wasn't working for this one, which is a shame, but it was interesting to get an insight into how modern realtime speech agents work. The general jist is that you don't try to do speech to text and then pass text into the LLM. What you do instead is tokenize the speech directly and pass the tokens into the LLM. This is a bit like how multimodal models work with images. I get the impression that you also skip the text-to-speech step, but then I'm not sure how you turn the output voice tokens into a text transcript.

#### [Kites for Future - Airborne Wind Energy for everyone](https://fosdem.sojourner.rocks/2025/event/44e4bfb1-f99b-5a47-9899-e119f9d330a8) by Marc de Laporte, Benjamin Kutschan

This one holds a special place in my heart because of [a lockdown project](https://github.com/hoverkite/hoverkite) that I worked on with my housemate. The kitesforfuture.be team are using an architecture that's halfway between [Google's Makani project](https://x.company/projects/makani/) and [the SkySails Mauritius project](https://skysails-power.com/kite-power-for-mauritius/). They use a rigid kite with flaps for control and propellors for launch, but they generate power at the ground station by alternating between using the crosswind effect in the power zone of the wind window and gliding with minimal tension at the edge of the window.

They include a bunch of cool hacks, like:
* abusing the magnetic compass sensor on the esp32 for tracking line angles
* starting off with esp32's wifi protocol, and switching to lora to get better range
* a fishing-rod-like rig for catching the kite and suspending it in mid-air for automatic re-launch
    * now that I'm having another look at the SkySails marketing site, I'm realising that they also have something similar, but **much** more heavyweight.

They also showed a video of [a soft kite based demo at burning man](https://www.youtube.com/watch?v=9IuRIYftyb0) that uses their power plant ground station, but otherwise has a very similar architecture to SkySails. I'm very interested in this, because it sounds like the teleoperation setup could brought into the field without a ground station, and that would be **much** lighter than the full hoverkite setup. While I'm quite fond of our "take these COTS hardware components and hack them together" pluckiness in the hoverkite project, I do admit that adding a steering box up near the kite makes a lot of sense, especially as your lines get longer.

#### [Privacy-first architecture: alternatives to GDPR popup and local-first](https://fosdem.sojourner.rocks/2025/event/28cbbf35-9f71-5dc0-8d54-11731b576921) by Andrey Sitnik

This was another big highlight for me. The talk abstract mentions [slowreader](https://dev.slowreader.app/) as an example, but the talk was mostly about motivating you to actually consider privacy when building modern web apps.

Genuinely entertaining and very approachable.

He called out that most web developers only consider top-down government-based privacy threats: it is also worth considering threats from family, religious groups, local officials and local ISPs in many locales. Concretely, if you don't trust your users' local ISPs then it might be a good idea to proxy their requests for them, to hide them from the ISP.

He also called out current data hording tendencies, and suggested practical ways to be good to your users, like advocating for analytics tools that track events rather than users (and therefore don't need GDPR popups). He suggested a good technique for advocating for the removal of user-tracking info: ask your product manager if they've actually used this piece of information to make a decision in the last 6 months, and when they say no, propose deleting it.

As an aside, I guess the FOSDEM schedule webapp that I am using could be considered privacy-first. It has a similar architecture to slowreader, storing your bookmarks locally in the browser with no cross-device syncronisation, and if you want to share your bookmarks with others (or yourself), you send [a url with a comma-separated list with bookmark ids](https://fosdem.sojourner.rocks/2025/shared?eventIds=dff0c251-8b99-5e7b-a1b4-309ac341a92d,197ed0a3-5fb7-54e9-874f-031f3c707cde,1e97a5f5-3b7b-5f27-b789-125a7943236f,c6b5c626-f143-5de3-ad39-607212b13f99,eccfef06-ff0c-59a7-a1dc-c84b1cb84c9b,38b00b90-0ef8-50f9-911f-e082836f28bf,44e4bfb1-f99b-5a47-9899-e119f9d330a8,28cbbf35-9f71-5dc0-8d54-11731b576921,09fd9904-eadf-54b4-88d8-4c70e2273350).

#### [Row-Level Security sucks. Can we make it usable?](https://fosdem.sojourner.rocks/2025/event/09fd9904-eadf-54b4-88d8-4c70e2273350) by Jimmy Angelakos

I went to this one because we used RLS at my previous company ([this is the recommended approach with postgraphile](https://www.graphile.org/postgraphile/why-nullable/#relations-rls-visibility)). The scheme that he ended up with ended up with was very similar to ours, but he used a GIN index to make the `&&` set overlap operation fast.

### Where to next?

I think the next thing I'm going to is [local-first conf](https://www.localfirstconf.com/). Give me a shout if you're going and want to meet up.

<!-- TODO: patch sojourner so that it can add a link to the upstream schedule (which sometimes contains slides etc) -->
