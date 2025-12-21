import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TrackDownloadParams {
  productId: string;
  productName: string;
  downloadType: "free" | "paid" | "redownload";
  /** The actual product tier (not the action). */
  productType?: "free" | "paid";
}

export const useDownloadTracking = () => {
  const { user } = useAuth();

  const trackDownload = async ({
    productId,
    productName,
    downloadType,
    productType,
  }: TrackDownloadParams) => {
    if (!user?.email) {
      console.log("[Download Tracking] No user email, skipping tracking");
      return;
    }

    const resolvedProductType: "free" | "paid" =
      productType ?? (downloadType === "free" ? "free" : "paid");

    try {
      const { error } = await supabase.from("product_downloads").insert({
        email: user.email,
        name: user.user_metadata?.full_name || null,
        product_id: productId,
        product_name: productName,
        download_type: downloadType,
        product_type: resolvedProductType,
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
