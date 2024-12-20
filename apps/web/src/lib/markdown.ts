export async function getMarkdownContent(filename: string) {
  try {
    const response = await fetch(`/content/${filename}.md`);
    if (!response.ok) {
      throw new Error(`Failed to load markdown content: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading markdown content:', error);
    return '# Error\nFailed to load content.';
  }
}
