# `cargo-quickinstall`

![](https://imgs.xkcd.com/comics/compiling.png)

<b>`cargo install`</b> for the lazy and impatient

David Laban - 12 Nov 2024

---

# Outline

* Origin story
    * `sqlx-cli` cache miss on GitHub Actions
* Original architecture
    * Builder (GitHub Actions)
    * Artifact storage (JFrog Bintray)
    * Client (rust + curl + tar)
    * Stats server
* The joys of working with others
    * Hack and Learn
    * `cargo-binstall` adoption
* Free tiers don't last forever
    * Bintray -> Github Releases
    * Sematext (ElasticSearch) -> Upstash (Redis)
    * Vercel (TypeScript) -> fly.io (Rust)
    * Redis -> InfluxDB IOx
    * Bash -> Python
<!-- Think about adding quickbuild stuff in here, or in the middle somewhere? -->

---
# Origin Story

* GitHub Actions
    * @actions/cache - at the time 5GB limit per repo
    * `sqlx-cli` would take multiple minutes on a cache miss
    * Any change to Cargo.lock busts the cache
    * Cache often gets full and evicts keys for feature branches
* Also useful for local dev

---

# Original Architecture

![](architecture.png)
<!-- happy path diagram; sad path diagram -->

???

* Client (rust + curl + tar)
* Artifact storage (JFrog Bintray)
* Stats server
* Builder (GitHub Actions)

---

# Initial Client

* Installs are basically instant
    * Most installs (80%) will fetch from artifact store <!-- TODO: percent? -->
    * Only falls back to `cargo install` if no binary found
* Tiny implementation
    * Simple wrapper around `curl` and `tar` on all platforms (including Windows)
    * Installs binaries in `~/.cargo/bin` with no bookkeeping
    * `cargo install cargo-quickinstall` took ~1s (has crept up since then) <!-- to 6s -->

---

# Artifact Storage

* JFrog Bintray
    * Package published at `/$crate-$arch-$version/package.tar.gz`
    * Client asks crates.io for `$version` then makes a single curl request to fetch tarball
* Inspired by how we distributed apt packages for a raspberry pi project

---

# Initial Stats Server

* "Why the hell not?" architecture
    * HTTP 404 from Vercel CDN - never blocks
    * Pipe Vercel CDN logs to Elasticsearch
    * Builder queries Elasticsearch
    * Inspired by advertising billing systems

---

# Builder

* GitHub Actions hourly cronjob
    * Reads requested crates from Elasticsearch
    * Triggers builds for anything that is requested + missing, by committing to `trigger/$target` branch
    * Inspired by ArgoCD GitOps workflows from previous client
* GitHub Actions builder
    * Untrusted runner for building crate and stashing tarball as build artifact
    * Trusted runner for fetching tarball and uploading it to artifact storage
* Bash! Bash everywhere!

---

# The Joys of Working with Others

* Rust London Hack and Learn
    * Tiny codebase perfect for beginners
        * Lots of pair programming and live coding
    * GitHub releases idea came from Hack and Learn (see later)
* `cargo-binstall`
    * `binstall` uses quickinstall repo as installation source
    * Reports stats about installs/failures
    * Call for maintainers
        * Transferred repo to the `cargo-bins` GitHub org
    * Restructured archive to make binstall more efficient
    * Signed artifacts (mostly security theatre if we're honest)

---

# Free Tiers Don't Last Forever

* Bintray -> GitHub Releases
* Elasticsearch (Sematext) -> Redis (Upstash)
* The Big Switch
    * Vercel (TypeScript) -> fly.io (Rust)
    * Redis -> InfluxDB IOx
    * Bash -> Python

---

# Bintray -> GitHub Releases

* Bintray announced end of life, but not acted yet
* Went to Hack and Learn to help mentor `cargo-chef` work
* Got talking to `spotify-tui` maintainer and found out about GitHub releases
* Spent the last half hour of the event porting over to GitHub releases
* Client checks both places until Bintray got completely disabled

---

# Elasticsearch (Sematext) -> Redis (Upstash)

* Sematext log sink stopped being free tier
* Created basic Vercel API route that increments keys in Redis
* One key per `(day, crate, target, version)`
* Inspired by rate limiting middlewares

---

# The Big Switch

* `cargo-binstall` stats over-reporting blasted through Vercel free tier rate limits (GB-hours)
* Vercel disabled the project entirely
* Temporarily paid for Vercel Pro
* Build "something else"
* Proxy requests to new server

---

# The Big Switch - Something Else

* What does "something else" look like?
* DB: InfluxDB IOx
    * Built from scratch for high cardinality low volume/free tier stats collection
    * Timeseries DB based on Parquet + Arrow + DataFusion
    * Same wire protocol for reporting stats as before
    * Query using SQL (from Python rather than Bash)
    * Also have Grafana dashboards
* Hosting: fly.io + Rust
    * Docker image with small memory footprint (70MB fits in 256MB Firecracker VM)
    * Doesn't scale to zero, but $2/month is below the $5 minimum that fly.io will bill for
* Cronjob: now queries DB directly

---

# Questions

<!-- 
TODO:
* quickbuild slides?
* open questions:
    * ...
    * external notary

    How long did build take with hit or cache miss, how much of that was sqlx-cli?
    e.g. for local dev - ripgrep/...?

    Picture in original arch slide
 -->
