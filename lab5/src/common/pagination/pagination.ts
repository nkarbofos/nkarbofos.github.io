export function buildPaginationLinks(args: {
  baseUrl: string;
  page: number;
  pageSize: number;
  hasNext: boolean;
}): string {
  const { baseUrl, page, pageSize, hasNext } = args;

  const links: string[] = [];
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = hasNext ? page + 1 : null;

  if (prevPage) {
    links.push(
      `<${baseUrl}?page=${prevPage}&pageSize=${pageSize}>; rel="prev"`,
    );
  }
  if (nextPage) {
    links.push(
      `<${baseUrl}?page=${nextPage}&pageSize=${pageSize}>; rel="next"`,
    );
  }
  return links.join(', ');
}
