import React from "react";
import { Calendar, Filter } from "lucide-react";
import { DateRangeFilter } from "../types";
import { tokens } from "../../../ui/styles/tokens";
import { cn } from "../../../logic/utils/cn";
import { Input } from "../../../ui/components/elements/Input";

interface DateRangePickerProps {
  filter: DateRangeFilter;
  onChange: (newFilter: DateRangeFilter) => void;
  className?: string;
}

export function DateRangePicker({ filter, onChange, className }: DateRangePickerProps) {
  const getTodayStr = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getDaysAgoStr = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split("T")[0];
  };

  const getMonthStartStr = () => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  };

  const handlePreset = (preset: "today" | "7days" | "30days" | "thisMonth") => {
    const today = getTodayStr();
    if (preset === "today") {
      onChange({ startDate: today, endDate: today });
    } else if (preset === "7days") {
      onChange({ startDate: getDaysAgoStr(7), endDate: today });
    } else if (preset === "30days") {
      onChange({ startDate: getDaysAgoStr(30), endDate: today });
    } else if (preset === "thisMonth") {
      onChange({ startDate: getMonthStartStr(), endDate: today });
    }
  };

  return (
    <div className={cn("flex flex-col gap-[0.75rem] rounded-md border border-gray-200 bg-white p-[1rem] sm:flex-row sm:items-center sm:justify-between shadow-xs", className)}>
      <div className="flex items-center gap-[0.5rem] text-sm font-semibold text-gray-700">
        <Filter className="h-[1.25rem] w-[1.25rem] text-purple-700 shrink-0" />
        <span>Filter Periode Laporan:</span>
      </div>

      <div className="flex flex-wrap items-center gap-[0.5rem]">
        {/* Preset Buttons */}
        <div className="flex items-center gap-[0.25rem] rounded-md bg-gray-100 p-[0.25rem]">
          <button
            type="button"
            onClick={() => handlePreset("today")}
            className="rounded-md px-[0.625rem] py-[0.25rem] text-xs font-medium text-gray-700 hover:bg-white hover:shadow-xs transition-all"
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => handlePreset("7days")}
            className="rounded-md px-[0.625rem] py-[0.25rem] text-xs font-medium text-gray-700 hover:bg-white hover:shadow-xs transition-all"
          >
            7 Hari Terakhir
          </button>
          <button
            type="button"
            onClick={() => handlePreset("30days")}
            className="rounded-md px-[0.625rem] py-[0.25rem] text-xs font-medium text-gray-700 hover:bg-white hover:shadow-xs transition-all"
          >
            30 Hari Terakhir
          </button>
          <button
            type="button"
            onClick={() => handlePreset("thisMonth")}
            className="rounded-md px-[0.625rem] py-[0.25rem] text-xs font-medium text-gray-700 hover:bg-white hover:shadow-xs transition-all"
          >
            Bulan Ini
          </button>
        </div>

        {/* Date Inputs */}
        <div className="flex items-center gap-[0.5rem]">
          <div className="relative flex items-center w-[9.5rem]">
            <Input
              type="date"
              value={filter.startDate}
              onChange={(e) => onChange({ ...filter, startDate: e.target.value })}
              className="h-[2.25rem] text-xs"
            />
          </div>
          <span className="text-xs font-bold text-gray-400">s/d</span>
          <div className="relative flex items-center w-[9.5rem]">
            <Input
              type="date"
              value={filter.endDate}
              onChange={(e) => onChange({ ...filter, endDate: e.target.value })}
              className="h-[2.25rem] text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
