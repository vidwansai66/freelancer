import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Search, ArrowRight, Tag } from 'lucide-react';
import { BlogPost } from '../../types';
import { blogApi } from '../../services/api';
import { Seo } from '../../components/common/Seo';

export const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    blogApi
      .getPublished({ search: search || undefined, tag: selectedTag || undefined })
      .then((res) => setPosts(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [search, selectedTag]);

  return (
    <div className="pt-32 pb-24">
      <Seo
        title="Web Design & Growth Articles"
        description="Practical web design, development, and conversion optimization strategies for small business owners and startups."
      />
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
            Insights &amp; Strategy
          </p>
          <h1 className="text-4xl font-bold md:text-5xl text-white">
            Articles &amp; Practical Web Advice
          </h1>
          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            Tips on speed optimization, mobile conversions, Core Web Vitals, and how to get real
            clients from your website.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-border">
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-secondary border border-border rounded-full pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
            />
          </div>

          {selectedTag && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Filtered by tag:</span>
              <span className="rounded-full bg-primary/20 text-primary px-3 py-1 font-semibold">
                {selectedTag}
              </span>
              <button
                onClick={() => setSelectedTag('')}
                className="text-xs text-muted-foreground hover:text-white underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">
            Loading articles...
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center text-xs text-muted-foreground">
            No articles found matching your query.
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post._id}
                to={`/blog/${post.slug}`}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-card transition-all duration-300"
              >
                <div>
                  {post.coverImage && (
                    <div className="aspect-video overflow-hidden bg-secondary">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{post.readTimeMinutes} min read</span>
                      <span>•</span>
                      <span>
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString()
                          : 'Recent'}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-white group-hover:text-primary transition-colors leading-snug">
                      {post.title}
                    </h2>

                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {post.summary}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {post.tags.map((t, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-border/40 mt-4 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Read Article</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
