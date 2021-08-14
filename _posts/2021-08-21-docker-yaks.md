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

Dump this in ~/.ssh/config:
```
Host localhost
  User core
  HostName localhost
  Port 2222
```

```
ssh localhost mkdir -p ./$PWD
ssh localhost git init ./$PWD
git remote add docker-fwd --fetch localhost:./$PWD

git push docker-fwd HEAD:incoming
ssh localhost "cd ./$PWD && git reset --hard incoming"

git commit
git push docker-fwd HEAD:incoming
ssh localhost "cd ./$PWD && git merge --ff-only incoming"
```
🎉

And then you can open vscode remote over ssh and keep hacking.

<!-- in practice, vscode prompts you to add an entry to ~/.ssh/config, which makes the above a bit simpler -->

Running docker is hella-slow though.

```
docker run --rm \
  --volume="$PWD:/srv/jekyll" \
  -it jekyll/jekyll:latest \
  jekyll build
```

- [ ] work out how to specify groups in the butane configs

Once you've added yourself to the docker group
takes half an age, and then gives:

```
/usr/local/lib/ruby/2.7.0/fileutils.rb:250:in `mkdir': Permission denied @ dir_s_mkdir - /srv/jekyll/.jekyll-cache (Errno::EACCES)
```

It seems that I'm going to be fighting against half a decade of sloppy docker permissions

### Saturday

persistent filesystem:

```
qemu-img create -f qcow2 -b /Users/alsuren/Downloads/fedora-coreos-34.20210725.3.0-qemu.x86_64.qcow2
```
```
qemu-system-x86_64 -m $((1024*8)) -nographic \
    -drive if=virtio,file=my-fcos-vm.qcow2 \
    -fw_cfg name=opt/com.coreos/config,file=$HOME/src/docker-fwd/coreos/docker-host.ign \
    -nic user,model=virtio,hostfwd=tcp::2222-:22
```

For some reason, vscode doesn't like to connect to this today. I will try a distribution that I understand and come back to it.


Let's try this first: https://fabianlee.org/2020/03/14/kvm-testing-cloud-init-locally-using-kvm-for-a-centos-cloud-image/

... okay, maybe https://sumit-ghosh.com/articles/create-vm-using-libvirt-cloud-images-cloud-init/

```
genisoimage -output cidata.iso -V cidata -r -J user-data meta-data
```
becomes (according to https://apple.stackexchange.com/questions/121491/equivalents-for-genisoimage-and-qemu-img-on-ubuntu)
```
brew install cdrtools
mkisofs -output cidata.iso -V cidata -r -J user-data meta-data
```

```
qemu-img create -f qcow2 -b  ~/Downloads/debian-10-openstack-amd64.qcow2 debian-10-openstack-amd64.qcow2 30G
```
```
qemu-system-x86_64 -m $((1024*8)) -nographic \
    -drive if=virtio,file=debian-10-openstack-amd64.qcow2 \
	-cdrom cidata.iso \
    -nic user,model=virtio,hostfwd=tcp::2222-:22
```


Each time you nuke the image, you need to run this to clear out the `[localhost]` entry in known_hosts, like this:
```
sed -i '' -n  '/^[^[]/p' ~/.ssh/known_hosts
```

VSCode ssh seems a bit fucked. It starts up fine and then errors out a few seconds after opening a folder.

The green-and-blue debian prompt makes feel more powerful than the coreos monochrome one. Funny how our minds work.

### Back to docker again

I ended up adding this to my ssh config (dof being shorthand for docker-fwd):
```
Host dof
  HostName localhost
  Port 2222
```
I now have a vm that's capable of running docker images, so now I can start debugging my theme.
