// Location and Title arrays for property search
const LOCATIONS = [
    'Bahria Town Rawalpindi',
    'PWD Islamabad',
    'Islamabad', 
    
]

const PROPERTY_TITLES = [
    'Office for Rent',
    '',
    'Commercial office for rent',
    'Office Space for Rent',
    'Warehouse'
    
]


// Command to get random location from array
// Cypress.Commands.add('getRandomLocation', () => {
//     return LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
// })

// // Command to get random property title from array
// Cypress.Commands.add('getRandomPropertyTitle', () => {
//     return PROPERTY_TITLES[Math.floor(Math.random() * LOCATIONS.length)]
// })

// // Command to get specific location by index
// Cypress.Commands.add('getLocationByIndex', (index) => {
//     return LOCATIONS[index] || LOCATIONS[0]
// })

// // Command to get specific property title by index
// Cypress.Commands.add('getPropertyTitleByIndex', (index) => {
//     return PROPERTY_TITLES[index] || PROPERTY_TITLES[0]
// })

export { LOCATIONS, PROPERTY_TITLES }

