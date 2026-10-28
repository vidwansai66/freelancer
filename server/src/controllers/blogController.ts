import { Request, Response } from 'express';
import { contentStore } from '../services/contentStore';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { slugify } from '../utils/slugify';

export const getPublishedPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tag, search, page = '1', limit = '9' } = req.query;

    const result = contentStore.getBlogPosts({
      tag: tag ? String(tag) : undefined,
      search: search ? String(search) : undefined,
      page: Math.max(1, parseInt(String(page), 10)),
      limit: Math.max(1, parseInt(String(limit), 10)),
    });

    sendSuccess(res, result.data, 'Blog posts retrieved successfully.', 200, {
      page: result.page,
      limit: parseInt(String(limit), 10),
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getPostBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const post = contentStore.getBlogPostBySlug(slug);
    if (!post) {
      sendError(res, 'Article not found.', 404);
      return;
    }
    sendSuccess(res, post, 'Article retrieved successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const getAllPostsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = contentStore.getBlogPosts({
      page: Math.max(1, parseInt(String(req.query.page || '1'), 10)),
      limit: Math.max(1, parseInt(String(req.query.limit || '50'), 10)),
    });
    sendSuccess(res, result.data, 'All articles retrieved successfully.', 200, {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const createBlogPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      slug,
      summary,
      content,
      coverImage,
      author,
      tags,
      readTimeMinutes,
      isPublished,
    } = req.body;

    if (!title || !summary || !content) {
      sendError(res, 'Title, summary, and content are required.', 400);
      return;
    }

    const finalSlug = slug ? slugify(slug) : slugify(title);

    const post = contentStore.addBlogPost({
      title,
      slug: finalSlug,
      summary,
      content,
      coverImage: coverImage || '',
      author: author || 'Teja Web Studio',
      tags: Array.isArray(tags) ? tags : [],
      readTimeMinutes: Number(readTimeMinutes) || 5,
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    });

    sendSuccess(res, post, 'Article created successfully.', 201);
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const updateBlogPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.title && !updateData.slug) {
      updateData.slug = slugify(updateData.title);
    }

    const post = contentStore.updateBlogPost(id, updateData);
    if (!post) {
      sendError(res, 'Article not found.', 404);
      return;
    }

    sendSuccess(res, post, 'Article updated successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};

export const deleteBlogPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = contentStore.deleteBlogPost(id);
    if (!deleted) {
      sendError(res, 'Article not found.', 404);
      return;
    }

    sendSuccess(res, { id }, 'Article deleted successfully.');
  } catch (err: any) {
    sendError(res, err.message, 500);
  }
};
