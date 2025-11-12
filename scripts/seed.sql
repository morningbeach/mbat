-- Category
INSERT OR IGNORE INTO categories (id, name, slug, sort)
VALUES ('cat-rigid', 'Rigid Gift Boxes', 'rigid-box', 1);

-- Product
INSERT OR IGNORE INTO products (id, category_id, name, slug, short_desc, hero_image, status)
VALUES ('p-mrb-001','cat-rigid','磁扣硬盒 (Magnetic Rigid Box)','magnetic-rigid-box','經典精品禮盒結構，適合中高階禮贈','/img/rigid1.jpg','active');

-- Variant
INSERT OR IGNORE INTO variants (id, product_id, sku, size_l, size_w, size_h, base_material, min_order_qty, lead_time_days, status)
VALUES ('v-mrb-001','p-mrb-001','RB-001',30,20,8,'157g銅版+1200g灰板',100,14,'active');
