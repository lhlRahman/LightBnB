const properties = require("./json/properties.json");
const users = require("./json/users.json");
const { Pool } = require("pg");

const pool = new Pool({
  user: 'labber',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return pool.query(`SELECT * FROM users WHERE email = $1`, [email])
  .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
return pool.query(`SELECT * FROM users WHERE id = $1`, [id])
 .then((result) => {
      return result.rows[0];
    })
  .catch((err) => {
      console.log(err);
    });
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  return pool.query(`INSERT INTO users (name, password, email) VALUES ($1, $2, $3) RETURNING *`, [user.name, user.password, user.email])
  .then((result) => {
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err);
    });
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
return pool.query(`SELECT reservations.id as id,
properties.title as title,
properties.cost_per_night as cost_per_night,
reservations.start_date as start_date,
AVG(property_reviews.rating) as average_rating
FROM property_reviews
JOIN reservations ON reservations.id = property_reviews.reservation_id
JOIN properties ON properties.id = property_reviews.property_id
WHERE reservations.guest_id = $1
GROUP BY reservations.id, properties.title, properties.cost_per_night, reservations.start_date
ORDER BY reservations.start_date
LIMIT $2;`, [guest_id, limit])
.then((result) => {
      return result.rows;
    })
  .catch((err) => {
    console.log(err);
  });

};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  const queryParams = [];
  let queryString = `
    SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    LEFT JOIN property_reviews ON properties.id = property_id
  `;

  // An array to hold each condition for our WHERE clause
  const whereClauses = [];

  // If city is provided
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    whereClauses.push(`city LIKE $${queryParams.length}`);
  }

  // If owner_id is provided
  if (options.owner_id) {
    queryParams.push(options.owner_id);
    whereClauses.push(`owner_id = $${queryParams.length}`);
  }

  // If minimum_price_per_night and maximum_price_per_night are provided
  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(Number(options.minimum_price_per_night) * 100); // Convert dollars to cents
    queryParams.push(Number(options.maximum_price_per_night) * 100); // Convert dollars to cents
    whereClauses.push(`cost_per_night BETWEEN $${queryParams.length - 1} AND $${queryParams.length}`);
  }

  // If minimum_rating is provided
  if (options.minimum_rating) {
    queryParams.push(Number(options.minimum_rating));
    whereClauses.push(`property_reviews.rating >= $${queryParams.length}`);
  }

  // If there are any where clauses, prepend the word 'WHERE' and join the clauses with 'AND'
  if (whereClauses.length) {
    queryString += ` WHERE ${whereClauses.join(' AND ')}`;
  }

  // Continue building the query string
  queryParams.push(limit);
  queryString += `
    GROUP BY properties.id
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
  `;

  // Execute the query
  return pool.query(queryString, queryParams).then((res) => {
    return res.rows
  });
};



/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};


module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
