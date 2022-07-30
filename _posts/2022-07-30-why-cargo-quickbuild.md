---
title: Why cargo-quickbuild?
---

> Why not use [`sccache`](https://github.com/mozilla/sccache), [`nix`](https://nixos.org), [`bazel`](https://bazel.build) or [`cargo-chef`](https://github.com/lukemathwalker/cargo-chef)?

These tools are all in a similar space, and I will definitely be stealing ideas from all of these projects.

* `sccache` is intended to be a thin wrapper around `rustc`, and is easy to integrate into your workflow. In order to calculate its cache keys, it reads the rust source code. It has the ability to use a shared cache on s3, but it is all a single cache, so you need to trust everyone who has write access to it, and all of the crates that they ever compile. There is also no mechanism (that I know of) for identifying cache misses and farming them off to a background worker, because it is assumes that the user will also have write access to the cache, and will upload the result when they're done. This is okay for teams in a large company like Mozilla, but less good if you are in a team of one, hacking on projects in your spare time.

* `nix` is promising, and its [cache](https://nixos.wiki/wiki/Binary_Cache) architecture is very powerful. It is not very portable though (no native windows support, and getting it set up on macos has traditionally been very painful). Integrating it into a crate with a large dependency tree also requires a lot of boilerplate.

* `bazel` is more portable, but also requires a lot of boilerplate. It is made by Google, and the trust model for its shared cache appears to be similar to that of sccache.

* `cargo-chef` is a docker-specific tool. If you need to build a docker image today, and you're not able to just pre-build your binary outside of docker and COPY it in, I recommend `cargo-chef` (my first Rust London Hack and Learn was spent working on `cargo-chef`, so I might be biassed). Its key innovation is turn your dependency tree into a separate layer that is independent of the rest of your source code. This means that you can skip rebuilding dependencies if you are only making changes to your source code. The downside of this approach is that if you bump any dependencies then the whole layer gets thrown away and built from scratch (this similar to the behaviour that you will find with [GitHub Actions' recommended cache configuration](https://github.com/actions/cache/blob/main/examples.md#user-content-rust---cargo)). Sharing individual docker layers between build servers and developers is also a pain, so your developers will probably not feel the benefit of the massive CI bill that you pay every month.

Rust's tooling excellence owes a lot to the unifying influence of `cargo` for build + docs + testing. Its major shortcoming is long build times. My aim with quickbuild is to meet users where they are, because `cargo` is an excellent place to be. I'm hoping to produce meaningful speed-ups of from-scratch builds, without requiring configuration changes for the user's computer/project.

I also aim to build on shared infrastructure, available to all, so you don't need any involvement from finance or your ops team. I will be making use of free "open source tier" compute resources for building my packages, but they will be available for use by *anyone* to reduce their build times and CI costs, as long as they are happy to share their rust flags, and the list of dependencies from their Cargo.toml.

I have come to the end of my time at [tably](https://tably.com), and I plan to spend August house hunting and working on quickbuild, before looking for my next job. If you would like to become the first sponsor this work, please go to my [GitHub Sponsors page](https://github.com/sponsors/alsuren).