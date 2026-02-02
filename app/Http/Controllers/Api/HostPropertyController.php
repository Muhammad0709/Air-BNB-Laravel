<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\HostPropertyRequest;
use App\Http\Resources\HostPropertyResource;
use App\Models\Property;
use App\Enums\PropertyStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

/**
 * @OA\Tag(
 *     name="Host Properties",
 *     description="API endpoints for host property management"
 * )
 */
class HostPropertyController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/host/properties",
     *     summary="Get host properties",
     *     description="Returns all properties for the authenticated host with filtering and pagination",
     *     tags={"Host Properties"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Search properties by title, location, or description",
     *         required=false,
     *         @OA\Schema(type="string", example="villa")
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter by status: Active, Inactive, Pending",
     *         required=false,
     *         @OA\Schema(type="string", enum={"Active", "Inactive", "Pending"})
     *     ),
     *     @OA\Parameter(
     *         name="approval_status",
     *         in="query",
     *         description="Filter by approval status",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Page number for pagination",
     *         required=false,
     *         @OA\Schema(type="integer", minimum=1, default=1)
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Items per page (max: 50)",
     *         required=false,
     *         @OA\Schema(type="integer", minimum=1, maximum=50, default=10)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Properties retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Properties retrieved successfully"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(
     *                     property="properties",
     *                     type="array",
     *                     @OA\Items(ref="#/components/schemas/HostProperty")
     *                 ),
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="last_page", type="integer", example=5),
     *                 @OA\Property(property="per_page", type="integer", example=10),
     *                 @OA\Property(property="total", type="integer", example=50)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Access denied - Host only",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Access denied. This resource is only available for Host accounts.")
     *         )
     *     )
     * )
     */
    public function index(HostPropertyRequest $request): JsonResponse
    {
        $host = Auth::user();
        $perPage = $request->input('per_page', 10);
        
        $query = Property::withCount('bookings')
            ->where('user_id', $host->id);
        
        // Search functionality
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }
        
        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }
        
        // Filter by approval status
        if ($request->filled('approval_status')) {
            $query->where('approval_status', $request->input('approval_status'));
        }
        
        $properties = $query->latest()->paginate($perPage);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Properties retrieved successfully',
            'data' => [
                'properties' => HostPropertyResource::collection($properties->items()),
                'current_page' => $properties->currentPage(),
                'last_page' => $properties->lastPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
                'from' => $properties->firstItem(),
                'to' => $properties->lastItem(),
            ],
        ], 200);
    }

    /**
     * @OA\Post(
     *     path="/api/host/properties",
     *     summary="Create a new property",
     *     description="Creates a new property for the authenticated host",
     *     tags={"Host Properties"},
     *     security={{"apiAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"title", "description", "property_type", "bedrooms", "bathrooms", "guests", "price", "location"},
     *                 @OA\Property(property="title", type="string", example="Luxury Beachfront Villa"),
     *                 @OA\Property(property="description", type="string", example="Beautiful villa with ocean view"),
     *                 @OA\Property(property="property_type", type="string", enum={"apartment", "house", "villa", "studio", "condo"}, example="villa"),
     *                 @OA\Property(property="bedrooms", type="integer", example=3),
     *                 @OA\Property(property="bathrooms", type="integer", example=2),
     *                 @OA\Property(property="guests", type="integer", example=6),
     *                 @OA\Property(property="price", type="number", format="float", example=299.00),
     *                 @OA\Property(property="location", type="string", example="Malibu, California"),
     *                 @OA\Property(property="status", type="string", enum={"Active", "Inactive"}, example="Active"),
     *                 @OA\Property(property="image", type="string", format="binary"),
     *                 @OA\Property(property="airport_pickup_enabled", type="boolean", example=true),
     *                 @OA\Property(property="airport", type="string", example="LAX"),
     *                 @OA\Property(property="pickup_start_time", type="string", format="time", example="09:00"),
     *                 @OA\Property(property="pickup_end_time", type="string", format="time", example="22:00"),
     *                 @OA\Property(property="airport_pickup_price", type="number", format="float", example=50.00)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Property created successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Property created successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/HostProperty")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function store(HostPropertyRequest $request): JsonResponse
    {
        $host = Auth::user();
        
        $validated = $request->validated();
        
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('properties', 'public');
        }
        
        $validated['user_id'] = $host->id;
        $validated['status'] = $validated['status'] ?? 'Active';
        $validated['approval_status'] = PropertyStatus::PENDING->value;
        $validated['airport_pickup_enabled'] = $validated['airport_pickup_enabled'] ?? false;
        
        $property = Property::create($validated);
        $property->loadCount('bookings');
        
        return response()->json([
            'status' => 'success',
            'message' => 'Property created successfully',
            'data' => new HostPropertyResource($property),
        ], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/host/properties/{id}",
     *     summary="Get a specific property",
     *     description="Returns details of a specific property owned by the authenticated host",
     *     tags={"Host Properties"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Property ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Property retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Property retrieved successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/HostProperty")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Access denied",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Access denied. This property does not belong to you.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Property not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Property not found")
     *         )
     *     )
     * )
     */
    public function show($id): JsonResponse
    {
        $host = Auth::user();
        
        $property = Property::withCount('bookings')
            ->where('id', $id)
            ->where('user_id', $host->id)
            ->first();
        
        if (!$property) {
            return response()->json([
                'status' => 'error',
                'message' => 'Property not found',
            ], 404);
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Property retrieved successfully',
            'data' => new HostPropertyResource($property),
        ], 200);
    }

    /**
     * @OA\Put(
     *     path="/api/host/properties/{id}",
     *     summary="Update a property",
     *     description="Updates an existing property owned by the authenticated host",
     *     tags={"Host Properties"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Property ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="title", type="string", example="Luxury Beachfront Villa"),
     *                 @OA\Property(property="description", type="string", example="Beautiful villa with ocean view"),
     *                 @OA\Property(property="property_type", type="string", enum={"apartment", "house", "villa", "studio", "condo"}),
     *                 @OA\Property(property="bedrooms", type="integer", example=3),
     *                 @OA\Property(property="bathrooms", type="integer", example=2),
     *                 @OA\Property(property="guests", type="integer", example=6),
     *                 @OA\Property(property="price", type="number", format="float", example=299.00),
     *                 @OA\Property(property="location", type="string", example="Malibu, California"),
     *                 @OA\Property(property="status", type="string", enum={"Active", "Inactive"}),
     *                 @OA\Property(property="image", type="string", format="binary"),
     *                 @OA\Property(property="airport_pickup_enabled", type="boolean", example=true),
     *                 @OA\Property(property="airport", type="string", example="LAX"),
     *                 @OA\Property(property="pickup_start_time", type="string", format="time", example="09:00"),
     *                 @OA\Property(property="pickup_end_time", type="string", format="time", example="22:00"),
     *                 @OA\Property(property="airport_pickup_price", type="number", format="float", example=50.00)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Property updated successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Property updated successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/HostProperty")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Access denied",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Access denied. This property does not belong to you.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Property not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Property not found")
     *         )
     *     )
     * )
     */
    public function update(HostPropertyRequest $request, $id): JsonResponse
    {
        $host = Auth::user();
        
        $property = Property::where('id', $id)
            ->where('user_id', $host->id)
            ->first();
        
        if (!$property) {
            return response()->json([
                'status' => 'error',
                'message' => 'Property not found',
            ], 404);
        }
        
        $validated = $request->validated();
        
        if ($request->hasFile('image')) {
            if ($property->image) {
                Storage::disk('public')->delete($property->image);
            }
            $validated['image'] = $request->file('image')->store('properties', 'public');
        }
        
        $validated['approval_status'] = PropertyStatus::PENDING->value;
        
        $property->update($validated);
        $property->loadCount('bookings');
        
        return response()->json([
            'status' => 'success',
            'message' => 'Property updated successfully',
            'data' => new HostPropertyResource($property),
        ], 200);
    }

    /**
     * @OA\Delete(
     *     path="/api/host/properties/{id}",
     *     summary="Delete a property",
     *     description="Deletes a property owned by the authenticated host",
     *     tags={"Host Properties"},
     *     security={{"apiAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         description="Property ID",
     *         required=true,
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Property deleted successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Property deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Access denied",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Access denied. This property does not belong to you.")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Property not found",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="error"),
     *             @OA\Property(property="message", type="string", example="Property not found")
     *         )
     *     )
     * )
     */
    public function destroy($id): JsonResponse
    {
        $host = Auth::user();
        
        $property = Property::where('id', $id)
            ->where('user_id', $host->id)
            ->first();
        
        if (!$property) {
            return response()->json([
                'status' => 'error',
                'message' => 'Property not found',
            ], 404);
        }
        
        // Delete image if exists
        if ($property->image) {
            Storage::disk('public')->delete($property->image);
        }
        
        $property->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Property deleted successfully',
        ], 200);
    }
}
