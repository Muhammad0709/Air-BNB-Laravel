<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Review;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Remove the specified review.
     */
    public function destroy(Review $review)
    {
        $propertyId = $review->property_id;
        $propertyTitle = $review->property?->title ?? "Property #{$propertyId}";
        $comment = $review->comment;

        $review->delete();

        AuditLog::record(Auth::user(), 'review_deleted', $propertyTitle, $comment);

        return redirect()->route('admin.properties.show', $propertyId)
            ->with('success', 'Review deleted successfully.');
    }
}
