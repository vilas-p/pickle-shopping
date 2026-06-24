-- V2: Seed catalog data (roles, categories, products, inventory, reviews)

INSERT INTO roles (name, created_at, updated_at) VALUES
  ('ROLE_ADMIN',    NOW(6), NOW(6)),
  ('ROLE_STAFF',    NOW(6), NOW(6)),
  ('ROLE_CUSTOMER', NOW(6), NOW(6));

INSERT INTO categories (name, slug, description, active, created_at, updated_at) VALUES
  ('Mango',        'mango',        'Sun-ripened mango pickles from our village trees.',         b'1', NOW(6), NOW(6)),
  ('Lemon',        'lemon',        'Tangy, slow-cured lemon pickles in cold-pressed oil.',      b'1', NOW(6), NOW(6)),
  ('Bitter Gourd', 'bitter-gourd', 'Earthy, slow-fried bitter gourd pickles — Amma''s recipe.', b'1', NOW(6), NOW(6));

INSERT INTO products
  (name, slug, short_description, description, ingredients, shelf_life, price, compare_at_price, weight, category_id, active, featured, created_at, updated_at)
VALUES
  ('Traditional Mango Pickle (Avakaya)',
   'traditional-mango-pickle',
   'Spicy, oil-rich raw mango pickle from our village kitchen — the way Amma has made it for 30 years.',
   'Made from hand-picked raw mangoes, ground mustard, red chilli powder, fenugreek and cold-pressed sesame oil. Sun-cured for 5 days. Bold, tangy and fiery — perfect with hot rice and ghee.',
   'Raw Mango, Red Chilli Powder, Mustard Powder, Fenugreek, Salt, Asafoetida, Cold-Pressed Sesame Oil',
   '12 months when refrigerated; 6 months at room temperature.',
   299.00, 349.00, '500g',
   (SELECT id FROM categories WHERE slug = 'mango'),
   b'1', b'1', NOW(6), NOW(6)),

  ('Sweet & Spicy Lemon Pickle',
   'sweet-spicy-lemon-pickle',
   'Slow-cured lemon pickle with a sweet-and-spicy finish — naturally fermented for 21 days.',
   'Whole lemons salted and slow-cured under the sun, blended with jaggery, red chilli and Indian spices. A versatile pickle that pairs with curd rice, paratha, dal, or just a humble bowl of khichdi.',
   'Lemon, Jaggery, Red Chilli, Mustard, Fenugreek, Asafoetida, Salt, Cold-Pressed Mustard Oil',
   '12 months at room temperature.',
   249.00, 279.00, '500g',
   (SELECT id FROM categories WHERE slug = 'lemon'),
   b'1', b'1', NOW(6), NOW(6)),

  ('Bitter Gourd Pickle (Karela)',
   'bitter-gourd-pickle',
   'Slow-fried bitter gourd pickle with jaggery, tamarind and roasted spices. Bold and unforgettable.',
   'Hand-cut bitter gourd, slow-fried in cold-pressed oil and tossed with tamarind, jaggery and a blend of roasted Andhra spices. Surprisingly addictive — a personal favourite of Appa.',
   'Bitter Gourd, Tamarind, Jaggery, Red Chilli, Mustard, Cumin, Salt, Cold-Pressed Groundnut Oil',
   '6 months when refrigerated.',
   329.00, NULL, '400g',
   (SELECT id FROM categories WHERE slug = 'bitter-gourd'),
   b'1', b'1', NOW(6), NOW(6));

-- Primary images (placeholder URLs — replace before production)
INSERT INTO product_images (product_id, url, alt_text, display_order, `primary`, created_at, updated_at)
SELECT id, '/images/products/mango-pickle-1.png', 'Jar of traditional mango pickle', 0, b'1', NOW(6), NOW(6)
FROM products WHERE slug = 'traditional-mango-pickle';

INSERT INTO product_images (product_id, url, alt_text, display_order, `primary`, created_at, updated_at)
SELECT id, '/images/products/lemon-pickle-1.png', 'Jar of sweet & spicy lemon pickle', 0, b'1', NOW(6), NOW(6)
FROM products WHERE slug = 'sweet-spicy-lemon-pickle';

INSERT INTO product_images (product_id, url, alt_text, display_order, `primary`, created_at, updated_at)
SELECT id, '/images/products/bitter-gourd-pickle-1.png', 'Jar of bitter gourd pickle', 0, b'1', NOW(6), NOW(6)
FROM products WHERE slug = 'bitter-gourd-pickle';

-- Inventory rows for each product
INSERT INTO inventory (product_id, quantity_available, reorder_level, batch_code, created_at, updated_at)
SELECT id, 100, 15, 'BATCH-2025-001', NOW(6), NOW(6) FROM products;

-- Sample approved reviews
INSERT INTO reviews (product_id, author_name, author_city, rating, title, body, approved, created_at, updated_at)
SELECT id, 'Lakshmi Iyer', 'Chennai', 5, 'Tastes just like my grandmother''s!',
       'I ordered the mango pickle and one bite took me back to my childhood. The oil, the spices, the kick — everything is perfect. Will reorder for sure.',
       b'1', NOW(6), NOW(6)
FROM products WHERE slug = 'traditional-mango-pickle';

INSERT INTO reviews (product_id, author_name, author_city, rating, title, body, approved, created_at, updated_at)
SELECT id, 'Arjun Reddy', 'Hyderabad', 5, 'Lemon pickle is fantastic',
       'Sweet, spicy, sour — all in one bite. Goes brilliantly with curd rice. Packaging was also very neat.',
       b'1', NOW(6), NOW(6)
FROM products WHERE slug = 'sweet-spicy-lemon-pickle';

INSERT INTO reviews (product_id, author_name, author_city, rating, title, body, approved, created_at, updated_at)
SELECT id, 'Priya Menon', 'Bengaluru', 4, 'Surprisingly love the karela!',
       'I was sceptical about bitter gourd pickle but this is so well-balanced. The jaggery cuts the bitterness beautifully.',
       b'1', NOW(6), NOW(6)
FROM products WHERE slug = 'bitter-gourd-pickle';
