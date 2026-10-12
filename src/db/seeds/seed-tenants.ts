import logger from '../../config/logger.js'
import { db } from '../index.js'
import { tenants } from '../schema.js'

const tenantSeedData = [
    {
        name: 'The Pizza Bakery - Indiranagar',
        address: '2985, 12th Main Road, HAL 2nd Stage, Bengaluru 560008',
    },
    {
        name: 'The Pizza Bakery - Church Street',
        address: '86, Spencer Building, Church Street, Bengaluru 560001',
    },
    {
        name: "Si Nonna's - St. Marks Road",
        address: 'Shop 5, Marksquare, St. Marks Road, Bengaluru 560001',
    },
    {
        name: 'Brik Oven - Church Street',
        address: '18, Church Street, Bengaluru 560001',
    },
    {
        name: "Si Nonna's - Indiranagar",
        address: 'Ground Floor, 100 Feet Road, Bengaluru 560038',
    },
    {
        name: 'Woods & Brixx Pizza',
        address: 'Safa Heights, JP Nagar 4th Phase, Bengaluru 560078',
    },
    {
        name: "Pizza 4P's - Indiranagar",
        address: '3275/A, 12th Main Road, Bengaluru 560008',
    },
    {
        name: 'PizzaExpress - Koramangala',
        address: '136, 1st Cross Road, Koramangala, Bengaluru 560095',
    },
    {
        name: 'Brik Oven - Indiranagar',
        address: '872/A, 80 Feet Road, Bengaluru 560075',
    },
    {
        name: 'PizzaExpress - Indiranagar',
        address: '952, 12th Main Road, Bengaluru 560008',
    },
    {
        name: 'Milano Pizza',
        address: '50, 100 Feet Road, Indiranagar, Bengaluru 560038',
    },
    {
        name: 'Tottos Pizza',
        address: '5th Avenue Mall, Brigade Road, Bengaluru 560001',
    },
    {
        name: 'PizzaExpress - Orion Mall',
        address: 'Orion Mall, Dr Rajkumar Road, Bengaluru 560055',
    },
    {
        name: 'Brik Oven - Palace Road',
        address: 'Prestige Trade Tower, Palace Road, Bengaluru 560001',
    },
    {
        name: 'Brik Oven - Koramangala',
        address: '80 Feet Road, Koramangala, Bengaluru 560034',
    },
    {
        name: 'Pepperoni House',
        address: '24, 5th Main Road, Indiranagar, Bengaluru 560038',
    },
    {
        name: 'Crust & Cheese Pizzeria',
        address: '18, 80 Feet Road, Koramangala, Bengaluru 560034',
    },
    {
        name: 'OvenCraft Pizza',
        address: '42, 27th Main Road, HSR Layout, Bengaluru 560102',
    },
    {
        name: 'Urban Slice Pizza',
        address: '11, 100 Feet Road, BTM Layout, Bengaluru 560076',
    },
    {
        name: 'Firewood Pizza Kitchen',
        address: '7, Residency Road, Bengaluru 560025',
    },
    {
        name: 'Dough District',
        address: '33, 12th Main Road, Jayanagar, Bengaluru 560011',
    },
    {
        name: 'Bella Napoli Pizza',
        address: '15, CMH Road, Indiranagar, Bengaluru 560038',
    },
    {
        name: 'Cheesy Wheel Pizzeria',
        address: '21, Sarjapur Road, Bengaluru 560035',
    },
    {
        name: 'Rustic Oven Pizza',
        address: '9, Whitefield Main Road, Bengaluru 560066',
    },
    {
        name: 'The Pizza Foundry',
        address: '16, New BEL Road, Bengaluru 560054',
    },
]

async function seedTenants() {
    try {
        await db.insert(tenants).values(tenantSeedData)
        logger.info('tenats has been seeded')
    } catch (error) {
        logger.error('error while seeding tenants', error)
        process.exitCode = 1
    } finally {
        // Close your database connection here if your db module
        // exposes a PostgreSQL pool, for example: await pool.end()
    }
}

seedTenants()
