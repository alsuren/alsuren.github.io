---
title: CV - David Laban
---

## Tably

### Senior Software Engineer - 10/2021 - 07/2022

Tably is an early stage startup. The core idea is very similar to Google Sheets, but with key insights that allow it to be taken in a different direction.

* Worked in a Full Stack Rust codebase.
* Created our long-tail import pipeline, working closely with a junior engineer (based on Airbyte and some JSONSchema magic - read more at https://tably.com/blog/connecting-people-with-their-data).
* Drove the selection of a frontend web framework (sycamore).
* Worked with CEO on designing direction-setting workshops.
* Mentored junior engineers on sometimes orthogonal projects, and with senior engineers on mentoring junior engineers.

## Red Badger

### Senior Software Engineer - 10/2019 - 10/2021

Red Badger is a software consultancy, deploying product led teams into blue-chip companies.

Things I did at Red Badger:

* Worked on a TransferWise clone for Santander:
  * Refactored ledger logic, to prevent webhook retries from causing data inconsistency (Typescript helped a lot here).
  * Implemented multi-tenant support, and enabled compliance testing ready for launch.
  * Handed over key pieces of technology and ways of working to incoming supplier.
* Wrote an unsuccessful communication and file sharing platform for NHS England:
  * Learned a lot about complexity, stakeholder management, and unrealistic projects.
* Wrote a successful integration for NHS Wales' covid response.
  * Learned a lot about scope reduction, and executing on short timescales with external dependencies.
* Wrote a proof of concept wasmCloud + NATS + Kubernetes installation for a client, and explored its potential:
  * Learned a lot about Developer Experience design, through the lens of Employee Experience design.
* Line Managed two other engineers:
  * Facilitated a career change from Test Lead to Software Engineer
  * Managed skills progression and advocated for promotions (using a "ladder" based framework)

## Conversocial

### Senior Software Engineer - 12/2015 - 07/2019

Conversocial is a SaaS company, providing call-centre software for dealing with queries on social media.

Things I did at Conversocial

* Integrated with Twitter and Facebook APIs for real-time messaging.
* Consumed from the Twitter and Facebook firehoses.
* Debugged MongoDB and RabbitMQ outages at scale.
* Brought the platform (previously delete-nothing) into GDPR compliance.
* Led a team to deal with compliance fallout from the Cambridge Analytica scandal.
* Rewrote core app frontend from knockout to React + Redux + CSSModules.
* Migrated our local development environment from Vagrant to Docker For Mac

## Truphone

### Software Engineer - 09/2012 - 03/2014

Truphone is a "small" mobile network. I worked in their labs team.

* Deployed and maintained the SIP and XMPP servers that support the Truphone app.
* Shared knowledge with others on XMPP and git.
* Applied DevOps reliability/scalability and deployability principles (puppet, monitoring and process supervision).

## Collabora

### Software Engineer - 09/2009 - 09/2011

Collabora is an Open Source Software Consultancy which maintains many core pieces of technology for Desktop Linux.

* Developed and maintained APIs and protocol implementations for the Telepathy VoIP/IM framework.
* Developed XMPP<->SIP bridge, and debugged GStreamer<->SIP Phone RTP incompatibilities using WireShark
* Wrote asyncronous networking/D-Bus code in C, for resource-constrained Linux systems (Nokia N900)

## Open Source Software Maintainer


### 2009 - Present

Highlights:

* cargo-quickinstall
    * Installer for pre-compiled binary packages.
    * Repo: https://github.com/alsuren/cargo-quickinstall
    * Blog post: https://alsuren.github.io/2022/07/10/cargo-quickinstall.html
    * Automated package builder (using Github Actions Cronjobs to build untrusted code).
    * Feedback loop (via stats server) to make sure we build the packages that people are asking for.
    * Package repository is also used by popular `cargo-binstall` project.
* mijia-homie
    * Set of daemons for enabling Temperature Sensor Data -> Bluetooth -> Raspberry Pi -> MQTT (homie) -> InfluxDB -> Grafana
    * Repo: https://github.com/alsuren/mijia-homie
    * Blog post/presentation: https://alsuren.github.io/2022/02/19/mijia-homie-presentation.html
* hoverkite
    * Embedded rust project, to fly a kite using a gamepad.
    * Repo: https://github.com/hoverkite/hoverkite