import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import rehypeRaw from 'rehype-raw';

export const MarkdownRenderer: React.FC<{ content?: string }> = ({ content }) => (
    <div className='prose'>
        <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkDirective]}
            rehypePlugins={[rehypeRaw]}
            components={{
                ul: (props) => <ul className="list-disc pl-6 my-2" {...props} />,
                ol: (props) => <ol className="list-decimal pl-6 my-2" {...props} />,
                li: (props) => <li className="my-1" {...props} />,
            }}
        >
            {content}
        </ReactMarkdown>
    </div>
);
