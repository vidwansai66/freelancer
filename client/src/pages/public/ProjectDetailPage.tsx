import { MarkdownContent } from '../../components/common/MarkdownContent';
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Code2, CheckCircle2, Calendar, Sparkles } from 'lucide-react';
import { Project } from '../../types';
import { projectsApi } from '../../services/api';
import { Seo } from '../../components/common/Seo';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      projectsApi
        .getBySlug(slug)
        .then((data) => setProject(data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-40 pb-24 text-center">
        <p className="text-muted-foreground animate-pulse">Loading case study...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pt-40 pb-24 text-center">
        <Seo title="Project Not Found" noindex={true} />
        <h1 className="text-2xl font-bold text-white">Project Not Found</h1>
        <p className="mt-2 text-muted-foreground">The requested case study does not exist.</p>
        <Link to="/portfolio" className="mt-4 inline-block text-primary hover:underline">
          ← Back to portfolio
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24">
      <Seo
        title={`${project.title} — Case Study`}
        description={`${project.category} case study for ${project.clientName}. ${project.resultStat || 'Engineered by Teja Web Studio.'}`}
        ogImage={project.featuredImage}
      />
      <div className="mx-auto max-w-4xl px-6">
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to All Projects
        </Link>

        {/* Hero Banner */}
        <div className="rounded-3xl border border-border bg-card p-6 md:p-10 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="rounded-full bg-primary/20 text-primary px-3 py-1 text-xs font-semibold uppercase">
              {project.category}
            </span>
            <div className="flex items-center gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-secondary hover:bg-muted border border-border px-4 py-1.5 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                >
                  Visit Live Site <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-secondary hover:bg-muted border border-border px-4 py-1.5 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                >
                  <Code2 className="h-3.5 w-3.5" /> Code Repo
                </a>
              )}
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white">{project.title}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Client: <span className="text-foreground">{project.clientName}</span>
          </p>

          {/* Outcome Metric Callout */}
          {project.resultStat && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-sm font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Key Impact: {project.resultStat}</span>
            </div>
          )}

          {/* Featured Image */}
          <div className="mt-8 rounded-2xl overflow-hidden border border-border aspect-video bg-secondary">
            <img
              src={project.featuredImage}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Tech Stack Chips */}
          <div className="mt-8 pb-6 border-b border-border">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Technologies Deployed
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-secondary border border-border px-3 py-1 text-xs text-foreground font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Case Study Written Content */}
          <div className="mt-8 space-y-6">
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              <MarkdownContent>
                {project.caseStudyMarkdown || 'Comprehensive case study details coming soon.'}
              </MarkdownContent>
            </div>

            {/* Gallery Images */}
            {project.galleryImages && project.galleryImages.length > 0 && (
              <div className="mt-10 pt-8 border-t border-border">
                <h3 className="text-lg font-bold text-white mb-4">Project Gallery</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {project.galleryImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl overflow-hidden border border-border aspect-video bg-secondary"
                    >
                      <img
                        src={imgUrl}
                        alt={`${project.title} gallery ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-12 rounded-2xl border border-primary/30 bg-primary/10 p-8 text-center">
              <h3 className="text-xl font-bold text-white">
                Want similar results for your business?
              </h3>
              <p className="mt-2 text-xs text-muted-foreground">
                We can architect a high-performance website tailored specifically to your niche
                within 7 days.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <Link
                  to="/quote"
                  className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-white shadow-glow"
                >
                  Request a Free Quote
                </Link>
                <Link
                  to="/book"
                  className="rounded-full border border-border bg-card px-6 py-2.5 text-xs font-semibold text-white hover:bg-secondary"
                >
                  Schedule Call
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
