"use client"

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { discountService } from '@/services/discount.service';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Plus, Trash2 } from 'lucide-react';

const schema = z.object({
  mode: z.enum(['generate', 'manual']),
  generate: z.object({
    prefix: z.string().min(1, 'Required'),
    count: z.number().min(1, 'Min 1').max(100, 'Max 100'),
    length: z.number().min(4, 'Min 4').max(10, 'Max 10'),
    limit_per_customer: z.union([
      z.string().transform(val => val === '' ? null : parseInt(val, 10)),
      z.number().int().min(0, 'Must be at least 0').nullable()
    ]).nullable().default(null),
  }),
  manual: z.array(z.object({
    code: z.string().min(1, 'Required').transform(str => str.toUpperCase().trim()),
    limit_per_customer: z.union([
      z.string().transform(val => val === '' ? 1 : parseInt(val, 10)),
      z.number().int().min(0, 'Must be at least 0').default(1)
    ]).default(1),
  })).min(1, 'At least one code required'),
  is_active: z.boolean().default(true),
  apply_limit_to_all: z.boolean().default(false)
});

export function BulkCreateDiscountCodesForm({ discountId, discount, onSuccess }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      mode: 'generate',
      generate: { 
        prefix: 'DISC', 
        count: 5, 
        length: 6,
        limit_per_customer: 1
      },
      manual: [{ 
        code: '',
        limit_per_customer: 1
      }],
      is_active: true,
      apply_limit_to_all: false
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'manual'
  });

  const mode = watch('mode');

  const isCodeExists = (code) => {
    if (!discount?.codes) return false;
    return discount.codes.some(existingCode => 
      existingCode.discount_code === code || existingCode.code === code
    );
  };

  const generateCodes = (data) => {
    const codes = [];
    const maxAttempts = data.count * 3; // Prevent infinite loops
    let attempts = 0;
    
    while (codes.length < data.count && attempts < maxAttempts) {
      attempts++;
      const code = data.prefix + 
        Math.random().toString(36).substring(2, 2 + data.length).toUpperCase();
      
      // Only add the code if it doesn't already exist
      if (!isCodeExists(code) && !codes.some(c => c.discount_code === code)) {
        codes.push({ 
          discount_code: code,
          is_active: true,
          limit_per_customer: data.limit_per_customer || null
        });
      }
    }
    
    return codes;
  };

  const handleGenerateClick = () => {
    console.log('Generate button clicked');
    const generateValues = watch('generate');
    console.log('Current generate values:', generateValues);
    
    if (generateValues.count > 0 && generateValues.length >= 4) {
      console.log('Generating codes...');
      
      // Check if there are existing codes to avoid duplicates
      const existingCodes = discount?.codes?.map(c => c.discount_code || c.code) || [];
      if (existingCodes.length > 0) {
        console.log('Found existing codes, will avoid duplicates');
      }
      
      const codes = generateCodes({
        ...generateValues,
        count: parseInt(generateValues.count, 10),
        length: parseInt(generateValues.length, 10),
        limit_per_customer: generateValues.limit_per_customer
      });
      
      console.log('Generated codes:', codes);
      
      if (codes.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not generate unique codes. Try with different prefix or length.'
        });
        return;
      }
      
      // Store in generatedCodes state for display
      setGeneratedCodes(codes);
      
      // Clear any existing manual codes when generating new ones
      const newManualFields = codes.map(code => ({
        code: code.discount_code || code.code, // Fallback to code for backward compatibility
        limit_per_customer: generateValues.limit_per_customer ?? 1
      }));
      
      // This will trigger a re-render and show the codes in the manual tab
      setValue('manual', newManualFields);
      
      // Show success message
      toast({
        title: 'Success',
        description: `Generated ${codes.length} unique discount codes`
      });
      
      // Switch to manual tab to show the generated codes
      setValue('mode', 'manual');
    } else {
      console.log('Validation failed - count:', generateValues.count, 'length:', generateValues.length);
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please provide valid count (1-100) and length (4-10) values.'
      });
    }
  };

  const onSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      
      // Get the parent discount code's limit_per_customer or default to 1
      const defaultLimit = discount?.limit_per_customer ?? 1;
      
      let codes = [];
      
      if (formData.mode === 'generate') {
        codes = generateCodes({
          ...formData.generate,
          count: parseInt(formData.generate.count, 10),
          length: parseInt(formData.generate.length, 10),
          limit_per_customer: formData.generate.limit_per_customer ?? defaultLimit
        });
      } else {
        // For manual entry, check for duplicates with existing codes
        const duplicateCodes = formData.manual.filter(item => {
          const code = item.discount_code || item.code;
          return isCodeExists(code);
        });
        
        if (duplicateCodes.length > 0) {
          const duplicateList = duplicateCodes.map(c => c.discount_code || c.code).join(', ');
          throw new Error(`The following codes already exist: ${duplicateList}`);
        }
        
        codes = formData.manual;
      }
      
      if (codes.length === 0) {
        throw new Error('No valid codes to create');
      }
      
      // Prepare the payload with only required fields
      const payload = codes.map(code => ({
        discount_code: code.discount_code || code.code, // Fallback to code for backward compatibility
        is_active: formData.is_active ?? true,
        limit_per_customer: code.limit_per_customer !== undefined 
          ? code.limit_per_customer 
          : (discount?.limit_per_customer ?? 1)
      }));
  
      console.log('Sending payload to API:', payload);
      const response = await discountService.bulkCreateDiscountCodes(discountId, payload);
      
      toast({ 
        title: 'Success', 
        description: `${codes.length} discount codes created successfully` 
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating discount codes:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Error', 
        description: error.message || 'Failed to create discount codes' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Create Discount Codes</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={mode} onValueChange={v => setValue('mode', v)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate Codes</TabsTrigger>
              <TabsTrigger value="manual">Add Manually</TabsTrigger>
            </TabsList>

            <div className="space-y-4 pt-4">
              <TabsContent value="generate" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Prefix</Label>
                    <Input {...register('generate.prefix')} />
                    {errors.generate?.prefix && <p className="text-sm text-red-500">{errors.generate.prefix.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Count</Label>
                    <Input 
                      type="number" 
                      {...register('generate.count', { 
                        valueAsNumber: true,
                        min: 1,
                        max: 100
                      })} 
                    />
                    {errors.generate?.count && <p className="text-sm text-red-500">{errors.generate.count.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Length</Label>
                    <Input 
                      type="number" 
                      {...register('generate.length', { 
                        valueAsNumber: true,
                        min: 4,
                        max: 10
                      })} 
                    />
                    {errors.generate?.length && <p className="text-sm text-red-500">{errors.generate.length.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Usage Limit per Customer</Label>
                      <span className="text-xs text-muted-foreground">
                        Default: {discount?.limit_per_customer ?? 0}
                      </span>
                    </div>
                    <Input 
                      type="number"
                      min="0"
                      placeholder={`Default: ${discount?.limit_per_customer ?? 0}`}
                      {...register('generate.limit_per_customer', { 
                        setValueAs: v => v === '' ? null : parseInt(v, 10)
                      })} 
                    />
                    {errors.generate?.limit_per_customer && (
                      <p className="text-sm text-red-500">{errors.generate.limit_per_customer.message}</p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={async () => {
                    console.log('Button click event fired');
                    try {
                      handleGenerateClick();
                    } catch (error) {
                      console.error('Error generating codes:', error);
                      toast({
                        variant: 'destructive',
                        title: 'Error',
                        description: 'Failed to generate codes. Please try again.'
                      });
                    }
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Codes
                </Button>
                {generatedCodes.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between items-center">
                      <Label>Preview of Generated Codes ({generatedCodes.length} total)</Label>
                      <Button 
                        type="button" 
                        variant="link" 
                        size="sm" 
                        className="h-6 p-0 text-xs text-muted-foreground"
                        onClick={() => setValue('mode', 'manual')}
                      >
                        View all in table →
                      </Button>
                    </div>
                    <div className="max-h-40 overflow-y-auto p-2 border rounded bg-muted/20">
                      {generatedCodes.slice(0, 5).map((code, i) => (
                        <div key={i} className="py-1 font-mono text-sm">
                          <span className="font-medium">{code.code}</span>
                        </div>
                      ))}
                      {generatedCodes.length > 5 && (
                        <div className="text-xs text-muted-foreground text-center pt-1">
                          + {generatedCodes.length - 5} more codes...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex justify-center items-center gap-4 w-full">
                      <div className="w-full flex flex-col items-start justify-center gap-[5px]">
                        <div className="w-full flex items-center justify-start gap-[10px]" >
                          <div className="flex-1">
                            <Label>Code</Label>
                            <Input 
                              className="w-full"
                              {...register(`manual.${index}.code`)} 
                            />
                            {errors.manual?.[index]?.code && (
                              <p className="text-sm text-red-500">
                                {errors.manual[index].code.message}
                              </p>
                            )}
                          </div>
                          <div className="w-40">
                            <div className="flex items-center justify-between">
                              <Label>Usage Limit</Label>
                              <span className="text-xs text-muted-foreground">
                                Default: {discount?.limit_per_customer ?? 0}
                              </span>
                            </div>
                            <Input 
                              type="number"
                              min="0"
                              placeholder={discount?.limit_per_customer !== undefined ? `Default: ${discount.limit_per_customer}` : '1 (Default)'}
                              {...register(`manual.${index}.limit_per_customer`, {
                                setValueAs: v => v === '' ? 1 : (isNaN(parseInt(v, 10)) ? 1 : parseInt(v, 10))
                              })}
                            />
                            {errors.manual?.[index]?.limit_per_customer && (
                              <p className="text-sm text-red-500">
                                {errors.manual[index].limit_per_customer.message}
                              </p>
                            )}
                          </div>
                          <div className="pt-6">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => remove(index)}
                              disabled={fields.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ code: '' })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Code
                  </Button>
                </div>
              </TabsContent>

              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full"
                onClick={(e) => {
                  console.log('Submit button clicked');
                  e.stopPropagation();
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Codes...
                  </>
                ) : (
                  'Create Discount Codes'
                )}
              </Button>
            </div>
          </Tabs>
        </form>
      </CardContent>
    </Card>
  );
}