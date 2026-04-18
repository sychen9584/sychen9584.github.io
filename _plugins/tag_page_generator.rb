module Jekyll
  class TagPageGenerator < Generator
    safe true

    def generate(site)
      site.tags.each do |tag, posts|
        site.pages << TagPage.new(site, site.source, tag, posts)
      end
    end
  end

  class TagPage < Page
    def initialize(site, base, tag, posts)
      @site  = site
      @base  = base
      @dir   = File.join("tags", Jekyll::Utils.slugify(tag))
      @name  = "index.html"

      process(@name)
      read_yaml(File.join(base, "_layouts"), "tag.html")
      data["tag"]    = tag
      data["title"]  = "Posts tagged: #{tag}"
      data["posts"]  = posts.sort_by { |p| p.date }.reverse
    end
  end
end
