---
title: cargo_edit examples
---

There are a bunch of issues filed against cargo-edit around it scrambling the input formatting:
https://github.com/killercup/cargo-edit/issues/218 https://github.com/killercup/cargo-edit/issues/217 https://github.com/killercup/cargo-edit/issues/15

I wrote a script to download all of the Cargo.toml files I could find, to see how bad the problem is. It's beautiful (or something).

```
for path in ~/src/crates.io-index/[a-z]*
do
    prefix=$(basename $path)
    if [[ ! -f $prefix.out ]]
    then
        echo $prefix
        (
            for dir in $path/*
            do
                cd $dir && ls
            done
        ) | xargs cargo info --repository >> $prefix.out
    fi
done
```

```
cat  *.out | grep https://github.com/ \
    | (
        while read repo;
        do
            read crate ; read ; read repo ;
            shortrepo=$(
                echo $repo | sed -e s/^.*github.com.// -e 's/.git$//'
            );
            mkdir -p github/$shortrepo ;

            if [[ ! -f github/$shortrepo/Cargo.toml ]] ;
            then
                url="https://raw.githubusercontent.com/$shortrepo/master/Cargo.toml"
                echo $url ;
                wget $url --output-document=github/$shortrepo/Cargo.toml || true
            fi;

        done
    )
```

As you can see, it ended up being a two-part pipeline `~/src/crates.io-index/` is the crates.io-index git repo, and in practice I ended up partitioning `[a-z]*` into multiple ranges to make things go faster.

If you're interested, the downladed files live at https://github.com/alsuren/cargo-edit/commits/science.

In the process, I worked out that `cargo info` doesn't do any kind of connection re-use if you're asking about multiple crates at a time, so I submitted https://gitlab.com/imp/cargo-info/merge_requests/7.
