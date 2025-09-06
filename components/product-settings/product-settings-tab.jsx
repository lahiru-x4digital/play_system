"use client";
import { AppWindowIcon, CodeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
