import vegManchurianImage from "../assets/veg-starters/SPJeuDuj9c2Jj7CJ5JISglM8xN69PVrzpXl8YLMFwC17bO3t7eYdV4toTh-xuxJbBMHGb-iJlHLakURchUDOI851dM7J4G2VI8jDK9i7CtqeN0Toi8TThGgXyqJGPeB_pLmVhNSvxnET3_i8rxIOfdZSi_Pq3ObNjYGmHfw_7422lBBF72xMZjNjZe4qsY27.jpeg";
import veg65Image from "../assets/veg-starters/veg65.jpeg";
import chickenManchurianImage from "../assets/non-veg-starters/chicken_munchuria.jpeg";
import chicken65Image from "../assets/non-veg-starters/65.jpeg";
import chilliChickenImage from "../assets/non-veg-starters/chilli.jpeg";
import vegNoodlesImage from "../assets/noodles/veg.jpeg";
import eggNoodlesImage from "../assets/noodles/egg.jpeg";
import paneerCurryImage from "../assets/curry/paneer.jpeg";
import kadaiChickenImage from "../assets/curry/kadai.jpeg";
import vegBiryaniImage from "../assets/biriyani/veg.jpeg";
import chickenBiryaniImage from "../assets/hero/biryani-hero.png";
import mangoShakeImage from "../assets/shakes/mango.jpeg";
import grapesShakeImage from "../assets/shakes/grapes.jpeg";
import vegRiceImage from "../assets/rice/veg.jpeg";
import chickenFriedRiceImage from "../assets/rice/non.jpeg";
import chapathiImage from "../assets/roti/chapathi.jpeg";
import pulkaImage from "../assets/roti/pulka.jpeg";

export const menuCategories = [
  { label: "All", slug: "all" },
  { label: "Veg Starters", slug: "veg-starters" },
  { label: "Non-Veg Starters", slug: "non-veg-starters" },
  { label: "Noodles", slug: "noodles" },
  { label: "Curries", slug: "curries" },
  { label: "Biryani", slug: "biryani" },
  { label: "Shakes", slug: "shakes" },
  { label: "Rice Items", slug: "rice-items" },
  { label: "Rotis", slug: "rotis" },
];

export const menuItems = [
  {
    id: "veg-manchurian",
    name: "Veg Manchurian",
    category: "veg-starters",
    price: 59,
    description: "Crispy veg balls in a spicy glaze.",
    image: vegManchurianImage,
    accent: "#d35b1f",
  },
  {
    id: "veg-65",
    name: "Veg 65",
    category: "veg-starters",
    price: 79,
    description: "Golden fried veg bites with chili finish.",
    image: veg65Image,
    accent: "#c83d2b",
  },
  {
    id: "chicken-manchurian",
    name: "Chicken Manchurian",
    category: "non-veg-starters",
    price: 120,
    description: "Juicy chicken tossed in manchurian sauce.",
    image: chickenManchurianImage,
    accent: "#c91f25",
  },
  {
    id: "chicken-65",
    name: "Chicken 65",
    category: "non-veg-starters",
    price: 149,
    description: "Spicy fried chicken starter, crowd favorite.",
    image: chicken65Image,
    accent: "#ab2b1f",
  },
  {
    id: "chilli-chicken",
    name: "Chilli Chicken",
    category: "non-veg-starters",
    price: 149,
    description: "Crisp chicken in a tangy chili sauce.",
    image: chilliChickenImage,
    accent: "#9f1f1f",
  },
  {
    id: "veg-noodles",
    name: "Veg Noodles",
    category: "noodles",
    price: 70,
    description: "Light noodles with fresh veggies.",
    image: vegNoodlesImage,
    accent: "#3b8b4d",
  },
  {
    id: "egg-noodles",
    name: "Egg Noodles",
    category: "noodles",
    price: 80,
    description: "Classic noodles with scrambled egg.",
    image: eggNoodlesImage,
    accent: "#7b5a2f",
  },
  {
    id: "paneer-curry",
    name: "Paneer Curry",
    category: "curries",
    price: 139,
    description: "Soft paneer cubes in rich gravy.",
    image: paneerCurryImage,
    accent: "#d65c2e",
  },
  {
    id: "kadai-chicken",
    name: "Kadai Chicken",
    category: "curries",
    price: 139,
    description: "Homestyle chicken curry with kadai spice.",
    image: kadaiChickenImage,
    accent: "#ab2b1f",
  },
  {
    id: "veg-biryani",
    name: "Veg Biryani",
    category: "biryani",
    price: 89,
    description: "Fragrant vegetable biryani with royal masala.",
    image: vegBiryaniImage,
    accent: "#9f6b16",
  },
  {
    id: "chicken-dum-biryani",
    name: "Chicken Dum Biryani",
    category: "biryani",
    price: 99,
    description: "Aromatic dum biryani with royal flavors.",
    image: chickenBiryaniImage,
    accent: "#a96a1f",
  },
  {
    id: "mango-shake",
    name: "Mango Shake",
    category: "shakes",
    price: 79,
    description: "Fresh mango blended into a chilled shake.",
    image: mangoShakeImage,
    accent: "#c78614",
  },
  {
    id: "grapes-shake",
    name: "Grapes Shake",
    category: "shakes",
    price: 79,
    description: "Sweet grape shake served cool and creamy.",
    image: grapesShakeImage,
    accent: "#8a5aa6",
  },
  {
    id: "veg-rice",
    name: "Veg Rice",
    category: "rice-items",
    price: 59,
    description: "Simple veg rice with fresh seasoning.",
    image: vegRiceImage,
    accent: "#5f9d4e",
  },
  {
    id: "chicken-fried-rice",
    name: "Chicken Fried Rice",
    category: "rice-items",
    price: 89,
    description: "Stir-fried rice with tender chicken pieces.",
    image: chickenFriedRiceImage,
    accent: "#91643b",
  },
  {
    id: "chapathi",
    name: "Chapathi",
    category: "rotis",
    price: 10,
    description: "Soft, fresh chapathi served hot.",
    image: chapathiImage,
    accent: "#b66c34",
  },
  {
    id: "pulka",
    name: "Pulka",
    category: "rotis",
    price: 6,
    description: "Simple everyday pulka, light and soft.",
    image: pulkaImage,
    accent: "#be8a4f",
  },
];
