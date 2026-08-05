<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;

class ReviewController extends Controller
{
    /**
     * Remove the specified review.
     */
    public function destroy(Review $review)
    {
        $propertyId = $review->property_id;
        $review->delete();

        return redirect()->route('admin.properties.show', $propertyId)
            ->with('success', 'Review deleted successfully.');
    }
}
