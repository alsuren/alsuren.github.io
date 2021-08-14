---
title: Got a desk frame
---

I started to do some analysis of the examples I found the previous week.
Of the 6408 Cargo.toml examples that I downloaded from github (and ran `cargo add --manifest-path=$f  boringssl@0.0.5`) against:

* 4808 just added a single line with the dependency
* 524 also fixed the newlines at the end of the file
* 851 also added a `[dependencies]` section (because there was none previously)
* 226 do a bunch of reordering of sections

(I may need to re-do this analysis, because I used --ignore-space-change for some things, to get around the `\no newline at end of file` changes).

I also spent a little time switching from rls to rust-analyser. It seemed okay, but it was using a lot of CPU (an entire core in Kernel space for a large number of minutes, and then an entire core in userspace whenever I had a rust file open in my editor). I started working with dtrace to find out what it was doing, and the flamegraph said it was setting up file watchers for the first period, and running the chalk solver in the second period.

I also got a desk frame for the space room, and mostly assembled it, but we cut the top for it over the long weekend in my dad's shed.
