-- Rebrand leftovers from the clone. V2 seeded the storefront's own copy with the
-- cloned brand's domain and a collection slug carrying its name; V2 is already
-- applied everywhere, so repair forward rather than editing it.
--
-- Scope note: this touches only text LynxiGlam presents as its OWN (page copy,
-- our collection slug). It deliberately does NOT rewrite the attribution in
-- NOTICE/README or the research notes under docs/ — those state that the assets
-- and copy came from glamnetic.com, and rewriting them would turn a copyright
-- disclosure into a false claim of authorship.

-- 1. Our own page copy referred visitors to the cloned brand's domain.
UPDATE page_section_body
SET paragraph = REPLACE(paragraph, 'glamnetic.com', 'lynxiglam.com')
WHERE paragraph LIKE '%glamnetic.com%';

-- 2. The "Shop All" collection slug is a public URL
--    (/collections/shop-all-glamnetic-products).
--
--    collections.handle is the PK and product_collections.collection_handle is an
--    FK onto it with no ON UPDATE CASCADE, so a plain UPDATE on either table
--    alone breaks: renaming the parent orphans existing children, and repointing
--    children first references a handle that does not exist yet. Copy the row,
--    repoint the children, drop the original, then reclaim the slot — correct no
--    matter how many products currently sit in the collection.
--
--    `position` is UNIQUE, so the copy parks on a free slot until the old row is
--    gone. Capture the original value first; it is unreadable after the DELETE.
SET @old_position = (SELECT position FROM collections WHERE handle = 'shop-all-glamnetic-products');

INSERT INTO collections (handle, title, description, image, position)
SELECT 'shop-all-lynxiglam-products', title, description, image,
       (SELECT MAX(position) + 1 FROM collections c2)
FROM collections
WHERE handle = 'shop-all-glamnetic-products';

UPDATE product_collections
SET collection_handle = 'shop-all-lynxiglam-products'
WHERE collection_handle = 'shop-all-glamnetic-products';

DELETE FROM collections WHERE handle = 'shop-all-glamnetic-products';

UPDATE collections
SET position = @old_position
WHERE handle = 'shop-all-lynxiglam-products' AND @old_position IS NOT NULL;
