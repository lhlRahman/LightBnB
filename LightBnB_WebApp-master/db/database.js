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
    console.log(result.rows[0]);
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
  console.log(result.rows);
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
const getAllProperties = (options, limit = 10) => {
  return pool
    .query(`SELECT * FROM properties LIMIT $1`, [limit])
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
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


getAllReservations(1, 7);

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
