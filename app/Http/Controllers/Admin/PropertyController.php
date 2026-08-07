<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdatePropertyRequest;
use App\Models\AuditLog;
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
        $property->load(['user', 'reviews.user']);

        if ($property->image) {
            $property->image = Storage::url($property->image);
        }

        $property->setRelation('reviews', $property->reviews->map(function ($review) {
            return [
                'id' => $review->id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'created_at' => $review->created_at,
                'user' => $review->user ? ['name' => $review->user->name] : null,
            ];
        }));

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
    public function update(UpdatePropertyRequest $request, Property $property)
    {
        $validated = $request->validated();
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
            ->with('success', __('admin.properties.flash_updated'));
    }

    /**
     * Approve a property.
     */
    public function approve(Property $property)
    {
        $property->update([
            'approval_status' => PropertyStatus::APPROVED->value
        ]);

        AuditLog::record(Auth::user(), 'property_approved', $property->title);

        // Send notification to host
        $host = $property->user;
        if ($host) {
            event(new \App\Events\NotificationEvent(
                $property,
                'property_approved',
                ['host' => $host]
            ));
        }

        return redirect()->route('admin.properties.index')
            ->with('success', __('admin.properties.flash_approved'));
    }

    /**
     * Reject a property.
     */
    public function reject(Request $request, Property $property)
    {
        $rejectionReason = $request->input('rejection_reason', __('admin.properties.default_rejection_reason'));
        
        $property->update([
            'approval_status' => PropertyStatus::REJECTED->value
        ]);

        AuditLog::record(Auth::user(), 'property_rejected', $property->title, $rejectionReason);

        // Send notification to host
        $host = $property->user;
        if ($host) {
            event(new \App\Events\NotificationEvent(
                $property,
                'property_rejected',
                ['host' => $host],
                ['rejection_reason' => $rejectionReason]
            ));
        }

        return redirect()->route('admin.properties.index')
            ->with('success', __('admin.properties.flash_rejected'));
    }

}
