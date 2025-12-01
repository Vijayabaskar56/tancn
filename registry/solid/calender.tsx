import CalendarPrimitive from "@corvu/calendar"
import type { ComponentProps, JSX, ValidComponent } from "solid-js"
import { Index, Match, mergeProps, Switch, splitProps } from "solid-js"
import { buttonVariants } from "@/components/ui/button"
import { cx } from "@/utils/utils"

// Keep the primitive wrapper for advanced use cases
export type CalendarPrimitiveProps = ComponentProps<typeof CalendarPrimitive>

export const CalendarPrimitiveWrapper = (props: CalendarPrimitiveProps) => {
  return <CalendarPrimitive data-slot="calendar" {...props} />
}

// Simplified Calendar API (similar to react-day-picker)
export type CalendarClassNames = {
  root?: string
  months?: string
  month?: string
  nav?: string
  button_previous?: string
  button_next?: string
  month_caption?: string
  caption_label?: string
  table?: string
  weekdays?: string
  weekday?: string
  week?: string
  day?: string
  cell?: string
  cell_trigger?: string
}

export type CalendarComponents = {
  Root?: (props: ComponentProps<"div">) => JSX.Element
  Nav?: (props: { action: string; class?: string }) => JSX.Element
  Label?: (props: ComponentProps<"h2">) => JSX.Element
  Table?: (props: ComponentProps<"table">) => JSX.Element
  HeadCell?: (props: ComponentProps<"th">) => JSX.Element
  Cell?: (props: ComponentProps<"td">) => JSX.Element
  CellTrigger?: (props: ComponentProps<"button"> & { day: unknown }) => JSX.Element
}

export type SimplifiedCalendarProps = {
  mode?: "single" | "range" | "multiple"
  selected?: Date | Date[] | { from?: Date; to?: Date }
  value?: Date | Date[] | { from?: Date; to?: Date }
  onSelect?: (date: Date | Date[] | { from?: Date; to?: Date } | undefined) => void
  onValueChange?: (date: Date | Date[] | { from?: Date; to?: Date } | undefined) => void
  classNames?: CalendarClassNames
  components?: CalendarComponents
  showOutsideDays?: boolean
  captionLayout?: "label" | "dropdowns"
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  weekdays?: string[]
  className?: string
  [key: string]: unknown // Allow passing through other props to CalendarPrimitive
}

