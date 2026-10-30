import { Request, Response } from 'express';
import { contentStore } from '../services/contentStore';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { slugify } from '../utils/slugify';

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, page = '1', limit = '12' } = req.query;

    const result = contentStore.getProjects({
      category: category && category !== 'All' ? String(category) : undefined,
      search: search ? String(search) : undefined,
      page: Math.max(1, parseInt(String(page), 10)),
      limit: Math.max(1, parseInt(String(limit), 10)),
    });

    sendSuccess(res, result.data, 'Projects retrieved successfully.', 200, {
      page: result.page,
      limit: parseInt(String(limit), 10),
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getProjectBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const project = contentStore.getProjectBySlug(slug);
    if (!project) {
      sendError(res, 'Project not found.', 404);
      return;
    }
    sendSuccess(res, project, 'Project retrieved successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      slug,
      category,
      clientName,
      resultStat,
      featuredImage,
      galleryImages,
      liveUrl,
      githubUrl,
      technologies,
      caseStudyMarkdown,
      isFeatured,
      orderIndex,
    } = req.body;

    const effectiveTitle = title?.trim();
    if (!effectiveTitle) {
      sendError(res, 'Project title is required.', 400);
      return;
    }

    const effectiveCategory = category?.trim() || 'Web Application';
    const effectiveClient = clientName?.trim() || effectiveTitle;
    const effectiveImage =
      featuredImage?.trim() ||
      galleryImages?.[0] ||
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80';

    const finalSlug = slug ? slugify(slug) : slugify(effectiveTitle);
    const existing = contentStore.getProjectBySlug(finalSlug);
    if (existing) {
      sendError(res, `A project with slug "${finalSlug}" already exists.`, 409);
      return;
    }

    const project = contentStore.addProject({
      title: effectiveTitle,
      slug: finalSlug,
      category: effectiveCategory,
      clientName: effectiveClient,
      resultStat: resultStat?.trim() || '',
      featuredImage: effectiveImage,
      galleryImages: Array.isArray(galleryImages) && galleryImages.length > 0 ? galleryImages : [effectiveImage],
      liveUrl: liveUrl?.trim() || '',
      githubUrl: githubUrl?.trim() || '',
      technologies: Array.isArray(technologies) && technologies.length > 0 ? technologies : ['Web Studio', 'React'],
      caseStudyMarkdown: caseStudyMarkdown?.trim() || `### ${effectiveTitle}\n\nCase study details for ${effectiveTitle}.`,
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : true,
      orderIndex: Number(orderIndex) || 0,
    });

    sendSuccess(res, project, 'Project created successfully.', 201);
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.title && !updateData.slug) {
      updateData.slug = slugify(updateData.title);
    } else if (updateData.slug) {
      updateData.slug = slugify(updateData.slug);
    }

    const project = contentStore.updateProject(id, updateData);
    if (!project) {
      sendError(res, 'Project not found.', 404);
      return;
    }

    sendSuccess(res, project, 'Project updated successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = contentStore.deleteProject(id);
    if (!deleted) {
      sendError(res, 'Project not found.', 404);
      return;
    }

    sendSuccess(res, { id }, 'Project deleted successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
