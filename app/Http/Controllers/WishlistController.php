<?php

namespace App\Http\Controllers;

use App\Models\Property;
use App\Enums\PropertyStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class WishlistController extends Controller
{
    public function index()
    {
        $properties = Property::with(['reviews', 'user'])
            ->where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->where('is_guest_favorite', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($property) {
                return [
                    'id' => $property->id,
                    'title' => $property->title,
                    'location' => $property->location,
                    'price' => (float) $property->price,
                    'image' => $property->image ? Storage::url($property->image) : '/images/filter-1.svg',
                    'rating' => $property->reviews->avg('rating') ? round($property->reviews->avg('rating'), 2) : null,
                    'reviews_count' => $property->reviews->count(),
                ];
            });

        return Inertia::render('Wishlist', [
            'properties' => $properties,
        ]);
    }

    public function add($id)
    {
        $property = Property::findOrFail($id);

        $property->update([
            'is_guest_favorite' => true,
        ]);

        return redirect()->back()->with('success', 'Property added to wishlist.');
    }

    public function remove(Request $request, $id)
    {
        $property = Property::findOrFail($id);

        $property->update([
            'is_guest_favorite' => false,
        ]);

        return redirect()->back()->with('success', 'Property removed from wishlist successfully.');
    }
}
