// src/utils/getCategoryIcon.js
import housing from "../assets/categories/housing.png";
import food from "../assets/categories/food.png";
import utilities from "../assets/categories/utilities.png";
import transport from "../assets/categories/transport.png";
import shopping from "../assets/categories/shopping.png";
import entertainment from "../assets/categories/entertainment.png";
import other from "../assets/categories/other.png";

const map = {
  Housing: housing,
  Food: food,
  Utilities: utilities,
  Transport: transport,
  Shopping: shopping,
  Entertainment: entertainment,
};

export default function getCategoryIcon(category) {
  return map[category] || other;
}
