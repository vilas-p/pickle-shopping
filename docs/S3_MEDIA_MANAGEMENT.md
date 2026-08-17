# S3 Media Management — Architecture & Operations Guide

## 1. Architecture Overview

```
┌─────────────────────────┐
│   Admin Browser (Next.js) │
│   /admin/media            │
│   /admin/products         │
└───────────┬──────────────┘
            │ multipart/form-data (JWT Bearer)
            ▼
┌─────────────────────────────────────────────┐
│   Spring Boot Backend                        │
│   /api/v1/admin/media/*      (ADMIN only)    │
│   /api/v1/admin/products/{id}/images/*       │
│   /api/v1/media/banners      (public)        │
│   /api/v1/media/site         (public)        │
└───────────┬───────────────┬─────────────────┘
            │               │
            ▼               ▼
┌────────────────┐   ┌─────────────────────────────────────────────────┐
│  MySQL DB       │   │  S3: appaammaspickles-assets-721730271019       │
│  media table    │   │  Region: ap-south-1                             │
│  product_images │   │  ├── banners/                                   │
└────────────────┘   │  ├── products/{slug}/{uuid}.ext                  │
                      │  ├── thumbnails/                                 │
            ▼         │  ├── hero/                                       │
┌────────────────┐   │  ├── about/                                      │
│ Customer Browser│   │  ├── logo/                                       │
│ (read-only)    │   │  └── general/                                    │
└────────────────┘   └─────────────────────────────────────────────────┘
```

## 2. S3 Bucket Structure

| Prefix | Purpose | Access |
|--------|---------|--------|
| `banners/` | Hero banners, promotional images | Public read |
| `products/` | Product images organized by `{date}/{slug}/{uuid}` | Public read |
| `thumbnails/` | Generated thumbnails (future) | Public read |
| `hero/` | Homepage hero images | Public read |
| `about/` | About page images | Public read |
| `logo/` | Brand logos | Public read |
| `general/` | Miscellaneous assets | Public read |

**Bucket Name**: `appaammaspickles-assets-721730271019-ap-south-1-an`
**Region**: `ap-south-1` (Mumbai)

## 3. AWS Setup

### IAM Policy (Minimum Permissions)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3MediaManagement",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:HeadObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::appaammaspickles-assets-721730271019-ap-south-1-an",
        "arn:aws:s3:::appaammaspickles-assets-721730271019-ap-south-1-an/*"
      ]
    }
  ]
}
```

### S3 Bucket Policy (Public Read for Media)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadMedia",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": [
        "arn:aws:s3:::appaammaspickles-assets-721730271019-ap-south-1-an/banners/*",
        "arn:aws:s3:::appaammaspickles-assets-721730271019-ap-south-1-an/products/*",
        "arn:aws:s3:::appaammaspickles-assets-721730271019-ap-south-1-an/thumbnails/*",
        "arn:aws:s3:::appaammaspickles-assets-721730271019-ap-south-1-an/hero/*",
        "arn:aws:s3:::appaammaspickles-assets-721730271019-ap-south-1-an/about/*",
        "arn:aws:s3:::appaammaspickles-assets-721730271019-ap-south-1-an/logo/*",
        "arn:aws:s3:::appaammaspickles-assets-721730271019-ap-south-1-an/general/*"
      ]
    }
  ]
}
```

### Production Recommendation

For production on AWS (ECS/EC2/Lambda), use **IAM Roles** instead of static credentials:
- Attach the IAM policy above to the task/instance role
- Remove `APP_STORAGE_S3_ACCESS_KEY` and `APP_STORAGE_S3_SECRET_KEY` 
- The AWS SDK will automatically use the instance metadata credentials

## 4. Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `APP_STORAGE_S3_BUCKET` | S3 bucket name | Yes |
| `APP_STORAGE_S3_REGION` | AWS region (default: ap-south-1) | Yes |
| `APP_STORAGE_S3_ACCESS_KEY` | AWS access key ID | Yes (dev) |
| `APP_STORAGE_S3_SECRET_KEY` | AWS secret access key | Yes (dev) |
| `APP_STORAGE_S3_ENDPOINT_URL` | Custom S3 endpoint (MinIO, etc.) | No |
| `APP_STORAGE_S3_PUBLIC_BASE_URL` | CDN/custom URL prefix | No |
| `APP_STORAGE_S3_PRODUCT_PREFIX` | Prefix for product media (default: products) | No |
| `APP_STORAGE_S3_MAX_FILE_SIZE_BYTES` | Max upload size (default: 52428800 = 50MB) | No |

