import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, ExternalLink } from 'lucide-react';
import { Project } from '../../types';
import { projectsApi } from '../../services/api';
import { Seo } from '../../components/common/Seo';

export const PortfolioPage: React.FC = () => {
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectsApi
      .getAll({ limit: 100, status: 'published' })
      .then((res) => {
        setAllProjects(res.data || []);
      })
      .catch(() => {});
  }, []);

  const categories = React.useMemo(() => {
    const list = ['All'];
    const seen = new Set<string>(['All']);
    allProjects.forEach((p) => {
      const cat = p.category?.trim();
      if (cat && !seen.has(cat)) {
        seen.add(cat);
        list.push(cat);
      }
    });
    ['Web Application', 'Coffee Shop & Bakery', 'Fitness Studio & Gym', 'Agency Website', 'E-Commerce', 'SaaS'].forEach(
      (cat) => {
        if (!seen.has(cat)) {
          seen.add(cat);
          list.push(cat);
        }
      },
    );
    return list;
  }, [allProjects]);

  useEffect(() => {
    setLoading(true);
    projectsApi
      .getAll({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery || undefined,
        status: 'published',
        limit: 50,
      })
      .then((res) => {
        setProjects(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCategory, searchQuery]);

  return (
    <div className="pt-32 pb-24">
      <Seo
        title="Web Development Portfolio & Case Studies"
        description="Explore live websites, e-commerce storefronts, and web applications built with speed, accessibility, and clean design."
      />
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
            Portfolio &amp; Case Studies
          </p>
          <h1 className="text-4xl font-bold md:text-5xl text-white">
            Proven Websites with Measurable Outcomes
          </h1>
          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            Take a look behind the scenes of websites built for real businesses that resulted in
            higher booking rates, orders, and local search presence.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-border">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-white shadow-glow'
                    : 'bg-secondary text-muted-foreground hover:text-white border border-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-secondary border border-border rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="py-20 text-center text-muted-foreground animate-pulse">
            Loading portfolio case studies...
          </div>
        ) : projects.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">No projects match your filter criteria.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project._id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-card"
              >
                <div>
                  <div className="overflow-hidden aspect-video bg-secondary relative">
                    <img
                      src={project.featuredImage}
                      alt={project.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                      {project.resultStat}
                    </span>
                  </div>

                  <div className="p-6">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                      {project.category}
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-white group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Client: {project.clientName}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-secondary border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-border/40 mt-4 flex items-center justify-between">
                  <Link
                    to={`/portfolio/${project.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-light"
                  >
                    View Case Study <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-white flex items-center gap-1"
                    >
                      Live Site <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
