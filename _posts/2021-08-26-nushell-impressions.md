# Initial impressions of nushell

Recently I've been recording my impressions of technologies as I start using them. This is so that I can remember what my pain points are when I'm onboarding other people later, or contributing to the project.

## Why am I doing this?

I am trying out nushell because I *really* don't like zsh's input system (zle). Readline is *much* better than zle. Zle doesn't have a concept of short vs long words. If you set zle into "bash" word mode, it treats - like whitespace, so typing esc-backspace after `ls -- .` will delete everything (from memory). Nushell uses a rust-based readline clone for its text input, so my muscle memory is intact.

I had a go at teaching zle how to differentiate ^W from esc-backspace, but it's a mix of C and shell horribleness. I suspect that bending nushell to my will will be easier than fixing zsh.

I also tried `fish` a while back. The thing that forced me back to bash was the lack of `!!`/`!$` support, I think. nushell also doesn't have these things, but they haven't explicitly ruled out supporting it, and maybe I could submit it as a patch.

I also really love apache arrow, and running a shell with polars/arrow dataframes built in makes me really excited.

## History

The history recording seems completely broken. I was trying to look at the history of what I've done, and ended up with a bunch or repeated sequences with entries like this:

```
 201 │ n
 202 │ false
 203 │ ckout main
```

I wonder if it's similar to the problem that bash had, where multiple shell processes confuse each other when they close. I quite like what apple did with per-session history files in a directory, and a cleanup job to consolidate them (this was also used to recover sessions with separate scrollback and history after a restart)

### Table rendering

As I was pasting that, I noticed that it was padded with trailing whitespace. This means that when you resize your terminal, it will cause all sorts of problems.

## Unix command compatibility

I get the impression that nushell is that it wants to be a data processing language like R, but doesn't *really* care about being a capable unix shell.

### Piping things into unix commands

In bash, `echo` automatically separates argument words with spaces, and appends a newline at the end. 

Nushell's `echo` turns its arguments into list. Piping a list into a unix command will concatenate the contents without any separators, and won't add a trailing newline.

I've taken to doing this, but it feels very sad:

```
echo 'some/path' | fmt | tee -a .gitignore
```

### Exit codes

By default, nushell ignores the exit code of unix programs, so running `/usr/bin/false` will not tell you that anything is wrong.

This is concerning, because it means that all pipeline failures are going to be ignored. It's the philosophical opposite of `set -euo pipefail` at the top of your bash scripts.

If you set `nonzero_exit_errors = true` in your config, you end up with a slightly-too-verbose error:

```
$ /usr/bin/false
error: External command failed
  ┌─ shell:1:1
  │
1 │ /usr/bin/false
  │ ^^^^^^^^^^^^^^ command failed
```

I've started trying to hack this up in https://github.com/nushell/nushell/pull/3840

### Quoting of semicolons

I wanted to write this:

`git commit -am "do first thing; do second thing"`

but the semicolon got parsed by the shell somehow. My commit message got truncated, and I got `sh:  do second thing: command not found` printed by the shell.

Interestingly, using single quotes avoids this problem, so I suspect that this is a bug. I like to write words like `don't` in my commit messages, so I prefer to use double-quotes for this.


## That's all for now

I will keep editing this post until I have run out of beginner papercuts.
