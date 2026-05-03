export interface Question {
  id: string; // e.g. "ca_001"
  stateCode: string; // e.g. "CA"
  topic: Topic;
  difficulty: 1 | 2 | 3;
  question: string;
  options: string[]; // always 4 options
  correctIndex: number; // 0-3
  explanation: string;
  rule: string; // e.g. "CVC 21460"
  tip: string;
}

export type Topic =
  | "traffic_signs"
  | "right_of_way"
  | "speed_limits"
  | "dui_laws"
  | "road_markings"
  | "highway_driving"
  | "parking"
  | "pedestrians";

export const TOPIC_LABELS: Record<Topic, string> = {
  traffic_signs: "Traffic Signs",
  right_of_way: "Right of Way",
  speed_limits: "Speed Limits",
  dui_laws: "DUI Laws",
  road_markings: "Road Markings",
  highway_driving: "Highway Driving",
  parking: "Parking",
  pedestrians: "Pedestrians",
};

export interface StateBank {
  stateCode: string;
  stateName: string;
  questions: Question[];
}
