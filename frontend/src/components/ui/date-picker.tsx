import { Calendar } from "@/components/ui/calendar";
import * as React from "react";
import "@daypicker/react/style.css";
import { Popover, PopoverContent, PopoverPositioner, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { addYears } from "date-fns";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectPositioner,
} from "@/components/ui/select";
import { DropdownNavProps, DropdownProps } from "@daypicker/react";
import { Input } from "@/components/ui/input";
import { useTypedDate } from "@/lib/react-typed-date";
import { cn } from "@/lib/utils";

type DatePickerProps = {
  value: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
  className?: string
};


export default function DatePicker({ value, ...props }: DatePickerProps) {
  // const [date, setDate] = React.useState<Date>(new Date(value))
  const { inputProps } = useTypedDate({
    value: value || undefined,
    onChange: (e: any) => {
      props.onChange(e);
    },
    format: "DD/MM/YYYY",
  });

  const handleCalendarChange = (
    _value: string | number,
    _e: React.ChangeEventHandler<HTMLSelectElement>,
  ) => {
    const _event = {
      target: {
        value: String(_value),
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    _e(_event);
  };

  return (
    <div className={"relative"}>
      <Input {...inputProps} className={cn("w-full", props?.className)} disabled={props?.disabled} />
      <Popover>
        <PopoverTrigger
          render={
            <Button type={"button"} variant={"link"} disabled={props?.disabled}
              className="absolute inset-y-0 right-0 flex items-center text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
            </Button>
          }
        />
        <PopoverPositioner align="start">
          <PopoverContent className="w-auto p-2">
          {/*<Calendar mode="single" selected={date} onSelect={setDate} autoFocus />*/}
          <Calendar
            mode="single"
            selected={value || undefined}
            onSelect={(e: any) => {
              props.onChange(e);
            }}
            className="p-2"
            // classNames={{
            // month_caption: "mx-0",
            // }}
            captionLayout="dropdown"
            defaultMonth={value || new Date()}
            startMonth={new Date(1980, 6)}
            endMonth={addYears(new Date(), 10)}
            hideNavigation
            components={{
              DropdownNav: (props: DropdownNavProps) => {
                return <div className="flex items-center gap-2">{props.children}</div>;
              },
              Dropdown: (props: DropdownProps) => {
                return (
                  <Select
                    value={String(props.value)}
                    onValueChange={(value) => {
                      if (props.onChange && value !== null) {
                        handleCalendarChange(value, props.onChange);
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 first:grow">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPositioner>
                      <SelectContent
                        className="max-h-[min(26rem,var(--available-height))]">
                        {props.options?.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={String(option.value)}
                            disabled={option.disabled}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectPositioner>
                  </Select>
                );
              },
            }}
          />
        </PopoverContent>
        </PopoverPositioner>
      </Popover>
    </div>
  );
}
