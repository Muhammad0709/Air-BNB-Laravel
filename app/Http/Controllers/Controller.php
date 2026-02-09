<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    title: "LipaBnb API",
    description: "API documentation for LipaBnb application"
)]
#[OA\Server(
    url: "/",
    description: "Current server (API requests use the same domain as this page)"
)]
#[OA\SecurityScheme(
    securityScheme: "apiAuth",
    type: "http",
    name: "Authorization",
    in: "header",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Enter your bearer token in the format: Bearer {token}"
)]
#[OA\Schema(
    schema: "User",
    type: "object",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "name", type: "string", example: "John Doe"),
        new OA\Property(property: "email", type: "string", format: "email", example: "john@example.com"),
        new OA\Property(property: "type", type: "string", enum: ["User", "Admin", "Host"], example: "User"),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time"),
    ]
)]
#[OA\Schema(
    schema: "Property",
    type: "object",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "title", type: "string", example: "Luxury Beachfront Villa"),
        new OA\Property(property: "location", type: "string", example: "Malibu, California"),
        new OA\Property(property: "price", type: "number", format: "float", example: 299.00),
        new OA\Property(property: "bedrooms", type: "integer", example: 3),
        new OA\Property(property: "bathrooms", type: "integer", example: 2),
        new OA\Property(property: "guests", type: "integer", example: 6),
        new OA\Property(property: "property_type", type: "string", enum: ["apartment", "house", "villa", "studio", "condo"], example: "villa"),
        new OA\Property(property: "status", type: "string", enum: ["Pending", "Active", "Inactive"], example: "Active"),
        new OA\Property(property: "description", type: "string", example: "Beautiful beachfront villa with stunning ocean views"),
        new OA\Property(property: "amenities", type: "array", items: new OA\Items(type: "string"), example: ["WiFi", "Pool", "Parking"]),
        new OA\Property(property: "image", type: "string", format: "uri", example: "http://localhost:8000/storage/properties/image.jpg"),
        new OA\Property(property: "user_id", type: "integer", example: 1),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time"),
    ]
)]
#[OA\Schema(
    schema: "HostProperty",
    type: "object",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "title", type: "string", example: "Luxury Beachfront Villa"),
        new OA\Property(property: "location", type: "string", example: "Malibu, California"),
        new OA\Property(property: "price", type: "number", format: "float", example: 299.00),
        new OA\Property(property: "bedrooms", type: "integer", example: 3),
        new OA\Property(property: "bathrooms", type: "integer", example: 2),
        new OA\Property(property: "guests", type: "integer", example: 6),
        new OA\Property(property: "property_type", type: "string", enum: ["apartment", "house", "villa", "studio", "condo"], example: "villa"),
        new OA\Property(property: "status", type: "string", enum: ["Pending", "Active", "Inactive"], example: "Active"),
        new OA\Property(property: "approval_status", type: "string", enum: ["Pending", "Approved", "Rejected"], example: "Pending"),
        new OA\Property(property: "description", type: "string", example: "Beautiful beachfront villa with stunning ocean views"),
        new OA\Property(property: "image", type: "string", format: "uri", example: "http://localhost:8000/storage/properties/image.jpg"),
        new OA\Property(property: "bookings_count", type: "integer", example: 45),
        new OA\Property(property: "airport_pickup_enabled", type: "boolean", example: true),
        new OA\Property(property: "airport", type: "string", example: "LAX"),
        new OA\Property(property: "pickup_start_time", type: "string", format: "time", example: "09:00"),
        new OA\Property(property: "pickup_end_time", type: "string", format: "time", example: "22:00"),
        new OA\Property(property: "airport_pickup_price", type: "number", format: "float", example: 50.00),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time"),
    ]
)]
#[OA\Schema(
    schema: "HostBooking",
    type: "object",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "guest", type: "string", example: "John Doe"),
        new OA\Property(property: "property", type: "string", example: "Luxury Beachfront Villa"),
        new OA\Property(property: "propertyId", type: "integer", example: 1),
        new OA\Property(property: "checkin", type: "string", format: "date", example: "2025-01-15"),
        new OA\Property(property: "checkout", type: "string", format: "date", example: "2025-01-20"),
        new OA\Property(property: "status", type: "string", enum: ["Pending", "Confirmed", "Cancelled", "Completed"], example: "Confirmed"),
        new OA\Property(property: "amount", type: "string", example: "$1,495.00"),
        new OA\Property(property: "total_amount", type: "number", format: "float", example: 1495.00),
        new OA\Property(property: "email", type: "string", format: "email", example: "john.doe@example.com"),
        new OA\Property(property: "phone", type: "string", example: "+1 (555) 123-4567"),
        new OA\Property(property: "nights", type: "integer", example: 5),
        new OA\Property(property: "created_at", type: "string", format: "date-time"),
        new OA\Property(property: "updated_at", type: "string", format: "date-time"),
    ]
)]
abstract class Controller
{
    //
}
