import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  const parseMarkdown = (text: string): React.ReactNode[] => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;
    let listItems: string[] = [];
    let tableRows: string[][] = [];
    let inTable = false;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-2">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-sm">{parseInline(item)}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    const flushTable = () => {
      if (tableRows.length > 0) {
        const headerRow = tableRows[0];
        const dataRows = tableRows.slice(2); // Skip header separator row
        
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto my-3">
            <table className="min-w-full text-sm border border-border rounded-lg overflow-hidden">
              <thead className="bg-secondary">
                <tr>
                  {headerRow.map((cell, idx) => (
                    <th key={idx} className="px-3 py-2 text-left font-medium border-b border-border">
                      {parseInline(cell.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx % 2 === 0 ? "" : "bg-secondary/30"}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-3 py-2 border-b border-border/50">
                        {parseInline(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    const parseInline = (text: string): React.ReactNode => {
      // Bold
      text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      // Italic
      text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
      // Code
      text = text.replace(/`(.+?)`/g, "<code class='bg-secondary px-1 py-0.5 rounded text-xs'>$1</code>");
      
      return <span dangerouslySetInnerHTML={{ __html: text }} />;
    };

    while (i < lines.length) {
      const line = lines[i];
      
      // Table detection
      if (line.includes("|") && line.trim().startsWith("|")) {
        flushList();
        const cells = line.split("|").filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        
        // Check if this is a separator row (contains only dashes and colons)
        const isSeparator = cells.every(c => /^[\s\-:]+$/.test(c));
        
        if (!inTable && !isSeparator) {
          inTable = true;
        }
        
        tableRows.push(cells);
        i++;
        continue;
      } else if (inTable) {
        flushTable();
      }
      
      // Headers
      if (line.startsWith("### ")) {
        flushList();
        elements.push(
          <h4 key={`h4-${i}`} className="font-semibold text-sm mt-4 mb-2">
            {parseInline(line.slice(4))}
          </h4>
        );
        i++;
        continue;
      }
      
      if (line.startsWith("## ")) {
        flushList();
        elements.push(
          <h3 key={`h3-${i}`} className="font-semibold text-base mt-4 mb-2">
            {parseInline(line.slice(3))}
          </h3>
        );
        i++;
        continue;
      }
      
      if (line.startsWith("# ")) {
        flushList();
        elements.push(
          <h2 key={`h2-${i}`} className="font-bold text-lg mt-4 mb-2">
            {parseInline(line.slice(2))}
          </h2>
        );
        i++;
        continue;
      }
      
      // Bullet points
      if (line.match(/^[\s]*[-*•]\s+/)) {
        const content = line.replace(/^[\s]*[-*•]\s+/, "");
        listItems.push(content);
        i++;
        continue;
      }
      
      // Numbered lists
      if (line.match(/^[\s]*\d+\.\s+/)) {
        flushList();
        const content = line.replace(/^[\s]*\d+\.\s+/, "");
        if (listItems.length === 0 || !elements[elements.length - 1]?.toString().includes("ol")) {
          // Start a new ordered list collection
        }
        elements.push(
          <div key={`num-${i}`} className="flex gap-2 my-1">
            <span className="text-muted-foreground text-sm">{line.match(/^\d+/)?.[0]}.</span>
            <span className="text-sm">{parseInline(content)}</span>
          </div>
        );
        i++;
        continue;
      }
      
      // Empty line
      if (line.trim() === "") {
        flushList();
        i++;
        continue;
      }
      
      // Regular paragraph
      flushList();
      elements.push(
        <p key={`p-${i}`} className="text-sm my-2 leading-relaxed">
          {parseInline(line)}
        </p>
      );
      i++;
    }
    
    flushList();
    flushTable();
    
    return elements;
  };

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {parseMarkdown(content)}
    </div>
  );
};

export default MarkdownRenderer;
