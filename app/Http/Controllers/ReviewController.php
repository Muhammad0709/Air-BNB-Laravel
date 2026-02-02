<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Store a newly created review.
     */
    public function store(Request $request)
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return redirect()->back()->withErrors(['error' => 'Please login to submit a review.']);
        }

        $validator = Validator::make($request->all(), [
            'property_id' => 'required|exists:properties,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // Check if property exists and is approved
        $property = Property::where('id', $request->property_id)
            ->where('status', 'Active')
            ->where('approval_status', 'Approved')
            ->first();

        if (!$property) {
            return redirect()->back()->withErrors(['error' => 'Property not found or not available for reviews.']);
        }

        // Check if user already reviewed this property
        $existingReview = Review::where('property_id', $request->property_id)
            ->where('user_id', Auth::id())
            ->first();

        if ($existingReview) {
            // Update existing review
            $existingReview->update([
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]);

            return redirect()->back()->with('success', 'Review updated successfully!');
        }

        // Create new review
        Review::create([
            'property_id' => $request->property_id,
            'user_id' => Auth::id(),
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return redirect()->back()->with('success', 'Review submitted successfully!');
    }
}
