export interface Places {
  id: string;
  name: string;
  location: string;
  capacity: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}
