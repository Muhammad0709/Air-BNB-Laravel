<?php

namespace App\Http\Controllers\Host;

use App\Http\Controllers\Controller;
use App\Http\Requests\Host\StoreBlockedDateRequest;
use App\Models\Property;
use App\Models\PropertyBlockedDate;
use Illuminate\Support\Facades\Auth;

class PropertyAvailabilityController extends Controller
{
    public function store(StoreBlockedDateRequest $request, Property $property)
    {
        if ($property->user_id !== Auth::id()) {
            abort(403, __('host.property.unauthorized'));
        }

        $property->blockedDates()->create($request->validated());

        return redirect()->route('host.properties.show', $property)
            ->with('success', __('host.availability.blocked_success'));
    }

    public function destroy(Property $property, PropertyBlockedDate $blockedDate)
    {
        if ($property->user_id !== Auth::id()) {
            abort(403, __('host.property.unauthorized'));
        }

        if ($blockedDate->property_id !== $property->id) {
            abort(404);
        }

        $blockedDate->delete();

        return redirect()->route('host.properties.show', $property)
            ->with('success', __('host.availability.unblocked_success'));
    }
}
