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
* The joy of working with other people 🤝
    * Hack and Learn
    * `cargo-binstall` adoption
* Free Tiers Don't last forever
    * Bintray -> Github Releases
    * Sematext (ElasticSearch) -> Upstash (Redis)
    * Vercel (TypeScript) -> fly.io (Rust)
    * Redis -> InfluxDB IOx
    * Bash -> Python
<!-- Think about adding quickbuild stuff in here, or in the middle somewhere? -->