export const Calendar = (props: SimplifiedCalendarProps) => {
  const defaultWeekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const merged = mergeProps(
    {
      mode: "single" as const,
      showOutsideDays: true,
      captionLayout: "label" as const,
      buttonVariant: "ghost" as const,
      weekdays: defaultWeekdays,
    },
    props
  )

  const selected = () => merged.selected ?? merged.value
  const onValueChange = () => merged.onValueChange ?? merged.onSelect

  // Convert selected prop to value format expected by CalendarPrimitive
  const getValue = () => {
    const sel = selected()
    if (!sel) return undefined

    if (merged.mode === "single") {
      return sel instanceof Date ? sel : undefined
    } else if (merged.mode === "range") {
      if (sel && typeof sel === "object" && "from" in sel) {
        const range = sel as { from?: Date; to?: Date }
        return {
          from: range.from ?? null,
          to: range.to ?? null,
        }
      }
      return null
    } else if (merged.mode === "multiple") {
      return Array.isArray(sel) ? sel : undefined
    }
    return undefined
  }

  // Convert onSelect/onValueChange to onValueChange format
  const handleValueChange = (newValue: Date | Date[] | { from?: Date | null; to?: Date | null } | null | undefined) => {
    const handler = onValueChange()
    if (!handler) return

    if (merged.mode === "single") {
      handler(newValue as Date | undefined)
    } else {
      handler(newValue as Date | Date[] | { from?: Date; to?: Date } | undefined)
    }
  }

  const classNames = () => merged.classNames ?? {}
  const components = () => merged.components ?? {}

  // Extract CalendarPrimitive props
  const [, calendarProps] = splitProps(merged as Record<string, unknown>, [
    "selected",
    "value",
    "onSelect",
    "onValueChange",
    "classNames",
    "components",
    "showOutsideDays",
    "captionLayout",
    "buttonVariant",
    "weekdays",
    "className",
  ])

  return (
    /* @ts-expect-error - CalendarPrimitive has discriminated union types, but we handle conversion internally */
    <CalendarPrimitive
      data-slot="calendar"
      mode={merged.mode}
      value={getValue()}
      onValueChange={handleValueChange}
      {...(calendarProps as Record<string, unknown>)}
    >
      {(calendarProps: { weeks: Date[][]; month: Date; weekdays: Date[]; value?: Date | Date[] | { from?: Date | null; to?: Date | null } | null }) => {
        const CustomRoot = components().Root
        const CustomNav = components().Nav
        const CustomLabel = components().Label
        const CustomTable = components().Table
        const CustomHeadCell = components().HeadCell
        const CustomCell = components().Cell
        const CustomCellTrigger = components().CellTrigger

        const Nav = CustomNav ?? CalendarNav
        const Label = CustomLabel ?? CalendarLabel
        const Table = CustomTable ?? CalendarTable
        const HeadCell = CustomHeadCell ?? CalendarHeadCell
        const Cell = CustomCell ?? CalendarCell
        const CellTrigger = CustomCellTrigger ?? CalendarCellTrigger

        // Format month and year for label
        const formatMonth = (date: Date) => {
          return date.toLocaleString("en", { month: "long" })
        }
        const formatWeekdayShort = (date: Date) => {
          return date.toLocaleString("en", { weekday: "short" })
        }
        const formatWeekdayLong = (date: Date) => {
          return date.toLocaleString("en", { weekday: "long" })
        }

        const content = (
          <div class={cx("flex flex-col gap-4 rounded-md p-3 shadow-sm [--cell-size:--spacing(8)]", classNames().root, classNames().months, merged.className)}>
            <div class={cx("relative flex w-full items-center justify-between", classNames().nav)}>
              <Nav
                action="prev-month"
                aria-label="Go to previous month"
                class={cx(
                  buttonVariants({ variant: merged.buttonVariant }),
                  "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  classNames().button_previous,
                )}
              />
              <Label class={cx("select-none font-medium text-sm", classNames().caption_label)}>
                {formatMonth(calendarProps.month)} {calendarProps.month.getFullYear()}
              </Label>
              <Nav
                action="next-month"
                aria-label="Go to next month"
                class={cx(
                  buttonVariants({ variant: merged.buttonVariant }),
                  "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  classNames().button_next,
                )}
              />
            </div>
            <Table class={cx("w-full border-collapse", classNames().table)}>
              <thead>
                <tr class={cx("flex", classNames().weekdays)}>
                  <Index each={calendarProps.weekdays}>
                    {(weekday) => (
                      <HeadCell abbr={formatWeekdayLong(weekday())} class={cx(classNames().weekday)}>
                        {formatWeekdayShort(weekday())}
                      </HeadCell>
                    )}
                  </Index>
                </tr>
              </thead>
              <tbody>
                <Index each={calendarProps.weeks}>
                  {(week) => (
                    <tr class={cx("mt-2 flex w-full", classNames().week)}>
                      <Index each={week()}>
                        {(day) => (
                          <Cell class={cx(classNames().cell)}>
                            <CellTrigger
                              day={day()}
                              class={cx(classNames().cell_trigger, classNames().day, "dark:data-[today]:focus-visible:ring-ring/50")}
                            >
                              {day().getDate()}
                            </CellTrigger>
                          </Cell>
                        )}
                      </Index>
                    </tr>
                  )}
                </Index>
              </tbody>
            </Table>
          </div>
        )

        if (CustomRoot) {
          return <CustomRoot class={cx("w-fit", classNames().root)}>{content}</CustomRoot>
        }

        return content
      }}
    </CalendarPrimitive>
  )
}

export type CalendarNavProps<T extends ValidComponent = "button"> =
  ComponentProps<typeof CalendarPrimitive.Nav<T>>

