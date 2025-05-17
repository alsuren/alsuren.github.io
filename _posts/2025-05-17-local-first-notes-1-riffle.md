---
title: "Local-First Notes #1: Riffle"
date: 2025-05-17
---

As I'm warming up for [https://www.localfirstconf.com/](https://www.localfirstconf.com/) and reading literature, I thought I would write up my notes/thoughts. Here are my thoughts from reading [https://riffle.systems/essays/prelude/](https://riffle.systems/essays/prelude/)

For reactive queries, could we:

* submit initial query to query engine
* receive and store:
  * results
  * merkle tree of index-related pages that have been read to satisfy the query
  * merkle tree of data-related pages that have been read to satisfy the query

When an update comaes in:

* re-run query, passing in merkle trees
* if none of the pages have changed, return 304 Not Modified
* if index pages have changed, re-run up to the point where you know which data pages you will read. If none of these have changed, return 304 Not Modified

This means that if you have a massive song list and you're looking at the top page, a change to a song in the bottom page won't cause your UI to re-render.

I have no idea whether this kind of low-level control of sqlite is even possible, or whether it is possible to split its pages into index and data at the VFS layer (or whether it even makes VFS read calls if it's already got the page in its cache).
