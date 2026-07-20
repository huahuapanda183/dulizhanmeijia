-- reviews.product_title / product_image are denormalized copies of the catalog.
-- Three seeded rows carried the wrong product's name (r1 'citrus-coast' was
-- labelled 'Galactic', r2 'la-perle' -> 'Oslo', r3 'aperitivo-hour' ->
-- 'Espresso Glow'), so the reviews page attributed each quote to the wrong item.
--
-- ContentService now reads the title from products and treats these columns as a
-- fallback for delisted products, but the stored values must still be truthful.
-- V2 is already applied everywhere, so repair forward rather than editing it.
UPDATE reviews r
JOIN products p ON p.handle = r.product_handle
SET r.product_title = p.title
WHERE r.product_title <> p.title;
