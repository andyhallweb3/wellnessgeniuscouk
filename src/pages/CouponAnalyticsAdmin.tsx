import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Gift, Users, ShoppingCart, TrendingUp, Percent, RefreshCw } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CouponStats {
  totalSubscribers: number;
  subscribersWithCoupon: number;
  couponsRedeemed: number;
  redemptionRate: number;
  conversionRate: number;
}

interface CouponRedemption {
  email: string;
  coupon_code: string;
  subscribed_at: string;
  coupon_used_at: string | null;
  coupon_product_id: string | null;
}

const CouponAnalyticsAdmin = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: authLoading, isAuthenticated, getAuthHeaders } = useAdminAuth();
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [redemptions, setRedemptions] = useState<CouponRedemption[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await supabase.functions.invoke('manage-subscribers', {
        body: { action: 'coupon-analytics' },
        headers: getAuthHeaders(),
      });

      if (response.error) throw response.error;

      const { stats: fetchedStats, redemptions: fetchedRedemptions } = response.data;
      setStats(fetchedStats);
      setRedemptions(fetchedRedemptions || []);
    } catch (error: any) {
      console.error('Error fetching coupon analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchAnalytics();
    }
  }, [isAuthenticated, isAdmin]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Admin access required</p>
            <Button onClick={() => navigate('/admin')}>Go to Admin Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Coupon Analytics</h1>
              <p className="text-muted-foreground">Newsletter signup coupon performance</p>
            </div>
          </div>
          <Button onClick={fetchAnalytics} disabled={loading} variant="outline" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Subscribers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.totalSubscribers}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Coupons Issued
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.subscribersWithCoupon}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Coupons Redeemed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{stats.couponsRedeemed}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Redemption Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{stats.redemptionRate.toFixed(1)}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">{stats.conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Subscribers → Purchases</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Redemption Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Coupon Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : redemptions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No coupon activity yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Coupon Code</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead>Redeemed</TableHead>
                    <TableHead>Product</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redemptions.map((redemption, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{redemption.email}</TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {redemption.coupon_code}
                        </code>
                      </TableCell>
                      <TableCell>
                        {new Date(redemption.subscribed_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {redemption.coupon_used_at ? (
                          <span className="text-green-600 font-medium">
                            {new Date(redemption.coupon_used_at).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Not yet</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {redemption.coupon_product_id || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CouponAnalyticsAdmin;
