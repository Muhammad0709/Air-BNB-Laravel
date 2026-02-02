<?php

namespace App\Http\Controllers\Host;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Enums\PropertyType;
use App\Enums\PropertyStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PropertyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $host = Auth::user();
        
        $query = Property::where('user_id', $host->id);
        
        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }
        
        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }
        
        // Filter by approval status
        if ($request->filled('approval_status')) {
            $query->where('approval_status', $request->get('approval_status'));
        }
        
        $properties = $query->latest()->paginate(10)->withQueryString();
        
        $properties->getCollection()->each(function ($property) {
            if ($property->image) {
                $property->image = Storage::url($property->image);
            }
            if ($property->images && is_array($property->images)) {
                $property->images = array_map(fn ($p) => Storage::url($p), $property->images);
            }
        });
        
        return Inertia::render('Host/Properties/Index', [
            'properties' => $properties,
            'filters' => $request->only(['search', 'status', 'approval_status']),
            'statusOptions' => ['Active', 'Inactive'],
            'approvalStatusOptions' => array_column(PropertyStatus::cases(), 'value'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Host/Properties/Create', [
            'propertyTypes' => array_column(PropertyType::cases(), 'value'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $host = Auth::user();

        // Explicit 2MB max per image (backend validation)
        $maxBytes = 2 * 1024 * 1024; // 2MB
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                if ($file->getSize() > $maxBytes) {
                    throw ValidationException::withMessages([
                        "images.{$index}" => ['Each image must not be greater than 2MB.'],
                    ]);
                }
            }
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'property_type' => 'required|in:' . implode(',', array_column(PropertyType::cases(), 'value')),
            'bedrooms' => 'required|integer|min:1',
            'bathrooms' => 'required|integer|min:1',
            'guests' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'location' => 'required|string|max:255',
            'amenities' => 'nullable|array',
            'amenities.*' => 'string',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048', // 2048 KB = 2MB
        ], [
            'images.*.max' => 'Each image must not be greater than 2MB.',
            'images.*.mimes' => 'Each image must be a file of type: jpeg, png, jpg, gif.',
            'images.*.image' => 'Each file must be an image.',
        ]);

        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $imagePaths[] = $file->store('properties', 'public');
            }
        }
        $validated['images'] = $imagePaths;
        $validated['image'] = $imagePaths[0] ?? null;
        $validated['user_id'] = $host->id;
        $validated['status'] = 'Active';
        $validated['approval_status'] = PropertyStatus::PENDING->value;

        $property = Property::create($validated);
        
        return redirect()->route('host.properties.index')
            ->with('success', 'Property created successfully! It will be reviewed by admin.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Property $property)
    {
        // Ensure host can only view their own properties
        if ($property->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $property->image = $property->image ? Storage::url($property->image) : null;
        if ($property->images && is_array($property->images)) {
            $property->images = array_map(fn ($p) => Storage::url($p), $property->images);
        }
        return Inertia::render('Host/Properties/Show', [
            'property' => $property,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Property $property)
    {
        // Ensure host can only edit their own properties
        if ($property->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $property->image = $property->image ? Storage::url($property->image) : null;
        if ($property->images && is_array($property->images)) {
            $property->images = array_map(fn ($p) => Storage::url($p), $property->images);
        }
        return Inertia::render('Host/Properties/Edit', [
            'property' => $property,
            'propertyTypes' => array_column(PropertyType::cases(), 'value'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Property $property)
    {
        // Ensure host can only update their own properties
        if ($property->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        // Image rules: max 2048 KB = 2MB per file (backend validation)
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'property_type' => 'required|in:' . implode(',', array_column(PropertyType::cases(), 'value')),
            'bedrooms' => 'required|integer|min:1',
            'bathrooms' => 'required|integer|min:1',
            'guests' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0',
            'location' => 'required|string|max:255',
            'status' => 'required|in:Active,Inactive,Pending',
            'amenities' => 'nullable|array',
            'amenities.*' => 'string',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048', // 2048 KB = 2MB
        ], [
            'images.*.max' => 'Each image must not be greater than 2MB.',
            'images.*.mimes' => 'Each image must be a file of type: jpeg, png, jpg, gif.',
            'images.*.image' => 'Each file must be an image.',
        ]);

        $imagePaths = $property->images ?? [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $imagePaths[] = $file->store('properties', 'public');
            }
        }
        $validated['images'] = $imagePaths;
        $validated['image'] = $imagePaths[0] ?? null;
        $validated['approval_status'] = PropertyStatus::PENDING->value;

        $property->update($validated);
        
        return redirect()->route('host.properties.index')
            ->with('success', 'Property updated successfully! It will be reviewed by admin again.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Property $property)
    {
        // Ensure host can only delete their own properties
        if ($property->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        if ($property->image) {
            Storage::disk('public')->delete($property->image);
        }
        if ($property->images && is_array($property->images)) {
            foreach ($property->images as $path) {
                Storage::disk('public')->delete($path);
            }
        }
        $property->delete();
        
        return redirect()->route('host.properties.index')
            ->with('success', 'Property deleted successfully!');
    }
}
