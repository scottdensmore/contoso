# Specification: Product Catalog Expansion

## Overview
This track aims to substantially increase the product variety in the "Contoso Outdoors" catalog. We will populate seven core categories with a randomized number of products (between 10 and 50 per category), generating realistic product data and high-quality images that align with the established brand aesthetic.

## Functional Requirements
- **Data Generation:**
    - Use AI to generate realistic product names, detailed descriptions, and technical specifications for the following categories:
        - Tents
        - Backpacks
        - Sleeping Bags
        - Hiking Boots
        - Clothing
        - Stoves
        - Tables
    - Ensure every product has all required fields (name, brand, category, price, description, features, specs, etc.).
- **Brand Generation:**
    - Create a diverse set of fictitious outdoor gear brands to simulate a realistic marketplace.
- **Image Generation:**
    - Generate at least one high-quality image per product.
    - Style: High contrast, vibrant colors, "in-action" usage contexts (e.g., a stove being used at a campsite, hiking boots on a rocky trail).
- **JSON Updates:**
    - Update `public/products.json`, `public/categories.json`, and `public/brands.json` with the new data.
    - Ensure total product count per category is randomized between 10 and 50.

## Acceptance Criteria
- [ ] `public/brands.json` contains the newly generated fictitious brands.
- [ ] `public/categories.json` includes the new categories (Clothing, Stoves, Tables).
- [ ] `public/products.json` contains the expanded product list (10-50 per category).
- [ ] New product images are generated and saved in `public/images/`.
- [ ] The database can be successfully seeded using `npm run seed` or equivalent.
- [ ] All new products are correctly associated with their categories and brands.

## Out of Scope
- Modifying the database schema or the Prisma model.
- Changes to the frontend UI components.
- Real-world stock management or real payment integration.
