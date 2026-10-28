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

    if (!title || !category || !clientName || !featuredImage) {
      sendError(res, 'Title, category, client name, and featured image are required.', 400);
      return;
    }

    const finalSlug = slug ? slugify(slug) : slugify(title);
    const existing = contentStore.getProjectBySlug(finalSlug);
    if (existing) {
      sendError(res, `A project with slug "${finalSlug}" already exists.`, 409);
      return;
    }

    const project = contentStore.addProject({
      title,
      slug: finalSlug,
      category,
      clientName,
      resultStat: resultStat || '',
      featuredImage,
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
      liveUrl: liveUrl || '',
      githubUrl: githubUrl || '',
      technologies: Array.isArray(technologies) ? technologies : [],
      caseStudyMarkdown: caseStudyMarkdown || '',
      isFeatured: Boolean(isFeatured),
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
