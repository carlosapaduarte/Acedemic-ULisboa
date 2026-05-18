import { SlotToWorkDto } from "~/service/output_dtos";

/** Compares HH:mm strings (same-day slot picker). */
export function isTimeRangeInvalid(
  startTime: string | undefined,
  endTime: string | undefined,
): boolean {
  if (!startTime || !endTime) return false;
  return endTime <= startTime;
}

export function isSlotRangeInvalid(slot: SlotToWorkDto): boolean {
  return slot.end.getTime() <= slot.start.getTime();
}

export function hasInvalidSlotRanges(slots: SlotToWorkDto[]): boolean {
  return slots.some(isSlotRangeInvalid);
}
