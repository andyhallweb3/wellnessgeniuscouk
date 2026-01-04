import { ManageSection } from "./ManageSection";

interface NewsletterWorkflowProps {
  getAuthHeaders: () => Record<string, string>;
  onLogout: () => void;
  initialTab?: string;
}

export const NewsletterWorkflow = ({ getAuthHeaders, onLogout, initialTab }: NewsletterWorkflowProps) => {
  // Pass through the initial tab - campaigns is the default
  const defaultTab = initialTab === 'campaigns' ? 'campaigns' : initialTab || 'campaigns';
  
  return (
    <ManageSection 
      getAuthHeaders={getAuthHeaders} 
      onLogout={onLogout} 
      defaultTab={defaultTab}
    />
  );
};
