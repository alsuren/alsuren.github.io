---
title: "Local-First Notes #1: Riffle"
date: 2025-05-17
---

As I'm warming up for [Local First Conference](https://www.localfirstconf.com/) and reading literature, I thought I would write up my notes/thoughts. Here are my thoughts from reading [Riffle's Prelude essay](https://riffle.systems/essays/prelude/)

# Short-circuiting query re-runs on the block level

For reactive queries, could we:

* submit initial query to query engine
* receive and store:
  * results
  * merkle tree of index-related pages that have been read to satisfy the query
  * merkle tree of data-related pages that have been read to satisfy the query

When an update comes in:

* re-run query, passing in merkle trees
* if none of the pages have changed, return 304 Not Modified
* if index pages have changed, re-run up to the point where you know which data pages you will read. If none of these have changed, return 304 Not Modified

This means that if you have a massive song list and you're looking at the top page, a change to a song in the bottom page won't cause your UI to re-render.

I have no idea whether this kind of low-level control of SQLite is even possible, or whether it is possible to split its pages into index and data at the VFS layer (or whether it even makes VFS read calls if it's already got the page in its cache).

I'd be interested in hearing thoughts from others who have experience with SQLite internals or similar reactive query optimizations with sqlite. Reach out on [bluesky](https://bsky.app/profile/alsuren.bsky.social), [mastodon](https://mastodon.me.uk/@alsuren), or discord.

# Nested results

> Standard SQL doesn’t support nesting, even in the projection step (i.e., what describes the shape of the results). We’re big fans of data normalization, but it’s very convenient to nest data when producing outputs.
>
> There are various extensions to SQL that support nesting, but many of them are not that good and the good ones are not widely available.

I am reminded of postgraphile's query builder, which generates a bunch of nested json_agg() calls and `with` statements like this:

```sql
with __local_0__ as (select "user"."name", "user"."age", "user"."height" from "user" where created_at > NOW() - interval '3 years' and age > $1)
select
  (select json_agg(row_to_json(__local_0__)) from __local_0__) as all_data,
  (select max(age) from __local_0__) as max_age
```
(example from [pg-sql2](https://github.com/graphile/crystal/tree/main/utils/pg-sql2) but many of the postgraphile queries take a similar form).

I wonder if this approach would be valuable in a reactive sqlite browser datastore.
