# Swagger API Documentation Setup

## Overview
Swagger API documentation has been successfully set up for the LipaBnb Laravel backend using L5-Swagger.

## Access Swagger UI

Once your Laravel application is running, you can access the Swagger documentation at:

```
http://localhost:8000/api/documentation
```

## Configuration

### Config File
The Swagger configuration is located at: `config/l5-swagger.php`

### Main Settings
- **Title**: LipaBnb API Documentation
- **Route**: `/api/documentation`
- **Documentation Format**: JSON (default)

## Generating Documentation

To regenerate the Swagger documentation after making changes to your API controllers:

```bash
php artisan l5-swagger:generate
```

## Adding Swagger Annotations

### Example Controller with Annotations

The `App\Http\Controllers\Api\UserController` has been created as an example with full Swagger annotations.

### Basic Annotation Structure

```php
use OpenApi\Attributes as OA;

#[OA\Get(
    path: "/api/users",
    summary: "Get list of users",
    tags: ["Users"],
    responses: [
        new OA\Response(
            response: 200,
            description: "Successful response"
        ),
    ]
)]
public function index()
{
    // Your code here
}
```

## API Routes

API routes are defined in `routes/api.php`:

- `GET /api/health` - Health check endpoint
- `GET /api/users` - List users (requires authentication)
- `GET /api/users/{id}` - Get user by ID (requires authentication)
- `PUT /api/users/{id}` - Update user (requires authentication)
- `DELETE /api/users/{id}` - Delete user (requires authentication)

## Authentication

Currently, API routes use Laravel's default `auth` middleware. To use token-based authentication (e.g., Sanctum), you would need to:

1. Install Laravel Sanctum:
   ```bash
   composer require laravel/sanctum
   ```

2. Update routes to use `auth:sanctum` middleware

3. Update Swagger security scheme in `Controller.php`

## Adding More API Endpoints

1. Create a controller in `app/Http/Controllers/Api/`
2. Add Swagger annotations using OpenAPI attributes
3. Add routes in `routes/api.php`
4. Run `php artisan l5-swagger:generate` to update documentation

## Documentation Structure

- **Base Controller**: `app/Http/Controllers/Controller.php` contains global API info and security schemes
- **API Controllers**: `app/Http/Controllers/Api/` contains API-specific controllers
- **Schemas**: Defined in controller annotations or base controller

## Troubleshooting

### Documentation not updating?
Run: `php artisan l5-swagger:generate`

### Routes not showing?
- Check that routes are in `routes/api.php`
- Verify `bootstrap/app.php` includes API routes
- Clear route cache: `php artisan route:clear`

### Annotations not working?
- Ensure you're using PHP 8.1+ (attributes require PHP 8.0+)
- Check that annotations are properly formatted
- Verify namespace imports: `use OpenApi\Attributes as OA;`

