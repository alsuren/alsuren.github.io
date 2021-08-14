---
title: Got a screen
---

I was expecting to spend the day fiddling about with profiling, but the previous night I did some more reading around dtrace (there was a hint on dtrace.org about using `appropros dtrace` to find a bunch of pre-installed tools that are written using dtrace). The kicker was:
```
$ sudo opensnoop -p $(pgrep ra_lsp_server)
dtrace: system integrity protection is on, some features will not be available

  UID    PID COMM          FD PATH                 
  501  13184 ra_lsp_server   8 /Users/alsuren/src/cargo-edit/tests/fixtures/github/paritytech/pwasm-ethereum 
  501  13184 ra_lsp_server   8 /Users/alsuren/src/cargo-edit/tests/fixtures/github/paritytech/pwasm-std 
  501  13184 ra_lsp_server   8 /Users/alsuren/src/cargo-edit/tests/fixtures/github/paritytech/parity 
  501  13184 ra_lsp_server   8 /Users/alsuren/src/cargo-edit/tests/fixtures/github/paritytech/rust-rocksdb 
  501  13184 ra_lsp_server   8 /Users/alsuren/src/cargo-edit/tests/fixtures/github/paritytech/parity-daemonize 
  501  13184 ra_lsp_server   8 /Users/alsuren/src/cargo-edit/tests/fixtures/github/paritytech/daemonize-rs 
  501  13184 ra_lsp_server   8 /Users/alsuren/src/cargo-edit/tests/fixtures/github/paritytech/finality-grandpa
```
-- It was trying to treat my repo as a workspace with 6820 projects in it.

So I stashed all of those files onto a separate branch, and now everything is fast again.

I also happened to be cycling past Tottenham Court Road, so I popped into a shop on the off-chance that I could avoid sending even more of my money in the direction of Amazon. They had exactly the screen I was looking for, and even delivered it the same day.