### Local Development (.env or env vars)

```bash
APP_STORAGE_S3_BUCKET=appaammaspickles-assets-721730271019-ap-south-1-an
APP_STORAGE_S3_REGION=ap-south-1
APP_STORAGE_S3_ACCESS_KEY=AKIA...
APP_STORAGE_S3_SECRET_KEY=...
```

**NEVER commit these values to Git.**

## 5. Backend Implementation

### Key Classes

| Class | Package | Purpose |
|-------|---------|---------|
| `S3StorageService` | `service.storage` | Core S3 operations (upload, delete, exists, getUrl) |
| `MediaService` | `api.v1.admin.media` | Business logic for media CRUD |
| `MediaController` | `api.v1.admin.media` | Admin REST endpoints for media |
| `ProductImageController` | `api.v1.admin.media` | Admin endpoints for product images |
| `PublicMediaController` | `api.v1.media` | Public endpoints for banners/site media |
| `Media` (Entity) | `domain.media` | JPA entity for the `media` table |
| `MediaRepository` | `domain.media` | Spring Data JPA repository |
| `ProductImageRepository` | `domain.product` | Repository for product_images |

### Upload Flow

1. Admin sends multipart file + metadata to backend
2. `S3StorageService` validates file (type, size, content type)
3. Generates UUID-based S3 key: `{prefix}/{yyyy/MM}/{slug}/{uuid}.{ext}`
4. Uploads to S3 via AWS SDK v2
5. Saves metadata to `media` or `product_images` table
6. Returns the public URL and metadata

## 6. Database Changes

### New Table: `media`

```sql
CREATE TABLE media (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    original_filename VARCHAR(255) NOT NULL,
    s3_key VARCHAR(500) NOT NULL UNIQUE,
    url VARCHAR(500) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    media_type VARCHAR(16) NOT NULL DEFAULT 'IMAGE',
    file_size BIGINT NOT NULL,
    category VARCHAR(50) NOT NULL,
    product_id BIGINT NULL,
    alt_text VARCHAR(200),
    display_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    uploaded_by BIGINT NULL,
    created_at DATETIME(6),
    updated_at DATETIME(6)
);
```

### Modified Table: `product_images`

Added column: `s3_key VARCHAR(500)` — stores S3 object key for deletion support.

Migration: `V14__media_management.sql`

## 7. API Documentation

### Admin Media APIs (requires ADMIN JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/admin/media/upload` | Upload media (multipart: file, category, altText, productId, displayOrder) |
| GET | `/api/v1/admin/media` | List all media (optional ?category=BANNER) |
| GET | `/api/v1/admin/media/{id}` | Get media by ID |
| PUT | `/api/v1/admin/media/{id}` | Update metadata (altText, displayOrder, active) |
| DELETE | `/api/v1/admin/media/{id}` | Delete media from S3 and DB |

### Admin Product Image APIs (requires ADMIN JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/admin/products/{productId}/images` | Upload image for a product |
| GET | `/api/v1/admin/products/{productId}/images` | List product images |
| DELETE | `/api/v1/admin/products/{productId}/images/{imageId}` | Delete product image |
| PUT | `/api/v1/admin/products/{productId}/images/{imageId}/primary` | Set primary image |
| PUT | `/api/v1/admin/products/{productId}/images/reorder` | Reorder images (body: [imageId, ...]) |

### Public Media APIs (no auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/media/banners` | Active banners |
| GET | `/api/v1/media/site?category=HERO` | Site media by category |

### Upload Request Example

```bash
curl -X POST http://localhost:8080/api/v1/admin/media/upload \
  -H "Authorization: Bearer <ADMIN_JWT>" \
  -F "file=@banner.jpg" \
  -F "category=BANNER" \
  -F "altText=Summer promotion banner"
```

### Response Example

