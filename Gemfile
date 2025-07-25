source "https://rubygems.org"

gem "jekyll"

group :jekyll_plugins do
  gem "jekyll-timeago"
  gem "jekyll-paginate-v2"
  gem "jekyll-redirect-from"
  gem "jekyll-sitemap"
end

install_if -> { RUBY_PLATFORM =~ %r!mingw|mswin|java! } do
  gem "tzinfo"
  gem "tzinfo-data"
end

gem "wdm", "~> 0.1.1", :install_if => Gem.win_platform?

gem "webrick", "~> 1.8"
