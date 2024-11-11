.PHONY: serve
serve:
	# FIXME: work out where bundle installs its packages so that we can cache it somehow.
	docker run \
	    --rm \
		-p 4000:4000 \
		-p 35729:35729 \
	    -v $(PWD):/site \
		-v jekylbundle:/usr/local/bundle/ \
		-w /site ruby:latest \
		bash -c 'bundle install && bundle exec jekyll serve --host 0.0.0.0 --livereload'