export const CalendarNav = <T extends ValidComponent = "button">(
  props: CalendarNavProps<T>,
) => {
  const [, rest] = splitProps(props as CalendarNavProps, ["action", "class"])

  return (
    <CalendarPrimitive.Nav
      data-slot="calendar-nav"
      action={props.action}
      class={buttonVariants({
        variant: "outline",
        class: [
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          props.class,
        ],
      })}
      {...rest}
    >
      <Switch>
        <Match
          when={props.action === "prev-year" || props.action === "prev-month"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-4"
            viewBox="0 0 24 24"
            aria-label="Previous"
          >
            <title>Previous</title>
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m15 18l-6-6l6-6"
            />
          </svg>
        </Match>
        <Match
          when={props.action === "next-year" || props.action === "next-month"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="size-4"
            viewBox="0 0 24 24"
            aria-label="Next"
          >
            <title>Next</title>
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m9 18l6-6l-6-6"
            />
          </svg>
        </Match>
      </Switch>
    </CalendarPrimitive.Nav>
  )
}

export type CalendarLabelProps<T extends ValidComponent = "h2"> =
  ComponentProps<typeof CalendarPrimitive.Label<T>>

export const CalendarLabel = <T extends ValidComponent = "h2">(
  props: CalendarLabelProps<T>,
) => {
  const [, rest] = splitProps(props as CalendarLabelProps, ["class"])

  return (
    <CalendarPrimitive.Label
      data-slot="calendar-label"
      class={cx("text-sm font-medium", props.class)}
      {...rest}
    />
  )
}

export type CalendarTableProps<T extends ValidComponent = "table"> =
  ComponentProps<typeof CalendarPrimitive.Table<T>>

export const CalendarTable = <T extends ValidComponent = "table">(
  props: CalendarTableProps<T>,
) => {
  return <CalendarPrimitive.Table data-slot="calendar-table" {...props} />
}

export type CalendarHeadCellProps<T extends ValidComponent = "th"> =
  ComponentProps<typeof CalendarPrimitive.HeadCell<T>>

export const CalendarHeadCell = <T extends ValidComponent = "th">(
  props: CalendarHeadCellProps<T>,
) => {
  const [, rest] = splitProps(props as CalendarHeadCellProps, ["class"])

  return (
    <CalendarPrimitive.HeadCell
      data-slot="calendar-head-cell"
      class={cx(
        "text-muted-foreground w-8 rounded-md text-[0.8rem] font-normal",
        props.class,
      )}
      {...rest}
    />
  )
}

export type CalendarCellProps<T extends ValidComponent = "td"> = ComponentProps<
  typeof CalendarPrimitive.Cell<T>
>

export const CalendarCell = <T extends ValidComponent = "td">(
  props: CalendarCellProps<T>,
) => {
  const [, rest] = splitProps(props as CalendarCellProps, ["class"])

  return (
    <CalendarPrimitive.Cell
      data-slot="calendar-cell"
      class={cx(
        "has-[[data-in-range]]:bg-accent relative p-0 text-center text-sm focus-within:relative focus-within:z-20 has-[[data-disabled][data-selected]]:opacity-50 has-[[data-in-range]]:first:rounded-l-md has-[[data-in-range]]:last:rounded-r-md has-[[data-range-end]]:rounded-r-md has-[[data-range-start]]:rounded-l-md",
        props.class,
      )}
      {...rest}
    />
  )
}

export type CalendarCellTriggerProps<T extends ValidComponent = "button"> =
  ComponentProps<typeof CalendarPrimitive.CellTrigger<T>>

export const CalendarCellTrigger = <T extends ValidComponent = "button">(
  props: CalendarCellTriggerProps<T>,
) => {
  const [, rest] = splitProps(props as CalendarCellTriggerProps, ["class"])

  return (
    <CalendarPrimitive.CellTrigger
      data-slot="calendar-cell-trigger"
      class={buttonVariants({
        variant: "ghost",
        class: [
          "size-8 p-0 font-normal aria-selected:opacity-100",
          "data-[today]:bg-accent data-[today]:text-accent-foreground dark:data-[today]:focus-visible:ring-secondary",
          "aria-selected:not-[[data-in-range]]:bg-primary aria-selected:not-[[data-in-range]]:text-primary-foreground aria-selected:not-[[data-in-range]]:hover:bg-primary aria-selected:not-[[data-in-range]]:hover:text-primary-foreground",
          "data-[range-start]:aria-selected:bg-primary data-[range-start]:aria-selected:text-primary-foreground data-[range-start]:aria-selected:hover:bg-primary! data-[range-start]:aria-selected:hover:text-primary-foreground!",
          "data-[range-end]:aria-selected:bg-primary data-[range-end]:aria-selected:text-primary-foreground data-[range-end]:aria-selected:hover:bg-primary! data-[range-end]:aria-selected:hover:text-primary-foreground!",
          props.class,
        ],
      })}
      {...rest}
    />
  )
}