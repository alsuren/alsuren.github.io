---
title: alsuren.github.io
---

# Latest Posts

{% for post in site.posts %}

## [{{ post.title }}]({{ post.url }})
{{ post.excerpt }}

{% endfor %}

I've recently gone from a 5 day week to a 4 day week, so that I can make more contributions to open source software/communities. My "project day" is Wednesday. I thought it would be interesting to record what I get up to each week. At the moment I don't have much velocity, because I've also got a lot of life stuff to sort out. If I don't get bored of this, I might turn it into an actual blog. For now, it will be an append-mostly log.

## 2019-05-08 - Slow start

You know how sometimes when you're given an opportunity to relax a bit, everything falls apart and you end up crawling back into bed? This was one of those days. I ended up watching some of [Jon Gjengset's stream](https://www.youtube.com/channel/UC_iD0xppBwwsrM9DegC5cQQ) but that's about as close I got to doing anything productive.

## 2019-05-15 - cargo_edit examples.

There are a bunch of issues filed against cargo-edit around it scrambling the input formatting:
https://github.com/killercup/cargo-edit/issues/218 https://github.com/killercup/cargo-edit/issues/217 https://github.com/killercup/cargo-edit/issues/15

I wrote a script to download all of the Cargo.toml files I could find, to see how bad the problem is. It's beautiful (or something).

```
for path in ~/src/crates.io-index/[a-z]*
do
    prefix=$(basename $path)
    if [[ ! -f $prefix.out ]]
    then
        echo $prefix
        (
            for dir in $path/*
            do
                cd $dir && ls
            done
        ) | xargs cargo info --repository >> $prefix.out
    fi
done
```

```
cat  *.out | grep https://github.com/ \
    | (
        while read repo;
        do
            read crate ; read ; read repo ;
            shortrepo=$(
                echo $repo | sed -e s/^.*github.com.// -e 's/.git$//'
            );
            mkdir -p github/$shortrepo ;

            if [[ ! -f github/$shortrepo/Cargo.toml ]] ;
            then
                url="https://raw.githubusercontent.com/$shortrepo/master/Cargo.toml"
                echo $url ;
                wget $url --output-document=github/$shortrepo/Cargo.toml || true
            fi;

        done
    )
```

As you can see, it ended up being a two-part pipeline `~/src/crates.io-index/` is the crates.io-index git repo, and in practice I ended up partitioning `[a-z]*` into multiple ranges to make things go faster.

If you're interested, the downladed files live at https://github.com/alsuren/cargo-edit/commits/science.

In the process, I worked out that `cargo info` doesn't do any kind of connection re-use if you're asking about multiple crates at a time, so I submitted https://gitlab.com/imp/cargo-info/merge_requests/7.

## 2019-05-22 - Got a desk frame;

I started to do some analysis of the examples I found the previous week.
Of the 6408 Cargo.toml examples that I downloaded from github (and ran `cargo add --manifest-path=$f  boringssl@0.0.5`) against:

* 4808 just added a single line with the dependency
* 524 also fixed the newlines at the end of the file
* 851 also added a `[dependencies]` section (because there was none previously)
* 226 do a bunch of reordering of sections

(I may need to re-do this analysis, because I used --ignore-space-change for some things, to get around the `\no newline at end of file` changes).

I also spent a little time switching from rls to rust-analyser. It seemed okay, but it was using a lot of CPU (an entire core in Kernel space for a large number of minutes, and then an entire core in userspace whenever I had a rust file open in my editor). I started working with dtrace to find out what it was doing, and the flamegraph said it was setting up file watchers for the first period, and running the chalk solver in the second period.

I also got a desk frame for the space room, and mostly assembled it, but we cut the top for it over the long weekend in my dad's shed.

## 2019-05-29 - Got a screen

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


## 2019-06-02 (Sunday) - Found https://github.com/rust-lang/rust-repos

All of my previous analysis was on repos that got as far as being published on crates.io. This excludes repos from beginner rust users and repos that aren't libraries. After downloading all of the configs pointed to by that repo, and re-running the analysis, I added a comment to https://github.com/killercup/cargo-edit/issues/218 with my findings.
