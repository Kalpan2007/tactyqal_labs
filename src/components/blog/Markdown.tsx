import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders a post body. react-markdown builds React elements rather than an HTML
 * string, so stored content can never inject markup into the page.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div
      className="prose prose-lg max-w-none
        prose-headings:display prose-headings:font-light prose-headings:tracking-tight
        prose-h2:mt-14 prose-h2:mb-5 prose-h2:text-3xl sm:prose-h2:text-4xl
        prose-h3:mt-10 prose-h3:mb-3 prose-h3:text-2xl
        prose-p:leading-relaxed prose-p:text-night/80
        prose-li:text-night/80 prose-li:marker:text-gold
        prose-strong:font-medium prose-strong:text-night
        prose-a:text-night prose-a:underline prose-a:decoration-gold prose-a:underline-offset-4
        hover:prose-a:decoration-night
        prose-blockquote:border-l-gold prose-blockquote:not-italic prose-blockquote:font-light
        prose-img:rounded-xl
        prose-hr:border-rule
        prose-table:text-base prose-th:text-left prose-th:font-medium
        prose-code:rounded prose-code:bg-fog prose-code:px-1.5 prose-code:py-0.5
        prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-night prose-pre:text-snow"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // External links open in a new tab, with rel set so the target page
          // cannot reach back into this one.
          a({ href, children, ...props }) {
            const external = !!href && /^https?:\/\//.test(href) && !href.includes("tactyqal.com");
            return (
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
