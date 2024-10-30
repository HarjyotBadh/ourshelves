import { Pizza, Drumstick, Apple, IceCream, Banana } from "@tamagui/lucide-icons";

export interface FoodItem {
  id: string;
  name: string;
  cost: number;
  icon: any;
  feedValue: number;
  description: string;
}

export const FOOD_ITEMS: FoodItem[] = [
  {
    id: "basic_kibble",
    name: "Basic Kibble",
    cost: 0, // Set to 0 since it's free
    icon: Pizza,
    feedValue: 10,
    description: "A basic pet food that provides minimal nutrition",
  },
  {
    id: "tasty_meat",
    name: "Tasty Meat",
    cost: 25,
    icon: Drumstick,
    feedValue: 25,
    description: "Delicious meat that your pet will love",
  },
  {
    id: "fresh_fruit",
    name: "Fresh Fruit",
    cost: 15,
    icon: Apple,
    feedValue: 15,
    description: "Healthy and refreshing fruit snack",
  },
  {
    id: "sweet_treat",
    name: "Sweet Treat",
    cost: 30,
    icon: IceCream,
    feedValue: 30,
    description: "A special dessert for your pet",
  },
  {
    id: "banana",
    name: "Banana",
    cost: 20,
    icon: Banana,
    feedValue: 20,
    description: "A sweet and nutritious banana",
  },
];
