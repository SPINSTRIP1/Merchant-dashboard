import { PLACE_TYPES } from "../_constants";

export const getPlaceType = (place: string) => {
  const placeType = PLACE_TYPES.find((type) => type.value === place)?.label;
  return placeType;
};
