# `cargo-quickinstall`

![](https://imgs.xkcd.com/comics/compiling.png)

<b>`cargo install`</b> for the lazy and impatient

David Laban - 12 Nov 2024

---

# Outline

* Origin Story
    * `sqlx-cli` cache miss on GitHub Actions
* Original Architecture
    * Builder (GitHub Actions)
    * Artifact Storage (JFrog Bintray)
    * Client (rust + curl + tar)
    * Stats Server
* The joys of working with others
    * Hack and Learn
    * `cargo-binstall` adoption
* Free Tiers don't last forever
    * Bintray -> Github Releases
    * Sematext (ElasticSearch) -> Upstash (Redis)
    * Vercel (TypeScript) -> fly.io (Rust)
    * Redis -> InfluxDB IOx
    * Bash -> Python
<!-- Think about adding quickbuild stuff in here, or in the middle somewhere? -->

---
# Origin Story

* Github actions
    * @actions/cache - at the time 5GB limit per repo
    * `sqlx-cli` would take multiple minutes on a cache miss
    * any change to Cargo.lock busts the cache
    * cache often gets full and evicts keys for feature branches
* also useful for local dev

---

# Original Architecture


![](architecture.png)
<!-- happy path diagram; sad path diagram -->

???

* Client (rust + curl + tar)
* Artifact Storage (JFrog Bintray)
* Stats Server
* Builder (GitHub Actions)

---

# Initial Client

* installs are basically instant
    * most installs (80%) will fetch from Artifact Store <!-- TODO: percent? -->
    * only falls back to `cargo install` if no binary found
* tiny implementation
    * simple wrapper around `curl` and `tar` on all platforms (including windows)
    * installs binaries in `~/.cargo/bin` with no bookkeeping
    * `cargo install cargo-quickinstall` took ~1s (has crept up since then) <!-- to 6s -->


---

# Artifact Storage

* JFrog Bintray
    * package published at `/$crate-$arch-$version/package.tar.gz`
    * client asks crates.io for `$version` then makes a single curl request to fetch tarball
* inspired by how we distributed apt packages for a raspberry pi project

---

# Initial Stats Server

* "Why the hell not?" Architecture
    * http 404 from vercel CDN - never blocks
    * pipe vercel cdn logs to elasticsearch
    * builder queries elasticsearch
    * inspired by advertising billing systems

---

# Builder

* Github Actions hourly cronjob
    * reads requested crates from elasticsearch
    * triggers builds for anything that is requested + missing, by committing to `trigger/$target` branch
    * inspired by ArgoCD GitOps workflows from previous client
* Github Actions builder
    * untrusted runner for building crate and stashing tarball as build artifact
    * trusted runner for fetching tarball and uploading it to Artifact Storage
* Bash! Bash Everywhere!

---

# The joys of working with others

* Rust London Hack and Learn
    * tiny codebase perfect for beginners
        * lots of pair programming and live coding
    * github releases idea came from hack and learn (see later)
* `cargo-binstall`
    * `binstall` uses quickinstall repo as installation source
    * reports stats about installs/failures
    * call for maintainers
        * transferred repo to the `cargo-bins` github org
    * restructured archive to make binstall more efficient
    * signed artifacts (mostly security theatre if we're honest)


---

# Free Tiers Don't last forever
    * Bintray -> Github Releases
    * ElasticSearch (Sematext) -> Redis (Upstash)
    * The Big Switch
        * Vercel (TypeScript) -> fly.io (Rust)
        * Redis -> InfluxDB IOx
        * Bash -> Python

---

# Bintray -> Github Releases

* Bintray announced end of life, but not acted yet
* Went to hack and learn to help mentor `cargo-chef` work
* Got talking to `spotify-tui` maintainer and found out about github releases
* Spent the last half hour of the event porting over to github releases
* Client checks both places until bintray got completely disabled


---

# ElasticSearch (Sematext) -> Redis (Upstash)

* Sematext log sink stopped being free tier
* Created basic vercel api route that increments keys in redis
* One key per `(day, crate, target, version)`
* Inspired by rate limiting middlewares


---

# The Big Switch

* cargo-binstall stats over-reporting blasted through vercel free tier rate limits (GB-hours)
* vercel disabled the project entirely
* temporarily paid for vercel pro
* build "something else"
* proxy requests to new server

---

# The Big Switch - something else

* What does "something else" look like?
* DB: InfluxDB IOx
    * built from scratch for high cardinality low volume/free tier stats collection
    * timeseries db based on parquet + arrow + datafusion
    * same wire protocol for reporting stats as before
    * query using sql (from python rather than bash)
    * also have grafana dashboards
* Hosting: fly.io + rust
    * docker image with small memory footprint (70MB fits in 256MB firecracker vm)
    * doesn't scale to zero, but $2/month is below the $5 minimum that fly.io will bill for
* Cronjob: now queries DB directly

---

# Questions

<!-- 
TODO:
* quickbuild slides?
* open questions:
    * ...
    * external notary


    how long did build take with hit or cache miss, how much of that was sqlx-cli?
    e.g. for local dev - ripgrep/...?

    picture in original arch slide
 -->
