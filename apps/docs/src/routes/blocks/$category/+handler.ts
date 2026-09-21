import { BLOCK_CATEGORIES } from "../../../lib/blocks-list.ts";

export const GET = (
  context: { params: { category: string } },
  next: () => Promise<Response>,
) => {
  if (!BLOCK_CATEGORIES.some(({ slug }) => slug === context.params.category)) {
    return new Response("Block category not found", { status: 404 });
  }
  return next();
};
