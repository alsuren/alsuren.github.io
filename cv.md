---
title: CV - David Laban
---

## David Laban - [alsuren@gmail.com](mailto:alsuren@gmail.com) - [github.com/alsuren](https://github.com/alsuren) - [alsuren.github.io](https://alsuren.github.com)

### Open Source Software Maintainer - 2009 - Present

* cargo-quickinstall
    * Installer for pre-compiled binary packages (~1k package installs/day).
    * Automated package builder (using Github Actions Cronjobs to build untrusted code).
    * Feedback loop (via stats server) to make sure we build the packages that people are asking for.
    * Package repository is also used by popular `cargo-binstall` project.
    * Many `good first issue` tickets addressed, and a few repeat contributors.
    * Repo: [alsuren/cargo-quickinstall](https://github.com/alsuren/cargo-quickinstall)
    * Blog post: [2022/07/10/cargo-quickinstall](https://alsuren.github.io/2022/07/10/cargo-quickinstall.html)
* mijia-homie
    * Set of Rust daemons for capturing temperature sensor data for plotting.
    * Bluetooth -> Raspberry Pi -> MQTT (homie) -> InfluxDB -> Grafana
    * Repo: [alsuren/mijia-homie](https://github.com/alsuren/mijia-homie)
    * Blog post/presentation: [2022/02/19/mijia-homie-presentation](https://alsuren.github.io/2022/02/19/mijia-homie-presentation.html)
* hoverkite
    * Embedded Rust project to fly a kite using a gamepad and a hoverboard.
    * Repo: [hoverkite/hoverkite](https://github.com/hoverkite/hoverkite)
* SixDoFone
    * Tool to use a mobile phone to control position and rotation (6DoF) of a robot arm.
    * Uses WebXR in the phone's browser and Python + rerun.io on the laptop.
    * Repo: [alsuren/sixdofone](https://github.com/alsuren/sixdofone)


### [Opvia](https://opvia.io) - Senior Software Engineer - 11/2022 - 07/2024

Opvia is a no-code database (like [Notion](https://www.notion.so)) focussed on process data management and training for regulated industries (e.g. food and drink and pharmaceutical manufacturing and research). I joined the company when we were in an 8 person office in a co-working space, and helped it grow to $1M ARR.

* Built the ability to instantly view **any** document/table as it was at **any** point in time, and revert to previous revisions. Massive win when selling into regulated industries.
* Re-architected table queries to make them responsive at 100k rows (fixed multi-minute latency on 5k row tables). Allowed a big pharmaceutical client to use us for their production workflows.
* Championed [DevOps best practices](https://www.oreilly.com/library/view/accelerate/9781457191435/) (incident response procedure, runtime feature flags, shift left on testing, automatic nightly deploys, end-to-end distributed tracing). Gave us the confidence to ship new features at pace and recover quickly, even with a growing customer base.
* Introduced pubsub system for running periodic tasks and expensive operations like PDF export, OCR and Search + RAG indexing without impacting user experience. Kept the capability of branch deploys that scale to zero.
* Re-architected our user-facing python automation system to be more beginner-friendly and easier for us to maintain.
* Stood up the infrastructure for our next generation "Seal" app.
* Added the ability to print and scan labels from the browser, for real-world asset management.
* Buzzwords: GxP, PostgreSQL, Full Stack Typescript, React, GraphQL, Python, Pandas, Github Actions, PubSub, DataDog, GCP, Gemini.



### [Tably](https://tably.com) - Senior Software Engineer - 10/2021 - 07/2022

Tably is an early stage startup. The core idea is very similar to Google Sheets, but with key insights that allow it to be taken in a different direction. Tech stack is full-stack Rust + WebAssembly.

* Created our data import pipeline for multiple different data sources (based on Airbyte).
  * Drove the selection of an ergonomic frontend web framework (Sycamore) and submitted patches to make it suit our needs.
* Improved the ergonomics and safety of our [borsh](https://borsh.io/)+[OT](https://en.wikipedia.org/wiki/Operational_transformation)-based data layer.
* Worked with CEO on designing and running direction-setting workshops.
* Mentored junior engineers on sometimes orthogonal projects, and with senior engineers on mentoring junior engineers.
* Buzzwords: Mentoring, Full Stack Rust, WebAssembly, Operational Transforms, Extract Transform Load, Airbyte, JSONSchema, AWS, Github Actions.

### [Red Badger](https://red-badger.com) - Senior Software Engineer - 10/2019 - 10/2021

Red Badger is a software consultancy, deploying product led teams into blue-chip companies.

* Worked on a TransferWise clone for Santander:
  * Refactored ledger logic, to prevent webhook retries from causing data inconsistency (Typescript helped a lot here).
  * Implemented multi-tenant support, and enabled compliance testing ready for launch.
  * Handed over key pieces of technology and ways of working to incoming supplier.
* Wrote a communication and file sharing platform for NHS England:
  * Mentored junior team members on Rust (sqlx + async-graphql) and Kubernetes.
  * Learned about complexity and stakeholder management.
* Wrote a public facing compensation claim flow for NHS Wales' covid response.
  * Learned about scope reduction, and executing on short timescales with external dependencies.
* Wrote [wasmCloud](https://wasmcloud.dev/) demo for [Cloud Native Compute Foundation conference](https://www.youtube.com/watch?v=krbx09oJ2Q8):
  * Distributed NATS/NGS lattice for automatic failover + Kubernetes for scaling.
  * Multi-Cloud cluster setup across AWS and GCP, using [Pulumi](https://www.pulumi.com/)
  * Learned about Developer Experience design, through the lens of Employee Experience design.
* Line Managed two other engineers:
  * Facilitated a career change from Test Lead to Software Engineer
  * Managed skills progression and advocated for promotions (using a "ladder" based framework)
* Buzzwords: Line Management, Full Stack Typescript, Full Stack Rust, Next.js, WebAssembly, PostgreSQL, NATS, GCP, Azure, Github Actions, Pulumi, Terraform, Kubernetes.

### [Conversocial](https://conversocial.com) - Senior Software Engineer - 12/2015 - 07/2019

Conversocial is a SaaS company, providing call-centre software for dealing with queries on social media.

* Integrated with Twitter and Facebook APIs for real-time messaging.
* Consumed from the Twitter and Facebook firehoses.
* Debugged MongoDB and RabbitMQ outages at scale.
* Brought the platform (previously delete-nothing) into GDPR compliance.
* Led a team to deal with compliance fallout from the Cambridge Analytica scandal.
* Rewrote core app frontend from knockout to React + Redux + CSSModules.
* Migrated our local development environment from Vagrant to Docker For Mac
* Buzzwords: Python, Django, MongoDB, RabbitMQ, GDPR, Webhooks, Twitter, Facebook, Docker.

### [Truphone](https://truphone.com) - Software Engineer - 09/2012 - 03/2014

Truphone is a "small" mobile network. I worked in their labs team.

* Deployed and maintained the SIP and XMPP real-time voice and instant messaging servers to support the Truphone app.
* Shared knowledge with others on XMPP and git.
* Applied DevOps reliability/scalability and deployability principles (puppet, monitoring and process supervision).
* Buzzwords: XMPP, SIP, VoIP, Open Standards, DevOps, Puppet, PubSub.

### [Collabora](https://collabora.com) - Software Engineer - 09/2009 - 09/2011

Collabora is an Open Source Software Consultancy which maintains many core pieces of technology for Desktop Linux.

* Developed and maintained APIs and protocol implementations for the Telepathy VoIP/IM framework.
* Received training from core GStreamer maintainers.
* Developed XMPP to SIP bridge, and debugged GStreamer/SIP Phone incompatibilities using WireShark.
* Wrote asynchronous networking/IPC code in C, for constrained Linux systems (Nokia N900).
* Buzzwords: Desktop Linux, Embedded Linux, VoIP, Python, C, GStreamer, GObject.


## Education

### University of Cambridge - Master of Engineering, Information Engineering - 2005 - 2009

* General foundation in all engineering disciplines.
* Specialised in signal processing, with a masters project in music visualisation.
