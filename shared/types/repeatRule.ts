export type Weekday =
  | "MON"
  | "TUE"
  | "WED"
  | "THU"
  | "FRI"
  | "SAT"
  | "SUN";

export type RepeatRule =
  | { type: "DAILY" }
  | { type: "EVERY_N_DAYS"; n: number }
  | { type: "WEEKLY"; days: Weekday[] }
  | { type: "EVERY_N_WEEKS"; n: number; days: Weekday[] }
  | { type: "MONTHLY"; day: number }
  | { type: "YEARLY"; month: number; day: number };