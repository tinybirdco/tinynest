'use client';

import { useEffect, useState } from 'react';
import { Markdown } from '@/components/markdown';
import { getMarkdownContent } from '@/lib/markdown';

export default function PagerdutyReadme() {
  const [content, setContent] = useState('');

  useEffect(() => {
    getMarkdownContent('resend').then(setContent);
  }, []);

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <Markdown content={content} />
    </div>
  );
}