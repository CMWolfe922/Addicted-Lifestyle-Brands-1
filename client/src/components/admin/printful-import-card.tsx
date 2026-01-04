import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Download, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";

interface PrintfulProduct {
  id: number;
  external_id: string;
  name: string;
  variants: number;
  synced: number;
  thumbnail_url?: string;
}

interface PrintfulStoreProduct {
  id: number;
  sync_product: {
    id: number;
    name: string;
    thumbnail_url?: string;
  };
  sync_variants?: Array<{
    retail_price: string;
    currency: string;
  }>;
}

export function PrintfulImportCard() {
  const { toast } = useToast();
  const [importingIds, setImportingIds] = useState<Set<number>>(new Set());

  const { data: storeProducts = [], isLoading } = useQuery<PrintfulStoreProduct[]>({
    queryKey: ["/api/admin/printful/store-products"],
    retry: false,
  });

  const importMutation = useMutation({
    mutationFn: async (productId: number) => {
      const res = await fetch(`/api/admin/printful/import-product/${productId}`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to import product");
      }

      return res.json();
    },
    onMutate: (productId) => {
      setImportingIds(prev => new Set(prev).add(productId));
    },
    onSuccess: (data) => {
      toast({
        title: "Product imported successfully",
        description: `${data.product.name} has been added to your inventory`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error: Error, productId) => {
      toast({
        title: "Import failed",
        description: error.message,
        variant: "destructive",
      });
      setImportingIds(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    },
    onSettled: (_, __, productId) => {
      setTimeout(() => {
        setImportingIds(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }, 2000);
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Import from Printful
          </CardTitle>
          <CardDescription>
            Add products from your Printful store
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!storeProducts || storeProducts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Import from Printful
          </CardTitle>
          <CardDescription>
            Add products from your Printful store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
              No products found in your Printful store
            </p>
            <Button
              variant="outline"
              onClick={() => window.open("https://www.printful.com/dashboard/store", "_blank")}
            >
              Open Printful Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Import from Printful
        </CardTitle>
        <CardDescription>
          Add products from your Printful store to your inventory
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {storeProducts.map((product) => {
            const firstVariant = product.sync_variants?.[0];
            const price = firstVariant?.retail_price || "N/A";
            const currency = firstVariant?.currency || "USD";
            const isImporting = importingIds.has(product.id);

            return (
              <div
                key={product.id}
                className="flex items-center gap-4 p-3 rounded-md border hover-elevate transition-all"
              >
                {product.sync_product.thumbnail_url ? (
                  <img
                    src={product.sync_product.thumbnail_url}
                    alt={product.sync_product.name}
                    className="w-16 h-16 object-cover rounded-md shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-md shrink-0 flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.sync_product.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {price} {currency}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      ID: {product.id}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => importMutation.mutate(product.id)}
                  disabled={isImporting}
                  className="shrink-0"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Import
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open("https://www.printful.com/dashboard/store", "_blank")}
            className="w-full"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Manage Products in Printful
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
