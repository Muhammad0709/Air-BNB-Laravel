<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Enums\PropertyStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PropertyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Property::with('user');

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        $properties = $query->latest()->paginate(10);

        // Convert image paths to URLs
        $properties->getCollection()->each(function ($property) {
            if ($property->image) $property->image = Storage::url($property->image);
        });

        return Inertia::render('Admin/Properties/Index', [
            'properties' => $properties,
            'filters' => $request->only(['search']),
        ]);
    }


    /**
     * Display the specified resource.
     */
    public function show(Property $property)
    {
        $property->load('user');
        
        if ($property->image) {
            $property->image = Storage::url($property->image);
        }
        
        return Inertia::render('Admin/Properties/Show', [
            'property' => $property,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Property $property)
    {
        if ($property->image) {
            $property->image = Storage::url($property->image);
        }
        
        return Inertia::render('Admin/Properties/Edit', [
            'property' => $property,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Property $property)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'bedrooms' => ['required', 'integer', 'min:0'],
            'bathrooms' => ['required', 'integer', 'min:0'],
            'guests' => ['required', 'integer', 'min:1'],
            'property_type' => ['required', 'in:apartment,house,villa,studio,condo'],
            'status' => ['required', 'in:Active,Inactive'],
            'description' => ['nullable', 'string'],
            'amenities' => ['nullable', 'array'],
            'image' => ['nullable', 'sometimes', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
        ]);

        $validated['amenities'] = $validated['amenities'] ?? [];

        // Handle image
        if ($request->hasFile('image')) {
            if ($property->image) Storage::disk('public')->delete($property->image);
            $validated['image'] = $request->file('image')->store('properties', 'public');
        } else {
            $validated['image'] = $property->image;
        }

        $property->update($validated);

        return redirect()->route('admin.properties.index')
            ->with('success', 'Property updated successfully!');
    }

    /**
     * Approve a property.
     */
    public function approve(Property $property)
    {
        $property->update([
            'approval_status' => PropertyStatus::APPROVED->value
        ]);

        return redirect()->route('admin.properties.index')
            ->with('success', 'Property approved successfully!');
    }

    /**
     * Reject a property.
     */
    public function reject(Property $property)
    {
        $property->update([
            'approval_status' => PropertyStatus::REJECTED->value
        ]);

        return redirect()->route('admin.properties.index')
            ->with('success', 'Property rejected successfully!');
    }

}
