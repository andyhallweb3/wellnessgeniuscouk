import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TrackDownloadParams {
  productId: string;
  productName: string;
  downloadType: "free" | "paid" | "redownload";
}

export const useDownloadTracking = () => {
  const { user } = useAuth();

  const trackDownload = async ({ productId, productName, downloadType }: TrackDownloadParams) => {
    if (!user?.email) {
      console.log("[Download Tracking] No user email, skipping tracking");
      return;
    }

    try {
      const { error } = await supabase
        .from("product_downloads")
        .insert({
          email: user.email,
          name: user.user_metadata?.full_name || null,
          product_id: productId,
          product_name: productName,
          download_type: downloadType,
          product_type: downloadType === "paid" ? "paid" : "free",
        });

      if (error) {
        console.error("[Download Tracking] Failed to track download:", error);
      } else {
        console.log("[Download Tracking] Download tracked:", { productId, downloadType });
      }
    } catch (err) {
      console.error("[Download Tracking] Error:", err);
    }
  };

  return { trackDownload };
};
