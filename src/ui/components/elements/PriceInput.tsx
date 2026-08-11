import React, { forwardRef } from "react";
import { Input, InputProps } from "./Input";
import { cn } from "../../../logic/utils/cn";

export const PriceInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const formatNumber = (val: string | number) => {
      if (!val) return "";
      const num = val.toString().replace(/\D/g, "");
      return new Intl.NumberFormat("id-ID").format(parseInt(num) || 0);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, "");
      const numericValue = parseInt(rawValue) || 0;
      
      if (onChange) {
        // We pass the numeric value if the handler expects it, 
        // but to maintain compatibility with event handlers, we still provide the event structure.
        // However, standard React inputs expect event. 
        // For our specific use case in forms where we use useState, we'll check the handler.
        
        // Let's make a more predictable synthetic event
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: rawValue,
            name: props.name,
          },
        } as any;

        // If the user passed a state setter directly (rare but possible in our recent edit), 
        // it might expect a number. But usually they wrap it.
        onChange(syntheticEvent);
      }
    };

    return (
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-[0.75rem]">
          <span className="text-gray-500 sm:text-sm">Rp</span>
        </div>
        <Input
          {...props}
          ref={ref}
          value={formatNumber(value as string)}
          onChange={handleChange}
          className={cn("pl-[2.5rem]", className)}
        />
      </div>
    );
  }
);

PriceInput.displayName = "PriceInput";