```json
{
  "success": true,
  "data": {
    "id": 1,
    "originalFilename": "banner.jpg",
    "s3Key": "banners/2026/08/abc123-uuid.jpg",
    "url": "https://appaammaspickles-assets-721730271019-ap-south-1-an.s3.ap-south-1.amazonaws.com/banners/2026/08/abc123-uuid.jpg",
    "contentType": "image/jpeg",
    "mediaType": "IMAGE",
    "fileSize": 245760,
    "category": "BANNER",
    "productId": null,
    "altText": "Summer promotion banner",
    "displayOrder": 0,
    "active": true,
    "uploadedBy": null,
    "createdAt": "2026-08-10T10:30:00Z",
    "updatedAt": "2026-08-10T10:30:00Z"
  }
}
```

## 8. Admin UI Usage

### Media Library (`/admin/media`)

- **Upload**: Select category, choose file, optionally add alt text, click Upload
- **View**: Browse all media in a grid, filter by category
- **Activate/Deactivate**: Toggle visibility on storefront
- **Delete**: Permanently removes from S3 and database

### Product Images (`/admin/products`)

- Select a product from the grid
- Upload images directly associated with that product
- Set primary image (shown in cards/listings)
- Delete images individually
- Images auto-ordered by upload order

## 9. Upload Process

1. Admin selects file in the UI
2. Frontend sends multipart POST to backend with JWT
3. Backend validates: file type (JPEG/PNG/WebP/GIF/AVIF/SVG for images; MP4/WebM for video), file size (≤50MB)
4. Generates unique S3 key with UUID (prevents collisions and filename attacks)
5. Uploads to S3 with correct content-type header
6. Saves metadata record in database
7. Returns public URL to frontend

## 10. Delete Process

1. Admin clicks Delete in UI
2. Frontend confirms with the admin
3. Sends DELETE request to backend
4. Backend loads media record from DB
5. Calls S3 DeleteObject with the stored s3_key
6. Deletes database record
7. Returns success

## 11. Product Image Management

- Products load their images from `product_images` table via the existing Product API
- Admin uploads images via `/admin/products/{id}/images`
- Each upload stores both the S3 URL and the S3 key in `product_images`
- Primary image is used in product cards and SEO
- Display order controls gallery sequence
- Deleting a product image also deletes the S3 object

## 12. Banner Management

- Banners are stored in the `media` table with `category='BANNER'`
- Upload via the general media upload with `category=BANNER`
- Frontend loads active banners via `GET /api/v1/media/banners`
- `display_order` controls banner sequence
- `is_active` controls visibility on storefront

## 13. Video Management

- Videos follow the same upload flow as images
- Supported formats: MP4, WebM
- `media_type` is set to `VIDEO` automatically based on content type
- Frontend renders `<video>` tags for VIDEO media type
- Max upload size: 50MB (configurable via `APP_STORAGE_S3_MAX_FILE_SIZE_BYTES`)

## 14. Security

| Concern | Implementation |
|---------|---------------|
| Upload authorization | `@PreAuthorize("hasRole('ADMIN')")` |
| Customer access | Read-only via public APIs; 403 for any mutation |
| Credential storage | Environment variables only |
| File naming | UUID-based keys; original filename never used as S3 key |
| Content type validation | Whitelist of allowed MIME types |
| Size validation | Server-side limit (default 50MB) |
| Filename sanitization | Extension extracted and sanitized; max 10 chars |
| S3 bucket access | Bucket policy allows public read; writes require IAM credentials |

## 15. Local Development Setup

1. Set up S3 credentials in environment or `.env`:
   ```
   APP_STORAGE_S3_BUCKET=appaammaspickles-assets-721730271019-ap-south-1-an
   APP_STORAGE_S3_REGION=ap-south-1
   APP_STORAGE_S3_ACCESS_KEY=your-access-key
   APP_STORAGE_S3_SECRET_KEY=your-secret-key
   ```

2. Run MySQL with the Flyway migrations (V14 will create the `media` table)

3. Start backend: `./gradlew bootRun`

4. Start frontend: `npm run dev`

5. Log into admin: `/admin/login`

6. Navigate to `/admin/media` to upload media

### Using MinIO Locally (Optional)

Set `APP_STORAGE_S3_ENDPOINT_URL=http://localhost:9000` to use MinIO as a local S3-compatible store.

