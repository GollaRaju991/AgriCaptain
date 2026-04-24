import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 pointer-events-auto bg-white rounded-2xl", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-base font-semibold text-green-800",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-8 w-8 inline-flex items-center justify-center rounded-full bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-green-700/70 rounded-md w-10 font-medium text-[0.75rem] uppercase tracking-wide",
        row: "flex w-full mt-2",
        cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-green-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          "h-10 w-10 p-0 font-medium rounded-full inline-flex items-center justify-center text-slate-700 hover:bg-green-100 hover:text-green-800 transition-colors aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "!bg-green-600 !text-white hover:!bg-green-700 hover:!text-white focus:!bg-green-700 shadow-md",
        day_today: "ring-2 ring-green-500 ring-offset-1 text-green-800 font-bold",
        day_outside:
          "day-outside text-slate-300 opacity-60 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "!text-slate-300 line-through opacity-40 cursor-not-allowed hover:!bg-transparent hover:!text-slate-300",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
