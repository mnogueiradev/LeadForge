"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type CustomFieldDefinition = {
  id: string;
  name: string;
  slug: string;
  fieldType: string;
  isRequired: boolean;
  options?: { label: string; value: string }[];
  value?: any; // Valor atual se houver
};

interface Props {
  fields: CustomFieldDefinition[];
  onChange: (slug: string, value: any) => void;
  values: Record<string, any>;
}

export function DynamicFieldRenderer({ fields, onChange, values }: Props) {
  if (!fields || fields.length === 0) return null;

  return (
    <div className="space-y-4">
      {fields.map(field => {
        const value = values[field.slug] !== undefined ? values[field.slug] : (field.value ?? "");

        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.name} {field.isRequired && <span className="text-red-500">*</span>}
            </Label>
            
            {(field.fieldType === "TEXT" || field.fieldType === "EMAIL" || field.fieldType === "PHONE" || field.fieldType === "URL") && (
              <Input 
                type={field.fieldType === "EMAIL" ? "email" : "text"}
                value={value} 
                onChange={(e) => onChange(field.slug, e.target.value)} 
                required={field.isRequired}
              />
            )}

            {(field.fieldType === "NUMBER" || field.fieldType === "DECIMAL") && (
              <Input 
                type="number" 
                step={field.fieldType === "DECIMAL" ? "0.01" : "1"}
                value={value} 
                onChange={(e) => onChange(field.slug, e.target.value)} 
                required={field.isRequired}
              />
            )}

            {field.fieldType === "LONG_TEXT" && (
              <Textarea 
                value={value} 
                onChange={(e) => onChange(field.slug, e.target.value)} 
                required={field.isRequired}
              />
            )}

            {field.fieldType === "BOOLEAN" && (
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={!!value} 
                  onCheckedChange={(checked) => onChange(field.slug, checked)} 
                />
              </div>
            )}

            {field.fieldType === "DATE" && (
              <Input 
                type="date"
                value={value ? new Date(value).toISOString().split('T')[0] : ""} 
                onChange={(e) => onChange(field.slug, e.target.value)} 
                required={field.isRequired}
              />
            )}

            {field.fieldType === "SELECT" && field.options && (
              <Select value={value} onValueChange={(val) => onChange(field.slug, val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

          </div>
        );
      })}
    </div>
  );
}
