import { TRAIT_AXIS_ITEMS } from './traitAxisItemsData.js';

// Items are embedded (see traitAxisItemsData.js) rather than fetched from a
// Google Sheet, so this is synchronous under the hood — kept as an async
// function so callers don't need to change.
export async function getTraitAxisItems() {
  return TRAIT_AXIS_ITEMS;
}