## 16. Production Deployment

### Railway / Docker

Add environment variables to your deployment:
```
APP_STORAGE_S3_BUCKET=appaammaspickles-assets-721730271019-ap-south-1-an
APP_STORAGE_S3_REGION=ap-south-1
APP_STORAGE_S3_ACCESS_KEY=<from secrets manager>
APP_STORAGE_S3_SECRET_KEY=<from secrets manager>
```

### AWS ECS/EC2

Prefer IAM roles:
1. Create an IAM role with the S3 policy above
2. Attach to your ECS task definition or EC2 instance profile
3. Remove access key/secret key environment variables
4. The AWS SDK auto-discovers credentials from instance metadata

## 17. Migration of Existing Images

### Strategy

Existing images are stored in `frontend/public/images/` and referenced from:
- `product_images` table (relative URLs like `/images/products/mango-pickle.jpg`)
- Frontend pages (hardcoded paths)

### Migration Steps

1. Upload each existing image to S3 via the admin UI or a migration script
2. Create corresponding `media` table records for site assets (hero, about, etc.)
3. Update `product_images.url` values from relative paths to S3 URLs
4. Verify all images load correctly from S3
5. The frontend pages have fallbacks — they will use S3 URLs when media records exist, or fall back to static paths

### Migration SQL (after uploading to S3)

```sql
-- Example: update product images to point to S3 URLs
UPDATE product_images 
SET url = 'https://appaammaspickles-assets-721730271019-ap-south-1-an.s3.ap-south-1.amazonaws.com/products/mango-pickle/image.jpg',
    s3_key = 'products/mango-pickle/image.jpg'
WHERE url = '/images/products/mango-pickle.jpg';
```

## 18. Troubleshooting

| Issue | Solution |
|-------|----------|
| "S3 storage is not configured" | Check `APP_STORAGE_S3_BUCKET`, `ACCESS_KEY`, `SECRET_KEY` are set |
| Upload returns 403 | Check IAM permissions; verify bucket name matches |
| Images not loading on frontend | Check S3 bucket policy allows public read; verify URL format |
| "File exceeds maximum upload size" | Increase `APP_STORAGE_S3_MAX_FILE_SIZE_BYTES` or Spring's `spring.servlet.multipart.max-file-size` |
| CORS errors on image load | S3 bucket needs CORS configuration for the frontend origin |
| Admin gets 401 on upload | JWT expired; re-login to admin |

### S3 CORS Configuration

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET"],
    "AllowedOrigins": ["https://appaammas.in", "http://localhost:3000"],
    "ExposeHeaders": [],
    "MaxAgeSeconds": 3600
  }
]
```

## 19. Testing Instructions

### Backend Tests

```bash
cd backend
./gradlew test
```

Key test areas:
- `S3StorageService`: file validation, key generation, MIME type resolution
- `MediaService`: upload, list, delete, update
- `MediaController`: authorization (admin vs. customer vs. anonymous)
- `ProductImageController`: product association, reorder, primary setting

### Frontend Tests

```bash
cd frontend
npm test
```

Key test areas:
- `AdminMediaLibrary`: upload flow, error states, listing
- `ProductImageManager`: upload, delete, set primary
- `publicMediaApi`: banner loading, cache behavior

### Manual Verification

1. Log in as admin at `/admin/login`
2. Navigate to `/admin/media`
3. Upload a banner image → verify it appears in the grid
4. Toggle active/inactive → verify state changes
5. Delete media → verify removed from S3 (check AWS console)
6. Navigate to `/admin/products` → select a product → upload image
7. Visit the product page → verify image loads from S3
8. Visit homepage → verify hero/banner loads

## 20. Media Categories

| Category | Purpose | Where Displayed |
|----------|---------|-----------------|
| `BANNER` | Promotional banners | Homepage carousel (future), marketing sections |
| `HERO` | Homepage hero images | Hero section on homepage |
| `ABOUT` | About page imagery | About us page |
| `LOGO` | Brand logos | Header, footer, favicon |
| `PRODUCT` | General product media (via media table) | Product pages |
| `GENERAL` | Miscellaneous | Various pages |

Product-specific images use the `product_images` table directly via the Product Image API.
