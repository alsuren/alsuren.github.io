# Docker Yaks

I have given myself a target of not installing Docker Desktop on this laptop since I did the reinstall.

I also don't want to install VirtualBox, because it feels like a dead end. For some reason, `brew install --cask vagrant` wants root access (maybe its' just because they decided to dump files in /opt/vagrant? Maybe it bundles VirtualBox? At any rate, I decided against installing it)

Qemu is capable of installing without root, because it uses the MacOS Hypervisor.Framework. It is also what the Android AVD emulation system uses under the hood, last time I checked.

What can I install with qemu and no vagrant?

My first thought was to try packer, but all of the public packer templates that mention qemu are significantly out of date, and don't build.

I started looking around for qcow2 images, and searching for "qcow2 debian" finds some images for use with OpenStack at https://cdimage.debian.org/cdimage/openstack/current/. I don't have any of the openstack tools installed on my mac, but maybe I can still use the images?

Fedora has a `cloud` spin, and also `coreos`. I downloaded both. CoreOS from https://getfedora.org/en/coreos/download?tab=metal_virtualized&stream=stable

The coreos installation requires virt-install, which requires python gobject-introspection bindings, which don't seem easy to install.

Following https://docs.fedoraproject.org/en-US/fedora-coreos/producing-ign/ to produce an ignition file, and then using the virt-install command on https://docs.fedoraproject.org/en-US/fedora-coreos/getting-started/ to guess what the underlying qemu command might look like, we get:

```
qemu-system-x86_64  -nographic /Users/alsuren/Downloads/fedora-coreos-34.20210725.3.0-qemu.x86_64.qcow2 -fw_cfg name=opt/com.coreos/config,file=coreos/docker-host.ign
```

which gets quite a long way, and then says:
```
[    1.680861] Trying to unpack rootfs image as initramfs...
[    1.681558] Initramfs unpacking failed: invalid magic at start of compressed archive
```

(`killall qemu-system-x86_64` is the only way to escape from this, and it puts the shell into a strange state, so readline editing of long commands stop working, so be ready to throw away a lot of shells)

They do have a page on using qemu directly: https://docs.fedoraproject.org/en-US/fedora-coreos/provisioning-qemu/

Adapting their example to our filenames, we get:
```
qemu-system-x86_64 -m 2048 -nographic -snapshot \
	-drive if=virtio,file=/Users/alsuren/Downloads/fedora-coreos-34.20210725.3.0-qemu.x86_64.qcow2 \
	-fw_cfg name=opt/com.coreos/config,file=coreos/docker-host.ign \
	-nic user,model=virtio,hostfwd=tcp::2222-:22
```

After about 200 seconds, you end up with a box that you can ssh into, like this:
```
ssh core@localhost -p 2222
```

... but can I use it for doing docker-fwd things?
```
SSH='ssh core@localhost -p 2222'
$SSH mkdir -p ./$PWD
$SSH git init ./$PWD
git remote add docker-fwd --fetch ssh://core@localhost:2222/var/home/core/$PWD

git push docker-fwd HEAD:incoming
$SSH "cd ./$PWD && git reset --hard incoming"
```
🎉

And then you can open vscode remote over ssh and keep hacking.
