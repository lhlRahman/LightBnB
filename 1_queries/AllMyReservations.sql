SELECT reservations.id as id,
       properties.title as title,
       properties.cost_per_night as cost_per_night,
       reservations.start_date as start_date,
       AVG(property_reviews.rating) as average_rating
FROM property_reviews
JOIN reservations ON reservations.id = property_reviews.reservation_id
JOIN properties ON properties.id = property_reviews.property_id
WHERE reservations.guest_id = 1
GROUP BY reservations.id, properties.title, properties.cost_per_night, reservations.start_date
ORDER BY reservations.start_date
LIMIT 10;
