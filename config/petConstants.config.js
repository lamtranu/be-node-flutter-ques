//FOOD PET
export const FAVORITE_FOODS = ["Táo", "Cà rốt", "Bánh mì"];

export const SELECTED_RECEIVED_FOODS = [
    { name: "Táo", exp: 10}, 
    { name: "Bánh mì", exp: 15},
    { name: "Cà rốt", exp: 8}
];

export function getFoodByName(foodName) {
    return SELECTED_RECEIVED_FOODS.find(food => food.name === foodName) || null;
}

//PET
export const PET_TYPE_FREE = ["penguin", "chicken"];
export const PET_NAME_FREE = ["Cánh cụt", "Gà nhà"];

export const PET_RECEIVED_VIDEO_REWARD = [
    { name: "Bò lạc", type: 'bull'}, 
    { name: "Pug xệ", type: 'pug'}, 
    { name: "Vịt zời", type: 'duck'}, 
]

export function getPetReceivedVideoRewardByName(typePet) {
    return PET_RECEIVED_VIDEO_REWARD.find(pet => pet.type === typePet) || null;
}