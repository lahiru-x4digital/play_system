"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RuleSettings from "./RuleSettings";
import ProductExtraSettings from "./ProductExtraSettings";

export function ProductSettingsTab() {
  return (
    <div className="">
      <Tabs defaultValue="product">
        <TabsList>
          <TabsTrigger value="product">Products</TabsTrigger>
          <TabsTrigger value="extratime">Product Extra Time</TabsTrigger>
        </TabsList>
        <TabsContent value="product">
          <RuleSettings />
        </TabsContent>
        <TabsContent value="extratime">
          <ProductExtraSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
