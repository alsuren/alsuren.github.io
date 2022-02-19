---
title: Monitoring Temperature (with too many Bluetooth thermometers)
---

![](/images/presentation/title.jpg)

This is the blog post form of a presentation given at Rust London - 27 April 2021.

A video of the talk is available [on youtube](https://www.youtube.com/watch?v=Xus85dOx3ns), and slides are available [in the project's repo](https://alsuren.github.io/mijia-homie/docs/presentation/).

The slides are written in markdown using [remark](https://remarkjs.com/), and this blog is also markdown. Let's see how well this translation job goes.

## Outline

[outline]: #Outline

- [Backstory](Backstory)

- [System Overview](#system-overview)

  - [Rust](#Rust)
  - [MQTT](#MQTT)
  - [Bluetooth when we started](#bluetooth-2020)
  - [Concurrency](#Concurrency)
  - [Bluetooth Developments](#bluetooth-developments)

- [Pretty Graphs](#Results)

- [Closing Remarks](#closing)

- [Links and Questions](#Links)

## Backstory

[backstory]: #Backstory

We started with a few ESP32 dev-boards like this:

![](/images/presentation/inception-yun_hat_04.jpg)

These cost around US$16 each, and don't last more than about a day on battery power.

ESP32 is a super-cheap system on chip with bluetooth and wifi, but dev-boards will always be more expensive than commercial off-the-shelf hardware.

During lockdown, we were setting around the dinner table, and I asked my housemate "Wouldn't it be nice to have a hundred temperature sensors? What could we do with that many sensors?"

So we bought 20 of these, at $3 each, and hooked them up to the internet.

![](/images/presentation/inception-order.png)

<!-- TODO: receipt for the other 80 -->

## System Overview

[system-overview]: #system-overview

This is what we built:

![](/images/presentation/system-overview.embed.svg)

Let's take a look at the decisions we made, how they turned out.

## Rust

[rust]: #Rust

We picked Rust because we were both starting to use Rust for work, so using Rust for a personal project was a good opportunity for learning, for both of us.

Andrew is working on [crosvm](https://chromium.googlesource.com/chromiumos/platform/crosvm/) and [Virt Manager](https://android.googlesource.com/platform/packages/modules/Virtualization/+/refs/heads/master/virtmanager/) for Android.

I was using Rust for the backend of the [FutureNHS](https://github.com/FutureNHS/futurenhs-platform/) project (I have since worked on other Rust projects at Red Badger, and moved on to work at [Tably.com](https://tably.com), with backend and frontend written in Rust).

It was also a good chance to work on something together during lockdown.

I also found a [blog post](https://dev.to/lcsfelix/using-rust-blurz-to-read-from-a-ble-device-gmb) describing how to connect to these sensors with Rust. This gave us the burst of momentum that we needed to start the project, but in the end, we outgrew its initial structure, and made our own project.

## MQTT

[mqtt]: #MQTT

MQTT is the pubsub of choice for low-powered gadgets.

Homie is an auto-discovery convention built on MQTT.

In Rust, the [`rumqttc`](https://crates.io/crates/rumqtt) library is pretty good:

- It works using channels, which is a nice interface.
- Andrew has submitted patches, and they were well received.

## Rust Bluetooth in 2020

[bluetooth-2020]: #bluetooth-2020

The state of Rust Bluetooth in 2020 was a little underwhelming. The options were:

- [`blurz`](https://crates.io/crates/blurz) - "Bluetooth from before there was Tokio"
  - We started with this.
  - Talks to BlueZ over D-Bus, but single-threaded and synchronous.
  - Blocking `device.connect()` calls. 😧
  - Unmaintained (for 2 years).

<!-- prettier-ignore-start -->

- [`btleplug`](https://crates.io/crates/btleplug) - "cross-platform jumble"
  - Theoretically cross platform, but many features not implemented.
  - Linux implementation needed root access.
  - Too many panics for us to use.

<!-- prettier-ignore-end -->

## Aside: Concurrency

[concurrency]: #Concurrency

- The main problem with `blurz` was that it exposed a single-threaded blocking library interface:
  ![](/images/presentation/single-threaded-blocking.embed.svg)

We realised that there was a third approach:

- [`dbus-rs`](https://crates.io/crates/dbus) - aka "roll your own BlueZ wrapper"
  - We could generate a "-sys" crate from D-Bus introspection, using the tools provided by the dbus-rs project.
  - The `dbus-rs` codegen produces syncronous or async interfaces, so you can pick whichever approach you want.

After switching to an async library, we got:

![](/images/presentation/single-threaded-async.embed.svg)

This almost solves the problem, but not quite. In our case, everything lives in a big `Arc<Mutex<GlobalState>>`.

![](/images/presentation/single-threaded-mutex.embed.svg)

The solution is to hold the Mutex for as little time as possible.

![](/images/presentation/single-threaded-mutex-final.embed.svg)

This is much better.

These are the concurrency tools that we use:

- `Arc<Mutex<GlobalState>`

  - Used for all of our state.
  - Easy refactor from `&mut GlobalState`.
  - Fine as long as you know where the lock contention is.
  - Only hold the mutex when you _need_ it, be careful of await points.

- Unbounded Channels

  - Used for all bluetooth events, and all MQTT traffic.
  - Fine if you know they're not going to back up.

- `Stream<Item = Event>`

  - Used as the consumption API of the Channels.
  - Just the async version of Iterator.
  - `map()`, `filter()` and `select_all()` are easy to use.

## Bluetooth Developments

[bluetooth-developments]: #bluetooth-developments

We ended up building on top of our "-sys" Bluetooth library, and created: [`bluez-async`](https://crates.io/crates/bluez-async)

- Linux only
- Typesafe async wrapper around BlueZ D-Bus interface.
- Sent patches upstream to [`dbus-rs`](https://crates.io/crates/dbus) to improve code generation and support for complex types.
- Didn't announce it anywhere, but issues filed (and a PR) by two other users so far.

Andrew has also been contributing to [`btleplug`](https://crates.io/crates/btleplug)

- Ported btleplug to use `bluez-async` on Linux.
- Exposes an async interface everywhere.
- There are a few bugs that need fixing before they make a release though.

## Results

[results]: #Results

We now have graphs like this, with inside and outside readings:

![](/images/presentation/grafana-temperature.png)

and readings from our fridge:

![](/images/presentation/grafana-fridge.png)

and we can plot trends using Pandas and Plotly:

![](/images/presentation/average-temperature-by-day.png)

## Will's setup, with MiFlora sensors

[will]: #will

I gave some to my workmate:

![](/images/presentation/will-system-overview.embed.svg)

so you can tell when Will waters his plants:

![](/images/presentation/will_moisture.png)

and when the dehumidifier kicks in in the cellar:

![](/images/presentation/will_dehumidifier.png)

## CloudBBQ

[cloudbbq]: #CloudBBQ

We also got it working with a meat thermometer (backstory: one of the people who sent us patches was using it with a bbq meat thermometer, so I bought one for Andrew as a joke present):

![](/images/presentation/cloudbbq-system-overview.embed.svg)

so now we have a graph of our roast:

![](/images/presentation/cloudbbq-lamb.png)

## Closing Remarks

[closing]: #closing

<!-- FIXME: diagram for this, to mirror Stu's -->

Separating things into layers (and crates) worked well:

- App (`mijia-homie`) -> Sensor (`mijia`) -> Bluetooth (`bluez-async`) -> D-Bus.
- App (`mijia-homie`) -> Homie (`homie-device`) -> MQTT.
- MQTT -> Homie (`homie-controller`) -> `homie-influx` -> InfluxDB

Deployment

- Everything is supervised by systemd.
- Built with Github Actions and [`cross`](https://crates.io/crates/cross), packaged with [`cargo-deb`](https://crates.io/crates/cargo-deb).
  <!-- , hosted on Bintray. -->
  <!-- except it's not, is it, because bintray is dead? -->
  <!-- cross compiling to ARM is a pain if you need c libs, but cross makes it okay -->
  <!-- cross compiling to ARM v6 even more of is a pain, as Will can testify, but we got there in the end -->
- Test coverage is a bit thin (blame me for this).

One major limitation is that the Raspberry Pi only supports 10 connected BLE devices (10 << 100). The way to get around this problem would be to make the mijia sensors include the temperature and humidity data in their advertising broadcast packets, and then passively listen to them on the raspberry pi. There are a handful of projects that provide flash custom firmware for the mijia sensors, and many of them let you do exactly this. If anyone has done this to their sensors, we would be really interested to hear from you. Adding support for reading sensors in this way would allow us to deploy many more sensors, and would also drastically reduce how many cell batteries we go through in a year.

<!-- Rust is probably not the **best** language for this:

- Bluetooth stack on Linux is quite dynamic in places, due to its C and D-Bus heritage.

- Cross-compiling with `cross` is okay to set up, but iteration is slow.

- We found a [Python project](https://github.com/JsBergbau/MiTemperature2) partway through, with
  similar objectives. -->

## Links

[links]: #Links

- GitHub: [https://github.com/alsuren/mijia-homie (includes this presentation)](https://github.com/alsuren/mijia-homie)

- Inspirational blog post [https://dev.to/lcsfelix/using-rust-blurz-to-read-from-a-ble-device-gmb](https://dev.to/lcsfelix/using-rust-blurz-to-read-from-a-ble-device-gmb)

- Homie spec [https://homieiot.github.io/](https://homieiot.github.io/)

- Homie helper library [https://crates.io/crates/homie-device](https://crates.io/crates/homie-device)

- Bluetooth library [https://crates.io/crates/bluez-async](https://crates.io/crates/bluez-async)

- `btleplug` [https://crates.io/crates/btleplug](https://crates.io/crates/btleplug)
